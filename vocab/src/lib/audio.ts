// Plays a word aloud.
// 1. If public/audio/{id}.mp3 exists (listed in src/data/audio.json), play that recording.
// 2. Otherwise, if allowed in settings, use the phone's computer voice. Most of these
//    sound like Modern Standard Arabic, not Lebanese, so the app labels it clearly.
import recorded from "../data/audio.json";
import type { Word } from "../types";
import { getSettings } from "./settings";

const RECORDED = new Set<string>(recorded as string[]);
const VOICE_ORDER = ["ar-LB", "ar-SY", "ar-JO"];

export type AudioSource = "recording" | "computer" | "none";

export function hasRecording(word: Word): boolean {
  return RECORDED.has(word.id);
}

function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  const norm = (lang: string) => lang.replace("_", "-");
  for (const lang of VOICE_ORDER) {
    const v = voices.find((x) => norm(x.lang).toLowerCase() === lang.toLowerCase());
    if (v) return v;
  }
  return voices.find((x) => norm(x.lang).toLowerCase().startsWith("ar"));
}

// Voices load late on some browsers; ask once early so they're ready on the first tap.
if (speechSupported()) {
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.("voiceschanged", () => speechSynthesis.getVoices());
}

/** False only when the phone's voice list has loaded and has no Arabic voice. */
function arabicVoiceAvailable(): boolean {
  if (!speechSupported()) return false;
  return speechSynthesis.getVoices().length === 0 || !!pickVoice();
}

export function audioSource(word: Word): AudioSource {
  if (hasRecording(word)) return "recording";
  if (getSettings().computerVoice && arabicVoiceAvailable()) return "computer";
  return "none";
}

let player: HTMLAudioElement | null = null;

/** Returns false when nothing could be played (no recording, no Arabic voice). */
export function playWord(word: Word): boolean {
  const { rate } = getSettings();
  const source = audioSource(word);
  if (speechSupported()) speechSynthesis.cancel();
  player?.pause();

  if (source === "recording") {
    player = new Audio(`/audio/${word.id}.mp3`);
    player.playbackRate = rate;
    player.play().catch(() => {});
    return true;
  }
  if (source === "computer") {
    const voice = pickVoice();
    if (!voice) return false;
    const u = new SpeechSynthesisUtterance(word.arabic.replace(/…/g, ""));
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = rate;
    speechSynthesis.speak(u);
    return true;
  }
  return false;
}

/** Reads a sentence with the computer voice (there are no sentence recordings yet). */
export function canSpeakText(): boolean {
  return getSettings().computerVoice && arabicVoiceAvailable();
}

export function playText(text: string): boolean {
  if (!canSpeakText()) return false;
  const voice = pickVoice();
  if (!voice) return false;
  speechSynthesis.cancel();
  player?.pause();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = getSettings().rate;
  speechSynthesis.speak(u);
  return true;
}
