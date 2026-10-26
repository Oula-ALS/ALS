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

## Environment variables

See `.env.example`. Secrets live only in `.env.local` (locally) and in Vercel → Project →
Settings → Environment Variables (online). Never commit them.

| Name | What it is |
|---|---|
| `TEACHER_EMAIL` | Who receives new-student and writing emails |
| `TEACHER_PASSWORD` | Password for the teacher dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server key (server only) |
| `RESEND_API_KEY` | Resend key for sending email |
| `EMAIL_FROM` | Verified sender address |

## Deploy

In Vercel, create a new project from this repo and set **Root Directory** to `arabic-lab`.
Add the environment variables above, then deploy.

## Folders

- `app/` – screens (routes)
- `components/` – shared UI (header, logo, waves…)
- `lib/` – logic (stats, local student data; later quiz, XP, intro builder)
- `public/brand/` – Alsama logo (plus a lightened dark-mode copy) and welcome photo

## Progress

- [x] Stage 1 – setup, brand, dark mode, welcome screen
- [ ] Stage 2 – content import (needs the CSVs, PDF and Book1.docx)
- [ ] Stage 3 – registration + teacher email
- [ ] Stage 4 – home, Words and the three games
- [ ] Stage 5 – Top 100 phrases and grammar
- [ ] Stage 6 – About Me and Writing
- [ ] Stage 7 – teacher dashboard
- [ ] Stage 8 – PWA, tests, QA
