/**
 * PhysicsHealthTech V2.0 - Main Frontend Application Logic
 * Source of truth: SCREEN_SPECIFICATIONS.md & DESIGN_SYSTEM.md
 * Theme: Futuristic Bio-Physics & Health Technology
 */

document.addEventListener("DOMContentLoaded", () => {
  const app = {
    currentTab: "dashboard",
    currentGrade: "M4",
    currentYearId: "yr_2570",
    currentRoom: "1",
    selectedWorksheet: null,
    selectedUploadFiles: [], // Array of { name, mime, base64, size }
    gradingContext: null,

    init() {
      this.initPhysicsBackground();
      this.bindEvents();
      this.checkAuth();
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

      // Spawn particles with velocity and glowing colors
      const particleCount = Math.min(45, Math.floor(width / 32));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? "rgba(0, 240, 255, " : "rgba(139, 92, 246, "
        });
      }

      let mouseX = -1000, mouseY = -1000;
      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Draw dynamic ECG Heartbeat Waveform
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
            dy = -8; // P wave
          } else if (cycle >= 135 && cycle < 145) {
            dy = 6; // Q
          } else if (cycle >= 145 && cycle < 160) {
            dy = -42; // R peak (heartbeat spike!)
          } else if (cycle >= 160 && cycle < 170) {
            dy = 16; // S
          } else if (cycle >= 170 && cycle < 205) {
            dy = -12; // T wave
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

        // 1. Live ECG Pulse Waveform
        ecgOffset += 1.4;
        drawECG(height * 0.88);

        // 2. Physics Vector Particle Network
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Subtle interaction with mouse
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            p.x -= dx * 0.02;
            p.y -= dy * 0.02;
          }

          // Draw glowing particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color + "0.8)";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw connective vector lines
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
      });

      document.getElementById("btn-tab-teacher-login")?.addEventListener("click", () => {
        document.getElementById("form-student-login").style.display = "none";
        document.getElementById("form-teacher-login").style.display = "block";
        document.getElementById("btn-tab-teacher-login").classList.add("btn-primary");
        document.getElementById("btn-tab-teacher-login").classList.remove("btn-secondary");
        document.getElementById("btn-tab-student-login").classList.add("btn-secondary");
        document.getElementById("btn-tab-student-login").classList.remove("btn-primary");
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

      // Settings Modal
      document.getElementById("btn-settings")?.addEventListener("click", () => {
        this.openSettingsModal();
      });

      // File input picker for upload
      document.getElementById("upload-file-input")?.addEventListener("change", (e) => {
        this.handleFileSelection(e.target.files);
      });

      // Grade toggles in student portal
      document.getElementById("btn-grade-m4")?.addEventListener("click", () => {
        this.currentGrade = "M4";
        this.updateGradeToggleUI();
        this.loadStudentDashboard();
      });

      document.getElementById("btn-grade-m5")?.addEventListener("click", () => {
        this.currentGrade = "M5";
        this.updateGradeToggleUI();
        this.loadStudentDashboard();
      });

      // Mobile nav clicks
      document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const tab = btn.dataset.tab;
          this.switchTab(tab);
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

      document.getElementById("btn-export-gradebook")?.addEventListener("click", () => {
        this.exportGradebook();
      });
    },

    updateGradeToggleUI() {
      const btnM4 = document.getElementById("btn-grade-m4");
      const btnM5 = document.getElementById("btn-grade-m5");
      if (!btnM4 || !btnM5) return;

      if (this.currentGrade === "M4") {
        btnM4.classList.add("btn-primary");
        btnM4.classList.remove("btn-secondary");
        btnM5.classList.add("btn-secondary");
        btnM5.classList.remove("btn-primary");
      } else {
        btnM5.classList.add("btn-primary");
        btnM5.classList.remove("btn-secondary");
        btnM4.classList.add("btn-secondary");
        btnM4.classList.remove("btn-primary");
      }
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
      document.getElementById("mobile-navigation").style.display = "none";
    },

    showLoggedInView(role, profile) {
      document.getElementById("view-auth").style.display = "none";
      document.getElementById("user-header-info").style.display = "flex";

      const nameEl = document.getElementById("user-display-name");
      const roleEl = document.getElementById("user-role-tag");

      if (role === "teacher" || role === "admin") {
        nameEl.textContent = profile.name || profile.email;
        roleEl.textContent = "TEACHER";
        document.getElementById("view-teacher-workspace").style.display = "block";
        document.getElementById("view-student-portal").style.display = "none";
        document.getElementById("mobile-navigation").style.display = "none";
        this.loadTeacherMatrix();
      } else {
        nameEl.textContent = `${profile.display_name} (${profile.code_5_digit})`;
        roleEl.textContent = "STUDENT";
        document.getElementById("view-student-portal").style.display = "block";
        document.getElementById("view-teacher-workspace").style.display = "none";
        document.getElementById("mobile-navigation").style.display = "block";
        this.loadStudentDashboard();
      }
    },

    async handleStudentLogin() {
      const code = document.getElementById("student-code").value.trim();
      const secret = document.getElementById("student-secret").value.trim();
      const errBox = document.getElementById("auth-error-box");
      errBox.style.display = "none";

      try {
        const res = await window.apiClient.call("auth.studentLogin", {
          code_5_digit: code,
          secret: secret
        });

        if (res.ok) {
          window.apiClient.setSession(res.data.session_token, res.data.profile);
          this.showLoggedInView("student", res.data.profile);
        } else {
          errBox.textContent = res.error.message_th || "เข้าสู่ระบบไม่สำเร็จ";
          errBox.style.display = "block";
        }
      } catch (err) {
        errBox.textContent = "ข้อผิดพลาด: " + err.message;
        errBox.style.display = "block";
      }
    },

    async handleTeacherLogin() {
      const secret = document.getElementById("teacher-secret").value.trim();
      const errBox = document.getElementById("auth-error-box");
      errBox.style.display = "none";

      try {
        const res = await window.apiClient.call("auth.teacherLogin", {
          auth_secret: secret
        });

        if (res.ok) {
          window.apiClient.setSession(res.data.session_token, res.data.profile);
          this.showLoggedInView("teacher", res.data.profile);
        } else {
          errBox.textContent = res.error.message_th || "เข้าสู่ระบบครูไม่สำเร็จ";
          errBox.style.display = "block";
        }
      } catch (err) {
        errBox.textContent = "ข้อผิดพลาด: " + err.message;
        errBox.style.display = "block";
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
      container.innerHTML = '<div style="text-align:center;padding:50px;color:var(--text-muted);font-family:var(--font-hud)">⚡ SYNCHRONIZING BIOMETRIC PROTOCOLS & GRADES...</div>';

      try {
        const res = await window.apiClient.call("student.dashboard", {
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok) {
          container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">${res.error.message_th}</div>`;
          return;
        }

        const data = res.data;
        this.renderStudentDashboard(data);
      } catch (err) {
        container.innerHTML = `<div class="card" style="color:var(--crimson-alert)">เกิดข้อผิดพลาด: ${err.message}</div>`;
      }
    },

    renderStudentDashboard(data) {
      const { profile, score_summary, worksheet_summary, worksheet_cards } = data;

      // Profile banner
      const banner = document.getElementById("student-profile-banner");
      if (profile.is_out_of_roster) {
        banner.innerHTML = `
          <div style="background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);padding:12px 18px;border-radius:var(--radius-lg);margin-bottom:20px;font-weight:600;display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">⚠️</span>
            <span>คุณกำลังดูระดับชั้น ${profile.grade} ปี ${profile.year_be} (ส่งงานได้ แต่ไม่ได้อยู่ในบัญชีรายชื่อทางการของห้องเรียนนี้)</span>
          </div>
        `;
      } else {
        banner.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;background:var(--bg-card);border:1px solid var(--border-glass);padding:18px 24px;border-radius:var(--radius-xl);backdrop-filter:blur(14px)">
            <div>
              <div style="font-family:var(--font-hud);font-size:12px;color:var(--text-cyan);letter-spacing:1px;margin-bottom:2px">BIOMETRIC ACADEMIC PROFILE</div>
              <h2 style="font-size:22px;font-weight:700;color:#fff">${profile.display_name}</h2>
              <div style="font-size:13px;color:var(--text-muted);margin-top:2px;font-family:var(--font-thai)">
                รหัส <span style="font-family:var(--font-mono);color:var(--cyan-neon)">${profile.code_5_digit}</span> | ระดับชั้นมัธยมศึกษาปีที่ ${profile.grade === "M4" ? "4" : "5"} ห้อง ${profile.room || "-"} เลขที่ ${profile.roll_no || "-"} | ปีการศึกษา ${profile.year_be}
              </div>
            </div>
            <div>
              <span class="status-badge status-submitted" style="font-family:var(--font-hud)">BE ${profile.year_be} ACTIVE</span>
            </div>
          </div>
        `;
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

      // Render 9 Worksheet Cards
      const container = document.getElementById("student-worksheets-container");
      container.innerHTML = "";

      if (worksheet_cards.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;color:var(--text-muted)">ยังไม่มีใบงานที่ประกาศในระดับชั้นนี้</div>';
        return;
      }

      worksheet_cards.forEach(card => {
        const cardEl = document.createElement("div");
        cardEl.className = "worksheet-card";

        const tasksHtml = card.task_summaries.map(t => `
          <div class="task-item">
            <div>
              <span style="font-family:var(--font-mono);font-weight:700;color:var(--text-cyan)">${t.task_code}</span>: ${t.title}
              ${t.feedback ? `<div style="font-size:12px;color:var(--cyan-neon);margin-top:2px">💬 ครู: ${t.feedback}</div>` : ""}
            </div>
            <div style="text-align:right">
              ${t.published_points !== null 
                ? `<span style="font-family:var(--font-mono);font-weight:700;color:var(--emerald-bio)">${t.published_points} / ${t.max_points}</span>` 
                : `<span style="font-family:var(--font-mono);color:var(--text-dim)">รอตรวจ (${t.max_points} PTS)</span>`}
            </div>
          </div>
        `).join("");

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
            <div>📅 กำหนดส่ง: ${new Date(card.due_at).toLocaleDateString("th-TH")}</div>
            <div>⏱ คาบเรียนที่: ${card.session_range} (ครั้งละ 100 นาที)</div>
            ${card.submission_latest_version_no > 0 ? `<div>📌 ประวัติ: เวอร์ชัน v${card.submission_latest_version_no}</div>` : ""}
          </div>
          <div class="tasks-container">
            <div style="font-family:var(--font-hud);font-weight:700;font-size:12px;color:var(--text-cyan);margin-bottom:6px">
              ภารกิจการประเมิน (SYLLABUS TASKS):
            </div>
            ${tasksHtml}
          </div>
          <div style="margin-top:auto;padding-top:14px">
            <button class="btn btn-primary btn-sm btn-open-upload" style="width:100%" data-code="${card.worksheet_code}" data-title="${card.title}">
              📷 ${card.main_status === "not_submitted" ? "ถ่ายภาพ / ส่งงาน" : "ส่งงานใหม่ (RESUBMIT)"}
            </button>
          </div>
        `;

        cardEl.querySelector(".btn-open-upload").addEventListener("click", () => {
          this.openUploadModal(card);
        });

        container.appendChild(cardEl);
      });
    },

    openUploadModal(card) {
      this.selectedWorksheet = card;
      this.selectedUploadFiles = [];
      document.getElementById("modal-upload-title").textContent = `ส่งงาน: ${card.worksheet_code} - ${card.title}`;
      document.getElementById("upload-note").value = "";
      document.getElementById("upload-previews-container").innerHTML = "";
      document.getElementById("upload-progress-box").style.display = "none";
      document.getElementById("btn-submit-upload").disabled = false;
      document.getElementById("modal-upload").style.display = "flex";
    },

    closeUploadModal() {
      document.getElementById("modal-upload").style.display = "none";
      this.selectedWorksheet = null;
      this.selectedUploadFiles = [];
    },

    async handleFileSelection(files) {
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.selectedUploadFiles.length >= 5) {
          alert("จำกัดการส่งภาพสูงสุด 5 ภาพต่อครั้ง");
          break;
        }

        // Client-side image compression using canvas
        const base64 = await this.compressImage(file);
        const fileObj = {
          name: file.name,
          mime: "image/jpeg",
          base64: base64,
          size: Math.round((base64.length * 3) / 4)
        };

        this.selectedUploadFiles.push(fileObj);
      }

      this.renderSelectedPreviews();
    },

    compressImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxDimension = 1600;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // Compress to JPEG 0.82
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            resolve(dataUrl);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    },

    renderSelectedPreviews() {
      const container = document.getElementById("upload-previews-container");
      container.innerHTML = "";

      this.selectedUploadFiles.forEach((file, index) => {
        const thumb = document.createElement("div");
        thumb.className = "preview-thumb";
        thumb.innerHTML = `
          <img src="${file.base64}" alt="${file.name}">
          <button class="preview-remove" data-index="${index}">✕</button>
        `;

        thumb.querySelector(".preview-remove").addEventListener("click", () => {
          this.selectedUploadFiles.splice(index, 1);
          this.renderSelectedPreviews();
        });

        container.appendChild(thumb);
      });
    },

    async submitUpload() {
      if (this.selectedUploadFiles.length === 0) {
        alert("กรุณาเลือกหรือถ่ายภาพใบงานอย่างน้อย 1 ภาพ");
        return;
      }

      const progressBox = document.getElementById("upload-progress-box");
      const progressText = document.getElementById("upload-progress-text");
      const submitBtn = document.getElementById("btn-submit-upload");

      progressBox.style.display = "block";
      submitBtn.disabled = true;

      try {
        // Step 1: Begin
        progressText.textContent = "⚡ กำลังเริ่มต้นเชื่อมต่อเซสชันการส่งงาน...";
        const beginRes = await window.apiClient.call("submissions.begin", {
          worksheet_code: this.selectedWorksheet.worksheet_code,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!beginRes.ok) throw new Error(beginRes.error.message_th);
        const opId = beginRes.data.upload_op_id;

        // Step 2: Upload Files
        for (let i = 0; i < this.selectedUploadFiles.length; i++) {
          progressText.textContent = `📡 กำลังส่งข้อมูลภาพที่ ${i + 1} จาก ${this.selectedUploadFiles.length}...`;
          const file = this.selectedUploadFiles[i];

          const upRes = await window.apiClient.call("submissions.uploadEvidence", {
            upload_op_id: opId,
            file_name: file.name,
            mime_type: file.mime,
            file_base64: file.base64
          });

          if (!upRes.ok) throw new Error(upRes.error.message_th);
        }

        // Step 3: Complete
        progressText.textContent = "🔒 กำลังบันทึกธุรกรรมและออกหลักฐานยืนยัน...";
        const note = document.getElementById("upload-note").value.trim();
        const compRes = await window.apiClient.call("submissions.complete", {
          upload_op_id: opId,
          worksheet_code: this.selectedWorksheet.worksheet_code,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade,
          note: note
        });

        if (!compRes.ok) throw new Error(compRes.error.message_th);

        progressText.textContent = "✔ บันทึกการส่งงานสำเร็จเรียบร้อย!";
        setTimeout(() => {
          this.closeUploadModal();
          this.loadStudentDashboard();
        }, 800);

      } catch (err) {
        progressText.textContent = "เกิดข้อผิดพลาด: " + err.message;
        submitBtn.disabled = false;
      }
    },

    // --- Teacher Workspace Functions ---

    async loadTeacherMatrix() {
      const container = document.getElementById("teacher-matrix-wrapper");
      container.innerHTML = '<div style="text-align:center;padding:50px;color:var(--text-muted);font-family:var(--font-hud)">⚡ LOADING RESEARCH & GRADE MATRIX...</div>';

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
      }
    },

    renderTeacherMatrix(data) {
      const { worksheets_header, rows } = data;
      const container = document.getElementById("teacher-matrix-wrapper");

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
        <div class="matrix-container">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="sticky-col">เลขที่</th>
                <th>รหัส</th>
                <th>ชื่อ-สกุล</th>
                <th>ห้อง</th>
                ${thWorksheets}
                <th style="text-align:center">คะแนนสะสม</th>
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
    },

    openGradingModal(ctx) {
      this.gradingContext = ctx;
      document.getElementById("modal-grading-title").textContent = `ตรวจและให้คะแนน: ${ctx.worksheet_code} (${ctx.student_name})`;
      document.getElementById("grading-task-code").value = ctx.worksheet_code.replace("W", "T");
      document.getElementById("grading-points").value = "";
      document.getElementById("grading-feedback").value = "";
      document.getElementById("grading-reason").value = "";
      document.getElementById("modal-grading").style.display = "flex";
    },

    closeGradingModal() {
      document.getElementById("modal-grading").style.display = "none";
      this.gradingContext = null;
    },

    async submitPublishGrade() {
      const points = parseFloat(document.getElementById("grading-points").value);
      if (isNaN(points)) {
        alert("กรุณาระบุคะแนนที่ถูกต้อง");
        return;
      }

      const pointsInt = Math.round(points * 100);
      const feedback = document.getElementById("grading-feedback").value.trim();
      const reason = document.getElementById("grading-reason").value.trim();

      try {
        const res = await window.apiClient.call("teacher.publishGrade", {
          student_uid: this.gradingContext.student_uid,
          syllabus_version_id: this.currentGrade === "M4" ? "syl_m4_2570_v1" : "syl_m5_2570_v1",
          task_code: "T4-01",
          points_int: pointsInt,
          feedback: feedback,
          reason: reason
        });

        if (res.ok) {
          alert("เผยแพร่คะแนนเรียบร้อยแล้ว");
          this.closeGradingModal();
          this.loadTeacherMatrix();
        } else {
          alert("เกิดข้อผิดพลาด: " + res.error.message_th);
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    },

    async submitRequestRevision() {
      if (!this.gradingContext.submission_id) {
        alert("นักเรียนยังไม่ได้ส่งงานนี้ ไม่สามารถขอแก้ไขได้");
        return;
      }

      const feedback = document.getElementById("grading-feedback").value.trim();
      if (!feedback) {
        alert("กรุณาระบุคำแนะนำสิ่งที่ต้องการให้นักเรียนแก้ไข (feedback)");
        return;
      }

      try {
        const res = await window.apiClient.call("teacher.requestRevision", {
          submission_id: this.gradingContext.submission_id,
          feedback: feedback
        });

        if (res.ok) {
          alert("ส่งคำขอแก้ไขงานไปยังนักเรียนเรียบร้อยแล้ว");
          this.closeGradingModal();
          this.loadTeacherMatrix();
        } else {
          alert("เกิดข้อผิดพลาด: " + res.error.message_th);
        }
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
    },

    // --- Settings Modal ---
    openSettingsModal() {
      document.getElementById("input-gas-url").value = window.CONFIG.getApiUrl();
      document.getElementById("check-demo-mode").checked = window.CONFIG.isDemoMode();
      document.getElementById("modal-settings").style.display = "flex";
    },

    saveSettings() {
      const url = document.getElementById("input-gas-url").value.trim();
      const isDemo = document.getElementById("check-demo-mode").checked;
      window.CONFIG.setApiUrl(url);
      window.CONFIG.setDemoMode(isDemo);
      document.getElementById("modal-settings").style.display = "none";
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      location.reload();
    }
  };

  window.app = app;
  app.init();
});
