/**
 * PhysicsHealthTech V2.0 - Grading Engine
 * Source of truth: 03_DASHBOARD_GRADING_REQUIREMENTS.md & GRADING_ENGINE.md
 * 
 * Rules:
 * - Integer hundredths of a point (e.g. 1000 = 10.00 pts, 10000 = 100.00 pts)
 * - Exactly 9 worksheets per grade
 * - 20 meetings x 100 minutes metadata
 * - 100 total syllabus base points (sum of distinct Task maxima = 10000)
 * - Deduplication: A Task linked to multiple worksheets counts ONCE in course calculations
 * - Ungraded Tasks return null / 'รอตรวจ', NEVER 0 (0 is only explicit teacher score)
 * - Voluntary coloring bonus is separately audited, capped at 100 max course points
 * - Group shared scores and individual scores are strictly separated
 * - Teacher only grades, drafts are invisible to students, publish creates immutable GradeRevisions
 */

const GradingEngine = {
  COURSE_MAX_POINTS_INT: 10000, // 100.00 points in hundredths
  REQUIRED_WORKSHEET_COUNT: 9,
  MEETINGS_COUNT: 20,
  MINUTES_PER_MEETING: 100,

  /**
   * Format integer hundredths as decimal string or number
   * e.g., 1000 -> 10.0, 1550 -> 15.5, 10000 -> 100.0
   */
  formatPoints(pointsInt) {
    if (pointsInt === null || pointsInt === undefined) return null;
    return Number((pointsInt / 100).toFixed(2));
  },

  /**
   * Convert points float/int to integer hundredths
   */
  toPointsInt(points) {
    if (points === null || points === undefined) return null;
    return Math.round(Number(points) * 100);
  },

  /**
   * Calculate Student Score Summary for a syllabus version and student
   * 
   * @param {Object} syllabus - Published syllabus containing tasks and links
   * @param {Array} publishedGrades - Array of published GradeEntry / GradeRevision for this student
   * @param {Array} approvedBonuses - Array of approved BonusAwards for this student
   * @returns {Object} Canonical score summary
   */
  calculateStudentScoreSummary(syllabus, publishedGrades, approvedBonuses = []) {
    if (!syllabus || !syllabus.tasks) {
      throw new Error("SYLLABUS_INVALID: Missing syllabus or tasks");
    }

    // Map syllabus tasks by task_code / task_id for distinct tracking
    const taskMap = new Map();
    syllabus.tasks.forEach(task => {
      taskMap.set(task.task_code, task);
    });

    // Map published grades by task_code (latest published revision only)
    const gradeMap = new Map();
    (publishedGrades || []).forEach(grade => {
      if (grade.state === "published") {
        gradeMap.set(grade.task_code, grade);
      }
    });

    let gradedEarnedPointsInt = 0;
    let reviewedMaxPointsInt = 0;
    let reviewedTaskCount = 0;
    let pendingTaskCount = 0;

    // Iterate through DISTINCT syllabus tasks to prevent duplicate counting
    taskMap.forEach((task, taskCode) => {
      if (gradeMap.has(taskCode)) {
        const grade = gradeMap.get(taskCode);
        const earnedInt = grade.base_points_int !== undefined ? grade.base_points_int : 0;
        
        // Ensure earned points does not exceed task max
        const validEarnedInt = Math.max(0, Math.min(task.max_points_int, earnedInt));
        gradedEarnedPointsInt += validEarnedInt;
        reviewedMaxPointsInt += task.max_points_int;
        reviewedTaskCount++;
      } else {
        if (task.required) {
          pendingTaskCount++;
        }
      }
    });

    // Base course points earned so far from reviewed tasks
    const baseCoursePointsSoFarInt = gradedEarnedPointsInt;

    // Calculate approved bonus points (voluntary coloring bonus)
    let approvedBonusPointsInt = 0;
    (approvedBonuses || []).forEach(bonus => {
      if (bonus.state === "approved" && typeof bonus.points_int === "number") {
        approvedBonusPointsInt += Math.max(0, bonus.points_int);
      }
    });

    // Final accumulated course points capped at 100.00 points (10000 hundredths)
    const rawCoursePointsInt = baseCoursePointsSoFarInt + approvedBonusPointsInt;
    const accumulatedPointsCappedInt = Math.min(this.COURSE_MAX_POINTS_INT, rawCoursePointsInt);

    const isFullyGraded = pendingTaskCount === 0 && reviewedTaskCount >= taskMap.size;

    return {
      graded_earned_points_int: gradedEarnedPointsInt,
      graded_earned_points: this.formatPoints(gradedEarnedPointsInt),
      reviewed_max_points_int: reviewedMaxPointsInt,
      reviewed_max_points: this.formatPoints(reviewedMaxPointsInt),
      approved_bonus_points_int: approvedBonusPointsInt,
      approved_bonus_points: this.formatPoints(approvedBonusPointsInt),
      raw_course_points_int: rawCoursePointsInt,
      accumulated_points_capped_100_int: accumulatedPointsCappedInt,
      accumulated_points_capped_100: this.formatPoints(accumulatedPointsCappedInt),
      course_max_points: 100.0,
      reviewed_task_count: reviewedTaskCount,
      pending_task_count: pendingTaskCount,
      total_task_count: taskMap.size,
      fully_graded: isFullyGraded,
      is_provisional: !isFullyGraded
    };
  },

  /**
   * Determine the single canonical main status of a worksheet
   * 
   * Priority:
   * 1. No committed submission -> 'not_submitted'
   * 2. Teacher requested revision (and no newer submission) -> 'revision_required'
   * 3. All required linked tasks are published -> 'graded'
   * 4. Otherwise -> 'submitted'
   * 
   * @param {Object} submission - Latest submission record (or null)
   * @param {Array} linkedTasks - Array of syllabus tasks linked to this worksheet
   * @param {Map} publishedGradesMap - Map of published grades keyed by task_code
   * @param {Object} latestReview - Latest EvidenceReview record (or null)
   * @returns {Object} { main_status, partial_grading, overdue }
   */
  resolveWorksheetStatus(submission, linkedTasks = [], publishedGradesMap = new Map(), latestReview = null, dueAt = null) {
    // 1. Not submitted
    if (!submission || submission.deleted_at || !submission.latest_version_no) {
      const isOverdue = dueAt ? (new Date() > new Date(dueAt)) : false;
      return {
        main_status: "not_submitted",
        status_label_th: "ยังไม่ส่ง",
        partial_grading: false,
        overdue: isOverdue
      };
    }

    // Check overdue badge independently
    const submittedAt = submission.latest_version_submitted_at || submission.created_at;
    const isOverdue = dueAt && submittedAt ? (new Date(submittedAt) > new Date(dueAt)) : false;

    // 2. Revision Required: teacher explicitly requested revision and no newer submission committed
    if (latestReview && latestReview.decision_state === "needs_revision") {
      // If submission version has not advanced past the reviewed version
      if (!latestReview.reviewed_version_id || latestReview.reviewed_version_id === submission.latest_version_id) {
        return {
          main_status: "revision_required",
          status_label_th: "ส่งกลับให้แก้ไข",
          partial_grading: false,
          overdue: isOverdue
        };
      }
    }

    // 3. Graded vs Submitted vs Partial Grading
    if (linkedTasks.length === 0) {
      // No linked numeric tasks; if submission exists, it's submitted
      return {
        main_status: "submitted",
        status_label_th: "ส่งแล้ว — รอตรวจ",
        partial_grading: false,
        overdue: isOverdue
      };
    }

    let gradedTasksCount = 0;
    linkedTasks.forEach(task => {
      if (publishedGradesMap.has(task.task_code)) {
        gradedTasksCount++;
      }
    });

    if (gradedTasksCount === linkedTasks.length) {
      return {
        main_status: "graded",
        status_label_th: "ตรวจแล้ว",
        partial_grading: false,
        overdue: isOverdue
      };
    }

    return {
      main_status: "submitted",
      status_label_th: "ส่งแล้ว — รอตรวจ",
      partial_grading: gradedTasksCount > 0,
      overdue: isOverdue
    };
  },

  /**
   * Calculate worksheet counts for student summary
   */
  calculateWorksheetSummary(worksheets, worksheetStatuses) {
    const totalRequired = worksheets.length;
    let submittedCount = 0;
    let gradedCount = 0;
    let notSubmittedCount = 0;
    let revisionRequiredCount = 0;

    worksheetStatuses.forEach(wsStatus => {
      if (wsStatus.main_status === "graded") {
        gradedCount++;
        submittedCount++;
      } else if (wsStatus.main_status === "submitted") {
        submittedCount++;
      } else if (wsStatus.main_status === "revision_required") {
        revisionRequiredCount++;
        submittedCount++; // Counted as submitted previously, needs fix
      } else {
        notSubmittedCount++;
      }
    });

    const progressPercent = totalRequired > 0 ? Math.round((submittedCount / totalRequired) * 100) : 0;

    return {
      total_required: totalRequired,
      submitted_distinct: submittedCount,
      graded_distinct: gradedCount,
      not_submitted_distinct: notSubmittedCount,
      revision_required_distinct: revisionRequiredCount,
      progress_percent: progressPercent
    };
  },

  /**
   * Group shared vs individual score calculation
   * Shared component is assigned to the group, individual component is distinct per student.
   * 
   * @param {Object} sharedComponentScore - { points_int, max_points_int }
   * @param {Object} individualComponentScore - { points_int, max_points_int }
   * @returns {Object} Total combined score for this student for this group task
   */
  calculateGroupTaskScore(sharedComponentScore, individualComponentScore) {
    const sharedPoints = (sharedComponentScore && typeof sharedComponentScore.points_int === "number")
      ? Math.max(0, sharedComponentScore.points_int)
      : null;
    
    const individualPoints = (individualComponentScore && typeof individualComponentScore.points_int === "number")
      ? Math.max(0, individualComponentScore.points_int)
      : null;

    if (sharedPoints === null && individualPoints === null) {
      return { total_points_int: null, total_points: null, state: "pending" };
    }

    // Both components must be graded for a complete task grade
    const totalPointsInt = (sharedPoints || 0) + (individualPoints || 0);
    return {
      shared_points_int: sharedPoints,
      individual_points_int: individualPoints,
      total_points_int: totalPointsInt,
      total_points: this.formatPoints(totalPointsInt),
      is_partial: sharedPoints === null || individualPoints === null
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = GradingEngine;
}

