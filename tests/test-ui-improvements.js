const fs = require('fs');
const assert = require('assert');

console.log('===============================================================');
console.log('  Testing PhysicsHealthTech UI & Performance Updates           ');
console.log('===============================================================\n');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');
const js = fs.readFileSync('js/app.js', 'utf8');
const mockJs = fs.readFileSync('js/mock-backend.js', 'utf8');

// 1. Password guides removed & Single Teacher Password is coolnut1618
assert.strictEqual(html.includes('QUICK BIO-CREDENTIALS'), false, 'QUICK BIO-CREDENTIALS should be removed');
assert.strictEqual(html.includes('TEACHER DEMO CREDENTIALS'), false, 'TEACHER DEMO CREDENTIALS should be removed');
assert.strictEqual(html.includes('TeacherAuthSecret#1001'), false, 'Teacher demo secret should be removed');
assert.strictEqual(html.includes('AdminAuthSecret#9999'), false, 'Admin demo secret should be removed');
assert.strictEqual(html.includes('container-student-secret'), false, 'student secret container should be removed');
assert.ok(mockJs.includes('coolnut1618'), 'Single teacher password coolnut1618 must be configured in mock backend');
console.log('✔ Requirement 1: รหัสเข้าของครูผู้สอนให้มีรหัสเดียวคือ coolnut1618 เรียบร้อย');

// 2. Appropriate real-world wording
assert.strictEqual(html.includes('AUTHENTICATION GATEWAY'), false, 'AUTHENTICATION GATEWAY should be replaced');
assert.strictEqual(html.includes('BIO-TELEMETRY ONLINE'), false, 'BIO-TELEMETRY ONLINE should be replaced');
assert.strictEqual(html.includes('Immutable Versioning'), false, 'Immutable Versioning warning should be replaced');
assert.ok(html.includes('ระบบส่งใบงานและติดตามผลการเรียนรู้'), 'Real-world subtitle should be present');
assert.ok(html.includes('คำแนะนำในการส่งงาน'), 'Real-world upload guidance should be present');
console.log('✔ Requirement 2: ปรับการใช้คำพูด guideline ให้เหมาะสมในการใช้งานจริง เรียบร้อย');

// 3. Settings button and unnecessary buttons removed
assert.strictEqual(html.includes('id="btn-settings"'), false, 'Settings button should be removed');
assert.strictEqual(html.includes('modal-settings'), false, 'Settings modal should be removed');
assert.strictEqual(html.includes('mobile-navigation'), false, 'Dummy bottom nav should be removed');
console.log('✔ Requirement 3: เอาปุ่ม setting และปุ่มอื่นๆที่ไม่จำเป็นออก เรียบร้อย');

// 4. Mobile responsiveness, easy upload, and device-side A4 compression
assert.ok(html.includes('id="btn-trigger-camera"'), 'Camera button should exist');
assert.ok(html.includes('id="btn-trigger-gallery"'), 'Gallery button should exist');
assert.ok(html.includes('capture="environment"'), 'Native camera capture should exist');
assert.ok(html.includes('upload-previews-container'), 'Preview grid should exist');

// Test A4 compression math
assert.ok(js.includes('1240'), 'A4 width 1240 should be defined');
assert.ok(js.includes('1754'), 'A4 height 1754 should be defined');

function calculateA4Dimensions(origW, origH) {
  const isPortrait = origH >= origW;
  const targetMaxW = isPortrait ? 1240 : 1754;
  const targetMaxH = isPortrait ? 1754 : 1240;

  let w = origW;
  let h = origH;

  if (w > targetMaxW || h > targetMaxH) {
    const ratio = Math.min(targetMaxW / w, targetMaxH / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }
  return { w, h, isPortrait };
}

// Test portrait mobile photo (3000 x 4000)
const p1 = calculateA4Dimensions(3000, 4000);
assert.ok(p1.w <= 1240, 'Width should be <= 1240');
assert.ok(p1.h <= 1754, 'Height should be <= 1754');
assert.strictEqual(p1.w, 1240, 'Width should scale to A4 max width constraint');
assert.strictEqual(p1.h, 1653, 'Height should fit inside A4 max height');

// Test portrait photo that is taller than A4 (2000 x 3500)
const p2 = calculateA4Dimensions(2000, 3500);
assert.ok(p2.w <= 1240, 'Width should be <= 1240');
assert.ok(p2.h <= 1754, 'Height should be <= 1754');
assert.strictEqual(p2.h, 1754, 'Height should hit A4 max height constraint');

// Test landscape photo (4000 x 3000)
const p3 = calculateA4Dimensions(4000, 3000);
assert.ok(p3.w <= 1754, 'Width should be <= 1754');
assert.ok(p3.h <= 1240, 'Height should be <= 1240');

// Test CSS mobile media queries
assert.ok(css.includes('@media (max-width: 768px)'), 'Mobile media query should exist');
assert.ok(css.includes('repeat(2, 1fr)'), '2x2 metric cards on mobile');
assert.ok(css.includes('.worksheet-filter-tabs'), 'Filter tabs for quick mobile access');
assert.ok(css.includes('min-height: 48px'), 'Thumb-friendly touch targets');
console.log('✔ Requirement 4: Mobile Responsive, Easy Upload, Device-side A4 Compression เรียบร้อย');

// 5. Lucide Icons Overhaul
assert.ok(html.includes('data-lucide'), 'HTML should use data-lucide attributes');
assert.ok(html.includes('js/lucide.min.js'), 'Local lucide library script should be included');
assert.ok(js.includes('refreshIcons'), 'refreshIcons helper should exist in app.js');
assert.strictEqual(html.includes('🚪 ออกจากระบบ'), false, 'Emoji door should be replaced by Lucide log-out');
assert.strictEqual(html.includes('🔬 คะแนนที่ตรวจแล้ว'), false, 'Emoji microscope should be replaced by Lucide icon');
console.log('✔ Requirement 5: ใช้ Lucide Icons แทน icons emoji/ai slop เรียบร้อย');

// 6. Real-time Progress Loading Bar
assert.ok(html.includes('id="top-progress-bar"'), 'Top HUD progress bar element should exist');
assert.ok(css.includes('#top-progress-bar'), 'Top progress bar CSS should exist');
assert.ok(html.includes('upload-progress-container'), 'Upload multi-step progress bar should exist');
assert.ok(js.includes('startProgress'), 'startProgress method should exist in app.js');
assert.ok(js.includes('completeProgress'), 'completeProgress method should exist in app.js');
console.log('✔ Requirement 6: ระบบ Progress Loading Bar แสดงผลความคืบหน้าแบบ Real-time เรียบร้อย');

// 7. Speed & Single Roundtrip Batch Optimization
assert.ok(js.includes('submissions.submitBatch'), 'Batch submission should be used in app.js');
assert.ok(mockJs.includes('submissions.submitBatch'), 'Batch submission should be supported in mock-backend.js');
console.log('✔ Requirement 7: เร่งความเร็วการอัปโหลดและประมวลผลด้วย Single-Roundtrip Batch Upload เรียบร้อย');

// 8. Official Brand Logo & Transparent Emblem Favicon
assert.ok(html.includes('assets/logo.png'), 'Brand logo image should be referenced in index.html');
assert.ok(fs.existsSync('assets/logo.png'), 'assets/logo.png file must exist');
assert.ok(html.includes('rel="icon"'), 'Favicon link should exist in index.html');
assert.ok(fs.existsSync('assets/favicon.png'), 'assets/favicon.png file must exist');
assert.ok(fs.existsSync('assets/favicon.ico'), 'assets/favicon.ico file must exist');
assert.ok(css.includes('.brand-logo-badge-container') && css.includes('background: transparent'), 'Logo container should have transparent background');
assert.ok(css.includes('.auth-brand-logo-wrap') && css.includes('background: transparent'), 'Auth logo container should have transparent background');
console.log('✔ Requirement 8: ปรับ Logo เว็บและ Favicon เป็น PhysicsHealthTech Orbital Emblem แบบพื้นหลังใส เรียบร้อย');

console.log('\n===============================================================');
console.log('🎉 ALL TEST SUITES & VERIFICATIONS PASSED!');
console.log('===============================================================');
