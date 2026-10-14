# Receiving learner registrations (Supabase + email)

The app is ready. Until you finish these steps, new learners can still use the app:
their registration is kept on their device as "pending" and is sent automatically
the next time they open the app after you've finished.

You need about 20 minutes. Everything here is free.

---

## Part 1 — Create the database (Supabase)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**.
   - Organization: your account
   - Name: `alsama-arabic`
   - Database password: click **Generate a password** and save it somewhere safe
   - Region: the one closest to your learners (e.g. *West EU (Ireland)* or *Central EU (Frankfurt)*)
   - Click **Create new project** and wait ~2 minutes.
3. In the left menu click **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` in this project on GitHub, copy **everything**, paste it into the editor, and click **Run**. You should see *"Success. No rows returned."*
5. Get your two keys: left menu → **Project Settings** (⚙️) → **API Keys** (or **Data API**):
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **service_role** secret key — click **Reveal** and copy it.

   ⚠️ The **service_role** key is like a master password. **Never** paste it into
   any file in GitHub, into a chat, or into the website code. It goes **only** into
   Vercel (Part 3).

## Part 2 — Email notifications (Resend) — optional

1. Go to **https://resend.com** → **Sign up** (free: 3,000 emails/month).
2. Left menu → **API Keys** → **Create API Key** → name `alsama-arabic`, permission *Sending access* → **Add**. Copy the key (starts with `re_`).
3. While testing, Resend can only send to **the email address you signed up with**.
   Sign up with **Oula.Khalaf@alsamaproject.com** so notifications reach you.
4. Later (recommended): **Domains** → **Add domain** → `alsamaproject.com`. Resend shows
   a few DNS records; whoever manages the alsamaproject.com website adds them. After
   that you can send from e.g. `app@alsamaproject.com`.

## Part 3 — Add the keys to Vercel

1. Open **https://vercel.com** → your project → **Settings** → **Environment Variables**.
2. Add each of these (Name → Value), leaving *All Environments* ticked, then click **Save**:

| Name | Value |
|---|---|
| `SUPABASE_URL` | your Project URL from Part 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key from Part 1 |
| `RESEND_API_KEY` | your `re_…` key from Part 2 (optional) |
| `NOTIFY_EMAIL` | `Oula.Khalaf@alsamaproject.com` (optional) |
| `NOTIFY_FROM` | only after verifying your domain, e.g. `Alsama Arabic <app@alsamaproject.com>` |

3. Go to **Deployments** → click **⋯** on the newest one → **Redeploy** → **Redeploy**.
   (New keys only work after a redeploy.)

## Part 4 — Test it

1. Open your website in a **private/incognito window** (so it's like a brand-new learner).
2. Click **Start learning**, fill in a test name (e.g. *Test One*), choose an age group, click **Let's go!**
3. You should see **"✅ You are registered with Alsama Language School!"**
4. In Supabase → **Table Editor** → **registrations**: your test row is there.
5. If you set up Part 2: check your inbox for **"New learner: Test One"** (and the spam folder).
6. Delete the test learner in the app (Who's learning → ✏️ → **Delete learner**) and refresh the
   Supabase table — the row disappears.

If you see **"💾 Saved. Your details will be sent…"** instead, the keys aren't working yet:
re-check the names in Part 3 (spelling matters) and that you redeployed.

## Where to see your learners

Supabase → **Table Editor** → **registrations**. You can sort, filter, and export to CSV
(**⋯** → *Export to CSV*). To delete a learner's data on request, select the row → **Delete**.

## Privacy notes

- The form tells learners why their details are collected, and only name and age group are required.
- Learners under 13 can only register with a parent/guardian's agreement (the database enforces this too).
- Birthday, favourite word and learning progress are **not** sent — they stay on the device.
- Learners can delete their own registration from the app at any time.
- Consider adding a short privacy notice to the Alsama website that mentions this app.
