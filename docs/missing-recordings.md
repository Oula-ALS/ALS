# Missing recordings

The app never replaces your recordings with a synthetic or non-Levantine voice.
If a clip on this list is missing, the app shows **"Recording coming soon"**.

## What we already have (81 clips, extracted from the old app)

| Group | Count | Folder |
|---|---|---|
| Letter names (أَلِف … يَاء) | 28 | `assets/audio/letters/` |
| Syllables: ب م ل ن س ر د × fatha, damma, kasra, long ا و ي | 42 | `assets/audio/syllables/` |
| Words: باب بيت نور دار ملك سمك ورد وعد موز | 9 | `assets/audio/words/` |
| Phrases: مَرْحَبًا، أَحْسَنْت | 2 | `assets/audio/phrases/` |

> **To confirm:** whose voice/accent are these 81 clips? (Your own Levantine recordings, or generated?)

## Needed

### 1. Letter sounds (priority: high) — 20 clips

For each letter below, record the letter with a fatha (e.g. تَ "ta"). Hard letters are marked ★ — these matter most.

| Letter | Say | Suggested file name |
|---|---|---|
| ت | تَ | `syllables/ta.mp3` |
| ث | ثَ | `syllables/tha.mp3` |
| ج | جَ | `syllables/ja.mp3` |
| ح ★ | حَ | `syllables/ha-throat.mp3` |
| خ ★ | خَ | `syllables/kha.mp3` |
| ذ | ذَ | `syllables/dha.mp3` |
| ز | زَ | `syllables/za.mp3` |
| ش | شَ | `syllables/sha.mp3` |
| ص ★ | صَ | `syllables/sa-emphatic.mp3` |
| ض ★ | ضَ | `syllables/da-emphatic.mp3` |
| ط ★ | طَ | `syllables/ta-emphatic.mp3` |
| ظ ★ | ظَ | `syllables/za-emphatic.mp3` |
| ع ★ | عَ | `syllables/ayn-a.mp3` |
| غ ★ | غَ | `syllables/gha.mp3` |
| ف | فَ | `syllables/fa.mp3` |
| ق ★ | قَ (and, if you like, the city-Shami glottal-stop version) | `syllables/qa.mp3` |
| ك | كَ | `syllables/ka.mp3` |
| ه | هَ | `syllables/ha.mp3` |
| و | وَ | `syllables/wa.mp3` |
| ي | يَ | `syllables/ya.mp3` |

ا (alif) has no consonant sound of its own; it is taught through the long vowel سَا / بَا.

### 2. Example words (priority: high)

One example word per letter. The word list will be chosen in **Stage 3** and added
here, so you can record them in one session.

### 3. Celebration sound "برافووووو!" (priority: high)

A short (1–3 second) recording of you saying **برافووووو!** in the way you want students
to hear it. Save as `assets/audio/phrases/bravo.mp3` and add to the manifest:
`"برافو": "audio/phrases/bravo.mp3",` — the celebration screen will play it automatically.

The 28-second WhatsApp voice note received on 14 Oct 2026 is **not** used in the app yet:
it could not be listened to here, and it is too long for a celebration sound.

### 4. Encouragement messages (priority: optional)

برافو! · ممتاز! · برافو عليك! · شاطر! · شاطرة! · يلا، جرّب مرة تانية! · كل محاولة بتعلّمك شي جديد! · أهلاً وسهلاً في عيلة مدرسة السما للغات!

## How to add a recording later

1. Record as MP3 (a phone voice-memo app is fine; quiet room, 1–2 seconds).
2. Save it with the suggested file name in the matching `assets/audio/` folder.
3. Add one line to `assets/audio/manifest.json`, e.g. `"تَ": "audio/syllables/ta.mp3",`
4. Done — no code changes needed.
