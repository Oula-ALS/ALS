# Alsama Levantine Arabic App — rules for Claude

The owner is a beginner developer. Explain decisions in simple English, work in small
stages, and ask for approval before each stage. After each stage report:
completed · files changed · how to test · what remains · single next action.

## Hard rules

1. Never edit or delete `legacy/arabic-alphabet-app.html`. It is the reference and asset source.
2. Never replace the owner's recordings with synthetic or non-Levantine speech. Missing clip →
   show "Recording coming soon" and list it in `docs/missing-recordings.md`.
3. Plain HTML + CSS + JavaScript modules, no build step, no frameworks unless approved.
4. No secrets in browser code. Secrets live only in Vercel environment variables.
5. Never invent Alsama images. Use labelled placeholders until real photos are uploaded.
6. Test before saying "done". A visible button is not a working feature.
7. Student progress is shared with the teacher **transparently** (a visible line on the profile
   screen and About page). Never collect or send data covertly.

## Brand

Magenta `#B7155A` · burgundy `#4F0927` · pink `#F5A9CA` · muted `#906060` · off-white `#FFF9F5`.
Fonts: Noto Naskh Arabic (Arabic), Nunito (English). `lang="ar" dir="rtl"` on all Arabic text.
Warm, inclusive, polished; for teens and adults, not preschool.

## Language

Teach 28 letters with MSA spelling and Levantine (Shami) pronunciation. Label MSA vs Shami
where they differ. Honest descriptions of ع ح خ غ ق ص ض ط ظ (no fake English equivalents).
Non-connecting letters: ا د ذ ر ز و.

## Stages

0 Inspect ✅ · 1 Setup ✅ · 2 Core shell ✅ · 3 Alphabet explorer · 4 Lessons + tracing ·
5 Stickers · 6 Games · 7 Progress · 8 Teacher email reports · 9 Full QA

## Assets

- Audio: `assets/audio/manifest.json` maps Arabic text → file. Regenerate legacy clips with
  `node scripts/extract-assets.js`.
- Stickers: real Alsama photos in `assets/stickers/` + `assets/images/`, mapped to events in
  `assets/stickers/stickers.json` (see `docs/sticker-list.md`). Graduates sticker replaces the old owl. Logo: `assets/logo/alsama-language-school.png`.
