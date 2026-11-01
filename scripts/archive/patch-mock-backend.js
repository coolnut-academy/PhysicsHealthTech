const fs = require('fs');

let code = fs.readFileSync('js/mock-backend.js', 'utf-8');
const isCrlf = code.includes('\r\n');
const normalize = s => s.replace(/\r\n/g, '\n');

let normCode = normalize(code);

const oldLoginTarget = normalize(`        const token = "mock_token_" + Math.random().toString(16).substring(2);
        memoryDB.sessions.set(token, {
          principal_uid: student.student_uid,
          principal_type: "student",
          role: "student"
        });

        return {
          ok: true,
          data: {
            session_token: token,
            profile: {
              student_uid: student.student_uid,
              code_5_digit: student.code_5_digit,
              display_name: student.display_name,
              role: "student"
            }
          }
        };`);

const newLoginReplacement = normalize(`        const token = "mock_token_" + Math.random().toString(16).substring(2);
        
        // Find active enrollments
        const studentEnrollments = memoryDB.enrollments.filter(e => e.student_uid === student.student_uid && e.status === "active");
        studentEnrollments.sort((a, b) => b.academic_year_id.localeCompare(a.academic_year_id));
        const activeEnr = studentEnrollments[0] || null;

        const availableEnrollments = studentEnrollments.map(e => {
          const yr = memoryDB.years.find(y => y.academic_year_id === e.academic_year_id);
          const yNum = yr ? yr.year_be : parseInt(e.academic_year_id.replace(/\\D/g, "") || "2569", 10);
          return {
            enrollment_id: e.enrollment_id,
            academic_year_id: e.academic_year_id,
            year: yNum,
            grade: e.grade,
            room: e.room,
            roll_no: e.roll_no
          };
        });

        const activeYr = activeEnr ? (memoryDB.years.find(y => y.academic_year_id === activeEnr.academic_year_id)?.year_be || 2569) : 2569;

        memoryDB.sessions.set(token, {
          principal_uid: student.student_uid,
          principal_type: "student",
          role: "student",
          enrollment_id: activeEnr ? activeEnr.enrollment_id : null,
          academic_year_id: activeEnr ? activeEnr.academic_year_id : "yr_2569",
          grade: activeEnr ? activeEnr.grade : "M4"
        });

        return {
          ok: true,
          data: {
            session_token: token,
            profile: {
              student_uid: student.student_uid,
              code_5_digit: student.code_5_digit,
              display_name: student.display_name,
              role: "student",
              grade: activeEnr ? activeEnr.grade : null,
              room: activeEnr ? activeEnr.room : null,
              roll_no: activeEnr ? activeEnr.roll_no : null,
              academic_year: activeYr,
              academic_year_id: activeEnr ? activeEnr.academic_year_id : null,
              available_enrollments: availableEnrollments
            }
          }
        };`);

if (normCode.includes(oldLoginTarget)) {
  normCode = normCode.replace(oldLoginTarget, newLoginReplacement);
  console.log('Replaced studentLogin');
} else {
  console.log('Could not find oldLoginTarget');
}

const oldDashTarget = normalize(`      if (action === "student.dashboard") {
        const { academic_year_id = "yr_2570", grade = "M4" } = payload;
        const student = memoryDB.students.find(s => s.student_uid === session.principal_uid);
        const enrollment = memoryDB.enrollments.find(e => e.student_uid === session.principal_uid && e.academic_year_id === academic_year_id && e.grade === grade);
        const syllabus = memoryDB.syllabi.find(s => s.academic_year_id === academic_year_id && s.grade === grade);`);

const newDashReplacement = normalize(`      if (action === "student.dashboard") {
        const student = memoryDB.students.find(s => s.student_uid === session.principal_uid);
        let enrollment = null;
        if (payload.enrollment_id) {
          enrollment = memoryDB.enrollments.find(e => e.enrollment_id === payload.enrollment_id && e.student_uid === session.principal_uid);
        }
        if (!enrollment && payload.academic_year_id && payload.grade) {
          enrollment = memoryDB.enrollments.find(e => e.student_uid === session.principal_uid && e.academic_year_id === payload.academic_year_id && e.grade === payload.grade);
        }
        if (!enrollment) {
          const studentEnrs = memoryDB.enrollments.filter(e => e.student_uid === session.principal_uid && e.status === "active");
          studentEnrs.sort((a, b) => b.academic_year_id.localeCompare(a.academic_year_id));
          enrollment = studentEnrs[0] || null;
        }

        const academic_year_id = enrollment ? enrollment.academic_year_id : (payload.academic_year_id || session.academic_year_id || "yr_2569");
        const grade = enrollment ? enrollment.grade : (payload.grade || session.grade || "M4");
        let syllabus = memoryDB.syllabi.find(s => s.academic_year_id === academic_year_id && s.grade === grade);
        if (!syllabus) {
          syllabus = memoryDB.syllabi.find(s => s.grade === grade);
        }`);

if (normCode.includes(oldDashTarget)) {
  normCode = normCode.replace(oldDashTarget, newDashReplacement);
  console.log('Replaced student.dashboard');
} else {
  console.log('Could not find oldDashTarget');
}

if (isCrlf) {
  normCode = normCode.replace(/\n/g, '\r\n');
}

fs.writeFileSync('js/mock-backend.js', normCode, 'utf-8');
console.log('Done!');
