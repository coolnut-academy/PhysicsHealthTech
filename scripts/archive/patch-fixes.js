const fs = require('fs');

// 1. Patch backend/SheetRepository.gs
let repoCode = fs.readFileSync('backend/SheetRepository.gs', 'utf-8');

const oldRepoTarget = `  findPublishedSyllabus(academicYearId, grade) {
    const table = this.getTable("SyllabusVersions");
    return table.find(s => s.academic_year_id === academicYearId && s.grade === grade && s.state === "published");
  }

  savePublishedSyllabus(syllabus) {
    this.appendRowToTable("SyllabusVersions", { ...syllabus });
  }

  findTaskByCode(syllabusVersionId, taskCode) {
    const syllabus = this.getTable("SyllabusVersions").find(s => s.syllabus_version_id === syllabusVersionId);
    if (!syllabus || !syllabus.tasks) return null;
    return syllabus.tasks.find(t => t.task_code === taskCode);
  }`;

const newRepoRepl = `  findPublishedSyllabus(academicYearId, grade) {
    const table = this.getTable("SyllabusVersions") || [];
    const syl = table.find(s => s.academic_year_id === academicYearId && s.grade === grade && s.state === "published");
    if (!syl) return null;

    const tasksTable = this.getTable("TaskDefinitions") || [];
    const tasks = (syl.tasks && syl.tasks.length > 0)
      ? syl.tasks
      : tasksTable.filter(t => t.syllabus_version_id === syl.syllabus_version_id);
    tasks.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));

    const linksTable = this.getTable("WorksheetTaskLinks") || [];
    const links = (syl.links && syl.links.length > 0)
      ? syl.links
      : linksTable.filter(l => l.syllabus_version_id === syl.syllabus_version_id);
    links.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));

    let worksheets = syl.worksheets;
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
    }

    return {
      ...syl,
      tasks,
      links,
      worksheets
    };
  }

  savePublishedSyllabus(syllabus) {
    this.appendRowToTable("SyllabusVersions", { ...syllabus });
  }

  findTaskByCode(syllabusVersionId, taskCode) {
    const tasksTable = this.getTable("TaskDefinitions") || [];
    const fromTasks = tasksTable.find(t => t.syllabus_version_id === syllabusVersionId && t.task_code === taskCode);
    if (fromTasks) return fromTasks;

    const syllabus = (this.getTable("SyllabusVersions") || []).find(s => s.syllabus_version_id === syllabusVersionId);
    if (!syllabus || !syllabus.tasks) return null;
    return syllabus.tasks.find(t => t.task_code === taskCode);
  }`;

const norm = s => s.replace(/\r\n/g, '\n');
const isCrlf = repoCode.includes('\r\n');

let normRepo = norm(repoCode);
if (normRepo.includes(norm(oldRepoTarget))) {
  normRepo = normRepo.replace(norm(oldRepoTarget), norm(newRepoRepl));
  if (isCrlf) normRepo = normRepo.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/SheetRepository.gs', normRepo, 'utf-8');
  console.log('✔ Patched backend/SheetRepository.gs');
} else {
  console.log('❌ Could not find target in SheetRepository.gs');
}

// 2. Patch backend/TeacherService.gs
let tchCode = fs.readFileSync('backend/TeacherService.gs', 'utf-8');
const oldTchTarget = `    const syllabus = repository.findPublishedSyllabus(academic_year_id, grade);
    const worksheets = syllabus ? syllabus.worksheets : [];
    const tasks = syllabus ? syllabus.tasks : [];

    // Map tasks and worksheets
    const taskMap = new Map();
    tasks.forEach(t => taskMap.set(t.task_code, t));`;

const newTchRepl = `    const syllabus = repository.findPublishedSyllabus(academic_year_id, grade);
    const worksheets = (syllabus && Array.isArray(syllabus.worksheets)) ? syllabus.worksheets : [];
    const tasks = (syllabus && Array.isArray(syllabus.tasks)) ? syllabus.tasks : [];

    // Map tasks and worksheets
    const taskMap = new Map();
    tasks.forEach(t => taskMap.set(t.task_code, t));`;

let normTch = norm(tchCode);
if (normTch.includes(norm(oldTchTarget))) {
  normTch = normTch.replace(norm(oldTchTarget), norm(newTchRepl));
  if (tchCode.includes('\r\n')) normTch = normTch.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/TeacherService.gs', normTch, 'utf-8');
  console.log('✔ Patched backend/TeacherService.gs');
} else {
  console.log('❌ Could not find target in TeacherService.gs');
}

// 3. Patch backend/StudentService.gs
let stdCode = fs.readFileSync('backend/StudentService.gs', 'utf-8');
const oldStdTarget = `  getDashboard(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { academic_year_id, grade } = payload || {};

    if (!academic_year_id || !grade) {`;

const newStdRepl = `  getDashboard(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    let { academic_year_id, grade } = payload || {};

    if (!academic_year_id || !grade) {
      const activeEnr = (repository.findEnrollmentsByStudent(studentUid) || [])
        .filter(e => e.status === "active")
        .sort((a, b) => (b.academic_year_id || "").localeCompare(a.academic_year_id || ""))[0];
      if (activeEnr) {
        academic_year_id = activeEnr.academic_year_id;
        grade = activeEnr.grade;
      }
    }

    if (!academic_year_id || !grade) {`;

let normStd = norm(stdCode);
if (normStd.includes(norm(oldStdTarget))) {
  normStd = normStd.replace(norm(oldStdTarget), norm(newStdRepl));
  if (stdCode.includes('\r\n')) normStd = normStd.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/StudentService.gs', normStd, 'utf-8');
  console.log('✔ Patched backend/StudentService.gs');
} else {
  console.log('❌ Could not find target in StudentService.gs');
}

