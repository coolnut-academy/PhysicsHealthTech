const fs = require('fs');

const norm = s => s.replace(/\r\n/g, '\n');

let mock = fs.readFileSync('js/mock-backend.js', 'utf-8');

const target = `      // 4. Evidence Preview`;

const replacement = `      if (action === "submissions.history") {
        let studentUid = session.principal_uid;
        if (session.principal_type === "teacher" || session.role === "teacher") {
          studentUid = payload.student_uid || session.principal_uid;
        }
        const { worksheet_code } = payload;
        const sub = memoryDB.submissions.find(s => s.worksheet_code === worksheet_code && s.student_uid === studentUid);
        if (!sub) {
          return { ok: true, data: { worksheet_code, latest_version_no: 0, versions: [] } };
        }
        const versions = memoryDB.submissionVersions
          .filter(v => v.submission_id === sub.submission_id)
          .sort((a, b) => b.version_no - a.version_no)
          .map(v => {
            const files = memoryDB.stagedFiles.filter(f => f.submission_version_id === v.submission_version_id);
            const review = memoryDB.evidenceReviews.find(r => r.submission_id === sub.submission_id);
            return {
              submission_version_id: v.submission_version_id,
              version_no: v.version_no,
              submitted_at: v.submitted_at,
              note: v.note,
              files: files.map(f => ({
                evidence_id: f.evidence_id,
                file_name: f.file_name || "evidence.jpg",
                mime_type: f.mime_type || "image/jpeg",
                size_bytes: f.size_bytes || 1024,
                data_url: f.data_url || ""
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
            submission_id: sub.submission_id,
            worksheet_code,
            latest_version_no: sub.latest_version_no,
            versions
          }
        };
      }

      // 4. Evidence Preview`;

let normMock = norm(mock);
if (normMock.includes(norm(target))) {
  normMock = normMock.replace(norm(target), norm(replacement));
  if (mock.includes('\r\n')) normMock = normMock.replace(/\n/g, '\r\n');
  fs.writeFileSync('js/mock-backend.js', normMock, 'utf-8');
  console.log('✔ Patched js/mock-backend.js submissions.history');
} else {
  console.log('❌ Could not find target in mock-backend.js');
}

