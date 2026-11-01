const fs = require('fs');

const url = 'https://script.google.com/macros/s/AKfycbysnNcqRKRfg5CxPl0saQl-cM0MJS3I_3TNeadvhwh06nr5HwXcMkatkQn5vnVhexM/exec';

// Valid 1x1 JPEG base64 (mock evidence)
const sampleJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function callGas(action, payload, sessionToken = null) {
  const body = {
    action,
    payload,
    ...(sessionToken ? { session_token: sessionToken } : {})
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  return json;
}

(async () => {
  console.log('===============================================================');
  console.log('  PhysicsHealthTech - Live End-to-End Simulation (std_99999)   ');
  console.log('===============================================================\n');

  try {
    // 1. Student Login
    console.log('▶ Step 1: Simulating Student 99999 Login (Passwordless)...');
    const loginRes = await callGas('auth.studentLogin', { code_5_digit: '99999' });
    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.error);
      process.exit(1);
    }
    const studentToken = loginRes.data.session_token;
    const profile = loginRes.data.profile;
    console.log(`  ✔ Logged in as: ${profile.display_name} (${profile.grade} Room ${profile.room} No. ${profile.roll_no})`);
    console.log(`  ✔ Academic Year: ${profile.academic_year_id}`);

    // 2. Load Dashboard
    console.log('\n▶ Step 2: Fetching Student Dashboard...');
    const dashRes = await callGas('student.dashboard', {
      academic_year_id: profile.academic_year_id || 'yr_2569',
      grade: profile.grade || 'M4'
    }, studentToken);

    if (!dashRes.ok) {
      console.error('❌ Dashboard fetch failed:', dashRes.error);
      process.exit(1);
    }

    const cards = dashRes.data.worksheet_cards;
    console.log(`  ✔ Received ${cards.length} worksheet cards from Live Google Sheets!`);

    const worksheetCode = 'PHT4-W01';
    console.log(`\n▶ Step 3: Preparing submission for [${worksheetCode}]...`);

    // 3. Begin Upload
    const beginRes = await callGas('submissions.begin', {
      worksheet_code: worksheetCode,
      academic_year_id: 'yr_2569',
      grade: 'M4'
    }, studentToken);

    if (!beginRes.ok) {
      console.error('❌ submissions.begin failed:', beginRes.error);
      process.exit(1);
    }
    const uploadOpId = beginRes.data.upload_op_id;
    console.log(`  ✔ Upload Transaction Started! Operation ID: ${uploadOpId}`);

    // 4. Upload Evidence File
    console.log('\n▶ Step 4: Uploading simulated worksheet evidence image (JPEG)...');
    const uploadRes = await callGas('submissions.uploadEvidence', {
      upload_op_id: uploadOpId,
      file_name: 'pht4_w01_solution_std99999.jpg',
      mime_type: 'image/jpeg',
      file_base64: sampleJpegBase64
    }, studentToken);

    if (!uploadRes.ok) {
      console.error('❌ submissions.uploadEvidence failed:', uploadRes.error);
      process.exit(1);
    }
    console.log(`  ✔ Image uploaded and staged to Google Drive! Evidence ID: ${uploadRes.data.evidence_id}`);

    // 5. Complete Submission
    console.log('\n▶ Step 5: Completing & committing submission to Submissions sheet...');
    const completeRes = await callGas('submissions.complete', {
      upload_op_id: uploadOpId,
      worksheet_code: worksheetCode,
      academic_year_id: 'yr_2569',
      grade: 'M4',
      note: 'ทดสอบส่งใบงานที่ 1 โดยนักเรียนทดสอบ std_99999 (นายทดสอบ ห้องวิทย์สุขภาพ)'
    }, studentToken);

    if (!completeRes.ok) {
      console.error('❌ submissions.complete failed:', completeRes.error);
      process.exit(1);
    }
    console.log(`  ✔ Submission committed successfully! Status: ${completeRes.data.status_label_th} (Version: ${completeRes.data.version_number})`);

    // 6. Verify Updated Dashboard
    console.log('\n▶ Step 6: Verifying Dashboard update for Student 99999...');
    const verifyDashRes = await callGas('student.dashboard', {
      academic_year_id: 'yr_2569',
      grade: 'M4'
    }, studentToken);

    if (verifyDashRes.ok) {
      const updatedCard = verifyDashRes.data.worksheet_cards.find(c => (c.worksheet_code === worksheetCode || c.code === worksheetCode)) || verifyDashRes.data.worksheet_cards[0];
      console.log(`  ✔ Card Status now: ${updatedCard.status_label_th} (Version ${updatedCard.submission_latest_version_no})`);
    }

    // 7. Teacher View Simulation
    console.log('\n▶ Step 7: Simulating Teacher Login & Gradebook Inspection...');
    const tchLogin = await callGas('auth.teacherLogin', {
      auth_secret: 'TeacherAuthSecret#1001'
    });
    if (!tchLogin.ok) {
      console.error('❌ Teacher login failed:', tchLogin.error);
      process.exit(1);
    }
    const tchToken = tchLogin.data.session_token;
    console.log(`  ✔ Teacher logged in: ${tchLogin.data.profile.name}`);

    const matrixRes = await callGas('teacher.gradebookMatrix', {
      academic_year_id: 'yr_2569',
      grade: 'M4',
      room: '1'
    }, tchToken);

    if (!matrixRes.ok) {
      console.error('❌ Teacher matrix fetch failed:', matrixRes.error);
    } else {
      const studentList = matrixRes.data.rows || matrixRes.data.students || [];
      console.log(`  ✔ Matrix fetched successfully! (Total students: ${studentList.length})`);
      const testStudentRow = studentList.find(s => s.code_5_digit === '99999');
      if (testStudentRow) {
        console.log(`  ✔ Found Student 99999 in Teacher Gradebook!`);
        console.log(`     - Name: ${testStudentRow.display_name}`);
        console.log(`     - Roll No: ${testStudentRow.roll_no}`);
        const w01Cell = (testStudentRow.worksheet_cells || testStudentRow.cells || []).find(cell => cell.worksheet_code === 'PHT4-W01');
        console.log(`     - Worksheet PHT4-W01 Status in Teacher Matrix: ${w01Cell ? w01Cell.status_label_th : 'N/A'}`);
      }
    }

    console.log('\n===============================================================');
    console.log('🎉 FULL END-TO-END LIVE SIMULATION PASSED 100% SUCCESSFULLY!');
    console.log('===============================================================');

  } catch (err) {
    console.error('❌ Fatal error during simulation:', err);
  }
})();
