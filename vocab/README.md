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
| `/beginner/all/flashcards` | Flashcards for the whole level |
| `/advanced/topic-13` | Advanced topic 13 |

## Updating the word lists

1. Export each sheet as CSV and put it in `data/raw/`. The file name must contain
   `Book1`, `B1` or `Advanced` so the app knows the level.
2. Run `npm run build-data`.
3. Open `data/report.md` to see possible mistakes (duplicates, wrong part of speech,
   empty cells). Nothing in the report is changed automatically — fix it in the sheet.

## Recordings

Put a recording at `public/audio/{word id}.mp3` and run `npm run build-data`. The app then
plays it instead of the phone's computer voice. Word ids are in `src/data/*.json`.

## Privacy

Student name, class and progress are saved only on the student's own device. Nothing is sent.
