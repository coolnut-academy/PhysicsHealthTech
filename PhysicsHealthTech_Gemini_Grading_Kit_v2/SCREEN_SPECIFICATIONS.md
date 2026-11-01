# SCREEN_SPECIFICATIONS.md — Thai-first UI/UX contract

## v2.0 Student Dashboard & Teacher Grading UI — replaces status-only examples
**MUST update v1 screen tables/wireframes below:** v1 `8/12` and v1 `This is a status matrix, not a grading matrix` were conceptual evidence-only examples, **obsolete for v2**. Final must show exactly 9 published worksheets/grade; professional mobile dashboard with own profile, `คะแนนจากงานที่ตรวจแล้ว X/Y`, `คะแนนสะสมรวมโบนัส Z/100 (ยังไม่ใช่ผลสุดท้าย)` and counts `ส่งแล้ว/ตรวจแล้ว/ยังไม่ส่ง/ต้องแก้ไข`; worksheet cards show Task maxima and published scores or **รอตรวจ**. Teacher matrix is now both submission **and score** matrix, with numeric roll order, Task/Rubric grading, feedback, grade revision history and student-by-student totals. See `DASHBOARD_METRICS.md`. Student status text: `ยังไม่ส่ง`/`ส่งแล้ว — รอตรวจ`/`ตรวจแล้ว`/`ส่งกลับให้แก้ไข`; extra `เกินกำหนด` badge.

**New screens:** `S10` My Scores & Task Details, `T12` Task/Rubric Grading, `T13` Score Revision History, `T14` Gradebook Export, `T15` Syllabus Import & 100-point Validation. Preserve teacher desktop UI; do not compromise student mobile UX.

**UI philosophy:** Precision Academic Workspace: restrained, modern, accessible, mobile-first students; information-dense desktop teacher workspace. No unnecessary feature overload.

## 1. Visual system
- Typography: Thai legibility first (e.g. Sarabun or Noto Sans Thai; review loading constraints, system fallback), body >=16px on mobile, 14–16px for desktop dense tables; clear font weights.
- Palette: neutral light background with deep navy ink and limited blue accent. Accessible status color + **text/shape** (not color alone), AA contrast, clear keyboard focus.
- Spacing: 4/8/12/16/24px scale. Card borders subtle; mobile tap targets ~44px minimum; skeletons/success states not just spinners.
- Navigation: mobile student bottom tabs `หน้าหลัก`, `งานของฉัน`, `โครงงาน`, `บัญชี`; teacher desktop sidebar with persistently visible year/grade/room filters. Smaller teacher screens receive responsive table-to-card fallback.
- All destructive actions require purpose-specific confirmation and offer undo where feasible.
- **Do not conflate** `ยืนยันหลักฐานแล้ว` with `ตรวจเนื้อหาฟิสิกส์ถูกต้อง`.

## 2. Student screens
| ID | Screen | Key components | Main action & states |
|---|---|---|---|
| S01 | Student Login | App identity, 5-digit code, separate secret, show/hide, help/reset instructions | Sign in; invalid generic message; cooldown; inaccessible account |
| S02 | Dashboard | Welcome first name, current year, my progress, quick submit, recent own work | Open year / continue upload; pending/empty/history |
| S03 | Academic Year Selector | Available years as cards, archival read-only indicators | Select year; no information about classmates |
| S04 | Grade & Assignment List | M4/M5 switch, category filters, open/closed badges, own state, due date | Open assignment; all published/open eligible irrespective of roster |
| S05 | Assignment Detail & Upload | Title, instructions metadata, paper-confirmed reminder, camera/file picker, previews, size meter, submit button | Client compression, upload, retry, version receipt, closed read-only |
| S06 | My Work History | Year/grade/type filters, chronological versions, image preview | Read own evidence only; empty/expired/removed file states |
| S07 | Individual Projects | Multiple project cards, sketch photos, Prompt version text, test cases, GitHub Pages link | Add project; add artifact; view version history |
| S08 | Group Project | Group title, members, artifact timeline, shared Prompt/test/link, who edited when | Edit only while member; one group project per round |
| S09 | Account & Help | Code (masked where needed), signout, reset path, basic privacy explanation | Log out, teacher-assisted secret reset |

## 3. Student mobile wireframe (conceptual)
```text
┌──────────────────────────────┐
│ PhysicsHealthTech     [บัญชี]│
│ สวัสดี, นักเรียน             │
│ ปีการศึกษา [2570 ▾]          │
├──────────────────────────────┤
│ [ ม.4 ] [ ม.5 ]              │
│ งานของฉัน  ส่งแล้ว 8/9 (v2 illustrative)      │
│ ┌──────────────────────────┐ │
│ │ ใบงาน: ทดลองและบันทึก     │ │
│ │ ยังไม่ส่ง       [เปิดงาน] │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Prompt Design Guide      │ │
│ │ ส่งแล้ว v2      [ดูงาน]  │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ หน้าหลัก  งานฉัน  โครงงาน  บัญชี│
└──────────────────────────────┘
```
The user should reach camera capture in approx. year → grade → assignment → `ถ่ายภาพ/เลือกภาพ`, with current year and last grade remembered as UX preference (not security).

## 4. Teacher screens
| ID | Screen | Key components | Actions |
|---|---|---|---|
| T01 | Verified Teacher Login | Google identity sign-in / tested workspace path | Require server validated role |
| T02 | Overview | Year/grade/room selectors, completion metrics, out-of-roster count, latest activity | Jump to matrix, upload failures, audit |
| T03 | Submission Matrix | Sticky student identity/roll column, assignment columns, status chips, filters, search, pagination | Open student detail; sort numeric roll_no; export later |
| T04 | Student Detail & Evidence | Current status, version timeline, secure previews, review action | Confirm evidence, needs revision, audited correction |
| T05 | Assignment Manager | Clone templates, edit titles/metadata/order, open/close, deadlines | Draft editing, publish, reopen; no retroactive template mutation |
| T06 | Academic Year Manager | Years list, create-year preview, M4/M5 cloned assignment count, draft/publish | One-click create with confirmation, retry-safe; previous years immutable |
| T07 | Student & Roster Manager | Students, enrollments by year/grade/room, numeric roll_no, credential reset | Import/add/edit/disable; no raw secret display after provisioning |
| T08 | Out-of-roster Inbox | Grouped by year/grade/assignment, reason label, audit diff | Review, map/correct, soft-delete; no automatic numerator inflation |
| T09 | Group Manager | Groups and members, active round, one project per group round | Membership control, conflict validation |
| T10 | Audit & Trash | Immutable actions, filters, delete reasons, recoverable object list | Restore and audit; purges only policy-authorized |
| T11 | Operational Health | File reconciliation, quota signals, backup dates, failed operations | Reconcile with safe dry-run and report |

## 5. Teacher desktop matrix wireframe (conceptual)
```text
PhysicsHealthTech | Teacher Workspace
[ปี 2570 ▾] [ม.4 ▾] [ห้อง 1 ▾] [ใบงานทุกชิ้น ▾]
ส่งครบ 38 / 40    ต้องแก้ไข 2     นอกบัญชีรายชื่อ 3
┌────┬─────────────────┬─────────┬─────────┬─────────┐
│เลขที่│ ชื่อ-สกุล       │ ใบงาน 01│ ใบงาน 02│ ใบงาน 03│
├────┼─────────────────┼─────────┼─────────┼─────────┤
│  1 │ นักเรียน ก       │ ตรวจแล้ว │ รอตรวจ   │ ยังไม่ส่ง│
│  2 │ นักเรียน ข       │ แก้ไข    │ ตรวจแล้ว │ ส่งแล้ว  │
└────┴─────────────────┴─────────┴─────────┴─────────┘
[ดูรายการส่งนอกบัญชีรายชื่อ (3)] [Audit/Trash]
```
LEGACY v1 EXAMPLE ONLY: replace this with the v2 submission + grading matrix; see v2 heading and `DASHBOARD_METRICS.md`. Provide text alternatives to colors (`ส่งแล้ว`, `ต้องแก้ไข`, `ยืนยันหลักฐานแล้ว`, `ยังไม่ส่ง`).

## 6. Upload interactions and edge cases
- Show 1–3 image previews (provisional policy), number/size before submit, option to remove/reorder, preserve previous versions.
- Use `accept=image/jpeg,image/png,image/heic,image/heif` for picker only if browser support tested; do **not** imply HEIC is supported simply because a file can be selected. Attempt conversion with supported Canvas APIs; on failure show actionable JPEG path.
- Show staged progress: `เตรียมไฟล์ → กำลังส่ง → กำลังบันทึก → ส่งสำเร็จ`. Without an actual transfer-progress API, don't claim numeric percent complete.
- If session expires mid-process: don't drop local preview while current page remains loaded; request login and retry idempotently.
- Error categories: `SESSION_EXPIRED`, `ACCESS_DENIED`, `ASSIGNMENT_CLOSED`, `FILE_TOO_LARGE`, `UNSUPPORTED_IMAGE`, `UPLOAD_RETRYABLE`, `UPLOAD_RECONCILE_REQUIRED`, `RATE_LIMITED`, `SERVER_BUSY`. User copy uses simple Thai; server hides internals.

## 7. Responsive QA contract
- Test 360, 390, 430, 768, 1024, 1440 CSS px; portrait/landscape; zoom 200%; iOS Safari + Android Chrome + desktop Chrome/Firefox.
- Screen reader and keyboard navigate to upload and review buttons; no color-only status; matrix sticky columns do not conceal focus controls.
- Desktop teacher workspace remains information-dense; responsive modifications must not remove any field or permission validation.
- Add global empty/loading/error/denied states for every screen, not generic blank pages.
