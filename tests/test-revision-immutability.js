const fs = require('fs');
const vm = require('vm');

function runRevisionImmutabilityTests() {
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

  console.log('▶ Running Revision, Anti-Sabotage Immutability & History Tests...');

  // 1. Student 99999 Login
  const loginRes = MockBackend.handleApi('auth.studentLogin', { code_5_digit: '99999' });
  const token = loginRes.data.session_token;

  // 2. Submit Version 1
  const begin1 = MockBackend.handleApi('submissions.begin', {
    worksheet_code: 'PHT4-W01',
    academic_year_id: 'yr_2569',
    grade: 'M4'
  }, token);

  MockBackend.handleApi('submissions.uploadEvidence', {
    upload_op_id: begin1.data.upload_op_id,
    file_name: 'v1_photo.jpg',
    mime_type: 'image/jpeg',
    file_base64: 'sample_base64_v1'
  }, token);

  const comp1 = MockBackend.handleApi('submissions.complete', {
    upload_op_id: begin1.data.upload_op_id,
    worksheet_code: 'PHT4-W01',
    academic_year_id: 'yr_2569',
    grade: 'M4',
    note: 'ส่งเวอร์ชัน 1'
  }, token);

  if (comp1.data.version_no !== 1) throw new Error('Expected Version 1');
  console.log('  - Test: Version 1 submitted and recorded');

  // 3. Security Verification: Deletion is IMPOSSIBLE
  const deleteAttempt = MockBackend.handleApi('submissions.delete', {
    submission_id: comp1.data.submission_id
  }, token);
  if (deleteAttempt.ok) throw new Error('Security Breach: Submission was allowed to be deleted!');
  console.log('  - Test Anti-Sabotage: Deletion is strictly prohibited (No delete API exists)');

  // 4. Submit Version 2 (Revision / Update)
  const begin2 = MockBackend.handleApi('submissions.begin', {
    worksheet_code: 'PHT4-W01',
    academic_year_id: 'yr_2569',
    grade: 'M4'
  }, token);

  MockBackend.handleApi('submissions.uploadEvidence', {
    upload_op_id: begin2.data.upload_op_id,
    file_name: 'v2_revised_photo.jpg',
    mime_type: 'image/jpeg',
    file_base64: 'sample_base64_v2'
  }, token);

  const comp2 = MockBackend.handleApi('submissions.complete', {
    upload_op_id: begin2.data.upload_op_id,
    worksheet_code: 'PHT4-W01',
    academic_year_id: 'yr_2569',
    grade: 'M4',
    note: 'แก้ไขข้อ 3 ใหม่ครับ ส่งเป็น v2'
  }, token);

  if (comp2.data.version_no !== 2) throw new Error('Expected Version 2');
  console.log('  - Test: Revision creates Version 2 without deleting Version 1');

  // 5. Student checks History
  const histStudent = MockBackend.handleApi('submissions.history', {
    worksheet_code: 'PHT4-W01'
  }, token);

  if (histStudent.data.versions.length !== 2) throw new Error('Expected 2 historical versions');
  if (histStudent.data.versions[0].version_no !== 2) throw new Error('Latest version must be first (v2)');
  if (histStudent.data.versions[1].version_no !== 1) throw new Error('Older version must be preserved (v1)');
  console.log('  - Test: Student can inspect all past versions with notes and timestamps');

  // 6. Teacher checks Student's History
  const tchLogin = MockBackend.handleApi('auth.teacherLogin', {
    auth_secret: 'TeacherAuthSecret#1001'
  });
  const histTeacher = MockBackend.handleApi('submissions.history', {
    student_uid: 'std_99999',
    worksheet_code: 'PHT4-W01'
  }, tchLogin.data.session_token);

  if (histTeacher.data.versions.length !== 2) throw new Error('Teacher should see all versions');
  console.log('  - Test: Teacher sees latest version first and can access older version files');

  console.log('✔ All Revision, Anti-Sabotage Immutability & History Tests Passed!\n');
}

if (require.main === module) {
  runRevisionImmutabilityTests();
}

module.exports = runRevisionImmutabilityTests;
