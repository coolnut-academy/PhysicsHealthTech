const fs = require('fs');
const vm = require('vm');

function runLifecycleAndIsolationTests() {
  const mockCode = fs.readFileSync('js/mock-backend.js', 'utf-8');

  const sandbox = {
    window: {},
    localStorage: {
      _data: {},
      getItem(k) { return this._data[k] || null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; }
    },
    console: console,
    setTimeout: setTimeout,
    Date: Date,
    JSON: JSON,
    Math: Math,
    Array: Array,
    String: String,
    Number: Number,
    Boolean: Boolean
  };
  sandbox.window = sandbox;

  vm.runInNewContext(mockCode, sandbox);
  const MockBackend = sandbox.MockBackend;

  console.log('▶ Running Lifecycle, Grade Isolation & Roster Promotion Tests...');

  // 1. Student 99999 passwordless login
  const res99999 = MockBackend.handleApi('auth.studentLogin', { code_5_digit: '99999' });
  if (!res99999.ok) throw new Error('Student 99999 login failed: ' + JSON.stringify(res99999.error));
  if (res99999.data.profile.grade !== 'M4' || res99999.data.profile.roll_no !== 99) {
    throw new Error('Student 99999 profile mismatch');
  }
  console.log('  - Test: Passwordless login for test student 99999 (นายทดสอบ ห้องวิทย์สุขภาพ) OK');

  // 2. M.4 Dashboard isolation for 99999
  const dash99999 = MockBackend.handleApi('student.dashboard', {}, res99999.data.session_token);
  const cards99999 = dash99999.data.worksheet_cards;
  if (cards99999.length !== 9) throw new Error('Expected 9 worksheets for M.4');
  if (cards99999.some(w => !w.worksheet_code.startsWith('PHT4-'))) {
    throw new Error('Grade isolation breach: Non-M.4 worksheet found in M.4 student dashboard!');
  }
  console.log('  - Test: M.4 Dashboard isolation verified (strictly 9 PHT4 worksheets, 0 PHT5 worksheets)');

  // 3. M.5 Dashboard isolation for 17388
  const res17388 = MockBackend.handleApi('auth.studentLogin', { code_5_digit: '17388' });
  if (!res17388.ok) throw new Error('Student 17388 login failed');
  const dash17388 = MockBackend.handleApi('student.dashboard', {}, res17388.data.session_token);
  const cards17388 = dash17388.data.worksheet_cards;
  if (cards17388.length !== 9) throw new Error('Expected 9 worksheets for M.5');
  if (cards17388.some(w => !w.worksheet_code.startsWith('PHT5-'))) {
    throw new Error('Grade isolation breach: Non-M.5 worksheet found in M.5 student dashboard!');
  }
  console.log('  - Test: M.5 Dashboard isolation verified (strictly 9 PHT5 worksheets, 0 PHT4 worksheets)');

  // 4. Teacher Promotion & Academic Year 2570 Creation
  const tchLogin = MockBackend.handleApi('auth.teacherLogin', {
    auth_secret: 'TeacherAuthSecret#1001'
  });
  if (!tchLogin.ok) throw new Error('Teacher login failed');

  const importResult = MockBackend.handleApi('teacher.importRoster', {
    year_be: 2570,
    students: [
      { code_5_digit: '99999', display_name: 'นายทดสอบ ห้องวิทย์สุขภาพ', grade: 'M5', room: '1', roll_no: 99 },
      { code_5_digit: '20001', display_name: 'เด็กหญิงน้องใหม่ มอสี่', grade: 'M4', room: '1', roll_no: 1 }
    ]
  }, tchLogin.data.session_token);
  if (!importResult.ok) throw new Error('Roster import failed: ' + JSON.stringify(importResult.error));
  console.log('  - Test: Teacher CSV Roster import for Year 2570 & Student promotion OK');

  // 5. Multi-year access for promoted student 99999
  const res99999Year2 = MockBackend.handleApi('auth.studentLogin', { code_5_digit: '99999' });
  const enrollments99999 = res99999Year2.data.profile.available_enrollments;
  if (enrollments99999.length !== 2) {
    throw new Error(`Expected 2 enrollments for student 99999, got ${enrollments99999.length}`);
  }
  console.log('  - Test: Promoted student (99999) retains dual enrollment (2569 M.4 and 2570 M.5)');

  // 6. Verify graduated M.5 student (17388) cannot access 2570
  const res17388After = MockBackend.handleApi('auth.studentLogin', { code_5_digit: '17388' });
  const enrollments17388 = res17388After.data.profile.available_enrollments;
  const hasAccessTo2570 = enrollments17388.some(e => e.year === 2570);
  if (hasAccessTo2570) {
    throw new Error('Security breach: Graduated student has access to next academic year 2570!');
  }
  console.log('  - Test: Graduated M.5 student (17388) has NO access to next academic year 2570');

  console.log('✔ All Lifecycle, Grade Isolation & Roster Promotion Tests Passed!\n');
}

if (require.main === module) {
  runLifecycleAndIsolationTests();
}

module.exports = runLifecycleAndIsolationTests;
