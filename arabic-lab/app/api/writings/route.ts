// POST /api/writings → a student submits a writing; the teacher gets an email.
import { topicById } from "@/content/writing";
import { emailTeacher } from "@/lib/server/email";
import { json, rateLimited, readBody } from "@/lib/server/http";
import { isUuid, studentStore } from "@/lib/server/students";
import { WRITING_MAX, writingsTable } from "@/lib/server/writings";

export async function POST(req: Request) {
  if (rateLimited(req, "writings", 20)) return json(429, { error: "too_many_requests" });
  const body = await readBody(req, 30_000);
  if (!body || !isUuid(body.id) || typeof body.token !== "string" || typeof body.topicId !== "string" || typeof body.text !== "string") {
    return json(400, { error: "bad_request" });
  }
  const topic = topicById(body.topicId);
  const text = body.text.replace(/\r\n/g, "\n").trim();
  if (!topic) return json(422, { error: "unknown_topic" });
  if (!text) return json(422, { error: "empty" });
  if (text.length > WRITING_MAX) return json(422, { error: "too_long" });

  const students = studentStore();
  const writings = writingsTable();
  if (!students || !writings) return json(503, { error: "not_configured" });
  try {
    const student = await students.verify(body.id, body.token);
    if (!student) return json(404, { error: "not_found" });
    const row = await writings.insert({
      student_id: student.id,
      topic_id: topic.id,
      text,
      status: "new",
      feedback: null,
      stars: null,
      created_at: new Date().toISOString(),
      reviewed_at: null,
    });
    const email = await emailTeacher(`New writing from ${student.name}: ${topic.title.en}`, `${student.name} submitted a writing`, [
      ["Student", `${student.name} (${student.email})`],
      ["Topic", `${topic.title.en} · ${topic.title.ar}`],
      ["Words", String(text.split(/\s+/).filter(Boolean).length)],
      ["Text", text],
      ["Review", "Open the teacher dashboard → Writings inbox"],
    ]);
    return json(201, { ok: true, writing: row, email: email.sent });
  } catch {
    return json(502, { error: "database_error" });
  }
}
