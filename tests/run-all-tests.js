/**
 * PhysicsHealthTech V2.0 - Automated Test Suite Runner
 * Executes all Unit, Security, and Integration tests
 * Validates GR01-GR32, AC01-AC10, SEC01-SEC12, DATA01-DATA12
 */

const runGradingEngineTests = require("./unit/grading-engine.test");
const runSyllabusValidatorTests = require("./unit/syllabus-validator.test");
const runAuthSecurityTests = require("./unit/auth-security.test");
const runSanitizationTests = require("./unit/sanitization.test");
const runIdorNegativeTests = require("./security/idor-negative.test");
const runStudentDashboardTests = require("./integration/student-dashboard.test");
const runTeacherGradebookTests = require("./integration/teacher-gradebook.test");
const runLifecycleAndIsolationTests = require("./test-lifecycle-and-isolation");
const runRevisionImmutabilityTests = require("./test-revision-immutability");
const runSessionsSnapshotTests = require("./integration/sessions-snapshot.test");
const runStudentProfilePhotoTests = require("./integration/student-profile-photo.test");

console.log("===============================================================");
console.log("     PhysicsHealthTech V2.0 - Comprehensive Test Suite         ");
console.log("===============================================================\n");

let totalSuites = 13;
let passedSuites = 0;

try {
  require("./test-image-cropper");
  passedSuites++;

  runGradingEngineTests();
  passedSuites++;

  runSyllabusValidatorTests();
  passedSuites++;

  runAuthSecurityTests();
  passedSuites++;

  runSanitizationTests();
  passedSuites++;

  runIdorNegativeTests();
  passedSuites++;

  runStudentDashboardTests();
  passedSuites++;

  runTeacherGradebookTests();
  passedSuites++;

  runLifecycleAndIsolationTests();
  passedSuites++;

  runRevisionImmutabilityTests();
  passedSuites++;

  runSessionsSnapshotTests();
  passedSuites++;

  runStudentProfilePhotoTests();
  passedSuites++;

  console.log("▶ Running UI, Mobile & A4 Compression Checks...");
  require("./test-ui-improvements");
  passedSuites++;

  console.log("===============================================================");
  console.log(`🎉 ALL ${passedSuites}/${totalSuites} TEST SUITES PASSED SUCCESSFULLY!`);
  console.log("Verified Cases:");
  console.log("  - AC01, AC02, AC03, AC04, AC09");
  console.log("  - GR01, GR02, GR03, GR04, GR05, GR06, GR07, GR08, GR09");
  console.log("  - GR10, GR11, GR12, GR13, GR14, GR15, GR16, GR17, GR18");
  console.log("  - GR19, GR20, GR21, GR22, GR23, GR24, GR25, GR27, GR29, GR30");
  console.log("  - SEC01, SEC02, SEC03, SEC04, SEC05, SEC06, SEC07, SEC10, SEC12");
  console.log("  - DATA01, DATA02, DATA05, DATA06, DATA07, DATA10");
  console.log("  - Multi-Year Lifecycle, Grade Isolation & Roster Promotion");
  console.log("  - Revision, Anti-Sabotage Immutability & Multi-Version History");
  console.log("  - 20 Course Sessions Schedule & Academic Year Snapshot Isolation");
  console.log("  - Student Profile Photo, Edit Pencil, Google Drive Storage & ID Linking");
  console.log("===============================================================\n");
  process.exit(0);

} catch (err) {
  console.error("\n❌ TEST SUITE FAILED WITH ERROR:");
  console.error(err);
  process.exit(1);
}
