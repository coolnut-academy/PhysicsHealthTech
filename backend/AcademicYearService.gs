/**
 * PhysicsHealthTech V2.0 - Academic Year Service
 * Source of truth: ARCHITECTURE.md, 03_DASHBOARD_GRADING_REQUIREMENTS.md
 * 
 * Rules:
 * - Creates academic year idempotently (AC05, DATA07)
 * - Automatically initializes exactly 2 grade workspaces: M4 and M5
 * - Clones exactly 9 worksheet templates per grade as draft
 * - Never modifies, overwrites, or deletes previous years' data (GR26)
 */

const AcademicYearService = {
  /**
   * List academic years
   */
  listYears(session, payload, repository) {
    const years = repository.listAcademicYears();
    return {
      ok: true,
      data: {
        years: years.map(y => ({
          academic_year_id: y.academic_year_id,
          year_be: y.year_be,
          state: y.state,
          created_at: y.created_at
        }))
      }
    };
  },

  /**
   * Create new Academic Year (Idempotent)
   */
  createYear(session, payload, repository) {
    Authorization.enforceTeacher(session, "admin");
    const { year_be, idempotency_key } = payload || {};

    const yearBeInt = parseInt(year_be, 10);
    if (isNaN(yearBeInt) || yearBeInt < 2500 || yearBeInt > 2700) {
      throw new Error("INVALID_YEAR: ปีการศึกษา (พ.ศ.) ไม่ถูกต้อง");
    }

    // Check if year already exists (Idempotent - AC05, DATA07)
    const existing = repository.findAcademicYearByBe(yearBeInt);
    if (existing) {
      return {
        ok: true,
        data: {
          academic_year_id: existing.academic_year_id,
          year_be: existing.year_be,
          state: existing.state,
          is_existing: true,
          message_th: `ปีการศึกษา ${yearBeInt} มีอยู่ในระบบแล้ว`
        }
      };
    }

    const yearId = `yr_${yearBeInt}`;
    const now = new Date().toISOString();

    const academicYear = {
      academic_year_id: yearId,
      year_be: yearBeInt,
      state: "draft",
      creation_op_id: `op_yr_${AuthService.generateSecureToken().substring(0, 12)}`,
      created_at: now,
      published_at: null,
      revision: 1
    };

    repository.saveAcademicYear(academicYear);

    // Create GradeWorkspaces for M4 and M5
    repository.saveGradeWorkspace({
      workspace_id: `ws_${yearId}_M4`,
      academic_year_id: yearId,
      grade: "M4",
      state: "draft",
      created_at: now
    });

    repository.saveGradeWorkspace({
      workspace_id: `ws_${yearId}_M5`,
      academic_year_id: yearId,
      grade: "M5",
      state: "draft",
      created_at: now
    });

    // Clone 9 worksheet templates per grade as draft assignments
    const defaultM4Titles = [
      "การวัดและเครื่องมือทางกายภาพสุขภาพ",
      "กลศาสตร์การเคลื่อนที่ของร่างกายมนุษย์",
      "แรง สมดุล และจุดศูนย์ถ่วงทางกายวิภาค",
      "งาน พลังงาน และการเผาผลาญในระบบชีวกล",
      "โมเมนตัมและการชนในการป้องกันการบาดเจ็บ",
      "การหมุนและทอร์กของข้อต่อและกล้ามเนื้อ",
      "ความยืดหยุ่นและความเค้นของกระดูกและเอ็น",
      "ของไหล ความดันโลหิต และการไหลเวียนเลือด",
      "บูรณาการโครงงานฟิสิกส์สุขภาพเทคโนโลยี ม.4"
    ];

    const defaultM5Titles = [
      "อุณหพลศาสตร์และการควบคุมอุณหภูมิร่างกาย",
      "คลื่นเสียงและอัลตราซาวด์ทางการแพทย์",
      "แสง ทัศนศาสตร์ และการตรวจสายตา",
      "สถิตยศาสตร์ไฟฟ้าและศักย์ไฟฟ้าระดับเซลล์",
      "ไฟฟ้ากระแสตรงและเซนเซอร์ชีวการแพทย์",
      "แม่เหล็กไฟฟ้าและการถ่ายภาพเรโซแนนซ์",
      "คลื่นแม่เหล็กไฟฟ้าและรังสีบำบัดเบื้องต้น",
      "ฟิสิกส์อะตอมและการตรวจวินิจฉัยทางรังสี",
      "นวัตกรรมสิ่งประดิษฐ์เฮลธ์เทคประยุกต์ ม.5"
    ];

    defaultM4Titles.forEach((title, idx) => {
      const order = idx + 1;
      const code = `PHT4-W0${order}`;
      repository.saveAssignment({
        assignment_id: `asg_${yearId}_M4_W0${order}`,
        academic_year_id: yearId,
        grade: "M4",
        worksheet_code: code,
        title: `ใบงานที่ ${order}: ${title}`,
        order_no: order,
        status: "draft",
        session_start: Math.max(1, (order * 2) - 1),
        session_end: Math.min(20, order * 2),
        created_at: now
      });
    });

    defaultM5Titles.forEach((title, idx) => {
      const order = idx + 1;
      const code = `PHT5-W0${order}`;
      repository.saveAssignment({
        assignment_id: `asg_${yearId}_M5_W0${order}`,
        academic_year_id: yearId,
        grade: "M5",
        worksheet_code: code,
        title: `ใบงานที่ ${order}: ${title}`,
        order_no: order,
        status: "draft",
        session_start: Math.max(1, (order * 2) - 1),
        session_end: Math.min(20, order * 2),
        created_at: now
      });
    });

    return {
      ok: true,
      data: {
        academic_year_id: yearId,
        year_be: yearBeInt,
        state: "draft",
        workspaces_created: ["M4", "M5"],
        worksheets_cloned: 18,
        message_th: `สร้างปีการศึกษา ${yearBeInt} พร้อมเทมเพลต 18 ใบงาน (ม.4 และ ม.5) เรียบร้อยแล้ว`
      }
    };
  },

  /**
   * Publish Academic Year
   */
  publishYear(session, payload, repository) {
    Authorization.enforceTeacher(session, "admin");
    const { academic_year_id } = payload || {};

    const year = repository.findAcademicYear(academic_year_id);
    if (!year) {
      throw new Error("YEAR_NOT_FOUND: ไม่พบปีการศึกษา");
    }

    year.state = "open";
    year.published_at = new Date().toISOString();
    repository.updateAcademicYear(year);

    return {
      ok: true,
      data: {
        academic_year_id,
        state: "open",
        message_th: "เปิดใช้งานปีการศึกษาเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Import batch student roster for an Academic Year (AC05, DATA07)
   * Auto-promotes existing students using their original student_uid
   * Creates new academic year and syllabi if they do not exist
   */
  importRoster(session, payload, repository) {
    Authorization.enforceTeacher(session);
    const { year_be, students: rosterRows } = payload || {};

    const yearBeInt = parseInt(year_be, 10);
    if (isNaN(yearBeInt) || yearBeInt < 2500 || yearBeInt > 2700) {
      throw new Error("INVALID_YEAR: ปีการศึกษา (พ.ศ.) ไม่ถูกต้อง");
    }

    if (!Array.isArray(rosterRows) || rosterRows.length === 0) {
      throw new Error("INVALID_REQUEST: ไม่พบข้อมูลนักเรียนสำหรับการนำเข้า");
    }

    const yearId = `yr_${yearBeInt}`;
    const now = new Date().toISOString();

    // 1. Ensure Academic Year exists and is open
    let year = repository.findAcademicYearByBe(yearBeInt);
    if (!year) {
      year = {
        academic_year_id: yearId,
        year_be: yearBeInt,
        state: "open",
        creation_op_id: `op_import_${AuthService.generateSecureToken().substring(0, 12)}`,
        created_at: now,
        published_at: now,
        revision: 1
      };
      repository.saveAcademicYear(year);
    } else if (year.state !== "open") {
      year.state = "open";
      repository.updateAcademicYear(year);
    }

    // 2. Ensure Syllabi exist for M4 and M5
    const grades = ["M4", "M5"];
    for (const g of grades) {
      let syl = repository.findPublishedSyllabus(yearId, g);
      if (!syl) {
        const sylId = `syl_${g.toLowerCase()}_${yearBeInt}_v1`;
        syl = {
          syllabus_version_id: sylId,
          academic_year_id: yearId,
          grade: g,
          version_no: 1,
          course_max_points_int: 10000,
          sessions_count: 20,
          minutes_per_session: 100,
          state: "published",
          created_at: now
        };
        repository.savePublishedSyllabus(syl);
      }
    }

    // 3. Process each student row
    let newStudentsCount = 0;
    let existingStudentsCount = 0;
    let enrollmentsCount = 0;

    for (const row of rosterRows) {
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

      // Find existing student by code_5_digit
      let student = repository.findStudentByCode(code5Digit);
      let studentUid = "";

      if (student) {
        studentUid = student.student_uid;
        existingStudentsCount++;
        if (displayName && displayName !== student.display_name) {
          student.display_name = displayName;
          repository.saveStudent(student);
        }
      } else {
        studentUid = `std_${code5Digit}`;
        student = {
          student_uid: studentUid,
          code_5_digit: code5Digit,
          display_name: displayName,
          status: "active",
          credential_version: 1,
          created_at: now,
          updated_at: now,
          deleted_at: ""
        };
        repository.saveStudent(student);
        newStudentsCount++;
      }

      // Upsert enrollment for this academic year
      const enrId = `enr_${yearBeInt}_${grade.toLowerCase()}_${String(rollNo).padStart(3, "0")}`;
      const enrollment = {
        enrollment_id: enrId,
        academic_year_id: yearId,
        student_uid: studentUid,
        grade: grade,
        room: room,
        roll_no: rollNo,
        status: "active",
        created_at: now
      };
      repository.saveEnrollment(enrollment);
      enrollmentsCount++;
    }

    return {
      ok: true,
      data: {
        academic_year_id: yearId,
        year_be: yearBeInt,
        total_processed: enrollmentsCount,
        new_students: newStudentsCount,
        existing_students: existingStudentsCount,
        message_th: `นำเข้าข้อมูลปีการศึกษา ${yearBeInt} เรียบร้อยแล้ว (${enrollmentsCount} คน)`
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = AcademicYearService;
}

