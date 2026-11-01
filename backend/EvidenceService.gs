/**
 * PhysicsHealthTech V2.0 - Evidence & File Service
 * Threat Model: SECURITY_MODEL.md, AC01, SEC04, ADR-003
 * 
 * Rules:
 * - No public Google Drive URLs are EVER shared with clients.
 * - Evidence previews are served behind server-side authorization checks.
 * - Anti-IDOR: Student can only view files belonging to their own submissions or group artifacts.
 * - Teachers can view student files for grading.
 */

const EvidenceService = {
  /**
   * Get authorized evidence preview
   */
  getEvidencePreview(session, payload, repository) {
    if (!session) {
      throw new Error("ACCESS_DENIED: โปรดเข้าสู่ระบบเพื่อดูหลักฐาน");
    }

    const { evidence_id } = payload || {};
    if (!evidence_id) {
      throw new Error("INVALID_REQUEST: โปรดระบุรหัสหลักฐาน (evidence_id)");
    }

    const file = repository.findFileByEvidenceId(evidence_id);
    if (!file) {
      throw new Error("FILE_NOT_FOUND: ไม่พบไฟล์หลักฐานในระบบ");
    }

    // Resolve owner through SubmissionVersion -> Submission
    const version = repository.findSubmissionVersionById(file.submission_version_id);
    if (!version) {
      throw new Error("VERSION_NOT_FOUND: ไม่พบข้อมูลเวอร์ชันของหลักฐาน");
    }

    const submission = repository.findSubmissionById(version.submission_id);
    if (!submission) {
      throw new Error("SUBMISSION_NOT_FOUND: ไม่พบข้อมูลการส่งงานของหลักฐาน");
    }

    // Server-side authorization check (AC01, SEC04)
    Authorization.enforceResourceAccess(session, submission.student_uid);

    // Fetch file bytes from Google Drive or mock repository
    const base64Data = repository.readDriveFileAsBase64(file.drive_file_id);
    const dataUrl = `data:${file.mime_type};base64,${base64Data}`;

    return {
      ok: true,
      data: {
        evidence_id: file.evidence_id,
        mime_type: file.mime_type,
        size_bytes: file.size_bytes,
        data_url: dataUrl
      }
    };
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = EvidenceService;
}

