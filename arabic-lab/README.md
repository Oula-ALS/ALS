# Alsama Arabic Lab

A mobile-first web app for Alsama Language School students to practise Levantine Arabic
between classes: session vocabulary, the Top 100 phrases, Book 1 grammar, About Me and writing.

Stack: Next.js (App Router) + TypeScript + Tailwind · Supabase · Resend · Vercel.

## Run it locally

```bash
cd arabic-lab
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Content (words)

1. Put the three vocabulary CSVs in `content/source/` (original file names).
2. Run `npm run import-content`. It writes `content/vocab.json` and `content/import-report.md`
   (fixes made and anything suspicious). Until then a small **sample** list is used.

Real recordings: put `public/audio/<word id>.mp3` and list the id in `content/recordings.json`;
it then plays instead of the computer voice.

## Tests

`npm test` (CSV import, quiz generator, XP/stars/ranks/streaks, intro builder, writing checklist).

## Environment variables

See `.env.example`. Secrets live only in `.env.local` (locally) and in Vercel → Project →
Settings → Environment Variables (online). Never commit them.
Step-by-step setup: `docs/setup-registration.md`.

Without Supabase keys, `npm run dev` saves students to `.data/students.json` and prints
the teacher email in the terminal, so you can try everything locally.

| Name | What it is |
|---|---|
| `TEACHER_EMAIL` | Who receives new-student and writing emails |
| `TEACHER_PASSWORD` | Password for the teacher dashboard |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key (server only) |
| `RESEND_API_KEY` | Resend key for sending email |
| `EMAIL_FROM` | Verified sender address |

## Deploy

In Vercel, create a new project from this repo and set **Root Directory** to `arabic-lab`.
Add the environment variables above, then deploy.

## Folders

- `app/` – screens (routes)
- `components/` – shared UI (header, logo, waves…)
- `app/api/students/` – register / edit / delete (server)
- `lib/` – logic (picker options, validation, local student data; `lib/server/` = database + email)
- `supabase/schema.sql` – database table
- `components/words/` – word list, flashcards, quiz, match
- `lib/content/` – CSV import + content loader · `lib/games/` – quiz, scoring · `lib/progress.ts` – XP, streak, stars (on the device)
- `content/` – vocab.json, sample list, source CSVs · `scripts/` – import script · `tests/`
- `content/writing.ts` – writing topics · `lib/about-me.ts` – intro builder · `lib/writing/checklist.ts`
- `app/teacher/` + `app/api/teacher/` – teacher dashboard (password: `TEACHER_PASSWORD`)
- `docs/` – setup guide and Arabic to review
- `public/brand/` – Alsama logo (plus a lightened dark-mode copy) and welcome photo

## Progress

- [x] Stage 1 – setup, brand, dark mode, welcome screen
- [ ] Stage 2 – content import (needs the CSVs, PDF and Book1.docx)
- [x] Stage 3 – registration + teacher email, edit and delete my details
- [x] Stage 4 – home, Words and the three games (running on sample words)
- [ ] Stage 5 – Top 100 phrases and grammar
- [x] Stage 6 – About Me (intro, build my sentences, ask your partner) and Writing (13 topics, guided + free, checklist, submit, feedback)
- [x] Stage 7 – teacher dashboard at /teacher (this session, students + CSV, writings inbox, content review)
- [ ] Stage 8 – PWA, tests, QA
