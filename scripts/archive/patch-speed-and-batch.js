const fs = require('fs');
const path = require('path');

// 1. SheetRepository.gs - Cache SpreadsheetApp.openById instance
const repoPath = path.join(__dirname, '..', 'backend', 'SheetRepository.gs');
let repoCode = fs.readFileSync(repoPath, 'utf8');

if (!repoCode.includes('getGasSpreadsheet_()')) {
  repoCode = repoCode.replace(
    '  loadFromGasSheet_(tableName) {',
    `  getGasSpreadsheet_() {
    if (!this._cachedSs && this.isGasRuntime && this.spreadsheetId) {
      this._cachedSs = SpreadsheetApp.openById(this.spreadsheetId);
    }
    return this._cachedSs;
  }

  loadFromGasSheet_(tableName) {`
  );
  repoCode = repoCode.replace(/const ss = SpreadsheetApp\.openById\(this\.spreadsheetId\);/g, 'const ss = this.getGasSpreadsheet_();');
  fs.writeFileSync(repoPath, repoCode, 'utf8');
  console.log('Patched SheetRepository.gs with cached SpreadsheetApp instance');
}

// 2. SubmissionService.gs - Add submitBatch
const subServPath = path.join(__dirname, '..', 'backend', 'SubmissionService.gs');
let subServCode = fs.readFileSync(subServPath, 'utf8');

if (!subServCode.includes('submitBatch(')) {
  const submitBatchFunc = `  /**
   * High-Performance Single-Roundtrip Batch Submission
   * Combines begin, file uploads and complete into a single atomic operation
   */
  submitBatch(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { worksheet_code, academic_year_id, grade, note, files } = payload || {};

    if (!worksheet_code || !academic_year_id || !grade || !files || !Array.isArray(files) || files.length === 0) {
      throw new Error("INVALID_REQUEST: ข้อมูลการส่งใบงานไม่ครบถ้วน");
    }

    const year = repository.findAcademicYear(academic_year_id);
    if (!year || year.state === "archived") {
      throw new Error("YEAR_ARCHIVED: ปีการศึกษานี้ถูกปิดรับการส่งงานแล้ว");
    }

    const opId = \`op_up_\${AuthService.generateSecureToken().substring(0, 16)}\`;
    const operation = {
      operation_id: opId,
      actor_uid: studentUid,
      action: "SUBMISSION_UPLOAD_BATCH",
      target_type: "Worksheet",
      target_id: worksheet_code,
      state: "completed",
      created_at: new Date().toISOString()
    };
    repository.saveOperation(operation);

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const normalizedMime = (f.mime_type || "image/jpeg").toLowerCase().trim();
      const evidenceId = \`ev_\${AuthService.generateSecureToken().substring(0, 16)}\`;
      const driveFileId = repository.saveFileToStaging({
        evidence_id: evidenceId,
        file_name: f.file_name || \`page_\${i + 1}.jpg\`,
        mime_type: normalizedMime,
        file_base64: f.file_base64,
        student_uid: studentUid
      });
      const stagedFile = {
        evidence_id: evidenceId,
        upload_op_id: opId,
        drive_file_id: driveFileId,
        mime_type: normalizedMime,
        size_bytes: Math.round(((f.file_base64 || "").length * 3) / 4),
        storage_state: "staged",
        uploaded_at: new Date().toISOString()
      };
      repository.saveStagedFile(stagedFile);
    }

    return this.completeSubmission(session, {
      upload_op_id: opId,
      worksheet_code,
      academic_year_id,
      grade,
      note
    }, repository);
  },

  /**
   * Begin upload transaction`;

  subServCode = subServCode.replace('  /**\n   * Begin upload transaction', submitBatchFunc);
  fs.writeFileSync(subServPath, subServCode, 'utf8');
  console.log('Patched SubmissionService.gs with submitBatch');
}

// 3. Entry.gs - Add submissions.submitBatch
const entryPath = path.join(__dirname, '..', 'backend', 'Entry.gs');
let entryCode = fs.readFileSync(entryPath, 'utf8');

if (!entryCode.includes('"submissions.submitBatch"')) {
  entryCode = entryCode.replace(
    '"submissions.uploadEvidence",',
    '"submissions.uploadEvidence",\n    "submissions.submitBatch",'
  );
  entryCode = entryCode.replace(
    '    if (action === "submissions.uploadEvidence") {',
    `    if (action === "submissions.submitBatch") {
      const res = SubmissionService.submitBatch(session, payload, repo);
      return { ok: true, data: res.data, request_id };
    }

    if (action === "submissions.uploadEvidence") {`
  );
  fs.writeFileSync(entryPath, entryCode, 'utf8');
  console.log('Patched Entry.gs with submissions.submitBatch');
}

// 4. mock-backend.js - Add submitBatch
const mockPath = path.join(__dirname, '..', 'js', 'mock-backend.js');
let mockCode = fs.readFileSync(mockPath, 'utf8');

if (!mockCode.includes('action === "submissions.submitBatch"')) {
  const mockBatchCode = `      // 2.0 Batch Upload (Single roundtrip high-performance upload)
      if (action === "submissions.submitBatch") {
        const studentUid = session.principal_uid;
        const { worksheet_code, academic_year_id, grade, note, files } = payload;
        
        const existingSub = memoryDB.submissions.find(s => 
          s.worksheet_code === worksheet_code && 
          s.student_uid === studentUid && 
          s.academic_year_id === academic_year_id &&
          s.grade === grade
        );

        const newVersionNo = existingSub ? (existingSub.latest_version_no + 1) : 1;
        const versionId = "subv_" + Math.random().toString(16).substring(2, 10);
        const subId = existingSub ? existingSub.submission_id : ("sub_" + Math.random().toString(16).substring(2, 10));
        const now = new Date().toISOString();

        if (existingSub) {
          existingSub.latest_version_id = versionId;
          existingSub.latest_version_no = newVersionNo;
          existingSub.latest_version_submitted_at = now;
          existingSub.state = "submitted";
          existingSub.updated_at = now;
        } else {
          memoryDB.submissions.push({
            submission_id: subId,
            academic_year_id,
            grade,
            worksheet_code,
            student_uid: studentUid,
            latest_version_id: versionId,
            latest_version_no: newVersionNo,
            latest_version_submitted_at: now,
            state: "submitted",
            out_of_roster: false,
            created_at: now
          });
        }

        memoryDB.submissionVersions.push({
          submission_version_id: versionId,
          submission_id: subId,
          version_no: newVersionNo,
          submitted_by_uid: studentUid,
          submitted_at: now,
          note: note || "",
          state_at_submit: "submitted",
          out_of_roster_at_submit: false
        });

        (files || []).forEach((f, idx) => {
          const evId = "ev_" + Math.random().toString(16).substring(2, 10);
          memoryDB.evidence.push({
            evidence_id: evId,
            submission_version_id: versionId,
            student_uid: studentUid,
            file_name: f.file_name || \`page_\${idx + 1}.jpg\`,
            file_base64: f.file_base64,
            mime_type: f.mime_type || "image/jpeg",
            status: "active",
            created_at: now
          });
        });

        return {
          ok: true,
          data: {
            submission_id: subId,
            version_no: newVersionNo,
            submitted_at: now
          }
        };
      }

      // 2. Upload Lifecycle`;

  mockCode = mockCode.replace('      // 2. Upload Lifecycle', mockBatchCode);
  fs.writeFileSync(mockPath, mockCode, 'utf8');
  console.log('Patched mock-backend.js with submitBatch');
}

// 5. Rebundle backend
require('./bundle-backend.js');
console.log('All backend patches and bundle completed successfully!');

