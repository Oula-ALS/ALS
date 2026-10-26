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
- `docs/` – setup guide and Arabic to review
- `public/brand/` – Alsama logo (plus a lightened dark-mode copy) and welcome photo

## Progress

- [x] Stage 1 – setup, brand, dark mode, welcome screen
- [ ] Stage 2 – content import (needs the CSVs, PDF and Book1.docx)
- [x] Stage 3 – registration + teacher email, edit and delete my details
- [ ] Stage 4 – home, Words and the three games
- [ ] Stage 5 – Top 100 phrases and grammar
- [ ] Stage 6 – About Me and Writing
- [ ] Stage 7 – teacher dashboard
- [ ] Stage 8 – PWA, tests, QA
