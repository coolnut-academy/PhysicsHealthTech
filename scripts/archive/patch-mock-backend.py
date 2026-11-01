with open('js/mock-backend.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'if (action === "teacher.exportGradebook") {'
import_code = """      // 11. Teacher Import Roster
      if (action === "teacher.importRoster") {
        const { year_be, students: rosterRows } = payload;
        const yearBeInt = parseInt(year_be, 10);
        const yearId = `yr_${yearBeInt}`;

        let year = memoryDB.years.find(y => y.year_be === yearBeInt);
        if (!year) {
          memoryDB.years.push({ academic_year_id: yearId, year_be: yearBeInt, state: "open" });
        }

        let count = 0;
        for (const row of (rosterRows || [])) {
          const rawCode = String(row.code_5_digit || "").trim().replace(/^'/, "");
          if (!rawCode) continue;
          const code5Digit = rawCode.padStart(5, "0");
          let displayName = (row.display_name || "").trim();
          if (!displayName && (row.first_name || row.fname)) {
            const title = (row.title || "").trim();
            const fname = (row.first_name || row.fname || "").trim();
            const lname = (row.last_name || row.lname || "").trim();
            displayName = `${title}${fname} ${lname}`.trim();
          }
          if (!displayName) displayName = `นักเรียนรหัส ${code5Digit}`;

          const grade = (row.grade || "M4").toUpperCase().trim();
          const room = String(row.room || "1").trim();
          const rollNo = parseInt(row.roll_no || 0, 10) || 0;

          let student = memoryDB.students.find(s => s.code_5_digit === code5Digit);
          let studentUid = "";
          if (student) {
            studentUid = student.student_uid;
            student.display_name = displayName;
          } else {
            studentUid = `std_${code5Digit}`;
            student = {
              student_uid: studentUid,
              code_5_digit: code5Digit,
              display_name: displayName,
              status: "active"
            };
            memoryDB.students.push(student);
          }

          const enrId = `enr_${yearBeInt}_${grade.toLowerCase()}_${String(rollNo).padStart(3, "0")}`;
          const existingEnrIdx = memoryDB.enrollments.findIndex(e => e.enrollment_id === enrId);
          const enrObj = {
            enrollment_id: enrId,
            academic_year_id: yearId,
            student_uid: studentUid,
            grade: grade,
            room: room,
            roll_no: rollNo,
            status: "active"
          };
          if (existingEnrIdx >= 0) {
            memoryDB.enrollments[existingEnrIdx] = enrObj;
          } else {
            memoryDB.enrollments.push(enrObj);
          }
          count++;
        }

        return {
          ok: true,
          data: {
            academic_year_id: yearId,
            year_be: yearBeInt,
            total_processed: count,
            message_th: `นำเข้าข้อมูลปีการศึกษา ${yearBeInt} เรียบร้อยแล้ว (${count} คน)`
          }
        };
      }\n\n"""

replacement = import_code + "      " + target
text = text.replace(target, replacement, 1)

with open('js/mock-backend.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Added teacher.importRoster to mock-backend.js successfully")

