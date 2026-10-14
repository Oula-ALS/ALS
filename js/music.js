// Soft background music and gentle sound effects, made live with the Web Audio API
// (no music files, no copyright issues).
//
// - Music starts only after the learner first taps or presses a key (browser rule).
// - When a recording plays (audio.js sends 'alsama:voice'), the music fades
//   down and comes back gently afterwards, so the voice is always clearer.
// - Only one music loop and one sound effect can play at a time.

import { getSettings } from './progress.js';

let ctx = null;
let musicBus = null;   // music volume (learner's slider)
let duckBus = null;    // lowered while a recording plays
let sfxBus = null;
let lastSfx = null;
let playing = false;
let schedulerTimer = null;
let nextNoteTime = 0;
let step = 0;

const MUSIC_LEVEL = 0.22;     // music stays quiet even at 100%
const DUCK_LEVEL = 0.12;      // how loud music is while the voice speaks (12%)
const SFX_LEVEL = 0.35;

// ---- Setup ----------------------------------------------------------------

function ensureContext() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  const soften = ctx.createBiquadFilter();
  soften.type = 'lowpass';
  soften.frequency.value = 3200;
  const limiter = ctx.createDynamicsCompressor();
  soften.connect(limiter).connect(ctx.destination);

  duckBus = ctx.createGain();
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(duckBus).connect(soften);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = SFX_LEVEL;
  sfxBus.connect(limiter);
  return ctx;
}

const musicTarget = () => {
  const s = getSettings();
  return s.muted || !s.musicOn ? 0 : MUSIC_LEVEL * s.musicVolume;
};

function fade(param, value, seconds) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + seconds);
}

// ---- The tune -------------------------------------------------------------
// A gentle music-box melody over soft chords: C – Am – F – G, about 84 beats a minute.

const BEAT = 60 / 84 / 2; // one eighth note
const CHORDS = [
  [261.63, 329.63, 392.00], // C
  [220.00, 261.63, 329.63], // Am
  [174.61, 220.00, 261.63], // F
  [196.00, 246.94, 293.66], // G
];
// Melody notes per chord (0 = rest). 16 eighth notes = 2 bars per chord.
const MELODY = [
  [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0, 587.33, 0, 523.25, 0, 659.25, 0, 0, 0],
  [440.00, 0, 523.25, 0, 659.25, 0, 523.25, 0, 587.33, 0, 523.25, 0, 440.00, 0, 0, 0],
  [349.23, 0, 440.00, 0, 523.25, 0, 587.33, 0, 523.25, 0, 440.00, 0, 523.25, 0, 0, 0],
  [392.00, 0, 493.88, 0, 587.33, 0, 783.99, 0, 698.46, 0, 587.33, 0, 493.88, 0, 0, 0],
];

function bell(freq, time, length, level, bus) {
  // Music-box sound: a sine with a soft overtone and a quick, gentle fade.
  [[1, level], [2, level * 0.25]].forEach(([mult, lvl]) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * mult;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(lvl, time + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, time + length);
    o.connect(g).connect(bus);
    o.start(time);
    o.stop(time + length + 0.05);
  });
}

function pad(freqs, time, length) {
  freqs.forEach(f => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f / 2;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(0.05, time + 0.6);
    g.gain.linearRampToValueAtTime(0.0001, time + length);
    o.connect(g).connect(musicBus);
    o.start(time);
    o.stop(time + length + 0.05);
  });
}

function scheduler() {
  while (nextNoteTime < ctx.currentTime + 0.3) {
    const chord = Math.floor(step / 16) % 4;
    const i = step % 16;
    if (i === 0) pad(CHORDS[chord], nextNoteTime, 16 * BEAT);
    const note = MELODY[chord][i];
    if (note) bell(note, nextNoteTime, 1.4, 0.16, musicBus);
    nextNoteTime += BEAT;
    step = (step + 1) % 64;
  }
}

function startLoop() {
  if (playing || !ensureContext()) return;
  playing = true;
  nextNoteTime = ctx.currentTime + 0.1;
  schedulerTimer = setInterval(scheduler, 100);
  fade(musicBus.gain, musicTarget(), 1.5);
}

function stopLoop() {
  if (!playing) return;
  playing = false;
  clearInterval(schedulerTimer);
  fade(musicBus.gain, 0, 0.4);
}

// ---- Public controls ------------------------------------------------------

// Call after any change to sound settings (on/off, volume, mute).
export function applyMusicSettings() {
  if (!ctx) return;              // nothing has been tapped yet
  if (musicTarget() > 0) {
    if (ctx.state === 'suspended') ctx.resume();
    if (!playing) startLoop();
    else fade(musicBus.gain, musicTarget(), 0.3);
  } else {
    stopLoop();
  }
}

// Short, gentle sound effects: 'correct' | 'complete' | 'celebrate'
export function sfx(name) {
  if (getSettings().muted || !ensureContext()) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (lastSfx) fade(lastSfx.gain, 0, 0.05); // never stack effects
  const g = ctx.createGain();
  g.connect(sfxBus);
  lastSfx = g;
  const t = ctx.currentTime + 0.06;
  const notes = {
    correct: [[659.25, 0], [987.77, 0.1]],
    complete: [[523.25, 0], [659.25, 0.1], [783.99, 0.2], [1046.5, 0.32]],
    celebrate: [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.36], [783.99, 0.5], [1046.5, 0.62]],
  }[name] || [];
  notes.forEach(([f, at]) => bell(f, t + at, 0.9, 0.5, g));
}

// ---- Wiring ---------------------------------------------------------------

// Start audio on the first tap/key press (browsers block sound before that).
function unlock() {
  window.removeEventListener('pointerdown', unlock);
  window.removeEventListener('keydown', unlock);
  ensureContext();
  applyMusicSettings();
}
window.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

// Fade music down while a recording plays, then back up.
window.addEventListener('alsama:voice', e => {
  if (!ctx || !playing) return;
  if (e.detail === 'start') fade(duckBus.gain, DUCK_LEVEL, 0.2);
  else fade(duckBus.gain, 1, 0.9);
});

// Pause when the app is in the background.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else if (playing || lastSfx) ctx.resume();
});
