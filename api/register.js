// POST /api/register — saves a new learner's registration in Supabase and,
// if configured, emails the school. Also updates an existing registration
// when the app sends its registration id + private token.
//
// Vercel environment variables (Project → Settings → Environment Variables):
//   SUPABASE_URL               e.g. https://abcd1234.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  secret — never put this in the website files
//   RESEND_API_KEY             optional, for the email notification
//   NOTIFY_EMAIL               optional, who receives the notification
//   NOTIFY_FROM                optional, e.g. "Alsama Arabic <app@alsamaproject.com>"

const { send, readJson, rateLimited, supabaseConfig, db, hash, newToken, notifySchool } = require('./_shared');

const AGE_GROUPS = ['under13', '13-17', '18plus'];
const LEVELS = ['new', 'some-letters', 'read-a-little', 'speak-a-little', 'not-sure'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const text = (v, max) => {
  const s = String(v ?? '').replace(/[\u0000-\u001f]/g, '').trim();
  return s ? s.slice(0, max) : null;
};

function validate(body) {
  const r = {
    device_learner_id: text(body.learnerId, 80),
    first_name: text(body.firstName, 40),
    nickname: text(body.nickname, 40),
    age_group: body.ageGroup,
    country: text(body.country, 60),
    native_language: text(body.nativeLanguage, 60),
    arabic_level: body.level || null,
    email: text(body.email, 254),
    parent_consent: body.parentConsent === true,
  };
  if (r.email) r.email = r.email.toLowerCase();
  const errors = [];
  if (!r.device_learner_id) errors.push('learnerId');
  if (!r.first_name) errors.push('firstName');
  if (!AGE_GROUPS.includes(r.age_group)) errors.push('ageGroup');
  if (r.arabic_level && !LEVELS.includes(r.arabic_level)) errors.push('level');
  if (r.email && !EMAIL_RE.test(r.email)) errors.push('email');
  if (r.age_group === 'under13' && !r.parent_consent) errors.push('parentConsent');
  return { record: r, errors };
}

async function notify(record) {
  return notifySchool(`New learner: ${record.first_name}`, 'New Alsama Arabic learner', [
    ['Name', record.first_name], ['Nickname', record.nickname], ['Age group', record.age_group],
    ['Country', record.country], ['Native language', record.native_language],
    ['Arabic level', record.arabic_level], ['Email', record.email],
    ['Parent consent', record.parent_consent ? 'yes' : 'not needed / no'],
    ['Time', new Date().toLocaleString('en-GB', { timeZone: 'Asia/Beirut' }) + ' (Beirut)'],
  ]);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (rateLimited(req)) return send(res, 429, { error: 'too_many_requests' });

  let body;
  try { body = await readJson(req); } catch (e) {
    return send(res, 400, { error: e.message === 'too_large' ? 'too_large' : 'bad_json' });
  }
  if (body.website) return send(res, 200, { ok: true }); // hidden field only bots fill in

  const config = supabaseConfig();
  if (!config) return send(res, 503, { error: 'not_configured' });

  const { record, errors } = validate(body);
  if (errors.length) return send(res, 422, { error: 'invalid', fields: errors });

  // Update an existing registration (learner edited their details).
  if (body.registrationId && body.token) {
    if (!/^[0-9a-f-]{36}$/i.test(String(body.registrationId))) return send(res, 422, { error: 'invalid' });
    const { device_learner_id, ...changes } = record;
    const r = await db(config,
      `registrations?id=eq.${encodeURIComponent(body.registrationId)}&delete_token_hash=eq.${hash(body.token)}`,
      { method: 'PATCH', body: JSON.stringify({ ...changes, updated_at: new Date().toISOString() }) });
    if (r.ok && Array.isArray(r.data) && r.data.length) return send(res, 200, { ok: true, updated: true });
    if (r.status === 409) return send(res, 409, { error: 'email_exists' });
    return send(res, r.ok ? 404 : 502, { error: r.ok ? 'not_found' : 'database_error' });
  }

  // New registration.
  const token = newToken();
  const r = await db(config, 'registrations?select=id', {
    method: 'POST',
    body: JSON.stringify({ ...record, delete_token_hash: hash(token) }),
  });

  if (r.status === 409 || (r.data && r.data.code === '23505')) {
    const msg = JSON.stringify(r.data || '');
    return send(res, 409, { error: msg.includes('email') ? 'email_exists' : 'already_registered' });
  }
  if (!r.ok || !Array.isArray(r.data) || !r.data[0]) {
    console.error('Supabase insert failed', r.status, r.data);
    return send(res, 502, { error: 'database_error' });
  }

  const notification = await notify(record);
  return send(res, 201, { ok: true, id: r.data[0].id, token, notification });
};
