/**
 * Writes one short Lebanese example sentence per word with Claude, for teachers to review.
 *
 *   npm run generate-examples -- --level beginner --unit 3
 *   npm run generate-examples -- --dry-run          (shows the request, calls nothing)
 *
 * Options: --level beginner|intermediate|advanced · --unit N · --limit N (max words)
 *          --redo (rewrite sentences that are not reviewed yet) · --dry-run
 *
 * - Needs ANTHROPIC_API_KEY in vocab/.env (never commit that file).
 * - Saves to src/data/examples.json with reviewed: false, after every batch.
 * - Never changes a sentence a teacher approved or rejected.
 * - Words it could not do are listed in data/examples-report.md.
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { normalizeArabic } from "../src/lib/arabic.ts";
import { makeCloze, type ExampleEntry, type ExamplesFile } from "../src/lib/examples.ts";
import type { Level, LevelData, Word } from "../src/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLES = join(ROOT, "src/data/examples.json");
const REPORT = join(ROOT, "data/examples-report.md");
const MODEL = "claude-opus-5-5";
const BATCH = 12;

// ---------- options ----------

const argv = process.argv.slice(2);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const flag = (name: string) => argv.includes(`--${name}`);
const onlyLevel = opt("level") as Level | undefined;
const onlyUnit = opt("unit") ? Number(opt("unit")) : undefined;
const limit = opt("limit") ? Number(opt("limit")) : Infinity;
const redo = flag("redo");
const dryRun = flag("dry-run");

// ---------- prompt ----------

const LEVEL_GUIDE: Record<Level, string> = {
  beginner: "Beginner (A1): 3–7 words, present tense, everyday situations, only very common words.",
  intermediate: "Intermediate (A2–B1): 5–10 words, daily routine, travel, food; past and future are fine.",
  advanced: "Advanced (B2): 8–16 words, discussing society, work, economy or feelings, still natural spoken Lebanese.",
};

const SYSTEM = `You write example sentences for Alsama Language School, which teaches spoken Lebanese Arabic to teens and adults.

For each word you get, write ONE short, natural sentence that a Lebanese person would really say.
- Dialect: Lebanese (Levantine) spoken Arabic, written in Arabic script with normal MSA spelling (e.g. ة, ال). Not Modern Standard Arabic grammar.
- The sentence must contain the target word exactly once, as a separate word, in one of the forms given (copy the letters exactly). Do not attach و/ب/ل/ال/ع to the front of the target word and do not add endings to it. If that is impossible for this word, choose the form and sentence that comes closest and put it in "answer" anyway.
- "answer": the target word exactly as it appears in your sentence.
- "arabizi": the whole sentence in Lebanese chat spelling, like the word list (3 = ع, 7 = ح, 2 = ء or ق, 5 = خ, 8 or gh = غ).
- "english": a natural English translation.
- Match the level. Keep content friendly and suitable for teenagers. No politics, religion jokes or stereotypes.`;

function userPrompt(level: Level, words: Word[]): string {
  const list = words.map((w) => ({
    id: w.id,
    forms: w.alternatives,
    meaning: w.english + (w.gender ? ` (${w.gender})` : ""),
    pos: w.pos,
    pronunciation: w.arabiziAlternatives.join(" / "),
  }));
  return `Level: ${LEVEL_GUIDE[level]}\nUnit: ${words[0].unitTitle}\n\nWords:\n${JSON.stringify(list, null, 1)}`;
}

const SCHEMA = {
  type: "object",
  properties: {
    sentences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          arabic: { type: "string" },
          answer: { type: "string" },
          arabizi: { type: "string" },
          english: { type: "string" },
        },
        required: ["id", "arabic", "answer", "arabizi", "english"],
        additionalProperties: false,
      },
    },
  },
  required: ["sentences"],
  additionalProperties: false,
};

interface Generated {
  id: string;
  arabic: string;
  answer: string;
  arabizi: string;
  english: string;
}

// ---------- API ----------

async function ask(client: Anthropic, level: Level, words: Word[]): Promise<Generated[]> {
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // if a request is declined, Anthropic re-runs it on a suitable model
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt(level, words) }],
  });
  if (response.stop_reason === "refusal") throw new Error(`declined (${response.stop_details?.category ?? "no reason"})`);
  if (response.stop_reason === "max_tokens") throw new Error("answer was cut off (max_tokens)");
  const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return (JSON.parse(text) as { sentences: Generated[] }).sentences;
}

/** Checks one generated sentence; returns the entry to save or the reason it can't be used. */
function check(word: Word, g: Generated | undefined): ExampleEntry | string {
  if (!g) return "no sentence returned";
  if (!word.alternatives.some((f) => normalizeArabic(f) === normalizeArabic(g.answer)))
    return `answer “${g.answer}” is not one of the word's forms`;
  const cloze = makeCloze(g.arabic, g.answer);
  if (!cloze) return `“${g.answer}” is not a separate word in “${g.arabic}”`;
  return { arabic: g.arabic.trim(), arabizi: g.arabizi.trim(), english: g.english.trim(), answer: g.answer.trim(), cloze, reviewed: false, source: "ai" };
}

// ---------- main ----------

function load(level: Level): LevelData {
  return JSON.parse(readFileSync(join(ROOT, `src/data/${level}.json`), "utf8"));
}

function saveExamples(file: ExamplesFile) {
  const sorted = Object.fromEntries(Object.entries(file).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(EXAMPLES, JSON.stringify(sorted, null, 1) + "\n");
}

async function main() {
  const examples: ExamplesFile = JSON.parse(readFileSync(EXAMPLES, "utf8"));
  const levels: Level[] = onlyLevel ? [onlyLevel] : ["beginner", "intermediate", "advanced"];

  // Words to do: no sentence yet (or, with --redo, one that isn't reviewed). Never touch reviewed/rejected ones.
  const todo = levels
    .flatMap((l) => load(l).words)
    .filter((w) => onlyUnit === undefined || w.unitOrder === onlyUnit)
    .filter((w) => {
      const e = examples[w.id];
      if (!e) return true;
      return redo && !e.reviewed && !e.rejected;
    })
    .slice(0, limit);

  // Batches within one unit, so each request has one topic and level.
  const batches: Word[][] = [];
  for (const w of todo) {
    const last = batches[batches.length - 1];
    if (last && last.length < BATCH && last[0].unitId === w.unitId) last.push(w);
    else batches.push([w]);
  }
  console.log(`${todo.length} words to write, in ${batches.length} requests to ${MODEL}.`);
  if (!todo.length) return;

  if (dryRun) {
    console.log("\n--- system ---\n" + SYSTEM + "\n\n--- first request ---\n" + userPrompt(batches[0][0].level, batches[0]));
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\n❌ No API key. Create vocab/.env with one line:  ANTHROPIC_API_KEY=sk-ant-...\n");
    process.exit(1);
  }

  const client = new Anthropic();
  const problems: string[] = [];
  let saved = 0;

  for (const [n, batch] of batches.entries()) {
    process.stdout.write(`[${n + 1}/${batches.length}] ${batch[0].level} · ${batch[0].unitTitle} (${batch.length} words) … `);
    let results: Generated[];
    try {
      results = await ask(client, batch[0].level, batch);
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        console.error("\n❌ The API key was not accepted. Check vocab/.env.");
        process.exit(1);
      }
      const msg = err instanceof Anthropic.APIError ? `API error ${err.status}: ${err.message}` : String(err);
      console.log(`failed — ${msg}`);
      problems.push(...batch.map((w) => `${w.id} ${w.arabic}: request failed (${msg})`));
      continue;
    }

    let ok = 0;
    for (const w of batch) {
      let entry = check(w, results.find((r) => r.id === w.id));
      if (typeof entry === "string") {
        // One more try on its own.
        try {
          entry = check(w, (await ask(client, w.level, [w]))[0]);
        } catch (err) {
          entry = String(err);
        }
      }
      if (typeof entry === "string") problems.push(`${w.id} ${w.display} (${w.unitTitle}): ${entry}`);
      else {
        examples[w.id] = entry;
        ok++;
      }
    }
    saved += ok;
    saveExamples(examples); // after every batch, so nothing is lost if it stops
    console.log(`${ok} saved`);
  }

  writeFileSync(
    REPORT,
    `# Example sentence report\n\nLast run: ${new Date().toISOString()} · ${saved} sentences saved · ${problems.length} words skipped.\n\n` +
      "Skipped words have no sentence, so they are left out of the sentence activities. A teacher can write one on the /teacher page.\n\n" +
      (problems.length ? problems.map((p) => `- ${p}`).join("\n") : "_Nothing skipped._") +
      "\n",
  );
  console.log(`\nDone: ${saved} saved, ${problems.length} skipped (see data/examples-report.md). All new sentences need a teacher's review.`);
}

main();
