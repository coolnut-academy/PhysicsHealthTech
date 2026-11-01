/**
 * PhysicsHealthTech V2.0 - Configuration Module
 * Google Apps Script Script Properties + System Defaults
 */

const AppConfig = {
  // Production Resource IDs provided by User
  DEFAULT_SPREADSHEET_ID: "1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0",
  DEFAULT_DRIVE_ROOT_FOLDER_ID: "1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs",

  // Session Limits
  STUDENT_SESSION_IDLE_MINUTES: 30,
  STUDENT_SESSION_MAX_HOURS: 8,
  TEACHER_SESSION_IDLE_MINUTES: 20,
  TEACHER_SESSION_MAX_HOURS: 4,

  // Throttling & Rate Limits
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,

  // File Upload Limits
  MAX_FILE_SIZE_BYTES: 2 * 1024 * 1024, // 2 MiB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGES_PER_SUBMISSION: 5,

  // Server Pepper for HMAC verification (Loaded from Script Properties in GAS)
  getServerPepper() {
    try {
      if (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties) {
        const pepper = PropertiesService.getScriptProperties().getProperty("SERVER_PEPPER");
        if (pepper) return pepper;
      }
    } catch (e) {
      // In non-GAS test environments
    }
    return "PHT_SECURE_SERVER_PEPPER_2026_V2";
  },

  getSpreadsheetId() {
    try {
      if (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties) {
        const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
        if (id) return id;
      }
    } catch (e) {}
    return this.DEFAULT_SPREADSHEET_ID;
  },

  getDriveRootFolderId() {
    try {
      if (typeof PropertiesService !== "undefined" && PropertiesService.getScriptProperties) {
        const id = PropertiesService.getScriptProperties().getProperty("DRIVE_ROOT_FOLDER_ID");
        if (id) return id;
      }
    } catch (e) {}
    return this.DEFAULT_DRIVE_ROOT_FOLDER_ID;
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = AppConfig;
}

