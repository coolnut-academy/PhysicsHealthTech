/**
 * PhysicsHealthTech V2.0 - Student Service
 * Source of truth: DASHBOARD_METRICS.md, SCREEN_SPECIFICATIONS.md, 03_DASHBOARD_GRADING_REQUIREMENTS.md
 * 
 * Rules:
 * - Own-only data derived strictly from session.principal_uid
 * - Shows earned graded points, reviewed max subtotal, and course accumulated points / 100
 * - Pending tasks display 'รอตรวจ' with null points, NOT 0
 * - 9 worksheet cards with single canonical main status + independent overdue badge
 */

const StudentService = {
  /**
   * Get Student Dashboard View Model
   */
  getDashboard(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { academic_year_id, grade } = payload || {};

    if (!academic_year_id || !grade) {
      throw new Error("INVALID_REQUEST: โปรดระบุปีการศึกษาและระดับชั้น");
    }

    const student = repository.findStudentByUid(studentUid);
    if (!student) {
      throw new Error("USER_NOT_FOUND: ไม่พบข้อมูลนักเรียน");
    }

    // Check enrollment for this year and grade
    const enrollment = repository.findActiveEnrollment(studentUid, academic_year_id, grade);
    const isOutOfRoster = !enrollment;

    const profile = {
      student_uid: student.student_uid,
      display_name: student.display_name,
      code_5_digit: student.code_5_digit,
      year_be: repository.getYearBe(academic_year_id),
      grade: grade,
      room: enrollment ? enrollment.room : null,
      roll_no: enrollment ? enrollment.roll_no : null,
      is_out_of_roster: isOutOfRoster,
      enrollment_status: enrollment ? enrollment.status : "out_of_roster"
    };

    // Find published syllabus
    const syllabus = repository.findPublishedSyllabus(academic_year_id, grade);
    if (!syllabus) {
      return {
        ok: true,
        data: {
          profile,
          syllabus_ready: false,
          message_th: "ยังไม่ได้ประกาศรายละเอียดคะแนนและแผนการเรียนสำหรับระดับชั้นนี้",
          score_summary: null,
          worksheet_summary: null,
          worksheet_cards: []
        }
      };
    }

    // Published grades for this student
    const publishedGrades = repository.findPublishedGradesForStudent(studentUid, syllabus.syllabus_version_id);
    const approvedBonuses = repository.findApprovedBonusesForStudent(studentUid, syllabus.syllabus_version_id);

    // Score calculation
    const scoreSummary = GradingEngine.calculateStudentScoreSummary(syllabus, publishedGrades, approvedBonuses);

    // Map published grades for quick lookup by task_code
    const publishedGradesMap = new Map();
    publishedGrades.forEach(g => {
      publishedGradesMap.set(g.task_code, g);
    });

    // Map syllabus tasks
    const taskMap = new Map();
    syllabus.tasks.forEach(t => {
      taskMap.set(t.task_code, t);
    });

    // Group links by worksheet_code
    const wsLinksMap = new Map();
    (syllabus.links || []).forEach(l => {
      if (!wsLinksMap.has(l.worksheet_code)) {
        wsLinksMap.set(l.worksheet_code, []);
      }
      wsLinksMap.get(l.worksheet_code).push(l.task_code);
    });

    // Fetch student's submissions for this syllabus/grade
    const submissions = repository.findSubmissionsForStudent(studentUid, academic_year_id, grade);
    const subMap = new Map();
    submissions.forEach(sub => {
      subMap.set(sub.assignment_code || sub.worksheet_code, sub);
    });

    // Build Worksheet Cards
    const worksheetStatuses = [];
    const worksheetCards = (syllabus.worksheets || []).map(ws => {
      const submission = subMap.get(ws.code) || null;
      const linkedTaskCodes = wsLinksMap.get(ws.code) || [];
      const linkedTasks = linkedTaskCodes.map(code => taskMap.get(code)).filter(Boolean);
      
      const latestReview = submission ? repository.findLatestEvidenceReview(submission.submission_id) : null;
      const statusResult = GradingEngine.resolveWorksheetStatus(
        submission,
        linkedTasks,
        publishedGradesMap,
        latestReview,
        ws.due_at
      );

      worksheetStatuses.push(statusResult);

      // Build task summaries for this card
      const taskSummaries = linkedTasks.map(task => {
        const grade = publishedGradesMap.get(task.task_code);
        const pointsInt = grade ? (grade.base_points_int !== undefined ? grade.base_points_int : grade.current_points_int) : null;
        return {
          task_code: task.task_code,
          title: task.title,
          max_points_int: task.max_points_int,
          max_points: GradingEngine.formatPoints(task.max_points_int),
          published_points_int: pointsInt,
          published_points: pointsInt !== null ? GradingEngine.formatPoints(pointsInt) : null,
          is_graded: Boolean(grade),
          grading_state: grade ? "graded" : "pending",
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
        main_status: statusResult.main_status,
        status_label_th: statusResult.status_label_th,
        partial_grading: statusResult.partial_grading,
        overdue: statusResult.overdue,
        is_out_of_roster: isOutOfRoster,
        task_summaries: taskSummaries,
        submission_latest_version_no: submission ? submission.latest_version_no : 0,
        submission_id: submission ? submission.submission_id : null,
        has_history: submission ? (submission.latest_version_no > 1) : false
      };
    });

    const worksheetSummary = GradingEngine.calculateWorksheetSummary(syllabus.worksheets || [], worksheetStatuses);

    return {
      ok: true,
      data: {
        profile,
        syllabus_ready: true,
        score_summary: scoreSummary,
        worksheet_summary: worksheetSummary,
        worksheet_cards: worksheetCards
      }
    };
  },

  /**
   * Get Worksheet Cards list
   */
  getWorksheetCards(session, payload, repository) {
    const res = this.getDashboard(session, payload, repository);
    if (!res.ok) return res;
    return {
      ok: true,
      data: {
        worksheet_cards: res.data.worksheet_cards,
        profile: res.data.profile
      }
    };
  },

  /**
   * Get Student Grade History for a Task
   */
  getGradeHistory(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { task_code, syllabus_version_id } = payload || {};

    if (!task_code || !syllabus_version_id) {
      throw new Error("INVALID_REQUEST: โปรดระบุ task_code และ syllabus_version_id");
    }

    const history = repository.findGradeHistoryForStudent(studentUid, task_code, syllabus_version_id);
    return {
      ok: true,
      data: {
        task_code,
        revisions: history.map(rev => ({
          grade_revision_id: rev.grade_revision_id,
          points_int: rev.base_points_int,
          points: GradingEngine.formatPoints(rev.base_points_int),
          feedback: rev.feedback,
          reason: rev.reason,
          published_at: rev.published_at
        }))
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = StudentService;
}
