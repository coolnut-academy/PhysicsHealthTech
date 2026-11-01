# GEMINI_PHASE_PROMPTS.md — คำสั่งควบคุมงานทีละเฟส

## v2.0 Phase extension
**Before EVERY phase:** first load `03_DASHBOARD_GRADING_REQUIREMENTS.md` + new scoring docs. Add: P0.06 syllabus validator/dry-run; P1.09 grading tables and ledger; P2.08 own Dashboard with null-vs-zero; P3.08–09 teacher Task/Rubric publish and syllabus approval; P4.07 group shared+individual grades; P5.08–09 gradebook year reuse and 32 new tests. **Real syllabus score weights missing**: synthetic fixtures only and production publish blocked until teacher approval. Never do automated scoring.

ใช้เฉพาะเมื่ออยากตรวจเป็น checkpoint แทนการให้ agent เดินงานยาว ๆ. ก่อนทุก phase ให้อ่าน `GEMINI.md`, `PROGRESS.md` และ test/decisions ที่เกี่ยวข้อง

## P0 / Feasibility & Environment
> อ่านทุกสเปกและตรวจสภาพ repository. ทำ technical feasibility spikes ตาม `SECURITY_SPIKES.md`: Auth ครูใน deployment mode จริง, ความเป็นไปได้ของ strong student/session credentials, private image preview, upload iPhone HEIC, concurrency. ทำเป็น testable spike หรือ simulator ถ้ายังไม่มี Google access; อธิบายสิ่งที่ยืนยันแล้วกับสิ่งที่ยังไม่ยืนยัน. สร้าง repo skeleton, test harness, dev/prod config templates ที่ไม่มี secrets และอัปเดต `PROGRESS.md`. ห้ามอ้างว่าทดสอบ Google จริงถ้ายังไม่ได้เชื่อม.

## Phase 1 / Foundation + AuthN/AuthZ
> Implement P1.01–P1.08 ตาม `IMPLEMENTATION_PLAN.md` จนมี Apps Script RPC allowlist, schema migrator, modular auth/session, teacher identity POC, student credential scheme, permission checks, protected private-service helpers และ negative auth/security tests. ทุก secret อยู่ใน Script Properties; ห้ามใช้รหัส 5 หลักเดี่ยว. Test server-side role forgery และ A→B. ให้ evidence และอัปเดต `PROGRESS.md` เท่านั้นจึงปิด P1.

## Phase 2 / Student Portal + Upload
> Implement P2.01–P2.07 ให้ทำงานครบ year/grade/assignment, mobile capture/preview, upload staging/commit/retry/reconcile, own-only history, immutable versions, private evidence preview, Thai UX, HEIC fallback. รัน functional + security + simulated network tests และทดสอบ iPhone จริงเมื่อมี device. ระบุชัดเจนสิ่งที่ยัง blocked; ห้ามผ่าน P2 หากยังรั่วข้อมูลข้ามบัญชี.

## Phase 3 / Teacher Workspace
> Implement P3.01–P3.07: Teacher Overview, numeric roll-number matrix, filters, evidence review, roster/accounts, assignments, out-of-roster inbox, audit/soft-delete/restore. ตรวจจาก server ว่าทุก `teacher.*` ปฏิเสธ session นักเรียน. ทดสอบ denominator และข้ามปี/ข้ามชั้น. บันทึกผลจริงลง `PROGRESS.md`.

## Phase 4 / Portfolio
> Implement P4.01–P4.06: โครงงานเดี่ยวหลายชิ้น, group 1 ชิ้นต่อ group/round, group membership and permissions, immutable sketch/prompt/test/GitHub URL artifact versions and authorship. ทดสอบ A→B, outsider, removed member, XSS/unsafe URLs, more-than-one individual project.

## Phase 5 / Academic Years + Production Hardening
> Implement P5 ตามแผน: create-year idempotent draft cloning M4+M5, retry partial jobs, template revision, migration safety, backup/isolated restore, security audit, load and actual mobile tests, release gating. Run AC01–AC10, prepare deployment runbook and production checklists. ห้ามปล่อย production ถ้า owner approval/security proof ที่จำเป็นยังไม่มี.

## Resume work (สำหรับเปิดแชท Gemini ใหม่)
> นี่คือ repository PhysicsHealthTech. อ่าน `GEMINI.md`, `START_HERE.md`, `02_WEBAPP_CONTEXT.md`, `DECISIONS.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md` และ `TEST_PLAN.md`. ตรวจ source/tests จริงเทียบกับสถานะใน `PROGRESS.md`; ห้ามเชื่อข้อความ Done โดยไม่ตรวจหลักฐาน. ทำ task ที่ยังไม่เสร็จลำดับถัดไปให้สำเร็จพร้อม tests, อัปเดต changelog/progress และรายงาน blocker/next task.
