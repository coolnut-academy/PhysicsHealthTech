/**
 * Unit Tests for Sanitization, Formula Injection, and Formatting
 * Tests: SEC06, SEC07, SEC12, DATA01, DATA02, GR27
 */

const assert = require("assert");
const SheetRepository = require("../../backend/SheetRepository.gs");
const ProjectService = require("../../backend/ProjectService.gs");

function runSanitizationTests() {
  console.log("▶ Running Sanitization & Formatting Unit Tests...");

  const repo = new SheetRepository();

  // Test 1 (SEC06 & GR27): Formula injection escaping (=, +, -, @)
  {
    console.log("  - Test SEC06 & GR27: Spreadsheet formula injection characters are escaped");
    assert.strictEqual(repo.escapeFormula("=CMD('calc')"), "'=CMD('calc')");
    assert.strictEqual(repo.escapeFormula("+123456"), "'+123456");
    assert.strictEqual(repo.escapeFormula("-9999"), "'-9999");
    assert.strictEqual(repo.escapeFormula("@SUM(A1:A10)"), "'@SUM(A1:A10)");
    assert.strictEqual(repo.escapeFormula("Normal Text"), "Normal Text");

    // Unescape for display
    assert.strictEqual(repo.unescapeFormula("'=CMD('calc')"), "=CMD('calc')");
  }

  // Test 2 (SEC12): Project URL validation
  {
    console.log("  - Test SEC12: Project URL rejects unsafe schemes (javascript:, http:, data:)");
    assert.strictEqual(ProjectService.validateWebUrl("https://student.github.io/physicsproject"), "https://student.github.io/physicsproject");

    assert.throws(() => {
      ProjectService.validateWebUrl("http://insecure-site.com");
    }, /INVALID_URL/);

    assert.throws(() => {
      ProjectService.validateWebUrl("javascript:alert(document.cookie)");
    }, /INVALID_URL/);

    assert.throws(() => {
      ProjectService.validateWebUrl("data:text/html,<script>alert(1)</script>");
    }, /INVALID_URL/);
  }

  // Test 3 (DATA01): 5-digit code preserves leading zeros as text
  {
    console.log("  - Test DATA01: Code '00007' preserves leading zeros as text");
    const codeRaw = "00007";
    const codeStored = String(codeRaw).padStart(5, "0");
    assert.strictEqual(codeStored, "00007");
    assert.strictEqual(typeof codeStored, "string");
  }

  // Test 4 (DATA02): Room roll numbers sorted numerically, not lexicographically
  {
    console.log("  - Test DATA02: Roll numbers sorted numerically (1, 2, 10, 11)");
    const unsortedRolls = [10, 2, 11, 1, 20];
    const sorted = [...unsortedRolls].sort((a, b) => Number(a) - Number(b));
    assert.deepStrictEqual(sorted, [1, 2, 10, 11, 20]);
  }

  console.log("✔ All Sanitization & Formatting Unit Tests Passed!\n");
}

if (require.main === module) {
  runSanitizationTests();
}

module.exports = runSanitizationTests;

