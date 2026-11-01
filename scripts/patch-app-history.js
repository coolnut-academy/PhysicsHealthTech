const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');

let app = fs.readFileSync('js/app.js', 'utf-8');

// 1. Replace worksheet card button section in renderStudentDashboard
const oldCardBtnTarget = `          <div style="margin-top:auto;padding-top:14px">
            <button class="btn btn-primary btn-sm btn-open-upload" style="width:100%" data-code="\${card.worksheet_code}" data-title="\${card.title}">
              📤 \${card.main_status === "not_submitted" ? "แนบรูป / ส่งงาน" : "ส่งงานใหม่ (RESUBMIT)"}
            </button>
          </div>`;

// Fallback search pattern in case text was slightly different
const cardBtnRegex = /<div style="margin-top:auto;padding-top:14px">[\s\S]*?<button class="btn btn-primary btn-sm btn-open-upload" style="width:100%"[\s\S]*?<\/button>\s*<\/div>/;

const newCardBtnSection = `<div style="margin-top:auto;padding-top:14px">
            <button class="btn btn-primary btn-sm btn-open-upload" style="width:100%" data-code="\${card.worksheet_code}" data-title="\${card.title}">
              📤 \${card.main_status === "not_submitted" ? "แนบรูป / ส่งงาน" : \`ส่งงานใหม่ / ปรับปรุง (Resubmit v\${(card.submission_latest_version_no || 1) + 1})\`}
            </button>
            \${card.submission_latest_version_no > 0 ? \`
              <button class="btn btn-outline btn-sm btn-view-history" style="width:100%;margin-top:8px;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px" data-code="\${card.worksheet_code}" data-title="\${card.title}">
                📜 ดูประวัติการส่งงาน (\${card.submission_latest_version_no} เวอร์ชัน)
              </button>
            \` : ""}
          </div>`;

let normApp = norm(app);

if (cardBtnRegex.test(normApp)) {
  normApp = normApp.replace(cardBtnRegex, newCardBtnSection);
  console.log('✔ Patched worksheet card button section in app.js');
} else {
  console.log('❌ Could not match cardBtnRegex');
}

// 2. Attach click event to btn-view-history
const oldBtnUploadAttach = `cardEl.querySelector(".btn-open-upload").addEventListener("click", () => {
          this.openUploadModal(card);
        });

        container.appendChild(cardEl);`;

const newBtnUploadAttach = `cardEl.querySelector(".btn-open-upload").addEventListener("click", () => {
          this.openUploadModal(card);
        });

        const histBtn = cardEl.querySelector(".btn-view-history");
        if (histBtn) {
          histBtn.addEventListener("click", () => {
            this.openStudentHistoryModal(card.worksheet_code, card.title);
          });
        }

        container.appendChild(cardEl);`;

if (normApp.includes(norm(oldBtnUploadAttach))) {
  normApp = normApp.replace(norm(oldBtnUploadAttach), norm(newBtnUploadAttach));
  console.log('✔ Attached btn-view-history event listener in app.js');
} else {
  console.log('❌ Could not find oldBtnUploadAttach');
}

// 3. Update openGradingModal and add new history methods
const oldOpenGradingTarget = `    openGradingModal(ctx) {
      this.gradingContext = ctx;
      document.getElementById("modal-grading-title").textContent = \`ตรวจให้คะแนนใบงาน: \${ctx.worksheet_code} (\${ctx.student_name})\`;
      document.getElementById("grading-task-code").value = ctx.worksheet_code.replace("W", "T");
      document.getElementById("grading-points").value = "";
      document.getElementById("grading-feedback").value = "";
      document.getElementById("grading-reason").value = "";
      document.getElementById("modal-grading").style.display = "flex";
    },`;

const gradingRegex = /openGradingModal\(ctx\)\s*\{[\s\S]*?document\.getElementById\("modal-grading"\)\.style\.display\s*=\s*"flex";\s*\},/;

const newGradingMethods = `async openGradingModal(ctx) {
      this.gradingContext = ctx;
      document.getElementById("modal-grading-title").textContent = \`ตรวจให้คะแนนใบงาน: \${ctx.worksheet_code} (\${ctx.student_name})\`;
      document.getElementById("grading-task-code").value = ctx.worksheet_code.replace("W", "T");
      document.getElementById("grading-points").value = "";
      document.getElementById("grading-feedback").value = "";
      document.getElementById("grading-reason").value = "";
      document.getElementById("modal-grading").style.display = "flex";

      const selectEl = document.getElementById("grading-version-select");
      const timestampEl = document.getElementById("grading-version-timestamp");
      const noteEl = document.getElementById("grading-version-note");
      const filesEl = document.getElementById("grading-version-files");

      if (selectEl) selectEl.innerHTML = \`<option value="">กำลังโหลดประวัติผลงาน...</option>\`;
      if (timestampEl) timestampEl.textContent = "📅 กำลังโหลดประวัติผลงาน...";
      if (noteEl) noteEl.textContent = "💬 บันทึกจากนักเรียน: -";
      if (filesEl) filesEl.innerHTML = "";

      try {
        const res = await window.apiClient.call("submissions.history", {
          student_uid: ctx.student_uid,
          worksheet_code: ctx.worksheet_code,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok || !res.data || !res.data.versions || res.data.versions.length === 0) {
          if (selectEl) selectEl.innerHTML = \`<option value="">ยังไม่มีข้อมูลการส่งงาน</option>\`;
          if (timestampEl) timestampEl.textContent = "📅 ยังไม่มีข้อมูลการส่งงานสำหรับใบงานนี้";
          if (noteEl) noteEl.textContent = "💬 ยังไม่มีบันทึก";
          if (filesEl) filesEl.innerHTML = \`<span style="font-size:12px;color:var(--text-dim)">ไม่มีไฟล์แนบ</span>\`;
          return;
        }

        const versions = res.data.versions;
        this.gradingVersions = versions;

        if (selectEl) {
          selectEl.innerHTML = versions.map((v, idx) => \`
            <option value="\${v.version_no}" \${idx === 0 ? 'selected' : ''}>
              v\${v.version_no} \${idx === 0 ? '(ล่าสุด)' : '(เก่า)'} - \${new Date(v.submitted_at).toLocaleDateString('th-TH')}
            </option>
          \`).join("");
        }

        const renderVersion = (verNo) => {
          const v = versions.find(item => String(item.version_no) === String(verNo)) || versions[0];
          if (timestampEl) {
            timestampEl.innerHTML = \`📅 <strong>ส่งเมื่อ:</strong> \${new Date(v.submitted_at).toLocaleString('th-TH')} <span style="margin-left:8px;padding:2px 8px;border-radius:4px;font-family:var(--font-mono);font-size:11px;font-weight:700;background:\${v.version_no === versions[0].version_no ? 'rgba(56,189,248,0.2);color:#38bdf8' : 'rgba(148,163,184,0.2);color:#94a3b8'}">Version \${v.version_no}</span>\`;
          }
          if (noteEl) {
            noteEl.innerHTML = \`💬 <strong>บันทึกจากนักเรียน:</strong> \${v.note ? v.note : '<em style="color:var(--text-dim)">(ไม่มีข้อความ)</em>'}\`;
          }

          if (filesEl) {
            if (!v.files || v.files.length === 0) {
              filesEl.innerHTML = \`<span style="font-size:12px;color:var(--text-dim)">ไม่มีไฟล์แนบในเวอร์ชันนี้</span>\`;
            } else {
              filesEl.innerHTML = v.files.map(f => \`
                <div class="evidence-thumb" style="width:76px;height:76px;border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.4);cursor:pointer;position:relative" data-evidence-id="\${f.evidence_id}" title="คลิกเพื่อดูภาพขยาย">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(30,41,59,0.8);font-size:24px">
                    📄
                  </div>
                </div>
              \`).join("");

              filesEl.querySelectorAll(".evidence-thumb").forEach(thumb => {
                const evId = thumb.dataset.evidenceId;
                this.loadThumbnailPreview(thumb, evId);
                thumb.addEventListener("click", () => {
                  this.openImagePreview(evId, \`\${ctx.worksheet_code} (v\${v.version_no}) - \${ctx.student_name}\`);
                });
              });
            }
          }
        };

        renderVersion(versions[0].version_no);

        if (selectEl) {
          selectEl.onchange = (e) => {
            renderVersion(e.target.value);
          };
        }

      } catch (err) {
        if (timestampEl) timestampEl.textContent = "เกิดข้อผิดพลาดในการโหลดประวัติ: " + err.message;
      }
    },

    async openStudentHistoryModal(worksheetCode, title) {
      document.getElementById("modal-history-title").textContent = \`📜 ประวัติการส่งงาน: \${worksheetCode} - \${title}\`;
      const timelineEl = document.getElementById("student-history-timeline");
      timelineEl.innerHTML = \`<div style="text-align:center;color:var(--text-cyan);padding:24px;font-family:var(--font-hud)">กำลังโหลดประวัติผลงาน...</div>\`;
      document.getElementById("modal-student-history").style.display = "flex";

      try {
        const res = await window.apiClient.call("submissions.history", {
          worksheet_code: worksheetCode,
          academic_year_id: this.currentYearId,
          grade: this.currentGrade
        });

        if (!res.ok || !res.data || !res.data.versions || res.data.versions.length === 0) {
          timelineEl.innerHTML = \`<div style="text-align:center;color:var(--text-dim);padding:24px">ยังไม่มีประวัติการส่งงานสำหรับใบงานนี้</div>\`;
          return;
        }

        const versions = res.data.versions;
        timelineEl.innerHTML = versions.map((v, idx) => \`
          <div style="background:rgba(15,23,42,0.7);border:1px solid \${idx === 0 ? 'rgba(56,189,248,0.4)' : 'rgba(148,163,184,0.18)'};border-radius:10px;padding:14px;position:relative">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-family:var(--font-mono);font-weight:700;font-size:13px;color:\${idx === 0 ? 'var(--cyan-neon)' : 'var(--text-muted)'}">
                \${idx === 0 ? '⚡ Version ' + v.version_no + ' (ล่าสุด)' : 'Version ' + v.version_no}
              </span>
              <span style="font-size:12px;color:var(--text-dim)">
                📅 \${new Date(v.submitted_at).toLocaleString('th-TH')}
              </span>
            </div>
            \${v.note ? \`
              <div style="font-size:13px;color:#e2e8f0;margin-bottom:10px;background:rgba(2,132,199,0.06);padding:8px 12px;border-radius:6px">
                💬 <strong>บันทึก:</strong> \${v.note}
              </div>
            \` : ""}
            <div style="font-size:12px;color:var(--text-cyan);font-weight:700;margin-bottom:6px">🖼️ รูปภาพผลงาน (\${v.files.length} รูป):</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              \${v.files.map(f => \`
                <div class="evidence-thumb" style="width:72px;height:72px;border-radius:6px;overflow:hidden;border:1px solid rgba(56,189,248,0.3);cursor:pointer;position:relative" data-evidence-id="\${f.evidence_id}" title="คลิกเพื่อดูภาพขยาย">
                  <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(30,41,59,0.8);font-size:22px">
                    📄
                  </div>
                </div>
              \`).join("")}
            </div>
          </div>
        \`).join("");

        timelineEl.querySelectorAll(".evidence-thumb").forEach(thumb => {
          const evId = thumb.dataset.evidenceId;
          this.loadThumbnailPreview(thumb, evId);
          thumb.addEventListener("click", () => {
            this.openImagePreview(evId, \`ใบงาน \${worksheetCode}\`);
          });
        });

      } catch (err) {
        timelineEl.innerHTML = \`<div style="color:var(--crimson-alert);padding:20px">เกิดข้อผิดพลาด: \${err.message}</div>\`;
      }
    },

    closeHistoryModal() {
      document.getElementById("modal-student-history").style.display = "none";
    },

    async loadThumbnailPreview(containerEl, evidenceId) {
      try {
        const res = await window.apiClient.call("evidence.preview", { evidence_id: evidenceId });
        if (res.ok && (res.data.data_url || res.data.file_base64)) {
          const src = res.data.data_url || \`data:\${res.data.mime_type || 'image/jpeg'};base64,\${res.data.file_base64}\`;
          containerEl.innerHTML = \`<img src="\${src}" alt="thumb" style="width:100%;height:100%;object-fit:cover">\`;
        }
      } catch (e) {}
    },

    async openImagePreview(evidenceId, title) {
      const modal = document.getElementById("modal-image-preview");
      const titleEl = document.getElementById("preview-image-title");
      const imgEl = document.getElementById("preview-image-el");

      titleEl.textContent = \`🖼️ รูปภาพผลงาน: \${title || ''}\`;
      imgEl.src = "";
      modal.style.display = "flex";

      try {
        const res = await window.apiClient.call("evidence.preview", { evidence_id: evidenceId });
        if (res.ok && (res.data.data_url || res.data.file_base64)) {
          imgEl.src = res.data.data_url || \`data:\${res.data.mime_type || 'image/jpeg'};base64,\${res.data.file_base64}\`;
        } else {
          alert("ไม่สามารถแสดงรูปภาพได้: " + (res.error?.message_th || "ไม่พบรูปภาพ"));
          modal.style.display = "none";
        }
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการโหลดรูปภาพ: " + err.message);
        modal.style.display = "none";
      }
    },`;

if (gradingRegex.test(normApp)) {
  normApp = normApp.replace(gradingRegex, newGradingMethods);
  console.log('✔ Patched openGradingModal and added history/preview methods in app.js');
} else {
  console.log('❌ Could not match gradingRegex');
}

// 4. Dynamic syllabus_version_id in submitPublishGrade
normApp = normApp.replace(
  `syllabus_version_id: this.currentGrade === "M4" ? "syl_m4_2570_v1" : "syl_m5_2570_v1",`,
  `syllabus_version_id: \`syl_\${this.currentGrade.toLowerCase()}_\${this.currentYearId.replace('yr_', '')}_v1\`,`
);

if (app.includes('\r\n')) normApp = normApp.replace(/\n/g, '\r\n');
fs.writeFileSync('js/app.js', normApp, 'utf-8');
console.log('js/app.js updated successfully!');

