# GEMINI.md — PhysicsHealthTech AI Coding Agent Rules

## v2.0 Priority Override and Working Rules
**Highest-priority new user requirement:** `03_DASHBOARD_GRADING_REQUIREMENTS.md` supersedes `02_WEBAPP_CONTEXT.md` wherever the latter says this app does not academically grade. Old Brief B still governs all privacy/auth/cross-year/portfolio constraints. Add mandatory reads `GRADING_ENGINE.md`, `GRADING_DATA_SCHEMA.md`, `SYLLABUS_IMPORT_SPEC.md`, `DASHBOARD_METRICS.md`, `GRADING_API_CONTRACT.md`, `GRADING_TEST_CASES.md`, `MIGRATION_GUIDE_V2.md`. Only a verified teacher may grade/publish/regrade/award bonus; AI never assesses physics. `pending=null` **not 0**; exactly 9 worksheets/grade, 20×100 minutes, 100 syllabus points/grade, no double count of Task; voluntary coloring bonus separately audited capped at course 100. Group shared and individual portions independently attributed; published grade revisions append-only. **Missing real Syllabus**: use synthetic fixture task weights solely for testing and block production scorebook publication. New task IDs in `IMPLEMENTATION_PLAN.md` are mandatory; preserve original P0–P5 tests.

**Primary instruction file for Gemini 3.5 Flash — High (or other supported coding agent).**
**Working scope:** only PhysicsHealthTech student evidence / portfolio web app. This document is an instruction for AI development; not production configuration.

## Priority order
1. `03_DASHBOARD_GRADING_REQUIREMENTS.md` — **latest** dashboard, grading, worksheets/tasks, group marks and score privacy requirements; overrides conflicting v1 grading exclusions.
2. `02_WEBAPP_CONTEXT.md` — original product requirements, identity/security and year/roster rules; preserve original wording.
3. `SECURITY_MODEL.md`, `DECISIONS.md`, `SECURITY_SPIKES.md` — security and unresolved gates override convenience.
4. `GRADING_ENGINE.md`, `GRADING_DATA_SCHEMA.md`, `SYLLABUS_IMPORT_SPEC.md`, `GRADING_API_CONTRACT.md`, `DATA_SCHEMA.md`, `API_CONTRACT.md`, `ARCHITECTURE.md` — engineering contracts.
5. `DASHBOARD_METRICS.md`, `USER_FLOWS.md`, `SCREEN_SPECIFICATIONS.md`, `DESIGN_SYSTEM.md` — approved UX.
6. `IMPLEMENTATION_PLAN.md`, `TEST_PLAN.md`, `GRADING_TEST_CASES.md`, `TRACEABILITY_MATRIX.md`, `DEPLOYMENT_RUNBOOK.md` — sequencing and verification.
7. `01_WORKSHEETS_CONTEXT.md` — **metadata** only, not permission to create lesson plans or answer keys.
8. Other project instructions, only when they do not conflict with above.

## Mission
Produce and validate a maintainable, secure production-intent application from **HTML, CSS, Vanilla JS, Google Apps Script HTML Service, Google Sheets, private Google Drive**. Use GitHub Pages only as a link target to externally published student-created educational websites. Do **not** silently replace this stack with React/Next.js/Firebase/Supabase or a third-party auth host.

## Absolute non-negotiables
- Do not equate knowledge of 5-digit school code with authentication. Codes are TEXT (including leading zero), not passwords, identities or primary keys.
- Students must not view peers' individual submissions, metadata or private evidence, even via handcrafted requests; group members only access their own active group's data. Teacher permissions are server-enforced per call.
- All client-callable Apps Script global functions must be explicitly audited. Only `doGet` plus a constrained `api` RPC dispatcher and deliberately necessary approved entrypoints should be public; mark private helpers with a trailing `_`, or otherwise ensure they are never callable via `google.script.run`. Never expose sheet/drive helpers publicly.
- Do **not** trust browser-supplied user ID, role, roster membership, Drive ID, submitted_at, teacher flag, version, review state, or ownership.
- Roster is for reports, NOT a submission gate: authenticated students may submit to any open/published grade/year, and out-of-roster records must be flagged without contaminating enrollment-based statistics.
- Append only each submission/project artifact version. No silent destructive overwrite. Soft delete and restore with audit.
- Academic year creation idempotently adds 2 grade workspaces and templates in same spreadsheet. Never clone/delete previous years; new years start unpublished/draft.
- Student files are restricted Drive assets, never `Anyone with the link`; all previews require resource authorization before bytes are returned. Neither file ID nor folder URL is a capability.
- No real student names, secrets, tokens, production IDs, images or private Google account information in repository, prompts, logs, screenshots or synthetic fixtures.
- Do not label an unexecuted test as PASSED. Do not label an app as deployed without a verified URL and actual device test. Do not assert 100% secure or pixel-perfect without evidence.
- Apps Script quirks matter: deployment `executeAs` identity, iframe and Google sign-in, quotas, RPC asynchronous ordering, binary upload/preview limits, Google Sheet nontransactional writes. Resolve via spike tests, not assumptions.
- If security-critical prerequisites are unavailable, implement safe mock/staging only; document blockers in `DECISIONS.md` and `PROGRESS.md`, and stop before production. Do not invent owner approvals.

## Working procedure for every task
1. Read `START_HERE.md`, this file, **v2 change request**, original Brief B, current `PROGRESS.md`, all new grading specs, and relevant plan/docs.
2. Identify current phase ID, prerequisites, acceptance cases and files to change; make a small execution plan.
3. Implement **real code and tests** where technically possible. Do not deliver only commentary or skeletal placeholders.
4. Test: unit/integration; runtime/deployment/device tests only when credentials and services are actually available. Label simulated tests accurately.
5. Report any deviations in `DECISIONS.md` as ADRs and blocker risks; avoid scope creep.
6. Update `PROGRESS.md` (task IDs, files, change summary, tests actually run, pass/fail, proof, next task). Keep `PLAN.md` stable unless requirements change.
7. Before each phase gate review `TEST_PLAN.md` / `TRACEABILITY_MATRIX.md`. Proceed automatically into next nonblocked task, but do not bypass hard security gates or require sharing secrets in chat.

## Code standards
- Vanilla JS, modular services, minimal dependencies; small focused functions; schema validation on server and client; explicit errors and user-friendly Thai messages.
- Thai-first UI. Use safe text rendering (`textContent`), strict URL validation, no `eval`, no unsafe DOM interpolation, no public raw `DriveApp` operations.
- Prefer deterministic IDs for domain entities where appropriate plus server-validated collision checks, and cryptographically sound secret/session-token plan demonstrated with tests; **never claim `Math.random` or UUID alone is guaranteed CSPRNG**.
- Use `LockService` only for short critical sections and `revision`/idempotency for concurrent writes; do not hold global locks over Drive I/O.
- Metadata stays in one workbook, segregated by academic year. Keep dev/prod Drive + Sheets physically separate.
- Include `appsscript.json` explicit minimal scopes and `clasp` deployment workflow when coding starts; redact secret property values.
- Keep exact school details, template names, policy decisions as configuration or TODO only where owner confirmation is necessary.

## Response format per completed unit
`Task / Changed files / Tests actually run / Security check / Blockers / Next task` — concise Thai.

## v2 Conflict resolution examples
- Legacy: "teacher only confirms evidence, no grade" → **replaced** by human teacher scoring through explicit Task/Rubric publish workflow.
- Legacy: "12 or 20 assignment placeholder examples" → **replaced** by exactly 9 published worksheet sets for M4 and exactly 9 for M5; projects/artifacts remain separate.
- Legacy: "submitted means reviewed" → **false**. Submission and score publication are separate; pending is not zero.
- Legacy: "project grade independent from worksheets" → grades belong to **unique syllabus Tasks**; any evidence link to worksheet/project must not create duplicate points.
