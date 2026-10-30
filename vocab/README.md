# Alsama Vocab

Quizlet-style vocabulary app for Alsama's Levantine Arabic students. **Work in progress** —
the full guide (deploy, updating words) comes in the last phase.

## Updating the word lists (for now)

1. Export each sheet as CSV and put it in `data/raw/`. The file name must contain
   `Book1`, `B1` or `Advanced` so the app knows the level.
2. Run `npm install` once, then `npm run build-data`.
3. Open `data/report.md` to see possible mistakes (duplicates, wrong part of speech,
   empty cells). Nothing in the report is changed automatically — fix it in the sheet.
