// Tracing pad: a faint guide letter to trace with a finger, mouse or stylus.
// The app does NOT grade handwriting — learners compare with the example themselves.

const GUIDE = 'rgba(183, 21, 90, 0.16)';
const INK = '#B7155A';

// glyph: the letter or letter shape to trace (e.g. 'ب', 'بـ', 'ـبـ').
export function tracingHTML(glyph, id = 'trace') {
  return `
    <div class="trace-box" data-trace-box>
      <div class="trace-example" aria-hidden="true">
        <span lang="ar">${glyph}</span><small>Example</small>
      </div>
      <canvas class="trace-pad" id="${id}" data-trace="${glyph}" role="img"
              aria-label="Tracing pad. Trace the letter with your finger or mouse."></canvas>
      <div class="trace-buttons">
        <button class="button secondary" type="button" data-trace-clear="${id}">↺ Clear</button>
      </div>
      <p class="hint">Follow the faint letter. Arabic is written from right to left — start on the right.
      The app can't check handwriting: compare your letter with the example.</p>
    </div>`;
}

function drawGuide(canvas) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = GUIDE;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.font = `700 ${Math.round(h * 0.55)}px "Noto Naskh Arabic", serif`;
  ctx.fillText(canvas.dataset.trace, w / 2, h * 0.5);
}

function setup(canvas) {
  if (canvas.dataset.ready) return;
  canvas.dataset.ready = '1';
  const dpr = window.devicePixelRatio || 1;
  const size = canvas.getBoundingClientRect();
  canvas.width = Math.round(size.width * dpr);
  canvas.height = Math.round(size.height * dpr);
  const ctx = canvas.getContext('2d');

  const redraw = () => drawGuide(canvas);
  redraw();
  if (document.fonts) document.fonts.load('700 40px "Noto Naskh Arabic"').then(redraw).catch(() => {});

  let drawing = false;
  let last = null;
  const point = e => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr };
  };
  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    last = point(e);
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = point(e);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
    canvas.dataset.drawn = String(Number(canvas.dataset.drawn || 0) + 1);
    canvas.dispatchEvent(new CustomEvent('traced', { bubbles: true }));
  });
  const end = () => { drawing = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

// Call after new tracing pads are added to the page.
export function initTracing(root = document) {
  root.querySelectorAll('canvas[data-trace]').forEach(setup);
}

document.addEventListener('click', e => {
  const b = e.target.closest('[data-trace-clear]');
  if (!b) return;
  const canvas = document.getElementById(b.dataset.traceClear);
  if (!canvas) return;
  drawGuide(canvas);
  canvas.dataset.drawn = '0';
  canvas.dispatchEvent(new CustomEvent('traced', { bubbles: true }));
});
