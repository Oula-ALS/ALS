/**
 * Turns the teachers' CSV files in data/raw/ into clean JSON for the app.
 *
 *   npm run build-data
 *
 * - Never changes the CSV files.
 * - Writes src/data/{beginner,intermediate,advanced}.json
 * - Writes data/report.md: things teachers should check. Nothing in the
 *   report is fixed automatically.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import { hasArabic, normalizeArabic, stripTashkeel } from "../src/lib/arabic.ts";
import type { Gender, Level, LevelData, Unit, Word } from "../src/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = join(ROOT, "data/raw");
const OUT_DIR = join(ROOT, "src/data");
const REPORT = join(ROOT, "data/report.md");
const AUDIO_DIR = join(ROOT, "public/audio");

// Which CSV belongs to which level is decided by its file name.
// Checked in this order, so "Advanced" wins before "B1".
const LEVELS: { level: Level; title: string; prefix: string; match: RegExp; slug: string }[] = [
  { level: "advanced", title: "Advanced", prefix: "adv", match: /advanced/i, slug: "topic" },
  { level: "beginner", title: "Beginner (Book 1)", prefix: "beg", match: /book\s*1|beginner/i, slug: "unit" },
  { level: "intermediate", title: "Intermediate (A2–B1)", prefix: "int", match: /\bb1|intermediate/i, slug: "unit" },
];

const COLUMNS = ["Section", "POS", "العربي", "Pronunciation (chat)", "English"] as const;

// ---------- report collectors ----------

type Note = { level: Level; row: number; text: string };
const cleaned: Note[] = [];
const empty: Note[] = [];
const posIssues: Note[] = [];
const formIssues: Note[] = [];
const structure: string[] = [];

// ---------- cleaning helpers ----------

const INVISIBLE = /[​-‏‪-‮⁦-⁩﻿]/g;

function tidy(text: string): string {
  return (text ?? "").replace(INVISIBLE, "").replace(/\s+/g, " ").trim();
}

/** Arabic cell: remove Latin letters and stray marks that slipped in (e.g. "وصلwos`el"). */
function cleanArabicCell(raw: string): string {
  return tidy(raw.replace(/[A-Za-z`'’]+/g, " "));
}

/** Splits "بفيق \ بوعى \ بصحى" or "شَنْاتي>شَنْتة" into separate forms. */
function splitForms(text: string): string[] {
  return text
    .split(/[\/\\–—>-]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitArabizi(text: string): string[] {
  return text
    .split(/\s*\/\s*|\s+[-–]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractGender(english: string): { english: string; gender?: Gender } {
  const m = english.match(/\s*\((m|f|pl)\)\s*$/i);
  if (!m) return { english };
  return { english: english.slice(0, m.index).trim(), gender: m[1].toLowerCase() as Gender };
}

function parseSection(section: string): { order: number; rest: string } | null {
  const m = section.match(/^(\d+)\s*_\s*(.+)$/);
  return m ? { order: Number(m[1]), rest: m[2].trim() } : null;
}

/** "Unit2_DailyRoutine" → "Unit 2 · Daily Routine"; Arabic topics stay as written. */
function unitTitle(rest: string): string {
  if (hasArabic(rest)) return rest;
  const [first, ...more] = rest.split("_").filter(Boolean);
  const spaced = (s: string) => s.replace(/([a-z])([A-Z0-9])/g, "$1 $2");
  const head = spaced(first);
  return more.length ? `${head} · ${more.map(spaced).join(" & ")}` : head;
}

function shortHash(text: string): string {
  return createHash("sha1").update(text).digest("hex").slice(0, 6);
}

/** Same word with or without "ال" on each word (for near-duplicates). */
function withoutAl(text: string): string {
  return normalizeArabic(text)
    .split(" ")
    .map((w) => (w.length > 3 ? w.replace(/^ال/, "") : w))
    .join(" ");
}

// ---------- part-of-speech checks (only flag, never change) ----------

const NOUN_SUFFIX = /(tion|sion|ment|ity|ness|ance|ence|ism|ship|ure|ery|age)$/i;
const IRREGULAR_PAST = new Set(
  "flew took went sat saw gave said told found brought lost paid ate drank came left made got put ran wrote read slept spent bought sold thought knew felt kept met sent stood understood woke drove rode drink try eat go take come give see"
    .split(" "),
);

function firstEnglishWord(english: string): string {
  return (english.split("/")[0].trim().split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z']/g, "");
}

function checkPos(w: Word, row: number) {
  const pos = w.pos;
  const ar = stripTashkeel(w.arabic);
  const words = ar.split(" ").length;
  const en = w.english;
  const first = firstEnglishWord(en);
  const lastEn = en.split("/")[0].trim().split(/\s+/).pop() ?? "";
  const flag = (text: string) => posIssues.push({ level: w.level, row, text: `${w.display} — "${en}" tagged **${pos}**: ${text}` });

  if (pos !== "verb" && /^to\s/i.test(en)) flag("English starts with “to …”, so it may be a verb");
  if (pos === "noun" && /^(بي|بت|ي)/.test(ar) && ar.length >= 4 && !/^(بيئ|بيان)/.test(ar))
    flag("starts with يـ / بيـ / بتـ like a verb");
  if (pos === "noun" && /^(it|it’s|it's|i)\b/i.test(en)) flag("the English is a sentence, so it may be a phrase");
  if (pos === "verb") {
    if (/^ال/.test(ar)) flag("starts with “ال”, so it may be a noun (masdar)");
    const verbish = first === "to" || first === "i" || first.endsWith("ed") || IRREGULAR_PAST.has(first);
    if (!verbish) flag("the English does not look like a verb");
  }
  if (pos === "adjective") {
    if (words >= 2) flag("two or more words, so it may be a noun phrase");
    else if (NOUN_SUFFIX.test(lastEn)) flag("the English looks like a noun");
  }
}

// ---------- main ----------

function findFiles(): Map<Level, string> {
  const files = readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith(".csv"));
  const found = new Map<Level, string>();
  for (const file of files) {
    const cfg = LEVELS.find((l) => l.match.test(file));
    if (!cfg) {
      console.warn(`⚠️  Skipping "${file}": the name must contain Book1, B1 or Advanced.`);
      continue;
    }
    if (found.has(cfg.level)) throw new Error(`Two files for ${cfg.level}: "${found.get(cfg.level)}" and "${file}". Keep only one.`);
    found.set(cfg.level, file);
  }
  return found;
}

function buildLevel(level: Level, file: string): LevelData {
  const cfg = LEVELS.find((l) => l.level === level)!;
  const rows: Record<string, string>[] = parse(readFileSync(join(RAW_DIR, file)), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const header = Object.keys(rows[0] ?? {}).map((h) => h.trim());
  for (const col of COLUMNS) if (!header.includes(col)) throw new Error(`${file}: missing column "${col}"`);

  const units = new Map<number, Unit>();
  const words: Word[] = [];
  const usedIds = new Set<string>();

  rows.forEach((raw, i) => {
    const row = i + 2; // spreadsheet row number (row 1 is the header)
    const get = (col: (typeof COLUMNS)[number]) => raw[col] ?? raw[` ${col}`] ?? "";

    const missing = COLUMNS.filter((c) => !tidy(get(c)));
    if (missing.length) empty.push({ level, row, text: `empty: ${missing.join(", ")}` });

    const rawArabic = get("العربي");
    const arabicCell = cleanArabicCell(rawArabic);
    if (tidy(rawArabic) !== arabicCell)
      cleaned.push({ level, row, text: `Arabic “${tidy(rawArabic)}” → “${arabicCell}” (removed Latin letters/marks)` });
    if (/>/.test(arabicCell))
      formIssues.push({ level, row, text: `“${arabicCell}” uses “>” — read as two forms. Use “/” if that is right.` });
    if (!hasArabic(arabicCell)) {
      if (arabicCell) empty.push({ level, row, text: `no Arabic letters in the Arabic column: “${arabicCell}”` });
      return;
    }

    const alternatives = splitForms(arabicCell);
    const display = alternatives.join(" / ");

    const arabizi = tidy(get("Pronunciation (chat)"));
    if (hasArabic(arabizi)) formIssues.push({ level, row, text: `Arabizi column contains Arabic letters: “${arabizi}”` });
    const arabiziAlternatives = splitArabizi(arabizi);
    if (alternatives.length > 1 && arabiziAlternatives.length < alternatives.length)
      formIssues.push({ level, row, text: `“${display}” has ${alternatives.length} forms but Arabizi “${arabizi}” covers ${arabiziAlternatives.length}` });

    const counts = alternatives.map((a) => a.split(" ").length);
    if (Math.max(...counts) - Math.min(...counts) >= 2)
      formIssues.push({ level, row, text: `“${display}”: one form is much shorter than another — is it a full alternative or only part of the phrase?` });

    const { english, gender } = extractGender(tidy(get("English")));

    const section = tidy(get("Section"));
    const parsed = parseSection(section);
    if (!parsed) structure.push(`${level} row ${row}: section “${section}” has no number prefix like “03_”.`);
    const order = parsed?.order ?? 999;
    const slug = `${cfg.slug}-${order}`;
    const title = unitTitle(parsed?.rest ?? section);
    const unitId = `${level}/${slug}`;

    const unit = units.get(order);
    if (!unit) {
      units.set(order, { id: unitId, level, slug, order, title, titleIsArabic: hasArabic(title), wordCount: 0 });
    } else if (unit.title !== title) {
      structure.push(`${level} row ${row}: number ${order} is used for two titles: “${unit.title}” and “${title}”.`);
    }
    units.get(order)!.wordCount++;

    // Stable id: based on the Arabic (without tashkeel), not the row number,
    // so adding or moving rows does not break saved progress or audio files.
    let id = `${cfg.prefix}-${order}-${shortHash(normalizeArabic(display))}`;
    for (let n = 2; usedIds.has(id); n++) id = `${cfg.prefix}-${order}-${shortHash(normalizeArabic(display))}-${n}`;
    usedIds.add(id);

    const word: Word = {
      id,
      level,
      unitId,
      unitTitle: title,
      unitOrder: order,
      pos: tidy(get("POS")).toLowerCase(),
      arabic: alternatives[0],
      alternatives,
      display,
      arabizi: arabiziAlternatives[0] ?? arabizi,
      arabiziAlternatives,
      english,
      ...(gender ? { gender } : {}),
    };
    checkPos(word, row);
    (word as Word & { _row: number })._row = row;
    words.push(word);
  });

  const sortedUnits = [...units.values()].sort((a, b) => a.order - b.order);
  const orders = sortedUnits.map((u) => u.order);
  for (let n = orders[0]; n < orders[orders.length - 1]; n++)
    if (!orders.includes(n)) structure.push(`${cfg.title}: there is no unit/topic number ${n}.`);
  if (orders[0] > 1) structure.push(`${cfg.title}: numbering starts at ${orders[0]}, not 1.`);
  for (const u of sortedUnits)
    if (u.wordCount < 5) structure.push(`${cfg.title}: “${u.title}” has only ${u.wordCount} word(s).`);

  words.sort((a, b) => a.unitOrder - b.unitOrder);
  return { level, title: cfg.title, source: file, units: sortedUnits, words };
}

// ---------- duplicates ----------

type Row = Word & { _row: number };

function groupBy(words: Row[], key: (form: string) => string): Row[][] {
  // Union words that share any form.
  const parent = words.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const seen = new Map<string, number>();
  words.forEach((w, i) => {
    for (const form of w.alternatives) {
      const k = key(form);
      if (seen.has(k)) parent[find(i)] = find(seen.get(k)!);
      else seen.set(k, i);
    }
  });
  const groups = new Map<number, Row[]>();
  words.forEach((w, i) => groups.set(find(i), [...(groups.get(find(i)) ?? []), w]));
  return [...groups.values()].filter((g) => g.length > 1);
}

/** The English meanings as a set: "Trip \\ flight" → {"trip", "flight"}. */
function meanings(w: Word): Set<string> {
  return new Set(w.english.toLowerCase().split(/[\/\\,]/).map((s) => s.replace(/^to\s+/, "").trim()).filter(Boolean));
}

/** Same meaning (and same gender badge), so a real duplicate rather than a different word. */
function sameMeaning(a: Word, b: Word): boolean {
  if ((a.gender ?? "") !== (b.gender ?? "")) return false;
  const mb = meanings(b);
  return [...meanings(a)].some((m) => mb.has(m));
}

/** Splits a group into "real duplicates" (shared meaning) and the rest. */
function bySharedMeaning(groups: Row[][]): { same: Row[][]; different: Row[][] } {
  const same: Row[][] = [];
  const different: Row[][] = [];
  for (const g of groups) {
    const linked = g.filter((w) => g.some((o) => o !== w && sameMeaning(w, o)));
    if (linked.length > 1) same.push(linked);
    if (linked.length < g.length) different.push(g);
  }
  return { same, different };
}

function describe(group: Row[]): string {
  return group.map((w) => `row ${w._row} “${w.display}” (${w.unitTitle}, ${w.pos}, "${w.english}")`).join("<br>");
}

// ---------- report ----------

function table(notes: Note[], level: Level): string {
  const list = notes.filter((n) => n.level === level).sort((a, b) => a.row - b.row);
  if (!list.length) return "_None found._\n";
  return "| Row | Issue |\n|---|---|\n" + list.map((n) => `| ${n.row} | ${n.text.replace(/\|/g, "\\|")} |`).join("\n") + "\n";
}

function arabiziQuality(words: Row[]): { lettersOnly: Row[] } {
  const lettersOnly = words.filter((w) => {
    const a = w.arabizi.toLowerCase();
    const startsAl = /^ال/.test(stripTashkeel(w.arabic)) && /^al/.test(a);
    const letters = a.replace(/[^a-z]/g, "");
    const vowels = letters.replace(/[^aeiou]/g, "").length;
    const fewVowels = letters.length >= 5 && vowels / letters.length < 0.2;
    return startsAl || fewVowels;
  });
  return { lettersOnly };
}

function writeReport(levels: LevelData[]) {
  const out: string[] = [];
  out.push("# Vocabulary data report");
  out.push("");
  out.push("Made by `npm run build-data`. **Nothing listed here was changed automatically** — please check each item in the spreadsheet, fix what is wrong, and run the build again. Row numbers match the spreadsheet (row 1 = header).");
  out.push("");
  out.push("## Word counts");
  out.push("");
  out.push("| Level | File | Units | Words |\n|---|---|---|---|");
  for (const l of levels) out.push(`| ${l.title} | \`${l.source}\` | ${l.units.length} | ${l.words.length} |`);
  out.push("");
  for (const l of levels) {
    out.push(`<details><summary>${l.title}: words per unit</summary>\n`);
    out.push("| # | Unit | Link | Words |\n|---|---|---|---|");
    for (const u of l.units) out.push(`| ${u.order} | ${u.title} | /${l.level}/${u.slug} | ${u.wordCount} |`);
    out.push("\n</details>\n");
  }

  out.push("## Structure");
  out.push("");
  out.push(structure.length ? structure.map((s) => `- ${s}`).join("\n") : "_No problems._");
  out.push("");

  for (const l of levels) {
    const words = l.words as Row[];
    out.push(`## ${l.title}`);
    out.push("");

    out.push("### Duplicates (same word and meaning more than once in this level)");
    out.push("");
    const exact = bySharedMeaning(groupBy(words, normalizeArabic));
    out.push(exact.same.length ? exact.same.map((g) => `- ${describe(g)}`).join("\n") : "_None found._");
    out.push("");

    out.push("### Near-duplicates (same word and meaning, with and without “ال”)");
    out.push("");
    const dupKeys = new Set(exact.same.flat().map((w) => w.id));
    const near = bySharedMeaning(groupBy(words, withoutAl)).same.filter((g) => g.some((w) => !dupKeys.has(w.id)));
    out.push(near.length ? near.map((g) => `- ${describe(g)}`).join("\n") : "_None found._");
    out.push("");

    out.push("### Same letters, different word (only the tashkeel or the gender is different)");
    out.push("");
    out.push("_Usually fine. Listed so the tashkeel is checked, because students who type without tashkeel cannot tell these apart._");
    out.push("");
    out.push(exact.different.length ? exact.different.map((g) => `- ${describe(g)}`).join("\n") : "_None found._");
    out.push("");

    out.push("### Part of speech (POS) that may be wrong");
    out.push("");
    out.push(table(posIssues, l.level));

    out.push("### Empty or unusable cells");
    out.push("");
    out.push(table(empty, l.level));

    out.push("### Arabic forms and Arabizi");
    out.push("");
    out.push(table(formIssues, l.level));

    const { lettersOnly } = arabiziQuality(words);
    if (lettersOnly.length) {
      const share = Math.round((lettersOnly.length / words.length) * 100);
      out.push(`**Arabizi spelling:** ${lettersOnly.length} of ${words.length} words (${share}%) are clearly letter-by-letter (“al…” for “ال…”, or almost no vowels) instead of how the word is said in Lebanese. Many more words in this level are missing short vowels — please skim the whole Arabizi column.`);
      out.push("");
      out.push(`<details><summary>Show the ${lettersOnly.length} words</summary>\n`);
      out.push("| Row | Arabic | Arabizi now |\n|---|---|---|");
      for (const w of lettersOnly) out.push(`| ${w._row} | ${w.display} | ${w.arabizi} |`);
      out.push("\n</details>\n");
    }

    out.push("### Cleaned automatically (please check)");
    out.push("");
    out.push(table(cleaned, l.level));

    const posCount = new Map<string, number>();
    for (const w of words) posCount.set(w.pos, (posCount.get(w.pos) ?? 0) + 1);
    out.push(`**POS values used:** ${[...posCount].sort((a, b) => b[1] - a[1]).map(([p, n]) => `${p} (${n})`).join(", ")}`);
    out.push("");
  }

  out.push("## Same word, different POS in different levels");
  out.push("");
  const byWord = new Map<string, Row[]>();
  for (const l of levels) for (const w of l.words as Row[]) {
    const k = normalizeArabic(w.arabic);
    byWord.set(k, [...(byWord.get(k) ?? []), w]);
  }
  const mixed = [...byWord.values()].filter((ws) => new Set(ws.map((w) => w.level)).size > 1 && new Set(ws.map((w) => w.pos)).size > 1);
  out.push(mixed.length
    ? "| Word | Tagged as |\n|---|---|\n" + mixed.map((ws) => `| ${ws[0].arabic} | ${ws.map((w) => `${w.pos} (${w.level} row ${w._row})`).join(", ")} |`).join("\n")
    : "_None found._");
  out.push("");

  writeFileSync(REPORT, out.join("\n"));
}

// ---------- run ----------

const files = findFiles();
const levels: LevelData[] = [];
for (const { level } of LEVELS) {
  const file = files.get(level);
  if (!file) {
    console.warn(`⚠️  No CSV found for ${level}.`);
    continue;
  }
  levels.push(buildLevel(level, file));
}
levels.sort((a, b) => ["beginner", "intermediate", "advanced"].indexOf(a.level) - ["beginner", "intermediate", "advanced"].indexOf(b.level));

writeReport(levels);
for (const l of levels) {
  const clean = { ...l, words: (l.words as Row[]).map(({ _row, ...w }) => w) };
  writeFileSync(join(OUT_DIR, `${l.level}.json`), JSON.stringify(clean, null, 1) + "\n");
}

// Audio files, kept apart so they're never mixed up:
//   public/audio/{word id}.mp3      Alsama recordings (played first)
//   public/audio/tts/{word id}.mp3  Lebanese computer voice (scripts/generate-audio.ts)
const allIds = new Set(levels.flatMap((l) => l.words.map((w) => w.id)));
const mp3Ids = (dir: string) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)).filter((id) => allIds.has(id)).sort() : [];
const recorded = mp3Ids(AUDIO_DIR);
const tts = mp3Ids(join(AUDIO_DIR, "tts"));
writeFileSync(join(OUT_DIR, "audio.json"), JSON.stringify({ recorded, tts }) + "\n");

// Recording checklist for Oula: one row per word (opens in Excel / Google Sheets).
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const recSet = new Set(recorded);
const ttsSet = new Set(tts);
const rows = levels.flatMap((l) =>
  l.words.map((w) =>
    [`${w.id}.mp3`, l.title, w.unitTitle, w.display, w.arabizi, w.english, recSet.has(w.id) ? "recorded" : ttsSet.has(w.id) ? "computer voice only" : "missing"]
      .map(csvCell)
      .join(","),
  ),
);
writeFileSync(
  join(ROOT, "data/recording-list.csv"),
  "\uFEFF" + ["File name,Level,Unit,Arabic,Arabizi,English,Status", ...rows].join("\n") + "\n",
);

for (const l of levels) console.log(`${l.title.padEnd(22)} ${String(l.units.length).padStart(3)} units  ${String(l.words.length).padStart(4)} words`);
console.log(`Audio: ${recorded.length} Alsama recordings, ${tts.length} computer-voice files · checklist: data/recording-list.csv`);
console.log(`POS warnings: ${posIssues.length} · duplicates/forms: see data/report.md`);
