// Record the learner's voice so they can listen back and compare with the reference.
// Recordings stay in this browser tab only: they are never saved or uploaded.
// The app does NOT score pronunciation — there is no speech-assessment service.

let recorder = null;
let chunks = [];
let stream = null;

export const canRecord = () =>
  Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);

// Resolves when recording has started. Throws a friendly Error if the microphone is unavailable.
export async function startRecording() {
  if (!canRecord()) throw new Error('Recording is not available in this browser. Say it out loud instead!');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { noiseSuppression: true, echoCancellation: true } });
  } catch (e) {
    throw new Error('The microphone is blocked. Allow microphone access in your browser settings, or just say it out loud.');
  }
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  recorder.start();
  window.dispatchEvent(new CustomEvent('alsama:voice', { detail: 'start' })); // quiet the music
}

// Resolves with a playable URL for the recording.
export function stopRecording() {
  return new Promise(resolve => {
    if (!recorder || recorder.state === 'inactive') return resolve(null);
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      window.dispatchEvent(new CustomEvent('alsama:voice', { detail: 'end' }));
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      recorder = null;
      resolve(blob.size ? URL.createObjectURL(blob) : null);
    };
    recorder.stop();
  });
}

export const isRecording = () => Boolean(recorder && recorder.state === 'recording');
