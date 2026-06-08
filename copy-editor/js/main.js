// Entry point — orchestrates state, file loading, UI, and event wiring.

import { FILES } from './constants.js';
import { initDB, idbPut, idbDelete, idbGetAllForFile, idbDeleteAllForFile } from './db.js';
import { state } from './state.js';
import { deepClone, deepEqual, escHtml, flashBtn, updateURL } from './utils.js';
import {
  normalizeEntries,
  renderFields,
  syncFormToData,
  init as rendererInit,
} from './renderer.js';
import { getClaudeSuggestions, init as claudeInit } from './claude.js';

// ── Status badge ────────────────────────────────────────────────────────────

function updateStatusBadge () {
  const badge = document.getElementById('statusBadge');
  if (!state.editData || state.idx < 0) {
    badge.className  = 'badge';
    badge.textContent = '';
    return;
  }

  const saved    = state.savedMap.get(state.entries[state.idx].id);
  const original = state.entries[state.idx].data;

  if (saved && deepEqual(state.editData, saved)) {
    badge.className   = 'badge saved';
    badge.textContent = '✓ locally saved';
  } else if (!deepEqual(state.editData, original) || saved) {
    badge.className   = 'badge modified';
    badge.textContent = '● unsaved changes';
  } else {
    badge.className   = 'badge original';
    badge.textContent = '— original';
  }
}

// ── Entry select rebuild ────────────────────────────────────────────────────

function rebuildEntrySelect () {
  const sel = document.getElementById('entrySelect');
  sel.innerHTML = '';

  state.entries.forEach((entry, i) => {
    const opt       = document.createElement('option');
    opt.value       = i;
    const isSaved   = state.savedMap.has(entry.id);
    opt.textContent = (isSaved ? '✓ ' : '') + entry.label;
    if (isSaved) opt.style.color = 'var(--green)';
    sel.appendChild(opt);
  });

  sel.disabled = state.entries.length === 0;
  if (state.idx >= 0) sel.value = state.idx;
}

// ── Clear editor (between file loads) ──────────────────────────────────────

function clearEditor () {
  document.getElementById('fieldContainer').innerHTML =
    '<div class="empty-state">loading…</div>';
  document.getElementById('statusBadge').className   = 'badge';
  document.getElementById('statusBadge').textContent = '';
  document.getElementById('entryCount').textContent  = '';
  document.getElementById('prevBtn').disabled        = true;
  document.getElementById('nextBtn').disabled        = true;
  document.getElementById('saveLocalBtn').disabled    = true;
  document.getElementById('resetBtn').disabled        = true;
  document.getElementById('clearSavesBtn').disabled   = true;
  document.getElementById('getSuggestionsBtn').disabled = true;
  document.getElementById('suggestionsContainer').innerHTML =
    '<div class="empty-state">select an entry and click above.</div>';
}

// ── File loading ────────────────────────────────────────────────────────────

async function loadFile (filePath) {
  state.filePath = filePath;
  state.fileData = null;
  state.entries  = [];
  state.idx      = -1;
  state.editData = null;
  state.savedMap = new Map();

  clearEditor();
  document.getElementById('entrySelect').innerHTML = '<option>loading…</option>';

  const res = await fetch(filePath);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${filePath}`);
  state.fileData = await res.json();

  state.entries  = normalizeEntries(state.fileData);
  state.savedMap = await idbGetAllForFile(filePath);

  rebuildEntrySelect();
  document.getElementById('downloadBtn').disabled   = false;
  document.getElementById('clearSavesBtn').disabled = false;
  updateURL(filePath, 0);
  if (state.entries.length > 0) selectEntry(0);
}

// ── Entry selection ─────────────────────────────────────────────────────────

function selectEntry (idx) {
  if (idx < 0 || idx >= state.entries.length) return;
  state.idx = idx;

  const entry         = state.entries[idx];
  const savedData     = state.savedMap.get(entry.id);
  state.editData      = deepClone(savedData || entry.data);

  document.getElementById('entrySelect').value     = idx;
  document.getElementById('entryCount').textContent = `${idx + 1} / ${state.entries.length}`;
  document.getElementById('prevBtn').disabled       = idx === 0;
  document.getElementById('nextBtn').disabled       = idx === state.entries.length - 1;
  document.getElementById('saveLocalBtn').disabled  = false;
  document.getElementById('resetBtn').disabled      = false;
  document.getElementById('getSuggestionsBtn').disabled = false;
  document.getElementById('suggestionsContainer').innerHTML =
    '<div class="empty-state">click above to get suggestions for this entry.</div>';

  updateURL(state.filePath, idx);
  renderFields();
  updateStatusBadge();
}

// ── Save locally ────────────────────────────────────────────────────────────

async function saveLocally () {
  if (state.idx < 0 || !state.editData) return;
  syncFormToData();
  const entry = state.entries[state.idx];
  const clone = deepClone(state.editData);
  await idbPut(state.filePath, entry.id, clone);
  state.savedMap.set(entry.id, clone);
  updateStatusBadge();
  rebuildEntrySelect();
  flashBtn('saveLocalBtn', '✓ saved!', 'btn-saved');
}

// ── Undo — remove local save and revert to original ────────────────────────

async function undoEntry () {
  if (state.idx < 0) return;
  const entry = state.entries[state.idx];
  await idbDelete(state.filePath, entry.id);
  state.savedMap.delete(entry.id);
  state.editData = deepClone(entry.data);
  rebuildEntrySelect();
  renderFields();
  updateStatusBadge();
}

// ── Clear all local saves for current file ──────────────────────────────────

async function clearLocalSaves () {
  if (!state.filePath) return;
  const filename = state.filePath.split('/').pop();
  const count    = state.savedMap.size;
  const noun     = count === 1 ? 'entry' : 'entries';
  const ok = window.confirm(
    `Clear all locally saved edits for ${filename}?\n\n` +
    `This will permanently delete ${count} saved ${noun} from your browser. ` +
    `The original file will not be affected.`
  );
  if (!ok) return;

  await idbDeleteAllForFile(state.filePath);
  state.savedMap = new Map();

  // Reload the current entry from original data and refresh the select list
  rebuildEntrySelect();
  if (state.idx >= 0) {
    state.editData = deepClone(state.entries[state.idx].data);
    renderFields();
  }
  updateStatusBadge();
  flashBtn('clearSavesBtn', '✓ cleared', 'btn-saved');
}

// ── Download JSON ───────────────────────────────────────────────────────────
// Merges the original fetched file with all locally-saved IDB edits.

async function downloadJSON () {
  if (!state.fileData || !state.filePath) return;

  const allEdits = await idbGetAllForFile(state.filePath);
  const output   = deepClone(state.fileData);

  for (const [entryId, editData] of allEdits) {
    // events.json style IDs: "abort[0]" → key "abort", index 0
    const m = entryId.match(/^(.+)\[(\d+)\]$/);
    if (m) {
      const [, key, idxStr] = m;
      if (Array.isArray(output[key])) output[key][parseInt(idxStr)] = editData;
    } else {
      output[entryId] = editData;
    }
  }

  const filename = state.filePath.split('/').pop();
  const blob     = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const a        = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Init ────────────────────────────────────────────────────────────────────

async function init () {
  await initDB();

  // Wire callback dependencies
  rendererInit({ onChange: updateStatusBadge });
  claudeInit({ onChange: updateStatusBadge });

  // Populate file dropdown
  const fileSelect = document.getElementById('fileSelect');
  FILES.forEach(f => {
    const opt       = document.createElement('option');
    opt.value       = f.path;
    opt.textContent = f.label;
    fileSelect.appendChild(opt);
  });

  // Restore API key
  const savedKey = localStorage.getItem('netitor_api_key');
  if (savedKey) {
    document.getElementById('apiKeyInput').value   = savedKey;
    document.getElementById('apiKeyStatus').textContent = 'set ✓';
    document.getElementById('apiKeyStatus').className   = 'key-set';
  }

  // Restore file + entry from URL params (survives refresh)
  const params   = new URLSearchParams(location.search);
  const urlFile  = params.get('file');
  const urlEntry = parseInt(params.get('entry') ?? '-1', 10);

  if (urlFile && FILES.some(f => f.path === urlFile)) {
    document.getElementById('fileSelect').value = urlFile;
    try {
      await loadFile(urlFile);
      if (urlEntry > 0 && urlEntry < state.entries.length) selectEntry(urlEntry);
    } catch (err) {
      document.getElementById('fieldContainer').innerHTML =
        `<div class="empty-state error-msg">⚠ could not restore: ${escHtml(err.message)}</div>`;
    }
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  document.getElementById('saveApiKeyBtn').addEventListener('click', () => {
    const k = document.getElementById('apiKeyInput').value.trim();
    if (!k) return;
    localStorage.setItem('netitor_api_key', k);
    document.getElementById('apiKeyStatus').textContent = 'saved ✓';
    document.getElementById('apiKeyStatus').className   = 'key-set';
  });

  document.getElementById('fileSelect').addEventListener('change', async e => {
    const path = e.target.value;
    if (!path) return;
    try {
      await loadFile(path);
    } catch (err) {
      document.getElementById('fieldContainer').innerHTML =
        `<div class="empty-state error-msg">
          ⚠ could not load file: ${escHtml(err.message)}<br><br>
          <small>make sure you're serving this page via a local http server<br>
          e.g. <code>npx serve .</code> then open
          <code>localhost:3000/copy-editor/</code></small>
        </div>`;
    }
  });

  document.getElementById('entrySelect').addEventListener('change', e => {
    selectEntry(parseInt(e.target.value, 10));
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    if (state.idx > 0) selectEntry(state.idx - 1);
  });

  document.getElementById('nextBtn').addEventListener('click', () => {
    if (state.idx < state.entries.length - 1) selectEntry(state.idx + 1);
  });

  // ← → keyboard navigation (when not inside a form field)
  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (e.key === 'ArrowLeft'  && !prev.disabled) selectEntry(state.idx - 1);
    if (e.key === 'ArrowRight' && !next.disabled) selectEntry(state.idx + 1);
  });

  document.getElementById('saveLocalBtn').addEventListener('click', saveLocally);
  document.getElementById('resetBtn').addEventListener('click', undoEntry);
  document.getElementById('clearSavesBtn').addEventListener('click', clearLocalSaves);
  document.getElementById('downloadBtn').addEventListener('click', downloadJSON);
  document.getElementById('getSuggestionsBtn').addEventListener('click', getClaudeSuggestions);

  // Auto-grow all textareas inside the field container
  document.getElementById('fieldContainer').addEventListener('input', e => {
    if (e.target.tagName === 'TEXTAREA') {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    }
  });
}

init().catch(err => console.error('copy-editor init failed:', err));
