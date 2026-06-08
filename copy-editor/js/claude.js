// Claude API integration — fetches 3 beginner-friendly description rewrites
// and renders them as clickable suggestion cards.

import { state } from './state.js';
import { SYSTEM_PROMPT } from './constants.js';
import { escHtml } from './utils.js';
import { setFieldValue, syncFormToData } from './renderer.js';

let _onChange = null;

export function init ({ onChange }) {
  _onChange = onChange;
}

// ── Main suggestion fetch ───────────────────────────────────────────────────

export async function getClaudeSuggestions () {
  const apiKey = localStorage.getItem('netitor_api_key');
  if (!apiKey) {
    alert('please enter and save your anthropic api key first.');
    return;
  }
  if (state.idx < 0 || !state.editData) return;

  // Flush any pending textarea state before reading
  syncFormToData();

  const entry    = state.entries[state.idx];
  const desc     = state.editData.description;
  const elements = state.editData.elements;
  const keyword  = state.editData.keyword;
  const type     = state.editData.type; // events.json variant

  const userMessage = [
    `Entry name: "${entry.label}"`,
    keyword?.text  ? `Keyword: ${keyword.text}`           : null,
    type           ? `Event type: ${type}`                 : null,
    elements?.text ? `Applies to: ${elements.text}`        : null,
    `Current description (plain text): ${desc?.text || '(empty)'}`,
    desc?.html     ? `Current description (HTML): ${desc.html}` : null,
  ].filter(Boolean).join('\n');

  const btn       = document.getElementById('getSuggestionsBtn');
  const container = document.getElementById('suggestionsContainer');

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span>thinking…';
  container.innerHTML = '';

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':                                 apiKey,
        'anthropic-version':                         '2023-06-01',
        'content-type':                              'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 1500,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const result  = await res.json();
    let   rawText = result.content[0].text.trim();
    // Strip any accidental markdown fences Claude might add
    rawText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

    const suggestions = JSON.parse(rawText);
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('unexpected response format from Claude.');
    }

    // Claude sometimes over-escapes HTML attribute quotes, writing \" inside
    // the JSON string instead of just ". After JSON.parse that leaves literal
    // backslash-quote pairs in the value, which re-encode as \\\" on download.
    // Strip any remaining backslash-before-quote sequences here.
    suggestions.forEach(s => {
      if (typeof s.html === 'string') s.html = s.html.replace(/\\"/g, '"');
      if (typeof s.text === 'string') s.text = s.text.replace(/\\"/g, '"');
    });

    renderSuggestions(suggestions);

  } catch (err) {
    container.innerHTML = `<div class="error-msg">⚠ ${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled    = false;
    btn.textContent = 'get 3 suggestions';
  }
}

// ── Suggestion card rendering ───────────────────────────────────────────────

function renderSuggestions (suggestions) {
  const container = document.getElementById('suggestionsContainer');
  container.innerHTML = '';

  suggestions.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    card.innerHTML = `
      <div class="suggestion-num">option ${i + 1}</div>
      <div class="suggestion-text">${escHtml(s.text)}</div>
      <div class="suggestion-html">${escHtml(s.html)}</div>
      <button class="use-btn btn-sm" data-i="${i}">↑ use this</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.use-btn').forEach(btn => {
    btn.addEventListener('click', () => applySuggestion(suggestions[+btn.dataset.i]));
  });
}

// ── Apply suggestion to live form ──────────────────────────────────────────

function applySuggestion (s) {
  if (!state.editData.description) state.editData.description = {};
  state.editData.description.text = s.text;
  state.editData.description.html = s.html;

  // Update the live form fields
  setFieldValue('description.text', s.text);
  setFieldValue('description.html', s.html);

  if (_onChange) _onChange();

  // Scroll back to the description fields
  const anchor = document.getElementById('f-description-text') ||
                 document.getElementById('f-description-html');
  anchor?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
