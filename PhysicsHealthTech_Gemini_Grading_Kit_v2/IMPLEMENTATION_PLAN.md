# IMPLEMENTATION_PLAN.md — Phased coding-agent work orders

## v2.0 Phase Extensions — mandatory new work order
Preserve original P0–P5 IDs and add:
- **P0.06** Define syllabus import & dry-run exact 9 worksheet codes/grade, 20×100 metadata, 100 sum distinct Tasks; missing real Syllabus remains production blocker D15.
- **P1.09** Additive grading schema migrator, Task IDs, rubric, grade ledger/revisions, Group Score & Bonus tables, synthetic fixtures; anti-IDOR and audit unit tests.
- **P2.08** Student own profile + grading dashboard, distinct 9 worksheet metrics, score reviewed numerator/denominator and course/100, null pending, four statuses, overdue badge, history.
- **P3.08** Teacher Task/Rubric grade draft/publish/regrade+reason, student dashboard update, gradebook matrix and safe export.
- **P3.09** Approved import/publish of syllabus snapshot; score publication BLOCKED without real source/teacher approval.
- **P4.07** Shared/individual group Task score components + immutable member snapshot; one group presentation; no individual presentation requirement.
- **P5.08** Gradebook year reuse and 9 worksheet templates M4/M5, no old score overwrite; bonus 100-cap, import revision/backup.
- **P5.09** Execute GR01–GR32, authorization and concurrency tests; verify all v1 AC01–AC10 still pass.
Grade features integrate into each phase. `03_DASHBOARD_GRADING_REQUIREMENTS.md` overrides obsolete v1 statement of evidence-only grading. None of these tasks are yet implemented.

**Status:** NOT started · must work sequentially; each phase has a testable exit gate.  
**Constraint:** Do not write worksheet/lesson-plan content in this repository. Use mock assignment titles until the document track provides approved titles and types.

## Phase 0 — Mandatory engineering feasibility / trust boundaries
- [ ] P0.01 Confirm signed-in teacher identity via browser + exact deployment mode (`SECURITY_SPIKES.md` SP01/SP02).
- [ ] P0.02 Demonstrate secure student credential and server session token method with durable throttling (SP03).
- [ ] P0.03 Prototype safe private preview and bounded upload path, including iPhone HEIC fallback (SP04–SP06).
- [ ] P0.04 Confirm dev/prod separation, Google account owner, quotas; establish synthetic fixtures and test harness (SP07/SP08).
- [ ] P0.05 Update `DECISIONS.md` and `PROGRESS.md` with actual outcome; **no fake security sign-off**.

**P0 gate:** If actual Google resources are not yet connected, mark real-world experiments BLOCKED and develop with mocks only; never claim production proof. P1 can begin with isolated implementation, but cannot be release-ready without this gate.

## Foundation prerequisites (before Phase 1)
- [ ] Confirm school-controlled owning Google account and Drive storage/quota plan; assign dev/prod access.
- [ ] Confirm D01 student secret policy and D02 teacher login test method in `DECISIONS.md`.
- [ ] Establish Git repository (no tokens/data), Apps Script source sync strategy, separate dev/prod Sheet/Drive.
- [ ] Make synthetic fixture set from `DATA_SCHEMA.md`; define strict code review and release checklist.
- [ ] Create phase branch and update `PROGRESS.md` on every accepted PR/commit.

## Phase 1 — Security & Foundation
**Objective:** secure infrastructure, identity, authorization, skeleton screens and schema.

**Tasks**
- [ ] P1.01 Modular source tree `server/{api,auth,authorization,repository,domain,storage,audit,config,health}/`, `client/{index,styles,components,pages,api}/`, `tests/{unit,integration,e2e,security}/`, `scripts/`, `docs/`.
- [ ] P1.02 Schema migrator creating headers and validating all necessary normalized tabs; idempotent startup/migration; synthetic seed only.
- [ ] P1.03 Dev Drive root with restricted permissions, secret injection from Script Properties, nonsecret AppSettings.
- [ ] P1.04 Secure `api()` allowlist, standard request/response/error envelopes and server-only resource authorization helpers.
- [ ] P1.05 Student code+independent secret verifier, durable throttling, secure session issue/expiry/revocation, teacher reset, auditing; no plain-text creds.
- [ ] P1.06 **Teacher sign-in prototype**: test OIDC via actual HTML Service iframe; if incompatible document tested alternative (teacher-only deployment with verified Workspace user mode). Never grant teacher via client role string.
- [ ] P1.07 Authorization tests incl. A/B user object, revoked sessions, forged roles, teacher-only route via crafted RPC, group access stub denial.
- [ ] P1.08 Error handling / XSS-escaping DOM helpers, safe logger, auth login screens, automated lint/static checks.

**Deliverables:** deployed development-only portal + synthetic school accounts, passed AuthN/AuthZ tests, schema health report, documented sign-in deployment choice.  
**EXIT GATE P1:** `SECURITY_MODEL.md` go/no-go ID/auth cases must pass; no student data unless secure login proof confirmed.

## Phase 2 — Student Portal + Safe Upload
**Objective:** students can browse any open year/grade, submit and view their own evidence with version history.

**Tasks**
- [ ] P2.01 Year list and grade/assignment list, including archived history read-only and independent enrollment policy.
- [ ] P2.02 Student Dashboard + My Work History with pagination/filtering and own-only data.
- [ ] P2.03 Camera/file-picker, HEIC capability/fallback, conversion/compression, image size preview and errors.
- [ ] P2.04 `begin/upload/complete/status` idempotent protocol and staged private Drive storage; server MIME and size validation.
- [ ] P2.05 Immutable `SubmissionVersions`, correct latest pointer, receipt, retry and reconciliation task for orphans.
- [ ] P2.06 Secure evidence preview (opaque ref, server owner check, bounded image bytes), no Drive public URLs.
- [ ] P2.07 Test actual iPhone Safari and Android phone on slow/mobile network with account switching.

**Deliverables:** students can photograph/submit to a published open assignment, retry and open only their own history.  
**EXIT GATE P2:** device test + IDOR + missing file/partial upload tests passed; upload limit chosen based on measurements.

## Phase 3 — Teacher Workspace
**Objective:** reliable roster-based oversight, evidence review **and teacher-controlled Task/Rubric grading** (per v2 tasks P3.08–P3.09).

**Tasks**
- [ ] P3.01 Teacher Overview: year/grade/room filters, submission counts, status breakdown, out-of-roster count.
- [ ] P3.02 Submission Matrix: numeric `roll_no` ascending, left join roster, derived missing; responsive sticky table.
- [ ] P3.03 Teacher secure student evidence detail with history, version-aware evidence review and change log.
- [ ] P3.04 Teacher Student/Roster Manager: add/import/edit/disable, secret reset, duplicate check; role guard.
- [ ] P3.05 Assignment Manager: template snapshot, open/close, required metadata; audited edits.
- [ ] P3.06 Out-of-roster Inbox: detect by lookup, review, documented correction/soft-delete; **no** counting flagged submissions as other roster students.
- [ ] P3.07 Audit & Trash view, restore action, `revision` stale-write rejection.

**Deliverables:** teacher matrix and private evidence review with realistic synthetic rosters; audited admin actions.  
**EXIT GATE P3:** correct counts/sort/filters, negative teacher role forgery and correction tests.

## Phase 4 — Individual and Group Portfolios
**Objective:** append-versioned project UI sketches, prompts, tests and URL history.

**Tasks**
- [ ] P4.01 Individual Projects 0..N and artifact schema/history; enforce ownership per RPC.
- [ ] P4.02 Prompt versions as plain text (escaped render), UI sketch images, input/output test result entries.
- [ ] P4.03 Validate HTTPS GitHub Pages link / custom domain policy; no iframe embed; no medical claims from platform.
- [ ] P4.04 Teacher group manager and `Groups/GroupMembers` membership; one group project per group/round/year/grade.
- [ ] P4.05 Group add artifact version with authenticated author UID and timeline; active membership check for every read/write.
- [ ] P4.06 Remove-member/rejoin/outsider intrusion tests; old authorship attribution preserved.

**Deliverables:** portfolios with version histories and strict ownership/group rights.  
**EXIT GATE P4:** A cannot see B project or unrelated group; group max-one invariant demonstrated; individual extra project allowed.

## Phase 5 — Year Reuse, Hardening, Backup & Production Acceptance
**Objective:** reusable year launch and operations-ready deployment.

**Tasks**
- [ ] P5.01 Year Manager: draft preview, create BE year idempotently, exactly 2 grade workspaces, clone templates into draft Assignments.
- [ ] P5.02 Resume interrupted clone/retry duplicate click, edit draft, publish, archive safely.
- [ ] P5.03 Cross-year and cross-grade submissions through all student screens, out-of-roster Inbox and stats reconciliation.
- [ ] P5.04 Backup retention policy, scheduled backups, restore drill to isolated environment, record results.
- [ ] P5.05 Monitoring: missing Drive objects, orphan staging, quotas, duplicate writes, unauthorized Drive public permissions.
- [ ] P5.06 Real mobile slow-net test, WCAG basics, session expiry, XSS/CSV injection, IDOR matrix, concurrency load.
- [ ] P5.07 Rollout checklist: owner training, student onboarding, secrets rotation, teacher reset procedure, launch/recovery playbook.

**Deliverables:** Year Engine, operational runbook, acceptance evidence, production release only after P1–P5 gates.

## 6. Suggested directory tree (for future code)
```text
PhysicsHealthTech/
  README.md
  PLAN.md  IMPLEMENTATION_PLAN.md  PROGRESS.md
  ARCHITECTURE.md  DATA_SCHEMA.md  SECURITY_MODEL.md
  SCREEN_SPECIFICATIONS.md  USER_FLOWS.md  API_CONTRACT.md
  TEST_PLAN.md  DECISIONS.md
  appsscript.json
  server/  client/  tests/  scripts/
```
**Only Markdown planning artifacts exist in this delivery**; all implementation directories and manifests above are proposals.

## 7. Coding Agent handoff instructions
1. First read **all** Markdown spec files and summarize conflicts/decisions before writing code.
2. Implement exactly one phase per task; don't run ahead of exit gate.
3. Never replace secure auth with 5-digit-only login, public Drive sharing, or a browser `isTeacher` flag.
4. Use test fixtures only, no real student personal data in code/logs.
5. After each milestone, update `PROGRESS.md` (checked tests, blockers, changed files, security implications).
6. Run negative security tests before declaring phase complete; if a policy is unverified, mark it blocked.
7. Do not modify teacher desktop core workflow merely to improve mobile; check desktop regression.

## 8. Definition of Done (per feature)
- Server-side actor and ownership checks + negative tests
- Input schema validation and stable error codes
- Idempotency for mutating operations
- Responsive loading/error/empty/success screens
- Audit for privileged changes
- Test evidence recorded, no secrets in code/repository
- `PROGRESS.md` updated honestly
