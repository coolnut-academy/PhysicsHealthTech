/**
 * Integration Tests for Teacher Gradebook & Scoring Operations
 * Tests: AC03, AC04, GR07, GR08, GR23, GR24, GR25, GR27
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

function runTeacherGradebookTests() {
  console.log("▶ Running Teacher Gradebook Integration Tests...");

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
  repo.initMemoryTable("GradeDrafts", []);
  repo.initMemoryTable("GradeRevisions", []);
  repo.initMemoryTable("BonusAwards", []);
  repo.initMemoryTable("Operations", []);
  repo.initMemoryTable("AuditLogs", []);

  // Login Student (std_00007) and Teacher (tch_001)
  const loginStudent = AuthService.studentLogin("00007", "PhtSecret#00007A", repo);
  const studentToken = loginStudent.data.session_token;

  const loginTeacher = AuthService.teacherLogin({ auth_secret: "coolnut1618" }, repo);
  const teacherToken = loginTeacher.data.session_token;

  // Test 1 (AC03 & GR25): Teacher matrix sorted numerically by roll_no (1, 2, 10)
  {
    console.log("  - Test AC03 & GR25: Matrix sorted numerically by roll_no (1, 2, 10)");
    const matrix = api({
      action: "teacher.gradebookMatrix",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2570", grade: "M4", room: "1" }
    }, repo);

    assert.strictEqual(matrix.ok, true);
    assert.strictEqual(matrix.data.rows.length, 3, "Room 1 has 3 enrolled students");
    assert.strictEqual(matrix.data.rows[0].roll_no, 1);
    assert.strictEqual(matrix.data.rows[1].roll_no, 2);
    assert.strictEqual(matrix.data.rows[2].roll_no, 10, "Roll 10 must come after Roll 2 (numeric, not string sort)");
  }

  // Test 2 (GR07): Save draft grade (8/10 pts) -> student still sees null ('รอตรวจ')
  {
    console.log("  - Test GR07: Draft score saved by teacher remains invisible to student ('รอตรวจ')");
    const saveDraft = api({
      action: "teacher.saveGradeDraft",
      session_token: teacherToken,
      payload: {
        student_uid: "std_00007",
        syllabus_version_id: "syl_m4_2570_v1",
        task_code: "T4-01",
        points_int: 800,
        feedback: "คะแนนฉบับร่าง"
      }
    }, repo);
    assert.strictEqual(saveDraft.ok, true);

    // Verify Student Dashboard sees 'รอตรวจ'
    const studentDash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    const cardW01 = studentDash.data.worksheet_cards.find(c => c.worksheet_code === "PHT4-W01");
    assert.strictEqual(cardW01.task_summaries[0].published_points, null, "Draft must be hidden from student");
    assert.strictEqual(cardW01.task_summaries[0].grading_label_th, "รอตรวจ");
  }

  // Test 3 (GR08): Publish grade (8.00 pts) -> Student sees 8.00; then edit to 9.00 with reason -> revision audit created
  {
    console.log("  - Test GR08: Publish grade 8.00, then regrade to 9.00 with mandatory reason & audit");
    const publish1 = api({
      action: "teacher.publishGrade",
      session_token: teacherToken,
      payload: {
        student_uid: "std_00007",
        syllabus_version_id: "syl_m4_2570_v1",
        task_code: "T4-01",
        points_int: 800,
        feedback: "ผลการทดลองเรียบร้อยดีมาก"
      }
    }, repo);
    assert.strictEqual(publish1.ok, true);
    assert.strictEqual(publish1.data.points, 8.0);

    // Student now sees 8.0
    const studentDash1 = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);
    const cardW01 = studentDash1.data.worksheet_cards.find(c => c.worksheet_code === "PHT4-W01");
    assert.strictEqual(cardW01.task_summaries[0].published_points, 8.0);
    assert.strictEqual(cardW01.task_summaries[0].grading_label_th, "ตรวจแล้ว");

    // Regrade without reason should FAIL
    const regradeNoReason = api({
      action: "teacher.publishGrade",
      session_token: teacherToken,
      payload: {
        student_uid: "std_00007",
        syllabus_version_id: "syl_m4_2570_v1",
        task_code: "T4-01",
        points_int: 900
      }
    }, repo);
    assert.strictEqual(regradeNoReason.ok, false);
    assert.strictEqual(regradeNoReason.error.code, "REGRADE_REASON_REQUIRED");

    // Regrade with reason succeeds
    const regradeWithReason = api({
      action: "teacher.publishGrade",
      session_token: teacherToken,
      payload: {
        student_uid: "std_00007",
        syllabus_version_id: "syl_m4_2570_v1",
        task_code: "T4-01",
        points_int: 900,
        reason: "ตรวจทานวิธีคำนวณข้อสุดท้ายใหม่และให้คะแนนเพิ่ม",
        feedback: "ยอดเยี่ยมมาก แก้ไขจุดผิดได้ถูกต้อง"
      }
    }, repo);
    assert.strictEqual(regradeWithReason.ok, true);
    assert.strictEqual(regradeWithReason.data.points, 9.0);

    // Check student history has 2 revisions
    const history = api({
      action: "student.gradeHistory",
      session_token: studentToken,
      payload: { task_code: "T4-01", syllabus_version_id: "syl_m4_2570_v1" }
    }, repo);
    assert.strictEqual(history.ok, true);
    assert.strictEqual(history.data.revisions.length, 2);
    assert.strictEqual(history.data.revisions[0].points, 9.0);
    assert.strictEqual(history.data.revisions[1].points, 8.0);
  }

  // Test 4 (AC04 & GR23): Out-of-roster submission flagged in separate tray
  {
    console.log("  - Test AC04 & GR23: Out-of-roster submission appears in separate tray, does not distort denominator");
    // Student enrolled in M5 (std_91234) submits to M4 worksheet
    const loginM5Student = AuthService.studentLogin("91234", "PhtSecret#91234D", repo);
    const m5StudentToken = loginM5Student.data.session_token;

    const beginOut = api({
      action: "submissions.begin",
      session_token: m5StudentToken,
      payload: { worksheet_code: "PHT4-W01", academic_year_id: "yr_2570", grade: "M4" }
    }, repo);
    assert.strictEqual(beginOut.ok, true);

    const upOut = api({
      action: "submissions.uploadEvidence",
      session_token: m5StudentToken,
      payload: {
        upload_op_id: beginOut.data.upload_op_id,
        file_name: "cross_grade.jpg",
        mime_type: "image/jpeg",
        file_base64: "base64cross"
      }
    }, repo);

    const compOut = api({
      action: "submissions.complete",
      session_token: m5StudentToken,
      payload: {
        upload_op_id: beginOut.data.upload_op_id,
        worksheet_code: "PHT4-W01",
        academic_year_id: "yr_2570",
        grade: "M4",
        note: "ส่งข้ามระดับชั้น"
      }
    }, repo);
    assert.strictEqual(compOut.ok, true);
    assert.strictEqual(compOut.data.out_of_roster, true);

    // Teacher M4 matrix check: denominator is STILL 3 enrolled students, out-of-roster count is 1
    const matrix = api({
      action: "teacher.gradebookMatrix",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2570", grade: "M4", room: "1" }
    }, repo);

    assert.strictEqual(matrix.data.rows.length, 3, "Denominator remains 3 enrolled students");
    assert.strictEqual(matrix.data.out_of_roster_count, 1);
  }

  // Test 5 (GR27): Gradebook Export escapes formula injection (=cmd) and leaves pending cells blank/status
  {
    console.log("  - Test GR27: Gradebook export with formula injection escaping and teacher-only check");
    
    // Inject malicious display_name for a student
    repo.findStudentByUid("std_00123").display_name = "=CMD('calc.exe')";

    const exportRes = api({
      action: "teacher.exportGradebook",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2570", grade: "M4", room: "1" }
    }, repo);

    assert.strictEqual(exportRes.ok, true);
    const csv = exportRes.data.csv_content;
    assert.ok(csv.includes("'\=CMD('calc.exe')"), "Malicious formula must be escaped with single quote");

    // Student attempting export is denied
    const studentExport = api({
      action: "teacher.exportGradebook",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4", room: "1" }
    }, repo);
    assert.strictEqual(studentExport.ok, false);
    assert.strictEqual(studentExport.error.code, "ACCESS_DENIED");
  }

  console.log("✔ All Teacher Gradebook Integration Tests Passed!\n");
}

if (require.main === module) {
  runTeacherGradebookTests();
}

module.exports = runTeacherGradebookTests;

