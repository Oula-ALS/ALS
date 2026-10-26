// Saves students. Uses Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
// Without them, local development (`npm run dev`) saves to .data/students.json so the
// form can be tried before Supabase is set up. In production the keys are required.

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Profile } from "../registration";

export type StudentRow = {
  id: string;
  edit_token_hash: string;
  name: string;
  email: string;
  gender: string;
  from_place: string;
  level: string;
  travel: Profile["travel"];
  hobby: Profile["hobby"];
  animal: Profile["animal"];
  dream: Profile["dream"];
  xp: number;
  streak: number;
  created_at: string;
  updated_at: string;
  last_active: string;
};

export const newToken = () => randomBytes(24).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const isUuid = (id: unknown) =>
  typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function toColumns(p: Profile) {
  return {
    name: p.name,
    email: p.email,
    gender: p.gender,
    from_place: p.from,
    level: p.level,
    travel: p.travel,
    hobby: p.hobby,
    animal: p.animal,
    dream: p.dream,
  };
}

export interface StudentStore {
  create(profile: Profile, tokenHash: string): Promise<{ id: string }>;
  update(id: string, tokenHash: string, profile: Profile): Promise<boolean>;
  remove(id: string, tokenHash: string): Promise<boolean>;
}

// ---- Supabase (PostgREST over fetch; no extra package needed) ----

function supabaseStore(url: string, key: string): StudentStore {
  async function call(pathAndQuery: string, init: RequestInit) {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${pathAndQuery}`, {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error("Supabase error", res.status, data);
      throw new Error("database_error");
    }
    return data as Array<{ id: string }>;
  }
  const match = (id: string, tokenHash: string) =>
    `students?id=eq.${encodeURIComponent(id)}&edit_token_hash=eq.${tokenHash}&select=id`;

  return {
    async create(profile, tokenHash) {
      const rows = await call("students?select=id", {
        method: "POST",
        body: JSON.stringify({ ...toColumns(profile), edit_token_hash: tokenHash }),
      });
      return { id: rows[0].id };
    },
    async update(id, tokenHash, profile) {
      const rows = await call(match(id, tokenHash), {
        method: "PATCH",
        body: JSON.stringify({ ...toColumns(profile), updated_at: new Date().toISOString() }),
      });
      return rows.length > 0;
    },
    async remove(id, tokenHash) {
      const rows = await call(match(id, tokenHash), { method: "DELETE" });
      return rows.length > 0;
    },
  };
}

// ---- Local file (development only) ----

function fileStore(file: string): StudentStore {
  async function load(): Promise<StudentRow[]> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      return [];
    }
  }
  async function save(rows: StudentRow[]) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2));
  }
  return {
    async create(profile, tokenHash) {
      const rows = await load();
      const now = new Date().toISOString();
      const row: StudentRow = {
        id: randomUUID(),
        edit_token_hash: tokenHash,
        ...toColumns(profile),
        xp: 0,
        streak: 0,
        created_at: now,
        updated_at: now,
        last_active: now,
      };
      rows.push(row);
      await save(rows);
      return { id: row.id };
    },
    async update(id, tokenHash, profile) {
      const rows = await load();
      const row = rows.find((r) => r.id === id && r.edit_token_hash === tokenHash);
      if (!row) return false;
      Object.assign(row, toColumns(profile), { updated_at: new Date().toISOString() });
      await save(rows);
      return true;
    },
    async remove(id, tokenHash) {
      const rows = await load();
      const left = rows.filter((r) => !(r.id === id && r.edit_token_hash === tokenHash));
      if (left.length === rows.length) return false;
      await save(left);
      return true;
    },
  };
}

/** The store to use, or null if production is missing its Supabase keys. */
export function studentStore(): StudentStore | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return supabaseStore(url, key);
  if (process.env.NODE_ENV !== "production") {
    return fileStore(path.join(process.cwd(), ".data", "students.json"));
  }
  return null;
}
