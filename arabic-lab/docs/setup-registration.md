# Switch on student registration (one-time setup)

You need about 15 minutes. Until this is done, registration only works on your own
computer (`npm run dev`), where students are saved to `arabic-lab/.data/students.json`.

## 1. Supabase (stores the students)

1. Go to https://supabase.com → your project (or **New project**).
2. **SQL Editor → New query**, paste everything from `arabic-lab/supabase/schema.sql`, press **Run**.
   (It creates three tables: `students`, `writings`, `settings`. Running it again is safe.)
3. **Project Settings → API**: copy the **Project URL** and the **service_role** key.
   The service_role key is secret: never paste it into code or chat.

## 2. Resend (sends you the "New Alsama student" email)

1. Go to https://resend.com → **API Keys → Create API key**. Copy it.
2. **Domains → Add domain** → `alsamaproject.com`, add the DNS records it shows.
   (Until the domain is verified, Resend only sends to your own Resend login email.)

## 3. Vercel (runs the app)

1. https://vercel.com → **Add New → Project** → choose the `ALS` repo.
2. Set **Root Directory** to `arabic-lab`.
3. **Environment Variables**, add:

| Name | Value |
|---|---|
| `SUPABASE_URL` | Project URL from step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from step 1 |
| `RESEND_API_KEY` | key from step 2 |
| `EMAIL_FROM` | `Alsama Arabic Lab <lab@alsamaproject.com>` |
| `TEACHER_EMAIL` | `Oula.Khalaf@alsamaproject.com` |
| `TEACHER_PASSWORD` | a password you choose (used in Stage 7) |

4. **Deploy**. Then register yourself as a test student: you should get the email and see
   the row in Supabase → **Table Editor → students**.
5. Open `/teacher` on your app's address and log in with `TEACHER_PASSWORD`.
