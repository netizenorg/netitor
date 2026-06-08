// ── Pure utilities — no DOM dependencies, no module imports ────────────────

export const deepClone = o => JSON.parse(JSON.stringify(o));
export const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const escHtml = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function getNestedValue (obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

export function setNestedValue (obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export function autoResizeTextarea (ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
}

/**
 * Briefly swap a button's text + add a CSS class, then restore.
 * @param {string} id        — button element id
 * @param {string} text      — flash text
 * @param {string} cls       — CSS class to add during flash
 * @param {number} [ms=1600] — duration in milliseconds
 */
export function flashBtn (id, text, cls, ms = 1600) {
  const btn = document.getElementById(id);
  if (!btn) return;
  const origText = btn.textContent;
  const origCls  = btn.className;
  btn.textContent = text;
  btn.className   = origCls + ' ' + cls;
  setTimeout(() => {
    btn.textContent = origText;
    btn.className   = origCls;
  }, ms);
}

/**
 * Persist current file + entry index in the URL via replaceState
 * so a page refresh lands back in the same spot without creating
 * a history entry.
 */
export function updateURL (filePath, entryIdx) {
  const params = new URLSearchParams();
  if (filePath)      params.set('file',  filePath);
  if (entryIdx >= 0) params.set('entry', entryIdx);
  history.replaceState(null, '', '?' + params.toString());
}
