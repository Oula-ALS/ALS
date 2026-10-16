// Alsama stickers & encouragement.
//   celebrate('welcome' | 'correct' | 'streak' | 'lessonComplete' | 'tryAgain', { student })
// Which photo and message appear is set in assets/stickers/stickers.json.

import { playAudio, hasRecording } from './audio.js';
import { getSettings } from './progress.js';
import { sfx } from './music.js';

let config = null;
let lastSmallAt = 0;
const SMALL_EVENTS = ['correct', 'streak', 'tryAgain'];
const SMALL_GAP_MS = 30000; // small stickers at most every 30 seconds

async function loadConfig() {
  if (config) return config;
  try {
    config = await (await fetch('assets/stickers/stickers.json')).json();
  } catch (e) {
    console.error('Could not load stickers.json', e);
    config = { events: {} };
  }
  return config;
}

const pick = list => list[Math.floor(Math.random() * list.length)];

export async function celebrate(event, { student } = {}) {
  const small = SMALL_EVENTS.includes(event);
  if (small && Date.now() - lastSmallAt < SMALL_GAP_MS) return;
  if (small) lastSmallAt = Date.now();

  const e = (await loadConfig()).events[event];
  if (!e) return;

  const address = student && student.address;
  let messages = e.messages || [];
  if (address === 'm' && e.messagesMale) messages = [...messages, ...e.messagesMale];
  if (address === 'f' && e.messagesFemale) messages = [...messages, ...e.messagesFemale];
  const title = address === 'f' && e.titleFemale ? e.titleFemale : e.title;

  show({
    small,
    title,
    sticker: pick(e.stickers),
    message: pick(messages),
    english: e.english,
  });

  // Alsama's own recorded voice (e.g. "برافوو") when it exists; otherwise a gentle chime.
  // Never both, so sounds don't overlap. "Try again" never plays a 'wrong' sound.
  if (getSettings().muted) return;
  let sounds = e.sounds || [];
  if (address === 'm' && e.soundsMale) sounds = e.soundsMale;
  if (address === 'f' && e.soundsFemale) sounds = e.soundsFemale;
  const available = [];
  for (const key of sounds) if (await hasRecording(key)) available.push(key);
  if (available.length) playAudio(pick(available), null, { quiet: true });
  else if (event !== 'tryAgain') sfx(small ? 'correct' : 'celebrate');
}

function show({ small, title, sticker, message, english }) {
  document.querySelector('.celebration')?.remove();
  const returnFocus = document.activeElement;

  const box = document.createElement('div');
  box.className = 'celebration' + (small ? ' small' : '');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', small ? 'false' : 'true');
  box.setAttribute('aria-label', 'Celebration');
  box.innerHTML = `
    <div class="celebration-card">
      <p class="celebration-title" lang="ar" dir="rtl"></p>
      <img class="sticker" alt="Alsama Language School celebration">
      <p class="celebration-message" lang="ar" dir="rtl"></p>
      <p class="celebration-english"></p>
      <button class="button" type="button">Continue</button>
    </div>`;
  // textContent keeps any text safe to display
  box.querySelector('.celebration-title').textContent = title || '';
  box.querySelector('.celebration-message').textContent = message || '';
  box.querySelector('.celebration-english').textContent = english || '';
  const img = box.querySelector('img');
  img.src = 'assets/' + sticker;
  img.onerror = () => img.replaceWith(Object.assign(document.createElement('div'), {
    className: 'sticker-placeholder', textContent: 'STICKER: ' + sticker,
  }));

  const close = () => {
    box.remove();
    document.removeEventListener('keydown', onKey);
    if (!small && returnFocus) returnFocus.focus?.();
  };
  const onKey = ev => { if (ev.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  box.querySelector('button').addEventListener('click', close);
  box.addEventListener('click', ev => { if (ev.target === box) close(); });

  document.body.append(box);
  if (!small) box.querySelector('button').focus();
  else setTimeout(close, 2500);
}
