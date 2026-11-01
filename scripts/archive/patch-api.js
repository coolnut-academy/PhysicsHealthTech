const fs = require('fs');
const path = require('path');

// 1. Patch js/api.js
const apiPath = path.join(__dirname, '..', 'js', 'api.js');
let apiCode = fs.readFileSync(apiPath, 'utf8');

if (!apiCode.includes('window.app?.startProgress')) {
  apiCode = apiCode.replace(
    '  async call(action, payload = {}) {',
    `  async call(action, payload = {}) {
    if (window.app && typeof window.app.startProgress === "function") {
      window.app.startProgress();
    }`
  );
  
  // Wrap return in try/finally
  apiCode = apiCode.replace(
    '    // 2. Demo / Mock Engine Fallback (Immediate local testing)\n    return this.dispatchMock(action, payload);',
    `    // 2. Demo / Mock Engine Fallback (Immediate local testing)
    try {
      return await this.dispatchMock(action, payload);
    } finally {
      if (window.app && typeof window.app.completeProgress === "function") {
        window.app.completeProgress();
      }
    }`
  );

  apiCode = apiCode.replace(
    '        const data = await res.json();\n        return data;',
    `        const data = await res.json();
        if (window.app && typeof window.app.completeProgress === "function") {
          window.app.completeProgress();
        }
        return data;`
  );

  fs.writeFileSync(apiPath, apiCode, 'utf8');
  console.log('Patched js/api.js with global progress hooks');
}

