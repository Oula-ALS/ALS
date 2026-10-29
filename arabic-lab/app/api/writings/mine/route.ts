// POST /api/writings/mine → the student's own writings with the teacher's feedback.
// (POST so the private token is never part of a URL.)
import { json, readBody } from "@/lib/server/http";
import { isUuid, studentStore } from "@/lib/server/students";
import { writingsTable } from "@/lib/server/writings";

export async function POST(req: Request) {
  const body = await readBody(req);
  if (!body || !isUuid(body.id) || typeof body.token !== "string") return json(400, { error: "bad_request" });
  const students = studentStore();
  const writings = writingsTable();
  if (!students || !writings) return json(503, { error: "not_configured" });
  try {
    const student = await students.verify(body.id, body.token);
    if (!student) return json(404, { error: "not_found" });
    const rows = await writings.select({ student_id: student.id }, { column: "created_at", ascending: false });
    return json(200, { writings: rows });
  } catch {
    return json(502, { error: "database_error" });
  }
}
