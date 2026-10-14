#!/usr/bin/env node
// Extracts the recordings and logo embedded in the old app into real files.
// It only READS legacy/arabic-alphabet-app.html — it never changes it.
//
// Run from the project folder:   node scripts/extract-assets.js
//
// Output:
//   assets/audio/letters/*.mp3    28 letter names
//   assets/audio/syllables/*.mp3  42 syllables (ب م ل ن س ر د × 6 vowels)
//   assets/audio/words/*.mp3      9 words
//   assets/audio/phrases/*.mp3    مرحبا, أحسنت
//   assets/audio/manifest.json    Arabic text → file path (relative to assets/)
//   assets/logo/alsama-language-school.png

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LEGACY = path.join(ROOT, 'legacy', 'arabic-alphabet-app.html');
const ASSETS = path.join(ROOT, 'assets');

// Letter name (exactly as the old app spells it) → file name.
const LETTERS = {
  'أَلِف': 'alif', 'بَاء': 'baa', 'تَاء': 'taa', 'ثَاء': 'thaa', 'جِيم': 'jeem',
  'حَاء': 'haa-throat', 'خَاء': 'khaa', 'دَال': 'daal', 'ذَال': 'dhaal',
  'رَاء': 'raa', 'زَاي': 'zay', 'سِين': 'seen', 'شِين': 'sheen', 'صَاد': 'saad',
  'ضَاد': 'daad', 'طَاء': 'taa-emphatic', 'ظَاء': 'zaa-emphatic', 'عَيْن': 'ayn',
  'غَيْن': 'ghayn', 'فَاء': 'faa', 'قَاف': 'qaaf', 'كَاف': 'kaaf', 'لَام': 'laam',
  'مِيم': 'meem', 'نُون': 'noon', 'هَاء': 'haa', 'وَاو': 'waaw', 'يَاء': 'yaa',
};

// The 42 syllables are built the same way the old app builds them.
const CONSONANTS = [['ب', 'b'], ['م', 'm'], ['ل', 'l'], ['ن', 'n'], ['س', 's'], ['ر', 'r'], ['د', 'd']];
const SHORT = ['َ', 'ُ', 'ِ'];
const LONG = ['ا', 'و', 'ي'];
const SHORT_LATIN = ['a', 'u', 'i'];
const LONG_LATIN = ['aa', 'uu', 'ii'];
const SYLLABLES = {};
for (const [c, latin] of CONSONANTS) {
  SHORT.forEach((v, i) => { SYLLABLES[c + v] = latin + SHORT_LATIN[i]; });
  SHORT.forEach((v, i) => { SYLLABLES[c + v + LONG[i]] = latin + LONG_LATIN[i]; });
}

const WORDS = {
  'باب': 'baab', 'بيت': 'bayt', 'نور': 'nuur', 'دار': 'daar', 'ملك': 'malik',
  'سمك': 'samak', 'ورد': 'ward', 'وعد': 'waad', 'موز': 'mooz',
};

const PHRASES = { 'مَرْحَبًا': 'marhaba', 'أَحْسَنْت': 'ahsant' };

const GROUPS = [
  ['letters', LETTERS, 28],
  ['syllables', SYLLABLES, 42],
  ['words', WORDS, 9],
  ['phrases', PHRASES, 2],
];

function fail(msg) {
  console.error('ERROR: ' + msg);
  process.exit(1);
}

const html = fs.readFileSync(LEGACY, 'utf8');

// --- Audio ---------------------------------------------------------------
const audioLine = html.split('\n').find(l => l.startsWith('const AUD='));
if (!audioLine) fail('Could not find the AUD object in the legacy file.');
const clips = {};
for (const m of audioLine.matchAll(/"([^"]+)": "data:audio\/mp3;base64,([A-Za-z0-9+/=]+)"/g)) {
  clips[m[1]] = Buffer.from(m[2], 'base64');
}

const manifest = {};
const unexpected = new Set(Object.keys(clips));
for (const [folder, map, expected] of GROUPS) {
  fs.mkdirSync(path.join(ASSETS, 'audio', folder), { recursive: true });
  let count = 0;
  for (const [arabic, slug] of Object.entries(map)) {
    const data = clips[arabic];
    if (!data) fail(`Missing recording for "${arabic}" (${folder}/${slug}).`);
    if (data.length < 1000) fail(`Recording for "${arabic}" looks empty.`);
    const rel = `audio/${folder}/${slug}.mp3`;
    fs.writeFileSync(path.join(ASSETS, rel), data);
    manifest[arabic] = rel;
    unexpected.delete(arabic);
    count++;
  }
  if (count !== expected) fail(`Expected ${expected} ${folder}, got ${count}.`);
  console.log(`  ${folder.padEnd(10)} ${count}`);
}
if (unexpected.size) fail('Recordings not sorted into a group: ' + [...unexpected].join(', '));

const total = Object.keys(manifest).length;
if (total !== 81) fail(`Expected 81 recordings, got ${total}.`);
fs.writeFileSync(path.join(ASSETS, 'audio', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`  total      ${total} recordings → assets/audio/manifest.json`);

// --- Logo ----------------------------------------------------------------
const logo = html.match(/const LOGO='data:image\/png;base64,([A-Za-z0-9+/=]+)'/);
if (!logo) fail('Could not find the LOGO image in the legacy file.');
fs.mkdirSync(path.join(ASSETS, 'logo'), { recursive: true });
fs.writeFileSync(path.join(ASSETS, 'logo', 'alsama-language-school.png'), Buffer.from(logo[1], 'base64'));
console.log('  logo       assets/logo/alsama-language-school.png');

console.log('Done. The legacy file was not modified.');
