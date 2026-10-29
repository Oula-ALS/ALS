// POST /api/teacher/login {password} → sets the teacher cookie. DELETE → logs out.
import { json, rateLimited, readBody } from "@/lib/server/http";
import { checkPassword, clearCookie, passwordConfigured, sessionCookie } from "@/lib/server/teacher-auth";

export async function POST(req: Request) {
  if (rateLimited(req, "teacher-login", 10, 15 * 60_000)) return json(429, { error: "too_many_requests" });
  if (!passwordConfigured()) return json(503, { error: "not_configured" });
  const body = await readBody(req);
  if (!checkPassword(body?.password)) return json(401, { error: "wrong_password" });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": sessionCookie() },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": clearCookie() },
  });
}
