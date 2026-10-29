import { emptySettings, type ContentSettings, type SessionSettings, type Settings } from "../settings";
import { table } from "./db";

type SettingRow = { key: string; value: unknown; updated_at: string };

export async function readSettings(): Promise<Settings | null> {
  const t = table<SettingRow>("settings");
  if (!t) return null;
  const rows = await t.select();
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  return {
    session: (get("session") as SessionSettings) ?? emptySettings.session,
    content: (get("content") as ContentSettings) ?? emptySettings.content,
  };
}

export async function writeSetting(key: "session" | "content", value: SessionSettings | ContentSettings) {
  const t = table<SettingRow>("settings");
  if (!t) throw new Error("not_configured");
  await t.upsert({ key, value, updated_at: new Date().toISOString() }, "key");
}
