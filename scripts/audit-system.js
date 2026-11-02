/**
 * PhysicsHealthTech V2.0 - Comprehensive System Audit & Verification Suite
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("===============================================================");
console.log("   PhysicsHealthTech V2.0 - Deep System Audit & Verification   ");
console.log("===============================================================\n");

let auditErrors = 0;
let auditWarnings = 0;
let checksPassed = 0;

function reportCheck(title, pass, details = "") {
  if (pass) {
    console.log(`  ✔ [PASS] ${title}`);
    checksPassed++;
  } else {
    console.error(`  ❌ [FAIL] ${title} - ${details}`);
    auditErrors++;
  }
}

// ----------------------------------------------------------------------------
// 1. FRONTEND INTEGRITY & DOM AUDIT
// ----------------------------------------------------------------------------
console.log("▶ 1. Auditing Frontend Integrity, DOM Elements & Icons...");

const htmlContent = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appContent = fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8");
const cssContent = fs.readFileSync(path.join(__dirname, "..", "css", "style.css"), "utf8");
const lucideMin = require(path.join(__dirname, "..", "js", "lucide.min.js"));

// 1.1 DOM Elements check
const requiredHtmlIds = [
  "modal-student-profile-photo",
  "modal-profile-code-label",
  "modal-profile-img-preview",
  "modal-profile-placeholder-preview",
  "modal-profile-file-info",
  "modal-profile-upload-progress",
  "modal-profile-progress-fill",
  "modal-profile-progress-text",
  "input-student-profile-file",
  "btn-modal-remove-photo",
  "btn-modal-save-photo",
  "user-header-avatar",
  "student-profile-banner",
  "user-header-info",
  "user-display-name",
  "user-role-tag"
];

for (const id of requiredHtmlIds) {
  reportCheck(
    `DOM Element #${id} exists in index.html`,
    htmlContent.includes(`id="${id}"`),
    `Missing id="${id}" in index.html`
  );
}

// 1.2 Lucide Icons check
const iconRegex = /data-lucide=["']([a-zA-Z0-9_-]+)["']/g;
const iconsInHtmlAndJs = new Set();
let match;
while ((match = iconRegex.exec(htmlContent)) !== null) {
  iconsInHtmlAndJs.add(match[1]);
}
while ((match = iconRegex.exec(appContent)) !== null) {
  iconsInHtmlAndJs.add(match[1]);
}

const lucideKeys = Object.keys(lucideMin.icons).map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
let missingIcons = [];
iconsInHtmlAndJs.forEach(iconName => {
  const norm = iconName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const found = lucideKeys.includes(norm);
  if (!found) missingIcons.push(iconName);
});

reportCheck(
  `All ${iconsInHtmlAndJs.size} Lucide icons used across HTML & JS exist in lucide.min.js`,
  missingIcons.length === 0,
  `Unrecognized icons: ${missingIcons.join(", ")}`
);

// 1.3 CSS Classes check
const requiredCssClasses = [
  ".student-profile-card",
  ".student-avatar-container",
  ".student-avatar-wrapper",
  ".student-avatar-img",
  ".student-avatar-placeholder",
  ".student-avatar-edit-btn",
  ".user-header-avatar",
  ".modal-profile-preview-ring",
  ".modal-profile-pencil-badge",
  ".hud-pulse-dot"
];

for (const cls of requiredCssClasses) {
  reportCheck(
    `CSS Class ${cls} defined in style.css`,
    cssContent.includes(cls),
    `Missing ${cls} in style.css`
  );
}

// ----------------------------------------------------------------------------
// 2. BACKEND & GOOGLE DRIVE AUDIT
// ----------------------------------------------------------------------------
console.log("\n▶ 2. Auditing Backend, Google Drive Storage & Database Schema...");

const EntryModule = require(path.join(__dirname, "..", "backend", "Entry.gs"));
const SheetRepository = require(path.join(__dirname, "..", "backend", "SheetRepository.gs"));
const SchemaMigrator = require(path.join(__dirname, "..", "backend", "SchemaMigrator.gs"));
const StudentService = require(path.join(__dirname, "..", "backend", "StudentService.gs"));
const AuthService = require(path.join(__dirname, "..", "backend", "AuthService.gs"));

// 2.1 Schema Definition
reportCheck(
  "SchemaMigrator defines photo_drive_file_id in Students tab",
  SchemaMigrator.TAB_DEFINITIONS.Students.includes("photo_drive_file_id")
);
reportCheck(
  "SchemaMigrator defines photo_url in Students tab",
  SchemaMigrator.TAB_DEFINITIONS.Students.includes("photo_url")
);

// 2.2 Repository Methods
const repoProto = SheetRepository.prototype;
reportCheck(
  "SheetRepository implements saveProfilePhotoToDrive",
  typeof repoProto.saveProfilePhotoToDrive === "function"
);
reportCheck(
  "SheetRepository implements deleteDriveFile",
  typeof repoProto.deleteDriveFile === "function"
);

// 2.3 StudentService Methods
reportCheck(
  "StudentService implements uploadProfilePhoto",
  typeof StudentService.uploadProfilePhoto === "function"
);
reportCheck(
  "StudentService implements removeProfilePhoto",
  typeof StudentService.removeProfilePhoto === "function"
);

// 2.4 Code.gs Bundle Synchronization
const codeGs = fs.readFileSync(path.join(__dirname, "..", "backend", "Code.gs"), "utf8");
reportCheck(
  "Code.gs bundle includes uploadProfilePhoto implementation",
  codeGs.includes("uploadProfilePhoto(session, payload, repository)")
);
reportCheck(
  "Code.gs bundle includes saveProfilePhotoToDrive implementation",
  codeGs.includes("saveProfilePhotoToDrive(studentCode, studentUid, fileData)")
);
reportCheck(
  "Code.gs bundle includes student.uploadProfilePhoto dispatcher",
  codeGs.includes('action === "student.uploadProfilePhoto"')
);

// ----------------------------------------------------------------------------
// 3. SECURITY & ANTI-IDOR VERIFICATION
// ----------------------------------------------------------------------------
console.log("\n▶ 3. Verifying Security Boundaries & Anti-IDOR Enforcement...");

const {
  SYNTHETIC_YEARS,
  SYNTHETIC_STUDENTS,
  SYNTHETIC_TEACHERS,
  SYNTHETIC_ENROLLMENTS,
  SYNTHETIC_M4_SYLLABUS
} = require(path.join(__dirname, "..", "tests", "fixtures", "synthetic-data"));

const repo = new SheetRepository();
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

const loginStudent1 = AuthService.studentLogin("00007", "PhtSecret#00007A", repo);
const student1Token = loginStudent1.data.session_token;

const loginStudent2 = AuthService.studentLogin("00123", "PhtSecret#00123B", repo);
const student2Token = loginStudent2.data.session_token;

// 3.1 Anti-IDOR: Student 1 uploading photo does NOT affect Student 2
const sampleBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/";
const resS1 = EntryModule.api({
  action: "student.uploadProfilePhoto",
  session_token: student1Token,
  payload: { file_base64: sampleBase64, mime_type: "image/jpeg" }
}, repo);

reportCheck(
  "Student 1 successfully uploads photo",
  resS1.ok === true && resS1.data.student_uid === "std_00007"
);

const student2 = repo.findStudentByUid("std_00123");
reportCheck(
  "Student 2 profile photo remains unaffected (Anti-IDOR isolation)",
  student2.photo_url === undefined || student2.photo_url === null
);

// 3.2 Student 2 uploading photo overwrites only Student 2
const resS2 = EntryModule.api({
  action: "student.uploadProfilePhoto",
  session_token: student2Token,
  payload: { file_base64: "data:image/png;base64,iVBORw0KGgo=", mime_type: "image/png" }
}, repo);

reportCheck(
  "Student 2 successfully uploads photo independently",
  resS2.ok === true && resS2.data.student_uid === "std_00123"
);

const student1Updated = repo.findStudentByUid("std_00007");
reportCheck(
  "Student 1 retains their original uploaded photo (Zero collision)",
  student1Updated.photo_url === sampleBase64
);

// 3.3 File Type Enforcements
const scriptPayload = EntryModule.api({
  action: "student.uploadProfilePhoto",
  session_token: student1Token,
  payload: { file_base64: "PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==", mime_type: "text/html" }
}, repo);

reportCheck(
  "Harmful MIME type (text/html) is strictly rejected",
  scriptPayload.ok === false && scriptPayload.error.code === "INVALID_FILE_TYPE"
);

// ----------------------------------------------------------------------------
// 4. TEST RUNNER EXECUTION
// ----------------------------------------------------------------------------
console.log("\n▶ 4. Executing Complete 12-Suite Test Runner...");
const runAllTests = require(path.join(__dirname, "..", "tests", "run-all-tests"));

console.log("\n===============================================================");
console.log(`🏁 AUDIT COMPLETE: ${checksPassed} Checks Passed | ${auditErrors} Errors | ${auditWarnings} Warnings`);
console.log("===============================================================\n");

if (auditErrors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

