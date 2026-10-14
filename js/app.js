// Screen routing. Each screen is a function that returns HTML.
// The address bar shows where you are, e.g.  #/home  or  #/profile/new
// so the browser Back button works.

import * as store from './progress.js';
import { stopAudio } from './audio.js';
import { celebrate } from './celebrate.js';

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

        <label for="firstName">First name <span class="req">(required)</span></label>
        <input id="firstName" name="firstName" autocomplete="given-name" maxlength="40" required value="${esc(v.firstName)}">
        <p class="field-error" id="firstName-error" hidden>Please write your first name.</p>

        <label for="nickname">Favourite nickname <span class="opt">(optional)</span></label>
        <input id="nickname" name="nickname" maxlength="40" value="${esc(v.nickname)}"
               placeholder="What should we call you?">

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

        <p class="privacy">🔒 Your details are saved only on this device.</p>
        <p class="field-error" id="save-error" role="alert" hidden></p>

        <div class="row">
          <button class="button" type="submit">${s ? 'Save' : 'Let’s go!'}</button>
          <button class="button secondary" type="button" data-go="${store.getStudents().length ? 'who' : 'welcome'}">Cancel</button>
          ${s ? `<button class="button danger" type="button" data-delete="${esc(s.id)}">Delete learner</button>` : ''}
        </div>
      </form>
    </section>`;
}

function homeScreen() {
  const s = store.getCurrentStudent();
  if (!s) { go('who'); return ''; }
  const name = store.displayName(s);

  const sections = [
    { title: 'Explore the alphabet', ar: 'الحروف', text: 'All 28 letters, their sounds and shapes.', img: 'images/teacher-fist-bump.jpg', stage: 3 },
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
          <article class="section-card is-soon">
            ${x.img ? `<img class="${x.sticker ? 'sticker' : 'photo'}" src="assets/${x.img}" alt="">` : '<div class="section-icon" aria-hidden="true">✍️</div>'}
            <div>
              <h3>${x.title} <span lang="ar" dir="rtl">${x.ar}</span></h3>
              <p>${x.text}</p>
              <span class="badge">Coming soon</span>
            </div>
          </article>`).join('')}
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
      <p>🔒 Your name and details are saved only in this browser, on this device.
      You can edit or delete a learner at any time from <a href="#/who">Who's learning today?</a></p>
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
  };
  const html = (routes[screen] || welcomeScreen)();
  if (!html) return; // the screen redirected somewhere else
  app.innerHTML = html;
  updateHeader();
  window.scrollTo(0, 0);
  app.querySelector('h1')?.focus({ preventScroll: true });
}

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
}

// ---- Actions --------------------------------------------------------------

document.addEventListener('click', e => {
  const t = e.target.closest('[data-go],[data-pick],[data-edit],[data-delete],#mute');
  if (!t) return;

  if (t.id === 'mute') {
    store.setMuted(!store.getSettings().muted);
    if (store.getSettings().muted) stopAudio();
    updateHeader();
  } else if (t.dataset.go === 'start') {
    go(store.getStudents().length ? 'who' : 'profile/new');
  } else if (t.dataset.go) {
    go(t.dataset.go);
  } else if (t.dataset.pick) {
    store.setCurrentStudent(t.dataset.pick);
    go('home');
  } else if (t.dataset.edit) {
    go('profile/' + t.dataset.edit);
  } else if (t.dataset.delete) {
    const s = store.getStudent(t.dataset.delete);
    if (s && confirm(`Delete ${s.firstName}? Their details on this device will be removed.`)) {
      store.deleteStudent(s.id);
      go(store.getStudents().length ? 'who' : 'welcome');
    }
  }
});

document.addEventListener('submit', e => {
  if (e.target.id !== 'profile-form') return;
  e.preventDefault();
  const f = e.target;
  const data = Object.fromEntries(new FormData(f));
  const nameError = f.querySelector('#firstName-error');
  const saveError = f.querySelector('#save-error');

  if (!data.firstName.trim()) {
    nameError.hidden = false;
    f.firstName.setAttribute('aria-invalid', 'true');
    f.firstName.setAttribute('aria-describedby', 'firstName-error');
    f.firstName.focus();
    return;
  }

  const day = Number(data.day), month = Number(data.month);
  const editingId = location.hash.split('/')[2];
  const isNew = editingId === 'new';
  try {
    const student = store.saveStudent({
      firstName: data.firstName,
      nickname: data.nickname,
      birthday: day && month ? { day, month } : null,
      favouriteWord: data.favouriteWord,
      address: data.address,
    }, isNew ? null : editingId);
    go('home');
    if (isNew) celebrate('welcome', { student });
  } catch (err) {
    saveError.textContent = err.message;
    saveError.hidden = false;
  }
});

// Hide the "write your name" message as soon as they start typing.
document.addEventListener('input', e => {
  if (e.target.id !== 'firstName') return;
  e.target.removeAttribute('aria-invalid');
  document.getElementById('firstName-error').hidden = true;
});

window.addEventListener('hashchange', render);
render();
