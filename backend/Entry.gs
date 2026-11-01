/**
 * PhysicsHealthTech V2.0 - Main Apps Script Entry Point & Dispatcher
 * Web App endpoints: doGet & doPost
 * Allowlisted RPC Dispatcher: api(request)
 * Source of truth: API_CONTRACT.md & GRADING_API_CONTRACT.md
 */

// Node.js environment compatibility loader (in GAS, all .gs files share global scope)
if (typeof module !== "undefined" && typeof require !== "undefined") {
  global.AppConfig = global.AppConfig || require("./Config.gs");
  global.GradingEngine = global.GradingEngine || require("./GradingEngine.gs");
  global.SyllabusService = global.SyllabusService || require("./SyllabusService.gs");
  global.AuthService = global.AuthService || require("./AuthService.gs");
  global.Authorization = global.Authorization || require("./Authorization.gs");
  global.StudentService = global.StudentService || require("./StudentService.gs");
  global.TeacherService = global.TeacherService || require("./TeacherService.gs");
  global.SubmissionService = global.SubmissionService || require("./SubmissionService.gs");
  global.EvidenceService = global.EvidenceService || require("./EvidenceService.gs");
  global.ProjectService = global.ProjectService || require("./ProjectService.gs");
  global.AcademicYearService = global.AcademicYearService || require("./AcademicYearService.gs");
  global.SheetRepository = global.SheetRepository || require("./SheetRepository.gs");
}

// Global repository instance for Google Apps Script execution
let _globalRepo = null;
function getRepository_() {
  if (!_globalRepo) {
    _globalRepo = new SheetRepository({
      spreadsheetId: AppConfig.getSpreadsheetId()
    });
  }
  return _globalRepo;
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "health";

  if (action === "health") {
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      service: "PhysicsHealthTech V2.0 Backend",
      timestamp: new Date().toISOString(),
      status: "running"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Fallback for HTML Service if hosted inside GAS directly
  return HtmlService.createHtmlOutput("<h3>PhysicsHealthTech V2.0 Web App Backend is Active</h3>")
    .setTitle("PhysicsHealthTech V2.0");
}

/**
 * Handle HTTP POST Requests (from GitHub Pages or external API clients)
 * Expected payload: JSON string in postData.contents with standard envelope:
 * { action, request_id, session_token, payload }
 */
function doPost(e) {
  let responsePayload = null;
  try {
    const rawContent = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    const request = JSON.parse(rawContent);
    responsePayload = api(request);
  } catch (err) {
    responsePayload = {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message_th: "รูปแบบคำขอไม่ถูกต้อง: " + err.message
      },
      request_id: null
    };
  }

  return ContentService.createTextOutput(JSON.stringify(responsePayload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Public Allowlisted RPC Dispatcher
 * 
 * @param {Object} request - Standard request envelope { action, request_id, session_token, payload }
 * @param {Object} injectedRepo - Optional repository for testing
 * @returns {Object} Standard response envelope { ok: boolean, data?: any, error?: any, request_id: string }
 */
function api(request, injectedRepo = null) {
  const req = request || {};
  const action = req.action || "";
  const requestId = req.request_id || `req_${new Date().getTime()}`;
  const sessionToken = req.session_token || "";
  const payload = req.payload || {};
  const repo = injectedRepo || getRepository_();

  // Public (Anonymous) Actions Allowlist
  const anonymousActions = [
    "auth.studentLogin",
    "auth.teacherLogin",
    "system.health"
  ];

  try {
    // 1. Health action
    if (action === "system.health") {
      return {
        ok: true,
        data: { status: "healthy", version: "2.0.0", time: new Date().toISOString() },
        request_id: requestId
      };
    }

    // 2. Student Login
    if (action === "auth.studentLogin") {
      const { code_5_digit, secret } = payload;
      const res = AuthService.studentLogin(code_5_digit, secret, repo, AppConfig.getServerPepper());
      return { ...res, request_id: requestId };
    }

    // 3. Teacher Login
    if (action === "auth.teacherLogin") {
      const res = AuthService.teacherLogin(payload, repo);
      return { ...res, request_id: requestId };
    }

    // --- Protected Actions: Require Active Session ---
    const sessionRes = AuthService.validateSession(sessionToken, repo);
    if (!sessionRes.ok) {
      return {
        ok: false,
        error: sessionRes.error,
        request_id: requestId
      };
    }

    const session = sessionRes.session;

    // 4. Logout & Auth Me
    if (action === "auth.logout") {
      const res = AuthService.logout(sessionToken, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "auth.me") {
      return {
        ok: true,
        data: { session },
        request_id: requestId
      };
    }

    // 5. Academic Years
    if (action === "years.list") {
      const res = AcademicYearService.listYears(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    // 6. Student Portal Actions
    if (action === "student.dashboard") {
      const res = StudentService.getDashboard(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "student.worksheetCards") {
      const res = StudentService.getWorksheetCards(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "student.gradeHistory") {
      const res = StudentService.getGradeHistory(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    // 7. Submissions & Upload Lifecycle
    if (action === "submissions.begin") {
      const res = SubmissionService.beginUpload(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "submissions.uploadEvidence") {
      const res = SubmissionService.uploadEvidence(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "submissions.complete") {
      const res = SubmissionService.completeSubmission(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "submissions.history") {
      const res = SubmissionService.getSubmissionHistory(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    // 8. Evidence Preview (Anti-IDOR)
    if (action === "evidence.preview") {
      const res = EvidenceService.getEvidencePreview(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    // 9. Projects & Portfolios
    if (action === "projects.listMine") {
      const res = ProjectService.listMine(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "projects.createIndividual") {
      const res = ProjectService.createIndividual(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "projects.createGroup") {
      const res = ProjectService.createGroupProject(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "projects.addArtifact") {
      const res = ProjectService.addArtifact(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    // 10. Teacher Workspace Actions (Server-Enforced Role)
    if (action === "teacher.gradebookMatrix") {
      const res = TeacherService.getGradebookMatrix(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.saveGradeDraft") {
      const res = TeacherService.saveGradeDraft(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.publishGrade") {
      const res = TeacherService.publishGrade(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.requestRevision") {
      const res = TeacherService.requestRevision(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.awardBonus") {
      const res = TeacherService.awardBonus(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.publishGroupScores") {
      const res = TeacherService.publishGroupScores(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.exportGradebook") {
      const res = TeacherService.exportGradebook(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.createYear") {
      const res = AcademicYearService.createYear(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.publishYear") {
      const res = AcademicYearService.publishYear(session, payload, repo);
      return { ...res, request_id: requestId };
    }

    if (action === "teacher.validateSyllabus") {
      Authorization.enforceTeacher(session);
      const res = SyllabusService.validateSyllabusPackage(payload);
      return { ok: true, data: res, request_id: requestId };
    }

    // Action not in allowlist
    return {
      ok: false,
      error: {
        code: "ACTION_NOT_ALLOWED",
        message_th: `การดำเนินการ '${action}' ไม่ได้รับอนุญาตในระบบ`
      },
      request_id: requestId
    };

  } catch (err) {
    let errorCode = err.code;
    let errorMessage = err.message || "เกิดข้อผิดพลาดในการประมวลผลคำขอ";
    if (!errorCode && typeof errorMessage === "string" && errorMessage.includes(":")) {
      const prefix = errorMessage.split(":")[0].trim();
      if (prefix === prefix.toUpperCase() && !prefix.includes(" ")) {
        errorCode = prefix;
      }
    }
    return {
      ok: false,
      error: {
        code: errorCode || "SERVER_ERROR",
        message_th: errorMessage
      },
      request_id: requestId
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    doGet,
    doPost,
    api
  };
}
