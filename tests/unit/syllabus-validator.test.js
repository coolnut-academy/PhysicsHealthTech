/**
 * Unit Tests for SyllabusService & Validator
 * Tests: GR01, GR02, GR03, GR09
 */

const assert = require("assert");
const SyllabusService = require("../../backend/SyllabusService.gs");
const { SYNTHETIC_M4_SYLLABUS, SYNTHETIC_M5_SYLLABUS } = require("../fixtures/synthetic-data");

function runSyllabusValidatorTests() {
  console.log("▶ Running SyllabusService Unit Tests...");

  // Test 1 (GR02): Valid M4 and M5 synthetic syllabi pass validation
  {
    console.log("  - Test GR02: Valid M4 & M5 syllabi with 9 worksheets and 20x100 sessions pass");
    const resM4 = SyllabusService.validateSyllabusPackage(SYNTHETIC_M4_SYLLABUS);
    assert.strictEqual(resM4.valid, true, "M4 syllabus must be valid: " + resM4.errors.join("; "));
    assert.strictEqual(resM4.summary.worksheets_count, 9);
    assert.strictEqual(resM4.summary.total_base_points, "100.00");

    const resM5 = SyllabusService.validateSyllabusPackage(SYNTHETIC_M5_SYLLABUS);
    assert.strictEqual(resM5.valid, true, "M5 syllabus must be valid: " + resM5.errors.join("; "));
    assert.strictEqual(resM5.summary.worksheets_count, 9);
    assert.strictEqual(resM5.summary.total_base_points, "100.00");
  }

  // Test 2 (GR01): Reject 8 or 10 worksheet rows
  {
    console.log("  - Test GR01: Reject syllabus with 8 or 10 worksheets (exactly 9 required)");
    // Copy M4 syllabus but drop 1 worksheet (8 worksheets)
    const pkg8 = JSON.parse(JSON.stringify(SYNTHETIC_M4_SYLLABUS));
    pkg8.worksheets.pop();
    const res8 = SyllabusService.validateSyllabusPackage(pkg8);
    assert.strictEqual(res8.valid, false, "Must reject 8 worksheets");
    assert.ok(res8.errors.some(e => e.includes("INVALID_WORKSHEET_COUNT")), "Should have INVALID_WORKSHEET_COUNT error");

    // Copy M4 syllabus and add 1 extra worksheet (10 worksheets)
    const pkg10 = JSON.parse(JSON.stringify(SYNTHETIC_M4_SYLLABUS));
    pkg10.worksheets.push({
      code: "PHT4-W10",
      title: "ใบงานพิเศษเกิน 9 ชุด",
      order_no: 10,
      session_start: 19,
      session_end: 20
    });
    const res10 = SyllabusService.validateSyllabusPackage(pkg10);
    assert.strictEqual(res10.valid, false, "Must reject 10 worksheets");
    assert.ok(res10.errors.some(e => e.includes("INVALID_WORKSHEET_COUNT")));
  }

  // Test 3 (GR03): Reject Task full marks sum of 99.50 or 100.50 (exact 100.00 required)
  {
    console.log("  - Test GR03: Reject Task points sum != 100.00 (e.g. 99.50 or 100.50)");
    
    // Sum = 99.50 (9950 hundredths)
    const pkgUnder = JSON.parse(JSON.stringify(SYNTHETIC_M4_SYLLABUS));
    pkgUnder.tasks[0].max_points_int = 950; // was 1000
    const resUnder = SyllabusService.validateSyllabusPackage(pkgUnder);
    assert.strictEqual(resUnder.valid, false, "Must reject 99.50 sum");
    assert.ok(resUnder.errors.some(e => e.includes("INVALID_TOTAL_BASE_POINTS")));

    // Sum = 100.50 (10050 hundredths)
    const pkgOver = JSON.parse(JSON.stringify(SYNTHETIC_M4_SYLLABUS));
    pkgOver.tasks[0].max_points_int = 1050; // was 1000
    const resOver = SyllabusService.validateSyllabusPackage(pkgOver);
    assert.strictEqual(resOver.valid, false, "Must reject 100.50 sum");
    assert.ok(resOver.errors.some(e => e.includes("INVALID_TOTAL_BASE_POINTS")));
  }

  // Test 4 (GR09): Reject Rubric criteria total inconsistent with component max
  {
    console.log("  - Test GR09: Reject rubric criteria sum mismatch");
    const pkgRubric = JSON.parse(JSON.stringify(SYNTHETIC_M4_SYLLABUS));
    pkgRubric.rubrics = [
      {
        rubric_code: "RUB_T4_01",
        max_points_int: 1000,
        criteria: [
          { criterion_code: "C1", max_points_int: 400 },
          { criterion_code: "C2", max_points_int: 500 } // Total = 900 != 1000
        ]
      }
    ];

    const resRubric = SyllabusService.validateSyllabusPackage(pkgRubric);
    assert.strictEqual(resRubric.valid, false);
    assert.ok(resRubric.errors.some(e => e.includes("RUBRIC_CRITERIA_MISMATCH")));
  }

  console.log("✔ All SyllabusService Unit Tests Passed!\n");
}

if (require.main === module) {
  runSyllabusValidatorTests();
}

module.exports = runSyllabusValidatorTests;

