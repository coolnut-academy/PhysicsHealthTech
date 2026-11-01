const fs = require('fs');

let code = fs.readFileSync('js/mock-backend.js', 'utf-8');
const target = '              year_be: 2570,';
const repl = `              year_be: enrollment ? (memoryDB.years.find(y => y.academic_year_id === enrollment.academic_year_id)?.year_be || 2569) : 2569,
              available_enrollments: memoryDB.enrollments.filter(e => e.student_uid === student.student_uid && e.status === "active").map(e => ({
                enrollment_id: e.enrollment_id,
                academic_year_id: e.academic_year_id,
                year: memoryDB.years.find(y => y.academic_year_id === e.academic_year_id)?.year_be || parseInt(e.academic_year_id.replace(/\\D/g, "") || "2569", 10),
                grade: e.grade,
                room: e.room,
                roll_no: e.roll_no
              })),`;

if (code.includes(target)) {
  code = code.replace(target, repl);
  fs.writeFileSync('js/mock-backend.js', code, 'utf-8');
  console.log('Updated year_be and available_enrollments in mock-backend.js');
} else {
  console.log('Target not found');
}

