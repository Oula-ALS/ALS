/**
 * Reads every word in Oula's AI voice (an ElevenLabs voice copy that Oula made of
 * her own voice, with her consent), for words that have no real recording yet.
 *
 *   npm run generate-voice -- --limit 5          (try 5 words first and listen!)
 *   npm run generate-voice -- --level beginner --unit 1
 *   npm run generate-voice -- --dry-run
 *
 * Options: --level beginner|intermediate|advanced · --unit N · --limit N
 *          --model eleven_multilingual_v2 (default) · --redo · --dry-run
 *
 * - Needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in vocab/.env (never commit that file).
 * - Writes ONLY to public/audio/clone/{word id}.mp3. It never touches public/audio/{id}.mp3,
 *   where Oula's real recordings go, and it skips every word that already has one.
 *   Real recordings always play first, so they replace the AI voice word by word.
 * - The app labels these sounds "Oula's AI voice", never as a recording.
 * - Afterwards run `npm run build-data` so the app knows about the new files.
 */
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Level, LevelData, Word } from "../src/types.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RECORDINGS = join(ROOT, "public/audio");
const CLONE_DIR = join(ROOT, "public/audio/clone");

const argv = process.argv.slice(2);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const flag = (name: string) => argv.includes(`--${name}`);
const onlyLevel = opt("level") as Level | undefined;
const onlyUnit = opt("unit") ? Number(opt("unit")) : undefined;
const limit = opt("limit") ? Number(opt("limit")) : Infinity;
const model = opt("model") ?? "eleven_multilingual_v2";
const redo = flag("redo");
const dryRun = flag("dry-run");

/** What is spoken: every form of the word, with a short pause between them. */
function textFor(word: Word): string {
  return word.alternatives
    .map((f) => f.replace(/…/g, "").replace(/ـ/g, "").trim())
    .filter(Boolean)
    .join("، ");
}

async function synthesize(text: string, key: string, voiceId: string): Promise<Buffer> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0, use_speaker_boost: true },
      }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    if (res.status === 401) throw new Error("the ElevenLabs key was not accepted (check ELEVENLABS_API_KEY)");
    if (res.status === 404) throw new Error("voice not found (check ELEVENLABS_VOICE_ID)");
    throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`);
  }
}

async function main() {
  const levels: Level[] = onlyLevel ? [onlyLevel] : ["beginner", "intermediate", "advanced"];
  const todo = levels
    .flatMap((l) => (JSON.parse(readFileSync(join(ROOT, `src/data/${l}.json`), "utf8")) as LevelData).words)
    .filter((w) => onlyUnit === undefined || w.unitOrder === onlyUnit)
    .filter((w) => !existsSync(join(RECORDINGS, `${w.id}.mp3`))) // has Oula's real recording: never replace it
    .filter((w) => redo || !existsSync(join(CLONE_DIR, `${w.id}.mp3`)))
    .slice(0, limit);

  const chars = todo.reduce((n, w) => n + textFor(w).length, 0);
  console.log(`${todo.length} words to make in Oula's AI voice (about ${chars} characters, model ${model}).`);
  if (!todo.length) return;
  if (dryRun) {
    for (const w of todo.slice(0, 5)) console.log(`  public/audio/clone/${w.id}.mp3  ←  “${textFor(w)}”  (${w.english})`);
    return;
  }

  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voiceId) {
    console.error("\n❌ Add ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID to vocab/.env (see README, “Oula's AI voice”).\n");
    process.exit(1);
  }

  mkdirSync(CLONE_DIR, { recursive: true });
  let made = 0;
  const failed: string[] = [];
  for (const [i, w] of todo.entries()) {
    try {
      writeFileSync(join(CLONE_DIR, `${w.id}.mp3`), await synthesize(textFor(w), key, voiceId));
      made++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("not accepted") || msg.includes("not found")) {
        console.error(`\n❌ ${msg}`);
        process.exit(1);
      }
      failed.push(`${w.id} ${w.display}: ${msg}`);
    }
    if ((i + 1) % 25 === 0 || i === todo.length - 1) console.log(`${i + 1}/${todo.length}`);
  }
  console.log(`\nDone: ${made} files in public/audio/clone/.${failed.length ? ` ${failed.length} failed:\n- ${failed.join("\n- ")}` : ""}`);
  console.log("Next: npm run build-data (so the app uses them), listen to a few, then commit.");
}

main();
