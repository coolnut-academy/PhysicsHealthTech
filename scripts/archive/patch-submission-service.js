const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');

let code = fs.readFileSync('backend/SubmissionService.gs', 'utf-8');

const oldTarget = `  getSubmissionHistory(session, payload, repository) {
    const studentUid = Authorization.enforceStudent(session);
    const { worksheet_code, academic_year_id, grade } = payload || {};

    const submission = repository.findSubmissionByWorksheetAndStudent(worksheet_code, studentUid, academic_year_id, grade);
    if (!submission) {
      return { ok: true, data: { worksheet_code, versions: [] } };
    }

    const versions = repository.findSubmissionVersions(submission.submission_id);
    const versionItems = versions.map(v => {
      const files = repository.findFilesForVersion(v.submission_version_id);
      const review = repository.findEvidenceReviewForVersion(v.submission_version_id);
      return {
        version_no: v.version_no,
        submitted_at: v.submitted_at,
        note: v.note,
        state_at_submit: v.state_at_submit,
        files: files.map(f => ({
          evidence_id: f.evidence_id,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes
        })),
        review: review ? {
          decision_state: review.decision_state,
          feedback: review.feedback,
          reviewed_at: review.reviewed_at
        } : null
      };
    });

    return {
      ok: true,
      data: {
        submission_id: submission.submission_id,
        worksheet_code,
        latest_version_no: submission.latest_version_no,
        versions: versionItems
      }
    };
  }`;

const newRepl = `  getSubmissionHistory(session, payload, repository) {
    let studentUid = null;
    if (session && (session.principal_type === "teacher" || session.role === "teacher" || session.role === "admin")) {
      studentUid = (payload && payload.student_uid) ? payload.student_uid : null;
      if (!studentUid) {
        throw new Error("INVALID_REQUEST: โปรดระบุ student_uid");
      }
    } else {
      studentUid = Authorization.enforceStudent(session);
    }
    const { worksheet_code, academic_year_id, grade } = payload || {};

    const submission = repository.findSubmissionByWorksheetAndStudent(worksheet_code, studentUid, academic_year_id, grade);
    if (!submission) {
      return { ok: true, data: { worksheet_code, versions: [] } };
    }

    const versions = repository.findSubmissionVersions(submission.submission_id) || [];
    versions.sort((a, b) => (Number(b.version_no) || 0) - (Number(a.version_no) || 0));

    const versionItems = versions.map(v => {
      const files = repository.findFilesForVersion(v.submission_version_id) || [];
      const review = repository.findEvidenceReviewForVersion(v.submission_version_id);
      return {
        submission_version_id: v.submission_version_id,
        version_no: v.version_no,
        submitted_at: v.submitted_at,
        note: v.note,
        state_at_submit: v.state_at_submit,
        files: files.map(f => ({
          evidence_id: f.evidence_id,
          file_name: f.file_name,
          mime_type: f.mime_type,
          size_bytes: f.size_bytes
        })),
        review: review ? {
          decision_state: review.decision_state,
          feedback: review.feedback,
          reviewed_at: review.reviewed_at
        } : null
      };
    });

    return {
      ok: true,
      data: {
        submission_id: submission.submission_id,
        worksheet_code,
        latest_version_no: submission.latest_version_no,
        versions: versionItems
      }
    };
  }`;

let normCode = norm(code);
if (normCode.includes(norm(oldTarget))) {
  normCode = normCode.replace(norm(oldTarget), norm(newRepl));
  if (code.includes('\r\n')) normCode = normCode.replace(/\n/g, '\r\n');
  fs.writeFileSync('backend/SubmissionService.gs', normCode, 'utf-8');
  console.log('✔ Patched backend/SubmissionService.gs getSubmissionHistory');
} else {
  console.log('❌ Could not find oldTarget in SubmissionService.gs');
}

