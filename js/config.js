/**
 * PhysicsHealthTech V2.0 - Client Configuration
 */

const CONFIG = {
  APP_TITLE: "PhysicsHealthTech V2.0",
  VERSION: "2.0.0",

  // Production Links provided by User
  DATABASE_SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0/edit?gid=0#gid=0",
  DATABASE_DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs",
  DATABASE_SPREADSHEET_ID: "1w3EQQfI2cK9-fmfLzbn3vzaTd-V81JCTT8Hwa8WhiA0",
  DATABASE_DRIVE_FOLDER_ID: "1FKKFSYOfzwdRuehjG9Ha_6yoKbc4dMWs",

  // Google Apps Script Web App Endpoint
  // Stored in localStorage so the user can easily paste their deployed GAS Web App URL
  getApiUrl() {
    return localStorage.getItem("PHT_GAS_WEBAPP_URL") || "";
  },

  setApiUrl(url) {
    if (url) {
      localStorage.setItem("PHT_GAS_WEBAPP_URL", url.trim());
    } else {
      localStorage.removeItem("PHT_GAS_WEBAPP_URL");
    }
  },

  isDemoMode() {
    // If no GAS URL set or explicitly toggled, demo/mock mode is active
    const explicit = localStorage.getItem("PHT_FORCE_DEMO_MODE");
    if (explicit !== null) return explicit === "true";
    return !this.getApiUrl();
  },

  setDemoMode(val) {
    localStorage.setItem("PHT_FORCE_DEMO_MODE", String(Boolean(val)));
  }
};

window.CONFIG = CONFIG;

