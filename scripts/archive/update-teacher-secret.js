const fs = require('fs');
const path = require('path');

// 1. js/mock-backend.js
let mockPath = path.join(__dirname, '..', 'js', 'mock-backend.js');
let mock = fs.readFileSync(mockPath, 'utf8');
mock = mock.replace(/const TEACHERS = \[[\s\S]*?\];/m, 
`const TEACHERS = [
    { teacher_uid: "tch_001", name: "ครูผู้สอน วิชาฟิสิกส์สุขภาพ", email: "teacher.physics@school.ac.th", auth_secret: "coolnut1618", role: "teacher", status: "active" }
  ];`);
fs.writeFileSync(mockPath, mock, 'utf8');
console.log('Updated js/mock-backend.js');

// 2. synthetic-data.js
let synthPath = path.join(__dirname, '..', 'tests', 'fixtures', 'synthetic-data.js');
let synth = fs.readFileSync(synthPath, 'utf8');
synth = synth.replace(/role: "admin"/g, 'role: "teacher"');
fs.writeFileSync(synthPath, synth, 'utf8');
console.log('Updated synthetic-data.js');

// 3. backend/Entry.gs
let entryPath = path.join(__dirname, '..', 'backend', 'Entry.gs');
let entry = fs.readFileSync(entryPath, 'utf8');
entry = entry.replace(/TeacherAuthSecret#1001/g, 'coolnut1618');
entry = entry.replace(/AdminAuthSecret#9999/g, 'coolnut1618');
fs.writeFileSync(entryPath, entry, 'utf8');
console.log('Updated backend/Entry.gs');

// 4. backend/AuthService.gs
let authPath = path.join(__dirname, '..', 'backend', 'AuthService.gs');
let auth = fs.readFileSync(authPath, 'utf8');
auth = auth.replace('role: "admin"', 'role: "teacher"');
fs.writeFileSync(authPath, auth, 'utf8');
console.log('Updated backend/AuthService.gs');

// Re-bundle backend
require('./bundle-backend.js');
console.log('Backend rebundled successfully!');
