/**
 * PhysicsHealthTech V2.0 - Client-Side Mock Backend
 * Provides 100% interactive functionality on GitHub Pages preview
 */

(function() {
  const M4_SYLLABUS = {
    syllabus_version_id: "syl_m4_2570_v1",
    academic_year_id: "yr_2570",
    grade: "M4",
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
      { task_code: "T4-01", title: "การทดลองการวัดความดันและสัญญาณชีพ", max_points_int: 1000, required: true },
      { task_code: "T4-02", title: "การวิเคราะห์เวกเตอร์การเคลื่อนไหวของข้อเท้า", max_points_int: 1000, required: true },
      { task_code: "T4-03", title: "การคำนวณสมดุลแรงและจุดศูนย์ถ่วง (Link W3, W4)", max_points_int: 1500, required: true },
      { task_code: "T4-04", title: "การคำนวณกำลังงานของการก้าวเดิน", max_points_int: 1000, required: true },
      { task_code: "T4-05", title: "การทดสอบแรงดลและการซับแรงกระแทก", max_points_int: 1000, required: true },
      { task_code: "T4-06", title: "การวัดทอร์กแขนกลไบโอเมคานิกส์", max_points_int: 1000, required: true },
      { task_code: "T4-07", title: "การทดสอบมอดุลัสของยังของวัสดุกายภาพ", max_points_int: 1000, required: true },
      { task_code: "T4-08", title: "แบบจำลองความดันสถิตในระบบหลอดเลือด", max_points_int: 1000, required: true },
      {
        task_code: "T4-09",
        title: "โครงงานนวัตกรรมฟิสิกส์สุขภาพกลุ่ม ม.4",
        max_points_int: 1500,
        scoring_scope: "mixed",
        required: true,
        components: [
          { component_id: "comp_shared", label: "ผลงานโครงงานกลุ่ม", max_points_int: 1000 },
          { component_id: "comp_individual", label: "การนำเสนอรายบุคคล", max_points_int: 500 }
        ]
      }
    ],
    links: [
      { worksheet_code: "PHT4-W01", task_code: "T4-01" },
      { worksheet_code: "PHT4-W02", task_code: "T4-02" },
      { worksheet_code: "PHT4-W03", task_code: "T4-03" },
      { worksheet_code: "PHT4-W04", task_code: "T4-03" },
      { worksheet_code: "PHT4-W04", task_code: "T4-04" },
      { worksheet_code: "PHT4-W05", task_code: "T4-05" },
      { worksheet_code: "PHT4-W06", task_code: "T4-06" },
      { worksheet_code: "PHT4-W07", task_code: "T4-07" },
      { worksheet_code: "PHT4-W08", task_code: "T4-08" },
      { worksheet_code: "PHT4-W09", task_code: "T4-09" }
    ]
  };

  const M5_SYLLABUS = {
    syllabus_version_id: "syl_m5_2570_v1",
    academic_year_id: "yr_2570",
    grade: "M5",
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
      { task_code: "T5-01", title: "การถ่ายโอนความร้อนในสิ่งมีชีวิต", max_points_int: 1000, required: true },
      { task_code: "T5-02", title: "การตรวจวัดความถี่และความเข้มเสียงคลื่นอัลตราซาวด์", max_points_int: 1000, required: true },
      { task_code: "T5-03", title: "การหักเหแสง เลนส์ตา และการแก้ไขสายตา", max_points_int: 1000, required: true },
      { task_code: "T5-04", title: "การวัดสนามไฟฟ้าและสัญญาณ ECG จำลอง", max_points_int: 1000, required: true },
      { task_code: "T5-05", title: "วงจรเซนเซอร์วัดชีพจรด้วย Photoplethysmography", max_points_int: 1000, required: true },
      { task_code: "T5-06", title: "หลักการเหนี่ยวนำแม่เหล็กไฟฟ้าในเครื่องมือแพทย์", max_points_int: 1000, required: true },
      { task_code: "T5-07", title: "สเปกตรัมแสงและฟิสิกส์ของ Pulse Oximeter", max_points_int: 1000, required: true },
      { task_code: "T5-08", title: "การคำนวณการลดทอนของรังสีเอกซ์ในเนื้อเยื่อ", max_points_int: 1000, required: true },
      {
        task_code: "T5-09",
        title: "โครงงานนวัตกรรมฟิสิกส์สุขภาพกลุ่ม ม.5",
        max_points_int: 2000,
        scoring_scope: "mixed",
        required: true,
        components: [
          { component_id: "comp_shared_m5", label: "ต้นแบบสิ่งประดิษฐ์และรายงานกลุ่ม", max_points_int: 1200 },
          { component_id: "comp_individual_m5", label: "การนำเสนอและการทดสอบรายบุคคล", max_points_int: 800 }
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


  const OFFICIAL_STUDENTS_2569 = [
    {
        "student_uid": "std_99999",
        "code_5_digit": "99999",
        "display_name": "นายทดสอบ ห้องวิทย์สุขภาพ",
        "status": "active"
    },
    {
        "student_uid": "std_17763",
        "code_5_digit": "17763",
        "display_name": "นายพิพัฒน์ จุลบุตร",
        "status": "active"
    },
    {
        "student_uid": "std_17808",
        "code_5_digit": "17808",
        "display_name": "นายอโณทัย จรัญไชยกุล",
        "status": "active"
    },
    {
        "student_uid": "std_17837",
        "code_5_digit": "17837",
        "display_name": "นายชัชพงษ์ ไชยา",
        "status": "active"
    },
    {
        "student_uid": "std_17875",
        "code_5_digit": "17875",
        "display_name": "นายกฤตนันท์ กมลดีเยี่ยม",
        "status": "active"
    },
    {
        "student_uid": "std_17997",
        "code_5_digit": "17997",
        "display_name": "นายธำรงวิทย์ สกุลแก้วทิพย์",
        "status": "active"
    },
    {
        "student_uid": "std_19447",
        "code_5_digit": "19447",
        "display_name": "นายวิธวินท์ วารุณรัตนกร",
        "status": "active"
    },
    {
        "student_uid": "std_17779",
        "code_5_digit": "17779",
        "display_name": "นางสาวพนิดา นันทภัทร",
        "status": "active"
    },
    {
        "student_uid": "std_17780",
        "code_5_digit": "17780",
        "display_name": "นางสาวพรรณภัทร ภู่ตระกูล",
        "status": "active"
    },
    {
        "student_uid": "std_17784",
        "code_5_digit": "17784",
        "display_name": "นางสาวพีชญา สุธรรม",
        "status": "active"
    },
    {
        "student_uid": "std_17789",
        "code_5_digit": "17789",
        "display_name": "นางสาวสุวพิชชา บุญโญรส",
        "status": "active"
    },
    {
        "student_uid": "std_17790",
        "code_5_digit": "17790",
        "display_name": "นางสาวหน่อคริเฮ่ตา",
        "status": "active"
    },
    {
        "student_uid": "std_17810",
        "code_5_digit": "17810",
        "display_name": "นางสาวกันย์สินี ศรีชัยสถาน",
        "status": "active"
    },
    {
        "student_uid": "std_17813",
        "code_5_digit": "17813",
        "display_name": "นางสาวชมพูนุช เมธาธารณ์กุล",
        "status": "active"
    },
    {
        "student_uid": "std_17814",
        "code_5_digit": "17814",
        "display_name": "นางสาวชุติกาญจน์ ทองประดิษฐ์",
        "status": "active"
    },
    {
        "student_uid": "std_17817",
        "code_5_digit": "17817",
        "display_name": "นางสาวณัฐาวีรนุช เมืองเมา",
        "status": "active"
    },
    {
        "student_uid": "std_17826",
        "code_5_digit": "17826",
        "display_name": "เด็กหญิงลักษิกา ถาวร",
        "status": "active"
    },
    {
        "student_uid": "std_17827",
        "code_5_digit": "17827",
        "display_name": "นางสาววันเพ็ญ แว่นมรกต",
        "status": "active"
    },
    {
        "student_uid": "std_17832",
        "code_5_digit": "17832",
        "display_name": "นางสาวเกวลี ไพรสรรเสริญ",
        "status": "active"
    },
    {
        "student_uid": "std_17858",
        "code_5_digit": "17858",
        "display_name": "นางสาวชุติมา ธรรมเกิดสุข",
        "status": "active"
    },
    {
        "student_uid": "std_17860",
        "code_5_digit": "17860",
        "display_name": "นางสาวณัฐกฤตา มิ่งขวัญ",
        "status": "active"
    },
    {
        "student_uid": "std_17869",
        "code_5_digit": "17869",
        "display_name": "เด็กหญิงพิชญ์สินี วงศ์อรฉัตร",
        "status": "active"
    },
    {
        "student_uid": "std_17900",
        "code_5_digit": "17900",
        "display_name": "นางสาวณัฐกมล ทาลาว",
        "status": "active"
    },
    {
        "student_uid": "std_17947",
        "code_5_digit": "17947",
        "display_name": "นางสาวพิชญา พนมไพร",
        "status": "active"
    },
    {
        "student_uid": "std_17979",
        "code_5_digit": "17979",
        "display_name": "นางสาวกาญจนา ไกรเกริกเกียรติ",
        "status": "active"
    },
    {
        "student_uid": "std_17983",
        "code_5_digit": "17983",
        "display_name": "นางสาวนฐพร จุลบุตร",
        "status": "active"
    },
    {
        "student_uid": "std_18058",
        "code_5_digit": "18058",
        "display_name": "นางสาวฐิติมา คำนวณพนม",
        "status": "active"
    },
    {
        "student_uid": "std_18680",
        "code_5_digit": "18680",
        "display_name": "นางสาวฟ้าใส มุ่งศรีโสภณ",
        "status": "active"
    },
    {
        "student_uid": "std_19448",
        "code_5_digit": "19448",
        "display_name": "นางสาวมนต์นภา ปัทมชัยกุล",
        "status": "active"
    },
    {
        "student_uid": "std_19449",
        "code_5_digit": "19449",
        "display_name": "นางสาวธัญนิศญาน์ หว่างไม",
        "status": "active"
    },
    {
        "student_uid": "std_19450",
        "code_5_digit": "19450",
        "display_name": "เด็กหญิงแสงดาว เรืองแก้วนพเก้า",
        "status": "active"
    },
    {
        "student_uid": "std_17388",
        "code_5_digit": "17388",
        "display_name": "นายพิตติพันท์ ปิยโชคนิธิสกุล",
        "status": "active"
    },
    {
        "student_uid": "std_17395",
        "code_5_digit": "17395",
        "display_name": "นายฐิติวัสส์ พัฒน์พงศ์สกุล",
        "status": "active"
    },
    {
        "student_uid": "std_17397",
        "code_5_digit": "17397",
        "display_name": "นายหาญหนุ่ม",
        "status": "active"
    },
    {
        "student_uid": "std_17539",
        "code_5_digit": "17539",
        "display_name": "นายณัฐวุฒิ เสรีธรรมพิทักษ์",
        "status": "active"
    },
    {
        "student_uid": "std_17581",
        "code_5_digit": "17581",
        "display_name": "นายพงษ์สิทธิ์ เลาซาง",
        "status": "active"
    },
    {
        "student_uid": "std_18721",
        "code_5_digit": "18721",
        "display_name": "นายธีรศานต์ เชาว์พิกุล",
        "status": "active"
    },
    {
        "student_uid": "std_18722",
        "code_5_digit": "18722",
        "display_name": "นายสุรนาท ศรีปัญญาเลิศ",
        "status": "active"
    },
    {
        "student_uid": "std_18723",
        "code_5_digit": "18723",
        "display_name": "นายเทพรัตน์ โซพุทรา",
        "status": "active"
    },
    {
        "student_uid": "std_17405",
        "code_5_digit": "17405",
        "display_name": "นางสาวณัฐณิชา มงคล",
        "status": "active"
    },
    {
        "student_uid": "std_17411",
        "code_5_digit": "17411",
        "display_name": "นางสาวนิจวิภา พรานวิเวทย์",
        "status": "active"
    },
    {
        "student_uid": "std_17440",
        "code_5_digit": "17440",
        "display_name": "เด็กหญิงจันทร์ละวันดาว แซ่เจ๊า",
        "status": "active"
    },
    {
        "student_uid": "std_17441",
        "code_5_digit": "17441",
        "display_name": "นางสาวจิณห์ชนัณ สว่างธรรมศรี",
        "status": "active"
    },
    {
        "student_uid": "std_17458",
        "code_5_digit": "17458",
        "display_name": "เด็กหญิงลัลล์ลลิล สันติสุข",
        "status": "active"
    },
    {
        "student_uid": "std_17478",
        "code_5_digit": "17478",
        "display_name": "นางสาวกันภิรมย์ กองฤทธิ์",
        "status": "active"
    },
    {
        "student_uid": "std_17481",
        "code_5_digit": "17481",
        "display_name": "นางสาวจรรยพร พนมไพร",
        "status": "active"
    },
    {
        "student_uid": "std_17482",
        "code_5_digit": "17482",
        "display_name": "นางสาวซากุระ หว่างป่อ",
        "status": "active"
    },
    {
        "student_uid": "std_17495",
        "code_5_digit": "17495",
        "display_name": "นางสาววรัญรักษ์ นิยมวงษ์",
        "status": "active"
    },
    {
        "student_uid": "std_17498",
        "code_5_digit": "17498",
        "display_name": "นางสาวอังคณา ธนโชติหิรัญวงศ์",
        "status": "active"
    },
    {
        "student_uid": "std_17520",
        "code_5_digit": "17520",
        "display_name": "นางสาวกุลนัดดา จิโน",
        "status": "active"
    },
    {
        "student_uid": "std_17522",
        "code_5_digit": "17522",
        "display_name": "นางสาวณัฐวดี วรรณโชติโยธิน",
        "status": "active"
    },
    {
        "student_uid": "std_17532",
        "code_5_digit": "17532",
        "display_name": "นางสาวอัยยา มั่นคง",
        "status": "active"
    },
    {
        "student_uid": "std_17598",
        "code_5_digit": "17598",
        "display_name": "นางสาวแพรวดาว สร้อยคำ",
        "status": "active"
    },
    {
        "student_uid": "std_17626",
        "code_5_digit": "17626",
        "display_name": "นางสาวนาริรัตน์ สิงขรสุกใส",
        "status": "active"
    },
    {
        "student_uid": "std_17630",
        "code_5_digit": "17630",
        "display_name": "นางสาววชิราภรณ์ ชวลิตทวีรัตน์",
        "status": "active"
    },
    {
        "student_uid": "std_18725",
        "code_5_digit": "18725",
        "display_name": "นางสาวบัณฑิตา โกรกกลาง",
        "status": "active"
    },
    {
        "student_uid": "std_18726",
        "code_5_digit": "18726",
        "display_name": "นางสาวพิชญา ไพรรุ่งเรือง",
        "status": "active"
    },
    {
        "student_uid": "std_19130",
        "code_5_digit": "19130",
        "display_name": "นางสาวมนัสนันท์ จันทร์แก้ว",
        "status": "active"
    }
];

  const OFFICIAL_ENROLLMENTS_2569 = [
    {
        "enrollment_id": "enr_m4_999",
        "academic_year_id": "yr_2569",
        "student_uid": "std_99999",
        "grade": "M4",
        "room": "1",
        "roll_no": 99,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_001",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17763",
        "grade": "M4",
        "room": "1",
        "roll_no": 1,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_002",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17808",
        "grade": "M4",
        "room": "1",
        "roll_no": 2,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_003",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17837",
        "grade": "M4",
        "room": "1",
        "roll_no": 3,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_004",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17875",
        "grade": "M4",
        "room": "1",
        "roll_no": 4,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_005",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17997",
        "grade": "M4",
        "room": "1",
        "roll_no": 5,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_006",
        "academic_year_id": "yr_2569",
        "student_uid": "std_19447",
        "grade": "M4",
        "room": "1",
        "roll_no": 6,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_007",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17779",
        "grade": "M4",
        "room": "1",
        "roll_no": 7,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_008",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17780",
        "grade": "M4",
        "room": "1",
        "roll_no": 8,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_009",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17784",
        "grade": "M4",
        "room": "1",
        "roll_no": 9,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_010",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17789",
        "grade": "M4",
        "room": "1",
        "roll_no": 10,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_011",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17790",
        "grade": "M4",
        "room": "1",
        "roll_no": 11,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_012",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17810",
        "grade": "M4",
        "room": "1",
        "roll_no": 12,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_013",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17813",
        "grade": "M4",
        "room": "1",
        "roll_no": 13,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_014",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17814",
        "grade": "M4",
        "room": "1",
        "roll_no": 14,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_015",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17817",
        "grade": "M4",
        "room": "1",
        "roll_no": 15,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_016",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17826",
        "grade": "M4",
        "room": "1",
        "roll_no": 16,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_017",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17827",
        "grade": "M4",
        "room": "1",
        "roll_no": 17,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_018",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17832",
        "grade": "M4",
        "room": "1",
        "roll_no": 18,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_019",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17858",
        "grade": "M4",
        "room": "1",
        "roll_no": 19,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_020",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17860",
        "grade": "M4",
        "room": "1",
        "roll_no": 20,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_021",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17869",
        "grade": "M4",
        "room": "1",
        "roll_no": 21,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_022",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17900",
        "grade": "M4",
        "room": "1",
        "roll_no": 22,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_023",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17947",
        "grade": "M4",
        "room": "1",
        "roll_no": 23,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_024",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17979",
        "grade": "M4",
        "room": "1",
        "roll_no": 24,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_025",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17983",
        "grade": "M4",
        "room": "1",
        "roll_no": 25,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_026",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18058",
        "grade": "M4",
        "room": "1",
        "roll_no": 26,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_027",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18680",
        "grade": "M4",
        "room": "1",
        "roll_no": 27,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_028",
        "academic_year_id": "yr_2569",
        "student_uid": "std_19448",
        "grade": "M4",
        "room": "1",
        "roll_no": 28,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_029",
        "academic_year_id": "yr_2569",
        "student_uid": "std_19449",
        "grade": "M4",
        "room": "1",
        "roll_no": 29,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m4_030",
        "academic_year_id": "yr_2569",
        "student_uid": "std_19450",
        "grade": "M4",
        "room": "1",
        "roll_no": 30,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_001",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17388",
        "grade": "M5",
        "room": "1",
        "roll_no": 1,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_002",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17395",
        "grade": "M5",
        "room": "1",
        "roll_no": 2,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_003",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17397",
        "grade": "M5",
        "room": "1",
        "roll_no": 3,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_004",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17539",
        "grade": "M5",
        "room": "1",
        "roll_no": 4,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_005",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17581",
        "grade": "M5",
        "room": "1",
        "roll_no": 5,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_006",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18721",
        "grade": "M5",
        "room": "1",
        "roll_no": 6,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_007",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18722",
        "grade": "M5",
        "room": "1",
        "roll_no": 7,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_008",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18723",
        "grade": "M5",
        "room": "1",
        "roll_no": 8,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_009",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17405",
        "grade": "M5",
        "room": "1",
        "roll_no": 9,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_010",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17411",
        "grade": "M5",
        "room": "1",
        "roll_no": 10,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_011",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17440",
        "grade": "M5",
        "room": "1",
        "roll_no": 11,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_012",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17441",
        "grade": "M5",
        "room": "1",
        "roll_no": 12,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_013",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17458",
        "grade": "M5",
        "room": "1",
        "roll_no": 13,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_014",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17478",
        "grade": "M5",
        "room": "1",
        "roll_no": 14,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_015",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17481",
        "grade": "M5",
        "room": "1",
        "roll_no": 15,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_016",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17482",
        "grade": "M5",
        "room": "1",
        "roll_no": 16,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_017",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17495",
        "grade": "M5",
        "room": "1",
        "roll_no": 17,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_018",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17498",
        "grade": "M5",
        "room": "1",
        "roll_no": 18,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_019",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17520",
        "grade": "M5",
        "room": "1",
        "roll_no": 19,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_020",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17522",
        "grade": "M5",
        "room": "1",
        "roll_no": 20,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_021",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17532",
        "grade": "M5",
        "room": "1",
        "roll_no": 21,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_022",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17598",
        "grade": "M5",
        "room": "1",
        "roll_no": 22,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_023",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17626",
        "grade": "M5",
        "room": "1",
        "roll_no": 23,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_024",
        "academic_year_id": "yr_2569",
        "student_uid": "std_17630",
        "grade": "M5",
        "room": "1",
        "roll_no": 24,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_025",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18725",
        "grade": "M5",
        "room": "1",
        "roll_no": 25,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_026",
        "academic_year_id": "yr_2569",
        "student_uid": "std_18726",
        "grade": "M5",
        "room": "1",
        "roll_no": 26,
        "status": "active"
    },
    {
        "enrollment_id": "enr_m5_027",
        "academic_year_id": "yr_2569",
        "student_uid": "std_19130",
        "grade": "M5",
        "room": "1",
        "roll_no": 27,
        "status": "active"
    }
];

  const STUDENTS = [
    { student_uid: "std_00007", code_5_digit: "00007", display_name: "นายสมชาย มั่นใจ", secret_plain: "PhtSecret#00007A", status: "active" },
    { student_uid: "std_00123", code_5_digit: "00123", display_name: "น.ส.สมหญิง ชำนาญคิด", secret_plain: "PhtSecret#00123B", status: "active" },
    { student_uid: "std_00999", code_5_digit: "00999", display_name: "นายกิตติศักดิ์ นักประดิษฐ์", secret_plain: "PhtSecret#00999C", status: "active" },
    { student_uid: "std_91234", code_5_digit: "91234", display_name: "น.ส.พัชรา วิทยาการ", secret_plain: "PhtSecret#91234D", status: "active" }
  ];

  const TEACHERS = [
    { teacher_uid: "tch_001", name: "ครูผู้สอน วิชาฟิสิกส์สุขภาพ", email: "teacher.physics@school.ac.th", auth_secret: "coolnut1618", role: "teacher", status: "active" }
  ];

  const ENROLLMENTS = [
    { enrollment_id: "enr_001", academic_year_id: "yr_2570", student_uid: "std_00007", grade: "M4", room: "1", roll_no: 1, status: "active" },
    { enrollment_id: "enr_002", academic_year_id: "yr_2570", student_uid: "std_00123", grade: "M4", room: "1", roll_no: 2, status: "active" },
    { enrollment_id: "enr_003", academic_year_id: "yr_2570", student_uid: "std_00999", grade: "M4", room: "1", roll_no: 10, status: "active" },
    { enrollment_id: "enr_004", academic_year_id: "yr_2570", student_uid: "std_91234", grade: "M5", room: "2", roll_no: 1, status: "active" }
  ];

  // In-memory data store for browser session
  const memoryDB = {
    students: [...STUDENTS, ...OFFICIAL_STUDENTS_2569],
    teachers: [...TEACHERS],
    enrollments: [...ENROLLMENTS, ...OFFICIAL_ENROLLMENTS_2569],
    syllabi: [
      M4_SYLLABUS,
      M5_SYLLABUS,
      { ...M4_SYLLABUS, syllabus_version_id: "syl_m4_2569_v1", academic_year_id: "yr_2569" },
      { ...M5_SYLLABUS, syllabus_version_id: "syl_m5_2569_v1", academic_year_id: "yr_2569" }
    ],
    years: [
      { academic_year_id: "yr_2569", year_be: 2569, state: "open" },
      { academic_year_id: "yr_2570", year_be: 2570, state: "open" }
    ],
    submissions: [],
    submissionVersions: [],
    stagedFiles: [],
    gradeEntries: [],
    gradeRevisions: [],
    gradeDrafts: [],
    bonusAwards: [],
    evidenceReviews: [],
    projects: [],
    projectArtifacts: [],
    groups: [
      {
        group_id: "grp_001",
        academic_year_id: "yr_2570",
        grade: "M4",
        round_id: "round_1",
        title: "กลุ่มเครื่องวัดองศาข้อต่ออัจฉริยะ (Smart Goniometer)",
        members: ["std_00007", "std_00123"]
      }
    ],
    sessions: new Map(),
    failedAttempts: new Map()
  };

  // Prepopulate sample submission & grade for demonstration
  memoryDB.submissions.push({
    submission_id: "sub_demo_1",
    academic_year_id: "yr_2570",
    grade: "M4",
    worksheet_code: "PHT4-W01",
    student_uid: "std_00007",
    latest_version_id: "subv_demo_1",
    latest_version_no: 1,
    latest_version_submitted_at: "2026-06-10T10:00:00Z",
    state: "submitted",
    out_of_roster: false
  });

  memoryDB.submissionVersions.push({
    submission_version_id: "subv_demo_1",
    submission_id: "sub_demo_1",
    version_no: 1,
    submitted_by_uid: "std_00007",
    submitted_at: "2026-06-10T10:00:00Z",
    note: "ส่งใบงานที่ 1 การทดลองครบถ้วนครับ"
  });

  memoryDB.stagedFiles.push({
    evidence_id: "ev_demo_1",
    submission_version_id: "subv_demo_1",
    mime_type: "image/jpeg",
    size_bytes: 524288
  });

  memoryDB.gradeEntries.push({
    grade_entry_id: "ge_demo_1",
    syllabus_version_id: "syl_m4_2570_v1",
    student_uid: "std_00007",
    task_code: "T4-01",
    current_points_int: 950,
    base_points_int: 950,
    state: "published",
    feedback: "บันทึกผลการทดลองได้ละเอียดดีมาก",
    updated_at: "2026-06-12T14:30:00Z"
  });

  const MockBackend = {
    handleApi(action, payload, sessionToken) {
      // 1. Auth actions
      if (action === "auth.studentLogin") {
        const { code_5_digit, secret } = payload;
        const code = String(code_5_digit || "").trim().padStart(5, "0");
        const student = memoryDB.students.find(s => s.code_5_digit === code);

        if (!student) {
          return { ok: false, error: { code: "INVALID_CREDENTIALS", message_th: "ไม่พบรหัสนักเรียน 5 หลักนี้ในระบบ" } };
        }

        // Check password only if password is configured and wrong password entered
        if (student.secret_plain && secret && student.secret_plain !== secret) {
          return { ok: false, error: { code: "INVALID_CREDENTIALS", message_th: "รหัสผ่านไม่ถูกต้อง" } };
        }

        const token = "mock_token_" + Math.random().toString(16).substring(2);
        
        // Find active enrollments
        const studentEnrollments = memoryDB.enrollments.filter(e => e.student_uid === student.student_uid && e.status === "active");
        studentEnrollments.sort((a, b) => b.academic_year_id.localeCompare(a.academic_year_id));
        const activeEnr = studentEnrollments[0] || null;

        const availableEnrollments = studentEnrollments.map(e => {
          const yr = memoryDB.years.find(y => y.academic_year_id === e.academic_year_id);
          const yNum = yr ? yr.year_be : parseInt(e.academic_year_id.replace(/\D/g, "") || "2569", 10);
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
        };
      }

      if (action === "auth.teacherLogin") {
        const { auth_secret } = payload;
        const teacher = memoryDB.teachers.find(t => t.auth_secret === auth_secret);

        if (!teacher) {
          return { ok: false, error: { code: "ACCESS_DENIED", message_th: "รหัสยืนยันตัวตนสำหรับครูผู้สอนไม่ถูกต้อง" } };
        }

        const token = "mock_tch_token_" + Math.random().toString(16).substring(2);
        memoryDB.sessions.set(token, {
          principal_uid: teacher.teacher_uid,
          principal_type: "teacher",
          role: teacher.role
        });

        return {
          ok: true,
          data: {
            session_token: token,
            profile: {
              teacher_uid: teacher.teacher_uid,
              name: teacher.name,
              email: teacher.email,
              role: teacher.role
            }
          }
        };
      }

      // Check session
      const session = memoryDB.sessions.get(sessionToken);
      if (!session) {
        return { ok: false, error: { code: "SESSION_EXPIRED", message_th: "เซสชันการใช้งานหมดอายุ โปรดเข้าสู่ระบบใหม่" } };
      }

      if (action === "auth.logout") {
        memoryDB.sessions.delete(sessionToken);
        return { ok: true, data: { revoked: true } };
      }

      if (action === "years.list") {
        return { ok: true, data: { years: memoryDB.years } };
      }

      // 2. Student Dashboard
      if (action === "student.dashboard") {
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
        }

        const publishedGrades = memoryDB.gradeEntries.filter(g => g.student_uid === session.principal_uid && g.syllabus_version_id === syllabus.syllabus_version_id && g.state === "published");
        const bonuses = memoryDB.bonusAwards.filter(b => b.student_uid === session.principal_uid && b.state === "approved");

        let earnedInt = 0;
        let reviewedMaxInt = 0;
        let reviewedCount = 0;
        const gradeMap = new Map();
        publishedGrades.forEach(g => {
          gradeMap.set(g.task_code, g);
          earnedInt += g.current_points_int || 0;
        });

        syllabus.tasks.forEach(t => {
          if (gradeMap.has(t.task_code)) {
            reviewedMaxInt += t.max_points_int;
            reviewedCount++;
          }
        });

        let bonusInt = 0;
        bonuses.forEach(b => bonusInt += b.points_int);
        const accumulatedInt = Math.min(10000, earnedInt + bonusInt);

        // Build 9 cards
        const worksheetCards = syllabus.worksheets.map(ws => {
          const sub = memoryDB.submissions.find(s => s.worksheet_code === ws.code && s.student_uid === session.principal_uid);
          const review = sub ? memoryDB.evidenceReviews.find(r => r.submission_id === sub.submission_id) : null;
          
          let mainStatus = "not_submitted";
          let statusLabel = "ยังไม่ส่ง";

          if (sub) {
            if (review && review.decision_state === "needs_revision") {
              mainStatus = "revision_required";
              statusLabel = "ส่งกลับให้แก้ไข";
            } else {
              const linkedTaskCodes = syllabus.links.filter(l => l.worksheet_code === ws.code).map(l => l.task_code);
              const allGraded = linkedTaskCodes.length > 0 && linkedTaskCodes.every(code => gradeMap.has(code));
              if (allGraded) {
                mainStatus = "graded";
                statusLabel = "ตรวจแล้ว";
              } else {
                mainStatus = "submitted";
                statusLabel = "ส่งแล้ว — รอตรวจ";
              }
            }
          }

          const linkedTasks = syllabus.links.filter(l => l.worksheet_code === ws.code).map(l => {
            const task = syllabus.tasks.find(t => t.task_code === l.task_code);
            const grade = gradeMap.get(task.task_code);
            return {
              task_code: task.task_code,
              title: task.title,
              max_points: task.max_points_int / 100,
              published_points: grade ? (grade.current_points_int / 100) : null,
              grading_label_th: grade ? "ตรวจแล้ว" : "รอตรวจ",
              feedback: grade ? grade.feedback : null
            };
          });

          return {
            worksheet_code: ws.code,
            title: ws.title,
            order_no: ws.order_no,
            session_range: `${ws.session_start}-${ws.session_end}`,
            due_at: ws.due_at,
            main_status: mainStatus,
            status_label_th: statusLabel,
            task_summaries: linkedTasks,
            submission_latest_version_no: sub ? sub.latest_version_no : 0,
            submission_id: sub ? sub.submission_id : null
          };
        });

        const submittedCount = worksheetCards.filter(c => c.main_status !== "not_submitted").length;
        const gradedCount = worksheetCards.filter(c => c.main_status === "graded").length;

        return {
          ok: true,
          data: {
            profile: {
              student_uid: student.student_uid,
              code_5_digit: student.code_5_digit,
              display_name: student.display_name,
              year_be: enrollment ? (memoryDB.years.find(y => y.academic_year_id === enrollment.academic_year_id)?.year_be || 2569) : 2569,
              available_enrollments: memoryDB.enrollments.filter(e => e.student_uid === student.student_uid && e.status === "active").map(e => ({
                enrollment_id: e.enrollment_id,
                academic_year_id: e.academic_year_id,
                year: memoryDB.years.find(y => y.academic_year_id === e.academic_year_id)?.year_be || parseInt(e.academic_year_id.replace(/\D/g, "") || "2569", 10),
                grade: e.grade,
                room: e.room,
                roll_no: e.roll_no
              })),
              grade: grade,
              room: enrollment ? enrollment.room : null,
              roll_no: enrollment ? enrollment.roll_no : null,
              is_out_of_roster: !enrollment
            },
            score_summary: {
              graded_earned_points: (earnedInt / 100).toFixed(1),
              reviewed_max_points: (reviewedMaxInt / 100).toFixed(1),
              approved_bonus_points: (bonusInt / 100).toFixed(1),
              accumulated_points_capped_100: (accumulatedInt / 100).toFixed(1),
              course_max_points: 100.0,
              pending_task_count: syllabus.tasks.length - reviewedCount,
              total_task_count: syllabus.tasks.length,
              fully_graded: reviewedCount === syllabus.tasks.length
            },
            worksheet_summary: {
              total_required: 9,
              submitted_distinct: submittedCount,
              graded_distinct: gradedCount,
              not_submitted_distinct: 9 - submittedCount,
              progress_percent: Math.round((submittedCount / 9) * 100)
            },
            worksheet_cards: worksheetCards
          }
        };
      }

      // 3.0 Batch Upload (Single roundtrip high-performance upload)
      if (action === "submissions.submitBatch") {
        const studentUid = session.principal_uid;
        const { worksheet_code, academic_year_id, grade, note, files } = payload;
        
        const existingSub = memoryDB.submissions.find(s => 
          s.worksheet_code === worksheet_code && 
          s.student_uid === studentUid && 
          s.academic_year_id === academic_year_id &&
          s.grade === grade
        );

        const newVersionNo = existingSub ? (existingSub.latest_version_no + 1) : 1;
        const versionId = "subv_" + Math.random().toString(16).substring(2, 10);
        const subId = existingSub ? existingSub.submission_id : ("sub_" + Math.random().toString(16).substring(2, 10));
        const now = new Date().toISOString();

        if (existingSub) {
          existingSub.latest_version_id = versionId;
          existingSub.latest_version_no = newVersionNo;
          existingSub.latest_version_submitted_at = now;
          existingSub.state = "submitted";
          existingSub.updated_at = now;
        } else {
          memoryDB.submissions.push({
            submission_id: subId,
            academic_year_id,
            grade,
            worksheet_code,
            student_uid: studentUid,
            latest_version_id: versionId,
            latest_version_no: newVersionNo,
            latest_version_submitted_at: now,
            state: "submitted",
            out_of_roster: false,
            created_at: now
          });
        }

        memoryDB.submissionVersions.push({
          submission_version_id: versionId,
          submission_id: subId,
          version_no: newVersionNo,
          submitted_by_uid: studentUid,
          submitted_at: now,
          note: note || "",
          state_at_submit: "submitted",
          out_of_roster_at_submit: false
        });

        (files || []).forEach((f, idx) => {
          const evId = "ev_" + Math.random().toString(16).substring(2, 10);
          memoryDB.evidence.push({
            evidence_id: evId,
            submission_version_id: versionId,
            student_uid: studentUid,
            file_name: f.file_name || "page_" + (idx + 1) + ".jpg",
            file_base64: f.file_base64,
            mime_type: f.mime_type || "image/jpeg",
            status: "active",
            created_at: now
          });
        });

        return {
          ok: true,
          data: {
            submission_id: subId,
            version_no: newVersionNo,
            submitted_at: now
          }
        };
      }

      // 3. Submissions
      if (action === "submissions.begin") {
        return {
          ok: true,
          data: {
            upload_op_id: "op_" + Math.random().toString(16).substring(2),
            worksheet_code: payload.worksheet_code
          }
        };
      }

      if (action === "submissions.uploadEvidence") {
        const evId = "ev_" + Math.random().toString(16).substring(2);
        memoryDB.stagedFiles.push({
          evidence_id: evId,
          upload_op_id: payload.upload_op_id,
          mime_type: payload.mime_type || "image/jpeg",
          size_bytes: 524288,
          data_url: payload.file_base64.startsWith("data:") ? payload.file_base64 : `data:image/jpeg;base64,${payload.file_base64}`
        });
        return { ok: true, data: { evidence_id: evId } };
      }

      if (action === "submissions.complete") {
        const { worksheet_code, academic_year_id, grade, note, upload_op_id } = payload;
        let sub = memoryDB.submissions.find(s => s.worksheet_code === worksheet_code && s.student_uid === session.principal_uid);
        const newVer = sub ? (sub.latest_version_no + 1) : 1;
        const verId = "subv_" + Math.random().toString(16).substring(2);

        if (!sub) {
          sub = {
            submission_id: "sub_" + Math.random().toString(16).substring(2),
            academic_year_id,
            grade,
            worksheet_code,
            student_uid: session.principal_uid,
            latest_version_id: verId,
            latest_version_no: newVer,
            latest_version_submitted_at: new Date().toISOString(),
            state: "submitted",
            out_of_roster: false
          };
          memoryDB.submissions.push(sub);
        } else {
          sub.latest_version_id = verId;
          sub.latest_version_no = newVer;
          sub.latest_version_submitted_at = new Date().toISOString();
          sub.state = "submitted";
        }

        memoryDB.submissionVersions.push({
          submission_version_id: verId,
          submission_id: sub.submission_id,
          version_no: newVer,
          submitted_by_uid: session.principal_uid,
          submitted_at: new Date().toISOString(),
          note: note || ""
        });

        return {
          ok: true,
          data: {
            submission_id: sub.submission_id,
            version_no: newVer,
            status_label_th: "ส่งแล้ว — รอตรวจ",
            message_th: "ส่งใบงานเรียบร้อยแล้ว"
          }
        };
      }

      if (action === "submissions.history") {
        let studentUid = session.principal_uid;
        if (session.principal_type === "teacher" || session.role === "teacher") {
          studentUid = payload.student_uid || session.principal_uid;
        }
        const { worksheet_code } = payload;
        const sub = memoryDB.submissions.find(s => s.worksheet_code === worksheet_code && s.student_uid === studentUid);
        if (!sub) {
          return { ok: true, data: { worksheet_code, latest_version_no: 0, versions: [] } };
        }
        const versions = memoryDB.submissionVersions
          .filter(v => v.submission_id === sub.submission_id)
          .sort((a, b) => b.version_no - a.version_no)
          .map(v => {
            const files = memoryDB.stagedFiles.filter(f => f.submission_version_id === v.submission_version_id);
            const review = memoryDB.evidenceReviews.find(r => r.submission_id === sub.submission_id);
            return {
              submission_version_id: v.submission_version_id,
              version_no: v.version_no,
              submitted_at: v.submitted_at,
              note: v.note,
              files: files.map(f => ({
                evidence_id: f.evidence_id,
                file_name: f.file_name || "evidence.jpg",
                mime_type: f.mime_type || "image/jpeg",
                size_bytes: f.size_bytes || 1024,
                data_url: f.data_url || ""
              })),
              review: review ? {
                decision_state: review.decision_state,
                feedback: review.feedback,
                reviewed_at: review.reviewed_at
              } : null
            };
          });

        return {
          ok: true,
          data: {
            submission_id: sub.submission_id,
            worksheet_code,
            latest_version_no: sub.latest_version_no,
            versions
          }
        };
      }

      // 4. Evidence Preview
      if (action === "evidence.preview") {
        const file = memoryDB.stagedFiles.find(f => f.evidence_id === payload.evidence_id);
        const placeholderImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23e2e8f0'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'>ภาพหลักฐานใบงานฟิสิกส์สุขภาพ</text></svg>";
        return {
          ok: true,
          data: {
            evidence_id: payload.evidence_id,
            data_url: file && file.data_url ? file.data_url : placeholderImg
          }
        };
      }

      // 5. Projects
      if (action === "projects.listMine") {
        const indProjects = memoryDB.projects.filter(p => p.owner_student_uid === session.principal_uid && p.type === "individual");
        const grpProjects = memoryDB.projects.filter(p => p.type === "group");
        return {
          ok: true,
          data: {
            individual_projects: indProjects,
            group_projects: grpProjects
          }
        };
      }

      if (action === "projects.createIndividual") {
        const prj = {
          project_id: "prj_" + Math.random().toString(16).substring(2),
          type: "individual",
          owner_student_uid: session.principal_uid,
          title: payload.title,
          github_pages_url: payload.github_pages_url,
          created_at: new Date().toISOString()
        };
        memoryDB.projects.push(prj);
        return { ok: true, data: prj };
      }

      // 6. Teacher Matrix
      if (action === "teacher.gradebookMatrix") {
        if (session.principal_type !== "teacher") {
          return { ok: false, error: { code: "ACCESS_DENIED", message_th: "ไม่มีสิทธิ์เข้าถึงส่วนงานครู" } };
        }
        const { grade = "M4", room = "1" } = payload;
        const syllabus = memoryDB.syllabi.find(s => s.grade === grade);

        const enrolls = memoryDB.enrollments.filter(e => e.grade === grade && (room === "all" || e.room === room))
          .sort((a, b) => Number(a.roll_no) - Number(b.roll_no));

        const rows = enrolls.map(e => {
          const std = memoryDB.students.find(s => s.student_uid === e.student_uid);
          const grades = memoryDB.gradeEntries.filter(g => g.student_uid === e.student_uid && g.state === "published");
          const bonus = memoryDB.bonusAwards.filter(b => b.student_uid === e.student_uid && b.state === "approved");

          let sumEarned = 0;
          grades.forEach(g => sumEarned += g.current_points_int || 0);
          let sumBonus = 0;
          bonus.forEach(b => sumBonus += b.points_int || 0);

          const cells = syllabus.worksheets.map(ws => {
            const sub = memoryDB.submissions.find(s => s.worksheet_code === ws.code && s.student_uid === e.student_uid);
            let status = "ยังไม่ส่ง";
            if (sub) {
              const rev = memoryDB.evidenceReviews.find(r => r.submission_id === sub.submission_id);
              if (rev && rev.decision_state === "needs_revision") {
                status = "ส่งกลับให้แก้ไข";
              } else {
                const isGraded = grades.some(g => g.task_code === "T4-01"); // simplified for demo
                status = isGraded ? "ตรวจแล้ว" : "ส่งแล้ว — รอตรวจ";
              }
            }
            return {
              worksheet_code: ws.code,
              status_label_th: status,
              submission_id: sub ? sub.submission_id : null
            };
          });

          return {
            student_uid: e.student_uid,
            roll_no: e.roll_no,
            code_5_digit: std.code_5_digit,
            display_name: std.display_name,
            room: e.room,
            submitted_count: cells.filter(c => c.status_label_th !== "ยังไม่ส่ง").length,
            graded_count: cells.filter(c => c.status_label_th === "ตรวจแล้ว").length,
            missing_count: cells.filter(c => c.status_label_th === "ยังไม่ส่ง").length,
            cumulative_points: (Math.min(10000, sumEarned + sumBonus) / 100).toFixed(1),
            bonus_points: (sumBonus / 100).toFixed(1),
            fully_graded: false,
            worksheet_cells: cells
          };
        });

        return {
          ok: true,
          data: {
            academic_year_id: "yr_2570",
            grade,
            room,
            worksheets_header: syllabus.worksheets,
            rows,
            out_of_roster_count: 0
          }
        };
      }

      // 7. Teacher Publish Grade
      if (action === "teacher.publishGrade") {
        if (session.principal_type !== "teacher") {
          return { ok: false, error: { code: "ACCESS_DENIED", message_th: "ไม่มีสิทธิ์สำหรับครู" } };
        }
        const { student_uid, task_code, points_int, feedback, reason } = payload;
        
        let ge = memoryDB.gradeEntries.find(g => g.student_uid === student_uid && g.task_code === task_code);
        if (ge && ge.state === "published" && !reason) {
          return { ok: false, error: { code: "REGRADE_REASON_REQUIRED", message_th: "การแก้ไขคะแนนต้องระบุเหตุผล" } };
        }

        if (!ge) {
          ge = {
            grade_entry_id: "ge_" + Math.random().toString(16).substring(2),
            syllabus_version_id: "syl_m4_2570_v1",
            student_uid,
            task_code,
            current_points_int: points_int,
            base_points_int: points_int,
            state: "published",
            feedback: feedback || "",
            updated_at: new Date().toISOString()
          };
          memoryDB.gradeEntries.push(ge);
        } else {
          ge.current_points_int = points_int;
          ge.base_points_int = points_int;
          ge.feedback = feedback || "";
          ge.updated_at = new Date().toISOString();
        }

        return {
          ok: true,
          data: {
            task_code,
            points: (points_int / 100).toFixed(1),
            message_th: "เผยแพร่คะแนนเรียบร้อยแล้ว"
          }
        };
      }

      // 8. Teacher Request Revision
      if (action === "teacher.requestRevision") {
        if (session.principal_type !== "teacher") {
          return { ok: false, error: { code: "ACCESS_DENIED", message_th: "ไม่มีสิทธิ์" } };
        }
        memoryDB.evidenceReviews.push({
          submission_id: payload.submission_id,
          decision_state: "needs_revision",
          feedback: payload.feedback
        });
        return { ok: true, data: { status_label_th: "ส่งกลับให้แก้ไข" } };
      }

      // 9. Teacher Award Bonus
      if (action === "teacher.awardBonus") {
        memoryDB.bonusAwards.push({
          bonus_id: "bon_" + Math.random().toString(16).substring(2),
          student_uid: payload.student_uid,
          points_int: payload.points_int,
          state: "approved"
        });
        return { ok: true, data: { points: (payload.points_int / 100).toFixed(1), message_th: "บันทึกคะแนนโบนัสเรียบร้อยแล้ว" } };
      }

      // 10. Teacher Export
            // 11. Teacher Import Roster
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
      }

      if (action === "teacher.exportGradebook") {
        const csvContent = "\uFEFFเลขที่,รหัสนักเรียน,ชื่อ-นามสกุล,ห้อง,ส่งแล้ว,ตรวจแล้ว,คะแนนสะสม\r\n1,00007,นายสมชาย มั่นใจ,1,1,1,9.5\r\n2,00123,น.ส.สมหญิง ชำนาญคิด,1,0,0,0.0\r\n10,00999,นายกิตติศักดิ์ นักประดิษฐ์,1,0,0,0.0";
        return {
          ok: true,
          data: {
            filename: "Gradebook_M4_2570.csv",
            csv_content: csvContent
          }
        };
      }

      return { ok: false, error: { code: "ACTION_NOT_FOUND", message_th: "ไม่พบคำสั่ง" } };
    }
  };

  window.MockBackend = MockBackend;
})();

