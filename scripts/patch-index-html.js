const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');

let html = fs.readFileSync('index.html', 'utf-8');

// 1. In modal-upload, insert notice
const oldUploadNotice = `<div style="font-size:13px;color:var(--text-muted);margin-bottom:18px">`;

const newUploadNotice = `<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#94a3b8;line-height:1.5">
        <strong style="color:var(--text-cyan)">🛡️ ระบบคุ้มครองผลงาน (Immutable Versioning):</strong><br>
        หากมีการส่งงานซ้ำ จะบันทึกเป็น <strong>เวอร์ชันใหม่ (New Version)</strong> เสมอ โดยประวัติและภาพเวอร์ชันเดิมจะถูกเก็บรักษาไว้ทั้งหมด และ<strong>ไม่สามารถลบงานได้</strong> เพื่อป้องกันเพื่อนหรือผู้อื่นแอบเข้ามากดลบงาน
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:18px">`;

// 2. In modal-grading, insert version inspector section
const oldGradingHeader = `<div class="form-group">
        <label class="form-label">รหัสภารกิจที่ประเมิน (TASK CODE)</label>`;

const newGradingHeader = `<!-- SUBMISSION & VERSION HISTORY SECTION -->
      <div id="grading-history-section" style="margin-bottom:18px;padding:12px 14px;background:rgba(2,132,199,0.08);border:1px solid rgba(56,189,248,0.3);border-radius:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-family:var(--font-hud);font-size:12px;font-weight:700;color:var(--text-cyan)">
            ⚡ ผลงานที่ส่ง (SUBMISSION VERSIONS)
          </span>
          <div id="grading-version-selector-container" style="display:flex;align-items:center;gap:6px">
            <label style="font-size:12px;color:var(--text-dim)">เวอร์ชัน:</label>
            <select id="grading-version-select" class="form-control" style="width:auto;min-height:28px;padding:2px 8px;font-size:12px;font-family:var(--font-mono);font-weight:700">
              <option value="latest">v1 (ล่าสุด)</option>
            </select>
          </div>
        </div>

        <div id="grading-version-details">
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px" id="grading-version-timestamp">📅 ส่งเมื่อ: -</div>
          <div style="font-size:12px;color:#e2e8f0;margin-bottom:10px;background:rgba(15,23,42,0.6);padding:8px 12px;border-radius:6px;border:1px solid rgba(148,163,184,0.15)" id="grading-version-note">
            💬 บันทึกจากนักเรียน: -
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--text-cyan);margin-bottom:6px">🖼️ รูปภาพผลงาน (คลิกเพื่อดูภาพขยาย):</div>
          <div id="grading-version-files" style="display:flex;flex-wrap:wrap;gap:8px">
            <span style="font-size:12px;color:var(--text-dim)">ไม่มีไฟล์แนบ</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">รหัสภารกิจที่ประเมิน (TASK CODE)</label>`;

// 3. Add student history modal and image preview modal before </body>
const bodyEndTarget = `</body>`;
const modalsToAdd = `
  <!-- MODAL: STUDENT SUBMISSION HISTORY -->
  <div id="modal-student-history" class="modal-overlay" style="display:none">
    <div class="modal-content" style="max-width:620px">
      <div class="modal-header">
        <h3 id="modal-history-title" class="modal-title">📜 ประวัติการส่งงาน</h3>
        <button class="modal-close" onclick="window.app.closeHistoryModal()">✕</button>
      </div>

      <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#94a3b8;line-height:1.5">
        <strong style="color:var(--text-cyan)">🛡️ ระบบประวัติงานแบบไม่สามารถลบได้ (Immutable Versioning):</strong><br>
        ทุกครั้งที่คุณส่งงานใหม่ ข้อมูลเวอร์ชันเก่าจะไม่หายไป ครูสามารถตรวจสอบย้อนหลังได้ทุกเวอร์ชัน และไม่สามารถลบผลงานได้เพื่อความปลอดภัย
      </div>

      <div id="student-history-timeline" style="display:flex;flex-direction:column;gap:14px;max-height:450px;overflow-y:auto;padding-right:6px">
        <!-- Version timeline cards -->
      </div>

      <div style="display:flex;justify-content:flex-end;margin-top:18px">
        <button class="btn btn-secondary" onclick="window.app.closeHistoryModal()">ปิด</button>
      </div>
    </div>
  </div>

  <!-- MODAL: IMAGE LIGHTBOX / PREVIEW -->
  <div id="modal-image-preview" class="modal-overlay" style="display:none;z-index:9999">
    <div class="modal-content" style="max-width:90vw;max-height:90vh;padding:12px;background:rgba(15,23,42,0.95);display:flex;flex-direction:column;align-items:center">
      <div style="width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span id="preview-image-title" style="font-family:var(--font-hud);font-size:13px;color:var(--text-cyan)">🖼️ รูปภาพผลงาน</span>
        <button class="modal-close" onclick="document.getElementById('modal-image-preview').style.display='none'">✕</button>
      </div>
      <div style="flex:1;display:flex;justify-content:center;align-items:center;overflow:hidden">
        <img id="preview-image-el" src="" alt="Worksheet Preview" style="max-width:100%;max-height:75vh;border-radius:6px;object-fit:contain;box-shadow:0 10px 25px rgba(0,0,0,0.5)">
      </div>
    </div>
  </div>
</body>`;

let normHtml = norm(html);
let updated = false;

if (normHtml.includes(norm(oldUploadNotice))) {
  normHtml = normHtml.replace(norm(oldUploadNotice), norm(newUploadNotice));
  console.log('✔ Added safety notice to modal-upload');
  updated = true;
} else {
  console.log('⚠️ oldUploadNotice not found');
}

// In modal-grading, also increase max-width from 540px to 620px
normHtml = normHtml.replace(
  '<div class="modal-content" style="max-width:540px">\n      <div class="modal-header">\n        <h3 id="modal-grading-title"',
  '<div class="modal-content" style="max-width:620px">\n      <div class="modal-header">\n        <h3 id="modal-grading-title"'
);

// We need to match oldGradingHeader
const oldGradingHeaderRegex = /<div class="form-group">\s*<label class="form-label">[^<]*?\(TASK CODE\)<\/label>/;
if (oldGradingHeaderRegex.test(normHtml)) {
  normHtml = normHtml.replace(oldGradingHeaderRegex, newGradingHeader);
  console.log('✔ Added version inspector to modal-grading');
  updated = true;
} else {
  console.log('⚠️ oldGradingHeaderRegex not matched');
}

if (!normHtml.includes('id="modal-student-history"')) {
  normHtml = normHtml.replace(norm(bodyEndTarget), norm(modalsToAdd));
  console.log('✔ Added modal-student-history and modal-image-preview');
  updated = true;
}

if (html.includes('\r\n')) normHtml = normHtml.replace(/\n/g, '\r\n');
fs.writeFileSync('index.html', normHtml, 'utf-8');
console.log('index.html updated successfully!');

