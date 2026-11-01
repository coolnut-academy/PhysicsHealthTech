# PLAN.md — Product, scope and design principles

## v2.0 Product Change (authoritative over v1 grade exclusion)
- เพิ่ม Student Dashboard / Teacher Gradebook ตาม `03_DASHBOARD_GRADING_REQUIREMENTS.md`, `GRADING_ENGINE.md` และ `DASHBOARD_METRICS.md`.
- ม.4 และ ม.5 ระดับละ **9 ใบงาน**, เรียน **20 ครั้ง ×100 นาที**, คะแนนหลักสูตรระดับละ **100 คะแนน**, คะแนนราย Task ต้องมาจาก Syllabus จริงและไม่ซ้ำเมื่อผูกหลายใบงาน.
- ครูเป็นผู้ตรวจ/ให้คะแนน/เผยแพร่คะแนนทั้งหมด; นักเรียนเห็นเฉพาะคะแนนของตนเอง, งานรอตรวจแสดง null ไม่ใช่ 0, โบนัสระบายสีเป็นสมัครใจและรวมสุทธิไม่เกิน 100.
- งานกลุ่มแยกคะแนน shared/individual มี history และ snapshot รายชื่อสมาชิก; โครงงานเดี่ยวไม่ต้องนำเสนอหน้าชั้น.
- **ห้ามปล่อย Scorebook จริงจนกว่าครูอนุมัติ Syllabus ล่าสุด**; ไฟล์นี้ยังไม่มีน้ำหนักคะแนนจริง.

**Status:** baseline v1.0 · 1 Nov 2026

## 1. Product statement
PhysicsHealthTech เป็นแฟ้มสะสมหลักฐานดิจิทัลของนักเรียน ม.4 และ ม.5 แยกปีการศึกษา พ.ศ. อย่างชัดเจน ใช้งานซ้ำได้โดยไม่สูญเสียข้อมูลเก่า เน้นการถ่ายหลักฐานจากกระดาษที่ครูตรวจแล้ว การเก็บ UI sketches / Prompt / การทดสอบ / GitHub Pages URLs **และระบบคะแนนที่ครูตรวจ/ให้คะแนนตาม Syllabus** (ห้ามตรวจฟิสิกส์หรือให้คะแนนอัตโนมัติ).

## 2. Personas
- **Student:** บัญชีครูสร้างไว้ล่วงหน้า, เข้าระบบจากมือถือ, ดูและส่งงานของตน/กลุ่มตน, ดูสถิติรวมไม่ระบุชื่อเฉพาะที่ครูเปิด
- **Teacher/Admin:** เห็นทุกปี/ระดับ/ห้อง/ใบงาน รวมถึงงานนอกบัญชีรายชื่อ; จัดการปี งาน เทมเพลต กลุ่ม รายชื่อ หลักฐานและ audit; มีสิทธิ์เชิงผู้ดูแลตาม policy
- **Disabled or archived students:** ล็อกอิน/ส่งงานไม่ได้ตามสถานะบัญชี (ครูยังเข้าถึงหลักฐานตาม retention)

## 3. Product rules (must implement)
1. Student account = stable `student_uid`; `code_5_digit` TEXT, unique among active accounts; credentials must be separate.
2. No student can list, open, download, edit, delete another student's private evidence except authorized membership in **their own** group project.
3. `Enrollments` is the roster for reporting missing assignments. **Do not** use enrollment as a condition to submit to an open assignment in another grade/year.
4. Every submission has an `out_of_roster` snapshot on version creation, **recomputed at each relevant roster change or teacher reconciliation**, plus `roster_review_state`; out-of-roster excluded from roster completion numerator until mapped/confirmed according to explicit policy. Confirmation alone must not falsely turn a non-enrolled student into a roster member.
5. Each Assignment exists in exactly one `academic_year_id` + grade and is controlled by `draft | open | closed | archived` state. Year state also gates new submissions. Historical reads permitted.
6. Submission status is `submitted | evidence_confirmed | needs_revision`; initial item in student matrix may be `not_submitted` as a **derived status**, not a persisted Submission row. Evidence confirmation is not physics correctness approval.
7. Every resubmission appends a `SubmissionVersion`; no destructive overwrite. View history allowed after closing; edit after close only via controlled teacher reopen.
8. Individual projects: 0..N initially / desired outcome at least 1 per learner; never hard-block extra projects. Group: max 1 project per **group per academic-year/grade/round**; authenticated group members may contribute under authorized membership.
9. New year button performs idempotent cloning of both grades' assignment templates into **same** spreadsheet, starts in `draft`, allows teacher preview/edit/publish, retains prior years unchanged.
10. All deletes are soft-delete with undo/restore and an audit record. Data purge requires separately approved retention policy.
11. Public aggregate stats: never include names/identifiers/links, and apply a minimum-cell threshold to avoid revealing individual activity in small cohorts.
12. Never publish real names, student identifiers, private evidence, health records or unauthorized school assets in student GitHub Pages.

## 4. MVP scope (prioritize security)
**MVP:** secure login, teacher-managed students and rosters, year/grade assignment browsing, upload of compressed JPEG/PNG evidence, versioned history, teacher submission matrix, evidence review, out-of-roster tray, year generation, audit/restore, basic portfolios. Roll out group collaboration only after membership enforcement passes.

**Later:** bulk CSV import UX, advanced previews, per-file thumbnails/cache, export reports, sophisticated offline-resume uploads, analytics.

**Out of scope:** auto-marking physics questions; medical diagnosis; chat/social feed; public portfolio directory; granular online grades; unrelated school systems or SSO integrations.

## 5. Quality attributes
- **Confidentiality first**: deny by default, permission tested in server only, evidence accessible only to owner/group teacher
- **Data durability**: immutable versions + reconcile missing files + backups + restore drills
- **Usability**: ≤ few taps from assignment to camera, visible upload failure and retry, Thai-first, accessibility
- **Reliability**: idempotent create/upload/version, operations recover from partial write, no global lock during network/file transfer
- **Maintainability**: modular Apps Script services and spreadsheet schemas, no hard-coded academic year in logic, tracked migrations
- **Observability**: structured error IDs, audit records, admin reconciliation dashboard, no secrets/PII in verbose logs

## 6. Defaults needing owner confirmation
- Default image max 2 MiB/image **after client conversion**, 3 images per submission version, JPEG/PNG only in MVP; browser HEIC handling tested/fallback, no assurance of universal decoding.
- Default session: inactivity 30 minutes, absolute 8 hours for student; shorter absolute session for teacher (configurable). Don't keep long-lived token in localStorage.
- Teacher Google identity: **proof-of-concept gate** prior to implementation; recommended verified Google OIDC (ID token) with allowlisted teacher identifiers and strict server validation; separate teacher deployment if iframe incompatibility persists.
- Student login: 5-digit code + high-entropy, teacher-issued **independent** secret (recommended 12+ random characters); optional numeric PIN is a **less secure alternative**, requiring stricter throttling and explicit risk acceptance.
- Drive/Sheets/Apps Script ownership: school-controlled account and backup operator, not personal account by default.

## 7. Success criteria
All ten acceptance cases from Brief B plus recovery from partial uploads, unauthorized RPC invocation, double clicks, cross-year submissions and closed-year access must pass on real phone + multiple student sessions before production.
