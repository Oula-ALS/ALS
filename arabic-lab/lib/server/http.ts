// Small helpers shared by the API routes.

export const json = (status: number, body: unknown) => Response.json(body, { status });

/** Parses a JSON body up to `max` characters; null if missing or invalid. */
export async function readBody(req: Request, max = 20_000): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > max) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// Per-IP limit so forms can't be used to flood the teacher's inbox.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, bucket: string, max = 10, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const k = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(k) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(k, recent);
  return recent.length > max;
}
