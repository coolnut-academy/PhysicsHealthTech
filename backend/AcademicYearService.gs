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
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = AcademicYearService;
}

