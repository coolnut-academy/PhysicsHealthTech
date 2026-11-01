# GRADING_ENGINE.md — Single-Source-of-Truth Score & Status Rules

## 1. Fundamental distinctions
- `submission_state` = whether latest authorized evidence version was uploaded/needs revision.
- `grading_state` = whether a verified teacher scored a syllabus Task, saved an unpublished draft, or **published** a grade. These are separate state machines.
- `teacher_paper_checked` = teacher workflow/context; it does not mean online numeric grade exists.
- `not_submitted` = absence of a committed submission (derived); `overdue` = independent badge.
- `0` = only teacher deliberately recorded and published zero; `null` = no grade / awaiting review. Never default null to zero for student-facing display, averages or exports.

## 2. Canonical values (use integer hundredths of a point)
For a student `s` in a published syllabus version `v` and eligible official enrollment:
- `reviewed_tasks` = **distinct** `task_id` where latest applicable published grade entry is valid for the current assessment/evidence, including Task = 0 mark.
- `graded_earned_points = SUM(latest_published_score(task_id))` for `reviewed_tasks` only.
- `reviewed_max_points = SUM(task.max_points)` for `reviewed_tasks` only.
- `base_course_points_so_far = graded_earned_points` (pending Tasks have no assigned zero). The **complete base course total** is available only after every mandatory Task is reviewed and published.
- `approved_bonus_points` = sum of separately published, unique, eligible voluntary coloring bonuses, **not** included in Task base maxima and never treated as a score on a worksheet duplicate.
- `course_accumulated_points = MIN(100, base_course_points_so_far + approved_bonus_points)` displayed as `คะแนนสะสมที่ตรวจแล้ว / 100`, not final course result while pending tasks exist.
- `final_course_points` may be finalized only when all required Task statuses are finalized and teacher explicitly approves the course result. `max=100` even with bonus. Changing syllabus after publication requires migration review.
- `graded_task_fraction` can be shown, but not used to infer automatic zero or forecast score on pending Tasks.

## 3. Worksheet counts
`required_worksheets` = count of **published** required worksheet assignments for selected year/grade (nine once the full syllabus is published).
- `submitted_worksheets` = distinct worksheet IDs with at least one active committed evidence submission (includes revision-required); count once despite 10 photos / repeated versions.
- `graded_worksheets` = distinct worksheet IDs for which latest applicable version has all required linked syllabus Task assessments **published**; if worksheet has no numeric Task, require explicit teacher evidence completion policy to count graded (never automatically generate a grade).
- `not_submitted_worksheets = required_worksheets - submitted_worksheets`.
- `revision_required_worksheets` = submitted worksheets with explicit latest revision-required decision.
- `submission_progress_percent = round(100*submitted_worksheets/required_worksheets)` (if 0 required, display `—`, not divide by zero).
- These counts are **worksheet counts, not image counts, Task counts, project counts or points**. Out-of-roster submissions appear for the student with special annotation but remain separate from **official** roster-based teacher statistics.

## 4. Worksheet main status (priority evaluation)
1. No committed active submission → `not_submitted`.
2. Latest teacher review requests changes and no new commit → `revision_required`.
3. Current evidence version reviewed, **all required grade-linked Task scores published** and no pending revision → `graded`.
4. Otherwise `submitted` (secondary `partial_grading` when some linked Task scores published).
5. `overdue` independently computed from server current timestamp, assignment due policy, extension and recorded submitted_at. Never replace the main state.

A Task associated with multiple worksheets is still *one* grade entry. A single grade may make a Task visible on several cards; its maximum enters the dashboard only once. If a teacher changes a grade, record the grade revision and recalculate affected worksheet cards using the canonical Task ledger.

## 5. Teacher grading transaction
1. Verified teacher requests `teacher.gradebookContext` for specific enrollment/assignment/evidence version: server verifies role, syllabus snapshot, Task IDs, membership and grader permissions.
2. Teacher enters score per Task or rubric criterion, feedback, any optional bonus, reason if regrading; **draft** persists but is never student-visible.
3. Validate components, rubric sums, grade 0 allowed, scores 0..max, task distinct key, official enrollment, current evidence version, optimistic `revision` and idempotency key.
4. Teacher presses Publish; backend acquires short lock, appends `GradeRevisions` and audit, promotes current `GradeEntries`, invalidates cached student summary, reads back revision, returns confirmed receipt.
5. Student view is built server-side from **published** canonical scores only and immediately reflects latest revision on next refresh. If publish partially fails, fail closed + reconcile; never show half-published score or silently overwrite old score.
6. When a later submission version is committed, invalidate current-version approval for impacted evidence-dependent Tasks (`needs_regrade`), **preserve old published grade in audit history**, and decide teacher policy for grade carry-forward explicitly; do not inherit stale grades by default.

## 6. Groups, individual scoring and presentation
- A mixed group Task is partitioned into distinct assessment components: `shared` and `individual`; sum component maxima = Task maximum. Shared component has **one canonical source score** per `(group_id, task_id, component_id, assessment_instance_id)`.
- At score publication, freeze eligible group-member snapshot for this year/grade/round. Derive each eligible student's effective Task from shared component + their individual component; member A's individual portion cannot overwrite member B's portion.
- If group membership changes later, existing score decisions do **not** silently propagate to new members or revoke old grading; require verified teacher reassessment, with reason/audit and membership-version snapshot.
- A group project may have **one actual presentation event/round** with Task/rubric attribution. An individual project requires no class presentation. Neither creates extra scoring capacity outside the 100-point syllabus.
- Group member evidence view is limited to current authorized membership; score views remain **each student's own** only (a group member must not see another member's individual marks).

## 7. Cross-year gradebook eligibility
Active authenticated students may submit any open assignment regardless of roster. The official course gradebook requires a valid `Enrollment` for that course year/grade OR an explicit teacher-approved reconciliation. An out-of-roster submission is visible in a separate teacher inbox and remains valid evidence, but cannot silently affect official enrollment-based course aggregates. Reconcile first, then allow teacher publish into official gradebook; audit both the original out-of-roster flag and reconciliation.

## 8. Score corrections and exporting
Every score update uses immutable `GradeRevisions` with old/new integer points, teacher UID, reason, timestamp, syllabus version, linked evidence version, request id. `GradeEntries` holds only latest approved/current pointer. Soft delete restores provenance, never erases ledger. Export requires server-verified teacher permission; include explicit `pending` indicators/blank numeric cells, not zero; escape formula injection in CSV/Sheet and log export audit. No student export of peer data.

## 9. Synthetic example (NOT real syllabus)
If graded Task maxima total 40 points and earned score totals 31, with remaining Tasks (60 max points) pending, UI shows:
- `คะแนนจากงานที่ตรวจแล้ว 31/40`, `คะแนนสะสม 31/100`, `รอการตรวจ 60 คะแนนเต็ม`.
- NOT `31/100 = คะแนนสุดท้าย`, and NOT `31+0` as a claim pending work scored zero.
After 2 approved bonus points: `คะแนนสะสมรวมโบนัส 33/100` (provided unique eligibility), but any full course total is capped at 100.
