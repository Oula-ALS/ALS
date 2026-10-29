// PATCH /api/teacher/writings {id, feedback, stars, status} → teacher reviews a writing.
import { json, readBody } from "@/lib/server/http";
import { isUuid } from "@/lib/server/students";
import { isTeacher } from "@/lib/server/teacher-auth";
import { writingsTable } from "@/lib/server/writings";

export async function PATCH(req: Request) {
  if (!isTeacher(req)) return json(401, { error: "login_required" });
  const body = await readBody(req);
  if (!body || !isUuid(body.id)) return json(400, { error: "bad_request" });
  const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 3000) : "";
  const stars = body.stars === null ? null : Number(body.stars);
  const status = body.status === "reviewed" ? "reviewed" : "new";
  if (stars !== null && ![1, 2, 3].includes(stars)) return json(422, { error: "invalid_stars" });
  const t = writingsTable();
  if (!t) return json(503, { error: "not_configured" });
  try {
    const rows = await t.update(
      { id: body.id },
      { feedback: feedback || null, stars, status, reviewed_at: status === "reviewed" ? new Date().toISOString() : null },
    );
    return rows.length ? json(200, { ok: true, writing: rows[0] }) : json(404, { error: "not_found" });
  } catch {
    return json(502, { error: "database_error" });
  }
}
