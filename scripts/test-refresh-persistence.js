// Test file: verify student profile photo persistence across simulated page refresh
const fs = require('fs');
const path = require('path');

// Read app.js code
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsCode = fs.readFileSync(appJsPath, 'utf8');

console.log('Testing app.js refresh persistence logic...');

// 1. Setup mock browser environment
const localStorageData = {};
const sessionStorageData = {};

global.localStorage = {
  getItem: (k) => localStorageData[k] !== undefined ? localStorageData[k] : null,
  setItem: (k, v) => { localStorageData[k] = String(v); },
  removeItem: (k) => { delete localStorageData[k]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); },
  get length() { return Object.keys(localStorageData).length; },
  key: (i) => Object.keys(localStorageData)[i] || null
};

global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] !== undefined ? sessionStorageData[k] : null,
  setItem: (k, v) => { sessionStorageData[k] = String(v); },
  removeItem: (k) => { delete sessionStorageData[k]; },
  clear: () => { Object.keys(sessionStorageData).forEach(k => delete sessionStorageData[k]); },
  get length() { return Object.keys(sessionStorageData).length; },
  key: (i) => Object.keys(sessionStorageData)[i] || null
};

const domElements = {};
function getEl(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id,
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      dataset: {},
      children: [],
      getContext: () => ({
        fillRect: () => {}, clearRect: () => {}, beginPath: () => {}, arc: () => {}, fill: () => {},
        stroke: () => {}, moveTo: () => {}, lineTo: () => {}, closePath: () => {}, setLineDash: () => {}
      }),
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      remove: function() { this.innerHTML = ''; }
    };
  }
  return domElements[id];
}

global.requestAnimationFrame = () => {};

global.document = {
  getElementById: (id) => getEl(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => ({ tag, style: {}, dataset: {}, setAttribute: () => {}, addEventListener: () => {} }),
  addEventListener: (event, cb) => {
    if (event === 'DOMContentLoaded') global._onDomLoaded = cb;
  }
};

global.window = {
  apiClient: {
    sessionToken: 'test_token',
    userProfile: null,
    isLoggedIn: function() { return Boolean(this.sessionToken); },
    getRole: function() { return 'student'; },
    getProfile: function() { return this.userProfile; },
    setSession: function(t, p) { this.sessionToken = t; this.userProfile = p; sessionStorage.setItem('PHT_USER_PROFILE', JSON.stringify(p)); },
    clearSession: function() { this.sessionToken = ''; this.userProfile = null; sessionStorage.removeItem('PHT_USER_PROFILE'); },
    call: async function(action, payload) {
      if (action === 'student.dashboard') {
        // Simulates the live GAS server returning photo_url: null because of missing columns
        return {
          ok: true,
          data: {
            profile: {
              student_uid: 'std_99999',
              code_5_digit: '99999',
              display_name: 'นายทดสอบ ห้องวิทย์สุขภาพ',
              photo_url: null, // Note: server returns null!
              photo_drive_file_id: null,
              grade: 'M4',
              room: 1,
              roll_no: 99,
              year_be: 2569,
              available_enrollments: []
            },
            score_summary: { graded_earned_points: 0, reviewed_max_points: 0, accumulated_points_capped_100: 0 },
            worksheet_summary: {},
            worksheet_cards: []
          }
        };
      }
      return { ok: true, data: {} };
    }
  },
  lucide: { createIcons: () => {} },
  addEventListener: () => {}
};

// Initial student login state
const initialProfile = {
  student_uid: 'std_99999',
  code_5_digit: '99999',
  display_name: 'นายทดสอบ ห้องวิทย์สุขภาพ',
  role: 'student',
  photo_url: null,
  grade: 'M4',
  year_be: 2569
};
window.apiClient.setSession('test_session_token', initialProfile);

// Step 1: Simulate user having uploaded a photo earlier
const samplePhotoUrl = 'https://lh3.googleusercontent.com/d/1IYB3kvbQm3DwyqEOSrqzdOrQjxwPCsB5';
localStorage.setItem('PHT_PROFILE_PHOTO_std_99999', samplePhotoUrl);
localStorage.setItem('PHT_PROFILE_PHOTO_99999', samplePhotoUrl);
localStorage.setItem('PHT_PROFILE_PHOTO_LAST_UPLOADED', samplePhotoUrl);

// Step 2: Now simulate a PAGE REFRESH (F5)
console.log('\n--- Simulating Page Refresh (F5) ---');
eval(appJsCode); // Evaluates app.js which registers DOMContentLoaded

// Execute DOMContentLoaded
if (global._onDomLoaded) {
  global._onDomLoaded();
}

// Check what window.app did
setTimeout(async () => {
  // Let async dashboard call complete
  await new Promise(r => setTimeout(r, 200));

  const banner = getEl('student-profile-banner');
  const headerAvatar = getEl('user-header-avatar');
  const container = getEl('student-worksheets-container');

  console.log('Container HTML:', container.innerHTML);
  console.log('Banner innerHTML contains photo img?:', banner.innerHTML.includes(samplePhotoUrl));
  console.log('Header avatar innerHTML contains photo img?:', headerAvatar.innerHTML.includes(samplePhotoUrl));

  if (banner.innerHTML.includes(samplePhotoUrl) && headerAvatar.innerHTML.includes(samplePhotoUrl)) {
    console.log('\n✔ TEST PASSED: Avatar successfully persisted across page refresh even when server returned photo_url: null!');
  } else {
    console.error('\n❌ TEST FAILED: Avatar was not rendered!');
    console.log('Banner HTML:', banner.innerHTML);
    console.log('Header Avatar HTML:', headerAvatar.innerHTML);
  }
}, 500);
