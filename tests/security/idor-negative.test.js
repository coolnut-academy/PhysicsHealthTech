/**
 * Security & Negative Authorization Tests (Anti-IDOR, Role Forgery)
 * Tests: AC01, AC09, GR10, GR11, SEC04, SEC05
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
  SYNTHETIC_M4_SYLLABUS,
  SYNTHETIC_GROUPS
} = require("../fixtures/synthetic-data");

function runIdorNegativeTests() {
  console.log("▶ Running IDOR & Security Negative Tests...");

  const repo = new SheetRepository();
  repo.initMemoryTable("AcademicYears", SYNTHETIC_YEARS);
  repo.initMemoryTable("Students", SYNTHETIC_STUDENTS);
  repo.initMemoryTable("Teachers", SYNTHETIC_TEACHERS);
  repo.initMemoryTable("Enrollments", SYNTHETIC_ENROLLMENTS);
  repo.initMemoryTable("SyllabusVersions", [SYNTHETIC_M4_SYLLABUS]);
  repo.initMemoryTable("Groups", SYNTHETIC_GROUPS);
  repo.initMemoryTable("Sessions", []);
  repo.initMemoryTable("LoginAttempts", []);
  repo.initMemoryTable("Submissions", []);
  repo.initMemoryTable("SubmissionVersions", []);
  repo.initMemoryTable("SubmissionFiles", []);
  repo.initMemoryTable("GradeEntries", []);
  repo.initMemoryTable("GradeRevisions", []);
  repo.initMemoryTable("Operations", []);
  repo.initMemoryTable("AuditLogs", []);

  // 1. Authenticate Student A (std_00007) and Student B (std_00123)
  const loginA = AuthService.studentLogin("00007", "PhtSecret#00007A", repo);
  const tokenA = loginA.data.session_token;

  const loginB = AuthService.studentLogin("00123", "PhtSecret#00123B", repo);
  const tokenB = loginB.data.session_token;

  // Student B submits a worksheet
  const beginB = api({
    action: "submissions.begin",
    session_token: tokenB,
    payload: { worksheet_code: "PHT4-W01", academic_year_id: "yr_2570", grade: "M4" }
  }, repo);
  assert.strictEqual(beginB.ok, true);

  const uploadB = api({
    action: "submissions.uploadEvidence",
    session_token: tokenB,
    payload: {
      upload_op_id: beginB.data.upload_op_id,
      file_name: "student_b_work.jpg",
      mime_type: "image/jpeg",
      file_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    }
  }, repo);
  assert.strictEqual(uploadB.ok, true);
  const evidenceIdB = uploadB.data.evidence_id;

  const completeB = api({
    action: "submissions.complete",
    session_token: tokenB,
    payload: {
      upload_op_id: beginB.data.upload_op_id,
      worksheet_code: "PHT4-W01",
      academic_year_id: "yr_2570",
      grade: "M4",
      note: "งานของนักเรียน B"
    }
  }, repo);
  assert.strictEqual(completeB.ok, true);

  // Test 1 (AC01 & SEC04): Student A attempts to view Student B's private evidence via direct RPC
  {
    console.log("  - Test AC01 & SEC04: Student A accessing Student B's private evidence preview is REJECTED (ACCESS_DENIED)");
    const previewByA = api({
      action: "evidence.preview",
      session_token: tokenA,
      payload: { evidence_id: evidenceIdB }
    }, repo);

    assert.strictEqual(previewByA.ok, false);
    assert.strictEqual(previewByA.error.code, "ACCESS_DENIED");
    assert.ok(previewByA.error.message_th.includes("ไม่ได้รับอนุญาต"));
  }

  // Test 2: Student B can view their own evidence
  {
    console.log("  - Test: Student B can view own evidence");
    const previewByB = api({
      action: "evidence.preview",
      session_token: tokenB,
      payload: { evidence_id: evidenceIdB }
    }, repo);

    assert.strictEqual(previewByB.ok, true);
    assert.ok(previewByB.data.data_url.startsWith("data:image/jpeg;base64,"));
  }

  // Test 3 (AC09 & GR10): Student A attempts to invoke teacher endpoints with forged role
  {
    console.log("  - Test AC09 & GR10: Student A attempting teacher.publishGrade or teacher.gradebookMatrix is REJECTED");
    
    // Attempt teacher.publishGrade
    const forgedPublish = api({
      action: "teacher.publishGrade",
      session_token: tokenA, // Student token
      payload: {
        role: "teacher", // Forged client role
        student_uid: "std_00007",
        syllabus_version_id: "syl_m4_2570_v1",
        task_code: "T4-01",
        points_int: 1000
      }
    }, repo);

    assert.strictEqual(forgedPublish.ok, false);
    assert.strictEqual(forgedPublish.error.code, "ACCESS_DENIED");

    // Attempt teacher.gradebookMatrix
    const forgedMatrix = api({
      action: "teacher.gradebookMatrix",
      session_token: tokenA,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(forgedMatrix.ok, false);
    assert.strictEqual(forgedMatrix.error.code, "ACCESS_DENIED");
  }

  // Test 4 (SEC05): Student outside a group attempts to access group project artifacts
  {
    console.log("  - Test SEC05: Student outside group attempting to add artifact is REJECTED");
    // Student C (std_00999) is NOT in grp_001 (grp_001 members are std_00007 and std_00123)
    const loginC = AuthService.studentLogin("00999", "PhtSecret#00999C", repo);
    const tokenC = loginC.data.session_token;

    // Student A (member of grp_001) creates group project
    const createGroupProject = api({
      action: "projects.createGroup",
      session_token: tokenA,
      payload: {
        group_id: "grp_001",
        round_id: "round_1",
        title: "โครงงาน Smart Goniometer",
        github_pages_url: "https://pht.github.io/smart-goniometer"
      }
    }, repo);
    assert.strictEqual(createGroupProject.ok, true);
    const projectId = createGroupProject.data.project_id;

    // Student C attempts to add artifact to Student A & B's group project
    const unauthorizedAdd = api({
      action: "projects.addArtifact",
      session_token: tokenC, // Non-member
      payload: {
        project_id: projectId,
        artifact_kind: "prompt",
        text_content: "Malicious prompt modification"
      }
    }, repo);

    assert.strictEqual(unauthorizedAdd.ok, false);
    assert.strictEqual(unauthorizedAdd.error.code, "ACCESS_DENIED");
    assert.ok(unauthorizedAdd.error.message_th.includes("ไม่ได้เป็นสมาชิก"));
  }

  console.log("✔ All IDOR & Security Negative Tests Passed!\n");
}

if (require.main === module) {
  runIdorNegativeTests();
}

module.exports = runIdorNegativeTests;

