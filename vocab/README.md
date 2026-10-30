# Alsama Vocab

Quizlet-style vocabulary app for Alsama Language School students (Lebanese Arabic).
**Work in progress** — the full guide (deploy, updating words) comes in the last phase.

## Try it on your computer

```
npm install
npm run dev
```
Then open the address it prints (usually http://localhost:5173).

## Links teachers can share

| Link | Opens |
|---|---|
| `/beginner` | Beginner units |
| `/beginner/unit-3` | Unit 3 word list (with a "Copy link" button) |
| `/beginner/unit-3/flashcards` | Flashcards for unit 3 |
| `/beginner/unit-3/write` | Listen & write for unit 3 |
| `/beginner/unit-3/quiz` | Quiz for unit 3 |
| `/beginner/unit-3/sentence` | Use the word in a sentence (approved sentences only) |
| `/beginner/unit-3/complete` | Complete the sentence (approved sentences only) |
| `/teacher` | Teachers: review example sentences (passcode) |
| `/beginner/all/flashcards` | Flashcards for the whole level |
| `/advanced/topic-13` | Advanced topic 13 |

## Checks

`npm test` checks the Arabic answer matching, the wrong options in multiple choice, and
the review boxes, using the real word lists.

## Updating the word lists

1. Export each sheet as CSV and put it in `data/raw/`. The file name must contain
   `Book1`, `B1` or `Advanced` so the app knows the level.
2. Run `npm run build-data`.
3. Open `data/report.md` to see possible mistakes (duplicates, wrong part of speech,
   empty cells). Nothing in the report is changed automatically — fix it in the sheet.

## Example sentences

Students only see sentences a teacher has **approved**.

**1. Write sentences with AI (on your computer, once per batch of words)**

1. Copy `.env.example` to `.env` and put your Anthropic API key after `ANTHROPIC_API_KEY=`.
   `.env` is never uploaded (it is in `.gitignore`).
2. Try one unit first: `npm run generate-examples -- --level beginner --unit 1`
3. Then the rest: `npm run generate-examples` (about 90 requests for all 1,079 words, a few dollars).
   It saves after every batch, never changes approved or rejected sentences, and lists
   words it couldn't do in `data/examples-report.md`.
4. Commit and deploy. New sentences are "to review" — students don't see them yet.

**2. Teachers review (on the website)**

1. Set `TEACHER_PASSCODE` in Vercel → Project → Settings → Environment Variables, then redeploy.
2. Teachers open `/teacher`, type the passcode, and approve ✓, edit ✎ or reject ✗ each sentence.
   They can also write a sentence for a word that has none.
3. When done, they press **Export examples.json** and send you the file.

**3. Publish**

Replace `src/data/examples.json` with the exported file (if several teachers sent files, open
`/teacher`, use **Import** for each, then **Export** once), then commit and deploy.

## Recordings

Put a recording at `public/audio/{word id}.mp3` and run `npm run build-data`. The app then
plays it instead of the phone's computer voice. Word ids are in `src/data/*.json`.

## Privacy

Student name, class and progress are saved only on the student's own device. Nothing is sent.
