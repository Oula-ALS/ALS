// GET /api/settings → the teacher's "This session" pins and approved/edited model texts.
import { json } from "@/lib/server/http";
import { readSettings } from "@/lib/server/settings";
import { emptySettings } from "@/lib/settings";

export async function GET() {
  try {
    return json(200, (await readSettings()) ?? emptySettings);
  } catch {
    return json(200, emptySettings); // the app still works with defaults
  }
}
