// Plays Arabic out loud: a real recording if one exists for the word,
// otherwise the device's Arabic computer voice (Web Speech API).
import recordings from "@/content/recordings.json";

const recorded = new Set<string>(recordings as string[]);
const PREFERRED = ["ar-LB", "ar-SY", "ar-JO", "ar-PS"]; // Levantine first, if the device has them

let current: HTMLAudioElement | null = null;

export function arabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ar"));
  for (const lang of PREFERRED) {
    const v = voices.find((x) => x.lang.toLowerCase() === lang.toLowerCase());
    if (v) return v;
  }
  return voices[0] ?? null;
}

export const hasRecording = (id?: string) => !!id && recorded.has(id);

/** Returns false if nothing could be played (no recording and no Arabic voice). */
export function speakArabic(text: string, id?: string): boolean {
  current?.pause();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  if (hasRecording(id)) {
    current = new Audio(`/audio/${id}.mp3`);
    void current.play();
    return true;
  }
  const voice = arabicVoice();
  if (!voice) return false;
  const u = new SpeechSynthesisUtterance(text.replace(/\//g, "، "));
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
  return true;
}
