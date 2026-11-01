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

  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });

  const duration = Date.now() - t0;
  const json = await res.json();
  return { ...json, _durationMs: duration };
}

(async () => {
  console.log('===============================================================');
  console.log('   Testing Live Deployed GAS Web App & Performance Latency     ');
  console.log('===============================================================\n');
  console.log(`Endpoint: ${url}\n`);

  // 1. Test Teacher Login with coolnut1618
  console.log('▶ Test 1: Teacher Login with "coolnut1618"...');
  const tchLogin = await callGas('auth.teacherLogin', {
    auth_secret: 'coolnut1618'
  });
  console.log(`  Duration: ${tchLogin._durationMs} ms`);
  if (!tchLogin.ok) {
    console.error('  ❌ Teacher login with coolnut1618 failed:', tchLogin.error);
  } else {
    console.log(`  ✔ Teacher login SUCCESS: ${tchLogin.data.profile.name || tchLogin.data.profile.email} (Role: ${tchLogin.data.profile.role})`);
  }

  // 2. Test Student Login (std_99999)
  console.log('\n▶ Test 2: Student Login (Code 99999)...');
  const stdLogin = await callGas('auth.studentLogin', {
    code_5_digit: '99999'
  });
  console.log(`  Duration: ${stdLogin._durationMs} ms`);
  if (!stdLogin.ok) {
    console.error('  ❌ Student login failed:', stdLogin.error);
  } else {
    console.log(`  ✔ Student login SUCCESS: ${stdLogin.data.profile.display_name} (${stdLogin.data.profile.grade}/${stdLogin.data.profile.room} #${stdLogin.data.profile.roll_no})`);
  }

  const studentToken = stdLogin.ok ? stdLogin.data.session_token : null;
  const teacherToken = tchLogin.ok ? tchLogin.data.session_token : null;

  // 3. Test Student Dashboard Fetch
  if (studentToken) {
    console.log('\n▶ Test 3: Fetching Student Dashboard...');
    const dash = await callGas('student.dashboard', {
      academic_year_id: 'yr_2569',
      grade: 'M4'
    }, studentToken);
    console.log(`  Duration: ${dash._durationMs} ms`);
    if (!dash.ok) {
      console.error('  ❌ Dashboard fetch failed:', dash.error);
    } else {
      const cards = dash.data.worksheet_cards || [];
      console.log(`  ✔ Dashboard fetched SUCCESS! Received ${cards.length} worksheets.`);
      console.log(`  ✔ Score Summary: Earned ${dash.data.score_summary?.graded_earned_points || 0}, Accumulated: ${dash.data.score_summary?.accumulated_points_capped_100 || 0}`);
    }

    // 4. Test Single-Roundtrip Batch Upload
    console.log('\n▶ Test 4: Testing Single-Roundtrip Batch Upload (submissions.submitBatch)...');
    const batchRes = await callGas('submissions.submitBatch', {
      worksheet_code: 'PHT4-W01',
      academic_year_id: 'yr_2569',
      grade: 'M4',
      note: 'Live batch test submission from automated verifier',
      files: [
        {
          file_name: 'batch_test_p1.jpg',
          mime_type: 'image/jpeg',
          file_base64: sampleJpegBase64
        }
      ]
    }, studentToken);
    console.log(`  Duration: ${batchRes._durationMs} ms`);
    if (!batchRes.ok) {
      console.error('  ❌ Batch upload failed:', batchRes.error);
    } else {
      console.log(`  ✔ Batch Upload SUCCESS! Status: ${batchRes.data.status_label_th || 'OK'} (Version ${batchRes.data.version_number || batchRes.data.version_no})`);
    }
  }

  // 5. Test Teacher Gradebook Matrix
  if (teacherToken) {
    console.log('\n▶ Test 5: Teacher Gradebook Matrix...');
    const matrixRes = await callGas('teacher.gradebookMatrix', {
      academic_year_id: 'yr_2569',
      grade: 'M4',
      room: '1'
    }, teacherToken);
    console.log(`  Duration: ${matrixRes._durationMs} ms`);
    if (!matrixRes.ok) {
      console.error('  ❌ Teacher matrix failed:', matrixRes.error);
    } else {
      const studentCount = (matrixRes.data.rows || matrixRes.data.students || []).length;
      console.log(`  ✔ Teacher Matrix SUCCESS! Fetched matrix with ${studentCount} students.`);
    }
  }

  console.log('\n===============================================================');
  console.log('                Live Test Run Finished                         ');
  console.log('===============================================================');
})();

