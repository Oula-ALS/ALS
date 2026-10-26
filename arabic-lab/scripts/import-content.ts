// Builds content/vocab.json from the Alsama vocabulary CSVs.
//
//   npm run import-content
//
// Put the CSVs in arabic-lab/content/source/ with their original names. If none
// are there yet, the sample list in content/sample/ is used instead (marked as sample).
// A report of fixes and anything suspicious is written to content/import-report.md.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { importVocabCsv } from "../lib/content/csv";
import type { LevelId, Unit, VocabFile } from "../lib/content/types";

const root = path.join(__dirname, "..");
const SOURCES: Array<{ level: LevelId; file: string }> = [
  { level: "book1", file: "Book1 - Vocabs- 437words.csv" },
  { level: "b1", file: "B1_Vocabs_211words.csv" },
  { level: "advanced", file: "Advanced_Level_Vocabs_431words.csv" },
];

const found = SOURCES.filter((s) => existsSync(path.join(root, "content/source", s.file)));
const sample = found.length === 0;
const inputs: Array<{ level: LevelId; file: string; dir: string }> = sample
  ? [{ level: "book1", file: "sample-words.csv", dir: "content/sample" }]
  : found.map((s) => ({ ...s, dir: "content/source" }));

const units: Unit[] = [];
const report: string[] = [];
for (const input of inputs) {
  const text = readFileSync(path.join(root, input.dir, input.file), "utf8");
  const result = importVocabCsv(text, input.level, input.file);
  const count = result.units.reduce((n, u) => n + u.words.length, 0);
  console.log(`${input.file}: ${result.units.length} units, ${count} words, ${result.warnings.length} notes`);
  report.push(`## ${input.file}\n\n${result.units.length} units · ${count} words\n`);
  report.push(...(result.warnings.length ? result.warnings.map((w) => `- ${w}`) : ["- No problems found."]), "");
  units.push(...result.units);
}
for (const s of SOURCES.filter((s) => !found.includes(s))) {
  report.push(`## ${s.file}\n\n- Not found in content/source/ — not imported yet.\n`);
}

const vocab: VocabFile = { generatedAt: new Date().toISOString(), sample, units };
writeFileSync(path.join(root, "content/vocab.json"), JSON.stringify(vocab, null, 1) + "\n");
writeFileSync(
  path.join(root, "content/import-report.md"),
  `# Vocabulary import report\n\n${sample ? "**Sample words only** — the real CSVs are not in content/source/ yet.\n\n" : ""}${report.join("\n")}\n`,
);
console.log(sample ? "Wrote content/vocab.json (SAMPLE words)" : "Wrote content/vocab.json");
