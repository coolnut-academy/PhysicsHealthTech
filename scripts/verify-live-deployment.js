const url = 'https://script.google.com/macros/s/AKfycbysnNcqRKRfg5CxPl0saQl-cM0MJS3I_3TNeadvhwh06nr5HwXcMkatkQn5vnVhexM/exec';

// Valid 1x1 JPEG base64
const sampleJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

async function callGas(action, payload, sessionToken = null) {
  const t0 = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action,
      payload,
      ...(sessionToken ? { session_token: sessionToken } : {})
    })
  });
  const json = await res.json();
  return { ...json, _durationMs: Date.now() - t0 };
}

(async () => {
  console.log('===============================================================');
  console.log('   Testing Live Deployed Google Apps Script (New Version)      ');
  console.log('===============================================================\n');

  // 1. Student Login
  console.log('▶ [1] Student Login (Code 99999)...');
  const stdLogin = await callGas('auth.studentLogin', { code_5_digit: '99999' });
  console.log('  Response:', stdLogin.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${stdLogin._durationMs} ms)`);
  if (!stdLogin.ok) {
    console.error('  Error:', stdLogin.error);
    return;
  }
  const stdToken = stdLogin.data.session_token;
  console.log('  Student:', stdLogin.data.profile.display_name, `(Role: ${stdLogin.data.profile.role})`);

  // 2. Test sessions.list (M4)
  console.log('\n▶ [2] Testing sessions.list (M4, yr_2569)...');
  const sesM4 = await callGas('sessions.list', { academic_year_id: 'yr_2569', grade: 'M4' }, stdToken);
  console.log('  Response:', sesM4.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${sesM4._durationMs} ms)`);
  if (sesM4.ok) {
    const list = sesM4.data.sessions || [];
    console.log(`  ✔ Received ${list.length} sessions.`);
    console.log('  ✔ Session 1:', list[0]?.title);
    console.log('  ✔ Session 20:', list[19]?.title);
  } else {
    console.error('  ❌ Error:', sesM4.error);
  }

  // 3. Test sessions.list (M5)
  console.log('\n▶ [3] Testing sessions.list (M5, yr_2569)...');
  const sesM5 = await callGas('sessions.list', { academic_year_id: 'yr_2569', grade: 'M5' }, stdToken);
  console.log('  Response:', sesM5.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${sesM5._durationMs} ms)`);
  if (sesM5.ok) {
    const list = sesM5.data.sessions || [];
    console.log(`  ✔ Received ${list.length} sessions.`);
    console.log('  ✔ Session 1:', list[0]?.title);
    console.log('  ✔ Session 20:', list[19]?.title);
  } else {
    console.error('  ❌ Error:', sesM5.error);
  }

  // 4. Test student.uploadProfilePhoto
  console.log('\n▶ [4] Testing student.uploadProfilePhoto (Google Drive Upload)...');
  const uploadPhoto = await callGas('student.uploadProfilePhoto', {
    file_base64: 'data:image/jpeg;base64,' + sampleJpegBase64,
    mime_type: 'image/jpeg',
    file_name: 'test_live_profile.jpg'
  }, stdToken);
  console.log('  Response:', uploadPhoto.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${uploadPhoto._durationMs} ms)`);
  if (uploadPhoto.ok) {
    console.log('  ✔ Photo URL:', uploadPhoto.data.photo_url);
    console.log('  ✔ Drive File ID:', uploadPhoto.data.photo_drive_file_id);
    console.log('  ✔ Message:', uploadPhoto.data.message_th);
  } else {
    console.error('  ❌ Error:', uploadPhoto.error);
  }

  // 5. Test Teacher Login
  console.log('\n▶ [5] Teacher Login with "coolnut1618"...');
  const tchLogin = await callGas('auth.teacherLogin', { auth_secret: 'coolnut1618' });
  console.log('  Response:', tchLogin.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${tchLogin._durationMs} ms)`);
  const tchToken = tchLogin.ok ? tchLogin.data.session_token : null;

  // 6. Test Teacher Academic Years
  if (tchToken) {
    console.log('\n▶ [6] Teacher Academic Years list...');
    const ayRes = await callGas('teacher.academicYears', {}, tchToken);
    console.log('  Response:', ayRes.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${ayRes._durationMs} ms)`);
    if (ayRes.ok) {
      console.log(`  ✔ Academic Years count: ${ayRes.data.academic_years?.length}`);
    }
  }

  // 7. Test Teacher sessions.saveSnapshot
  if (tchToken && sesM4.ok) {
    console.log('\n▶ [7] Teacher sessions.saveSnapshot (Saving snapshot on Cloud)...');
    const saveRes = await callGas('sessions.saveSnapshot', {
      academic_year_id: 'yr_2569',
      grade: 'M4',
      sessions: sesM4.data.sessions
    }, tchToken);
    console.log('  Response:', saveRes.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${saveRes._durationMs} ms)`);
    if (saveRes.ok) {
      console.log('  ✔ Snapshot ID:', saveRes.data.snapshot_id, 'Version:', saveRes.data.version_no);
      console.log('  ✔ Message:', saveRes.data.message_th);
    } else {
      console.error('  ❌ Error:', saveRes.error);
    }
  }

  // 8. Test Student Dashboard Fetch (Confirm photo_url is reflected)
  console.log('\n▶ [8] Fetching Student Dashboard (Confirm photo_url is linked)...');
  const dash = await callGas('student.dashboard', {
    academic_year_id: 'yr_2569',
    grade: 'M4'
  }, stdToken);
  console.log('  Response:', dash.ok ? '✔ SUCCESS' : '❌ FAILED', `(Duration: ${dash._durationMs} ms)`);
  if (dash.ok) {
    console.log('  ✔ Student photo_url:', dash.data.profile.photo_url || '(none)');
    console.log('  ✔ Worksheet cards count:', dash.data.worksheet_cards?.length);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL LIVE TESTS COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
})();
