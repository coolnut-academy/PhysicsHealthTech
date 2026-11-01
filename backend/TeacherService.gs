/**
 * PhysicsHealthTech V2.0 - Teacher Service
 * Source of truth: 03_DASHBOARD_GRADING_REQUIREMENTS.md, SCREEN_SPECIFICATIONS.md, GRADING_ENGINE.md
 * 
 * Rules:
 * - Only verified teachers can access, grade, publish, or export
 * - Roster sorted numerically by roll_no (1, 2, 10, 11)
 * - Separate out-of-roster tray does not distort official enrollment denominator
 * - Draft grades remain hidden from students
 * - Publishing creates immutable GradeRevisions with reason and teacher UID
 * - Formula injection escaped on exports (=, +, -, @)
 */

const TeacherService = {
  /**
   * Get Gradebook Matrix for Teacher Workspace
   */
  getGradebookMatrix(session, payload, repository) {
    Authorization.enforceTeacher(session);
    const { academic_year_id, grade, room } = payload || {};

    if (!academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: โปรดระบุปีการศึกษาและระดับชั้น");
    }

    const syllabus = repository.findPublishedSyllabus(academic_year_id, grade);
    const worksheets = syllabus ? syllabus.worksheets : [];
    const tasks = syllabus ? syllabus.tasks : [];

    // Map tasks and worksheets
    const taskMap = new Map();
    tasks.forEach(t => taskMap.set(t.task_code, t));

    // Get official enrollments
    let enrollments = repository.findEnrollments(academic_year_id, grade, room);

    // Sort numerically by roll_no ascending (1, 2, 10, 11) - AC03, GR25, DATA02
    enrollments.sort((a, b) => {
      const rollA = Number(a.roll_no) || 0;
      const rollB = Number(b.roll_no) || 0;
      if (rollA !== rollB) return rollA - rollB;
      return (a.student_name || "").localeCompare(b.student_name || "", "th");
    });

    const rows = enrollments.map(enr => {
      const studentUid = enr.student_uid;
      const student = repository.findStudentByUid(studentUid) || {
        display_name: enr.student_name || "นักเรียน",
        code_5_digit: enr.code_5_digit || "00000"
      };

      // Fetch student's published and draft grades
      const publishedGrades = syllabus ? repository.findPublishedGradesForStudent(studentUid, syllabus.syllabus_version_id) : [];
      const drafts = syllabus ? repository.findDraftGradesForStudent(studentUid, syllabus.syllabus_version_id) : [];
      const bonuses = syllabus ? repository.findApprovedBonusesForStudent(studentUid, syllabus.syllabus_version_id) : [];

      const scoreSummary = syllabus
        ? GradingEngine.calculateStudentScoreSummary(syllabus, publishedGrades, bonuses)
        : null;

      // Map submissions for worksheets
      const submissions = repository.findSubmissionsForStudent(studentUid, academic_year_id, grade);
      const subMap = new Map();
      submissions.forEach(s => subMap.set(s.worksheet_code || s.assignment_code, s));

      const gradeMap = new Map();
      publishedGrades.forEach(g => gradeMap.set(g.task_code, g));
      const draftMap = new Map();
      drafts.forEach(d => draftMap.set(d.task_code, d));

      // Calculate status per worksheet for teacher matrix
      let submittedCount = 0;
      let gradedCount = 0;
      let revisionCount = 0;

      const worksheetCells = worksheets.map(ws => {
        const sub = subMap.get(ws.code);
        const latestReview = sub ? repository.findLatestEvidenceReview(sub.submission_id) : null;
        
        // Find tasks linked to this worksheet
        const linkedTasks = (syllabus.links || [])
          .filter(l => l.worksheet_code === ws.code)
          .map(l => taskMap.get(l.task_code))
          .filter(Boolean);

        const statusRes = GradingEngine.resolveWorksheetStatus(sub, linkedTasks, gradeMap, latestReview, ws.due_at);
        if (statusRes.main_status === "graded") {
          gradedCount++;
          submittedCount++;
        } else if (statusRes.main_status === "submitted") {
          submittedCount++;
        } else if (statusRes.main_status === "revision_required") {
          revisionCount++;
          submittedCount++;
        }

        return {
          worksheet_code: ws.code,
          main_status: statusRes.main_status,
          status_label_th: statusRes.status_label_th,
          submission_id: sub ? sub.submission_id : null,
          has_draft: linkedTasks.some(t => draftMap.has(t.task_code)),
          overdue: statusRes.overdue
        };
      });

      return {
        enrollment_id: enr.enrollment_id,
        student_uid: studentUid,
        roll_no: Number(enr.roll_no),
        code_5_digit: student.code_5_digit,
        display_name: student.display_name,
        room: enr.room,
        submitted_count: submittedCount,
        graded_count: gradedCount,
        revision_count: revisionCount,
        missing_count: worksheets.length - submittedCount,
        cumulative_points: scoreSummary ? scoreSummary.accumulated_points_capped_100 : 0,
        reviewed_max: scoreSummary ? scoreSummary.reviewed_max_points : 0,
        bonus_points: scoreSummary ? scoreSummary.approved_bonus_points : 0,
        pending_task_count: scoreSummary ? scoreSummary.pending_task_count : 0,
        fully_graded: scoreSummary ? scoreSummary.fully_graded : false,
        worksheet_cells: worksheetCells
      };
    });

    // Find out-of-roster submissions (AC04, GR23)
    const outOfRosterSubmissions = repository.findOutOfRosterSubmissions(academic_year_id, grade);

    return {
      ok: true,
      data: {
        academic_year_id,
        grade,
        room: room || "all",
        syllabus_ready: Boolean(syllabus),
        worksheets_header: worksheets.map(ws => ({ code: ws.code, title: ws.title, order_no: ws.order_no })),
        rows,
        out_of_roster_count: outOfRosterSubmissions.length,
        out_of_roster_items: outOfRosterSubmissions.map(s => ({
          submission_id: s.submission_id,
          student_uid: s.student_uid,
          student_name: s.student_name,
          code_5_digit: s.code_5_digit,
          worksheet_code: s.worksheet_code,
          submitted_at: s.submitted_at
        }))
      }
    };
  },

  /**
   * Save Teacher Grade Draft (hidden from student)
   */
  saveGradeDraft(session, payload, repository) {
    const teacherUid = Authorization.enforceTeacher(session);
    const { student_uid, syllabus_version_id, task_code, points_int, feedback, rubric_breakdown } = payload || {};

    if (!student_uid || !syllabus_version_id || !task_code || points_int === undefined) {
      throw new Error("INVALID_REQUEST: ข้อมูลการให้คะแนนแบบร่างไม่ครบถ้วน");
    }

    const task = repository.findTaskByCode(syllabus_version_id, task_code);
    if (!task) {
      throw new Error("TASK_NOT_FOUND: ไม่พบรหัสงานประเมินในหลักสูตร");
    }

    if (points_int < 0 || points_int > task.max_points_int) {
      throw new Error(`SCORE_OUT_OF_RANGE: คะแนนต้องอยู่ระหว่าง 0 ถึง ${task.max_points_int / 100}`);
    }

    const draft = {
      draft_id: `drf_${AuthService.generateSecureToken().substring(0, 12)}`,
      syllabus_version_id,
      student_uid,
      task_code,
      points_int,
      rubric_breakdown_json: rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
      feedback: feedback || "",
      teacher_uid: teacherUid,
      updated_at: new Date().toISOString()
    };

    repository.saveGradeDraft(draft);

    return {
      ok: true,
      data: {
        draft_id: draft.draft_id,
        state: "draft",
        message_th: "บันทึกคะแนนร่างเรียบร้อยแล้ว (ยังไม่ได้เผยแพร่ให้นักเรียนเห็น)"
      }
    };
  },

  /**
   * Publish Teacher Grade (creates immutable GradeRevision and promotes GradeEntry)
   */
  publishGrade(session, payload, repository) {
    const teacherUid = Authorization.enforceTeacher(session);
    const {
      student_uid,
      syllabus_version_id,
      task_code,
      points_int,
      feedback,
      reason,
      rubric_breakdown,
      idempotency_key
    } = payload || {};

    if (!student_uid || !syllabus_version_id || !task_code || points_int === undefined) {
      throw new Error("INVALID_REQUEST: ข้อมูลการเผยแพร่คะแนนไม่ครบถ้วน");
    }

    // Task verification
    const task = repository.findTaskByCode(syllabus_version_id, task_code);
    if (!task) {
      throw new Error("TASK_NOT_FOUND: ไม่พบรหัสงานประเมินในหลักสูตร");
    }

    // Points range validation (0 is allowed if explicitly published! - GR06)
    if (points_int < 0 || points_int > task.max_points_int) {
      throw new Error(`SCORE_OUT_OF_RANGE: คะแนนต้องอยู่ระหว่าง 0 ถึง ${task.max_points_int / 100}`);
    }

    // Rubric validation if rubric provided (GR09)
    if (rubric_breakdown && Array.isArray(rubric_breakdown)) {
      let breakdownSum = 0;
      rubric_breakdown.forEach(item => {
        breakdownSum += (item.points_int || 0);
      });
      if (breakdownSum !== points_int) {
        throw new Error(`RUBRIC_MISMATCH: ผลรวมคะแนนรูบริก (${breakdownSum / 100}) ไม่ตรงกับคะแนนที่ให้ (${points_int / 100})`);
      }
    }

    // Check existing published entry to track old score for audit
    const existingEntry = repository.findGradeEntry(student_uid, syllabus_version_id, task_code);
    const previousPointsInt = existingEntry ? existingEntry.current_points_int : null;

    if (existingEntry && existingEntry.state === "published" && !reason) {
      // Regrading requires an explicit reason (GR08)
      throw new Error("REGRADE_REASON_REQUIRED: การแก้ไขคะแนนที่เผยแพร่แล้วต้องระบุเหตุผลในการแก้ไข");
    }

    const now = new Date().toISOString();
    const revisionId = `rev_${AuthService.generateSecureToken().substring(0, 12)}`;

    // 1. Create immutable GradeRevision
    const revisionRecord = {
      grade_revision_id: revisionId,
      student_uid,
      syllabus_version_id,
      task_code,
      actor_teacher_uid: teacherUid,
      state: "published",
      base_points_int: points_int,
      previous_points_int: previousPointsInt,
      rubric_breakdown_json: rubric_breakdown ? JSON.stringify(rubric_breakdown) : null,
      feedback: feedback || "",
      reason: reason || (existingEntry ? "แก้ไขคะแนน" : "ตรวจและเผยแพร่ครั้งแรก"),
      published_at: now,
      created_at: now,
      idempotency_key: idempotency_key || null
    };

    repository.saveGradeRevision(revisionRecord);

    // 2. Promote / Update GradeEntry
    const gradeEntry = {
      grade_entry_id: existingEntry ? existingEntry.grade_entry_id : `ge_${AuthService.generateSecureToken().substring(0, 12)}`,
      syllabus_version_id,
      student_uid,
      task_code,
      base_points_int: points_int,
      current_points_int: points_int,
      current_revision_id: revisionId,
      state: "published",
      feedback: feedback || "",
      updated_at: now
    };

    repository.saveGradeEntry(gradeEntry);

    // 3. Remove draft if existed
    repository.deleteGradeDraft(student_uid, syllabus_version_id, task_code);

    // 4. Audit Log
    repository.recordAuditLog({
      audit_id: `aud_${AuthService.generateSecureToken().substring(0, 12)}`,
      actor_type: "teacher",
      actor_uid: teacherUid,
      action: existingEntry ? "GRADE_REVISED" : "GRADE_PUBLISHED",
      object_type: "GradeEntry",
      object_id: gradeEntry.grade_entry_id,
      outcome: "SUCCESS",
      change_summary: `Task: ${task_code}, Old: ${previousPointsInt}, New: ${points_int}, Reason: ${reason || "First publish"}`
    });

    return {
      ok: true,
      data: {
        grade_entry_id: gradeEntry.grade_entry_id,
        grade_revision_id: revisionId,
        task_code,
        points_int,
        points: GradingEngine.formatPoints(points_int),
        published_at: now,
        message_th: "เผยแพร่คะแนนเรียบร้อยแล้ว นักเรียนสามารถตรวจสอบผลคะแนนได้ทันที"
      }
    };
  },

  /**
   * Request Submission Revision
   */
  requestRevision(session, payload, repository) {
    const teacherUid = Authorization.enforceTeacher(session);
    const { submission_id, feedback } = payload || {};

    if (!submission_id || !feedback) {
      throw new Error("INVALID_REQUEST: โปรดระบุ submission_id และคำแนะนำการแก้ไข (feedback)");
    }

    const submission = repository.findSubmissionById(submission_id);
    if (!submission) {
      throw new Error("SUBMISSION_NOT_FOUND: ไม่พบรายการส่งงาน");
    }

    const review = {
      review_id: `revw_${AuthService.generateSecureToken().substring(0, 12)}`,
      submission_id,
      reviewed_version_id: submission.latest_version_id,
      teacher_uid: teacherUid,
      decision_state: "needs_revision",
      feedback: feedback,
      reviewed_at: new Date().toISOString()
    };

    repository.saveEvidenceReview(review);

    repository.recordAuditLog({
      audit_id: `aud_${AuthService.generateSecureToken().substring(0, 12)}`,
      actor_type: "teacher",
      actor_uid: teacherUid,
      action: "SUBMISSION_REVISION_REQUESTED",
      object_type: "Submission",
      object_id: submission_id,
      outcome: "SUCCESS",
      change_summary: `Feedback: ${feedback}`
    });

    return {
      ok: true,
      data: {
        submission_id,
        decision_state: "needs_revision",
        status_label_th: "ส่งกลับให้แก้ไข",
        message_th: "ส่งคำขอแก้ไขงานไปยังนักเรียนเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Award Voluntary Coloring Bonus (GR19, GR20)
   */
  awardBonus(session, payload, repository) {
    const teacherUid = Authorization.enforceTeacher(session);
    const { student_uid, syllabus_version_id, worksheet_code, points_int, note, idempotency_key } = payload || {};

    if (!student_uid || !syllabus_version_id || !worksheet_code || points_int === undefined) {
      throw new Error("INVALID_REQUEST: ข้อมูลการให้คะแนนโบนัสไม่ครบถ้วน");
    }

    if (points_int <= 0 || points_int > 500) { // max 5.00 points bonus per award
      throw new Error("INVALID_BONUS_POINTS: คะแนนโบนัสต้องอยู่ระหว่าง 0.01 ถึง 5.00 คะแนน");
    }

    // Check duplicate bonus for this student + worksheet (GR20)
    const existingBonus = repository.findBonus(student_uid, syllabus_version_id, worksheet_code);
    if (existingBonus && existingBonus.state === "approved") {
      return {
        ok: true,
        data: {
          bonus_id: existingBonus.bonus_id,
          points_int: existingBonus.points_int,
          message_th: "บันทึกคะแนนโบนัสเรียบร้อยแล้ว (ไม่ให้ซ้ำ)"
        }
      };
    }

    const bonus = {
      bonus_id: `bon_${AuthService.generateSecureToken().substring(0, 12)}`,
      syllabus_version_id,
      student_uid,
      bonus_kind: "coloring",
      source_worksheet_code: worksheet_code,
      points_int,
      state: "approved",
      approved_by: teacherUid,
      note: note || "โบนัสความตั้งใจระบายสีและตกแต่งใบงาน",
      created_at: new Date().toISOString()
    };

    repository.saveBonusAward(bonus);

    repository.recordAuditLog({
      audit_id: `aud_${AuthService.generateSecureToken().substring(0, 12)}`,
      actor_type: "teacher",
      actor_uid: teacherUid,
      action: "BONUS_AWARDED",
      object_type: "BonusAward",
      object_id: bonus.bonus_id,
      outcome: "SUCCESS",
      change_summary: `Student: ${student_uid}, Points: ${points_int}`
    });

    return {
      ok: true,
      data: {
        bonus_id: bonus.bonus_id,
        points: GradingEngine.formatPoints(points_int),
        message_th: "ให้คะแนนโบนัสเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Publish Group Scores (GR21, GR22)
   */
  publishGroupScores(session, payload, repository) {
    const teacherUid = Authorization.enforceTeacher(session);
    const {
      group_id,
      syllabus_version_id,
      task_code,
      shared_points_int,
      individual_scores, // Array of { student_uid, points_int }
      feedback
    } = payload || {};

    if (!group_id || !syllabus_version_id || !task_code || shared_points_int === undefined) {
      throw new Error("INVALID_REQUEST: ข้อมูลคะแนนกลุ่มไม่ครบถ้วน");
    }

    const group = repository.findGroupById(group_id);
    if (!group) {
      throw new Error("GROUP_NOT_FOUND: ไม่พบข้อมูลกลุ่ม");
    }

    const task = repository.findTaskByCode(syllabus_version_id, task_code);
    if (!task) {
      throw new Error("TASK_NOT_FOUND: ไม่พบรหัสงานประเมินในหลักสูตร");
    }

    // Freeze member snapshot (GR22)
    const snapshotId = `snp_${AuthService.generateSecureToken().substring(0, 12)}`;
    const memberUids = group.members || [];
    repository.saveGroupMembershipSnapshot({
      member_snapshot_id: snapshotId,
      group_id,
      round_id: group.round_id,
      member_uids: memberUids,
      captured_by_teacher_uid: teacherUid,
      created_at: new Date().toISOString()
    });

    // 1. Record group shared component score
    const groupScoreId = `gsc_${AuthService.generateSecureToken().substring(0, 12)}`;
    repository.saveGroupScoreComponent({
      group_score_id: groupScoreId,
      group_id,
      task_code,
      component_id: "comp_shared",
      shared_points_int,
      member_snapshot_id: snapshotId,
      teacher_uid: teacherUid,
      state: "published",
      created_at: new Date().toISOString()
    });

    // 2. Publish combined grade entry for each eligible member
    const individualMap = new Map();
    (individual_scores || []).forEach(item => {
      individualMap.set(item.student_uid, item.points_int || 0);
    });

    memberUids.forEach(studentUid => {
      const indivPointsInt = individualMap.get(studentUid) || 0;
      const totalPointsInt = shared_points_int + indivPointsInt;

      // Save individual score component
      repository.saveIndividualScoreComponent({
        score_component_id: `isc_${AuthService.generateSecureToken().substring(0, 12)}`,
        student_uid: studentUid,
        task_code,
        component_id: "comp_individual",
        points_int: indivPointsInt,
        state: "published"
      });

      // Publish task grade entry for this student
      this.publishGrade(session, {
        student_uid: studentUid,
        syllabus_version_id,
        task_code,
        points_int: totalPointsInt,
        feedback: feedback || "คะแนนผลงานโครงงานกลุ่มและการนำเสนอ",
        reason: "ประเมินโครงงานกลุ่มและบุคคล"
      }, repository);
    });

    return {
      ok: true,
      data: {
        group_id,
        task_code,
        shared_points_int,
        members_awarded_count: memberUids.length,
        message_th: "เผยแพร่คะแนนโครงงานกลุ่มและคะแนนรายบุคคลเรียบร้อยแล้ว"
      }
    };
  },

  /**
   * Export Gradebook (CSV/safe format, escaping formula injection - SEC06, GR27)
   */
  exportGradebook(session, payload, repository) {
    Authorization.enforceTeacher(session);
    const { academic_year_id, grade, room } = payload || {};

    const matrixRes = this.getGradebookMatrix(session, { academic_year_id, grade, room }, repository);
    const { rows, worksheets_header } = matrixRes.data;

    // Helper to escape formula injection (=, +, -, @)
    const sanitizeCsvCell = (val) => {
      if (val === null || val === undefined) return "";
      let str = String(val).replace(/"/g, '""');
      if (/^[=\+\-@]/.test(str)) {
        str = "'" + str; // Prefix with single quote to make inert
      }
      return `"${str}"`;
    };

    const header = [
      "เลขที่",
      "รหัสนักเรียน",
      "ชื่อ-นามสกุล",
      "ห้อง",
      ...worksheets_header.map(ws => ws.code),
      "ส่งแล้ว (ใบงาน)",
      "ตรวจแล้ว (ใบงาน)",
      "ยังไม่ส่ง",
      "คะแนนสะสมที่ตรวจแล้ว (/100)",
      "โบนัส",
      "สถานะการตรวจ"
    ];

    const csvLines = [header.map(sanitizeCsvCell).join(",")];

    rows.forEach(row => {
      const wsStatusValues = row.worksheet_cells.map(cell => cell.status_label_th);
      const line = [
        row.roll_no,
        row.code_5_digit,
        row.display_name,
        row.room,
        ...wsStatusValues,
        row.submitted_count,
        row.graded_count,
        row.missing_count,
        row.cumulative_points,
        row.bonus_points,
        row.fully_graded ? "ตรวจครบถ้วน" : `รอตรวจ (${row.pending_task_count} งาน)`
      ];
      csvLines.push(line.map(sanitizeCsvCell).join(","));
    });

    const csvContent = "\uFEFF" + csvLines.join("\r\n"); // Add BOM for Thai UTF-8 Excel support

    return {
      ok: true,
      data: {
        filename: `Gradebook_${grade}_${academic_year_id}_Room${room || "All"}.csv`,
        mime_type: "text/csv;charset=utf-8",
        csv_content: csvContent
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = TeacherService;
}
