# GRADING_API_CONTRACT.md — Additional RPC Actions

All actions use the existing `api(action, request)` allowlist and active verified server-side session; reject extra client-authority fields. Every mutation needs `request_id` and idempotency binding, where relevant `expected_revision`. No direct Sheet/Drive IDs are returned to students.

| RPC | Caller | Request (minimum) | Response | Mandatory server checks |
|---|---|---|---|---|
| `student.dashboard` | Student | `academic_year_id`, `grade` | own profile + grade/worksheet aggregates | own `student_uid` from session; only published grades; no peer roster |
| `student.worksheetCards` | Student | year, grade | nine published cards with own status/task/null grade | whitelist fields, optional out-of-roster banner |
| `student.gradeHistory` | Student | own `task_ref` | own published revisions/feedback allowed by policy | derive student UID, prohibit arbitrary peer UID |
| `teacher.gradebookMatrix` | Teacher | year, grade, room, filters | roster-sorted summary rows | verified teacher; official roster, separate out-of-roster |
| `teacher.gradebookContext` | Teacher | `enrollment_id`, `task_id`, `evidence_ref` | rubric, current draft/published version | verified permissions, syllabus/year/grade alignment and evidence authorization |
| `teacher.saveGradeDraft` | Teacher | Task/component score, rubric values, feedback, evidence version, request ID, expected revision | draft receipt | verify Task maxima, rubric sum, membership and status; hidden from student |
| `teacher.publishGrade` | Teacher | grade draft/revision ID, idempotency key, reason if regrade | persisted published revision receipt | role, roster eligibility/reconciliation, current evidence, short lock, audit, cache invalidation |
| `teacher.requestRevision` | Teacher | submission ID, current version, feedback, revision | updated revision-required state | teacher rights, current version, audit, never erase published history |
| `teacher.awardBonus` | Teacher | student enrollment, source worksheet, coloring bonus, rubric-policy ref, idempotency key | audited bonus award receipt | explicitly voluntary, duplicate control, policy/max and total cap |
| `teacher.groupScoreContext` | Teacher | group ID, task ID, assessment instance | shared+individual component structure, member snapshot preview | verified teacher; no mismatched group/Task/year |
| `teacher.publishGroupScores` | Teacher | group shared component + each person's individual component scores, membership snapshot, idempotency key | member-specific published receipts | audited atomic-ish batch journal, no partial member releases, no duplicate Task |
| `teacher.finalizeCourseGrade` | Teacher | enrollment, syllabus version, expected revision | final grade and snapshot | all required Tasks graded, 100-point syllabus, no unresolved out-of-roster |
| `teacher.exportGradebook` | Teacher | year, grade, room, format | teacher download/export operation ID | data minimization, audit, null≠0, CSV injection-safe, never public export |
| `teacher.importSyllabusPreview` | Teacher | structured syllabus staging import | validation errors, 9 worksheet rows, dedup task 100 sum | no live mutation, source checksum, parse/validate |
| `teacher.publishSyllabus` | Admin teacher | verified staging import revision + explicit approval | immutable published snapshot | blocked if missing official syllabus, duplicate IDs, invalid points, retro mutation |

Errors: `SYLLABUS_NOT_APPROVED`, `TASK_NOT_FOUND`, `GRADE_PENDING`, `GRADE_ALREADY_PUBLISHED`, `GRADE_REVISION_CONFLICT`, `RUBRIC_MISMATCH`, `SCORE_OUT_OF_RANGE`, `OUT_OF_ROSTER_GRADE_BLOCKED`, `GROUP_MEMBERSHIP_CHANGED`, `BONUS_ALREADY_AWARDED`, `GRADEBOOK_LOCKED`, `ACCESS_DENIED`, `SESSION_EXPIRED`.

Security: a student sending `teacher.publishGrade` with a forged `role` or changed `student_uid` **always denies**. `student.dashboard` never accepts effective `student_uid` from browser; any optional target UID in student RPC is rejected to prevent IDOR. Group members do not receive each other's individual marks. Never treat API success until the persisted data is verified on read-back.
