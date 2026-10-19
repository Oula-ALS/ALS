// POST /api/notify-login — emails the school when a registered learner logs in
// (opens the app or picks their name on "Who's learning today?").
//
// Only real registered learners can trigger it: the app proves who it is with the
// private token it received at registration. At most one email per learner per day.
// Needs the same Vercel variables as registration, plus RESEND_API_KEY and NOTIFY_EMAIL.

const { send, readJson, rateLimited, supabaseConfig, db, hash, notifySchool } = require('./_shared');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const lastSent = new Map(); // registration id → date (best effort, per server instance)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (rateLimited(req, 60)) return send(res, 429, { error: 'too_many_requests' });

  let body;
  try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'bad_json' }); }

  const config = supabaseConfig();
  if (!config) return send(res, 503, { error: 'not_configured' });
  if (!UUID_RE.test(String(body.id)) || !body.token) return send(res, 422, { error: 'invalid' });

  const today = new Date().toISOString().slice(0, 10);
  if (lastSent.get(body.id) === today) return send(res, 200, { ok: true, notification: 'already_today' });

  const r = await db(config,
    `registrations?id=eq.${body.id}&delete_token_hash=eq.${hash(body.token)}&select=first_name,nickname,age_group,country,arabic_level`,
    { method: 'GET' });
  if (!r.ok) return send(res, 502, { error: 'database_error' });
  const learner = Array.isArray(r.data) && r.data[0];
  if (!learner) return send(res, 404, { error: 'not_found' });

  const notification = await notifySchool(`Learner logged in: ${learner.first_name}`, 'An Alsama Arabic learner is learning now', [
    ['Name', learner.first_name], ['Nickname', learner.nickname], ['Age group', learner.age_group],
    ['Country', learner.country], ['Arabic level', learner.arabic_level],
    ['Time', new Date().toLocaleString('en-GB', { timeZone: 'Asia/Beirut' }) + ' (Beirut)'],
  ]);
  if (notification === 'sent') lastSent.set(body.id, today);
  return send(res, 200, { ok: true, notification });
};
