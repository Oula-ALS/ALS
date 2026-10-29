// Students: saved with their details, plus XP/streak/last active for the teacher's table.
// Every change needs the private token the student's device received when registering.

import { createHash, randomBytes } from "node:crypto";
import type { Profile } from "../registration";
import { table, type Table } from "./db";

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
export const isUuid = (id: unknown): id is string =>
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

export function profileFromRow(r: StudentRow): Profile {
  return {
    name: r.name,
    email: r.email,
    gender: r.gender as Profile["gender"],
    from: r.from_place,
    level: r.level as Profile["level"],
    travel: r.travel,
    hobby: r.hobby,
    animal: r.animal,
    dream: r.dream,
  };
}

/** Removes the token hash before a row leaves the server. */
export function publicStudent({ edit_token_hash: _hidden, ...rest }: StudentRow) {
  void _hidden;
  return rest;
}

export function studentStore() {
  const t: Table<StudentRow> | null = table<StudentRow>("students");
  if (!t) return null;
  const owned = (id: string, token: string) => ({ id, edit_token_hash: hashToken(token) });
  return {
    async create(profile: Profile, token: string) {
      const now = new Date().toISOString();
      const row = await t.insert({
        ...toColumns(profile),
        edit_token_hash: hashToken(token),
        xp: 0,
        streak: 0,
        created_at: now,
        updated_at: now,
        last_active: now,
      });
      return { id: row.id };
    },
    async update(id: string, token: string, profile: Profile) {
      const rows = await t.update(owned(id, token), { ...toColumns(profile), updated_at: new Date().toISOString() });
      return rows.length > 0;
    },
    async remove(id: string, token: string) {
      return (await t.remove(owned(id, token))).length > 0;
    },
    /** The student if the token matches, else null. */
    async verify(id: string, token: string) {
      return (await t.select(owned(id, token)))[0] ?? null;
    },
    async recordActivity(id: string, token: string, xp: number, streak: number) {
      const rows = await t.update(owned(id, token), { xp, streak, last_active: new Date().toISOString() });
      return rows.length > 0;
    },
    list() {
      return t.select({}, { column: "created_at", ascending: false });
    },
    async get(id: string) {
      return (await t.select({ id }))[0] ?? null;
    },
  };
}
