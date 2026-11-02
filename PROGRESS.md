# PROGRESS.md — Implementation Status Tracker

## PhysicsHealthTech V2.0 Greenfield Implementation Status
- **Overall Status:** GREENFIELD SOURCE CODE IMPLEMENTED & TESTED (READY FOR DEPLOYMENT)
- **Last Updated:** 2026-11-02
- **Platform Architecture:**
  - **Frontend:** HTML5, CSS3 (Precision Academic Workspace), Vanilla JavaScript at project root (`index.html`, `css/style.css`, `js/config.js`, `js/api.js`, `js/mock-backend.js`, `js/app.js`) designed for GitHub Pages (`main` branch).
  - **Backend:** Google Apps Script in dedicated `backend/` directory (`Entry.gs`, `Config.gs`, `GradingEngine.gs`, `SyllabusService.gs`, `SessionService.gs`, `AuthService.gs`, `Authorization.gs`, `StudentService.gs`, `TeacherService.gs`, `SubmissionService.gs`, `EvidenceService.gs`, `ProjectService.gs`, `AcademicYearService.gs`, `SheetRepository.gs`, `SchemaMigrator.gs`, `appsscript.json`).
  - **Database:** Google Sheets (`1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0`).
  - **File Storage:** Private Google Drive Root (`1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs`) with organized `ProfilePhotos` subfolder.

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
| Lifecycle & Grade Isolation Tests | **PASS** | Multi-Year Lifecycle, Grade Isolation & Roster Promotion | `node tests/test-lifecycle-and-isolation.js` |
| Revision & Immutability Tests | **PASS** | Revision, Anti-Sabotage Immutability & Multi-Version History | `node tests/test-revision-immutability.js` |
| Course Sessions & Snapshot Tests | **PASS** | 20 Course Sessions Schedule & Academic Year Snapshot Isolation | `node tests/integration/sessions-snapshot.test.js` |
| Student Profile Photo & Drive Storage | **PASS** | Profile Photo Upload, Edit Pencil, Google Drive Storage & ID Linking | `node tests/integration/student-profile-photo.test.js` |
| UI & Performance Improvements | **PASS** | Mobile Responsive, Easy Upload, A4 Compression, Lucide Icons | `node tests/test-ui-improvements.js` |
| **All Test Suites Combined** | **12/12 PASS** | **All 50+ Acceptance, Grading, Security, Lifecycle, Profile Photo & Drive Storage Cases** | `npm test` exit code 0 |

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
- [x] **Phase 6 (Course Sessions Plan & Academic Year Snapshot):**
  - Tabbed navigation on Student Portal: 'ใบงานปฏิบัติการ (1 - 9)' and 'ตารางแผนการเรียน (ครั้งที่ 1 - 20)'.
  - Student session view displays session number, title, description/activities, and direct jump link to associated worksheets.
  - Dedicated Teacher Console tab: 'จัดการแผนการเรียนรู้รายครั้ง (20 ครั้ง) — Snapshot รายปี'.
  - Teachers can edit all 20 sessions per year and grade, load recommended course defaults, and save snapshots.
  - Full Snapshot Isolation per academic year: year 2569 and year 2570 have independent curriculum snapshots; edits to one year never affect another.
  - Backend table 'SessionSnapshots' with schema migration, GAS repository integration, and offline local storage fallback.
- [x] **Phase 7 (Student Profile Photo & Google Drive Integration):**
  - Profile photo display as an integral part of the Student Dashboard banner and top navigation header.
  - Floating edit pencil button (`pencil` Lucide icon) on the avatar circle allowing easy photo change on both mobile and desktop.
  - Full client-side automatic center-cropping to square and compression to JPEG 85% (~50-150 KB) for instantaneous uploads.
  - Dedicated preview & upload modal with real-time image preview, file info, Drive connection status, and progress indicator.
  - Real Google Drive upload: stores file in `ProfilePhotos` subfolder in Drive Root (`1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs`), sets public view sharing, and trashes previous photo file when replaced.
  - Persistent database linkage: ties `photo_drive_file_id` and `photo_url` directly to `student_uid` and `code_5_digit` in Google Sheets `Students` table.
  - Server-side authorization check (Anti-IDOR): students can only update their own photo; unauthorized or non-image MIME types are strictly rejected.
  - Teacher workspace integration: teacher matrix rows include student photo thumbnail.
  - Profile photo removal workflow with Drive cleanup.
  - Offline / Mock backend support with `localStorage` persistence.

---

## External Verification & Deployment Guide
1. **Google Apps Script Backend Deployment:**
   - Script directory: `backend/`
   - Open [Google Apps Script](https://script.google.com/) and create a new project.
   - Copy the files in `backend/` (or use `npx @google/clasp push` or copy `backend/Code.gs`).
   - Run `SchemaMigrator.runMigration('1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0')` once from the Apps Script editor to create/verify all tabs and headers (including `photo_drive_file_id` and `photo_url`) in the Google Sheet.
   - Click **Deploy > New deployment > Web App**.
   - Execute as: **Me (User deploying)**.
   - Who has access: **Anyone**.
   - Copy the generated Web App URL (`https://script.google.com/macros/s/.../exec`).
2. **GitHub Pages Deployment:**
   - Commit and push repository to GitHub on `main` branch.
   - In GitHub Repository Settings > **Pages**, set Source to `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.
   - Open the published GitHub Pages URL in browser.
