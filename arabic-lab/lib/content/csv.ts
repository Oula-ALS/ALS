// Turns the Alsama vocabulary CSVs into units of words.
// CSV columns: Section, POS, العربي, Pronunciation (chat), English
// Section looks like 01_Unit1, 04_Unit4_Travel or 05_<Arabic topic name>.

import type { LevelId, Unit, Word } from "./types";

/** Minimal RFC 4180 parser: quotes, commas and line breaks inside quotes, BOM. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

export const BOOK1_UNIT_NAMES: Record<number, string> = {
  1: "Greetings & me",
  2: "Family, have/want/can",
  3: "Numbers, plurals, linking",
  4: "Verbs & days",
  5: "Future & helpers",
  6: "Time & big numbers",
  7: "Colours, countries, food, directions",
};

export const B1_UNIT_NAMES: Record<number, string> = {
  2: "Daily routine",
  3: "Free time",
  4: "Travel",
  5: "Airport & hotel",
  6: "Restaurant",
  7: "Attendance",
};

/** Known garbled cells in the source files (from Oula's brief), keyed by the raw Arabic cell. */
export const ARABIC_FIXES: Record<string, { ar: string; chat?: string }> = {
  "وصلwos`el": { ar: "وصل", chat: "wosel" },
  "وَصّل was`sal": { ar: "وصّل", chat: "wassal" },
  "شَنْاتي>شَنْتة": { ar: "شنتة / شناتي" },
};

const ARABIC = /[؀-ۿ]/;
const LATIN = /[A-Za-z`]/;

function findColumns(header: string[]) {
  const h = header.map((x) => x.trim().toLowerCase());
  const col = (test: (x: string) => boolean) => h.findIndex(test);
  return {
    section: col((x) => x === "section"),
    pos: col((x) => x === "pos"),
    ar: col((x) => x === "العربي" || x === "arabic"),
    chat: col((x) => x.startsWith("pronunciation") || x === "chat"),
    en: col((x) => x === "english"),
  };
}

function unitFromSection(section: string, level: LevelId) {
  const m = section.trim().match(/^(\d+)_(.*)$/);
  const prefix = m ? Number(m[1]) : 0;
  const rest = (m ? m[2] : section).trim();
  const unitMatch = rest.match(/^Unit\s*(\d+)(?:_(.*))?$/i);
  if (unitMatch) {
    const n = Number(unitMatch[1]);
    const names = level === "book1" ? BOOK1_UNIT_NAMES : level === "b1" ? B1_UNIT_NAMES : {};
    const suffix = unitMatch[2]?.replace(/_/g, " ").trim();
    return { id: `unit-${n}`, number: n, title: names[n] ?? suffix ?? `Unit ${n}`, titleIsArabic: false };
  }
  const title = rest.replace(/_/g, " ").trim() || section;
  return { id: `topic-${prefix}`, number: prefix, title, titleIsArabic: ARABIC.test(title) };
}

export type ImportResult = { units: Unit[]; warnings: string[] };

export function importVocabCsv(text: string, level: LevelId, fileName: string = level): ImportResult {
  const rows = parseCsv(text);
  const warnings: string[] = [];
  if (!rows.length) return { units: [], warnings: [`${fileName}: file is empty`] };

  const cols = findColumns(rows[0]);
  const missing = Object.entries(cols).filter(([, i]) => i < 0).map(([k]) => k);
  if (missing.length) {
    return { units: [], warnings: [`${fileName}: missing column(s) ${missing.join(", ")}`] };
  }

  const units = new Map<string, Unit>();
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const cell = (k: keyof typeof cols) => (r[cols[k]] ?? "").trim();
    const section = cell("section");
    let ar = cell("ar");
    let chat = cell("chat");
    const en = cell("en");
    const pos = cell("pos").toLowerCase();

    const fix = ARABIC_FIXES[ar];
    if (fix) {
      warnings.push(`${fileName} line ${line}: fixed "${ar}" → "${fix.ar}"`);
      ar = fix.ar;
      if (fix.chat) chat = fix.chat;
    }
    if (!section || !ar || !en) {
      warnings.push(`${fileName} line ${line}: skipped, missing ${[!section && "Section", !ar && "Arabic", !en && "English"].filter(Boolean).join(", ")}`);
      return;
    }
    if (LATIN.test(ar)) warnings.push(`${fileName} line ${line}: Latin letters in Arabic "${ar}"`);
    if (!ARABIC.test(ar)) warnings.push(`${fileName} line ${line}: no Arabic letters in "${ar}"`);
    if (!chat) warnings.push(`${fileName} line ${line}: no chat spelling for "${ar}"`);

    const info = unitFromSection(section, level);
    let unit = units.get(section);
    if (!unit) {
      let id = info.id;
      const taken = new Set([...units.values()].map((u) => u.id));
      for (let n = 2; taken.has(id); n++) id = `${info.id}-${n}`;
      unit = { ...info, id, level, section, words: [] };
      units.set(section, unit);
    }
    const word: Word = { id: `${level}-${unit.id}-${unit.words.length + 1}`, ar, chat, en, pos };
    if (unit.words.some((w) => w.ar === ar && w.en === en)) {
      warnings.push(`${fileName} line ${line}: duplicate "${ar}" (${en}) in ${section}, kept once`);
      return;
    }
    unit.words.push(word);
  });

  const sorted = [...units.values()].sort((a, b) => a.number - b.number);
  return { units: sorted, warnings };
}
