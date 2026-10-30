/**
 * Makes MP3s with a Lebanese (or Syrian) computer voice from Azure, for words that
 * have no Alsama recording yet.
 *
 *   npm run generate-audio -- --level beginner --unit 1
 *   npm run generate-audio -- --dry-run
 *
 * Options: --level beginner|intermediate|advanced · --unit N · --limit N
 *          --voice ar-LB-LaylaNeural (default) | ar-LB-RamiNeural | ar-SY-AmanyNeural | ar-SY-LaithNeural
 *          --redo (make computer-voice files again) · --dry-run
 *
 * - Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in vocab/.env (never commit that file).
 * - Writes ONLY to public/audio/tts/{word id}.mp3. It never touches public/audio/{id}.mp3,
 *   which is where Alsama's own recordings go, and it skips words that already have one.
 * - The app labels these files "Lebanese computer voice", never as a recording.
 * - Afterwards run `npm run build-data` so the app knows about the new files.
 */
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Level, LevelData, Word } from "../src/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECORDINGS = join(ROOT, "public/audio");
const TTS_DIR = join(ROOT, "public/audio/tts");

const argv = process.argv.slice(2);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const flag = (name: string) => argv.includes(`--${name}`);
const onlyLevel = opt("level") as Level | undefined;
const onlyUnit = opt("unit") ? Number(opt("unit")) : undefined;
const limit = opt("limit") ? Number(opt("limit")) : Infinity;
const voice = opt("voice") ?? "ar-LB-LaylaNeural";
const redo = flag("redo");
const dryRun = flag("dry-run");

const escapeXml = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

/** What is spoken: every form of the word, with a short pause between them. */
function ssml(word: Word): string {
  const lang = voice.slice(0, 5);
  const forms = word.alternatives.map((f) => escapeXml(f.replace(/…/g, "").replace(/ـ/g, "").trim())).filter(Boolean);
  return `<speak version="1.0" xml:lang="${lang}"><voice name="${voice}">${forms.join('<break time="400ms"/>')}</voice></speak>`;
}

async function synthesize(word: Word, key: string, region: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "alsama-vocab",
      },
      body: ssml(word),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    if (res.status === 401) throw new Error("the Azure key was not accepted (check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION)");
    throw new Error(`Azure error ${res.status}: ${await res.text()}`);
  }
}

async function main() {
  const levels: Level[] = onlyLevel ? [onlyLevel] : ["beginner", "intermediate", "advanced"];
  const todo = levels
    .flatMap((l) => (JSON.parse(readFileSync(join(ROOT, `src/data/${l}.json`), "utf8")) as LevelData).words)
    .filter((w) => onlyUnit === undefined || w.unitOrder === onlyUnit)
    .filter((w) => !existsSync(join(RECORDINGS, `${w.id}.mp3`))) // has an Alsama recording: never replace it
    .filter((w) => redo || !existsSync(join(TTS_DIR, `${w.id}.mp3`)))
    .slice(0, limit);

  console.log(`${todo.length} words to make with ${voice}.`);
  if (!todo.length) return;
  if (dryRun) {
    for (const w of todo.slice(0, 3)) console.log(`\npublic/audio/tts/${w.id}.mp3  (${w.english})\n${ssml(w)}`);
    return;
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    console.error("\n❌ Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (e.g. westeurope) to vocab/.env\n");
    process.exit(1);
  }

  mkdirSync(TTS_DIR, { recursive: true });
  let made = 0;
  const failed: string[] = [];
  for (const [i, w] of todo.entries()) {
    try {
      writeFileSync(join(TTS_DIR, `${w.id}.mp3`), await synthesize(w, key, region));
      made++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not accepted")) {
        console.error(`\n❌ ${msg}`);
        process.exit(1);
      }
      failed.push(`${w.id} ${w.display}: ${msg}`);
    }
    if ((i + 1) % 25 === 0 || i === todo.length - 1) console.log(`${i + 1}/${todo.length}`);
  }
  console.log(`\nDone: ${made} files in public/audio/tts/.${failed.length ? ` ${failed.length} failed:\n- ${failed.join("\n- ")}` : ""}`);
  console.log("Next: npm run build-data (so the app uses them), listen to a few, then commit.");
}

main();
