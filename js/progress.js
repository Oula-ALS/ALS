// Student profiles, learning progress and settings, saved in this browser (localStorage).
// Each student has their own record, so several students can share one device.
// Registration details are ALSO sent to Alsama by js/register.js; learning
// progress stays separate and is not sent.

const KEY = 'alsama.v1';

function blank() {
  return {
    students: [],
    currentStudentId: null,
    settings: { muted: false, musicOn: true, musicVolume: 0.5 },
    progress: {},   // per student id: learning progress (kept apart from registration details)
  };
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && Array.isArray(data.students)) {
      return {
        ...blank(), ...data,
        settings: { ...blank().settings, ...data.settings },
        progress: data.progress || {},
      };
    }
  } catch (e) { /* storage unavailable or corrupted: start fresh */ }
  return blank();
}

let state = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Could not save progress', e);
    return false;
  }
}

function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ---- Students -----------------------------------------------------------

export function getStudents() {
  return [...state.students];
}

export function getStudent(id) {
  return state.students.find(s => s.id === id) || null;
}

export function getCurrentStudent() {
  return getStudent(state.currentStudentId);
}

export function setCurrentStudent(id) {
  state.currentStudentId = getStudent(id) ? id : null;
  save();
}

// fields: { firstName, nickname, birthday: {day, month} | null, favouriteWord, address: 'm' | 'f' | 'n',
//           registration: { ageGroup, country, nativeLanguage, level, email, parentConsent } }
export function saveStudent(fields, id) {
  const clean = {
    firstName: String(fields.firstName || '').trim().slice(0, 40),
    nickname: String(fields.nickname || '').trim().slice(0, 40),
    birthday: fields.birthday || null,
    favouriteWord: String(fields.favouriteWord || '').trim().slice(0, 40),
    address: ['m', 'f'].includes(fields.address) ? fields.address : 'n',
  };
  if (fields.registration) clean.registration = fields.registration;
  if (!clean.firstName) throw new Error('First name is required');

  let student = id && getStudent(id);
  if (student) {
    Object.assign(student, clean, { updatedAt: new Date().toISOString() });
  } else {
    student = { id: newId(), ...clean, createdAt: new Date().toISOString() };
    state.students.push(student);
  }
  state.currentStudentId = student.id;
  if (!save()) throw new Error('This browser could not save. Private browsing may be on.');
  return student;
}

// After the server confirms registration: { id, deleteToken, status: 'sent' | 'pending' }
export function setRemote(studentId, remote) {
  const s = getStudent(studentId);
  if (!s) return;
  s.remote = { ...s.remote, ...remote };
  save();
}

export function deleteStudent(id) {
  state.students = state.students.filter(s => s.id !== id);
  delete state.progress[id];
  if (state.currentStudentId === id) state.currentStudentId = null;
  save();
}

// Name to greet the student with: nickname if they gave one.
export function displayName(student) {
  return student ? (student.nickname || student.firstName) : '';
}

export function isBirthdayToday(student) {
  if (!student || !student.birthday) return false;
  const now = new Date();
  return student.birthday.day === now.getDate() && student.birthday.month === now.getMonth() + 1;
}

// ---- Learning progress (separate from personal details) -------------------

export function getProgress(studentId) {
  const p = state.progress[studentId] || {};
  return { lettersHeard: p.lettersHeard || [], lastLetter: p.lastLetter || 1, alphabetDone: Boolean(p.alphabetDone) };
}

export function updateProgress(studentId, changes) {
  if (!getStudent(studentId)) return;
  state.progress[studentId] = { ...getProgress(studentId), ...changes, updatedAt: new Date().toISOString() };
  save();
}

// ---- Settings -----------------------------------------------------------

export function getSettings() {
  return { ...state.settings };
}

export function setMuted(muted) {
  state.settings.muted = Boolean(muted);
  save();
}

export function setMusic({ on, volume }) {
  if (on !== undefined) state.settings.musicOn = Boolean(on);
  if (volume !== undefined) state.settings.musicVolume = Math.min(1, Math.max(0, Number(volume) || 0));
  save();
}
