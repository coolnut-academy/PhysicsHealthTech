/**
 * Integration Tests for Student Dashboard & Submission Lifecycle
 * Tests: GR12, GR13, GR14, GR15, GR18
 */

const assert = require("assert");
const { api } = require("../../backend/Entry.gs");
const SheetRepository = require("../../backend/SheetRepository.gs");
const AuthService = require("../../backend/AuthService.gs");
const {
  SYNTHETIC_YEARS,
  SYNTHETIC_STUDENTS,
  SYNTHETIC_TEACHERS,
  SYNTHETIC_ENROLLMENTS,
  SYNTHETIC_M4_SYLLABUS
} = require("../fixtures/synthetic-data");

function runStudentDashboardTests() {
  console.log("▶ Running Student Dashboard Integration Tests...");

  const repo = new SheetRepository();
  repo.initMemoryTable("AcademicYears", SYNTHETIC_YEARS);
  repo.initMemoryTable("Students", SYNTHETIC_STUDENTS);
  repo.initMemoryTable("Teachers", SYNTHETIC_TEACHERS);
  repo.initMemoryTable("Enrollments", SYNTHETIC_ENROLLMENTS);
  repo.initMemoryTable("SyllabusVersions", [SYNTHETIC_M4_SYLLABUS]);
  repo.initMemoryTable("Sessions", []);
  repo.initMemoryTable("LoginAttempts", []);
  repo.initMemoryTable("Submissions", []);
  repo.initMemoryTable("SubmissionVersions", []);
  repo.initMemoryTable("SubmissionFiles", []);
  repo.initMemoryTable("EvidenceReviews", []);
  repo.initMemoryTable("GradeEntries", []);
  repo.initMemoryTable("GradeRevisions", []);
  repo.initMemoryTable("Operations", []);
  repo.initMemoryTable("AuditLogs", []);

  // Login Student (std_00007) and Teacher (tch_001)
  const loginStudent = AuthService.studentLogin("00007", "PhtSecret#00007A", repo);
  const studentToken = loginStudent.data.session_token;

  const loginTeacher = AuthService.teacherLogin({ auth_secret: "coolnut1618" }, repo);
  const teacherToken = loginTeacher.data.session_token;

  // Test 1: Initial Dashboard (Not submitted)
  {
    console.log("  - Test: Initial Student Dashboard has 9 worksheet cards, all not_submitted");
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(dash.ok, true);
    assert.strictEqual(dash.data.worksheet_cards.length, 9);
    assert.strictEqual(dash.data.worksheet_summary.total_required, 9);
    assert.strictEqual(dash.data.worksheet_summary.submitted_distinct, 0);
    assert.strictEqual(dash.data.worksheet_summary.not_submitted_distinct, 9);
    assert.strictEqual(dash.data.score_summary.pending_task_count, 9);
    assert.strictEqual(dash.data.score_summary.graded_earned_points_int, 0);
  }

  // Test 2 (GR12 & GR13): Submit 2 photos for Worksheet 1 -> exactly 1 worksheet submitted, main status submitted
  {
    console.log("  - Test GR12 & GR13: Upload 2 photos -> 1 worksheet submitted, main status 'submitted', marks null ('รอตรวจ')");
    const begin = api({
      action: "submissions.begin",
      session_token: studentToken,
      payload: { worksheet_code: "PHT4-W01", academic_year_id: "yr_2570", grade: "M4" }
    }, repo);
    assert.strictEqual(begin.ok, true);
    const opId = begin.data.upload_op_id;

    // Photo 1
    const up1 = api({
      action: "submissions.uploadEvidence",
      session_token: studentToken,
      payload: { upload_op_id: opId, file_name: "page1.jpg", mime_type: "image/jpeg", file_base64: "base64data1" }
    }, repo);
    assert.strictEqual(up1.ok, true);

    // Photo 2
    const up2 = api({
      action: "submissions.uploadEvidence",
      session_token: studentToken,
      payload: { upload_op_id: opId, file_name: "page2.jpg", mime_type: "image/jpeg", file_base64: "base64data2" }
    }, repo);
    assert.strictEqual(up2.ok, true);

    // Complete
    const complete = api({
      action: "submissions.complete",
      session_token: studentToken,
      payload: { upload_op_id: opId, worksheet_code: "PHT4-W01", academic_year_id: "yr_2570", grade: "M4", note: "ใบงานที่ 1 หน้า 1-2" }
    }, repo);
    assert.strictEqual(complete.ok, true);
    assert.strictEqual(complete.data.files_count, 2);
    assert.strictEqual(complete.data.version_no, 1);

    // Check Dashboard
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(dash.data.worksheet_summary.submitted_distinct, 1);
    assert.strictEqual(dash.data.worksheet_summary.not_submitted_distinct, 8);

    const cardW01 = dash.data.worksheet_cards.find(c => c.worksheet_code === "PHT4-W01");
    assert.strictEqual(cardW01.main_status, "submitted");
    assert.strictEqual(cardW01.status_label_th, "ส่งแล้ว — รอตรวจ");
    assert.strictEqual(cardW01.task_summaries[0].published_points, null, "Ungraded task must be null, not 0");
    assert.strictEqual(cardW01.task_summaries[0].grading_label_th, "รอตรวจ");
  }

  // Test 3 (GR14): Teacher requests revision -> main status 'revision_required'
  let submissionId = null;
  {
    console.log("  - Test GR14: Teacher requests revision -> main status becomes 'revision_required' with feedback");
    const sub = repo.findSubmissionByWorksheetAndStudent("PHT4-W01", "std_00007", "yr_2570", "M4");
    submissionId = sub.submission_id;

    const reqRev = api({
      action: "teacher.requestRevision",
      session_token: teacherToken,
      payload: {
        submission_id: submissionId,
        feedback: "กรุณาแสดงวิธีทำในข้อที่ 3 และ 4 ให้ชัดเจน"
      }
    }, repo);
    assert.strictEqual(reqRev.ok, true);

    // Check Student Dashboard
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    const cardW01 = dash.data.worksheet_cards.find(c => c.worksheet_code === "PHT4-W01");
    assert.strictEqual(cardW01.main_status, "revision_required");
    assert.strictEqual(cardW01.status_label_th, "ส่งกลับให้แก้ไข");
    assert.strictEqual(dash.data.worksheet_summary.revision_required_distinct, 1);
  }

  // Test 4 (GR15): Student resubmits after revision -> version advances to 2, status returns to 'submitted'
  {
    console.log("  - Test GR15: Student resubmits -> new version 2, status returns to 'submitted'");
    const begin2 = api({
      action: "submissions.begin",
      session_token: studentToken,
      payload: { worksheet_code: "PHT4-W01", academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    const up2 = api({
      action: "submissions.uploadEvidence",
      session_token: studentToken,
      payload: {
        upload_op_id: begin2.data.upload_op_id,
        file_name: "page3_revised.jpg",
        mime_type: "image/jpeg",
        file_base64: "base64revised"
      }
    }, repo);

    const complete2 = api({
      action: "submissions.complete",
      session_token: studentToken,
      payload: {
        upload_op_id: begin2.data.upload_op_id,
        worksheet_code: "PHT4-W01",
        academic_year_id: "yr_2570",
        grade: "M4",
        note: "แก้ไขวิธีทำข้อ 3 และ 4 แล้วครับ"
      }
    }, repo);

    assert.strictEqual(complete2.ok, true);
    assert.strictEqual(complete2.data.version_no, 2);

    // Check Dashboard
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    const cardW01 = dash.data.worksheet_cards.find(c => c.worksheet_code === "PHT4-W01");
    assert.strictEqual(cardW01.main_status, "submitted");
    assert.strictEqual(cardW01.status_label_th, "ส่งแล้ว — รอตรวจ");
    assert.strictEqual(cardW01.submission_latest_version_no, 2);
    assert.strictEqual(cardW01.has_history, true);
  }

  // Test 5: Single-Roundtrip Batch Upload (submissions.submitBatch)
  {
    console.log("  - Test: High-performance single-roundtrip batch upload (submissions.submitBatch)");
    const batchRes = api({
      action: "submissions.submitBatch",
      session_token: studentToken,
      payload: {
        worksheet_code: "PHT4-W02",
        academic_year_id: "yr_2570",
        grade: "M4",
        note: "ส่งใบงานที่ 2 ผ่าน submitBatch",
        files: [
          { file_name: "page1.jpg", mime_type: "image/jpeg", file_base64: "base64page1" },
          { file_name: "page2.jpg", mime_type: "image/jpeg", file_base64: "base64page2" }
        ]
      }
    }, repo);

    assert.strictEqual(batchRes.ok, true);
    assert.strictEqual(batchRes.data.version_no, 1);
    assert.strictEqual(batchRes.data.files_count, 2);
    assert.ok(batchRes.request_id);
  }

  console.log("✔ All Student Dashboard Integration Tests Passed!\n");
}

if (require.main === module) {
  runStudentDashboardTests();
}

module.exports = runStudentDashboardTests;

