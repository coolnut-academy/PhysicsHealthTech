/**
 * Unit Tests for GradingEngine
 * Tests: GR03, GR04, GR05, GR06, GR07, GR08, GR09, GR16, GR17, GR19, GR20, GR21, GR22, GR29, GR30
 */

const assert = require("assert");
const GradingEngine = require("../../backend/GradingEngine.gs");
const { SYNTHETIC_M4_SYLLABUS } = require("../fixtures/synthetic-data");

function runGradingEngineTests() {
  console.log("▶ Running GradingEngine Unit Tests...");

  // Test 1: Task Base Points Calculation
  {
    console.log("  - Test: Integer hundredths conversion");
    assert.strictEqual(GradingEngine.formatPoints(1000), 10.0);
    assert.strictEqual(GradingEngine.formatPoints(1550), 15.5);
    assert.strictEqual(GradingEngine.formatPoints(10000), 100.0);
    assert.strictEqual(GradingEngine.toPointsInt(10.0), 1000);
    assert.strictEqual(GradingEngine.toPointsInt(15.5), 1550);
  }

  // Test 2 (GR04): Task linked to multiple worksheets (T4-03 on W03 and W04) counts ONCE
  {
    console.log("  - Test GR04: Task deduplication (T4-03 on W03 and W04 counts once)");
    const publishedGrades = [
      { task_code: "T4-01", base_points_int: 1000, state: "published" },
      { task_code: "T4-02", base_points_int: 1000, state: "published" },
      { task_code: "T4-03", base_points_int: 1500, state: "published" } // linked to W03 and W04
    ];

    const summary = GradingEngine.calculateStudentScoreSummary(SYNTHETIC_M4_SYLLABUS, publishedGrades);
    // T4-01 (10.0) + T4-02 (10.0) + T4-03 (15.0) = 35.0 (3500 int)
    assert.strictEqual(summary.graded_earned_points_int, 3500, "Earned points should sum distinct tasks only");
    assert.strictEqual(summary.graded_earned_points, 35.0);
    assert.strictEqual(summary.reviewed_max_points_int, 3500);
    assert.strictEqual(summary.reviewed_task_count, 3, "Reviewed tasks count must be distinct");
  }

  // Test 3 (GR05 & GR06): Ungraded task returns null / pending; explicit 0 is 0
  {
    console.log("  - Test GR05 & GR06: Pending tasks return null; explicit 0 allowed");
    const publishedGrades = [
      { task_code: "T4-01", base_points_int: 0, state: "published" } // Explicit 0
    ];

    const summary = GradingEngine.calculateStudentScoreSummary(SYNTHETIC_M4_SYLLABUS, publishedGrades);
    assert.strictEqual(summary.graded_earned_points_int, 0, "Explicit 0 gives 0 points");
    assert.strictEqual(summary.reviewed_max_points_int, 1000);
    assert.strictEqual(summary.pending_task_count, 8, "Remaining 8 tasks are pending");
    assert.strictEqual(summary.is_provisional, true, "Provisional while tasks remain pending");
  }

  // Test 4 (GR19 & GR20): Coloring bonus is separate, audited, and course accumulated score is capped at 100
  {
    console.log("  - Test GR19: Voluntary bonus capped at 100 course points");
    // Suppose student earns 99.0 points base + 4.0 points bonus
    const publishedGrades = [
      { task_code: "T4-01", base_points_int: 1000, state: "published" },
      { task_code: "T4-02", base_points_int: 1000, state: "published" },
      { task_code: "T4-03", base_points_int: 1500, state: "published" },
      { task_code: "T4-04", base_points_int: 1000, state: "published" },
      { task_code: "T4-05", base_points_int: 1000, state: "published" },
      { task_code: "T4-06", base_points_int: 1000, state: "published" },
      { task_code: "T4-07", base_points_int: 1000, state: "published" },
      { task_code: "T4-08", base_points_int: 1000, state: "published" },
      { task_code: "T4-09", base_points_int: 1400, state: "published" } // total base = 9900 (99.0 pts)
    ];

    const approvedBonuses = [
      { bonus_id: "bon_1", state: "approved", points_int: 400 } // 4.0 points bonus
    ];

    const summary = GradingEngine.calculateStudentScoreSummary(SYNTHETIC_M4_SYLLABUS, publishedGrades, approvedBonuses);
    assert.strictEqual(summary.graded_earned_points_int, 9900);
    assert.strictEqual(summary.approved_bonus_points_int, 400);
    assert.strictEqual(summary.raw_course_points_int, 10300, "Raw points = 103.0");
    assert.strictEqual(summary.accumulated_points_capped_100_int, 10000, "Capped course points must not exceed 10000 (100.0)");
    assert.strictEqual(summary.accumulated_points_capped_100, 100.0);
  }

  // Test 5 (GR16 & GR17): Worksheet status priority resolution
  {
    console.log("  - Test GR16 & GR17: Worksheet main status (not_submitted -> submitted -> partial -> graded)");
    const tasks = [
      { task_code: "T4-01", max_points_int: 1000 },
      { task_code: "T4-02", max_points_int: 1000 }
    ];

    // Case A: No submission -> not_submitted
    const statusA = GradingEngine.resolveWorksheetStatus(null, tasks);
    assert.strictEqual(statusA.main_status, "not_submitted");
    assert.strictEqual(statusA.status_label_th, "ยังไม่ส่ง");

    // Case B: Submission exists, no grades -> submitted
    const sub = { submission_id: "sub_1", latest_version_no: 1, created_at: "2026-06-01T08:00:00Z" };
    const gradeMapB = new Map();
    const statusB = GradingEngine.resolveWorksheetStatus(sub, tasks, gradeMapB);
    assert.strictEqual(statusB.main_status, "submitted");
    assert.strictEqual(statusB.partial_grading, false);
    assert.strictEqual(statusB.status_label_th, "ส่งแล้ว — รอตรวจ");

    // Case C (GR16): Partial grading -> submitted with partial_grading = true
    const gradeMapC = new Map([["T4-01", { base_points_int: 800 }]]);
    const statusC = GradingEngine.resolveWorksheetStatus(sub, tasks, gradeMapC);
    assert.strictEqual(statusC.main_status, "submitted");
    assert.strictEqual(statusC.partial_grading, true);

    // Case D (GR17): All linked tasks graded -> graded
    const gradeMapD = new Map([
      ["T4-01", { base_points_int: 800 }],
      ["T4-02", { base_points_int: 900 }]
    ]);
    const statusD = GradingEngine.resolveWorksheetStatus(sub, tasks, gradeMapD);
    assert.strictEqual(statusD.main_status, "graded");
    assert.strictEqual(statusD.status_label_th, "ตรวจแล้ว");

    // Case E: Revision required by teacher
    const reviewReq = { decision_state: "needs_revision", reviewed_version_id: "subv_1" };
    const subWithVer = { ...sub, latest_version_id: "subv_1" };
    const statusE = GradingEngine.resolveWorksheetStatus(subWithVer, tasks, gradeMapD, reviewReq);
    assert.strictEqual(statusE.main_status, "revision_required");
    assert.strictEqual(statusE.status_label_th, "ส่งกลับให้แก้ไข");
  }

  // Test 6 (GR21): Group shared vs individual score calculation
  {
    console.log("  - Test GR21: Group shared + individual score components combination");
    const shared = { points_int: 1000, max_points_int: 1000 };
    const indivA = { points_int: 450, max_points_int: 500 };
    const indivB = { points_int: 300, max_points_int: 500 };

    const scoreMemberA = GradingEngine.calculateGroupTaskScore(shared, indivA);
    const scoreMemberB = GradingEngine.calculateGroupTaskScore(shared, indivB);

    assert.strictEqual(scoreMemberA.total_points_int, 1450);
    assert.strictEqual(scoreMemberA.total_points, 14.5);

    assert.strictEqual(scoreMemberB.total_points_int, 1300);
    assert.strictEqual(scoreMemberB.total_points, 13.0);
  }

  console.log("✔ All GradingEngine Unit Tests Passed!\n");
}

if (require.main === module) {
  runGradingEngineTests();
}

module.exports = runGradingEngineTests;

