/**
 * PhysicsHealthTech V2.0 - Sheet Repository & Data Access
 * Google Sheets abstraction with in-memory fallback for testing
 * 
 * Rules:
 * - Tab headers on row 1 are authoritative; never use hardcoded column indices.
 * - Leading formula injection sigils (=, +, -, @) are escaped on write.
 * - Soft delete support via deleted_at timestamp.
 * - In-memory adapter mode enables 100% test coverage outside Google Apps Script runtime.
 */

class SheetRepository {
  constructor(options = {}) {
    this.isGasRuntime = typeof SpreadsheetApp !== "undefined" && typeof SpreadsheetApp.openById === "function";
    this.memoryStore = new Map();
    this.spreadsheetId = options.spreadsheetId || (typeof AppConfig !== "undefined" ? AppConfig.getSpreadsheetId() : "");
  }

  /**
   * Escape spreadsheet formula injection
   */
  escapeFormula(val) {
    if (typeof val !== "string") return val;
    if (/^[=\+\-@]/.test(val)) {
      return "'" + val;
    }
    return val;
  }

  /**
   * Unescape spreadsheet formula for reading
   */
  unescapeFormula(val) {
    if (typeof val === "string" && val.startsWith("'") && /^[=\+\-@]/.test(val.substring(1))) {
      return val.substring(1);
    }
    return val;
  }

  // --- In-Memory Store Helpers (for Node.js Test Harness) ---
  initMemoryTable(tableName, items = []) {
    this.memoryStore.set(tableName, [...items]);
  }

  getGasSpreadsheet_() {
    if (!this._cachedSs && this.isGasRuntime && this.spreadsheetId) {
      this._cachedSs = SpreadsheetApp.openById(this.spreadsheetId);
    }
    return this._cachedSs;
  }

  loadFromGasSheet_(tableName) {
    if (!this.isGasRuntime || !this.spreadsheetId) return [];
    try {
      const ss = this.getGasSpreadsheet_();
      const sheet = ss.getSheetByName(tableName);
      if (!sheet) return [];
      const data = sheet.getDataRange().getValues();
      if (!data || data.length < 2) return [];
      const headers = data[0];
      const rows = [];
      for (let r = 1; r < data.length; r++) {
        const rowData = data[r];
        if (!rowData || rowData.every(c => c === "" || c === null || c === undefined)) continue;
        const rowObj = {};
        for (let c = 0; c < headers.length; c++) {
          const key = headers[c];
          if (key) {
            let val = rowData[c];
            if (typeof val === "string") val = this.unescapeFormula(val);
            rowObj[key] = val;
          }
        }
        rowObj._rowNumber = r + 1;
        rows.push(rowObj);
      }
      return rows;
    } catch (e) {
      if (typeof Logger !== "undefined") Logger.log("Error loading sheet " + tableName + ": " + e.message);
      return [];
    }
  }

  appendGasRow_(tableName, rowObj) {
    if (!this.isGasRuntime || !this.spreadsheetId) return;
    try {
      const ss = this.getGasSpreadsheet_();
      const sheet = ss.getSheetByName(tableName);
      if (!sheet) return;
      let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
      const missingKeys = Object.keys(rowObj).filter(k => !k.startsWith("_") && !headers.includes(k));
      if (missingKeys.length > 0) {
        const startCol = headers.length + 1;
        sheet.getRange(1, startCol, 1, missingKeys.length).setValues([missingKeys]);
        sheet.getRange(1, startCol, 1, missingKeys.length).setFontWeight("bold").setBackground("#eef3f9");
        headers = headers.concat(missingKeys);
      }
      const rowValues = headers.map(h => {
        let val = rowObj[h];
        if (val === undefined || val === null) val = "";
        return this.escapeFormula(val);
      });
      sheet.appendRow(rowValues);
      rowObj._rowNumber = sheet.getLastRow();
    } catch (e) {
      if (typeof Logger !== "undefined") Logger.log("Error appending to " + tableName + ": " + e.message);
    }
  }

  updateGasRow_(tableName, rowObj, rowNumber = null) {
    if (!this.isGasRuntime || !this.spreadsheetId) return;
    try {
      const ss = this.getGasSpreadsheet_();
      const sheet = ss.getSheetByName(tableName);
      if (!sheet) return;
      const targetRow = rowNumber || rowObj._rowNumber;
      if (!targetRow || targetRow < 2) {
        this.appendGasRow_(tableName, rowObj);
        return;
      }
      let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
      const missingKeys = Object.keys(rowObj).filter(k => !k.startsWith("_") && !headers.includes(k));
      if (missingKeys.length > 0) {
        const startCol = headers.length + 1;
        sheet.getRange(1, startCol, 1, missingKeys.length).setValues([missingKeys]);
        sheet.getRange(1, startCol, 1, missingKeys.length).setFontWeight("bold").setBackground("#eef3f9");
        headers = headers.concat(missingKeys);
      }
      const rowValues = headers.map(h => {
        let val = rowObj[h];
        if (val === undefined || val === null) val = "";
        return this.escapeFormula(val);
      });
      sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
    } catch (e) {
      if (typeof Logger !== "undefined") Logger.log("Error updating row in " + tableName + ": " + e.message);
    }
  }

  deleteGasRow_(tableName, rowNumber) {
    if (!this.isGasRuntime || !this.spreadsheetId || !rowNumber) return;
    try {
      const ss = this.getGasSpreadsheet_();
      const sheet = ss.getSheetByName(tableName);
      if (!sheet) return;
      sheet.deleteRow(rowNumber);
    } catch (e) {
      if (typeof Logger !== "undefined") Logger.log("Error deleting row in " + tableName + ": " + e.message);
    }
  }

  getTable(tableName) {
    if (!this.memoryStore.has(tableName)) {
      if (this.isGasRuntime) {
        this.memoryStore.set(tableName, this.loadFromGasSheet_(tableName));
      } else {
        this.memoryStore.set(tableName, []);
      }
    }
    return this.memoryStore.get(tableName);
  }

  appendRowToTable(tableName, obj) {
    const table = this.getTable(tableName);
    table.push(obj);
    if (this.isGasRuntime) {
      this.appendGasRow_(tableName, obj);
    }
  }

  upsertRowInTable(tableName, predicate, obj) {
    const table = this.getTable(tableName);
    const idx = table.findIndex(predicate);
    if (idx >= 0) {
      const existing = table[idx];
      table[idx] = { ...existing, ...obj };
      if (this.isGasRuntime) {
        this.updateGasRow_(tableName, table[idx], existing._rowNumber);
      }
    } else {
      table.push(obj);
      if (this.isGasRuntime) {
        this.appendGasRow_(tableName, obj);
      }
    }
  }

  // --- Universal Repository Methods ---

  findStudentByCode(code5Digit) {
    const table = this.getTable("Students");
    return table.find(s => String(s.code_5_digit).padStart(5, "0") === String(code5Digit).padStart(5, "0") && !s.deleted_at);
  }

  findStudentByUid(studentUid) {
    const table = this.getTable("Students");
    return table.find(s => s.student_uid === studentUid && !s.deleted_at);
  }

  saveStudent(student) {
    this.upsertRowInTable("Students", s => s.student_uid === student.student_uid, student);
  }

  saveEnrollment(enrollment) {
    this.upsertRowInTable("Enrollments", e => e.enrollment_id === enrollment.enrollment_id, enrollment);
  }

  findStudentCredential(studentUid) {
    const table = this.getTable("StudentCredentials");
    return table.find(c => c.student_uid === studentUid && !c.revoked_at);
  }

  findTeacherByAuthSecret(secret) {
    const table = this.getTable("Teachers");
    return table.find(t => t.auth_secret === secret && t.status === "active");
  }

  findTeacherByGoogleSub(googleSub) {
    const table = this.getTable("Teachers");
    return table.find(t => t.google_sub === googleSub && t.status === "active");
  }

  findTeacherByEmail(email) {
    const table = this.getTable("Teachers");
    return table.find(t => t.email_for_display === email && t.status === "active");
  }

  recordLoginAttempt(attempt) {
    this.appendRowToTable("LoginAttempts", { ...attempt });
  }

  findLoginAttempts(accountKeyHash) {
    const table = this.getTable("LoginAttempts");
    return table.filter(a => a.account_key_hash === accountKeyHash);
  }

  saveSession(session) {
    this.appendRowToTable("Sessions", { ...session });
  }

  findSessionByTokenHash(tokenHash) {
    const table = this.getTable("Sessions");
    return table.find(s => s.token_hash === tokenHash);
  }

  updateSession(session) {
    this.upsertRowInTable("Sessions", s => s.session_id === session.session_id, session);
  }

  findActiveEnrollment(studentUid, academicYearId, grade) {
    const table = this.getTable("Enrollments");
    return table.find(e => 
      e.student_uid === studentUid &&
      e.academic_year_id === academicYearId &&
      e.grade === grade &&
      e.status === "active"
    );
  }

  findEnrollments(academicYearId, grade, room) {
    const table = this.getTable("Enrollments") || [];
    return table.filter(e => {
      const matchYear = e.academic_year_id === academicYearId;
      const matchGrade = e.grade === grade;
      const matchRoom = (!room || room === "all") ? true : (String(e.room) === String(room));
      return matchYear && matchGrade && matchRoom && e.status === "active";
    });
  }

  findAcademicYear(yearId) {
    const table = this.getTable("AcademicYears");
    return table.find(y => y.academic_year_id === yearId);
  }

  findAcademicYearByBe(yearBe) {
    const table = this.getTable("AcademicYears");
    return table.find(y => Number(y.year_be) === Number(yearBe));
  }

  listAcademicYears() {
    return this.getTable("AcademicYears");
  }

  saveAcademicYear(year) {
    this.appendRowToTable("AcademicYears", { ...year });
  }

  updateAcademicYear(year) {
    this.upsertRowInTable("AcademicYears", y => y.academic_year_id === year.academic_year_id, year);
  }

  saveGradeWorkspace(ws) {
    this.appendRowToTable("GradeWorkspaces", { ...ws });
  }

  saveAssignment(asg) {
    this.appendRowToTable("Assignments", { ...asg });
  }

  getYearBe(academicYearId) {
    const year = this.findAcademicYear(academicYearId);
    return year ? year.year_be : 2570;
  }

  findPublishedSyllabus(academicYearId, grade) {
    const table = this.getTable("SyllabusVersions") || [];
    const syl = table.find(s => s.academic_year_id === academicYearId && s.grade === grade && s.state === "published");
    if (!syl) return null;

    const tasksTable = this.getTable("TaskDefinitions") || [];
    const tasks = (syl.tasks && syl.tasks.length > 0)
      ? syl.tasks
      : tasksTable.filter(t => t.syllabus_version_id === syl.syllabus_version_id);
    tasks.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

    const linksTable = this.getTable("WorksheetTaskLinks") || [];
    const links = (syl.links && syl.links.length > 0)
      ? syl.links
      : linksTable.filter(l => l.syllabus_version_id === syl.syllabus_version_id);
    links.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    let worksheets = syl.worksheets;
    if (!worksheets || worksheets.length === 0) {
      const assignmentsTable = this.getTable("Assignments") || [];
      const asgForGrade = assignmentsTable.filter(a => a.academic_year_id === syl.academic_year_id && a.grade === syl.grade);

      const wsMap = new Map();
      links.forEach(l => {
        if (!wsMap.has(l.worksheet_code)) {
          const asg = asgForGrade.find(a => a.worksheet_code === l.worksheet_code);
          const order = asg ? asg.order_no : (parseInt(String(l.worksheet_code).replace(/\D/g, ""), 10) || 1);
          wsMap.set(l.worksheet_code, {
            code: l.worksheet_code,
            worksheet_code: l.worksheet_code,
            title: asg ? asg.title : `ใบงานที่ ${order}`,
            order_no: order,
            session_start: asg ? asg.session_start : Math.max(1, (order * 2) - 1),
            session_end: asg ? asg.session_end : Math.min(20, order * 2),
            due_at: asg ? asg.due_at : null,
            task_codes: [l.task_code]
          });
        } else {
          wsMap.get(l.worksheet_code).task_codes.push(l.task_code);
        }
      });
      worksheets = Array.from(wsMap.values());
    }

    return {
      ...syl,
      tasks,
      links,
      worksheets
    };
  }

  savePublishedSyllabus(syllabus) {
    this.appendRowToTable("SyllabusVersions", { ...syllabus });
  }

  findTaskByCode(syllabusVersionId, taskCode) {
    const tasksTable = this.getTable("TaskDefinitions") || [];
    const fromTasks = tasksTable.find(t => t.syllabus_version_id === syllabusVersionId && t.task_code === taskCode);
    if (fromTasks) return fromTasks;

    const syllabus = (this.getTable("SyllabusVersions") || []).find(s => s.syllabus_version_id === syllabusVersionId);
    if (!syllabus || !syllabus.tasks) return null;
    return syllabus.tasks.find(t => t.task_code === taskCode);
  }

  findPublishedGradesForStudent(studentUid, syllabusVersionId) {
    const table = this.getTable("GradeEntries");
    return table.filter(g => g.student_uid === studentUid && g.syllabus_version_id === syllabusVersionId && g.state === "published");
  }

  findDraftGradesForStudent(studentUid, syllabusVersionId) {
    const table = this.getTable("GradeDrafts");
    return table.filter(g => g.student_uid === studentUid && g.syllabus_version_id === syllabusVersionId);
  }

  findGradeEntry(studentUid, syllabusVersionId, taskCode) {
    const table = this.getTable("GradeEntries");
    return table.find(g => g.student_uid === studentUid && g.syllabus_version_id === syllabusVersionId && g.task_code === taskCode);
  }

  saveGradeDraft(draft) {
    this.upsertRowInTable("GradeDrafts", d => d.student_uid === draft.student_uid && d.syllabus_version_id === draft.syllabus_version_id && d.task_code === draft.task_code, draft);
  }

  deleteGradeDraft(studentUid, syllabusVersionId, taskCode) {
    const table = this.getTable("GradeDrafts");
    const idx = table.findIndex(d => d.student_uid === studentUid && d.syllabus_version_id === syllabusVersionId && d.task_code === taskCode);
    if (idx >= 0) {
      const rowNum = table[idx]._rowNumber;
      table.splice(idx, 1);
      if (this.isGasRuntime && rowNum) {
        this.deleteGasRow_("GradeDrafts", rowNum);
      }
    }
  }

  saveGradeEntry(entry) {
    this.upsertRowInTable("GradeEntries", e => e.student_uid === entry.student_uid && e.syllabus_version_id === entry.syllabus_version_id && e.task_code === entry.task_code, entry);
  }

  saveGradeRevision(revision) {
    this.appendRowToTable("GradeRevisions", { ...revision });
  }

  findGradeHistoryForStudent(studentUid, taskCode, syllabusVersionId) {
    const table = this.getTable("GradeRevisions");
    return table.filter(r => r.student_uid === studentUid && r.task_code === taskCode && r.syllabus_version_id === syllabusVersionId)
      .slice().reverse(); // Append-only ledger: latest revision is at the end
  }

  findApprovedBonusesForStudent(studentUid, syllabusVersionId) {
    const table = this.getTable("BonusAwards");
    return table.filter(b => b.student_uid === studentUid && b.syllabus_version_id === syllabusVersionId && b.state === "approved");
  }

  findBonus(studentUid, syllabusVersionId, worksheetCode) {
    const table = this.getTable("BonusAwards");
    return table.find(b => b.student_uid === studentUid && b.syllabus_version_id === syllabusVersionId && b.source_worksheet_code === worksheetCode);
  }

  saveBonusAward(bonus) {
    this.appendRowToTable("BonusAwards", { ...bonus });
  }

  findSubmissionsForStudent(studentUid, academicYearId, grade) {
    const table = this.getTable("Submissions");
    return table.filter(s => s.student_uid === studentUid && s.academic_year_id === academicYearId && s.grade === grade && !s.deleted_at);
  }

  findSubmissionById(submissionId) {
    const table = this.getTable("Submissions");
    return table.find(s => s.submission_id === submissionId && !s.deleted_at);
  }

  findSubmissionByWorksheetAndStudent(worksheetCode, studentUid, academicYearId, grade) {
    const table = this.getTable("Submissions");
    return table.find(s => 
      s.student_uid === studentUid &&
      s.worksheet_code === worksheetCode &&
      s.academic_year_id === academicYearId &&
      s.grade === grade &&
      !s.deleted_at
    );
  }

  saveSubmission(submission) {
    this.upsertRowInTable("Submissions", s => s.submission_id === submission.submission_id, submission);
  }

  findSubmissionVersions(submissionId) {
    const table = this.getTable("SubmissionVersions");
    return table.filter(v => v.submission_id === submissionId && !v.deleted_at)
      .sort((a, b) => a.version_no - b.version_no);
  }

  findSubmissionVersionById(versionId) {
    const table = this.getTable("SubmissionVersions");
    return table.find(v => v.submission_version_id === versionId && !v.deleted_at);
  }

  saveSubmissionVersion(version) {
    this.appendRowToTable("SubmissionVersions", { ...version });
  }

  findLatestEvidenceReview(submissionId) {
    const table = this.getTable("EvidenceReviews");
    const reviews = table.filter(r => r.submission_id === submissionId)
      .sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at));
    return reviews.length > 0 ? reviews[0] : null;
  }

  findEvidenceReviewForVersion(versionId) {
    const table = this.getTable("EvidenceReviews");
    return table.find(r => r.reviewed_version_id === versionId);
  }

  saveEvidenceReview(review) {
    this.appendRowToTable("EvidenceReviews", { ...review });
  }

  findOutOfRosterSubmissions(academicYearId, grade) {
    const table = this.getTable("Submissions");
    return table.filter(s => s.academic_year_id === academicYearId && s.grade === grade && s.out_of_roster && !s.deleted_at);
  }

  saveOperation(op) {
    this.appendRowToTable("Operations", { ...op });
  }

  findOperation(opId) {
    const table = this.getTable("Operations");
    return table.find(o => o.operation_id === opId);
  }

  updateOperation(op) {
    this.upsertRowInTable("Operations", o => o.operation_id === op.operation_id, op);
  }

  saveStagedFile(file) {
    this.appendRowToTable("SubmissionFiles", { ...file });
  }

  findStagedFilesByOpId(opId) {
    const table = this.getTable("SubmissionFiles");
    return table.filter(f => f.upload_op_id === opId && !f.deleted_at);
  }

  updateStagedFile(file) {
    this.upsertRowInTable("SubmissionFiles", f => f.evidence_id === file.evidence_id, file);
  }

  findFileByEvidenceId(evidenceId) {
    const table = this.getTable("SubmissionFiles");
    return table.find(f => f.evidence_id === evidenceId && !f.deleted_at);
  }

  findFilesForVersion(versionId) {
    const table = this.getTable("SubmissionFiles");
    return table.filter(f => f.submission_version_id === versionId && !f.deleted_at);
  }

  saveFileToStaging(fileData) {
    if (this.isGasRuntime && typeof DriveApp !== "undefined") {
      try {
        const folderId = (typeof AppConfig !== "undefined") ? AppConfig.getDriveRootFolderId() : "";
        const folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
        const rawBase64 = (fileData.file_base64 || "").replace(/^data:image\/\w+;base64,/, "");
        const decoded = Utilities.base64Decode(rawBase64);
        const blob = Utilities.newBlob(decoded, fileData.mime_type || "image/jpeg", fileData.file_name || "evidence.jpg");
        const file = folder.createFile(blob);
        return file.getId();
      } catch (err) {
        if (typeof Logger !== "undefined") Logger.log("Drive upload error: " + err.message);
        throw new Error("DRIVE_UPLOAD_FAILED: ไม่สามารถบันทึกไฟล์ภาพลงใน Google Drive ได้ (" + err.message + ")");
      }
    }
    if (!this.fileStorage) this.fileStorage = new Map();
    const driveFileId = `drv_${AuthService.generateSecureToken().substring(0, 16)}`;
    this.fileStorage.set(driveFileId, fileData.file_base64);
    return driveFileId;
  }

  readDriveFileAsBase64(driveFileId) {
    if (this.isGasRuntime && typeof DriveApp !== "undefined" && driveFileId && !driveFileId.startsWith("drv_")) {
      try {
        const file = DriveApp.getFileById(driveFileId);
        const bytes = file.getBlob().getBytes();
        return Utilities.base64Encode(bytes);
      } catch (err) {
        if (typeof Logger !== "undefined") Logger.log("Drive read error: " + err.message);
        throw new Error("DRIVE_READ_FAILED: ไม่สามารถเปิดไฟล์ภาพจาก Google Drive ได้ (" + err.message + ")");
      }
    }
    if (!this.fileStorage) this.fileStorage = new Map();
    return this.fileStorage.get(driveFileId) || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  }

  /**
   * Save student profile photo to Google Drive
   * - In GAS runtime: Creates file inside 'ProfilePhotos' subfolder in Drive Root
   * - Sets sharing to ANYONE_WITH_LINK VIEW for web display
   * - Generates direct display URL (lh3.googleusercontent.com/d/{fileId})
   * - Trashes old profile photo if replaced
   * - Linked to Student Code & UID
   */
  saveProfilePhotoToDrive(studentCode, studentUid, fileData) {
    if (this.isGasRuntime && typeof DriveApp !== "undefined") {
      try {
        const rootFolderId = (typeof AppConfig !== "undefined") ? AppConfig.getDriveRootFolderId() : "";
        const rootFolder = rootFolderId ? DriveApp.getFolderById(rootFolderId) : DriveApp.getRootFolder();
        
        let targetFolder = rootFolder;
        try {
          const subfolders = rootFolder.getFoldersByName("ProfilePhotos");
          if (subfolders.hasNext()) {
            targetFolder = subfolders.next();
          } else {
            targetFolder = rootFolder.createFolder("ProfilePhotos");
          }
        } catch (fErr) {
          targetFolder = rootFolder;
        }

        const rawBase64 = (fileData.file_base64 || "").replace(/^data:image\/\w+;base64,/, "");
        const decoded = Utilities.base64Decode(rawBase64);
        const mimeType = fileData.mime_type || "image/jpeg";
        const extension = mimeType === "image/png" ? ".png" : (mimeType === "image/webp" ? ".webp" : ".jpg");
        const fileName = "profile_" + studentCode + "_" + studentUid + extension;
        const blob = Utilities.newBlob(decoded, mimeType, fileName);

        if (fileData.old_file_id && !fileData.old_file_id.startsWith("drv_")) {
          try {
            DriveApp.getFileById(fileData.old_file_id).setTrashed(true);
          } catch (e) {}
        }

        const driveFile = targetFolder.createFile(blob);
        try {
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (sErr) {
          if (typeof Logger !== "undefined") Logger.log("Notice: Set sharing: " + sErr.message);
        }

        const fileId = driveFile.getId();
        const photoUrl = "https://lh3.googleusercontent.com/d/" + fileId;
        return {
          drive_file_id: fileId,
          photo_url: photoUrl
        };
      } catch (err) {
        if (typeof Logger !== "undefined") Logger.log("Drive profile upload error: " + err.message);
        throw new Error("DRIVE_UPLOAD_FAILED: ไม่สามารถบันทึกภาพโปรไฟล์ลงใน Google Drive ได้ (" + err.message + ")");
      }
    }

    if (!this.fileStorage) this.fileStorage = new Map();
    const driveFileId = "drv_profile_" + studentCode + "_" + (typeof AuthService !== "undefined" ? AuthService.generateSecureToken().substring(0, 10) : Math.random().toString(16).substring(2, 10));
    this.fileStorage.set(driveFileId, fileData.file_base64);
    return {
      drive_file_id: driveFileId,
      photo_url: fileData.file_base64
    };
  }

  deleteDriveFile(fileId) {
    if (!fileId) return;
    if (this.isGasRuntime && typeof DriveApp !== "undefined" && !fileId.startsWith("drv_")) {
      try {
        DriveApp.getFileById(fileId).setTrashed(true);
      } catch (e) {}
    } else if (this.fileStorage) {
      this.fileStorage.delete(fileId);
    }
  }

  // Groups and Projects
  findGroupById(groupId) {
    const table = this.getTable("Groups");
    return table.find(g => g.group_id === groupId);
  }

  isStudentActiveInGroup(studentUid, groupId) {
    const group = this.findGroupById(groupId);
    if (!group) return false;
    return (group.members || []).includes(studentUid);
  }

  findGroupsForStudent(studentUid, academicYearId) {
    const table = this.getTable("Groups");
    return table.filter(g => 
      (g.members || []).includes(studentUid) &&
      (!academicYearId || g.academic_year_id === academicYearId)
    );
  }

  saveGroup(group) {
    this.appendRowToTable("Groups", { ...group });
  }

  saveGroupMembershipSnapshot(snapshot) {
    this.appendRowToTable("GroupMembershipSnapshots", { ...snapshot });
  }

  saveGroupScoreComponent(gsc) {
    this.appendRowToTable("GroupScoreComponents", { ...gsc });
  }

  saveIndividualScoreComponent(isc) {
    this.appendRowToTable("IndividualScoreComponents", { ...isc });
  }

  saveProject(project) {
    this.upsertRowInTable("Projects", p => p.project_id === project.project_id, project);
  }

  findProjectById(projectId) {
    const table = this.getTable("Projects");
    return table.find(p => p.project_id === projectId && !p.deleted_at);
  }

  findProjectsByOwner(studentUid, academicYearId) {
    const table = this.getTable("Projects");
    return table.filter(p => 
      p.owner_student_uid === studentUid &&
      p.type === "individual" &&
      (!academicYearId || p.academic_year_id === academicYearId) &&
      !p.deleted_at
    );
  }

  findProjectByGroup(groupId) {
    const table = this.getTable("Projects");
    return table.find(p => p.group_id === groupId && p.type === "group" && !p.deleted_at);
  }

  findProjectByGroupAndRound(groupId, roundId) {
    const table = this.getTable("Projects");
    return table.find(p => p.group_id === groupId && p.round_id === roundId && !p.deleted_at);
  }

  saveProjectArtifact(artifact) {
    this.appendRowToTable("ProjectArtifacts", { ...artifact });
  }

  findArtifactsByProjectAndKind(projectId, kind) {
    const table = this.getTable("ProjectArtifacts");
    return table.filter(a => a.project_id === projectId && a.artifact_kind === kind && !a.deleted_at);
  }

  findSessionSnapshot(academicYearId, grade) {
    const table = this.getTable("SessionSnapshots");
    return table.find(s => s.academic_year_id === academicYearId && s.grade === grade);
  }

  saveSessionSnapshot(snapshot) {
    this.upsertRowInTable("SessionSnapshots", s => s.academic_year_id === snapshot.academic_year_id && s.grade === snapshot.grade, snapshot);
  }

  recordAuditLog(log) {
    this.appendRowToTable("AuditLogs", { ...log, at: log.at || new Date().toISOString() });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SheetRepository;
}
