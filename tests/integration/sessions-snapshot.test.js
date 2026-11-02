/**
 * PhysicsHealthTech V2.0 - Sessions Plan & Academic Year Snapshot Tests
 * Verifies:
 * - 20 Course Sessions schedule per academic year and grade
 * - Snapshot isolation per academic year (modifications in year 2569 do not affect year 2570)
 * - Security: Students can view sessions but only teachers can save snapshots
 * - Default template fallback when no custom snapshot exists
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

function runSessionsSnapshotTests() {
  console.log("▶ Running Course Sessions & Academic Year Snapshot Tests...");

  const repo = new SheetRepository();
  repo.initMemoryTable("AcademicYears", SYNTHETIC_YEARS);
  repo.initMemoryTable("Students", SYNTHETIC_STUDENTS);
  repo.initMemoryTable("Teachers", SYNTHETIC_TEACHERS);
  repo.initMemoryTable("Enrollments", SYNTHETIC_ENROLLMENTS);
  repo.initMemoryTable("SyllabusVersions", [SYNTHETIC_M4_SYLLABUS]);
  repo.initMemoryTable("Sessions", []);
  repo.initMemoryTable("LoginAttempts", []);
  repo.initMemoryTable("SessionSnapshots", []);
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

  // Test 1: Student reads default sessions when no snapshot has been saved
  {
    console.log("  - Test: Student reads default 20 sessions before any snapshot");
    const res = api({
      action: "sessions.list",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2569", grade: "M4" }
    }, repo);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.data.sessions.length, 20, "Must return exactly 20 sessions");
    assert.strictEqual(res.data.is_snapshot, false, "Must indicate default template fallback");
    assert.strictEqual(res.data.sessions[0].session_no, 1);
    assert.strictEqual(res.data.sessions[19].session_no, 20);
    assert.ok(res.data.sessions[0].title.length > 0);
  }

  // Test 2: Security check - Student cannot save snapshot (ACCESS_DENIED)
  {
    console.log("  - Test: Student attempting to save snapshot is REJECTED (ACCESS_DENIED)");
    const hackAttempt = api({
      action: "sessions.saveSnapshot",
      session_token: studentToken,
      payload: {
        academic_year_id: "yr_2569",
        grade: "M4",
        sessions: [{ session_no: 1, title: "Hacked" }]
      }
    }, repo);

    assert.strictEqual(hackAttempt.ok, false);
    assert.strictEqual(hackAttempt.error.code, "ACCESS_DENIED");
  }

  // Test 3: Teacher saves snapshot for Year 2569
  {
    console.log("  - Test: Teacher saves custom 20 sessions snapshot for Year 2569");
    const custom2569Sessions = Array.from({ length: 20 }, (_, i) => ({
      session_no: i + 1,
      title: i === 0 ? "ปฐมนิเทศฟิสิกส์สุขภาพ รุ่น 2569 พิเศษ" : `บทเรียนฟิสิกส์สุขภาพ 2569 ครั้งที่ ${i + 1}`,
      description: `รายละเอียดเฉพาะของปีการศึกษา 2569 คาบที่ ${i + 1}`,
      linked_worksheet_code: i === 0 ? "PHT4-W01" : ""
    }));

    const saveRes = api({
      action: "sessions.saveSnapshot",
      session_token: teacherToken,
      payload: {
        academic_year_id: "yr_2569",
        grade: "M4",
        sessions: custom2569Sessions
      }
    }, repo);

    assert.strictEqual(saveRes.ok, true);
    assert.strictEqual(saveRes.data.version_no, 1);
    assert.strictEqual(saveRes.data.count, 20);

    // Verify student in Year 2569 now receives the saved snapshot
    const studentCheck = api({
      action: "sessions.list",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2569", grade: "M4" }
    }, repo);

    assert.strictEqual(studentCheck.ok, true);
    assert.strictEqual(studentCheck.data.is_snapshot, true);
    assert.strictEqual(studentCheck.data.version_no, 1);
    assert.strictEqual(studentCheck.data.sessions[0].title, "ปฐมนิเทศฟิสิกส์สุขภาพ รุ่น 2569 พิเศษ");
  }

  // Test 4: Academic Year Snapshot Isolation (Year 2570 is unaffected by Year 2569 snapshot)
  {
    console.log("  - Test: Academic Year Snapshot Isolation (Year 2570 does NOT see Year 2569 modifications)");
    const check2570 = api({
      action: "sessions.list",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(check2570.ok, true);
    assert.strictEqual(check2570.data.is_snapshot, false, "Year 2570 has no snapshot yet, must not inherit 2569 snapshot");
    assert.notStrictEqual(check2570.data.sessions[0].title, "ปฐมนิเทศฟิสิกส์สุขภาพ รุ่น 2569 พิเศษ");

    // Now Teacher saves a completely distinct snapshot for Year 2570
    const custom2570Sessions = Array.from({ length: 20 }, (_, i) => ({
      session_no: i + 1,
      title: i === 0 ? "ฟิสิกส์สุขภาพ 2570 ยุค AI ทางการแพทย์" : `บทเรียนฟิสิกส์สุขภาพ 2570 ครั้งที่ ${i + 1}`,
      description: `หลักสูตรปรับปรุงปี 2570 ครั้งที่ ${i + 1}`,
      linked_worksheet_code: i === 0 ? "PHT4-W01" : ""
    }));

    const save2570 = api({
      action: "sessions.saveSnapshot",
      session_token: teacherToken,
      payload: {
        academic_year_id: "yr_2570",
        grade: "M4",
        sessions: custom2570Sessions
      }
    }, repo);

    assert.strictEqual(save2570.ok, true);

    // Verify both years retain their own independent data
    const fetch2569 = api({
      action: "sessions.list",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2569", grade: "M4" }
    }, repo);

    const fetch2570 = api({
      action: "sessions.list",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(fetch2569.data.sessions[0].title, "ปฐมนิเทศฟิสิกส์สุขภาพ รุ่น 2569 พิเศษ");
    assert.strictEqual(fetch2570.data.sessions[0].title, "ฟิสิกส์สุขภาพ 2570 ยุค AI ทางการแพทย์");
    console.log("  - Test: Dual-year independent snapshots successfully verified!");
  }

  console.log("✔ All Course Sessions & Academic Year Snapshot Tests Passed!\n");
}

if (require.main === module) {
  runSessionsSnapshotTests();
}

module.exports = runSessionsSnapshotTests;

