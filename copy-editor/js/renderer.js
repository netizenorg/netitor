// Field rendering — walks an entry object and builds the edit form dynamically.
// Works for any entry shape (nested objects, primitives, null, arrays).
// Special handling: description group always renders first; description.html
// changes auto-derive description.text via DOM stripping.

import { state } from './state.js';
import { STATUS_OPTIONS } from './constants.js';
import { setNestedValue, autoResizeTextarea } from './utils.js';

// Callback registered by main.js — called whenever any field value changes
let _onChange = null;

export function init ({ onChange }) {
  _onChange = onChange;
}

// ── Entry normalization ─────────────────────────────────────────────────────
// Handles two JSON shapes:
//   regular:  { "name": { ...entry } }
//   events:   { "name": [ {...variant}, ...] }  → flatten to "name[0]", "name[1]", …

export function normalizeEntries (data) {
  const entries = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach((variant, idx) => {
        const type = variant.type || variant.keyword?.text || String(idx);
        entries.push({ id: `${key}[${idx}]`, label: `${key} [${type}]`, data: variant });
      });
    } else {
      entries.push({ id: key, label: key, data: value });
    }
  }
  return entries;
}

// ── Field rendering ─────────────────────────────────────────────────────────

export function renderFields () {
  const container = document.getElementById('fieldContainer');
  container.innerHTML = '';
  if (!state.editData) return;

  const titleEl = document.createElement('div');
  titleEl.id = 'entryTitle';
  const entryUrl = state.editData?.url || state.editData?.urls?.[0] || null;
  if (entryUrl) {
    const link = document.createElement('a');
    link.href   = entryUrl;
    link.target = '_blank';
    link.rel    = 'noopener noreferrer';
    link.textContent = state.entries[state.idx].label;
    titleEl.appendChild(link);
  } else {
    titleEl.textContent = state.entries[state.idx].label;
  }
  container.appendChild(titleEl);

  renderObject(container, state.editData, '');
}

function renderObject (container, obj, pathPrefix) {
  let entries = Object.entries(obj);

  // At the top level, sort description to the front
  if (!pathPrefix) {
    entries.sort(([a], [b]) => {
      if (a === 'description') return -1;
      if (b === 'description') return 1;
      return 0;
    });
  }

  for (const [key, value] of entries) {
    const path = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Nested object → collapsible group
      const group  = document.createElement('div');
      group.className = key === 'description' ? 'field-group desc-group' : 'field-group';

      const hdr = document.createElement('div');
      hdr.className   = 'field-group-header';
      hdr.textContent = key;
      group.appendChild(hdr);

      const nested = document.createElement('div');
      nested.className = 'field-nested';
      group.appendChild(nested);
      container.appendChild(group);

      renderObject(nested, value, path);
    } else {
      renderPrimitive(container, key, value, path);
    }
  }
}

function renderPrimitive (container, key, value, path) {
  const row = document.createElement('div');
  row.className = 'field-row';

  const label = document.createElement('div');
  label.className   = 'field-label';
  label.textContent = key;
  row.appendChild(label);

  // Stable ID: dots → dashes, brackets normalised
  const fieldId = 'f-' + path.replace(/\./g, '-').replace(/\[/g, '_').replace(/\]/g, '');
  const strVal  = value === null ? '' : (Array.isArray(value) ? JSON.stringify(value, null, 2) : String(value));
  const isLong  = strVal.length > 80 || strVal.includes('\n') || key === 'html' || key === 'text';

  let input;
  if (key === 'status') {
    // Status is an enum — render as a dropdown
    input = document.createElement('select');
    input.className = 'field-select';
    const opts = STATUS_OPTIONS.includes(strVal) ? STATUS_OPTIONS : [...STATUS_OPTIONS, strVal];
    opts.forEach(opt => {
      const el = document.createElement('option');
      el.value       = opt;
      el.textContent = opt;
      if (opt === strVal) el.selected = true;
      input.appendChild(el);
    });
  } else if (isLong || Array.isArray(value)) {
    input = document.createElement('textarea');
    input.className = 'field-textarea';
    input.value     = strVal;
    input.rows      = Math.max(3, Math.min(12, strVal.split('\n').length + 1));
  } else {
    input = document.createElement('input');
    input.type      = 'text';
    input.className = 'field-input';
    input.value     = strVal;
  }

  input.id              = fieldId;
  input.dataset.path    = path;
  input.dataset.isArr   = Array.isArray(value) ? '1' : '0';
  input.dataset.isNull  = value === null       ? '1' : '0';

  if (value === null) {
    input.placeholder   = '(null)';
    input.style.opacity = '0.5';
  }

  input.addEventListener('input', onFieldChange);
  row.appendChild(input);
  container.appendChild(row);
}

// ── Public helpers used by claude.js ───────────────────────────────────────

/**
 * Update a DOM field (identified by its data path) and auto-resize if textarea.
 */
export function setFieldValue (path, value) {
  const id    = 'f-' + path.replace(/\./g, '-');
  const field = document.getElementById(id);
  if (!field) return;
  field.value = value;
  if (field.tagName === 'TEXTAREA') autoResizeTextarea(field);
}

/**
 * Read every form field and flush current values into state.editData.
 * Call before save or before sending to Claude to catch any un-fired events.
 */
export function syncFormToData () {
  document.getElementById('fieldContainer')
    .querySelectorAll('[data-path]')
    .forEach(input => {
      const path  = input.dataset.path;
      let   value = input.value;
      if (input.dataset.isArr  === '1') { try { value = JSON.parse(value); } catch (_) {} }
      if (input.dataset.isNull === '1' && value === '') value = null;
      setNestedValue(state.editData, path, value);
    });
}

// ── Internal field-change handler ──────────────────────────────────────────

function onFieldChange (e) {
  const path  = e.target.dataset.path;
  let   value = e.target.value;

  if (e.target.dataset.isArr === '1') {
    try { value = JSON.parse(value); } catch (_) { /* keep as string until valid JSON */ }
  } else if (e.target.dataset.isNull === '1' && value === '') {
    value = null;
  }

  setNestedValue(state.editData, path, value);

  // When description.html changes, auto-derive the plain-text version
  if (path === 'description.html') {
    const tmp = document.createElement('div');
    tmp.innerHTML   = value;
    const plainText = tmp.textContent || tmp.innerText || '';
    setNestedValue(state.editData, 'description.text', plainText);
    setFieldValue('description.text', plainText);
  }

  if (_onChange) _onChange();
}
