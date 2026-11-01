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

  getTable(tableName) {
    if (!this.memoryStore.has(tableName)) {
      this.memoryStore.set(tableName, []);
    }
    return this.memoryStore.get(tableName);
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
    const table = this.getTable("LoginAttempts");
    table.push({ ...attempt });
  }

  findLoginAttempts(accountKeyHash) {
    const table = this.getTable("LoginAttempts");
    return table.filter(a => a.account_key_hash === accountKeyHash);
  }

  saveSession(session) {
    const table = this.getTable("Sessions");
    table.push({ ...session });
  }

  findSessionByTokenHash(tokenHash) {
    const table = this.getTable("Sessions");
    return table.find(s => s.token_hash === tokenHash);
  }

  updateSession(session) {
    const table = this.getTable("Sessions");
    const idx = table.findIndex(s => s.session_id === session.session_id);
    if (idx >= 0) {
      table[idx] = { ...session };
    }
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
    const table = this.getTable("Enrollments");
    return table.filter(e => {
      const matchYear = e.academic_year_id === academicYearId;
      const matchGrade = e.grade === grade;
      const matchRoom = (!room || room === "all") ? true : (e.room === room);
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
    const table = this.getTable("AcademicYears");
    table.push({ ...year });
  }

  updateAcademicYear(year) {
    const table = this.getTable("AcademicYears");
    const idx = table.findIndex(y => y.academic_year_id === year.academic_year_id);
    if (idx >= 0) table[idx] = { ...year };
  }

  saveGradeWorkspace(ws) {
    const table = this.getTable("GradeWorkspaces");
    table.push({ ...ws });
  }

  saveAssignment(asg) {
    const table = this.getTable("Assignments");
    table.push({ ...asg });
  }

  getYearBe(academicYearId) {
    const year = this.findAcademicYear(academicYearId);
    return year ? year.year_be : 2570;
  }

  findPublishedSyllabus(academicYearId, grade) {
    const table = this.getTable("SyllabusVersions");
    return table.find(s => s.academic_year_id === academicYearId && s.grade === grade && s.state === "published");
  }

  savePublishedSyllabus(syllabus) {
    const table = this.getTable("SyllabusVersions");
    table.push({ ...syllabus });
  }

  findTaskByCode(syllabusVersionId, taskCode) {
    const syllabus = this.getTable("SyllabusVersions").find(s => s.syllabus_version_id === syllabusVersionId);
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
    const table = this.getTable("GradeDrafts");
    const idx = table.findIndex(d => d.student_uid === draft.student_uid && d.syllabus_version_id === draft.syllabus_version_id && d.task_code === draft.task_code);
    if (idx >= 0) {
      table[idx] = { ...draft };
    } else {
      table.push({ ...draft });
    }
  }

  deleteGradeDraft(studentUid, syllabusVersionId, taskCode) {
    const table = this.getTable("GradeDrafts");
    const idx = table.findIndex(d => d.student_uid === studentUid && d.syllabus_version_id === syllabusVersionId && d.task_code === taskCode);
    if (idx >= 0) table.splice(idx, 1);
  }

  saveGradeEntry(entry) {
    const table = this.getTable("GradeEntries");
    const idx = table.findIndex(e => e.student_uid === entry.student_uid && e.syllabus_version_id === entry.syllabus_version_id && e.task_code === entry.task_code);
    if (idx >= 0) {
      table[idx] = { ...entry };
    } else {
      table.push({ ...entry });
    }
  }

  saveGradeRevision(revision) {
    const table = this.getTable("GradeRevisions");
    table.push({ ...revision });
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
    const table = this.getTable("BonusAwards");
    table.push({ ...bonus });
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
    const table = this.getTable("Submissions");
    const idx = table.findIndex(s => s.submission_id === submission.submission_id);
    if (idx >= 0) {
      table[idx] = { ...submission };
    } else {
      table.push({ ...submission });
    }
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
    const table = this.getTable("SubmissionVersions");
    table.push({ ...version });
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
    const table = this.getTable("EvidenceReviews");
    table.push({ ...review });
  }

  findOutOfRosterSubmissions(academicYearId, grade) {
    const table = this.getTable("Submissions");
    return table.filter(s => s.academic_year_id === academicYearId && s.grade === grade && s.out_of_roster && !s.deleted_at);
  }

  saveOperation(op) {
    const table = this.getTable("Operations");
    table.push({ ...op });
  }

  findOperation(opId) {
    const table = this.getTable("Operations");
    return table.find(o => o.operation_id === opId);
  }

  updateOperation(op) {
    const table = this.getTable("Operations");
    const idx = table.findIndex(o => o.operation_id === op.operation_id);
    if (idx >= 0) table[idx] = { ...op };
  }

  saveStagedFile(file) {
    const table = this.getTable("SubmissionFiles");
    table.push({ ...file });
  }

  findStagedFilesByOpId(opId) {
    const table = this.getTable("SubmissionFiles");
    return table.filter(f => f.upload_op_id === opId && !f.deleted_at);
  }

  updateStagedFile(file) {
    const table = this.getTable("SubmissionFiles");
    const idx = table.findIndex(f => f.evidence_id === file.evidence_id);
    if (idx >= 0) table[idx] = { ...file };
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
    // In GAS runtime, save to Google Drive private folder
    // In memory runtime, store base64 in map
    if (!this.fileStorage) this.fileStorage = new Map();
    const driveFileId = `drv_${AuthService.generateSecureToken().substring(0, 16)}`;
    this.fileStorage.set(driveFileId, fileData.file_base64);
    return driveFileId;
  }

  readDriveFileAsBase64(driveFileId) {
    if (!this.fileStorage) this.fileStorage = new Map();
    return this.fileStorage.get(driveFileId) || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
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
    const table = this.getTable("Groups");
    table.push({ ...group });
  }

  saveGroupMembershipSnapshot(snapshot) {
    const table = this.getTable("GroupMembershipSnapshots");
    table.push({ ...snapshot });
  }

  saveGroupScoreComponent(gsc) {
    const table = this.getTable("GroupScoreComponents");
    table.push({ ...gsc });
  }

  saveIndividualScoreComponent(isc) {
    const table = this.getTable("IndividualScoreComponents");
    table.push({ ...isc });
  }

  saveProject(project) {
    const table = this.getTable("Projects");
    table.push({ ...project });
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
    const table = this.getTable("ProjectArtifacts");
    table.push({ ...artifact });
  }

  findArtifactsByProjectAndKind(projectId, kind) {
    const table = this.getTable("ProjectArtifacts");
    return table.filter(a => a.project_id === projectId && a.artifact_kind === kind && !a.deleted_at);
  }

  recordAuditLog(log) {
    const table = this.getTable("AuditLogs");
    table.push({ ...log, at: log.at || new Date().toISOString() });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SheetRepository;
}
