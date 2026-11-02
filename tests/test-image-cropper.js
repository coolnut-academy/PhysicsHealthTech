const assert = require('assert');
const ImageCropper = require('../js/cropper.js');

console.log('▶ Testing ImageCropper...');

// Mock canvas & 2D context
function createMockCanvas(width = 280, height = 280) {
  const listeners = {};
  const mockCtx = {
    clearRect: () => {},
    fillRect: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: () => {},
    beginPath: () => {},
    rect: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    clip: () => {},
    moveTo: () => {},
    lineTo: () => {},
    shadowColor: '',
    shadowBlur: 0,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 1
  };

  return {
    width,
    height,
    style: {},
    getContext: () => mockCtx,
    addEventListener: (evt, fn) => {
      listeners[evt] = fn;
    },
    removeEventListener: () => {},
    _listeners: listeners
  };
}

// 1. Instantiation
const canvas = createMockCanvas(280, 280);
const cropper = new ImageCropper(canvas, { cropSize: 220 });
assert.strictEqual(cropper.cropSize, 220);
assert.strictEqual(cropper.zoom, 1.0);
assert.strictEqual(cropper.rotation, 0);
assert.strictEqual(cropper.panX, 0);
assert.strictEqual(cropper.panY, 0);
console.log('  ✔ Test 1: Instantiation & initial state OK');

// 2. Load Image & Base Scale
const mockImg = {
  naturalWidth: 800,
  naturalHeight: 600,
  width: 800,
  height: 600
};
cropper.loadImage(mockImg);
assert.strictEqual(cropper.img, mockImg);
// For 800x600, to cover 220x220, base scale is 220 / 600 = 0.36666...
assert.ok(Math.abs(cropper.getBaseScale() - (220 / 600)) < 0.001);
console.log('  ✔ Test 2: loadImage & baseScale computation OK');

// 3. Zoom controls
cropper.setZoom(2.5);
assert.strictEqual(cropper.zoom, 2.5);
// Clamp zoom between min and max
cropper.setZoom(5.0);
assert.strictEqual(cropper.zoom, 3.0);
cropper.setZoom(0.5);
assert.strictEqual(cropper.zoom, 1.0);
console.log('  ✔ Test 3: setZoom & clamping OK');

// 4. Rotation controls
cropper.reset();
assert.strictEqual(cropper.rotation, 0);
cropper.rotate();
assert.strictEqual(cropper.rotation, 90);
// Rotated 90: dispW = 600, dispH = 800 -> baseScale = 220 / 600
assert.ok(Math.abs(cropper.getBaseScale() - (220 / 600)) < 0.001);
cropper.rotate();
assert.strictEqual(cropper.rotation, 180);
cropper.rotate();
assert.strictEqual(cropper.rotation, 270);
cropper.rotate();
assert.strictEqual(cropper.rotation, 0);
console.log('  ✔ Test 4: 90-degree incremental rotation OK');

// 5. Drag-to-Pan clamping
cropper.setZoom(2.0);
cropper.panX = 9999;
cropper.panY = -9999;
cropper.clampPan();
assert.ok(cropper.panX > 0 && cropper.panX < 9999, 'panX clamped');
assert.ok(cropper.panY < 0 && cropper.panY > -9999, 'panY clamped');
console.log('  ✔ Test 5: Drag-to-pan boundary clamping OK');

// 6. Reset
cropper.reset();
assert.strictEqual(cropper.zoom, 1.0);
assert.strictEqual(cropper.rotation, 0);
assert.strictEqual(cropper.panX, 0);
assert.strictEqual(cropper.panY, 0);
console.log('  ✔ Test 6: Reset transformation state OK');

console.log('✔ All ImageCropper Unit Tests Passed!\n');

