// Student profiles and settings, saved in this browser only (localStorage).
// Each student has their own record, so several students can share one device.
// The shape is ready to move to a Supabase "students" table later.

const KEY = 'alsama.v1';

function blank() {
  return { students: [], currentStudentId: null, settings: { muted: false } };
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && Array.isArray(data.students)) {
      return { ...blank(), ...data, settings: { ...blank().settings, ...data.settings } };
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

// fields: { firstName, nickname, birthday: {day, month} | null, favouriteWord, address: 'm' | 'f' | 'n' }
export function saveStudent(fields, id) {
  const clean = {
    firstName: String(fields.firstName || '').trim().slice(0, 40),
    nickname: String(fields.nickname || '').trim().slice(0, 40),
    birthday: fields.birthday || null,
    favouriteWord: String(fields.favouriteWord || '').trim().slice(0, 40),
    address: ['m', 'f'].includes(fields.address) ? fields.address : 'n',
  };
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

export function deleteStudent(id) {
  state.students = state.students.filter(s => s.id !== id);
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

// ---- Settings -----------------------------------------------------------

export function getSettings() {
  return { ...state.settings };
}

export function setMuted(muted) {
  state.settings.muted = Boolean(muted);
  save();
}
