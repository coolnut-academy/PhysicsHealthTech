# PhysicsHealthTech — Context Brief B: Web App Product & Technical Specification

> ใช้เป็นไฟล์แนบ **เฉพาะแชทออกแบบและพัฒนาเว็บไซต์** ไม่ใช่งานสร้างใบงานหรือเอกสารสอนฉบับเต็ม
> Version: 1.0 | 1 พฤศจิกายน 2569

## 1. เป้าหมายผลิตภัณฑ์
**PhysicsHealthTech** เป็นเว็บแอปสำหรับเก็บผลงานวิชาฟิสิกส์บูรณาการสายสุขภาพในรูปแบบแฟ้มสะสมหลักฐานออนไลน์ ใช้ซ้ำได้หลายปีการศึกษา แยก **ม.4 และ ม.5** ครูจัดกิจกรรม PBL ระดับชั้นละ 20 คาบ นักเรียนแต่ละคนมีโครงงานเดี่ยวอย่างน้อย 1 ชิ้น และตอนท้ายมีโครงงานกลุ่ม **1 ชิ้นต่อกลุ่ม**

ระบบนี้ไม่ใช่เครื่องมือตรวจข้อสอบฟิสิกส์อัตโนมัติ ครูตรวจใบงานกระดาษจริง **ก่อน** ให้นักเรียนถ่ายภาพอัปโหลดไว้เป็นหลักฐาน นักเรียนเปิดย้อนดูใบงาน ภาพร่าง UI Prompt และประวัติการสร้างแอปได้จากทุกอุปกรณ์

## 2. Tech Stack ที่ต้องการ
- Frontend: **HTML + CSS + JavaScript** (responsive, Thai-first)
- Data: **Google Sheets** เป็นฐานข้อมูลเชิงตาราง
- File storage: **Google Drive** สำหรับรูปภาพ/ไฟล์ผลงาน
- Server/backend: **Google Apps Script** สำหรับอ่านเขียนข้อมูล, ยืนยันตัวตน, ตรวจสิทธิ์, อัปโหลดและส่งไฟล์อย่างปลอดภัย
- แนะนำให้ศึกษาการโฮสต์เว็บหลักผ่าน Apps Script HTML Service เพื่อลดปัญหา CORS/การเชื่อมต่อ; **GitHub Pages ใช้เผยแพร่เว็บผลงานของนักเรียน** แยกจากพอร์ทัลเก็บใบงาน
- ไม่มีความจำเป็นต้องใช้ React, Next.js, Firebase หรือฐานข้อมูลบริการอื่น หากไม่พบข้อจำกัดที่อธิบายได้ชัดเจน

## 3. รูปแบบการใช้งาน
### Student Portal
- ครูลงทะเบียนบัญชีนักเรียนไว้ล่วงหน้า (ประมาณ 80 บัญชีในช่วงเริ่มใช้งาน)
- รหัสนักเรียน 5 หลักใช้ระบุตัวนักเรียน แต่ **รหัส 5 หลักอย่างเดียวไม่เพียงพอต่อการยืนยันตัวตน** ต้องออกแบบวิธีเพิ่มความลับหรือยืนยันตัวตนที่ใช้ง่ายและปลอดภัย (เช่น PIN ลับแยกต่างหาก/วิธีอื่นที่พิสูจน์สิทธิ์ได้) โดยให้ครูเลือกก่อน implement
- เห็นเฉพาะผลงานและประวัติของบัญชีตัวเอง และเห็น **สถิติจำนวนส่งงานรวมแบบ aggregate** ตามที่ครูเปิดให้เห็น แต่ไม่เห็นชื่อหรือไฟล์ของเพื่อน
- เลือกปีการศึกษา → เลือก ม.4 หรือ ม.5 → เลือกรายการส่ง → อัปโหลดภาพใบงาน/ผลงาน หรือบันทึกลิงก์และข้อความที่จำเป็น
- ดูใบงานย้อนหลังและไฟล์ที่เคยส่งได้โดยไม่ต้องพกกระดาษ; อัปโหลดแก้ไข/เพิ่มเวอร์ชันตามสถานะเปิดรับงาน
- งานโครงงานเดี่ยวเก็บได้มากกว่า 1 โปรเจกต์ต่อคน; แต่ละโปรเจกต์เก็บภาพ UI บนกระดาษ, Prompt เวอร์ชันต่าง ๆ, URL GitHub Pages, คำตอบทดสอบฟิสิกส์
- โครงงานกลุ่มเป็น 1 โปรเจกต์ต่อกลุ่มต่อรอบ มีสมาชิกและประวัติการแก้ไข สมาชิกที่ยืนยันตัวตนแล้วเข้าถึงงานของกลุ่มตัวเองตามสิทธิ์ ไม่เห็นงานกลุ่มอื่น

### Teacher Workspace
- บัญชีครูมีสิทธิ์ดูทุกระดับชั้น ทุกปีการศึกษา แยกปี/ระดับ/ห้อง/ใบงาน
- ตารางคะแนนสถานะงาน **เรียงเลขที่** ตามบัญชีรายชื่อนักเรียนประจำปี กรองส่งแล้ว/ยังไม่ส่ง/ต้องแก้ไข/ยืนยันแล้ว; ค้นหานักเรียน, ดูหลักฐาน, สรุปจำนวนส่ง/ไม่ส่ง
- ครูสร้าง/ปิดรับงาน จัดการบัญชี/บัญชีรายชื่อประจำปี, ตั้งค่าเทมเพลตรายการใบงาน, สร้างปีใหม่, ลบ/กู้คืนหรือย้ายงานผิดพื้นที่
- ครูไม่จำเป็นต้องตรวจคะแนนออนไลน์ แต่มีสถานะ 'ส่งแล้ว' และเลือก 'ยืนยันหลักฐานแล้ว' หรือ 'ให้แก้ไข' ได้; ระบุชัดเจนว่า **การส่งออนไลน์ไม่เท่ากับการตรวจเนื้อหาใบงานทางวิชาการ**

## 4. Academic Year Engine — กติกาหลัก
- ปุ่ม **สร้างปีการศึกษาใหม่** โดยระบุปี พ.ศ. เช่น 2570 แล้วสร้างพื้นที่ ม.4 และ ม.5 และสร้างรายการงานจาก Template กลาง (ครูตรวจแก้ก่อนเผยแพร่ได้)
- ไม่ลบงานปีก่อนและไม่เขียนทับประวัติ; นักเรียนยังเปิดผลงานของตนในปีเก่าได้
- นักเรียนที่ **บัญชีมีอยู่จริงและยืนยันตัวตนแล้ว** สามารถเลือกส่งงานของปี/ระดับชั้นใดก็ได้ที่เปิดรับ **โดยไม่ต้องบังคับว่าอยู่บัญชีรายชื่อของปี/ชั้นนั้น**
- ใช้ `Enrollments` เป็น **บัญชีรายชื่อเพื่อคำนวณสถิติว่าใครยังไม่ส่ง** เท่านั้น ไม่ใช่ด่านห้ามส่งข้ามปี
- ถ้าส่งนอกบัญชีรายชื่อ ให้ติด flag `out_of_roster` ชัดเจนในฝั่งครูและไม่นับรวมยอดส่งของบัญชีรายชื่อจนกว่าจะยืนยัน/แก้ไข; ครูย้ายหรือลบแบบ soft-delete ได้

## 5. โครงสร้างข้อมูลตั้งต้น (ปรับปรุงได้หลังทำ ERD)
- `Students`: stable student_uid, code_5_digit (เก็บเป็นข้อความ รักษาเลขศูนย์นำหน้า), display_name, status, credential metadata ที่ไม่ใช่ plain-text secret
- `AcademicYears`: academic_year_id, year_be, state, created_at
- `Enrollments`: enrollment_id, academic_year_id, student_uid, grade, room, roll_no
- `AssignmentTemplates`: template_id, grade, category, title, order_no, required_fields
- `Assignments`: assignment_id, academic_year_id, grade, template_id, title, status, due_date
- `Submissions`: submission_id, student_uid or group_id, assignment_id, submitted_at, state, version, out_of_roster, deleted_at
- `SubmissionFiles`: file_id, submission_id, drive_file_id, file_type, size, owner association
- `Projects`: project_id, academic_year_id, grade, type(individual/group), owner, title, github_pages_url, status
- `ProjectMembers`: project_id, student_uid, role
- `ProjectArtifacts`: project_id, artifact_kind(ui_photo/prompt/test/result), version, data/file pointer
- `AuditLogs`: actor_uid, action, object, timestamp, change summary
- Optional: `Sessions`, `RateLimits`, `AppSettings` (ขึ้นอยู่กับ auth design)

ใช้ ID ภายในที่ไม่เปลี่ยนในการเชื่อมข้อมูล ไม่ใช้ `code_5_digit` หรือชื่อไฟล์เป็น primary key ไม่สร้าง Google Sheet ใหม่ทุกปี

## 6. File Storage และการรักษาความปลอดภัย
ตัวอย่าง Drive hierarchy: `PhysicsHealthTech/{ปี พ.ศ.}/{M4|M5}/{Worksheets|IndividualProjects|GroupProjects}/...` แต่สิทธิ์จริง **ต้องตรวจจาก backend** ไม่อาศัยโฟลเดอร์เป็นระบบสิทธิ์
- Drive files ที่เป็นผลงานนักเรียนต้องไม่เปิด `Anyone with the link`
- ห้ามส่ง Drive File ID หรือ URL ตรงให้ผู้ใช้ที่ไม่มีสิทธิ์เปิด; ให้ backend ตรวจสิทธิ์ก่อนอ่าน/ส่งไฟล์
- ไม่เชื่อข้อมูล `student_id`, owner, role, year ที่ browser ส่งมา ต้องเทียบกับ session ที่ตรวจแล้วและ lookup จริงทุกครั้ง
- ต้องป้องกันการเดารหัส 5 หลัก, brute force, session hijack, การลิงก์ตรงข้ามบัญชี, การกดลบผิด, simultaneous submission, ข้อมูลผิดปี
- แนวทาง teacher login ต้องพิสูจน์ตัวตนที่เชื่อถือได้ (เช่นบัญชี Google ที่ตรวจสอบได้ตาม deployment mode); **อย่าสมมติว่า Apps Script `Session.getActiveUser().getEmail()` ใช้ยืนยันตัวตนได้ในทุก deployment**
- เก็บรหัสลับในรูปแบบ hash/salted verifier ตามข้อจำกัดที่ยอมรับได้; ห้ามฝัง credential, spreadsheet ID แบบให้เขียนได้, Drive API token หรือ Apps Script token ที่มีสิทธิ์ใน frontend
- รับภาพจากโทรศัพท์เป็นหลัก จำกัดขนาดไฟล์/ชนิดไฟล์ และจัดการภาพ HEIC จาก iOS โดยออกแบบ fallback ที่ใช้งานได้จริง; แสดง preview/progress/error โดยไม่ทำให้ไฟล์หาย
- ไม่เผยแพร่ข้อมูลส่วนบุคคลนักเรียนใน GitHub Pages public; กำหนด retention/backup/restore และ soft-delete

## 7. UX/UI ที่ต้องการ
- Thai-first, ใช้งานง่ายบนมือถือ; Desktop สำหรับครูมีตารางติดตามงานที่อ่านง่ายและเรียงเลขที่
- เริ่มต้นที่ login และเลือกปีการศึกษา; นักเรียนกดไม่กี่ขั้นตอนเพื่อถ่ายรูปส่งงาน
- ค้นหาและเปิดหลักฐานเดิมด้วยปี/ระดับชั้น/ประเภทใบงาน; แสดงสถานะชัดเจน ไม่พึ่งสีอย่างเดียว
- ไม่ให้สรุปคะแนนรวมเท่ากับผลตรวจฟิสิกส์โดยอัตโนมัติ; บันทึกสถานะการส่งและการยืนยันหลักฐาน
- ใช้โครงหน้าจอ: Student Login/Dashboard, Academic Year Selector, Grade & Assignment List, Assignment Detail/Upload, My Work History, Individual Project, Group Project; Teacher Login, Teacher Overview, Submission Matrix/Student Detail, Assignment Manager, Academic Year Manager, Student Roster, Audit/Trash
- ออกแบบระบบให้ใช้งานง่ายและสวยงามอย่างมืออาชีพ ไม่ยัดฟีเจอร์ที่ไม่จำเป็นใน MVP

## 8. การทดสอบและ Acceptance Criteria
ต้องสาธิตและตรวจว่า:
1. นักเรียน A ไม่มีทางเปิดหลักฐานนักเรียน B ได้ แม้เดา URL/ID หรือเปลี่ยนข้อมูลใน request
2. รหัส 5 หลักอย่างเดียวไม่สามารถนำไปสวมสิทธิ์บัญชีคนอื่น
3. ครูเห็นการส่งครบ/ไม่ครบตาม **บัญชีรายชื่อของปีและระดับชั้น** เรียงเลขที่ถูกต้อง
4. นักเรียนบัญชีถูกต้องส่งงานข้ามปี/ข้ามระดับได้โดยไม่ถูกบล็อก; ครูเห็นรายการนอกบัญชีรายชื่อ
5. กดสร้างปีใหม่แล้วเกิด ม.4/ม.5 และ assignment templates ใหม่ **แต่ข้อมูลปีก่อนยังอยู่ครบ**
6. มีประวัติงานเดี่ยว/งานกลุ่ม/ใบงานทุกเวอร์ชันตามสิทธิ์ที่กำหนด
7. Upload สำเร็จหรือส่ง error ที่ชัดเจน ไม่เกิด metadata ชี้ไฟล์ที่ไม่มีอยู่โดยไม่ตรวจซ่อม
8. การส่งพร้อมกันหลายคนยังรักษาความถูกต้องของข้อมูล; มีวิธีกู้ข้อมูลที่ครูลบผิด
9. บทบาทครูไม่ปลอมได้จากการกดปุ่มที่ซ่อนหรือแก้ JavaScript บนเบราว์เซอร์
10. ทดสอบมือถือจริง รวมถึงภาพถ่ายจาก iPhone และ UX กรณีเน็ตช้า

## 9. ขอบเขตการพัฒนาเป็นเฟส
- Phase 1: Security & Foundation (data model, Drive config, auth, roles)
- Phase 2: Student Portal (year/grade/assignments/upload/history)
- Phase 3: Teacher Workspace (roll-number matrix, filters, evidence review, account/roster)
- Phase 4: Project Portfolios (individual projects 1+, group project 1/group, artifacts, history, links)
- Phase 5: Reusable Academic Years & QA (year-create button, copy template, cross-year submission, backup, security testing)
- ให้เตรียม `PLAN.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `DATA_SCHEMA.md`, `SECURITY_MODEL.md`, `TEST_PLAN.md` เพื่อใช้ทำงานร่วมกับ Coding AI ต่อเนื่องทีละเฟส

## 10. สิ่งที่ไม่ทำในแชทนี้
- ไม่เขียนเนื้อหาโจทย์ฟิสิกส์ฉบับเต็ม/เฉลย/ใบงานทางการศึกษาใหม่จากศูนย์
- ไม่สร้างไฟล์ .docx ใบงานหรือแผนการจัดการเรียนรู้ (ได้เพียงกำหนด metadata/ชนิดหลักฐานที่ระบบต้องรับ)
- ไม่บังคับนักเรียนสร้างหลายโปรเจกต์กลุ่ม และไม่บังคับให้ใช้เครื่องมือเขียนโค้ดทุกคาบ

## 11. ข้อมูลที่ยังรอการตัดสินใจ
- วิธีล็อกอินที่ปลอดภัยแต่ใช้สะดวกของนักเรียน (รหัส 5 หลัก + ตัวพิสูจน์เพิ่มเติม)
- วิธีล็อกอินครู/โฮสต์เว็บ Apps Script ที่เหมาะกับโดเมนและสิทธิ์ของสถานศึกษา
- ขนาดไฟล์/จำนวนรูปต่อใบงาน, ควอตา Drive/Apps Script, เวอร์ชันที่ให้นักเรียนแก้ไขได้
- ชื่อจริงของรายการใบงานและแบบฟอร์ม จะได้รับจากแชทเอกสารเมื่อจัดทำเสร็จ

เริ่มจากออกแบบ architecture, security และ user flows ก่อนเขียนโค้ดจริง ห้ามอ้างว่า login 5 หลักอย่างเดียวมี privacy แท้จริง
