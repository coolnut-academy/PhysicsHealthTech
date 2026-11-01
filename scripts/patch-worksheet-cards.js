const fs = require('fs');

// 1. Patch SheetRepository.gs
let repo = fs.readFileSync('backend/SheetRepository.gs', 'utf-8');
const oldRepoTarget = `    let worksheets = syl.worksheets;
    if (!worksheets || worksheets.length === 0) {
      const wsMap = new Map();
      links.forEach(l => {
        if (!wsMap.has(l.worksheet_code)) {
          wsMap.set(l.worksheet_code, {
            worksheet_code: l.worksheet_code,
            task_codes: [l.task_code]
          });
        } else {
          wsMap.get(l.worksheet_code).task_codes.push(l.task_code);
        }
      });
      worksheets = Array.from(wsMap.values());
    }`;

const newRepoRepl = `    let worksheets = syl.worksheets;
    if (!worksheets || worksheets.length === 0) {
      const assignmentsTable = this.getTable("Assignments") || [];
      const asgForGrade = assignmentsTable.filter(a => a.academic_year_id === syl.academic_year_id && a.grade === syl.grade);

      const wsMap = new Map();
      links.forEach(l => {
        if (!wsMap.has(l.worksheet_code)) {
          const asg = asgForGrade.find(a => a.worksheet_code === l.worksheet_code);
          const order = asg ? asg.order_no : (parseInt(String(l.worksheet_code).replace(/\\D/g, ""), 10) || 1);
          wsMap.set(l.worksheet_code, {
            code: l.worksheet_code,
            worksheet_code: l.worksheet_code,
            title: asg ? asg.title : \`ใบงานที่ \${order}\`,
            order_no: order,
            session_start: asg ? asg.session_start : Math.max(1, (order * 2) - 1),
            session_end: asg ? asg.session_end : Math.min(20, order * 2),
            due_at: asg ? asg.due_at : null,
            task_codes: [l.task_code]
          });
        } else {
          wsMap.get(l.worksheet_code).task_codes.push(l.task_code);
        }
      });
      worksheets = Array.from(wsMap.values());
    }`;

const norm = s => s.replace(/\r\n/g, '\n');
let normRepo = norm(repo);
if (normRepo.includes(norm(oldRepoTarget))) {
  normRepo = normRepo.replace(norm(oldRepoTarget), norm(newRepoRepl));
  if (repo.includes('\r\n')) normRepo = normRepo.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/SheetRepository.gs', normRepo, 'utf-8');
  console.log('✔ Patched SheetRepository.gs worksheets structure');
} else {
  console.log('❌ Could not find target in SheetRepository.gs');
}

// 2. Patch StudentService.gs
let std = fs.readFileSync('backend/StudentService.gs', 'utf-8');
const oldStdTarget = `    const worksheetCards = (syllabus.worksheets || []).map(ws => {
      const submission = subMap.get(ws.code) || null;
      const linkedTaskCodes = wsLinksMap.get(ws.code) || [];
      const linkedTasks = linkedTaskCodes.map(code => taskMap.get(code)).filter(Boolean);
      
      const latestReview = submission ? repository.findLatestEvidenceReview(submission.submission_id) : null;
      const statusResult = GradingEngine.resolveWorksheetStatus(
        submission,
        linkedTasks,
        publishedGradesMap,
        latestReview,
        ws.due_at
      );

      worksheetStatuses.push(statusResult);

      // Build task summaries for this card
      const taskSummaries = linkedTasks.map(task => {
        const grade = publishedGradesMap.get(task.task_code);
        const pointsInt = grade ? (grade.base_points_int !== undefined ? grade.base_points_int : grade.current_points_int) : null;
        return {
          task_code: task.task_code,
          title: task.title,
          max_points_int: task.max_points_int,
          max_points: GradingEngine.formatPoints(task.max_points_int),
          published_points_int: pointsInt,
          published_points: pointsInt !== null ? GradingEngine.formatPoints(pointsInt) : null,
          is_graded: Boolean(grade),
          grading_state: grade ? "graded" : "pending",
          grading_label_th: grade ? "ตรวจแล้ว" : "รอตรวจ",
          feedback: grade ? grade.feedback : null
        };
      });

      return {
        worksheet_code: ws.code,
        title: ws.title,
        order_no: ws.order_no,
        session_range: \`\${ws.session_start}-\${ws.session_end}\`,
        due_at: ws.due_at,
        main_status: statusResult.main_status,
        status_label_th: statusResult.status_label_th,
        partial_grading: statusResult.partial_grading,
        overdue: statusResult.overdue,
        is_out_of_roster: isOutOfRoster,
        task_summaries: taskSummaries,
        submission_latest_version_no: submission ? submission.latest_version_no : 0,
        submission_id: submission ? submission.submission_id : null,
        has_history: submission ? (submission.latest_version_no > 1) : false
      };
    });`;

const newStdRepl = `    const worksheetCards = (syllabus.worksheets || []).map(ws => {
      const wsCode = ws.code || ws.worksheet_code;
      const submission = subMap.get(wsCode) || null;
      const linkedTaskCodes = wsLinksMap.get(wsCode) || ws.task_codes || [];
      const linkedTasks = linkedTaskCodes.map(code => taskMap.get(code)).filter(Boolean);
      
      const latestReview = submission ? repository.findLatestEvidenceReview(submission.submission_id) : null;
      const statusResult = GradingEngine.resolveWorksheetStatus(
        submission,
        linkedTasks,
        publishedGradesMap,
        latestReview,
        ws.due_at
      );

      worksheetStatuses.push(statusResult);

      // Build task summaries for this card
      const taskSummaries = linkedTasks.map(task => {
        const grade = publishedGradesMap.get(task.task_code);
        const pointsInt = grade ? (grade.base_points_int !== undefined ? grade.base_points_int : grade.current_points_int) : null;
        return {
          task_code: task.task_code,
          title: task.title,
          max_points_int: task.max_points_int,
          max_points: GradingEngine.formatPoints(task.max_points_int),
          published_points_int: pointsInt,
          published_points: pointsInt !== null ? GradingEngine.formatPoints(pointsInt) : null,
          is_graded: Boolean(grade),
          grading_state: grade ? "graded" : "pending",
          grading_label_th: grade ? "ตรวจแล้ว" : "รอตรวจ",
          feedback: grade ? grade.feedback : null
        };
      });

      const orderNo = ws.order_no || (parseInt(String(wsCode).replace(/\\D/g, ""), 10) || 1);
      const sessionRange = (ws.session_start && ws.session_end) 
        ? \`\${ws.session_start}-\${ws.session_end}\` 
        : \`\${Math.max(1, (orderNo * 2) - 1)}-\${Math.min(20, orderNo * 2)}\`;

      return {
        worksheet_code: wsCode,
        title: ws.title || \`ใบงานที่ \${orderNo}\`,
        order_no: orderNo,
        session_range: sessionRange,
        due_at: ws.due_at,
        main_status: statusResult.main_status,
        status_label_th: statusResult.status_label_th,
        partial_grading: statusResult.partial_grading,
        overdue: statusResult.overdue,
        is_out_of_roster: isOutOfRoster,
        task_summaries: taskSummaries,
        submission_latest_version_no: submission ? submission.latest_version_no : 0,
        submission_id: submission ? submission.submission_id : null,
        has_history: submission ? (submission.latest_version_no > 1) : false
      };
    });`;

let normStd = norm(std);
if (normStd.includes(norm(oldStdTarget))) {
  normStd = normStd.replace(norm(oldStdTarget), norm(newStdRepl));
  if (std.includes('\r\n')) normStd = normStd.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/StudentService.gs', normStd, 'utf-8');
  console.log('✔ Patched StudentService.gs worksheetCards mapping');
} else {
  console.log('❌ Could not find target in StudentService.gs');
}

