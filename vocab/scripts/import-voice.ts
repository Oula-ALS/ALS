/**
 * Adds the words made by the Colab notebook (tools/oula-ai-voice.ipynb) to the app.
 *
 *   npm run import-voice -- path/to/oula-ai-voice.zip
 *
 * - Copies clone/{word id}.mp3 into public/audio/clone/ (Oula's AI voice).
 * - Only real word ids, only MP3s, and never a word that has Oula's real recording.
 * - Then runs build-data so the app knows about the new files.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { LevelData } from "../src/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const zip = process.argv[2];
if (!zip || !existsSync(zip)) {
  console.error("Usage: npm run import-voice -- path/to/oula-ai-voice.zip");
  process.exit(1);
}

const ids = new Set(
  ["beginner", "intermediate", "advanced"].flatMap((l) =>
    (JSON.parse(readFileSync(join(ROOT, `src/data/${l}.json`), "utf8")) as LevelData).words.map((w) => w.id),
  ),
);

const tmp = mkdtempSync(join(tmpdir(), "oula-voice-"));
execFileSync("unzip", ["-q", "-o", zip, "-d", tmp]);
const src = join(tmp, "clone");
if (!existsSync(src)) {
  console.error("❌ The zip has no clone/ folder. Is it the file from the Colab notebook?");
  process.exit(1);
}

const dest = join(ROOT, "public/audio/clone");
mkdirSync(dest, { recursive: true });
let added = 0;
const skipped: string[] = [];
for (const name of readdirSync(src)) {
  const id = name.replace(/\.mp3$/, "");
  const file = join(src, name);
  if (!name.endsWith(".mp3") || !ids.has(id)) skipped.push(`${name}: not a word in the app`);
  else if (existsSync(join(ROOT, "public/audio", name))) skipped.push(`${name}: has Oula's real recording (kept)`);
  else if (statSync(file).size < 1500) skipped.push(`${name}: empty sound`);
  else {
    copyFileSync(file, join(dest, name));
    added++;
  }
}
console.log(`Added ${added} words in Oula's AI voice.${skipped.length ? `\nSkipped ${skipped.length}:\n- ${skipped.join("\n- ")}` : ""}`);
const check = join(tmp, "check-these.txt");
if (existsSync(check)) console.log("\n" + readFileSync(check, "utf8"));
execFileSync("npm", ["run", "build-data"], { cwd: ROOT, stdio: "inherit" });
