// Screen routing. Each screen is a function that returns HTML.
// The address bar shows where you are, e.g.  #/home  or  #/profile/new
// so the browser Back button works.

import * as store from './progress.js';
import { stopAudio, playAudio, showAudioMessage } from './audio.js';
import { celebrate } from './celebrate.js';
import { applyMusicSettings, sfx } from './music.js';
import { sendRegistration, sendPendingRegistrations, deleteRegistration } from './register.js';
import { LETTERS } from './data/letters.js';

const app = document.getElementById('app');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// Makes student-typed text safe to put into HTML.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const go = route => { location.hash = '#/' + route; };

// ---- Screens --------------------------------------------------------------

function welcomeScreen() {
  return `
    <section class="welcome">
      <img class="welcome-logo" src="assets/logo/alsama-language-school.png" alt="Alsama Language School">
      <h1 class="ar-hero" lang="ar" dir="rtl" tabindex="-1">أهلاً وسهلاً!</h1>
      <p class="lead">Welcome to the Alsama Language School family!</p>

      <figure class="photo-frame">
        <img src="assets/images/students-library.jpg"
             alt="Alsama students smiling together in the library">
        <img class="sticker sticker-corner" src="assets/stickers/graduates-celebrate.png" alt="">
      </figure>

      <p class="ar-line" lang="ar" dir="rtl">يلا نتعلّم عربي شامي سوا!</p>
      <p class="lead small">Let's learn Levantine Arabic together!</p>

      <button class="button big" type="button" data-go="start">Start learning</button>
      <p class="muted">Listen, practise, play games and repeat any lesson whenever you need. No sign-up needed.</p>
      <button class="speaker-pill" type="button" data-say="مَرْحَبًا" aria-label="Listen: marhaba">
        🔊 <span lang="ar" dir="rtl">مَرْحَبًا</span> <small>marhaba · hello</small>
      </button>
    </section>`;
}

function whoScreen() {
  const students = store.getStudents();
  return `
    <section class="narrow">
      <h1 tabindex="-1">Who's learning today?</h1>
      <p class="ar-line" lang="ar" dir="rtl">مين عم يتعلّم اليوم؟</p>
      <ul class="student-list">
        ${students.map(s => `
          <li>
            <button class="student" type="button" data-pick="${esc(s.id)}">
              <span class="avatar" aria-hidden="true">${esc([...s.firstName][0] || '?')}</span>
              <span><b>${esc(store.displayName(s))}</b>
              ${s.nickname ? `<small>${esc(s.firstName)}</small>` : ''}</span>
            </button>
            <button class="icon-button" type="button" data-edit="${esc(s.id)}"
                    aria-label="Edit ${esc(s.firstName)}">✏️</button>
          </li>`).join('')}
      </ul>
      <button class="button" type="button" data-go="profile/new">+ Add a new learner</button>
      <p class="muted">Each learner's progress is kept separately on this device.</p>
    </section>`;
}

function profileScreen(id) {
  const s = id ? store.getStudent(id) : null;
  if (id && !s) { go('who'); return ''; }
  const v = s || { firstName: '', nickname: '', birthday: null, favouriteWord: '', address: 'n' };
  const day = v.birthday ? v.birthday.day : '';
  const month = v.birthday ? v.birthday.month : '';

  return `
    <section class="profile-layout">
      <figure class="profile-photo">
        <img class="sticker" src="assets/stickers/teacher-helping-student.png"
             alt="An Alsama teacher helping a student with her Arabic">
      </figure>

      <form class="card form" id="profile-form" novalidate>
        <h1 tabindex="-1">${s ? 'Edit your details' : 'Tell us about you'}</h1>
        <p class="ar-line" lang="ar" dir="rtl">عرّفنا عليك!</p>

        <div class="why-box">
          <b>Why we ask</b>
          <p>Your answers are sent securely to <b>Alsama Language School</b>, so your teacher knows
          who is learning and can choose the right level for you. Only your name and age group are
          required — skip anything else. Your learning progress stays on this device.</p>
        </div>

        <label for="firstName">First name or nickname <span class="req">(required)</span></label>
        <input id="firstName" name="firstName" autocomplete="given-name" maxlength="40" required value="${esc(v.firstName)}">
        <p class="field-error" id="firstName-error" hidden>Please write your first name or nickname.</p>

        <label for="nickname">Favourite nickname <span class="opt">(optional)</span></label>
        <input id="nickname" name="nickname" maxlength="40" value="${esc(v.nickname)}"
               placeholder="What should we call you?">

        ${registrationFields(v.registration || {})}

        <h2 class="form-subhead">Just for fun <span class="opt">(stays on this device)</span></h2>

        <fieldset>
          <legend>Birthday <span class="opt">(optional)</span></legend>
          <div class="row">
            <select name="day" aria-label="Birthday day">
              <option value="">Day</option>
              ${Array.from({ length: 31 }, (_, i) => i + 1).map(d =>
                `<option value="${d}" ${d === day ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            <select name="month" aria-label="Birthday month">
              <option value="">Month</option>
              ${MONTHS.map((m, i) =>
                `<option value="${i + 1}" ${i + 1 === month ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <p class="hint">Just the day and month, so we can wish you a happy birthday 🎂</p>
        </fieldset>

        <label for="favouriteWord">Your favourite word in Arabic <span class="opt">(optional)</span></label>
        <input id="favouriteWord" name="favouriteWord" maxlength="40" lang="ar" dir="rtl"
               class="arabic-input" value="${esc(v.favouriteWord)}" placeholder="مثلاً: حبيبي">

        <fieldset>
          <legend>How should we cheer you on?</legend>
          <div class="choices">
            ${[['m', 'شاطر!', 'for a boy / man'], ['f', 'شاطرة!', 'for a girl / woman'], ['n', 'برافو!', 'no preference']]
              .map(([val, ar, en]) => `
              <label class="choice">
                <input type="radio" name="address" value="${val}" ${v.address === val ? 'checked' : ''}>
                <span lang="ar" dir="rtl">${ar}</span><small>${en}</small>
              </label>`).join('')}
          </div>
        </fieldset>

        <p class="privacy">🔒 Your registration details go only to Alsama Language School. Birthday,
        favourite word and learning progress stay on this device. You can delete your details at any
        time (Who's learning → ✏️ → Delete learner).</p>
        <p class="field-error" id="save-error" role="alert" hidden></p>

        <div class="row">
          <button class="button" type="submit">${s ? 'Save' : 'Let’s go!'}</button>
          <button class="button secondary" type="button" data-go="${store.getStudents().length ? 'who' : 'welcome'}">Cancel</button>
          ${s ? `<button class="button danger" type="button" data-delete="${esc(s.id)}">Delete learner</button>` : ''}
        </div>
      </form>
    </section>`;
}

const AGE_GROUPS = [['under13', 'Under 13'], ['13-17', '13 – 17'], ['18plus', '18 or older']];
const LEVELS = [
  ['new', 'Complete beginner'], ['some-letters', 'I know some letters'],
  ['read-a-little', 'I can read a little'], ['speak-a-little', 'I can speak a little'], ['not-sure', 'Not sure'],
];
const COUNTRIES = ['Jordan', 'Lebanon', 'Syria', 'Palestine', 'United Kingdom', 'United States', 'Germany',
  'France', 'Netherlands', 'Sweden', 'Canada', 'Australia', 'Turkey', 'United Arab Emirates', 'Qatar'];
const LANGUAGES = ['English', 'French', 'German', 'Spanish', 'Dutch', 'Swedish', 'Italian', 'Turkish',
  'Urdu', 'Hindi', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Portuguese'];

function registrationFields(r) {
  return `
    <fieldset>
      <legend>Age group <span class="req">(required)</span></legend>
      <div class="choices">
        ${AGE_GROUPS.map(([val, label]) => `
          <label class="choice">
            <input type="radio" name="ageGroup" value="${val}" ${r.ageGroup === val ? 'checked' : ''}>
            <span>${label}</span>
          </label>`).join('')}
      </div>
      <p class="field-error" id="ageGroup-error" hidden>Please choose an age group.</p>
    </fieldset>

    <div class="consent" id="consent-box" ${r.ageGroup === 'under13' ? '' : 'hidden'}>
      <label class="check">
        <input type="checkbox" name="parentConsent" ${r.parentConsent ? 'checked' : ''}>
        <span>I am this learner's <b>parent or guardian</b>, and I agree to these details being shared
        with Alsama Language School.</span>
      </label>
      <p class="field-error" id="parentConsent-error" hidden>Learners under 13 need a parent or guardian to tick this box.</p>
    </div>

    <label for="country">Country you live in <span class="opt">(optional)</span></label>
    <input id="country" name="country" list="country-list" maxlength="60" autocomplete="country-name" value="${esc(r.country)}">
    <datalist id="country-list">${COUNTRIES.map(c => `<option value="${c}">`).join('')}</datalist>

    <label for="nativeLanguage">Native language <span class="opt">(optional)</span></label>
    <input id="nativeLanguage" name="nativeLanguage" list="language-list" maxlength="60" value="${esc(r.nativeLanguage)}">
    <datalist id="language-list">${LANGUAGES.map(c => `<option value="${c}">`).join('')}</datalist>

    <label for="level">Your Arabic level <span class="opt">(optional)</span></label>
    <select id="level" name="level">
      <option value="">Choose…</option>
      ${LEVELS.map(([val, label]) => `<option value="${val}" ${r.level === val ? 'selected' : ''}>${label}</option>`).join('')}
    </select>

    <label for="email">Email <span class="opt">(optional)</span></label>
    <input id="email" name="email" type="email" maxlength="254" autocomplete="email" value="${esc(r.email)}"
           aria-describedby="email-hint">
    <p class="hint" id="email-hint">Only if you'd like Alsama to contact you. We never share it.</p>
    <p class="field-error" id="email-error" hidden>This email doesn't look right. Please check it, or leave it empty.</p>

    <div class="hp" aria-hidden="true">
      <label>Leave this empty <input name="website" tabindex="-1" autocomplete="off"></label>
    </div>`;
}

// ---- Letters: Back / Next / Home through all 28 letters ----------------------

function letterScreen(n) {
  const s = store.getCurrentStudent();
  if (!s) { go('who'); return ''; }
  const i = Number(n);
  if (!Number.isInteger(i) || i < 1 || i > LETTERS.length) { go('letters/1'); return ''; }
  const L = LETTERS[i - 1];
  const p = store.getProgress(s.id);
  const heard = p.lettersHeard.includes(i);
  if (p.lastLetter !== i) store.updateProgress(s.id, { lastLetter: i });

  return `
    <section class="letter-screen">
      <div class="letter-top">
        <p class="letter-count">Letter <b>${i}</b> of ${LETTERS.length}</p>
        <div class="bar" role="progressbar" aria-label="Letters heard" aria-valuemin="0"
             aria-valuemax="${LETTERS.length}" aria-valuenow="${p.lettersHeard.length}">
          <i style="width:${p.lettersHeard.length / LETTERS.length * 100}%"></i>
        </div>
      </div>

      <div class="letter-card card">
        <h1 class="sr-only" tabindex="-1">Letter ${i}: ${L.latin}</h1>
        <button class="letter-big" type="button" data-letter-say="${i}" lang="ar"
                aria-label="Hear the letter ${L.latin}">${L.char}</button>
        <p class="letter-name" lang="ar" dir="rtl">${L.name}</p>
        <p class="letter-latin">${L.latin}</p>
        <button class="speaker-pill" type="button" data-letter-say="${i}" aria-label="Listen to ${L.latin}">
          🔊 Listen
        </button>
        <p class="heard ${heard ? 'is-heard' : ''}" id="heard">${heard ? '✓ Heard' : 'Tap to listen'}</p>
        ${L.joins === false ? '<p class="letter-note">🔗 This letter never joins the letter after it.</p>' : ''}
        ${L.hard ? '<p class="letter-note">👂 A special Arabic sound — listen carefully and repeat it out loud.</p>' : ''}
      </div>

      ${stepNav(i > 1 ? `letters/${i - 1}` : null, i < LETTERS.length ? `letters/${i + 1}` : 'letters/done')}

      <nav class="letter-strip" aria-label="All letters">
        ${LETTERS.map((x, j) => `<a href="#/letters/${j + 1}" lang="ar" class="${j + 1 === i ? 'current' : ''} ${p.lettersHeard.includes(j + 1) ? 'heard' : ''}"
           ${j + 1 === i ? 'aria-current="page"' : ''} aria-label="Letter ${j + 1}, ${x.latin}">${x.char}</a>`).join('')}
      </nav>
    </section>`;
}

function lettersDoneScreen() {
  const s = store.getCurrentStudent();
  if (!s) { go('who'); return ''; }
  const p = store.getProgress(s.id);
  const first = !p.alphabetDone;
  store.updateProgress(s.id, { alphabetDone: true });
  if (first) setTimeout(() => celebrate('lessonComplete', { student: s }), 150);

  return `
    <section class="narrow card done-card">
      <img class="sticker done-sticker" src="assets/stickers/graduates-celebrate.png"
           alt="Two Alsama graduates celebrating">
      <h1 tabindex="-1">You've met all 28 letters!</h1>
      <p class="ar-line" lang="ar" dir="rtl">برافو عليك يا ${esc(store.displayName(s))}!</p>
      <p>You listened to <b>${p.lettersHeard.length}</b> of 28 letters.
      ${p.lettersHeard.length < 28 ? 'Go back any time to hear the ones you missed.' : 'Every single one — amazing!'}</p>
      <div class="row center">
        <button class="button" type="button" data-go="letters/1">Start again from ا</button>
      </div>
      ${stepNav('letters/28', null)}
    </section>`;
}

// Back · Home · Next bar. A null target shows that button as unavailable.
function stepNav(back, next) {
  return `
    <nav class="step-nav" aria-label="Letter navigation">
      <button class="step back" type="button" ${back ? `data-go="${back}"` : 'disabled'} aria-label="Back">
        <span aria-hidden="true">‹</span> Back</button>
      <button class="step home" type="button" data-go="home" aria-label="Home">
        <span aria-hidden="true">🏠</span> Home</button>
      <button class="step next" type="button" ${next ? `data-go="${next}"` : 'disabled'} aria-label="Next">
        Next <span aria-hidden="true">›</span></button>
    </nav>`;
}

function homeScreen() {
  const s = store.getCurrentStudent();
  if (!s) { go('who'); return ''; }
  const name = store.displayName(s);

  const progress = store.getProgress(s.id);
  const sections = [
    { title: 'Explore the alphabet', ar: 'الحروف', img: 'images/teacher-fist-bump.jpg',
      href: `#/letters/${progress.lastLetter}`,
      text: progress.lettersHeard.length
        ? `You've heard ${progress.lettersHeard.length} of 28 letters. Continue from letter ${progress.lastLetter}.`
        : 'Meet all 28 letters and hear how they sound.' },
    { title: 'Lessons', ar: 'الدروس', text: 'Six short lessons, step by step.', img: 'stickers/teacher-helping-student.png', stage: 4, sticker: true },
    { title: 'Writing practice', ar: 'الكتابة', text: 'Trace letters with your finger or mouse.', stage: 4 },
    { title: 'Games', ar: 'الألعاب', text: 'Listen, match and play.', img: 'stickers/teacher-cheering.png', stage: 6, sticker: true },
  ];

  return `
    <section>
      <div class="hero">
        <div>
          <h1 lang="ar" dir="rtl" tabindex="-1">أهلاً يا ${esc(name)}!</h1>
          <p>Ready to learn some Shami Arabic today?</p>
          ${store.isBirthdayToday(s) ? `<p class="birthday" lang="ar" dir="rtl">🎂 عيد ميلاد سعيد يا ${esc(name)}!</p>` : ''}
          ${s.favouriteWord ? `<p class="fav">Your favourite word: <span lang="ar" dir="rtl">${esc(s.favouriteWord)}</span></p>` : ''}
          <button class="speaker-pill light" type="button" data-say="مَرْحَبًا" aria-label="Listen: marhaba">
            🔊 <span lang="ar" dir="rtl">مَرْحَبًا</span>
          </button>
        </div>
        <img class="sticker hero-sticker" src="assets/stickers/graduates-celebrate.png"
             alt="Two Alsama graduates celebrating with a certificate">
      </div>

      <h2>What would you like to do?</h2>
      <div class="sections">
        ${sections.map(x => `
          <${x.href ? `a href="${x.href}"` : 'article'} class="section-card ${x.href ? 'is-live' : 'is-soon'}">
            ${x.img ? `<img class="${x.sticker ? 'sticker' : 'photo'}" src="assets/${x.img}" alt="">` : '<div class="section-icon" aria-hidden="true">✍️</div>'}
            <div>
              <h3>${x.title} <span lang="ar" dir="rtl">${x.ar}</span></h3>
              <p>${x.text}</p>
              ${x.href ? '<span class="badge live">Start ›</span>' : '<span class="badge">Coming soon</span>'}
            </div>
          </${x.href ? 'a' : 'article'}>`).join('')}
      </div>

      <a class="section-card classic" href="legacy/arabic-alphabet-app.html">
        <div class="section-icon" aria-hidden="true">🔤</div>
        <div>
          <h3>Classic alphabet app</h3>
          <p>Use the original six lessons while the new ones are being built.</p>
        </div>
      </a>
    </section>`;
}

function aboutScreen() {
  return `
    <section class="narrow card">
      <h1 tabindex="-1">About this app</h1>
      <p>This app is made by <b>Alsama Language School</b> to help you learn
      <b>Levantine (Shami) Arabic</b>, the Arabic spoken every day in Syria, Lebanon, Jordan and Palestine.</p>
      <p>The recordings are by the Alsama team, and the photos show real Alsama students and teachers.</p>
      <h2>Your information</h2>
      <p>🔒 When you join, your registration details (name, age group and anything else you choose
      to add, such as country, native language, Arabic level or email) are sent securely to
      <b>Alsama Language School</b>, so your teacher can support you. They are never sold or shared.</p>
      <p>Your birthday, favourite word and learning progress stay only on this device.</p>
      <p>You can edit or delete a learner at any time from <a href="#/who">Who's learning today?</a>
      Deleting a learner also deletes their registration from Alsama's records.</p>
      <img class="sticker about-sticker" src="assets/stickers/teacher-cheering.png"
           alt="Alsama teachers celebrating together">
    </section>`;
}

// ---- Router ---------------------------------------------------------------

function render() {
  stopAudio();
  const [screen, param] = location.hash.replace(/^#\/?/, '').split('/');
  const routes = {
    '': welcomeScreen,
    welcome: welcomeScreen,
    who: whoScreen,
    profile: () => profileScreen(param === 'new' ? null : param),
    home: homeScreen,
    about: aboutScreen,
    letters: () => (param === 'done' ? lettersDoneScreen() : letterScreen(param || store.getProgress(store.getCurrentStudent()?.id).lastLetter)),
  };
  const html = (routes[screen] || welcomeScreen)();
  if (!html) return; // the screen redirected somewhere else
  app.innerHTML = html;
  updateHeader();
  window.scrollTo(0, 0);
  app.querySelector('h1')?.focus({ preventScroll: true });
  if (autoplayLetter && screen === 'letters' && param !== 'done') {
    playLetter(Number(param), app.querySelector('.letter-card .speaker-pill'), true);
  }
  autoplayLetter = false;
}
let autoplayLetter = false;

function updateHeader() {
  const s = store.getCurrentStudent();
  const who = document.getElementById('header-student');
  who.hidden = !s;
  if (s) who.textContent = '👤 ' + store.displayName(s);
  const mute = document.getElementById('mute');
  const muted = store.getSettings().muted;
  mute.textContent = muted ? '🔇' : '🔊';
  mute.setAttribute('aria-pressed', String(muted));
  mute.setAttribute('aria-label', muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off');

  const st = store.getSettings();
  const musicBtn = document.getElementById('music-toggle');
  musicBtn.setAttribute('aria-pressed', String(st.musicOn));
  musicBtn.textContent = st.musicOn ? '🎵 Music on' : '🎵 Music off';
  document.getElementById('music-volume').value = Math.round(st.musicVolume * 100);
}

// ---- Letter audio ---------------------------------------------------------

function playLetter(i, button, quiet = false) {
  const s = store.getCurrentStudent();
  const L = LETTERS[i - 1];
  playAudio(L.name, button, {
    quiet,
    onEnded: () => {
      const p = store.getProgress(s.id);
      if (p.lettersHeard.includes(i)) return;
      store.updateProgress(s.id, { lettersHeard: [...p.lettersHeard, i].sort((a, b) => a - b) });
      sfx('correct'); // a small happy chime the first time a letter is heard
      const heard = document.getElementById('heard');
      if (heard) { heard.textContent = '✓ Heard'; heard.classList.add('is-heard'); }
      document.querySelector('.letter-strip .current')?.classList.add('heard');
      const bar = document.querySelector('.letter-top .bar');
      if (bar) {
        const n = p.lettersHeard.length + 1;
        bar.setAttribute('aria-valuenow', n);
        bar.querySelector('i').style.width = n / LETTERS.length * 100 + '%';
      }
    },
  });
}

// ---- Actions --------------------------------------------------------------

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-pick],[data-edit],[data-delete],[data-letter-say],#mute,#music-toggle,#music-menu');
  if (!t) return;

  if (t.id === 'mute') {
    store.setMuted(!store.getSettings().muted);
    if (store.getSettings().muted) stopAudio();
    applyMusicSettings();
    updateHeader();
  } else if (t.id === 'music-menu') {
    const panel = document.getElementById('music-panel');
    panel.hidden = !panel.hidden;
    t.setAttribute('aria-expanded', String(!panel.hidden));
  } else if (t.id === 'music-toggle') {
    store.setMusic({ on: !store.getSettings().musicOn });
    applyMusicSettings();
    updateHeader();
  } else if (t.dataset.letterSay) {
    playLetter(Number(t.dataset.letterSay), t.closest('.letter-card').querySelector('.speaker-pill'));
  } else if (t.dataset.go === 'start') {
    go(store.getStudents().length ? 'who' : 'profile/new');
  } else if (t.dataset.go) {
    autoplayLetter = /^letters\/\d+$/.test(t.dataset.go); // Back/Next: say the new letter
    go(t.dataset.go);
  } else if (t.dataset.pick) {
    store.setCurrentStudent(t.dataset.pick);
    go('home');
  } else if (t.dataset.edit) {
    go('profile/' + t.dataset.edit);
  } else if (t.dataset.delete) {
    removeLearner(store.getStudent(t.dataset.delete), t);
  }
});

async function removeLearner(s, button) {
  if (!s || !confirm(`Delete ${s.firstName}? This removes their details from this device and from Alsama Language School's records.`)) return;
  button.disabled = true;
  const result = await deleteRegistration(s);
  if (result === 'failed') {
    button.disabled = false;
    const err = document.getElementById('save-error');
    err.textContent = "We couldn't reach Alsama to delete the registration. Please check your internet connection and try again.";
    err.hidden = false;
    return;
  }
  store.deleteStudent(s.id);
  showAudioMessage('Learner deleted.');
  go(store.getStudents().length ? 'who' : 'welcome');
}

// Music volume slider
document.addEventListener('input', e => {
  if (e.target.id !== 'music-volume') return;
  store.setMusic({ volume: e.target.value / 100, on: e.target.value > 0 ? true : store.getSettings().musicOn });
  applyMusicSettings();
  updateHeader();
});

// Close the music panel with Escape or a click elsewhere.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMusicPanel();
});
document.addEventListener('click', e => {
  if (!e.target.closest('#music-panel,#music-menu')) closeMusicPanel();
});
function closeMusicPanel() {
  const panel = document.getElementById('music-panel');
  if (panel.hidden) return;
  panel.hidden = true;
  document.getElementById('music-menu').setAttribute('aria-expanded', 'false');
}

// Show the parent/guardian box only for under-13s.
document.addEventListener('change', e => {
  if (e.target.name !== 'ageGroup') return;
  document.getElementById('consent-box').hidden = e.target.value !== 'under13';
  document.getElementById('ageGroup-error').hidden = true;
});

function showFieldError(f, name, show) {
  const error = f.querySelector(`#${name}-error`);
  error.hidden = !show;
  const input = f.querySelector(`[name="${name}"]`);
  if (show) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', `${name}-error`);
  } else {
    input.removeAttribute('aria-invalid');
  }
  return show;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

document.addEventListener('submit', async e => {
  if (e.target.id !== 'profile-form') return;
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f));
  const saveError = f.querySelector('#save-error');
  saveError.hidden = true;

  const email = (data.email || '').trim();
  const problems = [
    showFieldError(f, 'firstName', !data.firstName.trim()) && 'firstName',
    showFieldError(f, 'ageGroup', !data.ageGroup) && 'ageGroup',
    showFieldError(f, 'parentConsent', data.ageGroup === 'under13' && !data.parentConsent) && 'parentConsent',
    showFieldError(f, 'email', email && !EMAIL_RE.test(email)) && 'email',
  ].filter(Boolean);
  if (problems.length) {
    f.querySelector(`[name="${problems[0]}"]`).focus();
    return;
  }

  const day = Number(data.day), month = Number(data.month);
  const editingId = location.hash.split('/')[2];
  const isNew = editingId === 'new';
  const submit = f.querySelector('[type="submit"]');
  let student;
  try {
    student = store.saveStudent({
      firstName: data.firstName,
      nickname: data.nickname,
      birthday: day && month ? { day, month } : null,
      favouriteWord: data.favouriteWord,
      address: data.address,
      registration: {
        ageGroup: data.ageGroup,
        parentConsent: data.ageGroup === 'under13' && Boolean(data.parentConsent),
        country: (data.country || '').trim(),
        nativeLanguage: (data.nativeLanguage || '').trim(),
        level: data.level || '',
        email,
      },
    }, isNew ? null : editingId);
  } catch (err) {
    saveError.textContent = err.message;
    saveError.hidden = false;
    return;
  }

  if (data.website) return; // hidden field only bots fill in

  submit.disabled = true;
  submit.textContent = 'Sending…';
  const result = await sendRegistration(student);
  submit.disabled = false;

  if (result === 'invalid') {
    saveError.textContent = 'Some details could not be accepted. Please check the form and try again.';
    saveError.hidden = false;
    submit.textContent = isNew ? 'Let’s go!' : 'Save';
    return;
  }
  const messages = {
    sent: '✅ You are registered with Alsama Language School!',
    updated: '✅ Your details are updated.',
    already: '✅ You are already registered — welcome back!',
    pending: '💾 Saved. Your details will be sent to Alsama as soon as the connection works.',
  };
  go('home');
  showAudioMessage(messages[result]);
  if (isNew) celebrate('welcome', { student });
});

// Hide the "write your name" message as soon as they start typing.
document.addEventListener('input', e => {
  if (!['firstName', 'email'].includes(e.target.id)) return;
  e.target.removeAttribute('aria-invalid');
  document.getElementById(e.target.id + '-error').hidden = true;
});
document.addEventListener('change', e => {
  if (e.target.name === 'parentConsent') document.getElementById('parentConsent-error').hidden = true;
});

window.addEventListener('hashchange', render);
render();
sendPendingRegistrations(); // retry any registration that couldn't be sent before
