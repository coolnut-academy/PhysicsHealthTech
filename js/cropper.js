/**
 * PhysicsHealthTech V2.0 - Pure Vanilla HTML5 Canvas Image Cropper
 * 
 * Features:
 * - Circular guide boundary with dark vignette overlay & rule-of-thirds grid
 * - Drag-to-pan using Mouse & Touch events (with boundary clamping)
 * - Pinch-to-zoom on touch devices & mouse wheel zoom
 * - Zoom slider integration & incremental zoom buttons
 * - 90-degree clockwise image rotation
 * - High-quality square JPEG export (~60-120 KB)
 */

class ImageCropper {
  /**
   * @param {HTMLCanvasElement} canvas - Target canvas element
   * @param {Object} options - Cropper options
   * @param {number} [options.cropSize=220] - Diameter of circular crop area in px
   */
  constructor(canvas, options = {}) {
    if (!canvas) {
      throw new Error("ImageCropper: Canvas element is required");
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.cropSize = options.cropSize || 220;

    this.img = null;
    this.zoom = 1.0;
    this.minZoom = 1.0;
    this.maxZoom = 3.0;
    this.rotation = 0; // 0, 90, 180, 270

    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Multi-touch pinch zoom
    this.initialPinchDist = null;
    this.initialPinchZoom = 1.0;

    this.initEvents();
  }

  /**
   * Attach interaction events
   */
  initEvents() {
    if (typeof window === "undefined" || !this.canvas || !this.canvas.addEventListener) return;
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    window.addEventListener("mousemove", (e) => this.onMouseMove(e));
    window.addEventListener("mouseup", () => this.onMouseUp());

    // Touch events (passive: false to prevent scrolling while cropping)
    this.canvas.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false });
    this.canvas.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
    this.canvas.addEventListener("touchend", (e) => this.onTouchEnd(e));
    this.canvas.addEventListener("touchcancel", (e) => this.onTouchEnd(e));

    // Mouse wheel zoom
    this.canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
  }

  /**
   * Load image into cropper
   * @param {HTMLImageElement} img
   */
  loadImage(img) {
    this.img = img;
    this.zoom = 1.0;
    this.rotation = 0;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  /**
   * Set zoom level directly
   * @param {number} val
   */
  setZoom(val) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, Number(val) || 1.0));
    this.clampPan();
    this.render();
  }

  /**
   * Rotate 90 degrees clockwise
   */
  rotate() {
    this.rotation = (this.rotation + 90) % 360;
    this.clampPan();
    this.render();
  }

  /**
   * Reset transformations
   */
  reset() {
    this.zoom = 1.0;
    this.rotation = 0;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }

  /**
   * Compute effective base scale so image covers the circular crop bounds at zoom=1
   */
  getBaseScale() {
    if (!this.img) return 1;
    const isRotated90 = (this.rotation === 90 || this.rotation === 270);
    const dispW = isRotated90 ? (this.img.naturalHeight || this.img.height) : (this.img.naturalWidth || this.img.width);
    const dispH = isRotated90 ? (this.img.naturalWidth || this.img.width) : (this.img.naturalHeight || this.img.height);
    if (!dispW || !dispH) return 1;
    return Math.max(this.cropSize / dispW, this.cropSize / dispH);
  }

  /**
   * Clamp panning so image cannot be dragged completely outside the crop frame
   */
  clampPan() {
    if (!this.img) return;
    const isRotated90 = (this.rotation === 90 || this.rotation === 270);
    const dispW = isRotated90 ? (this.img.naturalHeight || this.img.height) : (this.img.naturalWidth || this.img.width);
    const dispH = isRotated90 ? (this.img.naturalWidth || this.img.width) : (this.img.naturalHeight || this.img.height);
    const currentScale = this.getBaseScale() * this.zoom;

    const renderedW = dispW * currentScale;
    const renderedH = dispH * currentScale;

    const maxPanX = Math.max(0, (renderedW - this.cropSize) / 2);
    const maxPanY = Math.max(0, (renderedH - this.cropSize) / 2);

    this.panX = Math.max(-maxPanX, Math.min(maxPanX, this.panX));
    this.panY = Math.max(-maxPanY, Math.min(maxPanY, this.panY));
  }

  // --- Mouse Handlers ---
  onMouseDown(e) {
    if (!this.img) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.canvas.style.cursor = "grabbing";
  }

  onMouseMove(e) {
    if (!this.isDragging || !this.img) return;
    const dx = e.clientX - this.dragStartX;
    const dy = e.clientY - this.dragStartY;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;

    this.panX += dx;
    this.panY += dy;
    this.clampPan();
    this.render();
  }

  onMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = "grab";
    }
  }

  // --- Touch Handlers ---
  onTouchStart(e) {
    if (!this.img) return;
    if (e.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
      this.initialPinchDist = null;
    } else if (e.touches.length === 2) {
      this.isDragging = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.initialPinchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      this.initialPinchZoom = this.zoom;
    }
    e.preventDefault();
  }

  onTouchMove(e) {
    if (!this.img) return;
    if (e.touches.length === 1 && this.isDragging) {
      const dx = e.touches[0].clientX - this.dragStartX;
      const dy = e.touches[0].clientY - this.dragStartY;
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;

      this.panX += dx;
      this.panY += dy;
      this.clampPan();
      this.render();
      e.preventDefault();
    } else if (e.touches.length === 2 && this.initialPinchDist) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      if (this.initialPinchDist > 0) {
        const factor = currentDist / this.initialPinchDist;
        const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.initialPinchZoom * factor));
        this.setZoom(newZoom);

        // Sync slider
        const slider = (typeof document !== "undefined") ? document.getElementById("crop-zoom-slider") : null;
        if (slider) slider.value = newZoom.toFixed(2);
      }
      e.preventDefault();
    }
  }

  onTouchEnd(e) {
    if (e.touches.length === 0) {
      this.isDragging = false;
      this.initialPinchDist = null;
    } else if (e.touches.length === 1) {
      this.dragStartX = e.touches[0].clientX;
      this.dragStartY = e.touches[0].clientY;
      this.isDragging = true;
      this.initialPinchDist = null;
    }
  }

  // --- Wheel Handler ---
  onWheel(e) {
    if (!this.img) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
    this.setZoom(newZoom);

    // Sync slider
    const slider = (typeof document !== "undefined") ? document.getElementById("crop-zoom-slider") : null;
    if (slider) slider.value = newZoom.toFixed(2);
  }

  /**
   * Render viewport canvas
   */
  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = this.cropSize / 2;

    // 1. Clear background
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.fillStyle = "#080c18";
    this.ctx.fillRect(0, 0, w, h);

    if (!this.img) return;

    // 2. Draw transformed image
    this.ctx.save();
    this.ctx.translate(cx + this.panX, cy + this.panY);
    this.ctx.rotate((this.rotation * Math.PI) / 180);

    const scale = this.getBaseScale() * this.zoom;
    this.ctx.scale(scale, scale);

    const nw = this.img.naturalWidth || this.img.width;
    const nh = this.img.naturalHeight || this.img.height;
    this.ctx.drawImage(this.img, -nw / 2, -nh / 2);
    this.ctx.restore();

    // 3. Dark Vignette Mask outside circular guide
    this.ctx.save();
    this.ctx.fillStyle = "rgba(8, 12, 24, 0.72)";
    this.ctx.beginPath();
    this.ctx.rect(0, 0, w, h);
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2, true); // Counter-clockwise circle cuts hole
    this.ctx.fill();
    this.ctx.restore();

    // 4. Subtle Rule-of-Thirds Grid inside circular guide
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.clip();

    this.ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
    this.ctx.lineWidth = 1;
    const step = this.cropSize / 3;
    const startX = cx - r;
    const startY = cy - r;

    this.ctx.beginPath();
    // Vertical grid lines
    this.ctx.moveTo(startX + step, cy - r);
    this.ctx.lineTo(startX + step, cy + r);
    this.ctx.moveTo(startX + step * 2, cy - r);
    this.ctx.lineTo(startX + step * 2, cy + r);
    // Horizontal grid lines
    this.ctx.moveTo(cx - r, startY + step);
    this.ctx.lineTo(cx + r, startY + step);
    this.ctx.moveTo(cx - r, startY + step * 2);
    this.ctx.lineTo(cx + r, startY + step * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // 5. Futuristic Neon Cyan Circular Guide Ring
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = "rgba(0, 240, 255, 0.6)";
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.stroke();

    // Corner targeting marks (futuristic HUD)
    this.ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowBlur = 0;
    const tickLen = 6;
    // Top
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - r - 4);
    this.ctx.lineTo(cx, cy - r - 4 - tickLen);
    // Bottom
    this.ctx.moveTo(cx, cy + r + 4);
    this.ctx.lineTo(cx, cy + r + 4 + tickLen);
    // Left
    this.ctx.moveTo(cx - r - 4, cy);
    this.ctx.lineTo(cx - r - 4 - tickLen, cy);
    // Right
    this.ctx.moveTo(cx + r + 4, cy);
    this.ctx.lineTo(cx + r + 4 + tickLen, cy);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * Generate cropped square JPEG Data URL
   * @param {number} [targetSize=600] - Export resolution (targetSize x targetSize)
   * @param {number} [quality=0.88] - JPEG compression quality (0.0 to 1.0)
   * @returns {string} Base64 Data URL
   */
  getCroppedDataUrl(targetSize = 600, quality = 0.88) {
    if (!this.img) return null;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = targetSize;
    outCanvas.height = targetSize;
    const outCtx = outCanvas.getContext("2d");

    // Fill background with clean dark neutral to avoid any transparent bleed
    outCtx.fillStyle = "#0b1020";
    outCtx.fillRect(0, 0, targetSize, targetSize);

    const outCx = targetSize / 2;
    const outCy = targetSize / 2;
    const ratio = targetSize / this.cropSize;

    outCtx.save();
    outCtx.translate(outCx + this.panX * ratio, outCy + this.panY * ratio);
    outCtx.rotate((this.rotation * Math.PI) / 180);

    const scale = this.getBaseScale() * this.zoom * ratio;
    outCtx.scale(scale, scale);

    const nw = this.img.naturalWidth || this.img.width;
    const nh = this.img.naturalHeight || this.img.height;
    outCtx.drawImage(this.img, -nw / 2, -nh / 2);
    outCtx.restore();

    return outCanvas.toDataURL("image/jpeg", quality);
  }
}

// Attach globally
if (typeof window !== "undefined") {
  window.ImageCropper = ImageCropper;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = ImageCropper;
}
