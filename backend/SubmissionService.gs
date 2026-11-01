/**
 * PhysicsHealthTech V2.0 - Submission Service
 * Upload lifecycle: begin -> uploadEvidence -> complete -> status
 * Threat Model: SECURITY_MODEL.md, AC06, AC07, AC08, GR12, GR15, DATA05, DATA06
 * 
 * Rules:
 * - Append-only immutable SubmissionVersions.
 * - Single logical Submission record per (assignment_id, student_uid).
 * - Multi-image submissions count as 1 worksheet submitted (GR12).
 * - Out-of-roster submissions are permitted but flagged (AC04, GR23).
 * - Short LockService guards version increment and file commitment.
 */

const SubmissionService = {
  /**
   * Begin upload transaction
   */
  beginUpload(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { worksheet_code, academic_year_id, grade, idempotency_key } = payload || {};

    if (!worksheet_code || !academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: ข้อมูลเริ่มต้นการส่งงานไม่ครบถ้วน");
    }

    // Check year/assignment status
    const year = repository.findAcademicYear(academic_year_id);
    if (!year || year.state === "archived") {
      throw new Error("YEAR_ARCHIVED: ปีการศึกษานี้ถูกปิดรับการส่งงานแล้ว");
    }

    const opId = `op_up_${AuthService.generateSecureToken().substring(0, 16)}`;
    const operation = {
      operation_id: opId,
      actor_uid: studentUid,
      action: "SUBMISSION_UPLOAD",
      target_type: "Worksheet",
      target_id: worksheet_code,
      idempotency_key_hash: idempotency_key ? AuthService.sha256(idempotency_key) : null,
      state: "pending",
      created_at: new Date().toISOString()
    };

    repository.saveOperation(operation);

    return {
      ok: true,
      data: {
        upload_op_id: opId,
        worksheet_code,
        max_file_size_bytes: AppConfig.MAX_FILE_SIZE_BYTES,
        allowed_mime_types: AppConfig.ALLOWED_MIME_TYPES,
        max_images: AppConfig.MAX_IMAGES_PER_SUBMISSION
      }
    };
  },

  /**
   * Upload individual evidence file (staged)
   */
  uploadEvidence(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { upload_op_id, file_name, mime_type, file_base64 } = payload || {};

    if (!upload_op_id || !file_base64) {
      throw new Error("INVALID_REQUEST: ข้อมูลไฟล์ที่อัปโหลดไม่สมบูรณ์");
    }

    const op = repository.findOperation(upload_op_id);
    if (!op || op.actor_uid !== studentUid) {
      throw new Error("ACCESS_DENIED: รายการอัปโหลดนี้ไม่ถูกต้องหรือหมดอายุ");
    }

    // MIME type validation (SEC08)
    const normalizedMime = (mime_type || "").toLowerCase().trim();
    if (!AppConfig.ALLOWED_MIME_TYPES.includes(normalizedMime)) {
      throw new Error(`UNSUPPORTED_MEDIA_TYPE: รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG, WEBP เท่านั้น (ได้รับ: ${normalizedMime})`);
    }

    // File size validation
    const estimatedSizeBytes = Math.round((file_base64.length * 3) / 4);
    if (estimatedSizeBytes > AppConfig.MAX_FILE_SIZE_BYTES) {
      throw new Error(`FILE_TOO_LARGE: ขนาดไฟล์เกินกำหนด (สูงสุด 2 MiB, ปัจจุบันประมาณ ${(estimatedSizeBytes / (1024 * 1024)).toFixed(1)} MiB)`);
    }

    const evidenceId = `ev_${AuthService.generateSecureToken().substring(0, 16)}`;
    
    // Save file to Drive (or staging repository)
    const driveFileId = repository.saveFileToStaging({
      evidence_id: evidenceId,
      file_name: file_name || "evidence.jpg",
      mime_type: normalizedMime,
      file_base64,
      student_uid: studentUid
    });

    const stagedFile = {
      evidence_id: evidenceId,
      upload_op_id,
      drive_file_id: driveFileId,
      mime_type: normalizedMime,
      size_bytes: estimatedSizeBytes,
      storage_state: "staged",
      uploaded_at: new Date().toISOString()
    };

    repository.saveStagedFile(stagedFile);

    return {
      ok: true,
      data: {
        evidence_id: evidenceId,
        file_name,
        size_bytes: estimatedSizeBytes,
        mime_type: normalizedMime,
        state: "staged"
      }
    };
  },

  /**
   * Complete submission and commit new version
   */
  completeSubmission(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { upload_op_id, worksheet_code, academic_year_id, grade, note, evidence_ids } = payload || {};

    if (!upload_op_id || !worksheet_code || !academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: ข้อมูลการยืนยันการส่งงานไม่ครบถ้วน");
    }

    const op = repository.findOperation(upload_op_id);
    if (!op || op.actor_uid !== studentUid) {
      throw new Error("ACCESS_DENIED: รายการอัปโหลดนี้ไม่ถูกต้อง");
    }

    // Verify staged files
    const stagedFiles = repository.findStagedFilesByOpId(upload_op_id);
    if (stagedFiles.length === 0 && (!evidence_ids || evidence_ids.length === 0)) {
      throw new Error("NO_FILES_UPLOADED: ไม่พบไฟล์หลักฐานที่อัปโหลด");
    }

    // Check out-of-roster status
    const { is_out_of_roster } = Authorization.checkOutOfRoster(studentUid, academic_year_id, grade, repository);

    // Lock section for safe atomic version increment (AC08, DATA05, DATA06)
    let lockAcquired = false;
    try {
      if (typeof LockService !== "undefined" && LockService.getScriptLock) {
        const lock = LockService.getScriptLock();
        lockAcquired = lock.tryLock(10000); // 10s wait
      }

      // Find or create logical Submission record
      let submission = repository.findSubmissionByWorksheetAndStudent(worksheet_code, studentUid, academic_year_id, grade);
      const now = new Date().toISOString();
      const newVersionNo = submission ? (submission.latest_version_no + 1) : 1;
      const versionId = `subv_${AuthService.generateSecureToken().substring(0, 16)}`;

      if (!submission) {
        submission = {
          submission_id: `sub_${AuthService.generateSecureToken().substring(0, 16)}`,
          academic_year_id,
          grade,
          worksheet_code,
          student_uid: studentUid,
          latest_version_id: versionId,
          latest_version_no: newVersionNo,
          latest_version_submitted_at: now,
          state: "submitted",
          out_of_roster: is_out_of_roster,
          created_at: now,
          deleted_at: null
        };
      } else {
        submission.latest_version_id = versionId;
        submission.latest_version_no = newVersionNo;
        submission.latest_version_submitted_at = now;
        submission.state = "submitted"; // Reset to submitted upon resubmission (GR15)
        submission.out_of_roster = is_out_of_roster;
        submission.updated_at = now;
      }

      repository.saveSubmission(submission);

      // Create immutable SubmissionVersions record
      const versionRecord = {
        submission_version_id: versionId,
        submission_id: submission.submission_id,
        version_no: newVersionNo,
        submitted_by_uid: studentUid,
        submitted_at: now,
        note: note || "",
        state_at_submit: "submitted",
        out_of_roster_at_submit: is_out_of_roster,
        operation_id: upload_op_id,
        deleted_at: null
      };

      repository.saveSubmissionVersion(versionRecord);

      // Commit staged files to this version
      const activeEvidenceIds = [];
      stagedFiles.forEach(file => {
        file.submission_version_id = versionId;
        file.storage_state = "committed";
        repository.updateStagedFile(file);
        activeEvidenceIds.push(file.evidence_id);
      });

      // Update operation state
      op.state = "committed";
      repository.updateOperation(op);

      // Audit log
      repository.recordAuditLog({
        audit_id: `aud_${AuthService.generateSecureToken().substring(0, 12)}`,
        actor_type: "student",
        actor_uid: studentUid,
        action: "SUBMISSION_COMMITTED",
        object_type: "SubmissionVersion",
        object_id: versionId,
        outcome: "SUCCESS",
        change_summary: `Worksheet: ${worksheet_code}, Version: ${newVersionNo}, Files: ${activeEvidenceIds.length}, OutOfRoster: ${is_out_of_roster}`
      });

      return {
        ok: true,
        data: {
          submission_id: submission.submission_id,
          submission_version_id: versionId,
          version_no: newVersionNo,
          worksheet_code,
          submitted_at: now,
          files_count: activeEvidenceIds.length,
          out_of_roster: is_out_of_roster,
          main_status: "submitted",
          status_label_th: "ส่งแล้ว — รอตรวจ",
          message_th: "บันทึกการส่งใบงานเรียบร้อยแล้ว"
        }
      };

    } finally {
      if (lockAcquired && typeof LockService !== "undefined") {
        try { LockService.getScriptLock().releaseLock(); } catch (e) {}
      }
    }
  },

  /**
   * Get student's submission history for a worksheet
   */
  getSubmissionHistory(session, payload, repository) {
    let studentUid = null;
    if (session && (session.principal_type === "teacher" || session.role === "teacher" || session.role === "admin")) {
      studentUid = (payload && payload.student_uid) ? payload.student_uid : null;
      if (!studentUid) {
        throw new Error("INVALID_REQUEST: โปรดระบุ student_uid");
      }
    } else {
      studentUid = Authorization.enforceStudent(session);
    }
    const { worksheet_code, academic_year_id, grade } = payload || {};

    const submission = repository.findSubmissionByWorksheetAndStudent(worksheet_code, studentUid, academic_year_id, grade);
    if (!submission) {
      return { ok: true, data: { worksheet_code, versions: [] } };
    }

    const versions = repository.findSubmissionVersions(submission.submission_id) || [];
    versions.sort((a, b) => (Number(b.version_no) || 0) - (Number(a.version_no) || 0));

    const versionItems = versions.map(v => {
      const files = repository.findFilesForVersion(v.submission_version_id) || [];
      const review = repository.findEvidenceReviewForVersion(v.submission_version_id);
      return {
        submission_version_id: v.submission_version_id,
        version_no: v.version_no,
        submitted_at: v.submitted_at,
        note: v.note,
        state_at_submit: v.state_at_submit,
        files: files.map(f => ({
          evidence_id: f.evidence_id,
          file_name: f.file_name,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes
        })),
        review: review ? {
          decision_state: review.decision_state,
          feedback: review.feedback,
          reviewed_at: review.reviewed_at
        } : null
      };
    });

    return {
      ok: true,
      data: {
        submission_id: submission.submission_id,
        worksheet_code,
        latest_version_no: submission.latest_version_no,
        versions: versionItems
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SubmissionService;
}

