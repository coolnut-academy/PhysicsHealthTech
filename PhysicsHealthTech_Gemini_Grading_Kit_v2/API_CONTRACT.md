# API_CONTRACT.md — Server RPC shape (design, not code)

## v2.0 New Grading Actions
`GRADING_API_CONTRACT.md` extends this registry: `student.dashboard`, `student.worksheetCards`, `student.gradeHistory`, `teacher.gradebookMatrix`, `teacher.gradebookContext`, `teacher.saveGradeDraft`, `teacher.publishGrade`, `teacher.requestRevision`, `teacher.awardBonus`, `teacher.groupScoreContext`, `teacher.publishGroupScores`, `teacher.finalizeCourseGrade`, `teacher.exportGradebook`, `teacher.importSyllabusPreview`, `teacher.publishSyllabus`. AuthN/AuthZ and source-of-truth grade rules apply **on every action**. `teacher.reviewEvidence` from v1 is **not** equivalent to teacher grade publication.

**Transport:** Apps Script HTML Service `google.script.run.api(request)` (one **allowlisted** public dispatcher). Never expose direct spreadsheet/Drive functions to client. Calls asynchronous and responses may arrive out of order.

## 1. Standard envelope
```json
{
  "action": "assignments.list",
  "request_id": "opaque-client-correlation-id",
  "session_token": "opaque bearer, never in URL or log",
  "payload": {"academic_year_id": "yr_opaque", "grade": "M4"}
}
```
Response success: `{"ok":true,"data":{},"request_id":"..."}`. Failure: `{"ok":false,"error":{"code":"ACCESS_DENIED","message_th":"ไม่สามารถเข้าถึงรายการนี้ได้","retryable":false},"request_id":"..."}`. Internal stack traces, sheet IDs and sensitive data never delivered.

**Dispatcher rule:** RPC handler resolves verified principal, applies action-specific authorization, resolves resource from server storage, validates schema/length/enums, executes, returns least-privilege view model. `api` must never delegate based on arbitrary client-supplied function name. Use no generic `sql`, `readSheet`, `getDriveFile` or `setRole` public actions.

## 2. Action catalog
| Action | Role | Payload | Returns | Enforcement |
|---|---|---|---|---|
| `auth.studentLogin` | Anonymous | code_5_digit + independent secret | short-lived session and own account summary | rate limit; generic failure; no role spoof |
| `auth.teacherLogin` | Anonymous | verified Google credential token | session + teacher view | issuer/audience/exp/signature/allowlist + login-CSRF binding; iframe POC required |
| `auth.logout` | Authenticated | session token | revoked | invalidate server-side record |
| `auth.me` | Authenticated | token | own profile/capabilities | validate active account and session |
| `years.list` | Authenticated | optional include_archived | authorized public year metadata | no private roster |
| `assignments.list` | Student/Teacher | academic_year_id, grade | visible assignment summaries with own status | only published visible work; not roster-gated |
| `assignments.get` | Student/Teacher | assignment_id | assignment metadata, own version refs | resolve assignment server-side |
| `submissions.begin` | Student | assignment_id, idempotency_key | upload_op_id, limits | assignment/year open; own session; no enrollment gate |
| `submissions.uploadEvidence` | Student | upload_op_id + bounded file blob/form | staged result | MIME signature, limits, operation ownership and active session |
| `submissions.complete` | Student | upload_op_id, note | canonical submission/version receipt | lock, verified Drive file, idempotent commit; server sets UID/roster flag |
| `submissions.status` | Student/Teacher | operation_id | operation state | own operation or verified teacher |
| `submissions.mine` | Student | year/grade/assignment filters | own history and opaque evidence refs | `student_uid` only from session |
| `evidence.preview` | Student/Teacher | opaque evidence_ref | authorized small file payload and MIME | ownership/group membership and file status check |
| `projects.listMine` | Student | optional year | own projects + active-group projects | no other students/groups |
| `projects.createIndividual` | Student | year,grade,title | project ID | eligible authenticated account; no max 1 cap |
| `projects.addArtifact` | Student | project_id, kind, text or evidence_op | version receipt | individual owner or current group member; append only |
| `teacher.rosterMatrix` | Teacher | year,grade,room,assignment filters | roster based matrix, sorted numeric roll number | verified teacher; exclude out-of-roster from denominator |
| `teacher.reviewEvidence` | Teacher | submission_id, version_id, decision, revision | audit review receipt | teacher active, optimistic revision, no academic grading implied |
| `teacher.outOfRoster` | Teacher | year,grade,filters | flagged submissions | secure list; include only verified server-computed records |
| `teacher.reconcileSubmission` | Teacher | submission_id, action, reason | updated mapping/status + audit | correct wrong destination / soft delete; never quietly change original author |
| `teacher.upsertEnrollment` | Teacher | year,grade,room,student_uid,roll_no | canonical enrollment | uniqueness, status and audit |
| `teacher.upsertAssignment` | Teacher | assignment or template changes | canonical metadata | validate year state and status transitions |
| `teacher.createYear` | Admin teacher | year_be, idempotency_key, preview_revision | create op receipt / draft year | uniqueness, both grades, lock+journal, never overwrite past |
| `teacher.publishYear` | Admin teacher | year_id, revision | published status | both grades exist, templates complete; audit |
| `teacher.groups` | Teacher | create/update group members | group roster | no arbitrary student self-join |
| `teacher.trashRestore` | Admin teacher | object_type/id, action, reason, revision | new status | soft delete, undo, audit |
| `teacher.healthReconcile` | Admin teacher | dry_run default true, scope | consistency report | lock and safety checks; rate limiting |

## 3. Important server-generated fields
- `student_uid`, `teacher_uid`, effective role, latest version number, `out_of_roster`, `submitted_at`, `drive_file_id`, and review author are **never** accepted as authoritative from a request.
- `assignments.get` may return the assignment's **published** year/grade, never grant access based on client-selected year/grade alone.
- `evidence.preview` never returns non-own group member lists or Drive sharing links.
- `teacher.*` action cannot be invoked successfully by student even if action name, payload and HTML are hand-crafted.

## 4. Error and idempotency model
- Every modifying RPC requires a `request_id`; upload/version/year-create mutations require `idempotency_key` with server `(actor,target,operation,payload_digest)` binding.
- Replay same operation after timeout → previously committed response. Same key with different payload → `IDEMPOTENCY_CONFLICT`.
- Failure to secure script lock → `SERVER_BUSY` with retry guidance, no partial public success.
- Unreconciled staging failure → `UPLOAD_RECONCILE_REQUIRED`, never fake submission success.
- `SESSION_EXPIRED` should prompt re-authentication while preserving currently selected input where possible.

## 5. Implementation notes
Use a client wrapper converting `google.script.run.withSuccessHandler(...).withFailureHandler(...)` to Promise and serializing related operations. Tests should inject API requests directly (bypassing UI) for all negative authorization cases.
