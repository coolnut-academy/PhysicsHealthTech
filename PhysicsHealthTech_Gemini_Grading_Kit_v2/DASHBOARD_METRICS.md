# DASHBOARD_METRICS.md — Student and Teacher View Models

## Student Dashboard (all server-derived, own student_uid from verified session)
`profile: {display_name,code_5_digit,year_be,grade,room,roll_no,enrollment_status}` (only own active year profile; if viewing an out-of-roster grade/year, show explicit no-official-roster banner, not a fabricated room/roll).

`score_summary`: `graded_earned_points`, `reviewed_max_points`, `published_bonus_points`, `accumulated_points_capped_100`, `course_max_points=100`, `pending_task_count`, `fully_graded`, `finalized`, `as_of`, `syllabus_version`.

`worksheet_summary`: `total_required`, `submitted_distinct`, `graded_distinct`, `not_submitted_distinct`, `revision_required_distinct`, `progress_percent`.

`worksheet_cards[]`: `worksheet_code`, `title`, `session_range`, `due_at`, `main_status`, `overdue`, `out_of_roster`, `task_summaries[]` with `task_code`, `max_points`, `published_points|null`, `grading_state`, `feedback_when_published`, `submission_latest_version_no`, `has_history`.

**Display**
- Score 28 of 35 reviewed / 100 course: `คะแนนที่ได้จากงานที่ตรวจแล้ว 28 / 35`, secondary `คะแนนสะสม 28 / 100 (ยังไม่ใช่คะแนนสุดท้าย)`.
- Ungraded: `รอตรวจ` with null data, not `0` or a fake red failing indicator.
- Revision-required badge: show feedback and request for resubmission, historical grade visible only in a labeled **previous review**, not the latest current score.
- Assignment with 3 linked Tasks and 5 photos counts as **one worksheet sent**, even if linked Task appears on two worksheets.
- Timezone presentation `Asia/Bangkok`; store UTC timestamps. overdue based on authoritative clock, teacher exceptions and due_at.
- If published syllabus not ready: dashboard uses `ยังไม่ได้ประกาศรายละเอียดคะแนน` and avoids invented 100-point breakdown or scoring results.

## Teacher overview/matrix
`teacher.gradebookMatrix({year_id,grade,room})` generates rows from Enrollments sorted numeric `roll_no` ascending and columns from 9 worksheet snapshots/Task gradebook; each row has own `submitted_count`, `graded_count`, `missing_count`, `pending_task_count`, `published_cumulative_score`, `bonus`, `finalized`. Teachers may inspect task detail to grade by rubric. `out_of_roster` submissions appear in a separate inbox and are not silently attached to another enrolled student's score.

## UI principles
- One main status per worksheet: `ยังไม่ส่ง`, `ส่งแล้ว — รอตรวจ`, `ตรวจแล้ว`, `ส่งกลับให้แก้ไข`. `เกินกำหนด` is secondary.
- Support filter by year/grade/room/status/Task, with explicit empty/pending/error/permissions states.
- Only a verified teacher can see roster/matrix or export full gradebook. Student cannot enumerate peers, inspect group peers' individual scores, or change grade payload.
- On teacher publish, invalidate server summaries for affected student, year, group Task and all linked worksheets; next student refresh shows current data (avoid unproven push realtime claims).
