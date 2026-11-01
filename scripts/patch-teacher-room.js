const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');

// 1. Patch SheetRepository.gs findEnrollments
let repo = fs.readFileSync('backend/SheetRepository.gs', 'utf-8');
const oldRepoRoom = `  findEnrollments(academicYearId, grade, room) {
    const table = this.getTable("Enrollments");
    return table.filter(e => {
      const matchYear = e.academic_year_id === academicYearId;
      const matchGrade = e.grade === grade;
      const matchRoom = (!room || room === "all") ? true : (e.room === room);
      return matchYear && matchGrade && matchRoom && e.status === "active";
    });
  }`;

const newRepoRoom = `  findEnrollments(academicYearId, grade, room) {
    const table = this.getTable("Enrollments") || [];
    return table.filter(e => {
      const matchYear = e.academic_year_id === academicYearId;
      const matchGrade = e.grade === grade;
      const matchRoom = (!room || room === "all") ? true : (String(e.room) === String(room));
      return matchYear && matchGrade && matchRoom && e.status === "active";
    });
  }`;

let normRepo = norm(repo);
if (normRepo.includes(norm(oldRepoRoom))) {
  normRepo = normRepo.replace(norm(oldRepoRoom), norm(newRepoRoom));
  if (repo.includes('\r\n')) normRepo = normRepo.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/SheetRepository.gs', normRepo, 'utf-8');
  console.log('✔ Patched SheetRepository.gs findEnrollments string room comparison');
} else {
  console.log('❌ Could not find target in SheetRepository.gs');
}

// 2. Patch TeacherService.gs
let tch = fs.readFileSync('backend/TeacherService.gs', 'utf-8');
const oldTchCells = `      const worksheetCells = worksheets.map(ws => {
        const sub = subMap.get(ws.code);
        const latestReview = sub ? repository.findLatestEvidenceReview(sub.submission_id) : null;
        
        // Find tasks linked to this worksheet
        const linkedTasks = (syllabus.links || [])
          .filter(l => l.worksheet_code === ws.code)
          .map(l => taskMap.get(l.task_code))
          .filter(Boolean);

        const statusRes = GradingEngine.resolveWorksheetStatus(sub, linkedTasks, gradeMap, latestReview, ws.due_at);
        if (statusRes.main_status === "graded") {
          gradedCount++;
          submittedCount++;
        } else if (statusRes.main_status === "submitted") {
          submittedCount++;
        } else if (statusRes.main_status === "revision_required") {
          revisionCount++;
          submittedCount++;
        }

        return {
          worksheet_code: ws.code,
          main_status: statusRes.main_status,
          status_label_th: statusRes.status_label_th,
          submission_id: sub ? sub.submission_id : null,
          has_draft: linkedTasks.some(t => draftMap.has(t.task_code)),
          overdue: statusRes.overdue
        };
      });`;

const newTchCells = `      const worksheetCells = worksheets.map(ws => {
        const wsCode = ws.code || ws.worksheet_code;
        const sub = subMap.get(wsCode);
        const latestReview = sub ? repository.findLatestEvidenceReview(sub.submission_id) : null;
        
        // Find tasks linked to this worksheet
        const linkedTasks = (syllabus.links || [])
          .filter(l => (l.worksheet_code === wsCode || l.worksheet_code === ws.code))
          .map(l => taskMap.get(l.task_code))
          .filter(Boolean);

        const statusRes = GradingEngine.resolveWorksheetStatus(sub, linkedTasks, gradeMap, latestReview, ws.due_at);
        if (statusRes.main_status === "graded") {
          gradedCount++;
          submittedCount++;
        } else if (statusRes.main_status === "submitted") {
          submittedCount++;
        } else if (statusRes.main_status === "revision_required") {
          revisionCount++;
          submittedCount++;
        }

        return {
          worksheet_code: wsCode,
          main_status: statusRes.main_status,
          status_label_th: statusRes.status_label_th,
          submission_id: sub ? sub.submission_id : null,
          has_draft: linkedTasks.some(t => draftMap.has(t.task_code)),
          overdue: statusRes.overdue
        };
      });`;

let normTch = norm(tch);
if (normTch.includes(norm(oldTchCells))) {
  normTch = normTch.replace(norm(oldTchCells), norm(newTchCells));
} else {
  console.log('❌ Could not find oldTchCells');
}

const oldTchHeader = `worksheets_header: worksheets.map(ws => ({ code: ws.code, title: ws.title, order_no: ws.order_no })),`;
const newTchHeader = `worksheets_header: worksheets.map(ws => ({ code: ws.code || ws.worksheet_code, title: ws.title || (\`ใบงานที่ \${ws.order_no || 1}\`), order_no: ws.order_no || 1 })),`;

if (normTch.includes(norm(oldTchHeader))) {
  normTch = normTch.replace(norm(oldTchHeader), norm(newTchHeader));
  console.log('✔ Patched TeacherService.gs worksheets_header');
} else {
  console.log('❌ Could not find oldTchHeader');
}

if (tch.includes('\r\n')) normTch = normTch.replace(/\n/g, '\r\n');
fs.writeFileSync('backend/TeacherService.gs', normTch, 'utf-8');
console.log('✔ Patched TeacherService.gs');

