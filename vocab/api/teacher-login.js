// POST /api/teacher-login { passcode } — checks the teacher passcode.
//
// Vercel environment variable (Project → Settings → Environment Variables):
//   TEACHER_PASSCODE   the passcode teachers type on /teacher
//
// The passcode keeps students out of the review page. The sentences themselves are
// not secret (approved ones are shown to every student).
import { timingSafeEqual, createHash } from "node:crypto";

const attempts = new Map(); // ip → { count, since }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRIES = 10;

function tooMany(ip) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now - a.since > WINDOW_MS) {
    attempts.set(ip, { count: 1, since: now });
    return false;
  }
  a.count++;
  return a.count > MAX_TRIES;
}

const digest = (s) => createHash("sha256").update(String(s)).digest();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const expected = process.env.TEACHER_PASSCODE;
  if (!expected) return res.status(503).json({ error: "not_set_up" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "too_many_tries" });

  const given = typeof req.body === "object" && req.body ? req.body.passcode : "";
  const ok = typeof given === "string" && given.length > 0 && timingSafeEqual(digest(given), digest(expected));
  return ok ? res.status(200).json({ ok: true }) : res.status(401).json({ error: "wrong_passcode" });
}
