// Plays Alsama's own recordings. Never falls back to a synthetic voice.
//
// To add a recording: put the MP3 in assets/audio/<folder>/ and add one line
// to assets/audio/manifest.json, e.g.  "تَ": "audio/syllables/ta.mp3"

import { getSettings } from './progress.js';

let manifest = null;
let current = null;        // the Audio object playing now
let currentButton = null;  // the button that started it

async function loadManifest() {
  if (manifest) return manifest;
  try {
    const res = await fetch('assets/audio/manifest.json');
    if (!res.ok) throw new Error(res.status);
    manifest = await res.json();
  } catch (e) {
    console.error('Could not load audio manifest', e);
    manifest = {};
  }
  return manifest;
}

export async function hasRecording(key) {
  return Boolean((await loadManifest())[key]);
}

function setState(button, state) {
  if (!button) return;
  button.dataset.audioState = state;           // CSS shows loading / playing / error
  button.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
}

export function stopAudio() {
  if (current) {
    current.pause();
    current = null;
  }
  setState(currentButton, 'idle');
  currentButton = null;
}

// Plays the recording for `key` (the Arabic text). `button` is optional and
// gets a visual loading / playing / error state.
// Returns 'played', 'missing', 'muted' or 'error'.
export async function playAudio(key, button) {
  stopAudio();
  if (getSettings().muted) {
    showAudioMessage('Sound is off. Tap 🔇 at the top to turn it on.');
    return 'muted';
  }

  const path = (await loadManifest())[key];
  if (!path) {
    setState(button, 'missing');
    showAudioMessage('🎙️ Recording coming soon');
    return 'missing';
  }

  const audio = new Audio('assets/' + path);
  current = audio;
  currentButton = button || null;
  setState(button, 'loading');

  audio.addEventListener('playing', () => setState(button, 'playing'));
  audio.addEventListener('ended', () => {
    if (current === audio) stopAudio();
  });

  try {
    await audio.play();
    return 'played';
  } catch (e) {
    if (current !== audio) return 'played'; // another sound started; not an error
    console.error('Audio failed', key, e);
    setState(button, 'error');
    current = null;
    showAudioMessage("Sorry, this sound didn't play. Check your volume and try again.");
    return 'error';
  }
}

// Short, polite message at the bottom of the screen (read by screen readers).
let messageTimer;
export function showAudioMessage(text) {
  let box = document.getElementById('audio-message');
  if (!box) {
    box = document.createElement('div');
    box.id = 'audio-message';
    box.setAttribute('role', 'status');
    document.body.append(box);
  }
  box.textContent = text;
  box.classList.add('show');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => box.classList.remove('show'), 2800);
}

// Any element with data-say="<arabic>" becomes a speaker button.
document.addEventListener('click', e => {
  const button = e.target.closest('[data-say]');
  if (button) playAudio(button.dataset.say, button);
});
