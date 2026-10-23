# Missing recordings

> **Recording checklist with codes:** see [recording-list.md](recording-list.md). This page has the background notes.

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

### 0. Letter names in Lebanese (priority: highest — requested 18 Oct 2026)

The 28 letter-name recordings came from the old app and say the names the formal way
(بَاء "bāʾ", تَاء "tāʾ" …). To hear them the Lebanese way, they need to be re-recorded.
Suggested Lebanese names (please correct any you say differently):

| Letter | Say | Letter | Say | Letter | Say | Letter | Say |
|---|---|---|---|---|---|---|---|
| ا | alef | د | dāl | ض | ḍād | ك | kāf |
| ب | be | ذ | zāl | ط | ṭa | ل | lām |
| ت | te | ر | re | ظ | ẓa | م | mīm |
| ث | the / se | ز | zēn | ع | ʿēn | ن | nūn |
| ج | jīm (zhīm) | س | sīn | غ | ghēn | ه | he |
| ح | ḥe | ش | shīn | ف | fe | و | wāw |
| خ | khe | ص | ṣād | ق | ʾāf | ي | ye |

Name each file with the English spelling (e.g. `be.ogg`, `te.ogg`) or type the letter
in the message. Each new recording replaces the old one for that letter automatically.

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

Each letter page shows one everyday example word. Six already have your recordings
(بيت، دار، سمك، موز، نور، ورد). Please record these, said the way you say them in Shami:

| Letter | Word | Say it | Meaning | Suggested file name |
|---|---|---|---|---|
| ا | أرنب | arnab | rabbit | `words/arnab.mp3` |
| ت | تفاحة | tiffāḥa | apple | `words/tiffaha.mp3` |
| ث | ثلج | talj | snow | `words/talj.mp3` |
| ج | جبنة | jibne | cheese | `words/jibne.mp3` |
| ح | حليب | ḥalīb | milk | `words/halib.mp3` |
| خ | خبز | khebez | bread | `words/khebez.mp3` |
| ذ | ذهب | dahab | gold | `words/dahab.mp3` |
| ر | رز | rizz | rice | `words/rizz.mp3` |
| ز | زيتون | zeitūn | olives | `words/zeitun.mp3` |
| ش | شمس | shams | sun | `words/shams.mp3` |
| ص | صابون | ṣābūn | soap | `words/sabun.mp3` |
| ض | ضفدع | ḍifdaʿ | frog | `words/difda.mp3` |
| ط | طاولة | ṭāwle | table | `words/tawle.mp3` |
| ظ | ظرف | ẓarf | envelope | `words/zarf.mp3` |
| ع | عنب | ʿinab | grapes | `words/inab.mp3` |
| غ | غيمة | ghēme | cloud | `words/gheme.mp3` |
| ف | فلافل | falāfel | falafel | `words/falafel.mp3` |
| ق | قهوة | ʾahwe | coffee | `words/ahwe.mp3` |
| ك | كتاب | ktāb | book | `words/ktab.mp3` |
| ل | ليمون | laymūn | lemon | `words/laymun.mp3` |
| ه | هوا | hawa | air, wind | `words/hawa.mp3` |
| ي | ياسمين | yasmīn | jasmine | `words/yasmin.mp3` |

Manifest line example: `"تفاحة": "audio/words/tiffaha.mp3",` (the key is the word exactly as written above, without vowel marks).

### 3. Celebration sound "برافووووو!" ✅ received (clip-3, 16 Oct 2026)

A short (1–3 second) recording of you saying **برافووووو!** in the way you want students
to hear it. Save as `assets/audio/phrases/bravo.mp3` and add to the manifest:
`"برافو": "audio/phrases/bravo.mp3",` — the celebration screen will play it automatically.

The 28-second WhatsApp voice note received on 14 Oct 2026 is **not** used in the app yet:
it could not be listened to here, and it is too long for a celebration sound.

### 4. Encouragement messages (priority: optional)

برافو! · ممتاز! · برافو عليك! · شاطر! · شاطرة! · يلا، جرّب مرة تانية! · كل محاولة بتعلّمك شي جديد! · أهلاً وسهلاً في عيلة مدرسة السما للغات!

## Received but not yet labelled (16 Oct 2026)

Five WhatsApp voice notes were received. They have been **cleaned** (rumble and hiss
reduced, silence trimmed, volume evened out — see below) and saved as
`assets/audio/incoming/clip-1.mp3` … `clip-5.mp3`. They are **not used in the app yet**
because each one still needs to be matched to the word or sound it contains.

| File | Length after cleaning | What does it say? |
|---|---|---|
| clip-1.mp3 (sent 10:54:04) | 1.6 s | ✅ شاطر → `phrases/shater.mp3` |
| clip-2.mp3 (sent 10:54:08) | 2.0 s | ✅ شاطرة → `phrases/shatra.mp3` |
| clip-3.mp3 (sent 10:54:39) | 3.1 s | ✅ برافوو → now `phrases/bravo.mp3`, used in celebrations |
| clip-4.mp3 (sent 10:54:50) | 4.3 s | ? |
| clip-5.mp3 (sent 10:54:57) | 5.6 s | ? |
| clip-6.mp3 (sent later) | 2.4 s | ✅ يلا جرّب مرة تانية → `phrases/yalla-jarreb.mp3` (masculine; a feminine جرّبي version would be welcome) |

## Long recordings received 19 Oct 2026 — waiting for the teacher's check

Two long recordings (all letters, ~39 s; all words, ~32 s) were cut automatically into 28 + 28
pieces in `assets/audio/incoming/letters/` and `assets/audio/incoming/words/`. The pauses were
uneven, so the cuts may be wrong in places. They are **not used in lessons** until the teacher
confirms each one on the check page: `/tools/check-recordings.html`.

## Audio cleaning

Every new recording goes through `scripts/clean-audio.sh` (ffmpeg): low-rumble and
high-hiss filtering, gentle noise reduction, silence trimmed at both ends, and loudness
evened out so all clips play at the same volume without clipping.

## How to add a recording later

1. Record as MP3 (a phone voice-memo app is fine; quiet room, 1–2 seconds).
2. Save it with the suggested file name in the matching `assets/audio/` folder.
3. Add one line to `assets/audio/manifest.json`, e.g. `"تَ": "audio/syllables/ta.mp3",`
4. Done — no code changes needed.
