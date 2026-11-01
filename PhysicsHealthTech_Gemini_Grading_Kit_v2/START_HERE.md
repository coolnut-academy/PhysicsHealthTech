# START_HERE.md — ใช้ชุด ZIP นี้กับ Gemini อย่างไร

## v2.0 Critical Update — read before working
**This ZIP replaces the older evidence-only implementation kit.** User added **teacher-assigned scores, Student/Teacher Dashboards, nine worksheets per grade, 100 course points, optional bonus and group scoring**. Read `03_DASHBOARD_GRADING_REQUIREMENTS.md`, `GRADING_ENGINE.md`, `SYLLABUS_IMPORT_SPEC.md`, `GRADING_DATA_SCHEMA.md`, `DASHBOARD_METRICS.md`, `GRADING_API_CONTRACT.md`, `GRADING_TEST_CASES.md` **before coding**. Use `GEMINI_UPDATE_PROMPT.md` if your agent already began v1 implementation; otherwise `00_GEMINI_MASTER_PROMPT.md` updated for v2. Original `02_WEBAPP_CONTEXT.md` is intentionally retained unchanged as historical reference; grading clauses from v2 override its old grade exclusion. **No actual latest Course Syllabus has been provided: do not invent real Task weights.**


## สิ่งที่ ZIP นี้ประกอบด้วย
- **เอกสารบริบทต้นฉบับ**: `02_WEBAPP_CONTEXT.md` (ข้อกำหนดหลัก), `01_WORKSHEETS_CONTEXT.md` (เฉพาะ metadata หลักฐาน)
- **Blueprint**: `PLAN.md`, `ARCHITECTURE.md`, `DATA_SCHEMA.md`, `SECURITY_MODEL.md`, `API_CONTRACT.md`, `USER_FLOWS.md`, `SCREEN_SPECIFICATIONS.md`, `DESIGN_SYSTEM.md`
- **Execution & Quality**: `GEMINI.md`, `IMPLEMENTATION_PLAN.md`, `TEST_PLAN.md`, `TRACEABILITY_MATRIX.md`, `SECURITY_SPIKES.md`, `REPOSITORY_STRUCTURE.md`
- **Deployment & maintenance**: `ENVIRONMENT_CONFIG.md`, `DEPLOYMENT_RUNBOOK.md`, `OPERATIONS_RUNBOOK.md`, `DECISIONS.md`, `PROGRESS.md`
- **Prompts**: `00_GEMINI_MASTER_PROMPT.md` (คัดลอกครั้งแรก), `GEMINI_PHASE_PROMPTS.md` (ใช้เฉพาะกรณีอยากควบคุมทีละ Phase)
- **README**: ไฟล์ index และความเข้าใจสำคัญ

## วิธีเริ่ม (แนะนำ: Gemini ใน IDE / Gemini CLI ที่เข้าถึงโฟลเดอร์จริง)
1. สร้างโฟลเดอร์ Git ใหม่ `physicshealthtech`, แตก ZIP ทั้งหมดลง root ของโปรเจ็กต์ (ไฟล์ `.md` ต้องอยู่ระดับ root)
2. เปิดโฟลเดอร์นั้นใน IDE ที่ Gemini มีสิทธิ์อ่าน/แก้ไฟล์และเรียกเทสต์ได้ **ถ้าใช้หน้าแชทที่ไม่มี filesystem access โมเดลไม่สามารถแก้ไฟล์บนเครื่องจริง**
3. สร้าง Git repo (private แนะนำ) และ commit เอกสารทั้งหมดเป็น baseline แรก โดยไม่มีข้อมูลนักเรียน/secret/ID จริง
4. เลือก Gemini Flash 3.5 พร้อมระดับ High ตามที่ต้องการ จากนั้นคัดลอกข้อความทั้งหมดใน `00_GEMINI_MASTER_PROMPT.md` ไปให้ Gemini
5. ให้ Gemini เริ่มจาก P0/P1 spike และโครงสร้างโค้ด ไม่ให้เดาระบบล็อกอินครูหรือสร้างการอนุญาตแบบหลอก ๆ
6. ตรวจสอบรายการใน `DECISIONS.md` และดำเนินการเฉพาะส่วนที่ต้องทำโดยเจ้าของ (บัญชี Google, Script Properties, ความยินยอม/นโยบายข้อมูล, Deploy)
7. เมื่อจบ Phase ให้ดู `PROGRESS.md` + ผลทดสอบจริง + commit; ใช้ `GEMINI_PHASE_PROMPTS.md` ถ้าอยากจำกัดขอบเขตเป็นช่วง ๆ

## ข้อมูลยังไม่พร้อม? ไม่ต้องหยุดทุกอย่าง
อนุญาตให้ Gemini ใช้ synthetic fixtures และ placeholder configuration เพื่อพัฒนา/test ใน staging ได้ แต่ห้ามสร้างบัญชีจริง, ประกาศว่า authentication ปลอดภัยแล้ว, หรือปล่อย production โดยยังไม่มีการพิสูจน์.

## นิยาม 'เสร็จ'
- **Code complete**: โค้ดและ unit tests ผ่าน
- **Integrated**: ทดสอบกับ dev Sheets/Drive/Apps Script ของจริงผ่าน
- **Release-ready**: iPhone, ครูจริง, penetration/authorization negative cases, backup restore, load/quotas ผ่านครบ
- **Production live**: deploy โดยเจ้าของหรือสิทธิ์ที่อนุมัติแล้ว และ smoke test จริงผ่าน

## ข้อควรจำ
งานนี้มีข้อมูลนักเรียนและไฟล์ส่วนตัว: ความลับมาก่อนความเร็วและความสวย; การ Upload สำเร็จไม่เท่ากับครูยืนยันหลักฐานหรือผลการเรียนรู้ถูกต้อง.
