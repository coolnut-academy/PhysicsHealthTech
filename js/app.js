/**
 * PhysicsHealthTech - Main Frontend Application Logic
 * Cyber-Clinical Theme & Touch-Optimized Mobile Experience
 * Offloads A4 image compression to client devices & streamlined vertical submission
 * Features Lucide Icons, Top HUD Progress Bar, Batch Uploads, and SWR Dashboard Caching
 */

document.addEventListener("DOMContentLoaded", () => {
  const app = {
    currentGrade: "M4",
    currentYearId: "yr_2569",
    currentRoom: "1",
    currentWorksheetFilter: "all",
    worksheetCards: [],
    selectedWorksheet: null,
    selectedUploadFiles: [], // Array of { name, mime, base64, size, width, height, origSize, savedPercent }
    gradingContext: null,
    _progressTimer: null,
    studentActiveTab: "worksheets",
    teacherActiveTab: "gradebook",
    studentSessions: [],
    teacherSessions: [],

    init() {
      this.initPhysicsBackground();
      this.bindEvents();
      this.checkAuth();
      this.refreshIcons();
    },

    /**
     * Lucide Icons Universal Refresh Helper
     */
    refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    },

    /**
     * Non-Blocking Modern Toast Notification
     */
    showToast(message, type = "info", duration = 3500) {
      const container = document.getElementById("toast-container");
      if (!container) {
        alert(message);
        return;
      }
      const toast = document.createElement("div");
      toast.className = `toast toast-${type}`;
      
      let iconName = "info";
      if (type === "success") iconName = "check-circle-2";
      if (type === "error") iconName = "alert-circle";

      toast.innerHTML = `
        <i data-lucide="${iconName}" style="width:18px;height:18px;flex-shrink:0"></i>
        <span>${message}</span>
      `;
      container.appendChild(toast);
      this.refreshIcons();

      setTimeout(() => {
        toast.classList.add("toast-exit");
        setTimeout(() => toast.remove(), 260);
      }, duration);
    },

    /**
     * Top Global HUD Progress Bar Controllers
     */
    startProgress() {
      const bar = document.getElementById("top-progress-bar");
      if (!bar) return;
      bar.style.opacity = "1";
      bar.style.width = "30%";
      if (this._progressTimer) clearInterval(this._progressTimer);
      this._progressTimer = setInterval(() => {
        const current = parseFloat(bar.style.width) || 30;
        if (current < 85) {
          bar.style.width = (current + Math.random() * 8) + "%";
        }
      }, 200);
    },

    setProgress(pct) {
      const bar = document.getElementById("top-progress-bar");
      if (!bar) return;
      bar.style.opacity = "1";
      bar.style.width = Math.min(100, Math.max(0, pct)) + "%";
    },

    completeProgress() {
      const bar = document.getElementById("top-progress-bar");
      if (!bar) return;
      if (this._progressTimer) clearInterval(this._progressTimer);
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
        setTimeout(() => { bar.style.width = "0%"; }, 350);
      }, 250);
    },

    /**
     * Interactive Physics Particle & ECG Wave Background Animation
     */
    initPhysicsBackground() {
      const canvas = document.getElementById("physics-bg-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      let width, height;
      let particles = [];
      let ecgOffset = 0;

      function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
      window.addEventListener("resize", resize);
      resize();

      const particleCount = Math.min(35, Math.floor(width / 36));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? "rgba(0, 240, 255, " : "rgba(139, 92, 246, "
        });
      }

      let mouseX = -1000, mouseY = -1000;
      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function drawECG(yBase) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = "rgba(0, 240, 255, 0.6)";
        ctx.shadowBlur = 5;

        for (let x = 0; x < width; x += 3) {
          const cycle = ((x + ecgOffset) % 360);
          let dy = 0;
          if (cycle > 120 && cycle < 135) {
            dy = -8;
          } else if (cycle >= 135 && cycle < 145) {
            dy = 6;
          } else if (cycle >= 145 && cycle < 160) {
            dy = -42;
          } else if (cycle >= 160 && cycle < 170) {
            dy = 16;
          } else if (cycle >= 170 && cycle < 205) {
            dy = -12;
          }
          const y = yBase + dy;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      function animate() {
        ctx.clearRect(0, 0, width, height);

        ecgOffset += 1.4;
        drawECG(height * 0.88);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            p.x -= dx * 0.02;
            p.y -= dy * 0.02;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color + "0.8)";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist2 < 110) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist2 / 110) * 0.25})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        requestAnimationFrame(animate);
      }

      animate();
    },

    bindEvents() {
      // Login Form Toggles
      document.getElementById("btn-tab-student-login")?.addEventListener("click", () => {
        document.getElementById("form-student-login").style.display = "block";
        document.getElementById("form-teacher-login").style.display = "none";
        document.getElementById("btn-tab-student-login").classList.add("btn-primary");
        document.getElementById("btn-tab-student-login").classList.remove("btn-secondary");
        document.getElementById("btn-tab-teacher-login").classList.add("btn-secondary");
        document.getElementById("btn-tab-teacher-login").classList.remove("btn-primary");
        this.refreshIcons();
      });

      document.getElementById("btn-tab-teacher-login")?.addEventListener("click", () => {
        document.getElementById("form-student-login").style.display = "none";
        document.getElementById("form-teacher-login").style.display = "block";
        document.getElementById("btn-tab-teacher-login").classList.add("btn-primary");
        document.getElementById("btn-tab-teacher-login").classList.remove("btn-secondary");
        document.getElementById("btn-tab-student-login").classList.add("btn-secondary");
        document.getElementById("btn-tab-student-login").classList.remove("btn-primary");
        this.refreshIcons();
      });

      // Submit Student Login
      document.getElementById("form-student-login")?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleStudentLogin();
      });

      // Submit Teacher Login
      document.getElementById("form-teacher-login")?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleTeacherLogin();
      });

      // Logout
      document.getElementById("btn-logout")?.addEventListener("click", () => {
        this.handleLogout();
      });

      // Mobile Upload Triggers (Camera & Gallery)
      document.getElementById("btn-trigger-camera")?.addEventListener("click", () => {
        document.getElementById("upload-camera-input")?.click();
      });

      document.getElementById("btn-trigger-gallery")?.addEventListener("click", () => {
        document.getElementById("upload-file-input")?.click();
      });

      document.getElementById("upload-camera-input")?.addEventListener("change", (e) => {
        this.handleFileSelection(e.target.files);
      });

      document.getElementById("upload-file-input")?.addEventListener("change", (e) => {
        this.handleFileSelection(e.target.files);
      });

      // Filter Chips for Student Worksheets
      document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          this.currentWorksheetFilter = chip.dataset.filter || "all";
          this.applyWorksheetFilter();
        });
      });

      // Teacher filters
      document.getElementById("teacher-grade-select")?.addEventListener("change", (e) => {
        this.currentGrade = e.target.value;
        this.loadTeacherMatrix();
      });

      document.getElementById("teacher-room-select")?.addEventListener("change", (e) => {
        this.currentRoom = e.target.value;
        this.loadTeacherMatrix();
      });

      document.getElementById("teacher-year-select")?.addEventListener("change", (e) => {
        this.currentYearId = e.target.value;
        this.loadTeacherMatrix();
      });

      document.getElementById("btn-download-template")?.addEventListener("click", () => {
        this.downloadRosterTemplate();
      });

      document.getElementById("btn-import-roster")?.addEventListener("click", () => {
        this.openImportRosterModal();
      });

      document.getElementById("import-csv-file")?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            document.getElementById("import-csv-text").value = evt.target.result;
          };
          reader.readAsText(file, "UTF-8");
        }
      });

      document.getElementById("btn-export-gradebook")?.addEventListener("click", () => {
        this.exportGradebook();
      });
    },

    checkAuth() {
      if (window.apiClient.isLoggedIn()) {
        const role = window.apiClient.getRole();
        const profile = window.apiClient.getProfile();
        this.showLoggedInView(role, profile);
      } else {
        this.showLoginView();
      }
    },

    showLoginView() {
      document.getElementById("view-auth").style.display = "block";
      document.getElementById("view-student-portal").style.display = "none";
      document.getElementById("view-teacher-workspace").style.display = "none";
      document.getElementById("user-header-info").style.display = "none";
      const mobileNav = document.getElementById("mobile-navigation");
      if (mobileNav) mobileNav.style.display = "none";
      this.refreshIcons();
    },

    showLoggedInView(role, profile) {
      document.getElementById("view-auth").style.display = "none";
      document.getElementById("user-header-info").style.display = "flex";

      const nameEl = document.getElementById("user-display-name");
      const roleEl = document.getElementById("user-role-tag");

      const headerAvatar = document.getElementById("user-header-avatar");
      if (headerAvatar) {
        if (profile && !profile.photo_url && profile.student_uid) {
          try {
            const cachedPhoto = localStorage.getItem("PHT_PROFILE_PHOTO_" + profile.student_uid);
            if (cachedPhoto) profile.photo_url = cachedPhoto;
          } catch (e) {}
        }
        if (profile && profile.photo_url) {
          headerAvatar.innerHTML = `<img src="${profile.photo_url}" alt="Avatar">`;
          headerAvatar.style.display = "inline-flex";
        } else {
          headerAvatar.innerHTML = "";
          headerAvatar.style.display = "none";
        }
      }

      if (role === "teacher" || role === "admin") {
        nameEl.textContent = profile.name || profile.email;
        roleEl.textContent = "TEACHER";
        document.getElementById("view-teacher-workspace").style.display = "block";
        document.getElementById("view-student-portal").style.display = "none";
        this.loadTeacherMatrix();
      } else {
        nameEl.textContent = `${profile.display_name} (${profile.code_5_digit})`;
        roleEl.textContent = "STUDENT";
        document.getElementById("view-student-portal").style.display = "block";
        document.getElementById("view-teacher-workspace").style.display = "none";
        this.loadStudentDashboard();
      }
      this.refreshIcons();
    },

    async handleStudentLogin() {
      const code = document.getElementById("student-code").value.trim();
      const errBox = document.getElementById("auth-error-box");
      const submitBtn = document.getElementById("btn-submit-student-login");
      const originalText = submitBtn ? submitBtn.innerHTML : '<span class="btn-text">เข้าสู่ระบบ</span>';
      errBox.style.display = "none";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-inline"></span> กำลังเข้าสู่ระบบ...';
      }
      this.startProgress();

      try {
        const res = await window.apiClient.call("auth.studentLogin", {
          code_5_digit: code,
          secret: ""
        });

        if (res.ok) {
          window.apiClient.setSession(res.data.session_token, res.data.profile);
          if (res.data.profile.grade) {
            this.currentGrade = res.data.profile.grade;
          }
          if (res.data.profile.academic_year_id) {
            this.currentYearId = res.data.profile.academic_year_id;
          }
          this.showLoggedInView("student", res.data.profile);
        } else {
          errBox.textContent = res.error.message_th || "เข้าสู่ระบบไม่สำเร็จ";
          errBox.style.display = "block";
        }
      } catch (err) {
        errBox.textContent = "ข้อผิดพลาด: " + err.message;
        errBox.style.display = "block";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        this.completeProgress();
        this.refreshIcons();
      }
    },

    async handleTeacherLogin() {
      const secret = document.getElementById("teacher-secret").value.trim();
      const errBox = document.getElementById("auth-error-box");
      const submitBtn = document.getElementById("btn-submit-teacher-login");
      const originalText = submitBtn ? submitBtn.innerHTML : '<span class="btn-text">เข้าสู่ระบบครูผู้สอน</span>';
      errBox.style.display = "none";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-inline"></span> กำลังเข้าสู่ระบบ...';
      }
      this.startProgress();

      try {
        const res = await window.apiClient.call("auth.teacherLogin", {
          auth_secret: secret
        });

        if (res.ok) {
          window.apiClient.setSession(res.data.session_token, res.data.profile);
          this.showLoggedInView("teacher", res.data.profile);
        } else {
          errBox.textContent = res.error.message_th || "เข้าสู่ระบบครูไม่สำเร็จ (กรุณาใช้รหัสผ่าน coolnut1618)";
          errBox.style.display = "block";
        }
      } catch (err) {
        errBox.textContent = "ข้อผิดพลาด: " + err.message;
        errBox.style.display = "block";
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        this.completeProgress();
        this.refreshIcons();
      }
    },

    async handleLogout() {
      try {
        await window.apiClient.call("auth.logout");
      } catch (e) {}
      window.apiClient.clearSession();
      this.showLoginView();
    },

    // --- Student Portal Functions ---

    async loadStudentDashboard() {
      const container = document.getElementById("student-worksheets-container");

      // SWR Cache Check: if cached data exists, render immediately for instant display
      const cacheKey = `PHT_CACHE_DASHBOARD_${this.currentYearId}_${this.currentGrade}`;
      const cached = sessionStorage.getItem(cacheKey);
      let hadCached = false;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.renderStudentDashboard(parsed);
          hadCached = true;
        } catch (e) {}
      }

      if (!hadCached) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-hud)"><span class="spinner-inline"></span> กำลังโหลดข้อมูลใบงานและผลคะแนน...</div>';
      }

      this.startProgress();
      try {
        const res = await window.apiClient.call("student.dashboard", {
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok) {
          if (!hadCached) {
            container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">${res.error.message_th}</div>`;
          }
          return;
        }

        const data = res.data;
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        this.renderStudentDashboard(data);
      } catch (err) {
        if (!hadCached) {
          container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">เกิดข้อผิดพลาด: ${err.message}</div>`;
        }
      } finally {
        this.completeProgress();
        this.refreshIcons();
      }
    },

    renderStudentDashboard(data) {
      const { profile, score_summary, worksheet_summary, worksheet_cards } = data;
      if (profile && !profile.photo_url && profile.student_uid) {
        try {
          const cachedPhoto = localStorage.getItem("PHT_PROFILE_PHOTO_" + profile.student_uid);
          if (cachedPhoto) profile.photo_url = cachedPhoto;
        } catch (e) {}
      }
      this.worksheetCards = worksheet_cards || [];

      // Dynamic Grade Isolation & Year Switcher
      const contextEl = document.getElementById("student-enrollment-context");
      if (contextEl) {
        const enrollments = profile.available_enrollments || [];
        const hasMultipleYears = enrollments.length > 1;

        let yearSelectHtml = "";
        if (hasMultipleYears) {
          yearSelectHtml = `
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:12px;color:var(--text-muted)">เลือกปีการศึกษา:</span>
              <select id="student-year-switcher" class="form-control" style="width:auto;min-height:34px;padding:2px 10px;font-family:var(--font-hud);font-size:12px">
                ${enrollments.map(e => `
                  <option value="${e.academic_year_id}" data-grade="${e.grade}" ${e.academic_year_id === this.currentYearId ? 'selected' : ''}>
                    ปีการศึกษา ${e.year_be} (${e.grade === 'M4' ? 'ม.4' : 'ม.5'})
                  </option>
                `).join("")}
              </select>
            </div>
          `;
        }

        contextEl.innerHTML = `
          <div class="status-badge status-submitted" style="font-size:13px;padding:5px 12px;display:flex;align-items:center;gap:6px">
            <i data-lucide="graduation-cap" style="width:16px;height:16px"></i> ชั้นมัธยมศึกษาปีที่ ${profile.grade === "M4" ? "4" : "5"} (ห้อง ${profile.room || "1"} เลขที่ ${profile.roll_no || "-"})
          </div>
          ${yearSelectHtml}
        `;

        const yearSwitcher = contextEl.querySelector("#student-year-switcher");
        yearSwitcher?.addEventListener("change", (e) => {
          const selectedOption = e.target.selectedOptions[0];
          this.currentYearId = e.target.value;
          this.currentGrade = selectedOption.dataset.grade || "M4";
          this.loadStudentDashboard();
        });
      }

      // Profile banner with student avatar and edit pencil button
      const banner = document.getElementById("student-profile-banner");
      const hasPhoto = Boolean(profile.photo_url);
      const avatarHtml = hasPhoto
        ? `<img src="${profile.photo_url}" alt="Profile Photo" class="student-avatar-img" id="student-profile-avatar-img">`
        : `<div class="student-avatar-placeholder" id="student-profile-avatar-placeholder">
             <i data-lucide="circle-user" style="width:40px;height:40px;color:var(--text-cyan)"></i>
           </div>`;

      banner.innerHTML = `
        <div class="student-profile-card">
          <div class="student-profile-main">
            <div class="student-avatar-container">
              <div class="student-avatar-wrapper" id="student-avatar-click-zone" title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์">
                ${avatarHtml}
                <button type="button" class="student-avatar-edit-btn" id="btn-student-edit-avatar" title="แก้ไขรูปโปรไฟล์ (ดินสอ)" onclick="event.stopPropagation(); window.app.openProfilePhotoModal()">
                  <i data-lucide="pencil" style="width:14px;height:14px"></i>
                </button>
              </div>
            </div>
            <div class="student-profile-info">
              <div class="student-profile-hud-tag">
                <span class="hud-pulse-dot"></span>
                <span>STUDENT PROFILE</span>
              </div>
              <h2 class="student-profile-name">${profile.display_name}</h2>
              <div class="student-profile-meta">
                <span class="meta-item">
                  <i data-lucide="id-card" style="width:14px;height:14px"></i>
                  <span>รหัส <span style="font-family:var(--font-mono);color:var(--cyan-neon);font-weight:700">${profile.code_5_digit}</span></span>
                </span>
                <span class="meta-divider">•</span>
                <span class="meta-item">
                  <i data-lucide="graduation-cap" style="width:14px;height:14px"></i>
                  <span>ม.${profile.grade === "M4" ? "4" : "5"}/${profile.room || "-"} เลขที่ ${profile.roll_no || "-"}</span>
                </span>
                <span class="meta-divider">•</span>
                <span class="meta-item">
                  <i data-lucide="calendar" style="width:14px;height:14px"></i>
                  <span>ปีการศึกษา ${profile.year_be}</span>
                </span>
              </div>
              ${profile.is_out_of_roster ? `
                <div class="student-profile-out-of-roster-tag">
                  <i data-lucide="alert-triangle" style="width:14px;height:14px"></i>
                  <span>อยู่นอกบัญชีทางการของห้องเรียนนี้ (ส่งงานได้ตามปกติ)</span>
                </div>
              ` : ""}
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="window.app.openProfilePhotoModal()" style="display:flex;align-items:center;gap:6px;font-size:12px;padding:6px 12px">
              <i data-lucide="pencil" style="width:13px;height:13px"></i>
              <span>แก้ไขรูป</span>
            </button>
          </div>
        </div>
      `;

      const avatarClickZone = document.getElementById("student-avatar-click-zone");
      if (avatarClickZone) {
        avatarClickZone.onclick = () => this.openProfilePhotoModal();
      }

      // Update header avatar as well
      const headerAvatar = document.getElementById("user-header-avatar");
      if (headerAvatar) {
        if (profile.photo_url) {
          headerAvatar.innerHTML = `<img src="${profile.photo_url}" alt="Avatar">`;
          headerAvatar.style.display = "inline-flex";
        } else {
          headerAvatar.innerHTML = "";
          headerAvatar.style.display = "none";
        }
      }

      // Score Summary Cards
      if (score_summary) {
        document.getElementById("metric-earned-score").textContent = `${score_summary.graded_earned_points} / ${score_summary.reviewed_max_points}`;
        document.getElementById("metric-accumulated-score").textContent = `${score_summary.accumulated_points_capped_100} / 100`;
        document.getElementById("metric-pending-tasks").textContent = `${score_summary.pending_task_count} งาน`;
        document.getElementById("metric-bonus-score").textContent = `+${score_summary.approved_bonus_points}`;
      }

      // Worksheets Summary Progress
      if (worksheet_summary) {
        document.getElementById("progress-bar-fill").style.width = `${worksheet_summary.progress_percent}%`;
        document.getElementById("progress-text").textContent = `ส่งแล้ว ${worksheet_summary.submitted_distinct} จาก 9 ใบงาน (${worksheet_summary.progress_percent}%) | ตรวจแล้ว ${worksheet_summary.graded_distinct} ชุด`;
      }

      // Update Filter Counts
      const countAll = this.worksheetCards.length;
      const countNotSubmitted = this.worksheetCards.filter(c => c.main_status === "not_submitted").length;
      const countSubmitted = this.worksheetCards.filter(c => c.main_status === "submitted").length;
      const countGraded = this.worksheetCards.filter(c => c.main_status === "graded" || c.main_status === "revision_required").length;

      const elAll = document.getElementById("filter-count-all");
      const elNot = document.getElementById("filter-count-not-submitted");
      const elSub = document.getElementById("filter-count-submitted");
      const elGrd = document.getElementById("filter-count-graded");

      if (elAll) elAll.textContent = countAll;
      if (elNot) elNot.textContent = countNotSubmitted;
      if (elSub) elSub.textContent = countSubmitted;
      if (elGrd) elGrd.textContent = countGraded;

      this.applyWorksheetFilter();
    },

    applyWorksheetFilter() {
      const container = document.getElementById("student-worksheets-container");
      container.innerHTML = "";

      let filtered = this.worksheetCards;
      if (this.currentWorksheetFilter === "not_submitted") {
        filtered = this.worksheetCards.filter(c => c.main_status === "not_submitted");
      } else if (this.currentWorksheetFilter === "submitted") {
        filtered = this.worksheetCards.filter(c => c.main_status === "submitted");
      } else if (this.currentWorksheetFilter === "graded") {
        filtered = this.worksheetCards.filter(c => c.main_status === "graded" || c.main_status === "revision_required");
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="card" style="text-align:center;color:var(--text-muted);padding:30px">
            ไม่มีใบงานในหมวดนี้
          </div>
        `;
        return;
      }

      filtered.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "worksheet-card";

        const tasksHtml = card.task_summaries.map(t => `
          <div class="task-item">
            <div>
              <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-cyan)">${t.task_code}</span>: ${t.title}
              ${t.feedback ? `<div style="font-size:12px;color:var(--cyan-neon);margin-top:2px;display:flex;align-items:center;gap:4px"><i data-lucide="message-square" style="width:13px;height:13px"></i> คุณครู: ${t.feedback}</div>` : ""}
            </div>
            <div style="text-align:right">
              ${t.published_points !== null 
                ? `<span style="font-family:var(--font-mono);font-weight:700;color:var(--emerald-bio)">${t.published_points} / ${t.max_points}</span>` 
                : `<span style="font-family:var(--font-mono);color:var(--text-dim);font-size:12px">รอตรวจ (เต็ม ${t.max_points})</span>`}
            </div>
          </div>
        `).join("");

        let actionBtnText = '<i data-lucide="camera"></i> ถ่ายรูป / ส่งใบงาน';
        if (card.main_status === "submitted") {
          actionBtnText = `<i data-lucide="refresh-cw"></i> ส่งภาพเพิ่ม / อัปเดตงาน (v${(card.submission_latest_version_no || 1) + 1})`;
        } else if (card.main_status === "revision_required") {
          actionBtnText = `<i data-lucide="file-edit"></i> ส่งงานที่แก้ไขใหม่ (v${(card.submission_latest_version_no || 1) + 1})`;
        } else if (card.main_status === "graded") {
          actionBtnText = `<i data-lucide="refresh-cw"></i> ปรับปรุงและส่งงานใหม่ (v${(card.submission_latest_version_no || 1) + 1})`;
        }

        cardEl.innerHTML = `
          <div class="worksheet-header">
            <span class="worksheet-code-badge">${card.worksheet_code}</span>
            <div style="display:flex;gap:6px;align-items:center">
              ${card.overdue ? '<span class="badge-overdue">เกินกำหนด</span>' : ""}
              <span class="status-badge status-${card.main_status}">${card.status_label_th}</span>
            </div>
          </div>
          <div class="worksheet-title">${card.title}</div>
          <div class="worksheet-meta">
            <div style="display:flex;align-items:center;gap:6px"><i data-lucide="calendar" style="width:14px;height:14px;color:var(--cyan-neon)"></i> กำหนดส่ง: ${new Date(card.due_at).toLocaleDateString("th-TH")}</div>
            <div style="display:flex;align-items:center;gap:6px"><i data-lucide="clock" style="width:14px;height:14px;color:var(--text-muted)"></i> คาบเรียนที่: ${card.session_range} (ครั้งละ 100 นาที)</div>
            ${card.submission_latest_version_no > 0 ? `<div style="display:flex;align-items:center;gap:6px"><i data-lucide="history" style="width:14px;height:14px;color:var(--emerald-bio)"></i> ประวัติ: ส่งแล้ว ${card.submission_latest_version_no} เวอร์ชัน (ล่าสุด v${card.submission_latest_version_no})</div>` : ""}
          </div>
          <div class="tasks-container">
            <div style="font-weight:700;font-size:12px;color:var(--text-cyan);margin-bottom:6px">
              ภารกิจการประเมิน:
            </div>
            ${tasksHtml}
          </div>
          <div style="margin-top:auto;padding-top:10px">
            <button class="btn btn-primary btn-open-upload" style="width:100%" data-code="${card.worksheet_code}" data-title="${card.title}">
              ${actionBtnText}
            </button>
            ${card.submission_latest_version_no > 0 ? `
              <button class="btn btn-secondary btn-sm btn-view-history" style="width:100%;margin-top:8px" data-code="${card.worksheet_code}" data-title="${card.title}">
                <i data-lucide="history"></i> ดูประวัติการส่งงาน (${card.submission_latest_version_no} เวอร์ชัน)
              </button>
            ` : ""}
          </div>
        `;

        cardEl.querySelector(".btn-open-upload").addEventListener("click", () => {
          this.openUploadModal(card);
        });

        const histBtn = cardEl.querySelector(".btn-view-history");
        if (histBtn) {
          histBtn.addEventListener("click", () => {
            this.openStudentHistoryModal(card.worksheet_code, card.title);
          });
        }

        container.appendChild(cardEl);
      });

      this.refreshIcons();
    },

    // --- Student Sessions & Tab Switcher ---

    switchStudentTab(tab) {
      this.studentActiveTab = tab;
      const btnWorksheets = document.getElementById("btn-student-tab-worksheets");
      const btnSessions = document.getElementById("btn-student-tab-sessions");
      const contentWorksheets = document.getElementById("student-tab-worksheets-content");
      const contentSessions = document.getElementById("student-tab-sessions-content");

      if (tab === "worksheets") {
        btnWorksheets?.classList.add("active");
        btnSessions?.classList.remove("active");
        if (contentWorksheets) contentWorksheets.style.display = "block";
        if (contentSessions) contentSessions.style.display = "none";
      } else {
        btnWorksheets?.classList.remove("active");
        btnSessions?.classList.add("active");
        if (contentWorksheets) contentWorksheets.style.display = "none";
        if (contentSessions) contentSessions.style.display = "block";
        this.loadStudentSessions();
      }
      this.refreshIcons();
    },

    async loadStudentSessions() {
      const container = document.getElementById("student-sessions-container");
      const yearLabel = document.getElementById("student-sessions-year-label");

      const yearBe = this.currentYearId === "yr_2570" ? "2570" : "2569";
      const gradeStr = this.currentGrade === "M5" ? "ม.5" : "ม.4";
      if (yearLabel) {
        yearLabel.textContent = `ปีการศึกษา ${yearBe} (${gradeStr})`;
      }

      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1;font-family:var(--font-hud)"><span class="spinner-inline"></span> กำลังโหลดตารางแผนการเรียน...</div>';
      }

      this.startProgress();
      try {
        let res = await window.apiClient.call("sessions.list", {
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        // Graceful fallback if backend does not yet support sessions.list or returned error
        if (!res || !res.ok) {
          console.warn("[Session Plan] Backend sessions.list not available, using standard curriculum sessions:", res?.error);
          if (window.MockBackend && typeof window.MockBackend.handleApi === "function") {
            res = window.MockBackend.handleApi("sessions.list", {
              academic_year_id: this.currentYearId,
              grade: this.currentGrade
            });
          }
        }

        if (!res || !res.ok) {
          if (container) {
            container.innerHTML = `<div class="card" style="color:var(--crimson-alert);grid-column:1/-1">${res?.error?.message_th || "ไม่สามารถโหลดแผนการเรียนได้"}</div>`;
          }
          return;
        }

        this.studentSessions = res.data.sessions || [];
        this.renderStudentSessions(this.studentSessions);
      } catch (err) {
        if (container) {
          container.innerHTML = `<div class="card" style="color:var(--crimson-alert);grid-column:1/-1">ไม่สามารถโหลดแผนการเรียนได้: ${err.message}</div>`;
        }
      } finally {
        this.completeProgress();
        this.refreshIcons();
      }
    },

    renderStudentSessions(sessions) {
      const container = document.getElementById("student-sessions-container");
      if (!container) return;

      if (!sessions || sessions.length === 0) {
        container.innerHTML = `
          <div class="card" style="text-align:center;padding:30px;color:var(--text-muted);grid-column:1/-1">
            ยังไม่มีข้อมูลแผนการเรียนรู้สำหรับปีการศึกษานี้
          </div>
        `;
        return;
      }

      container.innerHTML = sessions.map(s => {
        let catClass = "badge-cat-lecture";
        let catText = "บรรยายและปฏิบัติการ";
        if (s.category === "lab" || (s.title && s.title.includes("Lab"))) {
          catClass = "badge-cat-lab";
          catText = "ปฏิบัติการทดลอง";
        } else if (s.category === "project" || (s.title && s.title.includes("โครงงาน"))) {
          catClass = "badge-cat-project";
          catText = "โครงงานบูรณาการ";
        }

        let worksheetBtnHtml = "";
        if (s.linked_worksheet_code) {
          const wsNum = s.linked_worksheet_code.replace(/\D/g, "");
          worksheetBtnHtml = `
            <button class="session-worksheet-link-btn" onclick="window.app.jumpToWorksheet('${s.linked_worksheet_code}')">
              <i data-lucide="file-text"></i>
              <span>ใบงานที่ ${parseInt(wsNum, 10) || 1} (${s.linked_worksheet_code})</span>
            </button>
          `;
        }

        return `
          <div class="session-card">
            <div class="session-card-header">
              <span class="session-num-badge">
                <i data-lucide="calendar"></i> ครั้งที่ ${s.session_no}
              </span>
              <span class="session-category-badge ${catClass}">
                ${catText}
              </span>
            </div>
            <div class="session-card-title">${s.title}</div>
            <div class="session-card-desc">${s.description || "ไม่มีรายละเอียดเพิ่มเติม"}</div>
            ${worksheetBtnHtml ? `
              <div class="session-card-footer">
                <span style="color:var(--text-muted);display:flex;align-items:center;gap:4px">
                  <i data-lucide="paperclip" style="width:13px;height:13px"></i> งานมอบหมาย:
                </span>
                ${worksheetBtnHtml}
              </div>
            ` : ""}
          </div>
        `;
      }).join("");

      this.refreshIcons();
    },

    jumpToWorksheet(worksheetCode) {
      this.switchStudentTab("worksheets");
      const allFilterChip = document.querySelector(".filter-chip[data-filter='all']");
      if (allFilterChip) {
        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        allFilterChip.classList.add("active");
        this.currentWorksheetFilter = "all";
        this.applyWorksheetFilter();
      }

      setTimeout(() => {
        const cards = document.querySelectorAll(".worksheet-card");
        for (const card of cards) {
          if (card.innerHTML.includes(worksheetCode)) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.style.transition = "all 0.4s ease";
            card.style.borderColor = "var(--cyan-neon)";
            card.style.boxShadow = "0 0 25px var(--cyan-glow)";
            setTimeout(() => {
              card.style.borderColor = "";
              card.style.boxShadow = "";
            }, 2500);
            break;
          }
        }
      }, 150);
    },

    filterStudentSessions(query) {
      if (!this.studentSessions) return;
      const q = String(query || "").trim().toLowerCase();
      if (!q) {
        this.renderStudentSessions(this.studentSessions);
        return;
      }

      const filtered = this.studentSessions.filter(s => {
        const numMatch = String(s.session_no).includes(q) || `ครั้งที่ ${s.session_no}`.toLowerCase().includes(q);
        const titleMatch = (s.title || "").toLowerCase().includes(q);
        const descMatch = (s.description || "").toLowerCase().includes(q);
        const wsMatch = (s.linked_worksheet_code || "").toLowerCase().includes(q);
        return numMatch || titleMatch || descMatch || wsMatch;
      });

      this.renderStudentSessions(filtered);
    },

    openUploadModal(card) {
      this.selectedWorksheet = card;
      this.selectedUploadFiles = [];
      const titleEl = document.getElementById("modal-upload-title");
      if (titleEl) {
        titleEl.innerHTML = `<i data-lucide="file-up" style="color:var(--cyan-neon)"></i> ส่งใบงาน: ${card.worksheet_code}`;
      }
      document.getElementById("modal-upload-subtitle").textContent = card.title;
      document.getElementById("upload-note").value = "";
      document.getElementById("upload-previews-container").innerHTML = "";
      document.getElementById("upload-progress-box").style.display = "none";
      document.getElementById("upload-compression-status").style.display = "none";
      document.getElementById("btn-submit-upload").disabled = false;
      this.updateUploadCountLabel();

      const camInput = document.getElementById("upload-camera-input");
      const fileInput = document.getElementById("upload-file-input");
      if (camInput) camInput.value = "";
      if (fileInput) fileInput.value = "";

      document.getElementById("modal-upload").style.display = "flex";
      this.refreshIcons();
    },

    closeUploadModal() {
      document.getElementById("modal-upload").style.display = "none";
      this.selectedWorksheet = null;
      this.selectedUploadFiles = [];
    },

    updateUploadCountLabel() {
      const countLabel = document.getElementById("upload-count-label");
      if (countLabel) {
        countLabel.textContent = `${this.selectedUploadFiles.length} หน้า`;
      }
    },

    async handleFileSelection(files) {
      if (!files || files.length === 0) return;

      const compStatus = document.getElementById("upload-compression-status");
      if (compStatus) compStatus.style.display = "flex";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.selectedUploadFiles.length >= 5) {
          this.showToast("สามารถส่งภาพได้สูงสุด 5 หน้าต่อใบงานครับ", "info");
          break;
        }

        try {
          const comp = await this.compressImage(file);
          this.selectedUploadFiles.push(comp);
        } catch (err) {
          console.error("Compression error:", err);
          this.showToast("เกิดข้อผิดพลาดในการประมวลผลภาพ: " + err.message, "error");
        }
      }

      if (compStatus) compStatus.style.display = "none";
      this.renderSelectedPreviews();
    },

    /**
     * Client-side Image Compression Strictly Within A4 Document Dimensions
     * Standard A4 at 150 DPI: 1240 x 1754 px (portrait) or 1754 x 1240 px (landscape)
     */
    compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ภาพได้"));
        reader.onload = (e) => {
          const img = new Image();
          img.onerror = () => reject(new Error("ไฟล์ภาพไม่ถูกต้อง"));
          img.onload = () => {
            const origW = img.naturalWidth || img.width;
            const origH = img.naturalHeight || img.height;

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

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, w, h);

            let quality = 0.80;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);
            let approxBytes = Math.round((dataUrl.length * 3) / 4);

            if (approxBytes > 650 * 1024) {
              quality = 0.72;
              dataUrl = canvas.toDataURL("image/jpeg", quality);
              approxBytes = Math.round((dataUrl.length * 3) / 4);
            }

            const origBytes = file.size || approxBytes;
            const savedPct = Math.max(0, Math.round(((origBytes - approxBytes) / origBytes) * 100));

            resolve({
              name: file.name,
              mime: "image/jpeg",
              base64: dataUrl,
              size: approxBytes,
              origSize: origBytes,
              width: w,
              height: h,
              origWidth: origW,
              origHeight: origH,
              savedPercent: savedPct
            });
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    },

    renderSelectedPreviews() {
      const container = document.getElementById("upload-previews-container");
      container.innerHTML = "";
      this.updateUploadCountLabel();

      this.selectedUploadFiles.forEach((file, index) => {
        const card = document.createElement("div");
        card.className = "preview-card";
        const sizeKb = Math.round(file.size / 1024);

        card.innerHTML = `
          <div class="preview-page-badge">หน้า ${index + 1}</div>
          <div class="preview-thumb-container">
            <img src="${file.base64}" alt="${file.name}">
            <span class="preview-zoom-hint"><i data-lucide="zoom-in" style="width:13px;height:13px"></i> แตะเพื่อดูรูปขยาย</span>
          </div>
          <div class="preview-info">
            <div class="preview-dim">A4: ${file.width}×${file.height} px</div>
            <div class="preview-size">
              <span>${sizeKb} KB</span>
              ${file.savedPercent > 0 ? `<span class="preview-saved">(ลดลง ${file.savedPercent}%)</span>` : ''}
            </div>
          </div>
          <button type="button" class="btn-remove-photo" data-index="${index}"><i data-lucide="trash-2" style="width:13px;height:13px"></i> ลบภาพนี้</button>
        `;

        card.querySelector(".preview-thumb-container").addEventListener("click", () => {
          this.previewLightbox(file.base64, `หน้า ${index + 1} (A4: ${file.width}×${file.height})`);
        });

        card.querySelector(".btn-remove-photo").addEventListener("click", (e) => {
          e.stopPropagation();
          this.selectedUploadFiles.splice(index, 1);
          this.renderSelectedPreviews();
        });

        container.appendChild(card);
      });

      this.refreshIcons();
    },

    previewLightbox(src, title) {
      const modal = document.getElementById("modal-image-preview");
      const titleEl = document.getElementById("preview-image-title");
      const imgEl = document.getElementById("preview-image-el");

      titleEl.innerHTML = `<i data-lucide="zoom-in" style="width:15px;height:15px"></i> ${title || "ภาพใบงาน"}`;
      imgEl.src = src;
      modal.style.display = "flex";
      this.refreshIcons();
    },

    /**
     * High-Performance Single-Roundtrip Batch Submission with Visual Multi-Step Progress Bar
     */
    async submitUpload() {
      if (this.selectedUploadFiles.length === 0) {
        this.showToast("กรุณาถ่ายภาพหรือเลือกรูปใบงานอย่างน้อย 1 ภาพครับ", "info");
        return;
      }

      const progressBox = document.getElementById("upload-progress-box");
      const progressText = document.getElementById("upload-progress-text");
      const progressPercent = document.getElementById("upload-progress-percent");
      const progressBar = document.getElementById("upload-progress-bar-fill");
      const submitBtn = document.getElementById("btn-submit-upload");

      const badge1 = document.getElementById("step-badge-1");
      const badge2 = document.getElementById("step-badge-2");
      const badge3 = document.getElementById("step-badge-3");

      progressBox.style.display = "block";
      submitBtn.disabled = true;

      const setStep = (step, pct, text) => {
        if (progressText) progressText.textContent = text;
        if (progressPercent) progressPercent.textContent = `${pct}%`;
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (this.setProgress) this.setProgress(pct);

        if (badge1 && badge2 && badge3) {
          badge1.className = step >= 1 ? (step > 1 ? "step-badge done" : "step-badge active") : "step-badge";
          badge2.className = step >= 2 ? (step > 2 ? "step-badge done" : "step-badge active") : "step-badge";
          badge3.className = step >= 3 ? "step-badge done" : "step-badge";
        }
      };

      try {
        setStep(1, 25, "กำลังเตรียมข้อมูลและจัดรูปแบบ A4...");
        await new Promise(r => setTimeout(r, 120));

        const note = document.getElementById("upload-note").value.trim();
        const filesPayload = this.selectedUploadFiles.map((file, i) => ({
          file_name: `page_${i + 1}_${file.name}`,
          mime_type: file.mime,
          file_base64: file.base64
        }));

        setStep(2, 60, `กำลังส่งข้อมูลภาพและใบงาน (${filesPayload.length} หน้า)...`);

        let batchSuccess = false;
        try {
          const batchRes = await window.apiClient.call("submissions.submitBatch", {
            worksheet_code: this.selectedWorksheet.worksheet_code,
            academic_year_id: this.currentYearId,
            grade: this.currentGrade,
            note: note,
            files: filesPayload
          });
          if (batchRes && batchRes.ok) {
            batchSuccess = true;
          }
        } catch (e) {
          console.warn("submitBatch failed, falling back to legacy multi-step upload:", e);
        }

        // Fallback to legacy begin -> uploadEvidence -> complete if batch is not supported
        if (!batchSuccess) {
          setStep(2, 35, "กำลังเชื่อมต่อระบบอัปโหลด...");
          const beginRes = await window.apiClient.call("submissions.begin", {
            worksheet_code: this.selectedWorksheet.worksheet_code,
            academic_year_id: this.currentYearId,
            grade: this.currentGrade
          });
          if (!beginRes.ok) throw new Error(beginRes.error.message_th);
          const opId = beginRes.data.upload_op_id;

          for (let i = 0; i < this.selectedUploadFiles.length; i++) {
            const pct = Math.round(35 + ((i + 1) / this.selectedUploadFiles.length) * 45);
            setStep(2, pct, `กำลังอัปโหลดภาพที่ ${i + 1} จาก ${this.selectedUploadFiles.length} หน้า...`);
            const file = this.selectedUploadFiles[i];
            const upRes = await window.apiClient.call("submissions.uploadEvidence", {
              upload_op_id: opId,
              file_name: `page_${i + 1}_${file.name}`,
              mime_type: file.mime,
              file_base64: file.base64
            });
            if (!upRes.ok) throw new Error(upRes.error.message_th);
          }

          setStep(3, 85, "กำลังบันทึกข้อมูลและออกหลักฐาน...");
          const compRes = await window.apiClient.call("submissions.complete", {
            upload_op_id: opId,
            worksheet_code: this.selectedWorksheet.worksheet_code,
            academic_year_id: this.currentYearId,
            grade: this.currentGrade,
            note: note
          });
          if (!compRes.ok) throw new Error(compRes.error.message_th);
        }

        setStep(3, 100, "ส่งใบงานสำเร็จเรียบร้อยแล้ว!");
        this.showToast("ส่งใบงานสำเร็จเรียบร้อยแล้ว!", "success");
        setTimeout(() => {
          this.closeUploadModal();
          this.loadStudentDashboard();
        }, 600);

      } catch (err) {
        if (progressText) progressText.textContent = "เกิดข้อผิดพลาด: " + err.message;
        this.showToast("เกิดข้อผิดพลาดในการส่งงาน: " + err.message, "error");
        submitBtn.disabled = false;
      }
    },

    // --- Teacher Workspace Functions ---

    async loadTeacherMatrix() {
      const container = document.getElementById("teacher-matrix-wrapper");
      container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-hud)"><span class="spinner-inline"></span> กำลังโหลดข้อมูลสมุดคะแนน...</div>';
      this.startProgress();

      try {
        const res = await window.apiClient.call("teacher.gradebookMatrix", {
          academic_year_id: this.currentYearId,
          grade: this.currentGrade,
          room: this.currentRoom
        });

        if (!res.ok) {
          container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">${res.error.message_th}</div>`;
          return;
        }

        this.renderTeacherMatrix(res.data);
      } catch (err) {
        container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">เกิดข้อผิดพลาด: ${err.message}</div>`;
      } finally {
        this.completeProgress();
        this.refreshIcons();
      }
    },

    renderTeacherMatrix(data) {
      const { worksheets_header, rows } = data;
      const container = document.getElementById("teacher-matrix-wrapper");

      if (!this.selectedTrackerWs || !worksheets_header.some(w => w.code === this.selectedTrackerWs)) {
        this.selectedTrackerWs = worksheets_header[0] ? worksheets_header[0].code : "";
      }

      const getTrackerHtml = (wsCode) => {
        const wsInfo = worksheets_header.find(w => w.code === wsCode) || worksheets_header[0];
        const submittedStudents = [];
        const missingStudents = [];

        rows.forEach(r => {
          const cell = r.worksheet_cells.find(c => c.worksheet_code === wsCode);
          if (cell && cell.main_status !== "not_submitted") {
            submittedStudents.push(r);
          } else {
            missingStudents.push(r);
          }
        });

        const missingPills = missingStudents.map(s => `
          <span class="missing-pill" title="รหัส ${s.code_5_digit}">
            เลขที่ ${s.roll_no} ${s.display_name}
          </span>
        `).join("");

        return `
          <div class="card" style="padding:16px 20px;margin-bottom:20px;background:rgba(15,23,42,0.9);border:1px solid var(--border-glass)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:8px">
                <i data-lucide="folder-check" style="color:var(--cyan-neon);width:18px;height:18px"></i>
                <span style="font-family:var(--font-hud);font-weight:700;color:var(--text-cyan);font-size:14px">
                  ติดตามการส่งงาน: ${wsInfo ? wsInfo.title || wsInfo.code : wsCode}
                </span>
                <span style="font-size:12px;color:var(--text-muted);margin-left:8px">
                  (ส่งแล้ว ${submittedStudents.length} / ${rows.length} คน)
                </span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <label for="select-tracker-ws" style="font-size:12px;color:var(--text-muted)">เลือกใบงาน:</label>
                <select id="select-tracker-ws" class="form-control" style="min-height:34px;padding:2px 10px;width:140px;font-family:var(--font-hud);font-size:12px">
                  ${worksheets_header.map(ws => `<option value="${ws.code}" ${ws.code === wsCode ? 'selected' : ''}>${ws.code}</option>`).join("")}
                </select>
              </div>
            </div>

            <div style="margin-top:10px">
              ${missingStudents.length === 0 ? `
                <div style="color:var(--emerald-bio);font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px">
                  <i data-lucide="sparkles" style="color:var(--emerald-bio);width:16px;height:16px"></i> ทุกคนในห้องเรียนส่งใบงานนี้ครบถ้วนแล้ว (${rows.length} คน)
                </div>
              ` : `
                <div style="font-size:13px;color:#fb7185;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                  <i data-lucide="alert-circle" style="color:#fb7185;width:16px;height:16px"></i> เลขที่ที่ยังขาดส่ง (${missingStudents.length} คน):
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;max-height:160px;overflow-y:auto;padding:8px;background:rgba(10,15,30,0.6);border-radius:var(--radius-sm)">
                  ${missingPills}
                </div>
              `}
            </div>
          </div>
        `;
      };

      const thWorksheets = worksheets_header.map(ws => `
        <th title="${ws.title}" style="text-align:center">${ws.code}</th>
      `).join("");

      const rowsHtml = rows.map(r => {
        const cellsHtml = r.worksheet_cells.map(cell => `
          <td style="text-align:center">
            <button class="status-badge status-${cell.main_status} btn-grade-cell" 
                    data-student-uid="${r.student_uid}" 
                    data-student-name="${r.display_name}"
                    data-worksheet="${cell.worksheet_code}"
                    data-submission-id="${cell.submission_id || ''}">
              ${cell.status_label_th}
            </button>
          </td>
        `).join("");

        return `
          <tr>
            <td class="sticky-col" style="font-family:var(--font-mono);font-weight:700;color:var(--cyan-neon)">${r.roll_no}</td>
            <td style="font-family:var(--font-mono)">${r.code_5_digit}</td>
            <td style="font-weight:600">${r.display_name}</td>
            <td style="text-align:center">${r.room}</td>
            ${cellsHtml}
            <td style="font-family:var(--font-mono);font-weight:700;color:var(--cyan-neon);text-align:center">${r.cumulative_points} / 100</td>
            <td style="font-family:var(--font-mono);text-align:center;color:var(--emerald-bio)">+${r.bonus_points}</td>
            <td style="font-family:var(--font-mono);text-align:center">${r.submitted_count} / 9</td>
          </tr>
        `;
      }).join("");

      container.innerHTML = `
        ${getTrackerHtml(this.selectedTrackerWs)}
        <div class="matrix-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="sticky-col">เลขที่</th>
                <th>รหัส</th>
                <th>ชื่อ-สกุล</th>
                <th style="text-align:center">ห้อง</th>
                ${thWorksheets}
                <th style="text-align:center">รวม (เต็ม 100)</th>
                <th style="text-align:center">โบนัส</th>
                <th style="text-align:center">ส่งแล้ว</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      // Bind tracker select change
      document.getElementById("select-tracker-ws")?.addEventListener("change", (e) => {
        this.selectedTrackerWs = e.target.value;
        this.renderTeacherMatrix(data);
      });

      // Bind click on cells to open teacher grading modal
      container.querySelectorAll(".btn-grade-cell").forEach(btn => {
        btn.addEventListener("click", () => {
          this.openGradingModal({
            student_uid: btn.dataset.studentUid,
            student_name: btn.dataset.studentName,
            worksheet_code: btn.dataset.worksheet,
            submission_id: btn.dataset.submissionId
          });
        });
      });

      this.refreshIcons();
    },

    async openGradingModal(ctx) {
      this.gradingContext = ctx;
      document.getElementById("modal-grading-title").innerHTML = `<i data-lucide="clipboard-check" style="color:var(--cyan-neon)"></i> ตรวจและให้คะแนนใบงาน: ${ctx.worksheet_code} (${ctx.student_name})`;
      document.getElementById("grading-task-code").value = ctx.worksheet_code.replace("W", "T");
      document.getElementById("grading-points").value = "";
      document.getElementById("grading-feedback").value = "";
      document.getElementById("grading-reason").value = "";
      document.getElementById("modal-grading").style.display = "flex";

      const selectEl = document.getElementById("grading-version-select");
      const timestampEl = document.getElementById("grading-version-timestamp");
      const noteEl = document.getElementById("grading-version-note");
      const filesEl = document.getElementById("grading-version-files");

      if (selectEl) selectEl.innerHTML = `<option value="">กำลังโหลดประวัติผลงาน...</option>`;
      if (timestampEl) timestampEl.innerHTML = `<i data-lucide="calendar" style="width:14px;height:14px"></i> กำลังโหลดประวัติผลงาน...`;
      if (noteEl) noteEl.innerHTML = `<i data-lucide="message-square" style="width:14px;height:14px"></i> บันทึกจากนักเรียน: -`;
      if (filesEl) filesEl.innerHTML = "";

      this.refreshIcons();

      try {
        const res = await window.apiClient.call("submissions.history", {
          student_uid: ctx.student_uid,
          worksheet_code: ctx.worksheet_code,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok || !res.data || !res.data.versions || res.data.versions.length === 0) {
          if (selectEl) selectEl.innerHTML = `<option value="">ยังไม่มีข้อมูลการส่งงาน</option>`;
          if (timestampEl) timestampEl.innerHTML = `<i data-lucide="calendar" style="width:14px;height:14px"></i> ยังไม่มีข้อมูลการส่งงานสำหรับใบงานนี้`;
          if (noteEl) noteEl.innerHTML = `<i data-lucide="message-square" style="width:14px;height:14px"></i> ยังไม่มีบันทึก`;
          if (filesEl) filesEl.innerHTML = `<span style="font-size:12px;color:var(--text-dim)">ไม่มีไฟล์แนบ</span>`;
          this.refreshIcons();
          return;
        }

        const versions = res.data.versions;
        this.gradingVersions = versions;

        if (selectEl) {
          selectEl.innerHTML = versions.map((v, idx) => `
            <option value="${v.version_no}" ${idx === 0 ? 'selected' : ''}>
              v${v.version_no} ${idx === 0 ? '(ล่าสุด)' : '(เก่า)'} - ${new Date(v.submitted_at).toLocaleDateString('th-TH')}
            </option>
          `).join("");
        }

        const renderVersion = (verNo) => {
          const v = versions.find(item => String(item.version_no) === String(verNo)) || versions[0];
          if (timestampEl) {
            timestampEl.innerHTML = `<i data-lucide="calendar" style="width:14px;height:14px"></i> <strong>ส่งเมื่อ:</strong> ${new Date(v.submitted_at).toLocaleString('th-TH')} <span style="margin-left:8px;padding:2px 8px;border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;background:${v.version_no === versions[0].version_no ? 'rgba(56,189,248,0.2);color:#38bdf8' : 'rgba(148,163,184,0.2);color:#94a3b8'}">Version ${v.version_no}</span>`;
          }
          if (noteEl) {
            noteEl.innerHTML = `<i data-lucide="message-square" style="width:14px;height:14px"></i> <strong>บันทึกจากนักเรียน:</strong> ${v.note ? v.note : '<em style="color:var(--text-dim)">(ไม่มีข้อความ)</em>'}`;
          }

          if (filesEl) {
            if (!v.files || v.files.length === 0) {
              filesEl.innerHTML = `<span style="font-size:12px;color:var(--text-dim)">ไม่มีไฟล์แนบในเวอร์ชันนี้</span>`;
            } else {
              filesEl.innerHTML = v.files.map(f => `
                <div class="evidence-thumb" style="width:76px;height:76px;border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.4);cursor:pointer;position:relative" data-evidence-id="${f.evidence_id}" title="คลิกเพื่อดูภาพขยาย">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(30,41,59,0.8);color:var(--cyan-neon)">
                    <i data-lucide="file-text" style="width:24px;height:24px"></i>
                  </div>
                </div>
              `).join("");

              filesEl.querySelectorAll(".evidence-thumb").forEach(thumb => {
                const evId = thumb.dataset.evidenceId;
                this.loadThumbnailPreview(thumb, evId);
                thumb.addEventListener("click", () => {
                  this.openImagePreview(evId, `${ctx.worksheet_code} (v${v.version_no}) - ${ctx.student_name}`);
                });
              });
            }
          }
          this.refreshIcons();
        };

        renderVersion(versions[0].version_no);

        if (selectEl) {
          selectEl.addEventListener("change", (e) => {
            renderVersion(e.target.value);
          });
        }

      } catch (err) {
        if (timestampEl) timestampEl.textContent = "เกิดข้อผิดพลาดในการโหลดประวัติ: " + err.message;
      }
    },

    async openStudentHistoryModal(worksheetCode, title) {
      document.getElementById("modal-history-title").innerHTML = `<i data-lucide="history" style="color:var(--cyan-neon)"></i> ประวัติการส่งงาน: ${worksheetCode} - ${title}`;
      const timelineEl = document.getElementById("student-history-timeline");
      timelineEl.innerHTML = `<div style="text-align:center;color:var(--text-cyan);padding:24px;font-family:var(--font-hud)"><span class="spinner-inline"></span> กำลังโหลดประวัติผลงาน...</div>`;
      document.getElementById("modal-student-history").style.display = "flex";
      this.refreshIcons();

      try {
        const res = await window.apiClient.call("submissions.history", {
          worksheet_code: worksheetCode,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok || !res.data || !res.data.versions || res.data.versions.length === 0) {
          timelineEl.innerHTML = `<div style="text-align:center;color:var(--text-dim);padding:24px">ยังไม่มีประวัติการส่งงานสำหรับใบงานนี้</div>`;
          return;
        }

        const versions = res.data.versions;
        timelineEl.innerHTML = versions.map((v, idx) => `
          <div style="background:rgba(15,23,42,0.7);border:1px solid ${idx === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(148,163,184,0.18)'};border-radius:10px;padding:14px;position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-family:var(--font-mono);font-weight:700;font-size:13px;color:${idx === 0 ? 'var(--cyan-neon)' : 'var(--text-muted)'}">
                ${idx === 0 ? 'Version ' + v.version_no + ' (ล่าสุด)' : 'Version ' + v.version_no}
              </span>
              <span style="font-size:12px;color:var(--text-dim);display:flex;align-items:center;gap:4px">
                <i data-lucide="calendar" style="width:13px;height:13px"></i> ${new Date(v.submitted_at).toLocaleString('th-TH')}
              </span>
            </div>
            ${v.note ? `
              <div style="font-size:13px;color:#e2e8f0;margin-bottom:10px;background:rgba(2,132,199,0.06);padding:8px 12px;border-radius:6px;display:flex;align-items:center;gap:6px">
                <i data-lucide="message-square" style="width:14px;height:14px"></i> <strong>บันทึก:</strong> ${v.note}
              </div>
            ` : ""}
            <div style="font-size:12px;color:var(--text-cyan);font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px">
              <i data-lucide="image" style="width:14px;height:14px"></i> รูปภาพผลงาน (${v.files.length} รูป):
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${v.files.map(f => `
                <div class="evidence-thumb" style="width:72px;height:72px;border-radius:6px;overflow:hidden;border:1px solid rgba(56,189,248,0.3);cursor:pointer;position:relative" data-evidence-id="${f.evidence_id}" title="คลิกเพื่อดูภาพขยาย">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(30,41,59,0.8);color:var(--cyan-neon)">
                    <i data-lucide="file-text" style="width:22px;height:22px"></i>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("");

        timelineEl.querySelectorAll(".evidence-thumb").forEach(thumb => {
          const evId = thumb.dataset.evidenceId;
          this.loadThumbnailPreview(thumb, evId);
          thumb.addEventListener("click", () => {
            this.openImagePreview(evId, `ใบงาน ${worksheetCode}`);
          });
        });

        this.refreshIcons();

      } catch (err) {
        timelineEl.innerHTML = `<div style="color:var(--crimson-alert);padding:20px">เกิดข้อผิดพลาด: ${err.message}</div>`;
      }
    },

    closeHistoryModal() {
      document.getElementById("modal-student-history").style.display = "none";
    },

    async loadThumbnailPreview(containerEl, evidenceId) {
      try {
        const res = await window.apiClient.call("evidence.preview", { evidence_id: evidenceId });
        if (res.ok && (res.data.data_url || res.data.file_base64)) {
          const src = res.data.data_url || `data:${res.data.mime_type || 'image/jpeg'};base64,${res.data.file_base64}`;
          containerEl.innerHTML = `<img src="${src}" alt="thumb" style="width:100%;height:100%;object-fit:cover">`;
        }
      } catch (e) {}
    },

    async openImagePreview(evidenceId, title) {
      const modal = document.getElementById("modal-image-preview");
      const titleEl = document.getElementById("preview-image-title");
      const imgEl = document.getElementById("preview-image-el");

      titleEl.innerHTML = `<i data-lucide="zoom-in" style="width:15px;height:15px"></i> รูปภาพผลงาน: ${title || ''}`;
      imgEl.src = "";
      modal.style.display = "flex";
      this.refreshIcons();

      try {
        const res = await window.apiClient.call("evidence.preview", { evidence_id: evidenceId });
        if (res.ok && (res.data.data_url || res.data.file_base64)) {
          imgEl.src = res.data.data_url || `data:${res.data.mime_type || 'image/jpeg'};base64,${res.data.file_base64}`;
        } else {
          this.showToast("ไม่สามารถแสดงรูปภาพได้: " + (res.error?.message_th || "ไม่พบรูปภาพ"), "error");
          modal.style.display = "none";
        }
      } catch (err) {
        this.showToast("เกิดข้อผิดพลาดในการโหลดรูปภาพ: " + err.message, "error");
        modal.style.display = "none";
      }
    },

    closeGradingModal() {
      document.getElementById("modal-grading").style.display = "none";
      this.gradingContext = null;
    },

    async submitPublishGrade() {
      const points = parseFloat(document.getElementById("grading-points").value);
      if (isNaN(points)) {
        this.showToast("กรุณาระบุคะแนนที่ถูกต้อง", "info");
        return;
      }

      const pointsInt = Math.round(points * 100);
      const feedback = document.getElementById("grading-feedback").value.trim();
      const reason = document.getElementById("grading-reason").value.trim();

      try {
        const res = await window.apiClient.call("teacher.publishGrade", {
          student_uid: this.gradingContext.student_uid,
          syllabus_version_id: `syl_${this.currentGrade.toLowerCase()}_${this.currentYearId.replace('yr_', '')}_v1`,
          task_code: "T4-01",
          points_int: pointsInt,
          feedback: feedback,
          reason: reason
        });

        if (res.ok) {
          this.showToast("เผยแพร่คะแนนเรียบร้อยแล้ว", "success");
          this.closeGradingModal();
          this.loadTeacherMatrix();
        } else {
          this.showToast("เกิดข้อผิดพลาด: " + res.error.message_th, "error");
        }
      } catch (err) {
        this.showToast("เกิดข้อผิดพลาด: " + err.message, "error");
      }
    },

    async submitRequestRevision() {
      if (!this.gradingContext.submission_id) {
        this.showToast("นักเรียนยังไม่ได้ส่งงานนี้ ไม่สามารถขอแก้ไขได้", "info");
        return;
      }

      const feedback = document.getElementById("grading-feedback").value.trim();
      if (!feedback) {
        this.showToast("กรุณาระบุคำแนะนำสิ่งที่ต้องการให้นักเรียนแก้ไข (feedback)", "info");
        return;
      }

      try {
        const res = await window.apiClient.call("teacher.requestRevision", {
          submission_id: this.gradingContext.submission_id,
          feedback: feedback
        });

        if (res.ok) {
          this.showToast("ส่งคำขอแก้ไขงานไปยังนักเรียนเรียบร้อยแล้ว", "success");
          this.closeGradingModal();
          this.loadTeacherMatrix();
        } else {
          this.showToast("เกิดข้อผิดพลาด: " + res.error.message_th, "error");
        }
      } catch (err) {
        this.showToast("เกิดข้อผิดพลาด: " + err.message, "error");
      }
    },

    downloadRosterTemplate() {
      const csv = "\uFEFFcode_5_digit,display_name,grade,room,roll_no\r\n17763,นายพิพัฒน์ จุลบุตร,M5,1,1\r\n17808,นายอโณทัย จรัญไชยกุล,M5,1,2\r\n17837,นายชัชพงษ์ ไชยา,M5,1,3";
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_enrollment_template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    openImportRosterModal() {
      const modal = document.getElementById("modal-import-roster");
      if (modal) {
        document.getElementById("import-status-box").style.display = "none";
        document.getElementById("import-csv-text").value = "";
        document.getElementById("import-csv-file").value = "";
        modal.style.display = "flex";
        this.refreshIcons();
      }
    },

    parseRosterCsv(text) {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return [];
      const rawHeaders = lines[0].split(",").map(h => h.trim().replace(/^[\uFEFF"']+|["']+$/g, ""));

      const headers = rawHeaders.map(h => {
        const lower = h.toLowerCase();
        if (lower.includes("code") || lower.includes("ประจำตัว") || lower.includes("รหัส")) return "code_5_digit";
        if (lower.includes("display") || lower.includes("ชื่อ - นามสกุล") || lower.includes("ชื่อ-นามสกุล") || lower.includes("ชื่อและนามสกุล") || lower.includes("ชื่อ - สกุล") || lower.includes("ชื่อ-สกุล")) return "display_name";
        if (lower.includes("title") || lower.includes("คำนำหน้า")) return "title";
        if (lower.includes("fname") || lower.includes("first") || lower === "ชื่อ") return "first_name";
        if (lower.includes("lname") || lower.includes("last") || lower === "นามสกุล") return "last_name";
        if (lower.includes("grade") || lower.includes("ชั้น") || lower.includes("ระดับ")) return "grade";
        if (lower.includes("room") || lower.includes("ห้อง")) return "room";
        if (lower.includes("roll") || lower.includes("ที่") || lower.includes("เลขที่")) return "roll_no";
        return lower;
      });

      const students = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",").map(p => p.trim().replace(/^["']+|["']+$/g, ""));
        const row = {};
        headers.forEach((h, idx) => {
          if (h) row[h] = parts[idx] !== undefined ? parts[idx] : "";
        });
        if (row.code_5_digit) {
          students.push(row);
        }
      }
      return students;
    },

    async submitImportRoster() {
      const yearBe = document.getElementById("import-year-be").value.trim();
      const csvText = document.getElementById("import-csv-text").value.trim();
      const statusBox = document.getElementById("import-status-box");

      if (!csvText) {
        statusBox.style.display = "block";
        statusBox.style.background = "rgba(244,63,94,0.2)";
        statusBox.style.color = "#fb7185";
        statusBox.textContent = "โปรดเลือกไฟล์ CSV หรือวางข้อความข้อมูลนักเรียนก่อนกดนำเข้า";
        return;
      }

      const students = this.parseRosterCsv(csvText);
      if (students.length === 0) {
        statusBox.style.display = "block";
        statusBox.style.background = "rgba(244,63,94,0.2)";
        statusBox.style.color = "#fb7185";
        statusBox.textContent = "ไม่พบข้อมูลแถวนักเรียนที่ถูกต้องในไฟล์ CSV (ต้องมีรหัสนักเรียน 5 หลัก)";
        return;
      }

      statusBox.style.display = "block";
      statusBox.style.background = "rgba(2,132,199,0.2)";
      statusBox.style.color = "#38bdf8";
      statusBox.textContent = `กำลังนำเข้าข้อมูลนักเรียน ${students.length} คน สำหรับปีการศึกษา ${yearBe}...`;

      try {
        const res = await window.apiClient.call("teacher.importRoster", {
          year_be: parseInt(yearBe, 10),
          students: students
        });

        if (res.ok) {
          statusBox.style.background = "rgba(16,185,129,0.2)";
          statusBox.style.color = "#34d399";
          statusBox.textContent = `สำเร็จ! ${res.data.message_th} (นักเรียนใหม่: ${res.data.new_students || 0}, นักเรียนเดิมเลื่อนชั้น: ${res.data.existing_students || 0})`;

          const yrSelect = document.getElementById("teacher-year-select");
          const yrValue = `yr_${yearBe}`;
          if (!Array.from(yrSelect.options).some(o => o.value === yrValue)) {
            const opt = document.createElement("option");
            opt.value = yrValue;
            opt.textContent = `ปีการศึกษา ${yearBe}`;
            yrSelect.appendChild(opt);
          }
          yrSelect.value = yrValue;
          this.currentYearId = yrValue;

          setTimeout(() => {
            document.getElementById("modal-import-roster").style.display = "none";
            this.loadTeacherMatrix();
          }, 1500);
        } else {
          statusBox.style.background = "rgba(244,63,94,0.2)";
          statusBox.style.color = "#fb7185";
          statusBox.textContent = res.error.message_th || "การนำเข้าล้มเหลว";
        }
      } catch (err) {
        statusBox.style.background = "rgba(244,63,94,0.2)";
        statusBox.style.color = "#fb7185";
        statusBox.textContent = "เกิดข้อผิดพลาด: " + err.message;
      }
    },

    // --- Teacher Workspace Sessions Manager ---

    switchTeacherTab(tab) {
      this.teacherActiveTab = tab;
      const btnGradebook = document.getElementById("btn-teacher-tab-gradebook");
      const btnSessions = document.getElementById("btn-teacher-tab-sessions");
      const contentGradebook = document.getElementById("teacher-tab-gradebook-content");
      const contentSessions = document.getElementById("teacher-tab-sessions-content");

      if (tab === "gradebook") {
        btnGradebook?.classList.add("active");
        btnSessions?.classList.remove("active");
        if (contentGradebook) contentGradebook.style.display = "block";
        if (contentSessions) contentSessions.style.display = "none";
      } else {
        btnGradebook?.classList.remove("active");
        btnSessions?.classList.add("active");
        if (contentGradebook) contentGradebook.style.display = "none";
        if (contentSessions) contentSessions.style.display = "block";
        
        // Synchronize filters with current teacher workspace selections
        const sessYr = document.getElementById("teacher-session-year-select");
        const sessGrd = document.getElementById("teacher-session-grade-select");
        if (sessYr) sessYr.value = this.currentYearId;
        if (sessGrd) sessGrd.value = this.currentGrade;

        this.loadTeacherSessions();
      }
      this.refreshIcons();
    },

    onTeacherSessionFilterChange() {
      this.loadTeacherSessions();
    },

    async loadTeacherSessions() {
      const yearSelect = document.getElementById("teacher-session-year-select");
      const gradeSelect = document.getElementById("teacher-session-grade-select");
      const container = document.getElementById("teacher-sessions-editor-container");
      const statusPill = document.getElementById("teacher-snapshot-status-text");

      const academic_year_id = yearSelect ? yearSelect.value : "yr_2569";
      const grade = gradeSelect ? gradeSelect.value : "M4";

      if (container) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);grid-column:1/-1;font-family:var(--font-hud)"><span class="spinner-inline"></span> กำลังโหลดข้อมูลแผนการเรียนรู้...</div>';
      }

      this.startProgress();
      try {
        let res = await window.apiClient.call("sessions.list", {
          academic_year_id,
          grade
        });

        let isFallback = false;
        if (!res || !res.ok) {
          console.warn("[Teacher Sessions] Backend sessions.list not available, using template defaults:", res?.error);
          if (window.MockBackend && typeof window.MockBackend.handleApi === "function") {
            res = window.MockBackend.handleApi("sessions.list", {
              academic_year_id,
              grade
            });
            isFallback = true;
          }
        }

        if (!res || !res.ok) {
          if (container) {
            container.innerHTML = `<div class="card" style="color:var(--crimson-alert);grid-column:1/-1">${res?.error?.message_th || "เกิดข้อผิดพลาดในการโหลด"}</div>`;
          }
          return;
        }

        this.teacherSessions = res.data.sessions || [];

        if (statusPill) {
          if (isFallback) {
            statusPill.innerHTML = `<span style="color:var(--amber-warn)">แผนเริ่มต้นมาตรฐาน (ระบบ Google Apps Script ยังไม่ได้เปิด sessions.list - โปรด Deploy New Version ใน Apps Script)</span>`;
          } else if (res.data.is_snapshot) {
            const timeStr = res.data.updated_at ? new Date(res.data.updated_at).toLocaleString("th-TH") : "";
            statusPill.innerHTML = `<span style="color:var(--cyan-neon)">Snapshot บันทึกแล้ว v${res.data.version_no} (${timeStr})</span>`;
          } else {
            statusPill.innerHTML = `<span style="color:var(--amber-warn)">แผนเริ่มต้นมาตรฐาน (ยังไม่ได้บันทึก Snapshot สำหรับปีนี้)</span>`;
          }
        }

        this.renderTeacherSessionsEditor(this.teacherSessions, grade);
      } catch (err) {
        if (container) {
          container.innerHTML = `<div class="card" style="color:var(--crimson-alert);grid-column:1/-1">เกิดข้อผิดพลาด: ${err.message}</div>`;
        }
      } finally {
        this.completeProgress();
        this.refreshIcons();
      }
    },

    renderTeacherSessionsEditor(sessions, grade) {
      const container = document.getElementById("teacher-sessions-editor-container");
      if (!container) return;

      const prefix = grade === "M5" ? "PHT5-W" : "PHT4-W";
      const worksheetOptions = [
        { code: "", label: "ไม่มีใบงานที่ต้องส่ง" },
        ...Array.from({ length: 9 }, (_, i) => ({
          code: `${prefix}0${i + 1}`,
          label: `ใบงานที่ ${i + 1} (${prefix}0${i + 1})`
        }))
      ];

      const fullSessions = [];
      for (let i = 1; i <= 20; i++) {
        const existing = sessions.find(s => s.session_no === i);
        if (existing) {
          fullSessions.push(existing);
        } else {
          fullSessions.push({
            session_no: i,
            title: `การเรียนรู้ครั้งที่ ${i}`,
            description: "",
            linked_worksheet_code: "",
            category: "lecture"
          });
        }
      }

      container.innerHTML = fullSessions.map(s => `
        <div class="session-editor-card" data-session-no="${s.session_no}">
          <div class="session-editor-card-header">
            <span class="session-num-badge">
              <i data-lucide="edit-3"></i> ครั้งที่ ${s.session_no}
            </span>
            <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-hud)">
              100 นาที
            </span>
          </div>

          <div>
            <label class="session-editor-label" for="sess-title-${s.session_no}">หัวข้อบทเรียน / เรื่องที่เรียน:</label>
            <input type="text" id="sess-title-${s.session_no}" class="form-control session-input-title" value="${s.title ? s.title.replace(/"/g, '&quot;') : ''}" placeholder="ระบุหัวข้อบทเรียนครั้งที่ ${s.session_no}" required style="font-size:14px;font-weight:600">
          </div>

          <div>
            <label class="session-editor-label" for="sess-desc-${s.session_no}">รายละเอียดเนื้อหา / กิจกรรมการสอน:</label>
            <textarea id="sess-desc-${s.session_no}" class="form-control session-input-desc" rows="2" placeholder="ระบุรายละเอียดคร่าวๆ เช่น กิจกรรม การทดลอง หรือจุดประสงค์การเรียนรู้" style="font-size:13px;line-height:1.4">${s.description || ''}</textarea>
          </div>

          <div>
            <label class="session-editor-label" for="sess-ws-${s.session_no}">ใบงานปฏิบัติการที่เชื่อมโยง:</label>
            <select id="sess-ws-${s.session_no}" class="form-control session-input-ws" style="font-size:13px">
              ${worksheetOptions.map(opt => `
                <option value="${opt.code}" ${opt.code === s.linked_worksheet_code ? 'selected' : ''}>
                  ${opt.label}
                </option>
              `).join("")}
            </select>
          </div>
        </div>
      `).join("");

      this.refreshIcons();
    },

    async loadTeacherDefaultSessions() {
      const gradeSelect = document.getElementById("teacher-session-grade-select");
      const grade = gradeSelect ? gradeSelect.value : "M4";

      if (window.MockBackend && typeof window.MockBackend.handleApi === "function") {
        const res = window.MockBackend.handleApi("sessions.list", { academic_year_id: "default", grade });
        if (res.ok && res.data && res.data.sessions) {
          this.renderTeacherSessionsEditor(res.data.sessions, grade);
          this.showToast(`โหลดเนื้อหาเริ่มต้นสำหรับระดับชั้น ${grade === 'M5' ? 'ม.5' : 'ม.4'} เรียบร้อย (กด 'บันทึก Snapshot รายปี' เพื่อยืนยัน)`, "info");
          return;
        }
      }

      this.showToast("กรุณาเลือกปีการศึกษาและระดับชั้น", "info");
    },

    async saveTeacherSessionsSnapshot() {
      const yearSelect = document.getElementById("teacher-session-year-select");
      const gradeSelect = document.getElementById("teacher-session-grade-select");
      const academic_year_id = yearSelect ? yearSelect.value : "yr_2569";
      const grade = gradeSelect ? gradeSelect.value : "M4";

      const cards = document.querySelectorAll(".session-editor-card");
      if (!cards || cards.length === 0) {
        this.showToast("ไม่พบข้อมูลแบบฟอร์มการสอน", "error");
        return;
      }

      const sessions = [];
      let hasEmptyTitle = false;

      cards.forEach(card => {
        const sessionNo = parseInt(card.dataset.sessionNo, 10);
        const titleInput = card.querySelector(".session-input-title");
        const descInput = card.querySelector(".session-input-desc");
        const wsSelect = card.querySelector(".session-input-ws");

        const title = titleInput ? titleInput.value.trim() : "";
        const desc = descInput ? descInput.value.trim() : "";
        const wsCode = wsSelect ? wsSelect.value.trim() : "";

        if (!title) {
          hasEmptyTitle = true;
        }

        let cat = "lecture";
        if (desc.includes("Lab") || title.includes("Lab") || (wsCode && !title.includes("โครงงาน"))) {
          cat = "lab";
        } else if (title.includes("โครงงาน") || desc.includes("โครงงาน")) {
          cat = "project";
        }

        sessions.push({
          session_no: sessionNo,
          title: title || `การเรียนรู้ครั้งที่ ${sessionNo}`,
          description: desc,
          linked_worksheet_code: wsCode,
          category: cat
        });
      });

      if (hasEmptyTitle) {
        if (!confirm("มีบางครั้งที่ยังไม่ได้กรอกหัวข้อบทเรียน ต้องการบันทึกต่อหรือไม่?")) {
          return;
        }
      }

      this.startProgress();
      try {
        const res = await window.apiClient.call("sessions.saveSnapshot", {
          academic_year_id,
          grade,
          sessions
        });

        if (!res.ok) {
          if (res.error?.code === "ACTION_NOT_ALLOWED") {
            this.showToast("Google Apps Script ยังไม่เปิดใช้งาน sessions.saveSnapshot: โปรดอัปเดต Code.gs เวอร์ชันล่าสุดและกด Deploy New Version ใน Apps Script", "error");
          } else {
            this.showToast(res.error.message_th || "ไม่สามารถบันทึก Snapshot ได้", "error");
          }
          return;
        }

        const data = res.data;
        this.showToast(data.message_th || "บันทึก Snapshot รายปีการศึกษาสำเร็จ!", "success");

        const statusPill = document.getElementById("teacher-snapshot-status-text");
        if (statusPill) {
          const timeStr = data.updated_at ? new Date(data.updated_at).toLocaleString("th-TH") : "";
          statusPill.innerHTML = `<span style="color:var(--cyan-neon)">Snapshot บันทึกแล้ว v${data.version_no} (${timeStr})</span>`;
        }
      } catch (err) {
        this.showToast("เกิดข้อผิดพลาดในการบันทึก: " + err.message, "error");
      } finally {
        this.completeProgress();
        this.refreshIcons();
      }
    },

    openProfilePhotoModal() {
      const profile = this.currentProfile || {};
      if (!profile.photo_url && profile.student_uid) {
        try {
          const cachedPhoto = localStorage.getItem("PHT_PROFILE_PHOTO_" + profile.student_uid);
          if (cachedPhoto) profile.photo_url = cachedPhoto;
        } catch (e) {}
      }
      const codeEl = document.getElementById("modal-profile-code-label");
      if (codeEl) codeEl.textContent = profile.code_5_digit || "";

      const currentAvatar = document.getElementById("modal-profile-current-avatar");
      const emptyAvatar = document.getElementById("modal-profile-empty-avatar");
      const btnRemove = document.getElementById("btn-modal-remove-photo");
      const btnSave = document.getElementById("btn-modal-save-photo");
      const progressEl = document.getElementById("modal-profile-upload-progress");
      const fileInput = document.getElementById("input-student-profile-file");
      const selView = document.getElementById("modal-profile-selection-view");
      const cropView = document.getElementById("modal-profile-crop-view");

      if (fileInput) fileInput.value = "";
      if (progressEl) progressEl.style.display = "none";
      if (selView) selView.style.display = "block";
      if (cropView) cropView.style.display = "none";
      this.selectedProfilePhotoDataUrl = null;
      this.activeCropImage = null;

      if (profile.photo_url) {
        if (currentAvatar) {
          currentAvatar.src = profile.photo_url;
          currentAvatar.style.display = "block";
        }
        if (emptyAvatar) emptyAvatar.style.display = "none";
        if (btnRemove) btnRemove.style.display = "inline-flex";
      } else {
        if (currentAvatar) {
          currentAvatar.src = "";
          currentAvatar.style.display = "none";
        }
        if (emptyAvatar) emptyAvatar.style.display = "flex";
        if (btnRemove) btnRemove.style.display = "none";
      }

      if (btnSave) btnSave.disabled = true;

      const modal = document.getElementById("modal-student-profile-photo");
      if (modal) modal.style.display = "flex";
      this.refreshIcons();
    },

    closeProfilePhotoModal() {
      const modal = document.getElementById("modal-student-profile-photo");
      if (modal) modal.style.display = "none";
      this.selectedProfilePhotoDataUrl = null;
      this.activeCropImage = null;
    },

    handleProfileFileSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WEBP เท่านั้น");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.activeCropImage = img;
          this.selectedProfileFileName = file.name;

          // Switch to interactive cropper view
          const selView = document.getElementById("modal-profile-selection-view");
          const cropView = document.getElementById("modal-profile-crop-view");
          if (selView) selView.style.display = "none";
          if (cropView) cropView.style.display = "block";

          const canvas = document.getElementById("profile-crop-canvas");
          const CropperClass = window.ImageCropper || (typeof ImageCropper !== "undefined" ? ImageCropper : null);
          if (!this.imageCropper && CropperClass) {
            this.imageCropper = new CropperClass(canvas, { cropSize: 220 });
          }
          if (this.imageCropper) {
            this.imageCropper.loadImage(img);
          }

          // Reset zoom slider to 1
          const zoomSlider = document.getElementById("crop-zoom-slider");
          if (zoomSlider) zoomSlider.value = 1;

          // Enable confirm button
          const btnSave = document.getElementById("btn-modal-save-photo");
          if (btnSave) btnSave.disabled = false;

          // Update hidden img preview for compatibility
          const imgPreview = document.getElementById("modal-profile-img-preview");
          if (imgPreview) imgPreview.src = e.target.result;

          this.refreshIcons();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    onCropZoomChange(val) {
      if (this.imageCropper) {
        this.imageCropper.setZoom(parseFloat(val));
      }
    },

    adjustCropZoom(delta) {
      const slider = document.getElementById("crop-zoom-slider");
      if (slider && this.imageCropper) {
        let val = parseFloat(slider.value) + delta;
        val = Math.max(1, Math.min(3, val));
        slider.value = val;
        this.imageCropper.setZoom(val);
      }
    },

    rotateCropImage() {
      if (this.imageCropper) {
        this.imageCropper.rotate();
      }
    },

    resetCropImage() {
      if (this.imageCropper) {
        this.imageCropper.reset();
        const slider = document.getElementById("crop-zoom-slider");
        if (slider) slider.value = 1;
      }
    },

    async uploadProfilePhotoConfirm() {
      let finalDataUrl = null;

      if (this.imageCropper && this.activeCropImage) {
        finalDataUrl = this.imageCropper.getCroppedDataUrl(600, 0.88);
      } else if (this.selectedProfilePhotoDataUrl) {
        finalDataUrl = this.selectedProfilePhotoDataUrl;
      }

      if (!finalDataUrl) return;

      const btnSave = document.getElementById("btn-modal-save-photo");
      const progressEl = document.getElementById("modal-profile-upload-progress");
      const fillEl = document.getElementById("modal-profile-progress-fill");
      const textEl = document.getElementById("modal-profile-progress-text");

      if (btnSave) btnSave.disabled = true;
      if (progressEl) progressEl.style.display = "block";
      if (fillEl) fillEl.style.width = "40%";
      if (textEl) textEl.textContent = "กำลังประมวลผลรูปภาพ...";

      try {
        if (fillEl) fillEl.style.width = "75%";
        if (textEl) textEl.textContent = "กำลังบันทึกรูปโปรไฟล์...";

        let res = await window.apiClient.call("student.uploadProfilePhoto", {
          file_base64: finalDataUrl,
          mime_type: "image/jpeg",
          file_name: this.selectedProfileFileName || "profile.jpg"
        });

        if (!res || !res.ok) {
          if (res?.error?.code === "ACTION_NOT_ALLOWED") {
            console.warn("[Profile Photo] Cloud backend returned ACTION_NOT_ALLOWED, falling back to local device storage");
            const uid = this.currentProfile?.student_uid || "std_current";
            try {
              localStorage.setItem("PHT_PROFILE_PHOTO_" + uid, finalDataUrl);
            } catch (e) {}
            res = {
              ok: true,
              data: {
                photo_url: finalDataUrl,
                photo_drive_file_id: "local_cache",
                message_th: "บันทึกรูปโปรไฟล์ในอุปกรณ์สำเร็จ (สำหรับระบบคลาวด์ โปรดอัปเดตการ Deploy ใน Apps Script)"
              }
            };
          } else {
            throw new Error(res?.error?.message_th || "บันทึกรูปภาพไม่สำเร็จ");
          }
        }

        if (fillEl) fillEl.style.width = "100%";
        if (textEl) textEl.textContent = "บันทึกรูปโปรไฟล์เรียบร้อยแล้ว!";

        if (this.currentProfile) {
          this.currentProfile.photo_url = res.data.photo_url;
          this.currentProfile.photo_drive_file_id = res.data.photo_drive_file_id;
          sessionStorage.setItem("PHT_USER_PROFILE", JSON.stringify(this.currentProfile));
        }

        setTimeout(() => {
          this.closeProfilePhotoModal();
          this.loadStudentDashboard();
        }, 350);

      } catch (err) {
        alert("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
        if (btnSave) btnSave.disabled = false;
        if (progressEl) progressEl.style.display = "none";
      }
    },

    async removeProfilePhoto() {
      if (!confirm("คุณต้องการลบรูปโปรไฟล์นี้ใช่หรือไม่?")) return;

      try {
        let res = await window.apiClient.call("student.removeProfilePhoto", {});
        if (!res || !res.ok) {
          if (res?.error?.code === "ACTION_NOT_ALLOWED") {
            res = { ok: true, data: { photo_url: null } };
          } else {
            throw new Error(res?.error?.message_th || "ลบรูปภาพไม่สำเร็จ");
          }
        }

        if (this.currentProfile) {
          const uid = this.currentProfile.student_uid;
          if (uid) {
            try { localStorage.removeItem("PHT_PROFILE_PHOTO_" + uid); } catch (e) {}
          }
          this.currentProfile.photo_url = null;
          this.currentProfile.photo_drive_file_id = null;
          sessionStorage.setItem("PHT_USER_PROFILE", JSON.stringify(this.currentProfile));
        }

        this.closeProfilePhotoModal();
        this.loadStudentDashboard();
      } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    },

    async exportGradebook() {
      try {
        const res = await window.apiClient.call("teacher.exportGradebook", {
          academic_year_id: this.currentYearId,
          grade: this.currentGrade,
          room: this.currentRoom
        });

        if (res.ok) {
          const blob = new Blob([res.data.csv_content], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = res.data.filename;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          alert("ไม่สามารถ Export ได้: " + res.error.message_th);
        }
      } catch (err) {
        alert("Export ล้มเหลว: " + err.message);
      }
    }
  };

  window.app = app;
  app.init();
});
