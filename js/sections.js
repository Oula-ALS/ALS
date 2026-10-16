// The six learning sections and every activity in them.
// Each activity ("set") builds a fresh, shuffled list of exercises for the engine in exercises.js.
// Lebanese Arabic instructions with English help. Only items with Alsama recordings are used
// for listening; sentences (no recordings yet) are used for reading, writing and arranging.

import { LETTERS, LOOKALIKES } from './data/letters.js';
import { VOWELS, SYLLABLES, WORDS, COMPLETE_SHORT, SENTENCES, MISSPELLINGS } from './data/content.js';
import { shuffle, pick, esc } from './exercises.js';
import * as store from './progress.js';

// ---- Helpers ------------------------------------------------------------------

const letterBy = c => LETTERS.find(l => l.char === c || (c === 'أ' && l.char === 'ا'));
const shortSyl = () => SYLLABLES.filter(s => s.length === 'short');
const longSyl = () => SYLLABLES.filter(s => s.length === 'long');
const vowel = id => VOWELS.find(v => v.id === id);
const lookalikes = c => [...new Set(LOOKALIKES.filter(g => g.includes(c)).flat())].filter(x => x !== c);

// The correct answer plus distractors (look-alikes first), shuffled, `n` in total.
function letterOptions(c, n = 4) {
  const near = shuffle(lookalikes(c)).slice(0, n - 2);
  const rest = shuffle(LETTERS.map(l => l.char).filter(x => x !== c && !near.includes(x)));
  return shuffle([c, ...near, ...rest].slice(0, n)).map(x => ({
    label: x, ar: true, value: x, why: `That one is ${letterBy(x).latin}.`,
  }));
}

// Builds `n` exercises with different ids from a generator (or a list of generators).
function many(n, gens) {
  const list = Array.isArray(gens) ? gens : [gens];
  const out = [];
  const ids = new Set();
  for (let guard = 0; out.length < n && guard < n * 25; guard++) {
    const ex = pick(list)();
    if (!ex || ids.has(ex.id)) continue;
    ids.add(ex.id);
    out.push(ex);
  }
  return out;
}

// ---- ABC Alphabet ------------------------------------------------------------

function hearLetter(c) {
  const L = c ? letterBy(c) : pick(LETTERS);
  return {
    type: 'choose', kind: 'letter', item: L.char, id: 'hear-letter:' + L.char,
    audio: L.name, prompt: 'Listen. Which letter is it?', promptAr: 'إسمع. شو الحرف؟',
    options: letterOptions(L.char), answer: L.char, explain: `It's ${L.latin}.`,
  };
}

function matchLetters() {
  const ls = shuffle(LETTERS).slice(0, 4);
  return {
    type: 'match', kind: 'letter', item: null, id: 'match-letters:' + ls.map(l => l.char).join(''),
    prompt: 'Match each sound to its letter.', promptAr: 'وصّل كل صوت بالحرف تبعو.',
    pairs: ls.map(l => ({ audio: l.name, label: l.char })),
  };
}

function similarLetters() {
  const group = pick(LOOKALIKES.filter(g => g.length >= 2));
  const c = pick(group);
  const L = letterBy(c);
  return {
    type: 'choose', kind: 'letter', item: c, id: 'similar:' + c,
    audio: L.name, prompt: 'These letters look alike. Listen — which one is it?',
    promptAr: 'هالأحرف بيشبهو بعض. إسمع، أيّا واحد؟',
    options: shuffle(group).map(x => ({ label: x, ar: true, value: x, why: `That one is ${letterBy(x).latin}.` })),
    answer: c, hint: 'Look at the dots: how many, and above or below the letter?', explain: `It's ${L.latin}.`,
  };
}

function letterInWord() {
  const L = pick(LETTERS);
  const w = L.word;
  if (Math.random() < 0.5) {
    const first = [...w.ar][0] === 'أ' ? 'ا' : [...w.ar][0];
    return {
      type: 'choose', kind: 'letter', item: first, id: 'first-letter:' + w.ar,
      display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span> ${esc(w.ar)}`,
      displaySub: `${w.latin} · ${w.en}`,
      prompt: 'Which letter does this word start with? (Remember: Arabic starts on the right.)',
      promptAr: 'هالكلمة بأيّ حرف بتبلّش؟',
      options: letterOptions(first), answer: first, explain: `${w.ar} starts with ${letterBy(first).latin}.`,
    };
  }
  const others = shuffle(LETTERS.filter(x => x !== L && !x.word.ar.includes(L.char))).slice(0, 3);
  return {
    type: 'choose', kind: 'letter', item: L.char, id: 'word-has:' + L.char,
    display: esc(L.char), displaySub: L.latin,
    prompt: `Which word has the letter ${L.latin} in it?`, promptAr: 'أيّا كلمة فيها هالحرف؟',
    options: shuffle([L, ...others]).map(x => ({ label: x.word.ar, ar: true, value: x.char, sub: `${x.word.emoji} ${x.word.en}` })),
    answer: L.char, explain: `${L.word.ar} (${L.word.latin}) has ${L.char} in it.`,
  };
}

// ---- Short sounds ------------------------------------------------------------

function whichVowel(sylText, kind = 'short') {
  const s = sylText ? SYLLABLES.find(x => x.text === sylText) : pick(shortSyl());
  return {
    type: 'choose', kind, item: s.text, id: 'which-vowel:' + s.text,
    audio: s.text, prompt: 'Listen. Which short vowel do you hear?', promptAr: 'إسمع. أيّا حركة سمعت؟',
    options: VOWELS.map(v => ({ label: s.c + v.mark, ar: true, value: v.id, sub: `${v.name} (${v.short})` })),
    answer: s.vowel, explain: `${s.text} = ${s.latin} — ${vowel(s.vowel).name}.`,
  };
}

function hearSyllable(len = 'short') {
  const s = pick(len === 'short' ? shortSyl() : longSyl());
  const same = SYLLABLES.filter(x => x.vowel === s.vowel && x.length === s.length && x !== s);
  const opts = shuffle([s, ...shuffle(same).slice(0, 3)]);
  return {
    type: 'choose', kind: len, item: s.text, id: 'hear-syl:' + s.text,
    audio: s.text, prompt: 'Listen. Which one did you hear?', promptAr: 'إسمع. شو سمعت؟',
    options: opts.map(x => ({ label: x.text, ar: true, value: x.text, sub: x.latin })),
    answer: s.text, explain: `${s.text} = ${s.latin}.`,
  };
}

function matchSyllables(len = 'short') {
  const base = pick(SYLLABLES.filter(x => x.length === len));
  const set = shuffle(SYLLABLES.filter(x => x.length === len && x.vowel === base.vowel)).slice(0, 2)
    .concat(shuffle(SYLLABLES.filter(x => x.length === len && x.c === base.c && x.vowel !== base.vowel)).slice(0, 2));
  const items = [...new Map(set.map(x => [x.text, x])).values()].slice(0, 4);
  return {
    type: 'match', kind: len, item: null, id: 'match-syl:' + items.map(x => x.text).join(''),
    prompt: 'Match each sound to how it is written.', promptAr: 'وصّل كل صوت بالكتابة تبعو.',
    pairs: items.map(x => ({ audio: x.text, label: x.text })),
  };
}

function compareShort() {
  const c = pick(SYLLABLES).c;
  const [a, b] = shuffle(shortSyl().filter(x => x.c === c)).slice(0, 2);
  const target = pick([a, b]);
  return {
    type: 'choose', kind: 'short', item: target.text, id: 'compare-short:' + a.text + b.text, autoplay: false,
    display: esc(target.text), displaySub: 'Play both sounds, then choose.',
    prompt: 'Which sound matches the written syllable?', promptAr: 'أيّا صوت متل المكتوب؟',
    options: [a, b].map((x, k) => ({ label: k ? 'Sound B' : 'Sound A', name: k ? 'sound B' : 'sound A', value: x.text, audio: x.text })),
    answer: target.text, explain: `${target.text} = ${target.latin}.`,
  };
}

function completeShort() {
  const item = pick(COMPLETE_SHORT);
  const w = WORDS.find(x => x.ar === item.word);
  const shown = item.parts.map((p, k) => (k === item.gap ? '<span class="gap">؟</span>' : esc(p))).join(' ');
  return {
    type: 'choose', kind: 'short', item: item.parts[item.gap], id: 'complete-short:' + item.word + item.gap,
    audio: w.audio, display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span> ${shown}`,
    displaySub: `${w.latin} · ${w.en}`,
    prompt: 'Listen to the word. Which syllable is missing?', promptAr: 'إسمع الكلمة. شو الناقص؟',
    options: item.options.map(o => ({ label: o, ar: true, value: o, audio: o })),
    answer: item.parts[item.gap], explain: `${w.vowelled} = ${w.latin}.`,
  };
}

function repeatSound(text, latin, kind = 'speak') {
  return {
    type: 'speak', kind, item: text, id: 'repeat:' + text,
    audio: text, display: esc(text), displaySub: latin,
    prompt: 'Listen, then say it out loud. Record yourself and compare.', promptAr: 'إسمع، وعيد ورا.',
    speak: { audio: text, text, latin },
  };
}

// ---- Long sounds -------------------------------------------------------------

function whichLong(sylText) {
  const s = sylText ? SYLLABLES.find(x => x.text === sylText) : pick(longSyl());
  return {
    type: 'choose', kind: 'long', item: s.text, id: 'which-long:' + s.text,
    audio: s.text, prompt: 'Listen. Which long vowel letter makes this sound?', promptAr: 'إسمع. أيّا حرف مدّ؟',
    options: VOWELS.map(v => ({ label: v.longLetter, ar: true, value: v.id, sub: `${v.long}` })),
    answer: s.vowel, explain: `${s.text} = ${s.latin}: the letter ${vowel(s.vowel).longLetter} makes it long.`,
  };
}

function shortOrLong(sylText) {
  const s = sylText ? SYLLABLES.find(x => x.text === sylText) : pick(SYLLABLES);
  return {
    type: 'choose', kind: s.length, item: s.text, id: 'short-long:' + s.text,
    audio: s.text, prompt: 'Listen. Is the vowel short or long?', promptAr: 'إسمع. قصير ولّا طويل؟',
    options: [
      { label: 'قصير', ar: true, value: 'short', sub: 'Short' },
      { label: 'طويل', ar: true, value: 'long', sub: 'Long' },
    ],
    answer: s.length,
    explain: `${s.text} (${s.latin}) is ${s.length === 'long' ? 'long — the vowel is stretched by ' + vowel(s.vowel).longLetter : 'short — just a small vowel mark, no extra letter'}.`,
    hint: 'A long vowel lasts about twice as long. Listen again.',
  };
}

function compareLong() {
  const s = pick(shortSyl());
  const l = SYLLABLES.find(x => x.c === s.c && x.vowel === s.vowel && x.length === 'long');
  const [a, b] = shuffle([s, l]);
  return {
    type: 'choose', kind: 'long', item: l.text, id: 'compare-long:' + l.text, autoplay: false,
    display: `${esc(s.text)} &nbsp;·&nbsp; ${esc(l.text)}`, displaySub: 'Play both sounds, then choose.',
    prompt: 'Which sound is the LONG one?', promptAr: 'أيّا صوت الطويل؟',
    options: [a, b].map((x, k) => ({ label: k ? 'Sound B' : 'Sound A', name: k ? 'sound B' : 'sound A', value: x.text, audio: x.text })),
    answer: l.text, explain: `${l.text} (${l.latin}) is long; ${s.text} (${s.latin}) is short.`,
  };
}

function matchLong() {
  const syl = shuffle(longSyl()).slice(0, 2);
  const words = shuffle(WORDS.filter(w => w.long)).slice(0, 2);
  return {
    type: 'match', kind: 'long', item: null, id: 'match-long:' + syl.map(x => x.text).join('') + words.map(w => w.ar).join(''),
    prompt: 'Match each sound to what is written.', promptAr: 'وصّل كل صوت بالكتابة تبعو.',
    pairs: [...syl.map(x => ({ audio: x.text, label: x.text })), ...words.map(w => ({ audio: w.audio, label: w.ar }))],
  };
}

function longInWord(word) {
  const w = word || pick(WORDS.filter(x => x.long));
  const chars = [...w.ar];
  const k = chars.indexOf(w.long);
  const shown = chars.map((c, i) => (i === k ? '<span class="gap">؟</span>' : esc(c))).join(' ');
  return {
    type: 'choose', kind: 'long', item: w.ar, id: 'long-word:' + w.ar,
    audio: w.audio, display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span> ${shown}`,
    displaySub: `${w.latin} · ${w.en}`,
    prompt: 'Listen. Which long vowel letter is missing?', promptAr: 'إسمع. أيّا حرف مدّ ناقص؟',
    options: VOWELS.map(v => ({ label: v.longLetter, ar: true, value: v.longLetter, sub: v.long })),
    answer: w.long, explain: `${w.ar} = ${w.latin}.`,
  };
}

// ---- Writing -------------------------------------------------------------------

function typeLetter(c) {
  const L = c ? letterBy(c) : pick(LETTERS);
  return {
    type: 'type', kind: 'write', item: L.char, id: 'type-letter:' + L.char, countWords: false,
    audio: L.name, prompt: 'Listen and write the letter you hear.', promptAr: 'إسمع واكتب الحرف.',
    answer: L.char, hint: 'Listen again, and look for it on the keyboard below.', explain: `= ${L.latin}`,
  };
}

function missingLetter() {
  const w = pick(WORDS);
  const chars = [...w.ar];
  const k = Math.floor(Math.random() * chars.length);
  const shown = chars.map((c, i) => (i === k ? '<span class="gap">؟</span>' : esc(c))).join(' ');
  return {
    type: 'type', kind: 'write', item: w.ar, id: 'missing-letter:' + w.ar + k, countWords: false,
    audio: w.audio, display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span> ${shown}`,
    displaySub: `${w.latin} · ${w.en}`,
    prompt: 'Listen. Write the missing letter.', promptAr: 'إسمع واكتب الحرف الناقص.',
    answer: chars[k], explain: `The word is ${w.ar}.`, answerAudio: w.audio,
  };
}

function typeWord(word, withSpeak = false) {
  const w = word || pick(WORDS);
  return {
    type: 'type', kind: 'write', item: w.ar, id: (withSpeak ? 'lws:' : 'type-word:') + w.ar,
    audio: w.audio, display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span>`, displaySub: w.en,
    prompt: withSpeak ? 'Listen, write the word, then say it.' : 'Listen and write the word.',
    promptAr: withSpeak ? 'إسمع، اكتب، وبعدين قول.' : 'إسمع واكتب الكلمة.',
    answer: w.ar, hint: `It sounds like "${w.latin}".`, answerAudio: w.audio,
    speakAfter: withSpeak ? { audio: w.audio, text: w.ar, latin: w.latin } : null,
  };
}

function copySay() {
  const w = pick(WORDS);
  return {
    type: 'type', kind: 'write', item: w.ar, id: 'copy-say:' + w.ar,
    display: esc(w.ar), displaySub: `${w.emoji} ${w.latin} · ${w.en}`,
    prompt: 'Copy the word, then practise saying it.', promptAr: 'انسخ الكلمة، وبعدين قولها.',
    answer: w.ar, answerAudio: w.audio, speakAfter: { audio: w.audio, text: w.ar, latin: w.latin },
  };
}

function writeSentence(level) {
  const pool = level >= 4 ? SENTENCES : SENTENCES.filter(s => s.words.length <= 2);
  const s = pick(pool);
  return {
    type: 'type', kind: 'write', item: s.ar, id: 'write-sentence:' + s.ar,
    display: esc(s.ar), displaySub: `${s.latin} — ${s.en}`,
    prompt: 'Write this short Lebanese sentence.', promptAr: 'اكتب هالجملة.',
    answer: s.ar, hint: 'Check each word, and leave a space between words.',
    speakAfter: { audio: null, text: s.ar, latin: s.latin },
  };
}

function arrangeSentence(level) {
  const pool = level >= 4 ? SENTENCES : SENTENCES.filter(s => s.words.length <= 2);
  const s = pick(pool);
  return {
    type: 'build', kind: 'write', item: s.ar, id: 'arrange:' + s.ar, joiner: ' ',
    displaySub: `${s.en} (${s.latin})`, display: '',
    prompt: 'Put the words in order to make the sentence.', promptAr: 'رتّب الكلمات وعمول جملة.',
    tiles: s.words, answer: s.ar, hint: 'Arabic starts on the right: the first word goes on the right.',
  };
}

function fixSpelling() {
  const m = pick(MISSPELLINGS);
  const w = WORDS.find(x => x.ar === m.right);
  return {
    type: 'type', kind: 'write', item: m.right, id: 'fix:' + m.wrong,
    display: `<s>${esc(m.wrong)}</s>`, displaySub: `${w.emoji} ${w.en} — one letter is wrong.`,
    prompt: 'This word has a spelling mistake. Write it correctly.', promptAr: 'صلّح الغلط.',
    answer: m.right, hint: `Hint: ${m.hint}.`, answerAudio: w.audio,
  };
}

function buildWord() {
  const w = pick(WORDS);
  return {
    type: 'build', kind: 'write', item: w.ar, id: 'build-word:' + w.ar, joiner: '',
    audio: w.audio, display: `<span class="ex-emoji" aria-hidden="true">${w.emoji}</span>`, displaySub: w.en,
    prompt: 'Listen. Put the letters in order to build the word.', promptAr: 'رتّب الأحرف وعمول كلمة.',
    tiles: [...w.ar], answer: w.ar, explain: `${w.ar} = ${w.latin}.`,
  };
}

// ---- Listening & speaking ---------------------------------------------------------

const withSpeak = (ex, text, latin) => ({ ...ex, kind: 'listen', id: 'ls-' + ex.id, speakAfter: { audio: ex.audio, text, latin } });

function lsShortLong() {
  const s = pick(SYLLABLES);
  return withSpeak(shortOrLong(s.text), s.text, s.latin);
}
function lsVowel() {
  const s = pick(shortSyl());
  return withSpeak(whichVowel(s.text), s.text, s.latin);
}
function lsLetter() {
  const s = pick(SYLLABLES);
  const opts = shuffle([s.c, ...shuffle(SYLLABLES.map(x => x.c).filter(c => c !== s.c)).filter((c, i, a) => a.indexOf(c) === i).slice(0, 3)]);
  return withSpeak({
    type: 'choose', kind: 'listen', item: s.text, id: 'ls-letter:' + s.text,
    audio: s.text, prompt: 'Listen. Which letter starts this sound?', promptAr: 'إسمع. بأيّ حرف بيبلّش الصوت؟',
    options: opts.map(c => ({ label: c, ar: true, value: c })), answer: s.c, explain: `${s.text} = ${s.latin}.`,
  }, s.text, s.latin);
}
function wordChallenge(speak = true) {
  const w = pick(WORDS);
  const opts = shuffle([w, ...shuffle(WORDS.filter(x => x !== w)).slice(0, 3)]);
  const ex = {
    type: 'choose', kind: 'listen', item: w.ar, id: 'word-challenge:' + w.ar,
    audio: w.audio, prompt: 'Listen. Which word did you hear?', promptAr: 'إسمع. أيّا كلمة سمعت؟',
    options: opts.map(x => ({ label: x.ar, ar: true, value: x.ar, sub: `${x.emoji} ${x.en}` })),
    answer: w.ar, explain: `${w.ar} = ${w.latin} (${w.en}).`,
  };
  return speak ? withSpeak(ex, w.ar, w.latin) : ex;
}

// ---- Games: difficulty follows the learner's level ----------------------------

const lvl = () => store.level(store.getCurrentStudent().id);
const byLevel = (l1, l2, l3) => () => (lvl() >= 3 ? l3 : lvl() === 2 ? l2 : l1)();

const detective = byLevel(hearLetter, () => hearSyllable(pick(['short', 'long'])), () => wordChallenge(false));
const listenChoose = byLevel(() => similarLetters(), () => whichVowel(), () => wordChallenge(false));
const matchGame = byLevel(matchLetters, () => matchSyllables(pick(['short', 'long'])), matchLong);
const missingSound = byLevel(completeShort, completeShort, () => pick([completeShort, () => longInWord()])());
const listenType = byLevel(() => typeLetter(), () => typeLetter(), () => typeWord());
const repeatGame = byLevel(
  () => { const L = pick(LETTERS); return repeatSound(L.name, L.latin); },
  () => { const s = pick(SYLLABLES); return repeatSound(s.text, s.latin); },
  () => { const w = pick(WORDS); return repeatSound(w.ar, w.latin); });

function allGens() {
  const l = lvl();
  const gens = [hearLetter, similarLetters, letterInWord, () => typeLetter()];
  if (l >= 2) gens.push(() => whichVowel(), () => shortOrLong(), () => whichLong(), completeShort, compareLong);
  if (l >= 3) gens.push(() => wordChallenge(false), () => typeWord(), () => longInWord(), buildWord, fixSpelling);
  if (l >= 4) gens.push(() => arrangeSentence(l));
  return gens;
}

function reviewItems() {
  const s = store.getCurrentStudent();
  const items = store.stats(s.id).toReview;
  const out = [];
  for (const { kind, item } of shuffle(items)) {
    if (out.length >= 8) break;
    if (LETTERS.some(L => L.char === item)) out.push(kind === 'write' ? typeLetter(item) : hearLetter(item));
    else if (SYLLABLES.some(x => x.text === item)) {
      const syl = SYLLABLES.find(x => x.text === item);
      out.push(syl.length === 'long' ? whichLong(item) : whichVowel(item));
    } else if (WORDS.some(w => w.ar === item)) out.push(typeWord(WORDS.find(w => w.ar === item)));
  }
  const seen = new Set();
  return out.filter(ex => !seen.has(ex.id) && seen.add(ex.id));
}

// ---- Sets ------------------------------------------------------------------------

export const SETS = {
  // ABC Alphabet
  'a-hear': { title: 'Hear & choose the letter', titleAr: 'إسمع واختار الحرف', about: 'Hear a letter name and pick it out.', build: () => many(8, () => hearLetter()) },
  'a-match': { title: 'Match letters to sounds', titleAr: 'وصّل الأصوات بالأحرف', about: 'Tap a sound, then its letter.', build: () => many(4, matchLetters) },
  'a-similar': { title: 'Look-alike letters', titleAr: 'أحرف بتشبه بعض', about: 'Tell apart letters that only differ by dots.', build: () => many(8, similarLetters) },
  'a-words': { title: 'Letters in words', titleAr: 'الأحرف بالكلمات', about: 'Find letters inside simple Lebanese words.', build: () => many(8, letterInWord) },
  'a-quiz': { title: 'Alphabet quiz', titleAr: 'امتحان صغير', about: 'A short mixed review of the alphabet.', build: () => many(10, [() => hearLetter(), similarLetters, letterInWord]) },

  // Short sounds
  's-vowel': { title: 'Which short vowel?', titleAr: 'أيّا حركة؟', about: 'Hear a syllable: fatḥa, kasra or ḍamma?', build: () => many(8, () => whichVowel()) },
  's-letter': { title: 'Hear & choose the syllable', titleAr: 'إسمع واختار', about: 'Hear a sound and pick how it is written.', build: () => many(8, () => hearSyllable('short')) },
  's-match': { title: 'Match sounds and vowels', titleAr: 'وصّل الصوت بالحركة', about: 'Match each sound to its written syllable.', build: () => many(4, () => matchSyllables('short')) },
  's-compare': { title: 'Compare two sounds', titleAr: 'قارن بين صوتين', about: 'Two close sounds — which one is written?', build: () => many(6, compareShort) },
  's-complete': { title: 'Complete the word', titleAr: 'كمّل الكلمة', about: 'Choose the missing syllable in a word.', build: () => many(4, completeShort) },
  's-repeat': { title: 'Repeat after me', titleAr: 'عيد ورايي', about: 'Listen, say it, record and compare.', build: () => many(5, () => { const s = pick(shortSyl()); return repeatSound(s.text, s.latin, 'short'); }) },

  // Long sounds
  'l-which': { title: 'Which long vowel?', titleAr: 'أيّا حرف مدّ؟', about: 'ا (aa), و (uu) or ي (ii)?', build: () => many(8, () => whichLong()) },
  'l-shortlong': { title: 'Short or long?', titleAr: 'قصير ولّا طويل؟', about: 'The key skill: hear the difference.', build: () => many(10, () => shortOrLong()) },
  'l-compare': { title: 'Compare short and long', titleAr: 'قارن القصير بالطويل', about: 'Play two sounds: which one is long?', build: () => many(6, compareLong) },
  'l-match': { title: 'Match sounds and words', titleAr: 'وصّل الصوت بالكلمة', about: 'Long syllables and words with long vowels.', build: () => many(4, matchLong) },
  'l-words': { title: 'Long vowels in words', titleAr: 'المدّ بالكلمات', about: 'Find the missing ا, و or ي in a word.', build: () => many(5, () => longInWord()) },
  'l-repeat': { title: 'Repeat the word', titleAr: 'عيد الكلمة', about: 'Words with long vowels: listen, say, record.', build: () => many(5, () => { const w = pick(WORDS.filter(x => x.long)); return repeatSound(w.ar, w.latin, 'long'); }) },
  'l-review': { title: 'Short + long review', titleAr: 'مراجعة', about: 'A mixed quiz of short and long sounds.', build: () => many(10, [() => whichVowel(), () => whichLong(), () => shortOrLong(), compareLong]) },

  // Writing & speaking
  'w-letter': { title: 'Write the letter you hear', titleAr: 'إسمع واكتب الحرف', about: 'Hear a letter and type it.', build: () => many(6, () => typeLetter()) },
  'w-missing': { title: 'Missing letter', titleAr: 'الحرف الناقص', about: 'Type the letter missing from a word.', build: () => many(6, missingLetter) },
  'w-listen': { title: 'Listen and type', titleAr: 'إسمع واكتب', about: 'Hear a word and write it.', build: () => many(6, () => typeWord()) },
  'w-sentence': { title: 'Write a sentence', titleAr: 'اكتب جملة', about: 'Copy a short Lebanese sentence, then say it.', build: () => many(4, () => writeSentence(4)) },
  'w-arrange': { title: 'Arrange the sentence', titleAr: 'رتّب الجملة', about: 'Put words in the right order.', build: () => many(5, () => arrangeSentence(4)) },
  'w-copy': { title: 'Copy & say', titleAr: 'انسخ وقول', about: 'Write a word, then practise saying it.', build: () => many(5, copySay) },
  'w-lws': { title: 'Listen, write, speak', titleAr: 'إسمع، اكتب، قول', about: 'All three skills together.', build: () => many(5, () => typeWord(null, true)) },
  'w-fix': { title: 'Fix the spelling', titleAr: 'صلّح الغلط', about: 'One letter is wrong — write it correctly.', build: () => many(5, fixSpelling) },

  // Listening & speaking: listen → identify → answer → speak → record → compare
  'ls-shortlong': { title: 'Short or long? Then say it', titleAr: 'قصير ولّا طويل؟ وقول', about: 'Identify the length, then repeat it.', build: () => many(5, lsShortLong) },
  'ls-vowel': { title: 'Which vowel? Then say it', titleAr: 'أيّا حركة؟ وقول', about: 'Identify the short vowel, then repeat it.', build: () => many(5, lsVowel) },
  'ls-letter': { title: 'Which letter? Then say it', titleAr: 'أيّا حرف؟ وقول', about: 'Identify the first letter, then repeat it.', build: () => many(5, lsLetter) },
  'ls-word': { title: 'Which word? Then say it', titleAr: 'أيّا كلمة؟ وقول', about: 'Identify the word, then repeat it.', build: () => many(5, () => wordChallenge(true)) },

  // Practice & games
  'g-detective': { game: true, title: 'Sound Detective', titleAr: 'محقّق الأصوات', about: 'Listen carefully and identify the sound.', build: () => many(8, detective) },
  'g-shortlong': { game: true, title: 'Short or Long?', titleAr: 'قصير ولّا طويل؟', about: 'Quick-fire short vs long.', build: () => many(10, () => shortOrLong()) },
  'g-listen': { game: true, title: 'Listen and Choose', titleAr: 'إسمع واختار', about: 'Hear it, pick the right answer.', build: () => many(8, listenChoose) },
  'g-match': { game: true, title: 'Match the Sound', titleAr: 'وصّل الصوت', about: 'Match sounds to letters, vowels or words.', build: () => many(4, matchGame) },
  'g-missing': { game: true, title: 'Missing Sound', titleAr: 'الصوت الناقص', about: 'Complete the word.', build: () => many(5, missingSound) },
  'g-build': { game: true, title: 'Build a Word', titleAr: 'عمول كلمة', about: 'Arrange letters to make a word.', build: () => many(5, buildWord) },
  'g-type': { game: true, title: 'Listen and Type', titleAr: 'إسمع واكتب', about: 'Write what you hear.', build: () => many(6, listenType) },
  'g-repeat': { game: true, title: 'Repeat After Me', titleAr: 'عيد ورايي', about: 'Listen, say it, record, compare.', build: () => many(5, repeatGame) },
  'g-word': { game: true, title: 'Word Challenge', titleAr: 'تحدّي الكلمات', about: 'Identify a word from its sound.', build: () => many(8, () => wordChallenge(false)) },
  'g-sentence': { game: true, title: 'Sentence Builder', titleAr: 'عمول جملة', about: 'Put words in order to make a sentence.', build: () => many(5, () => arrangeSentence(lvl())) },
  'g-quiz': { game: true, title: 'Quick Quiz', titleAr: 'امتحان سريع', about: 'Six quick questions at your level.', build: () => many(6, allGens()) },
  'g-review': { game: true, title: 'Review Challenge', titleAr: 'راجع الغلطات', about: 'Practise the sounds and words you missed.', build: reviewItems,
    emptyMessage: 'Nothing to review yet — you have no recent mistakes. Try Mixed Practice!' },
  'g-daily': { game: true, daily: true, title: 'Daily Challenge', titleAr: 'تحدّي اليوم', about: 'Five exercises a day at your level.', build: () => many(5, allGens()) },
  'g-mixed': { game: true, title: 'Mixed Practice', titleAr: 'تمارين منوّعة', about: 'Letters, short and long sounds, writing and listening.', build: () => many(10, [...allGens(), lsShortLong]) },
};

export const SECTIONS = [
  { id: 'alphabet', title: 'ABC Alphabet', ar: 'الأحرف', icon: 'أ ب', img: 'images/students-classroom.jpg',
    about: 'Meet all 28 letters, hear them, and spot look-alikes.',
    sets: ['a-hear', 'a-match', 'a-similar', 'a-words', 'a-quiz'] },
  { id: 'short', title: 'Short Sounds', ar: 'الحركات', icon: 'بَ بِ بُ', img: 'images/girl-laughing-sports.jpg',
    about: 'Fatḥa, kasra and ḍamma — the small vowel marks.',
    sets: ['s-vowel', 's-letter', 's-match', 's-compare', 's-complete', 's-repeat'] },
  { id: 'long', title: 'Long Sounds', ar: 'المدّ', icon: 'با بو بي', img: 'images/girl-trophy.jpg',
    about: 'How ا، و، ي stretch a vowel — and hearing short vs long.',
    sets: ['l-shortlong', 'l-which', 'l-compare', 'l-match', 'l-words', 'l-repeat', 'l-review'] },
  { id: 'writing', title: 'Writing & Speaking', ar: 'كتابة وحكي', icon: '✍️', img: 'stickers/teacher-helping-student.png', sticker: true,
    about: 'Type letters, words and sentences — then say them.',
    sets: ['w-letter', 'w-missing', 'w-listen', 'w-copy', 'w-lws', 'w-fix', 'w-arrange', 'w-sentence'] },
  { id: 'listening', title: 'Listening & Speaking', ar: 'سمع وحكي', icon: '🎧', img: 'stickers/teacher-shrug.png', sticker: true,
    about: 'Listen, identify, answer — then say it and record yourself.',
    sets: ['ls-shortlong', 'ls-vowel', 'ls-letter', 'ls-word'] },
  { id: 'games', title: 'Practice & Games', ar: 'تمارين وألعاب', icon: '🎮', img: 'stickers/teacher-cheering.png', sticker: true,
    about: '14 games that mix everything, at your level.',
    sets: ['g-daily', 'g-detective', 'g-shortlong', 'g-listen', 'g-match', 'g-missing', 'g-build', 'g-type',
      'g-repeat', 'g-word', 'g-sentence', 'g-quiz', 'g-review', 'g-mixed'] },
];

// Fill in back-links and section titles for each set.
for (const sec of SECTIONS) {
  for (const id of sec.sets) Object.assign(SETS[id], { id, back: 's/' + sec.id, sectionTitle: sec.title });
}
