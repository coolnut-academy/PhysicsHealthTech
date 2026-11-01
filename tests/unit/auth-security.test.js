/**
 * Unit Tests for AuthService & Security Boundaries
 * Tests: AC02, SEC01, SEC02, SEC03, SEC10
 */

const assert = require("assert");
const AuthService = require("../../backend/AuthService.gs");
const SheetRepository = require("../../backend/SheetRepository.gs");
const { SYNTHETIC_STUDENTS, SYNTHETIC_TEACHERS } = require("../fixtures/synthetic-data");

function runAuthSecurityTests() {
  console.log("▶ Running AuthService & Security Unit Tests...");

  const repo = new SheetRepository();
  repo.initMemoryTable("Students", SYNTHETIC_STUDENTS);
  repo.initMemoryTable("Teachers", SYNTHETIC_TEACHERS);
  repo.initMemoryTable("StudentCredentials", []);
  repo.initMemoryTable("Sessions", []);
  repo.initMemoryTable("LoginAttempts", []);

  // Test 1: Successful Student Login with code 5-digit + independent secret
  {
    console.log("  - Test: Student valid login (code '00007' + secret)");
    const res = AuthService.studentLogin("00007", "PhtSecret#00007A", repo);
    assert.strictEqual(res.ok, true, "Valid student login must succeed");
    assert.ok(res.data.session_token, "Must return session token");
    assert.strictEqual(res.data.profile.student_uid, "std_00007");
    assert.strictEqual(res.data.profile.code_5_digit, "00007");
  }

  // Test 2 (AC02): Attacker knows 5-digit code but wrong secret
  {
    console.log("  - Test AC02: Attacker knows 5-digit code but wrong secret is rejected");
    const res = AuthService.studentLogin("00007", "WrongGuessSecret123", repo);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error.code, "INVALID_CREDENTIALS");
  }

  // Test 3 (SEC10): 5 consecutive failed logins trigger RATE_LIMITED cooldown lockout
  {
    console.log("  - Test SEC10: 5 consecutive failed logins trigger lockout");
    // Already did 1 failed attempt. Do 4 more failed attempts:
    for (let i = 0; i < 4; i++) {
      AuthService.studentLogin("00007", `WrongPassword_${i}`, repo);
    }

    // 6th attempt should be blocked by RATE_LIMITED
    const resLocked = AuthService.studentLogin("00007", "PhtSecret#00007A", repo); // even with correct password!
    assert.strictEqual(resLocked.ok, false);
    assert.strictEqual(resLocked.error.code, "RATE_LIMITED");
    assert.ok(resLocked.error.message_th.includes("ระงับการเข้าสู่ระบบชั่วคราว"));
  }

  // Test 4 (SEC01): Missing, expired, or revoked session token fails closed
  {
    console.log("  - Test SEC01: Malformed, expired, or revoked session fails closed");
    // A: Malformed / empty token
    const resEmpty = AuthService.validateSession("", repo);
    assert.strictEqual(resEmpty.ok, false);

    // B: Unknown token
    const resUnknown = AuthService.validateSession("unregistered_token_1234567890", repo);
    assert.strictEqual(resUnknown.ok, false);

    // C: Valid login, then logout -> revoked token
    const freshLogin = AuthService.studentLogin("00123", "PhtSecret#00123B", repo);
    const token = freshLogin.data.session_token;
    const validCheck = AuthService.validateSession(token, repo);
    assert.strictEqual(validCheck.ok, true);

    // Logout
    AuthService.logout(token, repo);
    const afterLogoutCheck = AuthService.validateSession(token, repo);
    assert.strictEqual(afterLogoutCheck.ok, false);
    assert.strictEqual(afterLogoutCheck.error.code, "SESSION_REVOKED");
  }

  // Test 5 (SEC03): Teacher authentication rejects unauthorized callers
  {
    console.log("  - Test SEC03: Teacher login verification requires valid teacher credential");
    // Valid teacher login
    const validTeacher = AuthService.teacherLogin({ auth_secret: "TeacherAuthSecret#1001" }, repo);
    assert.strictEqual(validTeacher.ok, true);
    assert.strictEqual(validTeacher.data.profile.role, "teacher");

    // Invalid teacher secret
    const invalidTeacher = AuthService.teacherLogin({ auth_secret: "FakeTeacherSecret" }, repo);
    assert.strictEqual(invalidTeacher.ok, false);
    assert.strictEqual(invalidTeacher.error.code, "ACCESS_DENIED");
  }

  console.log("✔ All AuthService & Security Unit Tests Passed!\n");
}

if (require.main === module) {
  runAuthSecurityTests();
}

module.exports = runAuthSecurityTests;

