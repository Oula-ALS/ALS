// GET /offline-pages.json → every page the app saves for offline use (read by public/sw.js).
import { TOPICS } from "@/content/writing";
import { unitSummaries } from "@/lib/content";

export function GET() {
  const units = unitSummaries().flatMap((u) => {
    const base = `/words/${u.level}/${u.id}`;
    return [base, `${base}/flashcards`, `${base}/quiz`, `${base}/match`];
  });
  const pages = ["/", "/home", "/words", "/writing", "/writing/mine", "/about-me", "/profile", "/start", "/offline", ...units, ...TOPICS.map((t) => `/writing/${t.id}`)];
  return Response.json({ pages });
}
