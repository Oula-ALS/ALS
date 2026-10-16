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
  return {
    lettersHeard: p.lettersHeard || [],
    lastLetter: p.lastLetter || 1,
    alphabetDone: Boolean(p.alphabetDone),
    practice: p.practice || {},   // per letter: { ok, miss, last } — used later for review suggestions
    log: p.log || [],             // every finished exercise: { d, k, item, ok, ex }
    writing: p.writing || {},     // per date: { ids: [exercise ids counted], words: n }
    daily: p.daily || {},         // per date: true when the Daily Challenge was finished
  };
}

export function updateProgress(studentId, changes) {
  if (!getStudent(studentId)) return;
  state.progress[studentId] = { ...getProgress(studentId), ...changes, updatedAt: new Date().toISOString() };
  save();
}

// ---- Activity tracking (only real, finished activity is counted) -----------

const MAX_LOG = 3000;
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// kind: 'letter' | 'short' | 'long' | 'write' | 'listen' | 'speak' | 'game'
// item: what was practised (a letter, syllable or word); ok: right on the first try.
export function logActivity(studentId, { kind, item, ok, ex }) {
  const p = getProgress(studentId);
  const log = [...p.log, { d: today(), k: kind, item, ok: Boolean(ok), ex }].slice(-MAX_LOG);
  updateProgress(studentId, { log });
}

// Counting rule for "words written": a word counts only when the answer is correct,
// and each exercise counts once per day, however many times it is submitted.
export function countWrittenWords(studentId, exerciseId, wordCount) {
  const p = getProgress(studentId);
  const day = today();
  const entry = p.writing[day] || { ids: [], words: 0 };
  if (entry.ids.includes(exerciseId)) return { counted: false, total: entry.words };
  const next = { ids: [...entry.ids, exerciseId], words: entry.words + wordCount };
  updateProgress(studentId, { writing: { ...p.writing, [day]: next } });
  return { counted: true, total: next.words };
}

export function markDailyChallenge(studentId) {
  const p = getProgress(studentId);
  updateProgress(studentId, { daily: { ...p.daily, [today()]: true } });
}

export function stats(studentId) {
  const p = getProgress(studentId);
  const day = today();
  const todays = p.log.filter(e => e.d === day);
  const uniqueOk = kind => new Set(p.log.filter(e => e.k === kind && e.ok && e.item).map(e => e.item)).size;
  const count = (list, kind) => list.filter(e => e.k === kind).length;
  return {
    today: {
      exercises: todays.filter(e => e.k !== 'game').length,
      correct: todays.filter(e => e.ok && e.k !== 'game').length,
      words: (p.writing[day] || { words: 0 }).words,
      writing: count(todays, 'write'),
      listening: count(todays, 'listen'),
      speaking: count(todays, 'speak'),
      games: count(todays, 'game'),
      dailyDone: Boolean(p.daily[day]),
    },
    total: {
      exercises: p.log.filter(e => e.k !== 'game').length,
      lettersHeard: p.lettersHeard.length,
      lettersKnown: uniqueOk('letter'),
      shortSounds: uniqueOk('short'),
      longSounds: uniqueOk('long'),
      writing: count(p.log, 'write'),
      listening: count(p.log, 'listen'),
      speaking: count(p.log, 'speak'),
      games: count(p.log, 'game'),
    },
    // Correct answers in exercises that compare short and long sounds.
    shortLongCorrect: p.log.filter(e => e.ok && /(^|:)(short-long|compare-long)/.test(e.ex || '')).length,
    writingByDay: Object.entries(p.writing).map(([d, v]) => ({ d, words: v.words })).sort((a, b) => a.d.localeCompare(b.d)),
    // Items answered wrong recently and not yet answered right since — for Review.
    toReview: (() => {
      const last = new Map();
      p.log.forEach(e => { if (e.item) last.set(e.k + '|' + e.item, e); });
      return [...last.values()].filter(e => !e.ok).map(e => ({ kind: e.k, item: e.item }));
    })(),
  };
}

// Difficulty level from real results: 1 letters → 2 syllables → 3 words → 4 sentences.
export function level(studentId) {
  const t = stats(studentId).total;
  if (t.shortSounds + t.longSounds >= 12 && t.writing >= 8) return 4;
  if (t.shortSounds + t.longSounds >= 12) return 3;
  if (t.lettersKnown >= 8) return 2;
  return 1;
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
