# PhysicsHealthTech — Web Application Architecture Blueprint

## v2.0 Scope Upgrade
**Latest requirements:** `03_DASHBOARD_GRADING_REQUIREMENTS.md` governs Dashboard/teacher grading and supersedes legacy no-score statements. v2 new specs: `SYLLABUS_IMPORT_SPEC.md`, `GRADING_ENGINE.md`, `GRADING_DATA_SCHEMA.md`, `DASHBOARD_METRICS.md`, `GRADING_API_CONTRACT.md`, `GRADING_TEST_CASES.md`, `MIGRATION_GUIDE_V2.md`, `GEMINI_UPDATE_PROMPT.md`, `CHANGELOG.md`. There is no live application/source code or approved real Course Syllabus in this ZIP. See updated `START_HERE.md` and `00_GEMINI_MASTER_PROMPT.md`.

**Version:** 1.0 (planning baseline)  
**Date:** 1 November 2026 / 1 พฤศจิกายน 2569  
**Status:** Architecture designed; NOT implemented, deployed, security-certified or tested.

## Purpose and scope
เว็บแอปสำหรับบันทึกหลักฐานใบงานที่ครูตรวจบนกระดาษแล้ว เก็บ Portfolio โครงงานเดี่ยวและกลุ่มของนักเรียน ม.4–ม.5 ต่อเนื่องหลายปีการศึกษา บัญชีประมาณ 80 คนในระยะแรก ด้วย HTML/CSS/JavaScript + Google Apps Script HTML Service + Google Sheets + private Google Drive. GitHub Pages เป็นปลายทางเว็บผลงานนักเรียนเท่านั้น ไม่ใช่โฮสต์พอร์ทัลที่เข้าถึงข้อมูลส่วนตัว

ระบบ **ไม่ใช่** เครื่องมือตรวจฟิสิกส์อัตโนมัติ และการส่งออนไลน์ไม่ได้ยืนยันความถูกต้องเชิงวิชาการ

## Primary reference
- `02_WEBAPP_CONTEXT.md` (user's Brief B v1.0, 1 Nov 2026) — **source of truth** สำหรับ Product, Business Rules, Security และ Phases
- `01_WORKSHEETS_CONTEXT.md` (Brief A) — สำหรับ cross-project metadata/ชนิดหลักฐานเท่านั้น ไม่จัดทำใบงานใน repository นี้
- Technical docs: [Apps Script Web apps](https://developers.google.com/apps-script/guides/web), [HTML-service RPC](https://developers.google.com/apps-script/guides/html/communication), [Quotas](https://developers.google.com/apps-script/guides/services/quotas), [Session](https://developers.google.com/apps-script/reference/base/session), [LockService](https://developers.google.com/apps-script/reference/lock/lock-service), [ContentService](https://developers.google.com/apps-script/reference/content), [Google ID token validation](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## This edition: Gemini Implementation Kit (not source code)
This ZIP contains the original technical blueprint **plus** `GEMINI.md`, `START_HERE.md`, `00_GEMINI_MASTER_PROMPT.md`, `GEMINI_PHASE_PROMPTS.md`, security feasibility experiments, design tokens, deployment/ops runbooks, source structure and traceability. All source context is included (`02_WEBAPP_CONTEXT.md` and optional teaching metadata `01_WORKSHEETS_CONTEXT.md`). The package is **not** an already deployed web application. Begin with `START_HERE.md`; paste the master prompt only after the files are placed in the Gemini-accessible project workspace.

## Reading order for Coding Agent
1. `PLAN.md` — product boundaries, business rules, MVP, decisions
2. `ARCHITECTURE.md` — runtime/deployment, integrations, fault recovery
3. `SECURITY_MODEL.md` — auth, authorization, privacy, threat model
4. `DATA_SCHEMA.md` — relational semantics mapped to one Sheet workbook
5. `USER_FLOWS.md` and `SCREEN_SPECIFICATIONS.md` — UX journeys and screen contracts
6. `API_CONTRACT.md` — server RPC contract and validation rules
7. `IMPLEMENTATION_PLAN.md` — gated work items and acceptance conditions
8. `TEST_PLAN.md` — security, data integrity, mobile and performance testing
9. `PROGRESS.md` — actual completed vs outstanding, no invented completion
10. `DECISIONS.md` — unresolved owner decisions and rationale

## Non-negotiable invariants
- Every student read/write/file-preview RPC must resolve the actor **from verified server-side session**, never from a browser-supplied UID.
- A stable `student_uid` is the identity key; `code_5_digit` is TEXT (including leading zeros) and **not a password**.
- `Enrollments` is **roster/statistics**, not submission eligibility. Authenticated accounts can submit to any published/open assignment, including other years/grades; flag out-of-roster separately.
- Submissions and artifacts are append-versioned; old versions remain accessible subject to archival and authorization rules.
- Student private Drive files are never shared publicly. File access is mediated by the backend after checking ownership/group membership and deletion state.
- A new year clones metadata/templates idempotently into the same spreadsheet; never replaces or deletes old academic years.
- Don't implement teacher role elevation using `Session.getActiveUser().getEmail()` in a deployment mode where identity is not reliable.
- No real student data / real private files in fixtures, git history, logs or public GitHub Pages.

## Recommended development workflow
- Implement from mocks and synthetic students first. Use `clasp` or disciplined Apps Script project sync; keep repository secrets out of Git; deploy dev and prod separately.
- Finish P1 authentication and IDOR proof-of-denial before any real student uploads.
- Validate browser behavior of Google sign-in in Apps Script's iframe environment using actual school accounts **before** choosing teacher sign-in implementation.
- Track each acceptance scenario in `TEST_PLAN.md`, and update `PROGRESS.md` with actual passing evidence; do not mark a task done just because source code exists.

## Delivery status
These are **planning artifacts**, not an executable website. Decisions that must be resolved before implementation are recorded in `DECISIONS.md`.
