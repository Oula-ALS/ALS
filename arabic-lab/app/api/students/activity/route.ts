// POST /api/students/activity → the app reports the student's XP and streak,
// so the teacher's table can show them. Needs the student's id + private token.

import { json, rateLimited, readBody } from "@/lib/server/http";
import { isUuid, studentStore } from "@/lib/server/students";

const count = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(Math.round(v), 10_000_000)) : null);

export async function POST(req: Request) {
  if (rateLimited(req, "activity", 120)) return json(429, { error: "too_many_requests" });
  const body = await readBody(req);
  const xp = count(body?.xp);
  const streak = count(body?.streak);
  if (!body || !isUuid(body.id) || typeof body.token !== "string" || xp === null || streak === null) {
    return json(400, { error: "bad_request" });
  }
  const store = studentStore();
  if (!store) return json(503, { error: "not_configured" });
  try {
    const ok = await store.recordActivity(body.id, body.token, xp, streak);
    return ok ? json(200, { ok: true }) : json(404, { error: "not_found" });
  } catch {
    return json(502, { error: "database_error" });
  }
}
