# Alsama Levantine Arabic App — rules for Claude

The owner is a beginner developer. Explain decisions in simple English, work in small
stages, and ask for approval before each stage. After each stage report:
completed · files changed · how to test · what remains · single next action.

## Hard rules

1. Never edit or delete `legacy/arabic-alphabet-app.html`. It is the reference and asset source.
2. Never replace the owner's recordings with synthetic or non-Levantine speech. Missing clip →
   show "Recording coming soon" and list it in `docs/missing-recordings.md`.
3. Plain HTML + CSS + JavaScript modules, no build step, no frameworks unless approved.
4. No secrets in browser code. Secrets live only in Vercel environment variables.
5. Never invent Alsama images. Use labelled placeholders until real photos are uploaded.
6. Test before saying "done". A visible button is not a working feature.
7. Registration details are sent to Alsama **transparently**: the form explains why, only name
   and age group are required, under-13s need parent/guardian consent, learners can delete their
   data. Learning progress stays on the device. Never collect or send data covertly.

## Brand

Magenta `#B7155A` · burgundy `#4F0927` · pink `#F5A9CA` · muted `#906060` · off-white `#FFF9F5`.
Fonts: Noto Naskh Arabic (Arabic), Nunito (English). `lang="ar" dir="rtl"` on all Arabic text.
Warm, inclusive, polished; for teens and adults, not preschool.

## Language

Teach **Lebanese Arabic** (owner's brief, 16 Oct 2026) with MSA spelling and Lebanese pronunciation. Label MSA vs Shami
where they differ. Honest descriptions of ع ح خ غ ق ص ض ط ظ (no fake English equivalents).
Non-connecting letters: ا د ذ ر ز و. Letter content lives in `js/data/letters.js`; every shape
example must contain the letter once, in the labelled position (verified by script in Stage 3).

## Stages

0 Inspect ✅ · 1 Setup ✅ · 2 Core shell ✅ · 2b Registration, letter Back/Next/Home, music ✅ ·
3 Alphabet explorer ✅ (tips, Shami notes, example words, shapes in words, find-the-letter) · 4 Lessons + tracing ✅ (6 lessons inside the sections; `js/tracing.js`, never graded) ·
5 Stickers · 6 Games · 7 Progress · 8 Teacher email reports · 9 Full QA
**16 Oct 2026 brief ✅:** Welcome → Student info → Dashboard with six sections (ABC Alphabet, Short
Sounds, Long Sounds, Writing & Speaking, Listening & Speaking, Practice & Games). No pop-up after
registration. Engine: `js/exercises.js` (choose/match/build/type/speak); activities: `js/sections.js`;
content: `js/data/content.js`. Progress = real activity log in `js/progress.js` (`stats()`, `level()`,
`countWrittenWords()` — correct answers only, once per exercise per day, letters not counted).
Recording via MediaRecorder (`js/recorder.js`), never uploaded, never scored.

## Assets

- Audio: `assets/audio/manifest.json` maps Arabic text → file. Regenerate legacy clips with
  `node scripts/extract-assets.js` (it rewrites the manifest — re-add later entries afterwards).
  Letter names are Oula's Lebanese recordings in `assets/audio/letters-lebanese/` (23 Oct 2026;
  ث = ت and ذ = د on purpose). Recording checklist with file codes: `docs/recording-list.md`.
- Teaching follows Oula's **Alphabet Workbook**: Group 1 = ا د ذ ر ز و (2 shapes, never join forward),
  Group 2 = the other 22 (4 shapes) — `groupOf()` in `js/data/letters.js`. Vowel order a · o · i,
  each short vowel is "half" of its long one (aa · oo · ee); practice table with ر.
- Welcome greeting (Oula's voice) plays by itself once per visit — on the first tap if the browser
  blocks autoplay (`greetVisitor()` in `js/app.js`). No greeting button on the welcome page.
  Flying letters on the welcome page (tap → letter name; still with reduced motion).
- ث = ت and ذ = د sound the same: `withTwinTip()` in `js/sections.js` adds a 💡 dots tip to every
  activity that gives the letter only by sound; match games never pair the twins.
- "Words to know" page (`#/words`) + a card on each letter page; activities only use recorded words.
- Lessons 1–6 have 11–15 exercises each (lesson 1: ث/ذ dots card + countDots; lesson 2: shapes table,
  pickShape, connectLetters, breakWord; lesson 3: breakInWord). ABC: a-dots, a-shapes, a-join. Activities have 10+.
- One-file copy for Oula (double-click, no website): `node scripts/export-single-file.js out.html`.
  Registration/emails don't work in it (they need the website); everything else does.
- Stickers: real Alsama photos in `assets/stickers/` + `assets/images/`, mapped to events in
  `assets/stickers/stickers.json` (see `docs/sticker-list.md`). Graduates sticker replaces the old owl. Logo: `assets/logo/alsama-language-school.png`.

## Backend

- `api/register.js`, `api/delete-registration.js`: Vercel functions → Supabase table `registrations`
  (`supabase/schema.sql`, RLS on, no policies; only the service-role key in Vercel can access it).
- Optional email via Resend. Setup steps for the owner: `docs/setup-registrations.md`.
- Music and sound effects are generated in `js/music.js` (Web Audio, no files). Recordings duck the
  music via the `alsama:voice` event from `js/audio.js`.

## Vocab app (`vocab/`, separate app, started 30 Oct 2026)

Quizlet-style vocabulary app, approved to use **Vite + React + TypeScript + Tailwind** (exception to
rule 3, for this folder only). Colours: white + `#B7155A`. Data: `vocab/data/raw/*.csv` →
`npm run build-data` → `vocab/src/data/*.json` + `vocab/data/report.md` (never auto-fix the CSVs).
Word ids are hashes of the Arabic, so moving rows keeps progress. Student info stays on the device.
Audio: `public/audio/{id}.mp3` first; otherwise a clearly labelled computer voice (can be turned off).
Phases: 1 Plan ✅ · 2 Data ✅ · 3 Core app + welcome/student info ✅ · 4 Write + Quiz ✅ (`npm test`) · 5 Example
sentences + teacher page ✅ · 6 PWA, QR, review, dark mode, deploy.
Sentences: `vocab/src/data/examples.json` (keyed by word id; `reviewed`, `rejected`, `answer`, `cloze`).
Students see only `approvedExample()` (reviewed and not rejected). AI writes them with
`npm run generate-examples` (key in `vocab/.env`, never committed); teachers review on `/teacher`
(passcode via `api/teacher-login.js` + `TEACHER_PASSCODE` in Vercel; open without passcode in `npm run dev`)
and export the file. 31 sample sentences for Beginner Unit 3 were written by Claude, `source: "claude-sample"`.
