// Sends a learner's registration to Alsama (via /api/register on Vercel).
// If the learner is offline, it is kept as "pending" and sent next time.
// Learning progress is never sent — only the registration details.

import * as store from './progress.js';

function payload(student) {
  const r = student.registration || {};
  return {
    learnerId: student.id,
    firstName: student.firstName,
    nickname: student.nickname,
    ageGroup: r.ageGroup,
    country: r.country,
    nativeLanguage: r.nativeLanguage,
    level: r.level,
    email: r.email,
    parentConsent: r.parentConsent === true,
  };
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data = {};
  try { data = await res.json(); } catch (e) { /* not JSON, e.g. no server yet */ }
  return { status: res.status, data };
}

// Returns 'sent' | 'updated' | 'already' | 'pending' | 'invalid'
export async function sendRegistration(student) {
  const remote = student.remote || {};
  const body = payload(student);
  if (remote.id && remote.token) Object.assign(body, { registrationId: remote.id, token: remote.token });

  let r;
  try {
    r = await post('api/register', body);
  } catch (e) {
    store.setRemote(student.id, { status: 'pending' });   // offline
    return 'pending';
  }

  if (r.status === 201 && r.data.id) {
    store.setRemote(student.id, { status: 'sent', id: r.data.id, token: r.data.token });
    return 'sent';
  }
  if (r.status === 200 && r.data.updated) {
    store.setRemote(student.id, { status: 'sent' });
    return 'updated';
  }
  if (r.status === 409) {
    store.setRemote(student.id, { status: 'sent', note: r.data.error });
    return 'already';
  }
  if (r.status === 422) return 'invalid';
  store.setRemote(student.id, { status: 'pending' });     // server not ready / busy
  return 'pending';
}

// Try again for any learner whose registration hasn't reached Alsama yet.
export async function sendPendingRegistrations() {
  for (const s of store.getStudents()) {
    if (s.registration && (!s.remote || s.remote.status === 'pending')) await sendRegistration(s);
  }
}

// Tell the school a registered learner is learning today (at most once a day per learner).
export async function notifyLogin(student) {
  const remote = (student && student.remote) || {};
  if (!remote.id || !remote.token) return 'not-registered';
  const day = new Date().toISOString().slice(0, 10);
  if (remote.loginNotified === day) return 'already-today';
  try {
    const r = await post('api/notify-login', { id: remote.id, token: remote.token });
    if (r.status === 200 && ['sent', 'already_today'].includes(r.data.notification)) {
      store.setRemote(student.id, { loginNotified: day });
      return 'sent';
    }
  } catch (e) { /* offline: try again next time */ }
  return 'not-sent';
}

// Returns 'deleted' | 'nothing-to-delete' | 'failed'
export async function deleteRegistration(student) {
  const remote = student.remote || {};
  if (!remote.id || !remote.token) return 'nothing-to-delete';
  try {
    const r = await post('api/delete-registration', { id: remote.id, token: remote.token });
    if (r.status === 200 || r.status === 404) return 'deleted';
  } catch (e) { /* offline */ }
  return 'failed';
}
