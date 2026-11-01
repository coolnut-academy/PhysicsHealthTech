import json

with open('scripts/roster_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

students = data['students']
enrollments = data['enrollments']

students_js = json.dumps(students, ensure_ascii=False, indent=2)
enrollments_js = json.dumps(enrollments, ensure_ascii=False, indent=2)

func_code = f"""
/**
 * One-Click Importer for Official Student Roster (Academic Year 2569)
 * Imports 30 students (M.4) and 27 students (M.5) directly into Google Sheets.
 * Run directly from Google Apps Script editor:
 * Run -> importOfficialRoster2569
 */
function importOfficialRoster2569() {{
  const spreadsheetId = AppConfig.getSpreadsheetId();
  if (typeof SpreadsheetApp === "undefined") {{
    return {{ ok: false, message: "Non-GAS environment" }};
  }}
  const ss = SpreadsheetApp.openById(spreadsheetId);

  // 1. Academic Year 2569
  const yrSheet = ss.getSheetByName("AcademicYears");
  if (yrSheet) {{
    const existing = yrSheet.getDataRange().getValues();
    if (!existing.some(r => r[0] === "yr_2569")) {{
      yrSheet.appendRow(["yr_2569", 2569, "open", "op_official_2569", new Date().toISOString(), new Date().toISOString(), 1]);
    }}
  }}

  // 2. Syllabi & Tasks for M.4 and M.5 (Year 2569)
  const sylSheet = ss.getSheetByName("SyllabusVersions");
  const taskSheet = ss.getSheetByName("TaskDefinitions");
  const linkSheet = ss.getSheetByName("WorksheetTaskLinks");
  if (sylSheet && taskSheet && linkSheet) {{
    const existingSyl = sylSheet.getDataRange().getValues();
    
    // M.4 Syllabus (2569)
    if (!existingSyl.some(r => r[0] === "syl_m4_2569_v1")) {{
      sylSheet.appendRow(["syl_m4_2569_v1", "yr_2569", "M4", 1, 10000, 20, 100, "published", new Date().toISOString()]);
      const m4Tasks = [
        ["task_m4_2569_T4-01", "syl_m4_2569_v1", "T4-01", "ใบงานที่ 1: การวัดและเลขนัยสำคัญทางชีวกลศาสตร์", 1000, "individual_only", "{{}}", true, 1],
        ["task_m4_2569_T4-02", "syl_m4_2569_v1", "T4-02", "ใบงานที่ 2: การเคลื่อนที่แนวตรงของระบบกล้ามเนื้อและข้อต่อ", 1000, "individual_only", "{{}}", true, 2],
        ["task_m4_2569_T4-03", "syl_m4_2569_v1", "T4-03", "ใบงานที่ 3: แรงและกฎการเคลื่อนที่ของนิวตันในกายภาพบำบัด", 1000, "individual_only", "{{}}", true, 3],
        ["task_m4_2569_T4-04", "syl_m4_2569_v1", "T4-04", "ใบงานที่ 4: สมดุลกลและการทรงตัวของกระดูกสันหลัง", 1000, "individual_only", "{{}}", true, 4],
        ["task_m4_2569_T4-05", "syl_m4_2569_v1", "T4-05", "ใบงานที่ 5: งาน พลังงาน และการเผาผลาญในร่างกายมนุษย์", 1000, "individual_only", "{{}}", true, 5],
        ["task_m4_2569_T4-06", "syl_m4_2569_v1", "T4-06", "ใบงานที่ 6: โมเมนตัมและการชนในการบาดเจ็บทางกีฬา", 1000, "individual_only", "{{}}", true, 6],
        ["task_m4_2569_T4-07", "syl_m4_2569_v1", "T4-07", "ใบงานที่ 7: การเคลื่อนที่แบบโพรเจกไทล์และการเคลื่อนที่แบบวงกลม", 1000, "individual_only", "{{}}", true, 7],
        ["task_m4_2569_T4-08", "syl_m4_2569_v1", "T4-08", "ใบงานที่ 8: การเคลื่อนที่แบบฮาร์มอนิกอย่างง่ายและการสั่นสะเทือน", 1000, "individual_only", "{{}}", true, 8],
        ["task_m4_2569_T4-09", "syl_m4_2569_v1", "T4-09", "ใบงานที่ 9: โครงงานประยุกต์ฟิสิกส์สุขภาพและการนำเสนอชิ้นงาน", 2000, "group_individual_hybrid", JSON.stringify({{ shared_max: 1000, individual_max: 1000 }}), true, 9]
      ];
      m4Tasks.forEach(t => taskSheet.appendRow(t));
      for (let i = 1; i <= 9; i++) {{
        linkSheet.appendRow([`link_m4_2569_${{i}}`, "syl_m4_2569_v1", `PHT4-W0${{i}}`, `T4-0${{i}}`, i]);
      }}
    }}

    // M.5 Syllabus (2569)
    if (!existingSyl.some(r => r[0] === "syl_m5_2569_v1")) {{
      sylSheet.appendRow(["syl_m5_2569_v1", "yr_2569", "M5", 1, 10000, 20, 100, "published", new Date().toISOString()]);
      const m5Tasks = [
        ["task_m5_2569_T5-01", "syl_m5_2569_v1", "T5-01", "ใบงานที่ 1: ของไหลและความดันโลหิตในระบบไหลเวียน", 1000, "individual_only", "{{}}", true, 1],
        ["task_m5_2569_T5-02", "syl_m5_2569_v1", "T5-02", "ใบงานที่ 2: อุณหพลศาสตร์และการควบคุมอุณหภูมิร่างกาย", 1000, "individual_only", "{{}}", true, 2],
        ["task_m5_2569_T5-03", "syl_m5_2569_v1", "T5-03", "ใบงานที่ 3: คลื่นเสียงและการตรวจวินิจฉัยด้วยอัลตราซาวด์", 1000, "individual_only", "{{}}", true, 3],
        ["task_m5_2569_T5-04", "syl_m5_2569_v1", "T5-04", "ใบงานที่ 4: แสงเชิงเรขาคณิต เลนส์สายตา และการมองเห็น", 1000, "individual_only", "{{}}", true, 4],
        ["task_m5_2569_T5-05", "syl_m5_2569_v1", "T5-05", "ใบงานที่ 5: ไฟฟ้าสถิตและศักย์ไฟฟ้าเยื่อหุ้มเซลล์", 1000, "individual_only", "{{}}", true, 5],
        ["task_m5_2569_T5-06", "syl_m5_2569_v1", "T5-06", "ใบงานที่ 6: ไฟฟ้ากระแสตรงและการทำงานของคลื่นไฟฟ้าหัวใจ (ECG)", 1000, "individual_only", "{{}}", true, 6],
        ["task_m5_2569_T5-07", "syl_m5_2569_v1", "T5-07", "ใบงานที่ 7: แม่เหล็กไฟฟ้าและการสร้างภาพด้วยสนามแม่เหล็ก (MRI)", 1000, "individual_only", "{{}}", true, 7],
        ["task_m5_2569_T5-08", "syl_m5_2569_v1", "T5-08", "ใบงานที่ 8: รังสี เอกซเรย์ และความปลอดภัยทางรังสีวิทยา", 1000, "individual_only", "{{}}", true, 8],
        ["task_m5_2569_T5-09", "syl_m5_2569_v1", "T5-09", "ใบงานที่ 9: นวัตกรรมสิ่งประดิษฐ์ฟิสิกส์สุขภาพและการนำเสนอโครงงาน", 2000, "group_individual_hybrid", JSON.stringify({{ shared_max: 1000, individual_max: 1000 }}), true, 9]
      ];
      m5Tasks.forEach(t => taskSheet.appendRow(t));
      for (let i = 1; i <= 9; i++) {{
        linkSheet.appendRow([`link_m5_2569_${{i}}`, "syl_m5_2569_v1", `PHT5-W0${{i}}`, `T5-0${{i}}`, i]);
      }}
    }}
  }}

  // 3. Teachers
  const tchSheet = ss.getSheetByName("Teachers");
  if (tchSheet) {{
    const existing = tchSheet.getDataRange().getValues();
    if (!existing.some(r => r[6] === "TeacherAuthSecret#1001")) {{
      tchSheet.appendRow(["tch_001", "", "teacher.physics@school.ac.th", "อาจารย์ ดร.สมศักดิ์ รักวิทยา", "teacher", "active", "TeacherAuthSecret#1001", new Date().toISOString()]);
    }}
    if (!existing.some(r => r[6] === "AdminAuthSecret#9999")) {{
      tchSheet.appendRow(["tch_admin", "", "admin.physics@school.ac.th", "อาจารย์ นพพร หัวหน้าหมวด", "admin", "active", "AdminAuthSecret#9999", new Date().toISOString()]);
    }}
  }}

  // 4. Students (30 from M.4 + 27 from M.5)
  const stdSheet = ss.getSheetByName("Students");
  const officialStudents = {students_js};
  if (stdSheet) {{
    const existingStd = stdSheet.getDataRange().getValues();
    for (const s of officialStudents) {{
      const exists = existingStd.some(r => String(r[1]).replace(/^'/, "") === s.code_5_digit);
      if (!exists) {{
        stdSheet.appendRow([s.student_uid, "'" + s.code_5_digit, s.display_name, s.status, 1, new Date().toISOString(), "", ""]);
      }}
    }}
  }}

  // 5. Enrollments
  const enrSheet = ss.getSheetByName("Enrollments");
  const officialEnrollments = {enrollments_js};
  if (enrSheet) {{
    const existingEnr = enrSheet.getDataRange().getValues();
    for (const e of officialEnrollments) {{
      const exists = existingEnr.some(r => r[0] === e.enrollment_id);
      if (!exists) {{
        enrSheet.appendRow([e.enrollment_id, e.academic_year_id, e.student_uid, e.grade, e.room, e.roll_no, e.status, new Date().toISOString()]);
      }}
    }}
  }}

  Logger.log("Successfully imported official roster 2569! (M.4: 30, M.5: 27)");
  return {{ ok: true, message: "นำเข้ารายชื่อนักเรียน ม.4 (30 คน) และ ม.5 (27 คน) สำเร็จแล้ว!" }};
}}
"""

with open('scripts/importer_func.txt', 'w', encoding='utf-8') as f:
    f.write(func_code)

print("Generated scripts/importer_func.txt successfully!")

