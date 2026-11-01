# DESIGN_SYSTEM.md — Precision Academic Workspace UI system

## v2.0 Score Presentation Rules
Dashboard grade panels should visually separate **reviewed earned/max** from **provisional course accumulation /100**, label pending as `รอตรวจ` (not gray 0), mark `เกินกำหนด` as additional chip, and use four main status labels without color-only cues. Add teacher Task/Rubric score entry with explicit Draft/Publish, revision reason and confirmation. Professional desktop teacher gradebook dense but readable, mobile student cards responsive; use `DASHBOARD_METRICS.md` and `SCREEN_SPECIFICATIONS.md` v2.


## Product feeling
ระบบติดตามหลักฐานการเรียนรู้อย่างมืออาชีพ สะอาด สุขุม ทันสมัย นักเรียนใช้บนมือถือได้ทันที ครูดูข้อมูลหนาแน่นอย่างเป็นระบบบน Desktop. Thai-first. No visual AI slop: หลีกเลี่ยง emoji ประดับปุ่มแบบสุ่ม, gradient หลายสี, glass blur หนา, card ซ้อนซ้ำซ้อน, dashboard รก. ใช้ SVG icon set ที่มีที่มาทาง license ชัดเจน หรือ inline icons ที่สร้างเอง, ไม่ใช้ emoji เป็นเพียงตัวชี้สถานะ.

## Tokens (suggested defaults, configurable)
```css
:root {
  --bg: #f6f8fb;
  --surface: #ffffff;
  --surface-muted: #eef3f9;
  --border: #d9e2ed;
  --text: #17283b;
  --text-muted: #506379;
  --brand: #145a9d;
  --brand-hover: #0e467b;
  --brand-soft: #e8f2fd;
  --success: #18794e;
  --warning: #915d12;
  --danger: #ae2f32;
  --focus: #145a9d;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-sm: 0 2px 8px rgba(15,33,57,.06);
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
}
```
These are suggestions, not a literal request for a code file at planning stage. Verify all text/status/button contrast to WCAG AA; avoid relying on colors alone.

## Typography, grid, behavior
- Use Noto Sans Thai or Sarabun + system Thai fallbacks; validate font availability/network policy in Apps Script HTML Service.
- Student mobile: minimum 16px body, 44×44px touch targets, single-column cards, sticky submission CTA only if not covering text, no long unnecessary onboarding.
- Teacher: optimized 1280–1440px sidebar, one filter toolbar, sticky matrix headers + first identity column, independent scroll, visible status labels, keyboard shortcuts only as progressive enhancement.
- Breakpoints to test at 360, 390, 430, 768, 1024, 1440px; zoom 200%; iOS Safari, Android Chrome, desktop Chrome/Firefox.
- Navigation: Student `หน้าหลัก / งานของฉัน / โครงงาน / บัญชี`; Teacher sidebar `ภาพรวม / ตารางส่งงาน / งานและใบงาน / นักเรียน / โครงงานกลุ่ม / ปีการศึกษา / ตรวจสอบ / ถังขยะ`.
- UI states: loading (skeleton), empty, validation-error, upload in progress, retryable error, permission denied, session expired, archived read-only, success receipt, stale teacher update conflict.

## Components
- `AppShell`, `TopBar`, `BottomNav`, `TeacherSidebar`, `YearPicker`, `GradeToggle`, `AssignmentCard`, `StatusBadge` (icon+text), `UploadDropzone/CameraPicker`, `ImagePreviewList`, `VersionTimeline`, `ProjectArtifactEditor`, `RosterMatrix`, `OutOfRosterTray`, `ConfirmDialog`, `Toast`, `EmptyState`, `ErrorState`, `ProgressSteps`.
- Component names conceptual; implementations may use native HTML templates and Vanilla JS rather than framework components.
- Status vocabulary exact: `ยังไม่ส่ง`, `ส่งแล้ว`, `ยืนยันหลักฐานแล้ว`, `ต้องแก้ไข`, `ส่งนอกบัญชีรายชื่อ`, `ปิดรับ`, `ฉบับร่าง`, `กำลังส่ง`, `ส่งไม่สำเร็จ`.
- Status `ยืนยันหลักฐานแล้ว` only verifies evidence storage/teacher acknowledgement, **never** academic correctness.

## Forms & interactions
- Labels always visible, required markers accessible, inline error near field, show/hide student independent secret, generic wrong-login message.
- `select year → grade → assignment → choose/capture → review preview → confirm upload → receipt`, allow deep linking only without exposing private resource IDs in public-facing URL.
- Pre-upload warn image count/size; on failure preserve user selection/preview in memory if possible and provide concrete retry.
- For asynchronous RPC, disable duplicate submit, show step stages not fake percentage; allow cancellation only where the backend can safely cancel a staged operation.
- For teacher destructive action, require confirmation with target, reason field and show undo/restore path.

## Accessibility & privacy
- `lang="th"`, keyboard navigable; accessible button names; focus visible; form inputs and errors announced; screen readers can understand badges without colors.
- Avoid public personal data on logged-out page and avoid classmates' names in aggregate student-facing graphs.
- No hidden client role features treated as security; server permission rules are authoritative.
