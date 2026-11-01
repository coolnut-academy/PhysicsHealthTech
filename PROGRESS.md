# PROGRESS.md — Implementation Status Tracker

## PhysicsHealthTech V2.0 Greenfield Implementation Status
- **Overall Status:** GREENFIELD SOURCE CODE IMPLEMENTED & TESTED (READY FOR DEPLOYMENT)
- **Last Updated:** 2026-11-01
- **Platform Architecture:**
  - **Frontend:** HTML5, CSS3 (Precision Academic Workspace), Vanilla JavaScript at project root (`index.html`, `css/style.css`, `js/config.js`, `js/api.js`, `js/mock-backend.js`, `js/app.js`) designed for GitHub Pages (`main` branch).
  - **Backend:** Google Apps Script in dedicated `backend/` directory (`Entry.gs`, `Config.gs`, `GradingEngine.gs`, `SyllabusService.gs`, `AuthService.gs`, `Authorization.gs`, `StudentService.gs`, `TeacherService.gs`, `SubmissionService.gs`, `EvidenceService.gs`, `ProjectService.gs`, `AcademicYearService.gs`, `SheetRepository.gs`, `SchemaMigrator.gs`, `appsscript.json`).
  - **Database:** Google Sheets (`1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0`).
  - **File Storage:** Private Google Drive Root (`1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs`).

---

## Automated Test Execution Summary (Node.js Test Runner)
| Test Suite | Result | Test Cases Verified | Evidence |
|---|:---:|---|---|
| GradingEngine Unit Tests | **PASS** | GR03, GR04, GR05, GR06, GR07, GR08, GR09, GR16, GR17, GR19, GR20, GR21, GR22, GR29, GR30 | `node tests/unit/grading-engine.test.js` |
| SyllabusService Unit Tests | **PASS** | GR01, GR02, GR03, GR09, GR26, GR28 | `node tests/unit/syllabus-validator.test.js` |
| AuthService & Security Unit Tests | **PASS** | AC02, SEC01, SEC02, SEC03, SEC10 | `node tests/unit/auth-security.test.js` |
| Sanitization & Formatting Unit Tests | **PASS** | SEC06, SEC07, SEC12, DATA01, DATA02, GR27 | `node tests/unit/sanitization.test.js` |
| IDOR & Security Negative Tests | **PASS** | AC01, AC09, GR10, GR11, SEC04, SEC05 | `node tests/security/idor-negative.test.js` |
| Student Dashboard Integration Tests | **PASS** | GR12, GR13, GR14, GR15, GR18 | `node tests/integration/student-dashboard.test.js` |
| Teacher Gradebook Integration Tests | **PASS** | AC03, AC04, GR07, GR08, GR23, GR24, GR25, GR27, GR31, GR32 | `node tests/integration/teacher-gradebook.test.js` |
| **All Test Suites Combined** | **7/7 PASS** | **All 45+ Acceptance, Grading, Security, and Data Cases** | `npm test` exit code 0 |

---

## Phase Milestones Completed
- [x] **Phase 0:** Technical feasibility, security model, syllabus validator, and automated test harness with synthetic fixtures.
- [x] **Phase 1 (Security & Foundation):**
  - Robust authentication with 5-digit code text (preserving leading zeros e.g. `00007`) + independent high-entropy secret.
  - HMAC-SHA256 verifier with server pepper and per-student salt.
  - Durable rate limiting (lockout cooldown after 5 failed attempts).
  - Secure opaque bearer token sessions with SHA-256 digest storage and revocation check on every RPC.
  - Server-enforced role checking; client-supplied role claims rejected with `ACCESS_DENIED`.
  - Database schema definition with 28 normalized tabs in `SchemaMigrator.gs`.
- [x] **Phase 2 (Student Portal & Upload):**
  - Single-page application responsive layout (mobile-first for students).
  - Student Dashboard displaying own profile, earned reviewed points, reviewed max points, provisional course accumulation /100, and pending tasks count.
  - 9 published worksheet cards with single main status (`ยังไม่ส่ง`, `ส่งแล้ว — รอตรวจ`, `ตรวจแล้ว`, `ส่งกลับให้แก้ไข`) and independent `เกินกำหนด` badge.
  - Pending tasks display `รอตรวจ` with null points, never 0.
  - Multi-image upload picker with client-side canvas compression (files < 2 MiB) and image previews with remove button.
  - Idempotent upload lifecycle (`begin -> uploadEvidence -> complete`) with append-only immutable `SubmissionVersions`.
  - Secure preview behind backend authorization (no public Drive links).
- [x] **Phase 3 (Teacher Workspace & Grading):**
  - Teacher Overview with academic year, grade (M.4/M.5), and room filters.
  - Submission & Grading Matrix sorted numerically by `roll_no` ascending (1, 2, 10, 11).
  - Teacher Task & Rubric grading modal supporting Draft save (hidden from student) and Publish (immediately visible to student).
  - Regrading requires an explicit reason and creates immutable audit record in `GradeRevisions`.
  - Revision request workflow (`teacher.requestRevision`) changing worksheet status to `ส่งกลับให้แก้ไข`.
  - Voluntary coloring bonus workflow (`teacher.awardBonus`) capped at 100 max course points.
  - Separate out-of-roster inbox without inflating official enrollment statistics.
  - Safe CSV gradebook export escaping spreadsheet formula injection (`=`, `+`, `-`, `@`).
- [x] **Phase 4 (Portfolios & Groups):**
  - Individual projects (0..N permitted per student) with versioned artifacts.
  - Group projects (1 per group per round) with active membership verification.
  - Mixed task scoring with group shared component and member individual presentation component.
  - Membership snapshot freezing for historical score audit.
  - HTTPS GitHub Pages URL validation.
- [x] **Phase 5 (Year Reuse & Operations):**
  - Idempotent year creation initializing M4 and M5 grade workspaces and cloning 9 draft worksheets per grade without touching prior years.
  - Clasp and deployment runbook prepared for Google Apps Script Web App.
  - Interactive Demo Mode and Live GAS Web App URL configuration in browser settings modal.

---

## External Verification & Deployment Guide
1. **Google Apps Script Backend Deployment:**
   - Script directory: `backend/`
   - Open [Google Apps Script](https://script.google.com/) and create a new project.
   - Copy the files in `backend/` (or use `npx @google/clasp push`).
   - Run `SchemaMigrator.runMigration('1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0')` once from the Apps Script editor to create/verify all tabs and headers in the Google Sheet.
   - Click **Deploy > New deployment > Web App**.
   - Execute as: **Me (User deploying)**.
   - Who has access: **Anyone**.
   - Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`).
2. **GitHub Pages Deployment:**
   - Commit and push repository to GitHub on `main` branch.
   - In GitHub Repository Settings > **Pages**, set Source to `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.
   - Open the published GitHub Pages URL in browser.
   - Click **⚙️ ตั้งค่า (Settings)** in the top right header, paste the Web App URL, and save!

