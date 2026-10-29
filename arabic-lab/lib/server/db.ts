// Tiny database layer used by all server code.
// - Supabase (Postgres over its REST API) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
// - Otherwise, in local development only, JSON files in .data/ so everything can be tried
//   before Supabase is set up. In production the Supabase keys are required.

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

type Row = Record<string, unknown>;
export type Filter = Record<string, string | number | boolean>;

export interface Table<T extends Row> {
  insert(row: Partial<T>): Promise<T>;
  select(filter?: Filter, order?: { column: keyof T & string; ascending?: boolean }): Promise<T[]>;
  update(filter: Filter, patch: Partial<T>): Promise<T[]>;
  remove(filter: Filter): Promise<T[]>;
  /** Insert, or replace the row with the same primary key. */
  upsert(row: Partial<T>, key: keyof T & string): Promise<T>;
}

export class DatabaseError extends Error {}

// ---- Supabase ----

function supabaseTable<T extends Row>(url: string, key: string, name: string): Table<T> {
  const base = `${url.replace(/\/$/, "")}/rest/v1/${name}`;

  async function call(query: string, init: RequestInit & { prefer?: string } = {}) {
    const res = await fetch(`${base}?${query}`, {
      ...init,
      headers: {
        apikey: key,
        // Legacy service_role keys are JWTs ("eyJ…") and also go in Authorization;
        // new secret keys ("sb_secret_…") only go in the apikey header.
        ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}),
        "Content-Type": "application/json",
        Prefer: init.prefer ?? "return=representation",
      },
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error(`Supabase ${name} error`, res.status, data);
      throw new DatabaseError("database_error");
    }
    return (data ?? []) as T[];
  }

  const where = (filter: Filter = {}) =>
    Object.entries(filter)
      .map(([k, v]) => `${encodeURIComponent(k)}=eq.${encodeURIComponent(String(v))}`)
      .join("&");
  const join = (...parts: string[]) => parts.filter(Boolean).join("&");

  return {
    async insert(row) {
      return (await call("select=*", { method: "POST", body: JSON.stringify(row) }))[0];
    },
    select(filter, order) {
      const o = order ? `order=${order.column}.${order.ascending === false ? "desc" : "asc"}` : "";
      return call(join("select=*", where(filter), o));
    },
    update(filter, patch) {
      return call(join("select=*", where(filter)), { method: "PATCH", body: JSON.stringify(patch) });
    },
    remove(filter) {
      return call(join("select=*", where(filter)), { method: "DELETE" });
    },
    async upsert(row, keyColumn) {
      const rows = await call(`select=*&on_conflict=${keyColumn}`, {
        method: "POST",
        body: JSON.stringify(row),
        prefer: "return=representation,resolution=merge-duplicates",
      });
      return rows[0];
    },
  };
}

// ---- Local JSON files (development only) ----

// One queue per file so two quick requests don't overwrite each other.
const queues = new Map<string, Promise<unknown>>();

function fileTable<T extends Row>(dir: string, name: string): Table<T> {
  const file = path.join(dir, `${name}.json`);

  async function load(): Promise<T[]> {
    try {
      return JSON.parse(await fs.readFile(file, "utf8"));
    } catch {
      return [];
    }
  }
  function change<R>(fn: (rows: T[]) => { rows: T[]; result: R }): Promise<R> {
    const run = (queues.get(file) ?? Promise.resolve()).then(async () => {
      const { rows, result } = fn(await load());
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(file, JSON.stringify(rows, null, 2));
      return result;
    });
    queues.set(file, run.catch(() => {}));
    return run;
  }
  const matches = (row: T, filter: Filter = {}) =>
    Object.entries(filter).every(([k, v]) => String(row[k]) === String(v));

  return {
    insert(row) {
      return change((rows) => {
        const now = new Date().toISOString();
        const full = { id: randomUUID(), created_at: now, ...row } as unknown as T;
        return { rows: [...rows, full], result: full };
      });
    },
    async select(filter, order) {
      const rows = (await load()).filter((r) => matches(r, filter));
      if (order) {
        const dir = order.ascending === false ? -1 : 1;
        rows.sort((a, b) => (String(a[order.column]) > String(b[order.column]) ? dir : -dir));
      }
      return rows;
    },
    update(filter, patch) {
      return change((rows) => {
        const hit: T[] = [];
        const next = rows.map((r) => {
          if (!matches(r, filter)) return r;
          const updated = { ...r, ...patch };
          hit.push(updated);
          return updated;
        });
        return { rows: next, result: hit };
      });
    },
    remove(filter) {
      return change((rows) => ({
        rows: rows.filter((r) => !matches(r, filter)),
        result: rows.filter((r) => matches(r, filter)),
      }));
    },
    upsert(row, keyColumn) {
      return change((rows) => {
        const i = rows.findIndex((r) => r[keyColumn] === row[keyColumn]);
        const full = { ...(i >= 0 ? rows[i] : {}), ...row } as T;
        const next = [...rows];
        if (i >= 0) next[i] = full;
        else next.push(full);
        return { rows: next, result: full };
      });
    },
  };
}

/** A table, or null if production is missing its Supabase keys. */
export function table<T extends Row>(name: "students" | "writings" | "settings"): Table<T> | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return supabaseTable<T>(url, key, name);
  if (process.env.NODE_ENV !== "production") {
    return fileTable<T>(process.env.LOCAL_DATA_DIR || path.join(process.cwd(), ".data"), name);
  }
  return null;
}
