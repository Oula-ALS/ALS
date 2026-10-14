// POST /api/delete-registration — lets a learner delete their own registration.
// The app proves it owns the record with the private token it received when
// registering (only a scrambled "hash" of that token is stored in the database).

const { send, readJson, rateLimited, supabaseConfig, db, hash } = require('./_shared');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (rateLimited(req, 20)) return send(res, 429, { error: 'too_many_requests' });

  let body;
  try { body = await readJson(req); } catch (e) { return send(res, 400, { error: 'bad_json' }); }

  const config = supabaseConfig();
  if (!config) return send(res, 503, { error: 'not_configured' });
  if (!UUID_RE.test(String(body.id)) || !body.token) return send(res, 422, { error: 'invalid' });

  const r = await db(config,
    `registrations?id=eq.${body.id}&delete_token_hash=eq.${hash(body.token)}`,
    { method: 'DELETE' });
  if (!r.ok) return send(res, 502, { error: 'database_error' });
  if (!Array.isArray(r.data) || !r.data.length) return send(res, 404, { error: 'not_found' });
  return send(res, 200, { ok: true, deleted: true });
};
