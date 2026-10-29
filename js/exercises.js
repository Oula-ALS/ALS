// Exercise engine: runs a short session of exercises, one card at a time.
//
// Exercise types
//   choose  – optional audio and/or text, pick one answer (options may have their own audio)
//   match   – tap a sound (or text) then the matching written answer, until all pairs match
//   build   – arrange tiles (letters, syllables or words) in the right order
//   type    – write the answer in Arabic (device keyboard or on-screen keyboard)
//   speak   – listen, say it, record yourself, compare (no automatic scoring)
//   learn   – a short explanation card inside a lesson (not scored, not logged)
//   trace   – trace a letter on the tracing pad (never graded)
//   read    – read a word with no sound, then check by listening; the learner says honestly
//             whether they read it right (the app does not score pronunciation)
// Any choose/type exercise can add `speakAfter: { audio, text, latin }` for the Speak step.
//
// Every finished exercise is logged with its kind, so progress shows only real activity.

import { playAudio, stopAudio, showAudioMessage, hasRecording } from './audio.js';
import * as store from './progress.js';
import { sfx } from './music.js';
import { celebrate } from './celebrate.js';
import { keyboardHTML } from './keyboard.js';
import { canRecord, startRecording, stopRecording, isRecording } from './recorder.js';
import { tracingHTML, initTracing } from './tracing.js';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function shuffle(list) {
  const a = [...list];
  for (let k = a.length - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [a[k], a[r]] = [a[r], a[k]];
  }
  return a;
}
export const pick = list => list[Math.floor(Math.random() * list.length)];

// Compare Arabic answers fairly: ignore vowel marks, tatweel, alef forms and punctuation.
export const normalize = s => String(s || '')
  .replace(/[ً-ْٰـ]/g, '')
  .replace(/[أإآ]/g, 'ا')
  .replace(/[.,،؟?!:؛;"'()\-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// Lebanese number phrases ("5 كلمات", "كلمتين" …)
export function arCount(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}
export const wordsAr = n => arCount(n, 'كلمة وحدة', 'كلمتين', 'كلمات', 'كلمة');
export const exercisesAr = n => arCount(n, 'تمرين واحد', 'تمرينين', 'تمارين', 'تمرين');
export const soundsAr = n => arCount(n, 'صوت واحد', 'صوتين', 'أصوات', 'صوت');

export function cheer(student) {
  const s = student || store.getCurrentStudent();
  const own = s && s.address === 'f' ? 'شاطرة!' : s && s.address === 'm' ? 'شاطر!' : 'برافو!';
  return pick(['برافو عليك!', 'ممتاز!', 'ممتاز! الصوت صح.', own]);
}
const tryAgain = s => (s && s.address === 'f' ? 'جرّبي مرة تانية، واسمعي الصوت منيح.' : 'جرّب مرة تانية، واسمع الصوت منيح.');

// ---- Session -------------------------------------------------------------

let session = null;

// set: { id, title, titleAr, back, kind, build: () => [exercises], daily? }
export function startSession(set) {
  stopAudio();
  session = { set, items: set.build(), i: 0, results: [] };
  if (!session.items.length) session.empty = true;
  return sessionHTML();
}

function root() { return document.getElementById('session'); }

export function sessionHTML() {
  const { set, items, i } = session;
  if (session.empty) {
    return `<section class="narrow card session" id="session">
      <h1 tabindex="-1">${esc(set.title)}</h1>
      <p>${esc(set.emptyMessage || 'Nothing to practise here yet.')}</p>
      <a class="button" href="#/${set.back}">Back</a></section>`;
  }
  if (i >= items.length) return endHTML();
  const ex = items[i];
  ex.tries = ex.tries || 0;
  return `
    <section class="session" id="session">
      <div class="session-top">
        <a class="icon-button" href="#/${set.back}" aria-label="Back to ${esc(set.sectionTitle || 'section')}">‹</a>
        <div class="bar" role="progressbar" aria-label="Exercise ${i + 1} of ${items.length}"
             aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${i}">
          <i style="width:${i / items.length * 100}%"></i></div>
        <span class="session-count">${i + 1} / ${items.length}</span>
      </div>
      <div class="card ex-card" data-type="${ex.type}">
        <h1 class="ex-title" tabindex="-1">${esc(set.title)}</h1>
        <div class="ex-prompt">
          ${ex.promptAr ? `<p class="ex-ar" lang="ar" dir="rtl">${esc(ex.promptAr)}</p>` : ''}
          ${ex.prompt ? `<p>${esc(ex.prompt)}</p>` : ''}
        </div>
        ${RENDER[ex.type](ex)}
        <div class="ex-feedback" id="ex-feedback" role="status" aria-live="polite"></div>
        <div id="speak-slot"></div>
        <div class="ex-next" id="ex-next" ${ex.type === 'learn' ? '' : 'hidden'}>
          <button class="button" type="button" data-ex-next>${i + 1 < items.length ? 'Next ›' : 'Finish'}</button>
        </div>
      </div>
    </section>`;
}

// Called after the card is in the page.
export function afterRender() {
  if (!session || session.empty || session.i >= session.items.length) return;
  const ex = session.items[session.i];
  initTracing(root());
  if (ex.audio && ex.autoplay !== false) playAudio(ex.audio, document.querySelector('[data-ex-play]'), { quiet: true });
  document.querySelector('.ex-title')?.focus({ preventScroll: true });
}

function rerender() {
  root().outerHTML = sessionHTML();
  window.scrollTo(0, 0);
  afterRender();
}

function endHTML() {
  const { set, results } = session;
  const right = results.filter(Boolean).length;
  const s = store.getCurrentStudent();
  const total = store.stats(s.id).today.exercises;
  if (set.daily) store.markDailyChallenge(s.id);
  if (set.lesson) store.completeLesson(s.id, set.id, results.length ? (right === results.length ? 3 : right >= results.length * 0.6 ? 2 : 1) : 1);
  if (set.game && !session.loggedGame) {
    session.loggedGame = true; // one finished game = one entry
    store.logActivity(s.id, { kind: 'game', item: null, ok: true, ex: set.id });
  }
  if (!session.celebrated && right >= Math.ceil(results.length / 2)) {
    session.celebrated = true;
    const done = session;
    setTimeout(() => { if (session === done) celebrate('lessonComplete', { student: s }); }, 200);
  }
  const stars = right === results.length ? 3 : right >= results.length * 0.6 ? 2 : 1;
  return `
    <section class="narrow card session done-card" id="session">
      <div class="stars" aria-label="${stars} of 3 stars">${'⭐'.repeat(stars)}</div>
      <h1 tabindex="-1">${esc(set.title)} — done!</h1>
      <p class="ar-line" lang="ar" dir="rtl">برافو! خلّصت اليوم ${exercisesAr(total)}!</p>
      <p>You got <b>${right} of ${results.length}</b> right on the first try.
      ${right < results.length ? 'Mistakes help you learn — play again to practise them.' : 'Every single one!'}</p>
      <div class="row center">
        <button class="button" type="button" data-ex-replay>Play again</button>
        <a class="button secondary" href="#/${set.back}">Back to ${esc(set.sectionTitle || 'section')}</a>
      </div>
    </section>`;
}

// ---- Renderers -------------------------------------------------------------

const playBtn = ex => ex.audio
  ? `<button class="big-play" type="button" data-ex-play aria-label="Play the sound">🔊</button>` : '';
const display = ex => `
  ${ex.display ? `<div class="ex-display" lang="ar" dir="rtl">${ex.display}</div>` : ''}
  ${ex.displaySub ? `<p class="ex-sub">${esc(ex.displaySub)}</p>` : ''}
  ${ex.tip ? `<p class="ex-tip">💡 ${ex.tip}</p>` : ''}`;

const RENDER = {
  choose: ex => `
    ${playBtn(ex)}${display(ex)}
    <div class="ex-options ${ex.options.length > 4 ? 'many' : ''}">
      ${ex.options.map((o, k) => `
        <div class="opt-wrap">
          ${o.audio ? `<button class="opt-play" type="button" data-say="${esc(o.audio)}" aria-label="Play ${esc(o.name || o.label)}">🔊</button>` : ''}
          <button class="ex-opt ${o.ar ? 'is-ar' : ''}" type="button" data-opt="${k}" ${o.ar ? 'lang="ar"' : ''}>
            ${o.ar ? esc(o.label) : esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>
        </div>`).join('')}
    </div>`,

  match: ex => {
    ex.left = ex.left || shuffle(ex.pairs.map((p, k) => ({ ...p, k })));
    ex.right = ex.right || shuffle(ex.pairs.map((p, k) => ({ ...p, k })));
    return `
      <div class="match-grid">
        <div class="match-col">${ex.left.map(p => `
          <button class="match-item match-left" type="button" data-ml="${p.k}" ${p.audio ? `aria-label="Sound ${p.k + 1}"` : ''}>
            ${p.audio ? '🔊' : `<span lang="ar">${esc(p.leftLabel)}</span>`}</button>`).join('')}</div>
        <div class="match-col">${ex.right.map(p => `
          <button class="match-item match-right" type="button" data-mr="${p.k}" lang="ar">${esc(p.label)}</button>`).join('')}</div>
      </div>
      <p class="hint">Tap ${ex.pairs[0].audio ? 'a 🔊 sound' : 'an item'} on the left, then its match on the right.</p>`;
  },

  build: ex => {
    ex.order = ex.order || shuffle(ex.tiles.map((t, k) => k));
    ex.placed = ex.placed || [];
    return `
      ${playBtn(ex)}${display(ex)}
      <div class="build-slot ${ex.joiner === ' ' ? 'words' : ''}" id="build-slot" lang="ar" dir="rtl" aria-live="polite">${buildText(ex) || '&nbsp;'}</div>
      <div class="build-tiles" dir="rtl">${ex.order.map(k => `
        <button class="tile" type="button" data-tile="${k}" lang="ar" ${ex.placed.includes(k) ? 'disabled' : ''}>${esc(ex.tiles[k])}</button>`).join('')}</div>
      <div class="row center">
        <button class="button secondary" type="button" data-build-undo>↶ Undo</button>
        <button class="button" type="button" data-build-check>Check</button>
      </div>`;
  },

  type: ex => `
    ${playBtn(ex)}${display(ex)}
    <form class="type-form" data-type-form autocomplete="off">
      <label class="sr-only" for="type-input">Your answer in Arabic</label>
      <input id="type-input" class="type-input" lang="ar" dir="rtl" autocomplete="off" autocapitalize="off"
             spellcheck="false" placeholder="اكتب هون…">
      ${keyboardHTML('type-input')}
      <button class="button" type="submit">Check ✓</button>
    </form>`,

  speak: ex => `${display(ex)}${speakPanel(ex.speak || ex)}`,

  learn: ex => `<div class="learn">${ex.html}</div>`,

  read: ex => `
    <div class="ex-display read-word" lang="ar" dir="rtl">${esc(ex.text)}</div>
    <div class="speak-buttons">
      ${canRecord() ? `
        <button class="speaker-pill rec" type="button" data-rec aria-pressed="false">🎙️ Record me reading</button>
        <button class="speaker-pill" type="button" data-rec-play disabled>▶️ My voice</button>` : ''}
    </div>
    <button class="button" type="button" data-read-check>Check ✓</button>
    <div class="read-reveal" id="read-reveal" hidden>
      <p class="read-answer"><b>${esc(ex.latin)}</b>${ex.en ? ` · ${esc(ex.en)}` : ''} ${ex.emoji || ''}</p>
      <p class="hint" id="read-audio-note"></p>
      <p>Did you read it right?</p>
      <div class="row center">
        <button class="button" type="button" data-read-self="yes">✓ Yes, I read it</button>
        <button class="button secondary" type="button" data-read-self="no">↺ Not yet</button>
      </div>
    </div>`,

  trace: ex => `
    ${display(ex)}${tracingHTML(ex.glyph, 'trace-pad')}
    <button class="button" type="button" data-trace-done disabled>I traced it ✓</button>`,
};

const buildText = ex => ex.placed.map(k => ex.tiles[k]).join(ex.joiner);

function speakPanel(sp) {
  return `
    <div class="speak-panel" data-speak-panel>
      <p class="speak-say"><b>🗣️ Now you say it!</b> <span lang="ar" dir="rtl">${esc(sp.text)}</span>
        ${sp.latin ? `<small>(${esc(sp.latin)})</small>` : ''}</p>
      <p class="ex-ar" lang="ar" dir="rtl">إسمع، وبعدين قول متلو.</p>
      <div class="speak-buttons">
        ${sp.audio ? `<button class="speaker-pill" type="button" data-say="${esc(sp.audio)}">🔊 Listen again</button>` : ''}
        ${canRecord() ? `
          <button class="speaker-pill rec" type="button" data-rec aria-pressed="false">🎙️ Record me</button>
          <button class="speaker-pill" type="button" data-rec-play disabled>▶️ My voice</button>` : ''}
      </div>
      <p class="speak-note">${canRecord()
        ? 'Record yourself, then play both and compare. The app does not score your pronunciation — your ears and your teacher do!'
        : 'Recording isn\'t available on this device — just say it out loud, then tap the button.'}</p>
      <button class="button" type="button" data-speak-done>I said it ✓</button>
    </div>`;
}

// ---- Answer handling ------------------------------------------------------

function feedback(html, kind) {
  const fb = document.getElementById('ex-feedback');
  fb.className = 'ex-feedback ' + kind;
  fb.innerHTML = html;
}

function finishExercise(ex, ok) {
  if (ex.finished) return;
  ex.finished = true;
  session.results.push(ok);
  const s = store.getCurrentStudent();
  store.logActivity(s.id, { kind: ex.kind, item: ex.item, ok, ex: ex.id });
  if (ex.speakAfter) {
    document.getElementById('speak-slot').innerHTML = speakPanel(ex.speakAfter);
    document.querySelector('[data-speak-panel] .speaker-pill')?.focus();
  } else {
    showNext();
  }
}

function showNext() {
  const next = document.getElementById('ex-next');
  next.hidden = false;
  next.querySelector('button').focus({ preventScroll: true });
  next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function answerChoose(btn) {
  const ex = session.items[session.i];
  if (ex.finished) return;
  const k = Number(btn.dataset.opt);
  const o = ex.options[k];
  ex.tries += 1;
  if (o.value === ex.answer) {
    btn.classList.add('ok');
    document.querySelectorAll('.ex-opt').forEach(b => { b.disabled = true; });
    sfx('correct');
    feedback(`<b lang="ar" dir="rtl">${cheer()}</b> ${ex.explain ? `<span class="ex-explain" dir="ltr">${esc(ex.explain)}</span>` : ''}`, 'ok');
    finishExercise(ex, ex.tries === 1);
  } else {
    btn.classList.add('bad');
    btn.disabled = true;
    feedback(`<span lang="ar" dir="rtl">${tryAgain(store.getCurrentStudent())}</span>
      ${o.why ? esc(o.why) : ex.hint ? esc(ex.hint) : ''}`, 'try');
    // After a second wrong try: a gentle "try again" sticker (at most every 30 s).
    if (ex.tries === 2) celebrate('tryAgain', { student: store.getCurrentStudent() });
    else if (ex.audio) playAudio(ex.audio, document.querySelector('[data-ex-play]'), { quiet: true });
  }
}

function answerMatch(btn) {
  const ex = session.items[session.i];
  if (ex.finished) return;
  if (btn.dataset.ml !== undefined) {
    document.querySelectorAll('.match-left').forEach(b => b.classList.remove('sel'));
    btn.classList.add('sel');
    ex.sel = Number(btn.dataset.ml);
    const p = ex.pairs[ex.sel];
    if (p.audio) playAudio(p.audio, btn);
    return;
  }
  if (ex.sel === undefined) {
    feedback('First tap something on the left.', 'try');
    return;
  }
  const k = Number(btn.dataset.mr);
  const left = document.querySelector(`[data-ml="${ex.sel}"]`);
  if (k === ex.sel) {
    [left, btn].forEach(b => { b.classList.remove('sel'); b.classList.add('ok'); b.disabled = true; });
    ex.matched = (ex.matched || 0) + 1;
    ex.sel = undefined;
    feedback(`<b lang="ar" dir="rtl">${cheer()}</b>`, 'ok');
    if (ex.matched === ex.pairs.length) {
      sfx('correct');
      finishExercise(ex, !ex.mistakes);
    }
  } else {
    ex.mistakes = (ex.mistakes || 0) + 1;
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 350);
    feedback(`<span lang="ar" dir="rtl">${tryAgain(store.getCurrentStudent())}</span>`, 'try');
  }
}

function buildAction(el) {
  const ex = session.items[session.i];
  if (ex.finished) return;
  const slot = document.getElementById('build-slot');
  if (el.dataset.tile !== undefined) {
    ex.placed.push(Number(el.dataset.tile));
    el.disabled = true;
  } else if (el.hasAttribute('data-build-undo')) {
    const k = ex.placed.pop();
    if (k !== undefined) document.querySelector(`[data-tile="${k}"]`).disabled = false;
  } else if (el.hasAttribute('data-build-check')) {
    ex.tries += 1;
    const got = normalize(buildText(ex));
    if (got === normalize(ex.answer)) {
      document.querySelectorAll('.tile, [data-build-undo], [data-build-check]').forEach(b => { b.disabled = true; });
      slot.classList.add('ok');
      sfx('correct');
      feedback(`<b lang="ar" dir="rtl">${cheer()}</b> ${ex.explain ? `<span class="ex-explain" dir="ltr">${esc(ex.explain)}</span>` : ''}`, 'ok');
      finishExercise(ex, ex.tries === 1);
    } else {
      feedback(`<span lang="ar" dir="rtl">${tryAgain(store.getCurrentStudent())}</span> ${esc(ex.hint || 'Check the order — Arabic is read from right to left.')}`, 'try');
    }
  }
  slot.innerHTML = buildText(ex) ? esc(buildText(ex)) : '&nbsp;';
}

function answerType(form) {
  const ex = session.items[session.i];
  if (ex.finished) return;
  const input = form.querySelector('input');
  const value = input.value;
  if (!normalize(value)) {
    feedback('Write your answer first (use the keyboard below if you need to).', 'try');
    input.focus();
    return;
  }
  ex.tries += 1;
  if (normalize(value) === normalize(ex.answer)) {
    input.disabled = true;
    form.querySelectorAll('button').forEach(b => { b.disabled = true; });
    input.classList.add('ok');
    sfx('correct');
    const s = store.getCurrentStudent();
    let extra = '';
    // Rule: only correct answers count, letters are not words, and each exercise counts once a day.
    if (!ex.revealed && ex.countWords !== false) {
      const n = normalize(ex.answer).split(' ').length;
      const { counted, total } = store.countWrittenWords(s.id, ex.id, n);
      if (counted) {
        extra = `<p class="ex-ar" lang="ar" dir="rtl">${total >= 5 ? 'برافو عليك!' : cheer(s)} كتبت اليوم ${wordsAr(total)}!</p>`;
      }
    }
    feedback(`<b lang="ar" dir="rtl">${cheer(s)}</b> <span lang="ar" dir="rtl">${esc(ex.answer)}</span>
      ${ex.explain ? `<span class="ex-explain" dir="ltr">${esc(ex.explain)}</span>` : ''}${extra}`, 'ok');
    if (ex.answerAudio) playAudio(ex.answerAudio, null, { quiet: true });
    finishExercise(ex, ex.tries === 1 && !ex.revealed);
  } else {
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 350);
    if (ex.tries >= 2) {
      ex.revealed = true;
      feedback(`The answer is <span class="reveal" lang="ar" dir="rtl">${esc(ex.answer)}</span>. Type it to continue
        (it won't count towards today's words, but it's great practice).`, 'try');
    } else {
      feedback(`<span lang="ar" dir="rtl">${tryAgain(store.getCurrentStudent())}</span> ${esc(ex.hint || '')}`, 'try');
    }
  }
}

async function toggleRecord(btn) {
  if (isRecording()) {
    const url = await stopRecording();
    btn.textContent = '🎙️ Record again';
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('recording');
    const play = document.querySelector('[data-rec-play]');
    if (url) {
      const ex = session.items[session.i];
      if (ex.myVoice) URL.revokeObjectURL(ex.myVoice);
      ex.myVoice = url;
      play.disabled = false;
      play.focus();
    }
    return;
  }
  stopAudio();
  try {
    await startRecording();
    btn.textContent = '⏹ Stop';
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('recording');
  } catch (e) {
    showAudioMessage(e.message);
  }
}

function speakDone() {
  const ex = session.items[session.i];
  if (ex.spoken) return;
  ex.spoken = true;
  if (isRecording()) stopRecording();
  const s = store.getCurrentStudent();
  const sp = ex.speakAfter || ex.speak || ex;
  // A speaking activity is counted when the learner finishes the Speak step.
  // (A standalone speak exercise is logged as 'speak' by finishExercise instead.)
  if (ex.type !== 'speak') store.logActivity(s.id, { kind: 'speak', item: sp.text, ok: true, ex: ex.id + ':speak' });
  document.querySelector('[data-speak-done]').disabled = true;
  if (ex.type === 'speak') {
    feedback(`<b lang="ar" dir="rtl">${cheer(s)}</b> ${ex.myVoice ? 'Listen to both again any time — practice makes perfect.' : ''}`, 'ok');
    finishExercise(ex, true);
  } else {
    feedback(`<b lang="ar" dir="rtl">${cheer(s)}</b>`, 'ok');
    showNext();
  }
}

// ---- Events ----------------------------------------------------------------

document.addEventListener('click', e => {
  if (!session || !root()) return;
  const t = e.target.closest('[data-read-check],[data-read-self],[data-trace-done],[data-ex-play],[data-opt],[data-ml],[data-mr],[data-tile],[data-build-undo],[data-build-check],[data-rec],[data-rec-play],[data-speak-done],[data-ex-next],[data-ex-replay]');
  if (!t || !root().contains(t)) return;
  const ex = session.items[session.i];
  if (t.hasAttribute('data-ex-play')) playAudio(ex.audio, t);
  else if (t.dataset.opt !== undefined) answerChoose(t);
  else if (t.dataset.ml !== undefined || t.dataset.mr !== undefined) answerMatch(t);
  else if (t.dataset.tile !== undefined || t.hasAttribute('data-build-undo') || t.hasAttribute('data-build-check')) buildAction(t);
  else if (t.hasAttribute('data-rec')) toggleRecord(t);
  else if (t.hasAttribute('data-rec-play')) { stopAudio(); if (ex.myVoice) new Audio(ex.myVoice).play().catch(() => {}); }
  else if (t.hasAttribute('data-speak-done')) speakDone();
  else if (t.hasAttribute('data-read-check')) revealReading(ex, t);
  else if (t.dataset.readSelf) {
    document.querySelectorAll('[data-read-self]').forEach(b => { b.disabled = true; });
    const s = store.getCurrentStudent();
    if (t.dataset.readSelf === 'yes') {
      sfx('correct');
      feedback(`<b lang="ar" dir="rtl">${cheer(s)}</b><span class="ex-explain" dir="ltr">You're reading Arabic!</span>`, 'ok');
    } else {
      feedback(`<span lang="ar" dir="rtl">كل محاولة بتعلّمك شي جديد!</span><span class="ex-explain" dir="ltr">Listen again, then read it once more out loud.</span>`, 'try');
    }
    finishExercise(ex, t.dataset.readSelf === 'yes');
  } else if (t.hasAttribute('data-trace-done')) {
    t.disabled = true;
    feedback(`<b lang="ar" dir="rtl">${cheer()}</b><span class="ex-explain" dir="ltr">Compare your letter with the example. Clear and trace again any time!</span>`, 'ok');
    finishExercise(ex, true);
  }
  else if (t.hasAttribute('data-ex-next')) {
    if (isRecording()) stopRecording();
    session.i += 1;
    rerender();
  } else if (t.hasAttribute('data-ex-replay')) {
    root().outerHTML = startSession(session.set);
    afterRender();
  }
});

document.addEventListener('submit', e => {
  if (!e.target.matches('[data-type-form]')) return;
  e.preventDefault();
  answerType(e.target);
});

export function leaveSession() {
  if (isRecording()) stopRecording();
  session = null;
}

// Test hook for automated browser tests only (active when the address contains ?test).
if (location.search.includes('test')) window.__alsamaSession = () => session;

// Enable "I traced it" once the learner has actually drawn something.
document.addEventListener('traced', e => {
  const done = document.querySelector('[data-trace-done]');
  if (done && !session?.items[session.i]?.finished) done.disabled = Number(e.target.dataset.drawn || 0) < 5;
});

// Reading challenge: show how it is said, and play Alsama's recording when there is one.
async function revealReading(ex, btn) {
  btn.disabled = true;
  if (isRecording()) document.querySelector('[data-rec]')?.click();
  document.getElementById('read-reveal').hidden = false;
  const note = document.getElementById('read-audio-note');
  if (ex.audio && await hasRecording(ex.audio)) {
    note.innerHTML = `<button class="speaker-pill" type="button" data-say="${esc(ex.audio)}">🔊 Listen again</button>`;
    playAudio(ex.audio, note.querySelector('button'), { quiet: true });
  } else {
    note.textContent = 'Recording coming soon — use the pronunciation above.';
  }
}
