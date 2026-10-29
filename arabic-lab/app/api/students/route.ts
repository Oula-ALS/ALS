// POST   /api/students  → register a new student, email the teacher
// PATCH  /api/students  → update details (needs the id + private token from POST)
// DELETE /api/students  → delete details and writings (same id + token)

import { choiceLabel, validateProfile, type Profile } from "@/lib/registration";
import { GENDERS, LEVELS } from "@/lib/profile-options";
import { emailTeacher } from "@/lib/server/email";
import { json, rateLimited, readBody } from "@/lib/server/http";
import { isUuid, newToken, studentStore } from "@/lib/server/students";
import { writingsTable } from "@/lib/server/writings";

function emailRows(p: Profile): Array<[string, string]> {
  return [
    ["Name", p.name],
    ["Email", p.email],
    ["Gender", GENDERS.find((g) => g.id === p.gender)?.en ?? p.gender],
    ["From", p.from],
    ["Level", LEVELS.find((l) => l.id === p.level)?.en ?? p.level],
    ["Favourite travel destination", choiceLabel(p.travel)],
    ["Favourite hobby", choiceLabel(p.hobby)],
    ["Favourite animal", choiceLabel(p.animal)],
    ["Dream", choiceLabel(p.dream)],
    ["Registered", new Date().toLocaleString("en-GB", { timeZone: "Asia/Beirut" }) + " (Beirut)"],
  ];
}

export async function POST(req: Request) {
  if (rateLimited(req, "students")) return json(429, { error: "too_many_requests" });
  const body = await readBody(req);
  if (!body) return json(400, { error: "bad_request" });
  if (body.website) return json(201, { ok: true }); // hidden field that only bots fill in

  const store = studentStore();
  if (!store) return json(503, { error: "not_configured" });

  const { profile, errors } = validateProfile(body);
  if (errors.length) return json(422, { error: "invalid", fields: errors });

  const token = newToken();
  try {
    const { id } = await store.create(profile, token);
    const email = await emailTeacher(
      `New Alsama student: ${profile.name}`,
      "A new student joined Alsama Arabic Lab",
      emailRows(profile),
    );
    return json(201, { ok: true, id, token, profile, email: email.sent });
  } catch {
    return json(502, { error: "database_error" });
  }
}

export async function PATCH(req: Request) {
  if (rateLimited(req, "students")) return json(429, { error: "too_many_requests" });
  const body = await readBody(req);
  if (!body || !isUuid(body.id) || typeof body.token !== "string") {
    return json(400, { error: "bad_request" });
  }
  const store = studentStore();
  if (!store) return json(503, { error: "not_configured" });

  const { profile, errors } = validateProfile(body);
  if (errors.length) return json(422, { error: "invalid", fields: errors });

  try {
    const ok = await store.update(body.id, body.token, profile);
    return ok ? json(200, { ok: true, profile }) : json(404, { error: "not_found" });
  } catch {
    return json(502, { error: "database_error" });
  }
}

export async function DELETE(req: Request) {
  const body = await readBody(req);
  if (!body || !isUuid(body.id) || typeof body.token !== "string") {
    return json(400, { error: "bad_request" });
  }
  const store = studentStore();
  if (!store) return json(503, { error: "not_configured" });
  try {
    const ok = await store.remove(body.id, body.token);
    if (ok) await writingsTable()?.remove({ student_id: body.id }); // their writings go too
    return ok ? json(200, { ok: true }) : json(404, { error: "not_found" });
  } catch {
    return json(502, { error: "database_error" });
  }
}
