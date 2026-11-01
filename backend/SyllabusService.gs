/**
 * PhysicsHealthTech V2.0 - Syllabus Service
 * Source of truth: SYLLABUS_IMPORT_SPEC.md & 03_DASHBOARD_GRADING_REQUIREMENTS.md
 * 
 * Validates and publishes syllabus versions:
 * - Exactly 9 worksheets per grade (PHT4-W01..W09 or PHT5-W01..W09)
 * - 20 meetings x 100 minutes metadata
 * - Sum of distinct required base Task maxima must equal exactly 100.00 (10000 hundredths)
 * - Rubric criteria sum matches task component max
 * - Deduplication: Multiple worksheet links to same task are valid, task counts once
 */

const SyllabusService = {
  REQUIRED_WORKSHEET_COUNT: 9,
  EXPECTED_TOTAL_POINTS_INT: 10000, // 100.00 points
  EXPECTED_SESSIONS_COUNT: 20,
  EXPECTED_MINUTES_PER_SESSION: 100,

  /**
   * Validate a structured syllabus import package before publishing
   * 
   * @param {Object} syllabusPackage - { grade, worksheets, tasks, links, rubrics, sessions_count, minutes_per_session }
   * @returns {Object} Validation result { valid: boolean, errors: Array<string>, warnings: Array<string>, summary: Object }
   */
  validateSyllabusPackage(syllabusPackage) {
    const errors = [];
    const warnings = [];

    if (!syllabusPackage) {
      return { valid: false, errors: ["SYLLABUS_PACKAGE_EMPTY: ข้อมูลหลักสูตรว่างเปล่า"], warnings: [], summary: null };
    }

    const { grade, worksheets, tasks, links, rubrics, sessions_count, minutes_per_session } = syllabusPackage;

    // 1. Grade check
    if (grade !== "M4" && grade !== "M5") {
      errors.push(`INVALID_GRADE: ระดับชั้นต้องเป็น M4 หรือ M5 เท่านั้น (ได้รับ: ${grade})`);
    }

    // 2. Worksheets count check (GR01, GR02: Exactly 9 worksheets required)
    if (!Array.isArray(worksheets)) {
      errors.push("MISSING_WORKSHEETS: ไม่พบรายการใบงาน");
    } else {
      if (worksheets.length !== this.REQUIRED_WORKSHEET_COUNT) {
        errors.push(`INVALID_WORKSHEET_COUNT: ใบงานต้องมีครบ 9 ชุดพอดี (พบ ${worksheets.length} ชุด)`);
      }

      // Check worksheet codes format: PHT4-W01 to PHT4-W09 or PHT5-W01 to PHT5-W09
      const expectedPrefix = grade === "M4" ? "PHT4-W" : "PHT5-W";
      const seenCodes = new Set();

      worksheets.forEach((ws, idx) => {
        if (!ws.code || !ws.code.startsWith(expectedPrefix)) {
          errors.push(`INVALID_WORKSHEET_CODE: รหัสใบงานลำดับที่ ${idx + 1} ไม่ถูกต้อง: ${ws.code} (ต้องขึ้นต้นด้วย ${expectedPrefix})`);
        }
        if (seenCodes.has(ws.code)) {
          errors.push(`DUPLICATE_WORKSHEET_CODE: รหัสใบงานซ้ำกัน: ${ws.code}`);
        }
        seenCodes.add(ws.code);

        // Check session ranges (1..20)
        if (ws.session_start < 1 || ws.session_end > 20 || ws.session_start > ws.session_end) {
          errors.push(`INVALID_SESSION_RANGE: คาบเรียนของใบงาน ${ws.code} ไม่ถูกต้อง (${ws.session_start}-${ws.session_end})`);
        }
      });
    }

    // 3. Meeting sessions metadata check (GR02: 20 sessions x 100 minutes)
    const effectiveSessions = sessions_count || this.EXPECTED_SESSIONS_COUNT;
    const effectiveMinutes = minutes_per_session || this.EXPECTED_MINUTES_PER_SESSION;

    if (effectiveSessions !== this.EXPECTED_SESSIONS_COUNT) {
      errors.push(`INVALID_SESSIONS_COUNT: จำนวนครั้งเรียนต้องเป็น 20 ครั้ง (ได้รับ: ${effectiveSessions})`);
    }
    if (effectiveMinutes !== this.EXPECTED_MINUTES_PER_SESSION) {
      errors.push(`INVALID_MINUTES_PER_SESSION: ระยะเวลาต่อครั้งต้องเป็น 100 นาที (ได้รับ: ${effectiveMinutes})`);
    }

    // 4. Distinct Task Base Points Sum Check (GR03: Sum must equal exactly 100.00 / 10000 hundredths)
    let totalBasePointsInt = 0;
    const taskMap = new Map();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      errors.push("MISSING_TASKS: ไม่พบรายการงานหรือชิ้นงานประเมิน (Tasks)");
    } else {
      tasks.forEach((task, idx) => {
        if (!task.task_code) {
          errors.push(`MISSING_TASK_CODE: งานลำดับที่ ${idx + 1} ไม่มีรหัส task_code`);
          return;
        }
        if (taskMap.has(task.task_code)) {
          errors.push(`DUPLICATE_TASK_CODE: รหัสงานซ้ำกัน: ${task.task_code}`);
          return;
        }

        taskMap.set(task.task_code, task);

        const maxPointsInt = typeof task.max_points_int === "number" ? task.max_points_int : 0;
        if (maxPointsInt <= 0) {
          errors.push(`INVALID_TASK_POINTS: งาน ${task.task_code} มีคะแนนเต็มไม่ถูกต้อง (${maxPointsInt})`);
        }

        if (task.required) {
          totalBasePointsInt += maxPointsInt;
        }

        // Validate mixed / multi-component tasks
        if (task.scoring_scope === "mixed" && Array.isArray(task.components)) {
          let compTotalInt = 0;
          task.components.forEach(comp => {
            compTotalInt += (comp.max_points_int || 0);
          });
          if (compTotalInt !== maxPointsInt) {
            errors.push(`TASK_COMPONENT_MISMATCH: ผลรวมคะแนนย่อยของงาน ${task.task_code} (${compTotalInt}) ไม่เท่ากับคะแนนเต็มของงาน (${maxPointsInt})`);
          }
        }
      });

      if (totalBasePointsInt !== this.EXPECTED_TOTAL_POINTS_INT) {
        const currentPoints = (totalBasePointsInt / 100).toFixed(2);
        errors.push(`INVALID_TOTAL_BASE_POINTS: ผลรวมคะแนนเต็มของ Task ทั้งหมดต้องเท่ากับ 100.00 คะแนนพอดี (ปัจจุบันคำนวณได้: ${currentPoints} คะแนน)`);
      }
    }

    // 5. Worksheet-Task Links validation
    if (Array.isArray(links)) {
      links.forEach((link, idx) => {
        if (!link.worksheet_code || !link.task_code) {
          errors.push(`INVALID_LINK: ลิงก์ลำดับที่ ${idx + 1} ข้อมูลไม่ครบถ้วน`);
          return;
        }
        if (!taskMap.has(link.task_code)) {
          errors.push(`DANGLING_TASK_LINK: ลิงก์เชื่อมโยงไปยัง Task ที่ไม่มีอยู่จริง: ${link.task_code}`);
        }
      });
    }

    // 6. Rubrics validation (GR09: Criteria sum must equal component/task max)
    if (Array.isArray(rubrics)) {
      rubrics.forEach(rubric => {
        if (rubric.criteria && Array.isArray(rubric.criteria)) {
          let criteriaSumInt = 0;
          rubric.criteria.forEach(crit => {
            criteriaSumInt += (crit.max_points_int || 0);
          });
          if (criteriaSumInt !== rubric.max_points_int) {
            errors.push(`RUBRIC_CRITERIA_MISMATCH: ผลรวมเกณฑ์รูบริก ${rubric.rubric_code || rubric.rubric_id} (${criteriaSumInt}) ไม่เท่ากับคะแนนส่วน (${rubric.max_points_int})`);
          }
        }
      });
    }

    const isValid = errors.length === 0;

    return {
      valid: isValid,
      errors,
      warnings,
      summary: {
        grade,
        worksheets_count: worksheets ? worksheets.length : 0,
        distinct_tasks_count: taskMap.size,
        total_base_points: (totalBasePointsInt / 100).toFixed(2),
        total_base_points_int: totalBasePointsInt,
        sessions_count: effectiveSessions,
        minutes_per_session: effectiveMinutes
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = SyllabusService;
}

