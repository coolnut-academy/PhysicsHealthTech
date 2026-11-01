# GRADING_DATA_SCHEMA.md — Additive Tabs and Integrity Constraints

## 0. Relationship to core database
This file extends `DATA_SCHEMA.md` v1.0. **Existing `Students`, `Enrollments`, `Assignments`, `Submissions`, `SubmissionVersions`, `SubmissionFiles`, `Projects`, `Groups`, `GroupMembers`, `AuditLogs`, `Operations` remain; do not remove or truncate them.** Use one Sheet workbook *per environment* with stable internal IDs and academic year foreign keys. This is a proposed relational model mapped to Google Sheet tabs, not a promise of native database constraints.

| Tab | Primary key | Required columns | Unique/validity rules |
|---|---|---|---|
| `SyllabusVersions` | `syllabus_version_id` | `academic_year_id`, `grade`, `version_no`, `source_checksum`, `state`, `approved_teacher_uid`, `approved_at`, `course_max_points_int=10000`, `sessions_count=20`, `minutes_per_session=100`, `revision` | Unique `(year,grade,version_no)`; one active published version per course; no auto overwrite |
| `TaskDefinitions` | `task_id` | `syllabus_version_id`, `task_code`, `title`, `max_points_int`, `scoring_scope`, `component_spec_json`, `required`, `status`, `category`, `sort_order` | Unique `(syllabus_version_id,task_code)`; sum distinct base Task maxima exactly `10000` at publish |
| `WorksheetTaskLinks` | `link_id` | `syllabus_version_id`, `assignment_id`, `task_id`, `relation`, `display_order` | Unique `(syllabus_version_id,assignment_id,task_id)`; Task can link multiple worksheets without score duplication |
| `RubricCriteria` | `criterion_id` | `syllabus_version_id`, `task_id`, `component_id`, `criterion_code`, `label`, `max_points_int`, `sort_order` | Unique `(task_id,component_id,criterion_code)`; criteria sum to component/task max |
| `GradeEntries` | `grade_entry_id` | `syllabus_version_id`, `academic_year_id`, `student_uid`, `task_id`, `assessment_instance_id`, `current_revision_id`, `state`, `graded_evidence_version_id`, `revision`, `updated_at` | Unique active `(syllabus_version_id,student_uid,task_id,assessment_instance_id)` for official grade; `state=pending|draft|published|needs_regrade|void` |
| `GradeRevisions` | `grade_revision_id` | `grade_entry_id`, `previous_revision_id`, `actor_teacher_uid`, `state`, `base_points_int`, `rubric_breakdown_json`, `feedback`, `reason`, `graded_evidence_version_id`, `published_at`, `created_at`, `request_id`, `idempotency_hash` | Append-only; draft not shown students; published immutable per revision; duplicate publish idempotent |
| `GroupScoreComponents` | `group_score_id` | `group_id`, `task_id`, `component_id`, `assessment_instance_id`, `shared_points_int`, `member_snapshot_id`, `grade_revision_id`, `state`, `created_at` | Unique active group/component/instance; shared grading is one source not per-person independent copy |
| `IndividualScoreComponents` | `score_component_id` | `student_uid`, `task_id`, `component_id`, `assessment_instance_id`, `points_int`, `grade_revision_id`, `state` | Individual scores are separate; no peer-readable record |
| `GroupMembershipSnapshots` | `member_snapshot_id` | `group_id`, `academic_year_id`, `grade`, `round_id`, `member_uids_json`, `created_at`, `captured_by_teacher_uid` | Freeze member identity for score attribution; do not rely solely on mutable live group list |
| `BonusAwards` | `bonus_id` | `syllabus_version_id`, `student_uid`, `bonus_kind=coloring`, `source_assignment_id`, `points_int`, `state`, `approved_by`, `approval_revision_id`, `created_at` | Unique natural policy key for an award; no duplicate bonus on resubmit; audited separate from 100 base |
| `AssessmentEvidenceLinks` | `assessment_link_id` | `task_id`, `evidence_type`, `submission_version_id`, `project_id`, `artifact_id`, `group_id`, `created_at` | Validate exactly applicable link to authorized evidence; cross-year/grade consistency |
| `CourseGradeFinalizations` | `finalization_id` | `student_uid`, `syllabus_version_id`, `final_points_int`, `grade_snapshot_hash`, `finalized_by_teacher_uid`, `finalized_at`, `revision` | Final only after all required tasks published and official roster reconciled; revisions audited |

## 1. Core schema columns to extend (additive migrations)
- `Assignments`: add `worksheet_code`, `syllabus_version_id`, `session_start`, `session_end`, `required`, `grading_policy`, `due_at` (existing due metadata preserved; migration must backfill only when verified).
- `EvidenceReviews`: add `decision_state` and `grading_version_ref` optional for audit linking; do **not** treat legacy `evidence_confirmed` as `graded`.
- `Submissions`: status can maintain existing evidence enum; public worksheet status is **derived** from canonical submission + grade state in service, not a raw untrusted browser field.
- `AuditLogs`: `grade_entry_id` or `grade_revision_id` object refs, `reason_code`, old/new points summary (no secrets).

## 2. Foreign keys (backend enforced)
`SyllabusVersions → AcademicYears`, `TaskDefinitions → SyllabusVersions`, `WorksheetTaskLinks → Assignments + TaskDefinitions`, `GradeEntries → Students + TaskDefinitions + Enrollment`, `GradeRevisions → GradeEntries + Teachers`, `GroupScoreComponents → Groups + GroupMembershipSnapshots`, `IndividualScoreComponents → Students`, `BonusAwards → Students + SyllabusVersions`.
- Server verifies all related year+grade+syllabus snapshot match; cannot mix Task of M4/2569 into M5/2570.
- `student_uid` and Task IDs are never accepted as authoritative from unauthenticated/student grade RPCs.
- Use integer hundredths: `0 ≤ score_int ≤ max_points_int`; if rubric present, `sum(criterion_points_int) = component_points_int`; base Task maxima totals `10000` at publish.
- No `GradeEntry` required for pending Task; read APIs generate pending=null. **Blank field is not a stored zero**.

## 3. Index, optimistic concurrency and migration
- Use in-memory maps keyed by `(year,grade,student_uid,task_id)` during request, not repeated `getDataRange()` scans on every nested loop; cache summaries carefully, invalidate on publish and roster correction.
- Use one short `LockService` critical section for sheet write and revisions and idempotency record. Sheets has no full ACID transaction: operation-journal state and repair of partial commits mandatory.
- Schema migrator `V2_ADD_GRADING` must be rerunnable, non-destructive, add new tabs/columns, detect already migrated, create staging backups before production migrations, and support dry-run.
- Keep immutable syllabus snapshot and every published grade revision after academic year rollover. Export/re-import in backups preserves both Sheet rows and private Drive association.
