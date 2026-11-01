/**
 * Synthetic Test Fixtures for PhysicsHealthTech V2.0
 * strictly synthetic data - no real student names, credentials, or production IDs.
 */

const SYNTHETIC_YEARS = [
  {
    academic_year_id: "yr_2570",
    year_be: 2570,
    state: "open",
    creation_op_id: "op_init_2570",
    created_at: "2026-05-01T08:00:00Z",
    published_at: "2026-05-05T08:00:00Z",
    revision: 1
  },
  {
    academic_year_id: "yr_2569",
    year_be: 2569,
    state: "archived",
    creation_op_id: "op_init_2569",
    created_at: "2025-05-01T08:00:00Z",
    published_at: "2025-05-05T08:00:00Z",
    revision: 2
  }
];

const SYNTHETIC_STUDENTS = [
  {
    student_uid: "std_00007",
    code_5_digit: "00007",
    display_name: "นายสมชาย มั่นใจ",
    status: "active",
    credential_version: 1,
    created_at: "2026-05-01T08:00:00Z",
    secret_plain: "PhtSecret#00007A"
  },
  {
    student_uid: "std_00123",
    code_5_digit: "00123",
    display_name: "น.ส.สมหญิง ชำนาญคิด",
    status: "active",
    credential_version: 1,
    created_at: "2026-05-01T08:00:00Z",
    secret_plain: "PhtSecret#00123B"
  },
  {
    student_uid: "std_00999",
    code_5_digit: "00999",
    display_name: "นายกิตติศักดิ์ นักประดิษฐ์",
    status: "active",
    credential_version: 1,
    created_at: "2026-05-01T08:00:00Z",
    secret_plain: "PhtSecret#00999C"
  },
  {
    student_uid: "std_91234",
    code_5_digit: "91234",
    display_name: "น.ส.พัชรา วิทยาการ",
    status: "active",
    credential_version: 1,
    created_at: "2026-05-01T08:00:00Z",
    secret_plain: "PhtSecret#91234D"
  }
];

const SYNTHETIC_TEACHERS = [
  {
    teacher_uid: "tch_001",
    google_sub: "google_sub_1001",
    email_for_display: "teacher.physics@school.ac.th",
    name: "อาจารย์ ดร.สมศักดิ์ นวัตกรรม",
    role: "teacher",
    status: "active",
    auth_secret: "TeacherAuthSecret#1001"
  },
  {
    teacher_uid: "tch_admin",
    google_sub: "google_sub_admin",
    email_for_display: "admin.physics@school.ac.th",
    name: "อาจารย์ นพพร หัวหน้าหมวด",
    role: "admin",
    status: "active",
    auth_secret: "AdminAuthSecret#9999"
  }
];

const SYNTHETIC_ENROLLMENTS = [
  {
    enrollment_id: "enr_001",
    academic_year_id: "yr_2570",
    student_uid: "std_00007",
    grade: "M4",
    room: "1",
    roll_no: 1,
    status: "active"
  },
  {
    enrollment_id: "enr_002",
    academic_year_id: "yr_2570",
    student_uid: "std_00123",
    grade: "M4",
    room: "1",
    roll_no: 2,
    status: "active"
  },
  {
    enrollment_id: "enr_003",
    academic_year_id: "yr_2570",
    student_uid: "std_00999",
    grade: "M4",
    room: "1",
    roll_no: 10,
    status: "active"
  },
  {
    enrollment_id: "enr_004",
    academic_year_id: "yr_2570",
    student_uid: "std_91234",
    grade: "M5",
    room: "2",
    roll_no: 1,
    status: "active"
  }
];

// M4 Syllabus: Exactly 9 worksheets, 20 sessions x 100 min, exactly 100.00 base points (10000 hundredths)
const SYNTHETIC_M4_SYLLABUS = {
  syllabus_version_id: "syl_m4_2570_v1",
  academic_year_id: "yr_2570",
  grade: "M4",
  version_no: 1,
  course_max_points_int: 10000,
  sessions_count: 20,
  minutes_per_session: 100,
  state: "published",
  worksheets: [
    { code: "PHT4-W01", title: "ใบงานที่ 1: การวัดและเครื่องมือทางกายภาพสุขภาพ", order_no: 1, session_start: 1, session_end: 2, due_at: "2026-06-15T23:59:59Z" },
    { code: "PHT4-W02", title: "ใบงานที่ 2: กลศาสตร์การเคลื่อนที่ของร่างกายมนุษย์", order_no: 2, session_start: 3, session_end: 4, due_at: "2026-06-30T23:59:59Z" },
    { code: "PHT4-W03", title: "ใบงานที่ 3: แรง สมดุล และจุดศูนย์ถ่วงทางกายวิภาค", order_no: 3, session_start: 5, session_end: 6, due_at: "2026-07-15T23:59:59Z" },
    { code: "PHT4-W04", title: "ใบงานที่ 4: งาน พลังงาน และการเผาผลาญในระบบชีวกล", order_no: 4, session_start: 7, session_end: 8, due_at: "2026-07-31T23:59:59Z" },
    { code: "PHT4-W05", title: "ใบงานที่ 5: โมเมนตัมและการชนในการป้องกันการบาดเจ็บ", order_no: 5, session_start: 9, session_end: 10, due_at: "2026-08-15T23:59:59Z" },
    { code: "PHT4-W06", title: "ใบงานที่ 6: การหมุนและทอร์กของข้อต่อและกล้ามเนื้อ", order_no: 6, session_start: 11, session_end: 12, due_at: "2026-08-31T23:59:59Z" },
    { code: "PHT4-W07", title: "ใบงานที่ 7: ความยืดหยุ่นและความเค้นของกระดูกและเอ็น", order_no: 7, session_start: 13, session_end: 14, due_at: "2026-09-15T23:59:59Z" },
    { code: "PHT4-W08", title: "ใบงานที่ 8: ของไหล ความดันโลหิต และการไหลเวียนเลือด", order_no: 8, session_start: 15, session_end: 17, due_at: "2026-09-30T23:59:59Z" },
    { code: "PHT4-W09", title: "ใบงานที่ 9: บูรณาการโครงงานฟิสิกส์สุขภาพเทคโนโลยี ม.4", order_no: 9, session_start: 18, session_end: 20, due_at: "2026-10-15T23:59:59Z" }
  ],
  tasks: [
    { task_code: "T4-01", title: "การทดลองการวัดความดันและสัญญาณชีพ", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 1 },
    { task_code: "T4-02", title: "การวิเคราะห์เวกเตอร์การเคลื่อนไหวของข้อเท้า", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 2 },
    { task_code: "T4-03", title: "การคำนวณสมดุลแรงและจุดศูนย์ถ่วง (Link W3, W4)", max_points_int: 1500, scoring_scope: "individual", required: true, sort_order: 3 },
    { task_code: "T4-04", title: "การคำนวณกำลังงานของการก้าวเดิน", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 4 },
    { task_code: "T4-05", title: "การทดสอบแรงดลและการซับแรงกระแทก", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 5 },
    { task_code: "T4-06", title: "การวัดทอร์กแขนกลไบโอเมคานิกส์", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 6 },
    { task_code: "T4-07", title: "การทดสอบมอดุลัสของยังของวัสดุกายภาพ", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 7 },
    { task_code: "T4-08", title: "แบบจำลองความดันสถิตในระบบหลอดเลือด", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 8 },
    {
      task_code: "T4-09",
      title: "โครงงานนวัตกรรมฟิสิกส์สุขภาพกลุ่ม ม.4",
      max_points_int: 1500,
      scoring_scope: "mixed",
      required: true,
      sort_order: 9,
      components: [
        { component_id: "comp_shared", label: "ผลงานโครงงานกลุ่มและแบบจำลอง (คะแนนกลุ่ม)", max_points_int: 1000, type: "shared" },
        { component_id: "comp_individual", label: "การนำเสนอและการตอบคำถามรายบุคคล (คะแนนเดี่ยว)", max_points_int: 500, type: "individual" }
      ]
    }
  ],
  links: [
    { worksheet_code: "PHT4-W01", task_code: "T4-01" },
    { worksheet_code: "PHT4-W02", task_code: "T4-02" },
    { worksheet_code: "PHT4-W03", task_code: "T4-03" },
    { worksheet_code: "PHT4-W04", task_code: "T4-03" }, // Dual link: T4-03 linked to both W03 and W04!
    { worksheet_code: "PHT4-W04", task_code: "T4-04" },
    { worksheet_code: "PHT4-W05", task_code: "T4-05" },
    { worksheet_code: "PHT4-W06", task_code: "T4-06" },
    { worksheet_code: "PHT4-W07", task_code: "T4-07" },
    { worksheet_code: "PHT4-W08", task_code: "T4-08" },
    { worksheet_code: "PHT4-W09", task_code: "T4-09" }
  ]
};

// M5 Syllabus: Exactly 9 worksheets, 20 sessions x 100 min, exactly 100.00 base points (10000 hundredths)
const SYNTHETIC_M5_SYLLABUS = {
  syllabus_version_id: "syl_m5_2570_v1",
  academic_year_id: "yr_2570",
  grade: "M5",
  version_no: 1,
  course_max_points_int: 10000,
  sessions_count: 20,
  minutes_per_session: 100,
  state: "published",
  worksheets: [
    { code: "PHT5-W01", title: "ใบงานที่ 1: อุณหพลศาสตร์และการควบคุมอุณหภูมิร่างกาย", order_no: 1, session_start: 1, session_end: 2, due_at: "2026-06-15T23:59:59Z" },
    { code: "PHT5-W02", title: "ใบงานที่ 2: คลื่นเสียงและอัลตราซาวด์ทางการแพทย์", order_no: 2, session_start: 3, session_end: 4, due_at: "2026-06-30T23:59:59Z" },
    { code: "PHT5-W03", title: "ใบงานที่ 3: แสง ทัศนศาสตร์ และการตรวจสายตา", order_no: 3, session_start: 5, session_end: 6, due_at: "2026-07-15T23:59:59Z" },
    { code: "PHT5-W04", title: "ใบงานที่ 4: สถิตยศาสตร์ไฟฟ้าและศักย์ไฟฟ้าระดับเซลล์", order_no: 4, session_start: 7, session_end: 8, due_at: "2026-07-31T23:59:59Z" },
    { code: "PHT5-W05", title: "ใบงานที่ 5: ไฟฟ้ากระแสตรงและเซนเซอร์ชีวการแพทย์", order_no: 5, session_start: 9, session_end: 10, due_at: "2026-08-15T23:59:59Z" },
    { code: "PHT5-W06", title: "ใบงานที่ 6: แม่เหล็กไฟฟ้าและการถ่ายภาพเรโซแนนซ์", order_no: 6, session_start: 11, session_end: 12, due_at: "2026-08-31T23:59:59Z" },
    { code: "PHT5-W07", title: "ใบงานที่ 7: คลื่นแม่เหล็กไฟฟ้าและรังสีบำบัดเบื้องต้น", order_no: 7, session_start: 13, session_end: 14, due_at: "2026-09-15T23:59:59Z" },
    { code: "PHT5-W08", title: "ใบงานที่ 8: ฟิสิกส์อะตอมและการตรวจวินิจฉัยทางรังสี", order_no: 8, session_start: 15, session_end: 17, due_at: "2026-09-30T23:59:59Z" },
    { code: "PHT5-W09", title: "ใบงานที่ 9: นวัตกรรมสิ่งประดิษฐ์เฮลธ์เทคประยุกต์ ม.5", order_no: 9, session_start: 18, session_end: 20, due_at: "2026-10-15T23:59:59Z" }
  ],
  tasks: [
    { task_code: "T5-01", title: "การถ่ายโอนความร้อนในสิ่งมีชีวิต", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 1 },
    { task_code: "T5-02", title: "การตรวจวัดความถี่และความเข้มเสียงคลื่นอัลตราซาวด์", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 2 },
    { task_code: "T5-03", title: "การหักเหแสง เลนส์ตา และการแก้ไขสายตา", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 3 },
    { task_code: "T5-04", title: "การวัดสนามไฟฟ้าและสัญญาณ ECG จำลอง", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 4 },
    { task_code: "T5-05", title: "วงจรเซนเซอร์วัดชีพจรด้วย Photoplethysmography", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 5 },
    { task_code: "T5-06", title: "หลักการเหนี่ยวนำแม่เหล็กไฟฟ้าในเครื่องมือแพทย์", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 6 },
    { task_code: "T5-07", title: "สเปกตรัมแสงและฟิสิกส์ของ Pulse Oximeter", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 7 },
    { task_code: "T5-08", title: "การคำนวณการลดทอนของรังสีเอกซ์ในเนื้อเยื่อ", max_points_int: 1000, scoring_scope: "individual", required: true, sort_order: 8 },
    {
      task_code: "T5-09",
      title: "โครงงานนวัตกรรมฟิสิกส์สุขภาพกลุ่ม ม.5",
      max_points_int: 2000,
      scoring_scope: "mixed",
      required: true,
      sort_order: 9,
      components: [
        { component_id: "comp_shared_m5", label: "ต้นแบบสิ่งประดิษฐ์และรายงานกลุ่ม", max_points_int: 1200, type: "shared" },
        { component_id: "comp_individual_m5", label: "การนำเสนอและการทดสอบรายบุคคล", max_points_int: 800, type: "individual" }
      ]
    }
  ],
  links: [
    { worksheet_code: "PHT5-W01", task_code: "T5-01" },
    { worksheet_code: "PHT5-W02", task_code: "T5-02" },
    { worksheet_code: "PHT5-W03", task_code: "T5-03" },
    { worksheet_code: "PHT5-W04", task_code: "T5-04" },
    { worksheet_code: "PHT5-W05", task_code: "T5-05" },
    { worksheet_code: "PHT5-W06", task_code: "T5-06" },
    { worksheet_code: "PHT5-W07", task_code: "T5-07" },
    { worksheet_code: "PHT5-W08", task_code: "T5-08" },
    { worksheet_code: "PHT5-W09", task_code: "T5-09" }
  ]
};

const SYNTHETIC_GROUPS = [
  {
    group_id: "grp_001",
    academic_year_id: "yr_2570",
    grade: "M4",
    round_id: "round_1",
    title: "กลุ่มเครื่องวัดองศาข้อต่ออัจฉริยะ (Smart Goniometer)",
    members: ["std_00007", "std_00123"]
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SYNTHETIC_YEARS,
    SYNTHETIC_STUDENTS,
    SYNTHETIC_TEACHERS,
    SYNTHETIC_ENROLLMENTS,
    SYNTHETIC_M4_SYLLABUS,
    SYNTHETIC_M5_SYLLABUS,
    SYNTHETIC_GROUPS
  };
}

