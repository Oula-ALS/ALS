// PUT /api/teacher/settings {key: "session" | "content", value} (teacher only).
import { TOPICS } from "@/content/writing";
import { LEVELS, unitSummaries } from "@/lib/content";
import { json, readBody } from "@/lib/server/http";
import { writeSetting } from "@/lib/server/settings";
import { isTeacher } from "@/lib/server/teacher-auth";
import type { ContentSettings, SessionSettings } from "@/lib/settings";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function cleanSession(value: unknown): SessionSettings | null {
  if (!value || typeof value !== "object") return null;
  const units = unitSummaries();
  const out: SessionSettings = {};
  for (const level of LEVELS) {
    const v = (value as Record<string, { unitId?: unknown; note?: unknown }>)[level];
    if (!v) continue;
    const unitId = typeof v.unitId === "string" && units.some((u) => u.level === level && u.id === v.unitId) ? v.unitId : null;
    out[level] = { unitId, note: str(v.note, 300).trim() };
  }
  return out;
}

function cleanContent(value: unknown): ContentSettings | null {
  if (!value || typeof value !== "object") return null;
  const out: ContentSettings = {};
  for (const topic of TOPICS) {
    const v = (value as Record<string, { approved?: unknown; model?: { ar?: unknown; chat?: unknown; en?: unknown } }>)[topic.id];
    if (!v) continue;
    const m = v.model;
    out[topic.id] = {
      approved: v.approved === true,
      ...(m && typeof m === "object" ? { model: { ar: str(m.ar, 4000), chat: str(m.chat, 4000), en: str(m.en, 4000) } } : {}),
    };
  }
  return out;
}

export async function PUT(req: Request) {
  if (!isTeacher(req)) return json(401, { error: "login_required" });
  const body = await readBody(req, 100_000);
  const key = body?.key;
  const value = key === "session" ? cleanSession(body?.value) : key === "content" ? cleanContent(body?.value) : null;
  if (!value || (key !== "session" && key !== "content")) return json(400, { error: "bad_request" });
  try {
    await writeSetting(key, value);
    return json(200, { ok: true, value });
  } catch {
    return json(502, { error: "database_error" });
  }
}
