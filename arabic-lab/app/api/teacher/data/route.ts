// GET /api/teacher/data → everything the dashboard shows (teacher only).
import { json } from "@/lib/server/http";
import { readSettings } from "@/lib/server/settings";
import { publicStudent, studentStore } from "@/lib/server/students";
import { isTeacher } from "@/lib/server/teacher-auth";
import { writingsTable } from "@/lib/server/writings";

export async function GET(req: Request) {
  if (!isTeacher(req)) return json(401, { error: "login_required" });
  const students = studentStore();
  const writings = writingsTable();
  if (!students || !writings) return json(503, { error: "not_configured" });
  try {
    const [s, w, settings] = await Promise.all([
      students.list(),
      writings.select({}, { column: "created_at", ascending: false }),
      readSettings(),
    ]);
    return json(200, { students: s.map(publicStudent), writings: w, settings });
  } catch {
    return json(502, { error: "database_error" });
  }
}
