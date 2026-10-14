# Alsama Arabic — Levantine Arabic for Beginners

A Levantine (Shami) Arabic learning app for **Alsama Language School**.
Plain HTML, CSS and JavaScript, with no build step. Hosted on Vercel.

## Folders

| Folder | What's inside |
|---|---|
| `index.html` | The app's front page |
| `css/` | Styles (brand colours, fonts) |
| `js/` | App code: screens, audio, music, stickers, registration |
| `assets/audio/` | 81 recordings + `manifest.json` (Arabic text → file) |
| `assets/logo/` | Alsama Language School logo |
| `assets/stickers/` | Alsama Project photos used as stickers (to be uploaded) |
| `legacy/` | The original alphabet app, **unchanged**. Still works at `/legacy/arabic-alphabet-app.html` |
| `api/` | Server functions on Vercel: save and delete learner registrations |
| `supabase/` | Database setup (`schema.sql`) |
| `docs/` | Missing recordings, sticker list, **setup-registrations.md** (Supabase + email) |
| `scripts/` | `extract-assets.js` — pulls audio and logo out of the legacy file |

## Try it on your computer

You only need a browser. For audio to load correctly, serve the folder instead of
double-clicking the file:

```
npx serve .
```

Then open the address it prints (usually http://localhost:3000).
