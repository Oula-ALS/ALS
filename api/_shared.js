// Helpers shared by the server functions in /api.
// Files starting with "_" are not public web addresses on Vercel.
// Secrets come ONLY from Vercel environment variables, never from the browser.

const crypto = require('crypto');

const MAX_BODY_BYTES = 4000;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    if (JSON.stringify(req.body).length > MAX_BODY_BYTES) throw new Error('too_large');
    return req.body;
  }
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES) throw new Error('too_large');
  }
  return JSON.parse(raw || '{}');
}

// Basic protection against someone sending lots of requests quickly.
// (Best effort: each Vercel server instance keeps its own count. A whole class on
// one school Wi-Fi shares an address, so the limit is generous.)
const hits = new Map();
function rateLimited(req, limit = 30, windowMs = 10 * 60 * 1000) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

// Calls the Supabase database (PostgREST) with the server-only key.
async function db(config, path, options = {}) {
  const res = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...options.headers,
    },
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  return { ok: res.ok, status: res.status, data };
}

const escHtml = s => String(s ?? '—').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Emails the school (NOTIFY_EMAIL) through Resend. Returns 'sent' | 'failed' | 'not_configured'.
// rows: [[label, value], …] shown as a small table.
async function notifySchool(subject, heading, rows) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return 'not_configured';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM || 'Alsama Arabic <onboarding@resend.dev>',
        to: [to],
        subject,
        html: `<h2>${escHtml(heading)}</h2><table>${rows.map(([k, v]) =>
          `<tr><td><b>${escHtml(k)}</b></td><td>${escHtml(v)}</td></tr>`).join('')}</table>`,
      }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
    return res.ok ? 'sent' : 'failed';
  } catch (e) {
    console.error('Resend unreachable', e);
    return 'failed';
  }
}

const hash = token => crypto.createHash('sha256').update(String(token)).digest('hex');
const newToken = () => crypto.randomBytes(24).toString('base64url');

module.exports = { send, readJson, rateLimited, supabaseConfig, db, hash, newToken, notifySchool };
