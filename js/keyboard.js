// On-screen Arabic keyboard, for learners whose device has no Arabic keyboard.
// Works together with the device keyboard: both type into the same box.

const ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ذ', 'ء', 'ؤ', 'ر', 'ى', 'ة', 'و', 'ز', 'ظ', 'د', 'أ'],
];

export function keyboardHTML(targetId) {
  return `
    <div class="ar-keyboard" data-kb-target="${targetId}" dir="rtl" lang="ar" aria-label="Arabic keyboard">
      ${ROWS.map(r => `<div class="kb-row">${r.map(k =>
        `<button type="button" class="kb-key" data-kb="${k}" aria-label="${k}">${k}</button>`).join('')}</div>`).join('')}
      <div class="kb-row">
        <button type="button" class="kb-key kb-wide" data-kb="⌫" aria-label="Delete" dir="ltr">⌫</button>
        <button type="button" class="kb-key kb-space" data-kb=" " aria-label="Space">مسافة</button>
      </div>
    </div>`;
}

document.addEventListener('click', e => {
  const key = e.target.closest('[data-kb]');
  if (!key) return;
  const input = document.getElementById(key.closest('[data-kb-target]').dataset.kbTarget);
  if (!input || input.disabled) return;
  const v = key.dataset.kb;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  if (v === '⌫') {
    const from = start === end ? Math.max(0, start - 1) : start;
    input.value = input.value.slice(0, from) + input.value.slice(end);
    input.setSelectionRange(from, from);
  } else {
    input.value = input.value.slice(0, start) + v + input.value.slice(end);
    input.setSelectionRange(start + v.length, start + v.length);
  }
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
