/**
 * PhysicsHealthTech V2.0 - Backend Bundler
 * Concatenates all individual .gs files into a single deployable Code.gs
 */

const fs = require("fs");
const path = require("path");

const backendDir = path.join(__dirname, "..", "backend");

const fileOrder = [
  "Config.gs",
  "SheetRepository.gs",
  "SchemaMigrator.gs",
  "GradingEngine.gs",
  "Authorization.gs",
  "AuthService.gs",
  "StudentService.gs",
  "SubmissionService.gs",
  "EvidenceService.gs",
  "ProjectService.gs",
  "AcademicYearService.gs",
  "SyllabusService.gs",
  "SessionService.gs",
  "TeacherService.gs",
  "Entry.gs"
];

let bundleContent = `/**
 * ==============================================================================
 * PHYSICS HEALTHTECH V2.0 - GOOGLE APPS SCRIPT COMPLETE ALL-IN-ONE BACKEND
 * ==============================================================================
 * 
 * Target Google Spreadsheet ID: 1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0
 * Target Google Drive Folder ID: 1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open Google Sheets -> Extensions (ส่วนขยาย) -> Apps Script
 * 2. In Code.gs, delete any existing code and PASTE THIS ENTIRE FILE.
 * 3. Click Save (Ctrl+S).
 * 4. In the function dropdown, select "initializeDatabase" and click "Run" (เรียกใช้)
 *    to automatically generate all required sheets and headers with permissions.
 * 5. Click "Deploy" (การทำให้ใช้งานได้) -> "Manage deployments" (จัดการการทำให้ใช้งานได้)
 *    -> Edit (แก้ไข) -> Version: "New version" (เวอร์ชันใหม่) -> Deploy (ทำให้ใช้งานได้).
 * ==============================================================================
 */

`;

for (const fileName of fileOrder) {
  const filePath = path.join(backendDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing required file: ${fileName}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  bundleContent += `\n// ==============================================================================\n`;
  bundleContent += `// MODULE: ${fileName}\n`;
  bundleContent += `// ==============================================================================\n\n`;
  bundleContent += content.trim() + "\n";
}

const outputPath = path.join(backendDir, "Code.gs");
fs.writeFileSync(outputPath, bundleContent, "utf-8");

console.log(`Successfully generated: ${outputPath} (${bundleContent.split("\n").length} lines)`);

