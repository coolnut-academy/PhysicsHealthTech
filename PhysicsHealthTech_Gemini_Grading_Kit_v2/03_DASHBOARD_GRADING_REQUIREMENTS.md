# 03_DASHBOARD_GRADING_REQUIREMENTS.md — Product Change Request v2
**Approved requirement text distilled from user's message on 1 November 2026.** Supersedes any older statement that PhysicsHealthTech has no grading feature. Does **not** authorize automated AI grading; only verified teachers evaluate and publish academic scores. Keep `02_WEBAPP_CONTEXT.md` unchanged as a historical source, but this addendum takes precedence for grading/dashboard and worksheet counts.

## 1. Student roster and identity
- Teacher/admin preloads students: `code_5_digit` stored as TEXT preserving 0-prefix, legal name, grade (`M4|M5`), room, numeric roll number, B.E. academic year, enrollment state.
- Student **cannot self-register or edit identity/roster fields**; upon independently authenticated login, derive the profile and default year/grade from backend. Student identity uses stable `student_uid`, never school code alone.
- Require independent secret credential/approved verified alternative; server authorization on every RPC, file, score and page. Preloaded accounts ≠ proof of login.

## 2. Course/worksheet/Task constraints
- Each grade M4 and M5 has **exactly 9 worksheet sets** per published syllabus: `PHT4-W01`–`PHT4-W09`, `PHT5-W01`–`PHT5-W09`.
- Each grade has **20 class meetings × 100 minutes**, metadata only (no lesson plan generation here).
- Course maximum **100 points per grade** per academic-year syllabus. A worksheet may cover several syllabus Tasks, and Tasks may be linked to multiple worksheets. **Each Task counts exactly once per student** toward the course maximum.
- Task IDs (examples: `T4-03A`, `T5-03A`), exact full marks, due dates and rubric must come from **latest owner-approved Course Syllabus**, not invented by coding AI. The original syllabus is NOT present in this package; use synthetic fixture scores strictly for test/staging, do not publish a real scorebook until mapping and 100-point sum are verified.
- Teacher can set assignments, tasks, point maxima, rubric, deadlines, evidence requirements, publication and revision rules. Academic-year published copies are versioned/frozen.
- Support individual and group score components, plus **optional voluntary coloring bonus** as a separate audited record. `final_course_points = min(100, earned_reviewed_base_points + approved_bonus_points)`, never inflate a Task's full mark or double-count a Task. Denominator and maximum come from the approved syllabus, not the nine worksheet count.

## 3. Student dashboard
Show only authenticated student's own: name, five-digit ID, grade, room, roll, selected academic year. Show, with explicit independent meanings:
- **คะแนนที่ได้จากงานที่ตรวจแล้ว** (earned graded Task points), **คะแนนเต็มของงานที่ตรวจแล้ว** (graded Task max subtotal), and **คะแนนสะสมรวมโบนัส / 100** as a provisional course accumulation, NOT a final course grade until complete.
- Worksheets total (9 when all published), unique submitted, fully graded, not yet submitted, revision required, submission-progress percentage. Distinguish pending grades as `— / รอตรวจ`, **never 0** unless teacher explicitly grades zero.
- Worksheet cards: code, title, meeting index/range, linked Task maxima (deduplicated), due date, one main status, grade breakdown only when teacher-published, feedback, open/details, historical images.
- `เกินกำหนด` is a separate overdue badge, never replaces main status. Explain clearly if an open cross-year submission is out of roster and not counted in an official gradebook.

## 4. Status state model
Exactly one main student-visible worksheet status: `not_submitted` (derived) → `submitted` (complete upload, awaiting teacher) → `graded` (teacher published grade for all required linked Tasks for current evidence) OR `revision_required` (teacher requests changes). On resubmission, create a new immutable evidence version and return to `submitted`, keeping former reviews and score revisions in history. Partial Task grading keeps main status `submitted` with secondary `ตรวจแล้วบาง Task` and individual published results.
- Overdue is an independent boolean/badge; due extensions follow server-verified teacher policy.
- `evidence_confirmed` is an internal paper/evidence review decision; **not a public main status** and **not academic grading**. Teacher-only score draft must not display as published.

## 5. Upload and human-only grading workflow
Student completes worksheet on paper → teacher reviews paper → student takes photos of **every relevant page** → auth login → assignment → add multiple photos → verify/reorder previews → commit upload → `submitted` → teacher opens own authorized secure evidence preview → grades syllabus Tasks by rubric and saves feedback → explicit teacher Publish → `graded` and score visible in student dashboard. Teacher can request revision, optionally reopen, regrade with audit trail; student never edits scores.

## 6. Teacher workspace
- Year/grade/room/worksheet filters, numeric roll ordering, student ID/name, worksheets submitted/graded/missing, current provisional course points, per-student portfolio and task ledger.
- Grade on individual Task and optional rubric criteria; select `group_shared` component versus `individual` component explicitly; show feedback and who/when last published. Correcting a published grade requires reason, old/new values, immutable history and teacher identity.
- Show separate out-of-roster inbox without changing enrolled students' numerator/denominator, exports restricted to teachers and safe for spreadsheet formula injection.

## 7. Projects
- **Individual**: one or more per student, WebApp URL, info poster image, UI phone/tablet drawing, prompt versions, equation-test evidence, syllabus-linked Tasks; **no mandatory class presentation** for individual project.
- **Group**: one project per group per round, member names/roles for authorized members, shared WebApp URL/poster/UI/prompt/experiment evidence; shared component score is mapped to each eligible member on an auditable frozen membership snapshot; individual component score separately per member; **one real group presentation event** and its teacher evaluation.
- Never copy a group's shared score into multiple distinct Task IDs as a workaround. Prevent sharing unrelated groups' private work.

## 8. History/privacy/year reuse
- Keep immutable SubmissionVersions, GradeRevisions, rubric snapshots and membership snapshots for audit and review; previous years intact when creating next year.
- Cross-year/grade submissions remain allowed for active authenticated accounts to open assignments, independently of Enrollments. Flag `out_of_roster`, show in teacher inbox; **do not silently treat as official gradebook enrollment**; manual reconciliation before official grade publication.
- Students see only their own private scores/files plus authorized group evidence; only verified teacher/admin can issue/revise grades or export student score data.

## 9. New acceptance criteria (in addition to Brief B's original AC01–AC10)
1. Exactly nine worksheets per grade in published syllabus, with 20×100-minute metadata and stable codes.
2. Approved Task maxima sum to 100 per grade/year and mapped Task IDs remain unique even across multiple worksheets.
3. Pending/ungraded Tasks are `null`/pending, never 0; explicit zero can be graded only by teacher.
4. Published teacher grading changes student-owned dashboard and teacher gradebook consistently.
5. Bonus is opt-in, separately recorded, audited; course cap 100 and no Task double-counting.
6. Revision or resubmission does not overwrite earlier evidence/grading records; latest version's grading cannot falsely inherit an old approved grade.
7. Group shared points propagate to authorized members by snapshot; individual marks remain distinct.
8. Student cannot enumerate, request, mutate, export or preview another student's marks, images or roster metadata.
9. Teacher matrix sorted by numeric roll, with correct unique worksheet status counts.
10. Exports, backups, year cloning and history preserve score audit and syllabus snapshots.

## 10. Owner-dependent input
- **Not provided:** exact authoritative latest Course Syllabus with actual Task-to-worksheet mapping, full marks, rubric criteria, meeting associations and due dates. It MUST be supplied/approved before production-grade score publication. Schema/UI/tests should be built with synthetic fixtures in meantime.
- Still need owner approval for independent student credential, teacher verified identity deployment, image budgets and retention.
