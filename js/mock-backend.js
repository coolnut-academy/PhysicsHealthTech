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

  const STUDENTS = [
    { student_uid: "std_00007", code_5_digit: "00007", display_name: "นายสมชาย มั่นใจ", secret_plain: "PhtSecret#00007A", status: "active" },
    { student_uid: "std_00123", code_5_digit: "00123", display_name: "น.ส.สมหญิง ชำนาญคิด", secret_plain: "PhtSecret#00123B", status: "active" },
    { student_uid: "std_00999", code_5_digit: "00999", display_name: "นายกิตติศักดิ์ นักประดิษฐ์", secret_plain: "PhtSecret#00999C", status: "active" },
    { student_uid: "std_91234", code_5_digit: "91234", display_name: "น.ส.พัชรา วิทยาการ", secret_plain: "PhtSecret#91234D", status: "active" }
  ];

  const TEACHERS = [
    { teacher_uid: "tch_001", name: "อาจารย์ ดร.สมศักดิ์ นวัตกรรม", email: "teacher.physics@school.ac.th", auth_secret: "TeacherAuthSecret#1001", role: "teacher", status: "active" },
    { teacher_uid: "tch_admin", name: "อาจารย์ นพพร หัวหน้าหมวด", email: "admin.physics@school.ac.th", auth_secret: "AdminAuthSecret#9999", role: "admin", status: "active" }
  ];

  const ENROLLMENTS = [
    { enrollment_id: "enr_001", academic_year_id: "yr_2570", student_uid: "std_00007", grade: "M4", room: "1", roll_no: 1, status: "active" },
    { enrollment_id: "enr_002", academic_year_id: "yr_2570", student_uid: "std_00123", grade: "M4", room: "1", roll_no: 2, status: "active" },
    { enrollment_id: "enr_003", academic_year_id: "yr_2570", student_uid: "std_00999", grade: "M4", room: "1", roll_no: 10, status: "active" },
    { enrollment_id: "enr_004", academic_year_id: "yr_2570", student_uid: "std_91234", grade: "M5", room: "2", roll_no: 1, status: "active" }
  ];

  // In-memory data store for browser session
  const memoryDB = {
    students: [...STUDENTS],
    teachers: [...TEACHERS],
    enrollments: [...ENROLLMENTS],
    syllabi: [M4_SYLLABUS, M5_SYLLABUS],
    years: [
      { academic_year_id: "yr_2570", year_be: 2570, state: "open" },
      { academic_year_id: "yr_2569", year_be: 2569, state: "archived" }
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

        if (!student || student.secret_plain !== secret) {
          return { ok: false, error: { code: "INVALID_CREDENTIALS", message_th: "รหัสนักเรียน 5 หลักหรือรหัสผ่านไม่ถูกต้อง" } };
        }

        const token = "mock_token_" + Math.random().toString(16).substring(2);
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
        const { academic_year_id = "yr_2570", grade = "M4" } = payload;
        const student = memoryDB.students.find(s => s.student_uid === session.principal_uid);
        const enrollment = memoryDB.enrollments.find(e => e.student_uid === session.principal_uid && e.academic_year_id === academic_year_id && e.grade === grade);
        const syllabus = memoryDB.syllabi.find(s => s.academic_year_id === academic_year_id && s.grade === grade);

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
              year_be: 2570,
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

