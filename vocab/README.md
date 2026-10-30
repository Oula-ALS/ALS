# Alsama Vocab

A vocabulary app for Alsama Language School students learning **Lebanese Arabic**.
It works like Quizlet: every level and unit has its own link that teachers can send to a class.

- 1,079 words in three levels: Beginner (Book 1), Intermediate (A2–B1), Advanced
- Flashcards · Listen & write · Quiz · Use it in a sentence · Complete the sentence
- Search, "Review due words", stars, progress bars, dark mode
- Installs on a phone like an app and works offline after the first visit
- No login. Each student's name and progress stay on their own phone.

---

## 1. Put the app online (once, about 10 minutes)

The app is free to host on **Vercel**.

1. Go to <https://vercel.com>, sign in with GitHub.
2. Click **Add New… → Project**, choose the repository **Oula-ALS/ALS**, click **Import**.
3. Under **Root Directory** click **Edit** and choose **`vocab`**. Vercel then fills in the rest
   by itself (Framework: Vite, Build command: `npm run build`, Output: `dist`).
4. Open **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `TEACHER_PASSCODE` | a passcode for teachers, e.g. `zaatar-2026` (pick your own) |
5. Click **Deploy**. After a minute you get a link like `alsama-vocab.vercel.app`.
   You can connect your own address later in **Settings → Domains**.

From then on, every time a change is saved to the repository, Vercel updates the site by itself.

> This is a separate Vercel project from the alphabet app. The alphabet app stays as it is.

## 2. Links to send to a class

Open a unit and press **🔗 Copy link** or **▦ QR code for handouts** (prints one page with the
logo, the unit name and a big QR code).

| Link | Opens |
|---|---|
| `/beginner` | all Beginner units |
| `/beginner/unit-3` | Unit 3: word list and activities |
| `/beginner/unit-3/flashcards` | Flashcards for unit 3 |
| `/beginner/unit-3/write` | Listen & write |
| `/beginner/unit-3/quiz` | Quiz (10, 20 or all words) |
| `/beginner/unit-3/sentence` | Use it in a sentence (approved sentences only) |
| `/beginner/unit-3/complete` | Complete the sentence (approved sentences only) |
| `/beginner/all/flashcards` | Flashcards for the whole level (works with every activity) |
| `/advanced/topic-13` | Advanced topics use `topic-` instead of `unit-` |
| `/search?q=coffee` | Search |
| `/review` | The student's words due for review |
| `/teacher` | Teachers: review example sentences (passcode) |

**Students installing it on their phone:** open the link, then
iPhone (Safari): **Share → Add to Home Screen** · Android (Chrome): **⋮ → Install app**.

## 3. Updating the words (no coding)

1. In Google Sheets, open the word list and choose **File → Download → CSV**.
   Keep the columns as they are: `Section, POS, العربي, Pronunciation (chat), English`.
2. On GitHub, open the folder **`vocab/data/raw`**, click **Add file → Upload files**, drop the CSV
   in and replace the old one. The file name must contain `Book1`, `B1` or `Advanced`.
   Click **Commit changes**.
3. Someone with the project on their computer runs these two commands in the `vocab` folder,
   then commits and pushes (Claude Code can do this for you: "rebuild the word data"):
   ```
   npm install
   npm run build-data
   ```
4. Open **`vocab/data/report.md`**: it lists possible mistakes (duplicates, wrong part of
   speech, empty cells). Nothing in it is changed automatically — fix the sheet and repeat.
5. Vercel puts the new words online by itself after the push.

Words keep their progress, stars and sentences as long as their Arabic spelling stays the same.

## 4. Example sentences

Students only ever see sentences a teacher has **approved**.

**Write them with AI (on a computer):**
1. Copy `.env.example` to `.env` and put your Anthropic API key after `ANTHROPIC_API_KEY=`.
   `.env` is private and never uploaded.
2. Try one unit: `npm run generate-examples -- --level beginner --unit 1`
3. Then all the rest: `npm run generate-examples` (about 90 requests, a few dollars).
   It never changes sentences that were approved or rejected.
   Words it couldn't do are listed in `data/examples-report.md`.
4. Commit and push. The new sentences wait as "to review".

**Teachers review them (on the website):**
1. Open `/teacher`, type the passcode.
2. Approve ✓, edit ✎ or reject ✗ each sentence, or write one for a word that has none.
   Work is kept in that browser, so it is safe to stop and come back.
3. Press **Export examples.json** and send the file to Oula.

**Publish:** replace `vocab/src/data/examples.json` with the exported file and commit.
Several teachers? Open `/teacher`, **Import** each file, then **Export** once.

## 5. Sound

The app always says what a 🔊 sound is:

| Where the sound comes from | Folder | Label |
|---|---|---|
| **Alsama recording** (always used first) | `public/audio/{file name}.mp3` | "Alsama recording" |
| Lebanese computer voice (optional, Azure) | `public/audio/tts/{file name}.mp3` | "Lebanese computer voice" |
| The phone's own voice (often formal Arabic) | — | "computer voice (may not sound Lebanese)" — students can turn it off |

**Recording words:** `data/recording-list.csv` lists every word with the exact file name to use
(e.g. `beg-1-98d448.mp3` for مرحبا) and whether it is recorded yet. Save MP3s with those names
in `vocab/public/audio/`, run `npm run build-data`, commit.

**Lebanese computer voice (optional):** add `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` to `.env`,
then `npm run generate-audio -- --level beginner --unit 1` (voice `ar-LB-LaylaNeural` by default;
`--voice ar-LB-RamiNeural` for a male voice). It never overwrites or replaces an Alsama recording.
Listen to a few before publishing.

## 6. Privacy

- The student info page asks for a first name, book and (optionally) class. It is saved **only on
  the student's phone** and says so on the page. Students can delete it there.
- Progress, stars and the sentences students write stay on their phone. Nothing is sent anywhere.
- The only server part is the teacher passcode check (`api/teacher-login.js`).

---

## For developers

- Vite + React + TypeScript + Tailwind 4, React Router 6. `npm run dev` · `npm test` · `npm run build`.
- Data: `scripts/build-data.ts` (CSV → `src/data/{level}.json`, `audio.json`, `data/report.md`,
  `data/recording-list.csv`). Word ids are a hash of the Arabic, so moving rows keeps progress.
- Answer checking `src/lib/answer.ts`, wrong options `src/lib/distractors.ts`, review boxes
  `src/lib/leitner.ts`, sentences `src/lib/examples.ts`, search `src/lib/search.ts` — all tested.
- Saved data goes through `src/lib/storage.ts` (localStorage, try/catch). To add accounts later
  (e.g. Supabase), replace `load`/`save` there and in `progress.ts`.
- Colours: CSS variables at the top of `src/index.css` (light and dark).
- Offline: `vite-plugin-pwa` in `vite.config.ts`. The app icon in `public/icons/` is a placeholder
  (magenta square with أ ب) — replace it with an official square logo when there is one.
