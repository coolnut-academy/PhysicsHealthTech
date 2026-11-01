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

console.log("===============================================================");
console.log("     PhysicsHealthTech V2.0 - Comprehensive Test Suite         ");
console.log("===============================================================\n");

let totalSuites = 7;
let passedSuites = 0;

try {
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

  console.log("===============================================================");
  console.log(`🎉 ALL ${passedSuites}/${totalSuites} TEST SUITES PASSED SUCCESSFULLY!`);
  console.log("Verified Cases:");
  console.log("  - AC01, AC02, AC03, AC04, AC09");
  console.log("  - GR01, GR02, GR03, GR04, GR05, GR06, GR07, GR08, GR09");
  console.log("  - GR10, GR11, GR12, GR13, GR14, GR15, GR16, GR17, GR18");
  console.log("  - GR19, GR20, GR21, GR22, GR23, GR24, GR25, GR27, GR29, GR30");
  console.log("  - SEC01, SEC02, SEC03, SEC04, SEC05, SEC06, SEC07, SEC10, SEC12");
  console.log("  - DATA01, DATA02, DATA05, DATA06, DATA07, DATA10");
  console.log("===============================================================\n");
  process.exit(0);

} catch (err) {
  console.error("\n❌ TEST SUITE FAILED WITH ERROR:");
  console.error(err);
  process.exit(1);
}

