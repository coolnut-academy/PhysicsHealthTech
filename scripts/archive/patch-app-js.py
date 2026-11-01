with open('js/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update bindEvents
target_events = """      document.getElementById("btn-export-gradebook")?.addEventListener("click", () => {
        this.exportGradebook();
      });"""

replacement_events = """      document.getElementById("teacher-year-select")?.addEventListener("change", (e) => {
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
      });"""

text = text.replace(target_events, replacement_events, 1)

# 2. Update renderStudentDashboard for Dynamic Enrollment & Year Switcher
target_render_dash = """      // Profile banner
      const banner = document.getElementById("student-profile-banner");"""

replacement_render_dash = """      // Dynamic Grade Isolation & Year Switcher
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
          <div class="status-badge status-submitted" style="font-size:13px;padding:6px 14px">
            🎓 ระดับชั้น: มัธยมศึกษาปีที่ ${profile.grade === "M4" ? "4" : "5"} (ห้อง ${profile.room || "1"} เลขที่ ${profile.roll_no || "-"})
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

      // Profile banner
      const banner = document.getElementById("student-profile-banner");"""

text = text.replace(target_render_dash, replacement_render_dash, 1)

# 3. Add Importer & Template methods right before end of app object
target_methods_end = """    async exportGradebook() {"""

new_methods = """    downloadRosterTemplate() {
      const csv = "\\uFEFFcode_5_digit,display_name,grade,room,roll_no\\r\\n17763,นายพิพัฒน์ จุลบุตร,M5,1,1\\r\\n17808,นายอโณทัย จรัญไชยกุล,M5,1,2\\r\\n17837,นายชัชพงษ์ ไชยา,M5,1,3";
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
      }
    },

    parseRosterCsv(text) {
      const lines = text.trim().split(/\\r?\\n/);
      if (lines.length < 2) return [];
      const rawHeaders = lines[0].split(",").map(h => h.trim().replace(/^[\\uFEFF"']+|["']+$/g, ""));

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

    async exportGradebook() {"""

text = text.replace(target_methods_end, new_methods, 1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated js/app.js successfully!")

