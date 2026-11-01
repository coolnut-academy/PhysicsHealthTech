const fs = require('fs');
const path = require('path');

const mockPath = path.join(__dirname, '..', 'js', 'mock-backend.js');
let mock = fs.readFileSync(mockPath, 'utf8');

const batchCode = `      // 3.0 Batch Upload (Single roundtrip high-performance upload)
      if (action === "submissions.submitBatch") {
        const studentUid = session.principal_uid;
        const { worksheet_code, academic_year_id, grade, note, files } = payload;
        
        const existingSub = memoryDB.submissions.find(s => 
          s.worksheet_code === worksheet_code && 
          s.student_uid === studentUid && 
          s.academic_year_id === academic_year_id &&
          s.grade === grade
        );

        const newVersionNo = existingSub ? (existingSub.latest_version_no + 1) : 1;
        const versionId = "subv_" + Math.random().toString(16).substring(2, 10);
        const subId = existingSub ? existingSub.submission_id : ("sub_" + Math.random().toString(16).substring(2, 10));
        const now = new Date().toISOString();

        if (existingSub) {
          existingSub.latest_version_id = versionId;
          existingSub.latest_version_no = newVersionNo;
          existingSub.latest_version_submitted_at = now;
          existingSub.state = "submitted";
          existingSub.updated_at = now;
        } else {
          memoryDB.submissions.push({
            submission_id: subId,
            academic_year_id,
            grade,
            worksheet_code,
            student_uid: studentUid,
            latest_version_id: versionId,
            latest_version_no: newVersionNo,
            latest_version_submitted_at: now,
            state: "submitted",
            out_of_roster: false,
            created_at: now
          });
        }

        memoryDB.submissionVersions.push({
          submission_version_id: versionId,
          submission_id: subId,
          version_no: newVersionNo,
          submitted_by_uid: studentUid,
          submitted_at: now,
          note: note || "",
          state_at_submit: "submitted",
          out_of_roster_at_submit: false
        });

        (files || []).forEach((f, idx) => {
          const evId = "ev_" + Math.random().toString(16).substring(2, 10);
          memoryDB.evidence.push({
            evidence_id: evId,
            submission_version_id: versionId,
            student_uid: studentUid,
            file_name: f.file_name || "page_" + (idx + 1) + ".jpg",
            file_base64: f.file_base64,
            mime_type: f.mime_type || "image/jpeg",
            status: "active",
            created_at: now
          });
        });

        return {
          ok: true,
          data: {
            submission_id: subId,
            version_no: newVersionNo,
            submitted_at: now
          }
        };
      }

      // 3. Submissions
      if (action === "submissions.begin") {`;

mock = mock.replace('      // 3. Submissions\r\n      if (action === "submissions.begin") {', batchCode);
if (!mock.includes('submissions.submitBatch')) {
  mock = mock.replace('      // 3. Submissions\n      if (action === "submissions.begin") {', batchCode);
}

fs.writeFileSync(mockPath, mock, 'utf8');
console.log('Successfully added submissions.submitBatch to mock-backend.js!');

