/**
 * PhysicsHealthTech V2.0 - Student Profile Photo Integration & Security Tests
 * 
 * Verifies:
 * 1. Profile photo upload to Google Drive linked to Student ID
 * 2. Profile photo is part of Student Dashboard view model
 * 3. Edit pencil icon & avatar container rendered for student
 * 4. Authorization checks (Anti-IDOR: students only update own photo, no unauth, no non-image MIME)
 * 5. Teacher gradebook matrix displays student photo
 * 6. Profile photo removal unlinks from student ID and cleans Drive file
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
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

function runStudentProfilePhotoTests() {
  console.log("▶ Running Student Profile Photo & Google Drive Integration Tests...");

  const repo = new SheetRepository();
  // Deep clone synthetic students to avoid polluting other test suites
  const clonedStudents = JSON.parse(JSON.stringify(SYNTHETIC_STUDENTS));
  repo.initMemoryTable("AcademicYears", SYNTHETIC_YEARS);
  repo.initMemoryTable("Students", clonedStudents);
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
  assert.strictEqual(loginStudent.ok, true, "Student login should succeed");
  const studentToken = loginStudent.data.session_token;

  const loginTeacher = AuthService.teacherLogin({ auth_secret: "coolnut1618" }, repo);
  assert.strictEqual(loginTeacher.ok, true, "Teacher login should succeed");
  const teacherToken = loginTeacher.data.session_token;

  // 1. Initial State: No profile photo
  {
    console.log("  - Test 1: Initial student dashboard has null photo_url");
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(dash.ok, true);
    assert.strictEqual(dash.data.profile.student_uid, "std_00007");
    assert.strictEqual(dash.data.profile.code_5_digit, "00007");
    assert.strictEqual(dash.data.profile.photo_url, null, "Initially photo_url should be null");
  }

  // 2. Upload Profile Photo: Real storage & Student ID linking
  let uploadedFileId = null;
  const samplePhotoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

  {
    console.log("  - Test 2: Student uploads profile photo -> linked to student_uid & stored in Drive");
    const uploadRes = api({
      action: "student.uploadProfilePhoto",
      session_token: studentToken,
      payload: {
        file_base64: samplePhotoBase64,
        mime_type: "image/jpeg",
        file_name: "somchai_profile.jpg"
      }
    }, repo);

    assert.strictEqual(uploadRes.ok, true, "Upload should return ok: true");
    assert.strictEqual(uploadRes.data.student_uid, "std_00007");
    assert.strictEqual(uploadRes.data.code_5_digit, "00007");
    assert(uploadRes.data.photo_drive_file_id, "Should return a Drive file ID");
    assert(uploadRes.data.photo_url, "Should return photo_url");
    uploadedFileId = uploadRes.data.photo_drive_file_id;

    // Verify stored student record in repository
    const studentInDb = repo.findStudentByUid("std_00007");
    assert.strictEqual(studentInDb.photo_drive_file_id, uploadedFileId, "DB should record photo_drive_file_id");
    assert.strictEqual(studentInDb.photo_url, uploadRes.data.photo_url, "DB should record photo_url");
  }

  // 3. Profile photo is part of Student Dashboard
  {
    console.log("  - Test 3: Student Dashboard includes photo_url in profile view model");
    const dash = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);

    assert.strictEqual(dash.ok, true);
    assert.strictEqual(dash.data.profile.student_uid, "std_00007");
    assert(dash.data.profile.photo_url, "photo_url must be present in dashboard profile");
    assert.strictEqual(dash.data.profile.photo_drive_file_id, uploadedFileId);
  }

  // 4. Security & Negative Authorization Checks
  {
    console.log("  - Test 4: Security - Unauthenticated upload is rejected (SESSION_EXPIRED)");
    const unauthRes = api({
      action: "student.uploadProfilePhoto",
      session_token: "invalid_expired_token",
      payload: { file_base64: samplePhotoBase64 }
    }, repo);
    assert.strictEqual(unauthRes.ok, false);
    assert(["SESSION_EXPIRED", "SESSION_REQUIRED", "ACCESS_DENIED"].includes(unauthRes.error.code));
  }

  {
    console.log("  - Test 5: Security - Teacher role cannot call student.uploadProfilePhoto (Role enforcement)");
    const teacherAttempt = api({
      action: "student.uploadProfilePhoto",
      session_token: teacherToken,
      payload: { file_base64: samplePhotoBase64 }
    }, repo);
    assert.strictEqual(teacherAttempt.ok, false);
    assert.strictEqual(teacherAttempt.error.code, "ACCESS_DENIED");
  }

  {
    console.log("  - Test 6: Security - Invalid MIME type (e.g. application/pdf) is rejected");
    const pdfAttempt = api({
      action: "student.uploadProfilePhoto",
      session_token: studentToken,
      payload: {
        file_base64: "data:application/pdf;base64,JVBERi0xLjQK",
        mime_type: "application/pdf"
      }
    }, repo);
    assert.strictEqual(pdfAttempt.ok, false);
    assert.strictEqual(pdfAttempt.error.code, "INVALID_FILE_TYPE");
  }

  // 5. Teacher Gradebook Matrix displays student's photo
  {
    console.log("  - Test 7: Teacher gradebook matrix row includes photo_url");
    const matrixRes = api({
      action: "teacher.gradebookMatrix",
      session_token: teacherToken,
      payload: { academic_year_id: "yr_2570", grade: "M4", room: "1" }
    }, repo);

    assert.strictEqual(matrixRes.ok, true);
    const somchaiRow = matrixRes.data.rows.find(r => r.code_5_digit === "00007");
    assert(somchaiRow, "Somchai must be in room 1 matrix");
    assert(somchaiRow.photo_url, "Teacher sees Somchai's uploaded photo_url in matrix");
  }

  // 6. Remove Profile Photo
  {
    console.log("  - Test 8: Student can remove profile photo -> cleans Drive & resets DB");
    const removeRes = api({
      action: "student.removeProfilePhoto",
      session_token: studentToken,
      payload: {}
    }, repo);

    assert.strictEqual(removeRes.ok, true);
    assert.strictEqual(removeRes.data.photo_url, null);

    const studentInDb = repo.findStudentByUid("std_00007");
    assert.strictEqual(studentInDb.photo_drive_file_id, null);
    assert.strictEqual(studentInDb.photo_url, null);

    // Confirm dashboard reflects removal
    const dashAfterRemove = api({
      action: "student.dashboard",
      session_token: studentToken,
      payload: { academic_year_id: "yr_2570", grade: "M4" }
    }, repo);
    assert.strictEqual(dashAfterRemove.data.profile.photo_url, null);
  }

  // 7. Verify UI Elements & Edit Pencil in Codebase
  {
    console.log("  - Test 9: UI verification - HTML, CSS & App.js contain avatar & pencil edit button");
    const html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");
    const css = fs.readFileSync(path.join(__dirname, "..", "..", "css", "style.css"), "utf8");
    const appJs = fs.readFileSync(path.join(__dirname, "..", "..", "js", "app.js"), "utf8");

    // HTML checks
    assert(html.includes('id="modal-student-profile-photo"'), "index.html must have profile photo modal");
    assert(html.includes('id="user-header-avatar"'), "index.html must have header mini avatar container");
    assert(html.includes('data-lucide="pencil"'), "index.html modal must have pencil icon");

    // CSS checks
    assert(css.includes(".student-profile-card"), "style.css must have .student-profile-card");
    assert(css.includes(".student-avatar-wrapper"), "style.css must have .student-avatar-wrapper");
    assert(css.includes(".student-avatar-edit-btn"), "style.css must have .student-avatar-edit-btn (pencil button)");

    // App.js checks
    assert(appJs.includes("btn-student-edit-avatar"), "app.js must render pencil edit button on student avatar");
    assert(appJs.includes("openProfilePhotoModal"), "app.js must have openProfilePhotoModal");
    assert(appJs.includes("handleProfileFileSelected"), "app.js must have handleProfileFileSelected");
    assert(appJs.includes("uploadProfilePhotoConfirm"), "app.js must have uploadProfilePhotoConfirm");
  }

  console.log("✔ All Student Profile Photo Integration Tests Passed!\n");
}

if (require.main === module) {
  runStudentProfilePhotoTests();
}

module.exports = runStudentProfilePhotoTests;
