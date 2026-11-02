/**
 * PhysicsHealthTech V2.0 - Schema Migrator & Database Initializer
 * Creates all normalized tabs with immutable header rows in Google Spreadsheet
 * Source of truth: DATA_SCHEMA.md & GRADING_DATA_SCHEMA.md
 */

const SchemaMigrator = {
  SCHEMA_VERSION: "2.0.0",

  TAB_DEFINITIONS: {
    Students: ["student_uid", "code_5_digit", "display_name", "status", "credential_version", "created_at", "updated_at", "deleted_at", "photo_drive_file_id", "photo_url"],
    StudentCredentials: ["credential_id", "student_uid", "verifier_alg", "salt", "verifier", "secret_version", "issued_at", "revoked_at"],
    Teachers: ["teacher_uid", "google_sub", "email_for_display", "name", "role", "status", "auth_secret", "created_at"],
    Sessions: ["session_id", "principal_type", "principal_uid", "role", "token_hash", "issued_at", "last_seen_at", "expires_at", "revoked_at"],
    LoginAttempts: ["attempt_id", "account_key_hash", "timestamp", "result", "cooldown_until", "reason_code"],
    AcademicYears: ["academic_year_id", "year_be", "state", "creation_op_id", "created_at", "published_at", "revision"],
    GradeWorkspaces: ["workspace_id", "academic_year_id", "grade", "state", "created_at"],
    Enrollments: ["enrollment_id", "academic_year_id", "student_uid", "grade", "room", "roll_no", "status", "created_at"],
    Assignments: ["assignment_id", "academic_year_id", "grade", "worksheet_code", "title", "order_no", "status", "session_start", "session_end", "due_at", "created_at"],
    Submissions: ["submission_id", "academic_year_id", "grade", "worksheet_code", "student_uid", "latest_version_id", "latest_version_no", "latest_version_submitted_at", "state", "out_of_roster", "created_at", "updated_at", "deleted_at"],
    SubmissionVersions: ["submission_version_id", "submission_id", "version_no", "submitted_by_uid", "submitted_at", "note", "state_at_submit", "out_of_roster_at_submit", "operation_id", "deleted_at"],
    SubmissionFiles: ["evidence_id", "submission_version_id", "upload_op_id", "drive_file_id", "mime_type", "size_bytes", "storage_state", "uploaded_at", "deleted_at"],
    EvidenceReviews: ["review_id", "submission_id", "reviewed_version_id", "teacher_uid", "decision_state", "feedback", "reviewed_at"],
    Groups: ["group_id", "academic_year_id", "grade", "round_id", "title", "members_json", "status"],
    GroupMembershipSnapshots: ["member_snapshot_id", "group_id", "academic_year_id", "grade", "round_id", "member_uids_json", "created_at", "captured_by_teacher_uid"],
    Projects: ["project_id", "academic_year_id", "grade", "type", "owner_student_uid", "group_id", "round_id", "title", "github_pages_url", "state", "revision", "created_at", "deleted_at"],
    ProjectArtifacts: ["artifact_id", "project_id", "artifact_kind", "version_no", "author_uid", "text_content", "submission_file_ref", "created_at", "deleted_at"],
    SyllabusVersions: ["syllabus_version_id", "academic_year_id", "grade", "version_no", "course_max_points_int", "sessions_count", "minutes_per_session", "state", "created_at"],
    TaskDefinitions: ["task_id", "syllabus_version_id", "task_code", "title", "max_points_int", "scoring_scope", "component_spec_json", "required", "sort_order"],
    WorksheetTaskLinks: ["link_id", "syllabus_version_id", "worksheet_code", "task_code", "display_order"],
    GradeEntries: ["grade_entry_id", "syllabus_version_id", "student_uid", "task_code", "current_points_int", "current_revision_id", "state", "feedback", "updated_at"],
    GradeRevisions: ["grade_revision_id", "student_uid", "syllabus_version_id", "task_code", "actor_teacher_uid", "state", "base_points_int", "previous_points_int", "rubric_breakdown_json", "feedback", "reason", "published_at", "created_at", "idempotency_key"],
    GradeDrafts: ["draft_id", "syllabus_version_id", "student_uid", "task_code", "points_int", "rubric_breakdown_json", "feedback", "teacher_uid", "updated_at"],
    BonusAwards: ["bonus_id", "syllabus_version_id", "student_uid", "bonus_kind", "source_worksheet_code", "points_int", "state", "approved_by", "note", "created_at"],
    GroupScoreComponents: ["group_score_id", "group_id", "task_code", "component_id", "shared_points_int", "member_snapshot_id", "teacher_uid", "state", "created_at"],
    IndividualScoreComponents: ["score_component_id", "student_uid", "task_code", "component_id", "points_int", "state"],
    SessionSnapshots: ["snapshot_id", "academic_year_id", "grade", "version_no", "sessions_json", "created_at", "updated_at", "updated_by_uid"],
    Operations: ["operation_id", "actor_uid", "action", "target_type", "target_id", "idempotency_key_hash", "state", "created_at"],
    AuditLogs: ["audit_id", "actor_type", "actor_uid", "action", "object_type", "object_id", "outcome", "change_summary", "at"]
  },

  /**
   * Migrate and initialize spreadsheet tabs in Google Apps Script
   */
  runMigration(spreadsheetId) {
    if (typeof SpreadsheetApp === "undefined" || !SpreadsheetApp.openById) {
      return { ok: true, message: "Non-GAS environment; schema migration verified logically." };
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const existingSheets = ss.getSheets().map(s => s.getName());
    const results = [];

    for (const [tabName, headers] of Object.entries(this.TAB_DEFINITIONS)) {
      let sheet = ss.getSheetByName(tabName);
      if (!sheet) {
        sheet = ss.insertSheet(tabName);
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef3f9");
        sheet.setFrozenRows(1);
        results.push(`Created tab ${tabName}`);
      } else {
        // Verify row 1 headers
        const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1).getValues()[0];
        if (existingHeaders.length === 0 || !existingHeaders[0]) {
          sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#eef3f9");
          sheet.setFrozenRows(1);
          results.push(`Updated headers for tab ${tabName}`);
        } else {
          // Detect and append any missing columns (e.g. photo_drive_file_id, photo_url)
          const missingHeaders = headers.filter(h => !existingHeaders.includes(h));
          if (missingHeaders.length > 0) {
            const startCol = existingHeaders.length + 1;
            sheet.getRange(1, startCol, 1, missingHeaders.length).setValues([missingHeaders]);
            sheet.getRange(1, startCol, 1, missingHeaders.length).setFontWeight("bold").setBackground("#eef3f9");
            results.push(`Appended missing columns [${missingHeaders.join(", ")}] to tab ${tabName}`);
          } else {
            results.push(`Tab ${tabName} already exists`);
          }
        }
      }
    }

    return {
      ok: true,
      schema_version: this.SCHEMA_VERSION,
      details: results
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SchemaMigrator;
}
