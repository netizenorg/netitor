// Valid values for the "status" field across all edu-data files.
export const STATUS_OPTIONS = [
  'standard',
  'experimental',
  'nonstandard',
  'non-standard',
  'deprecated',
  'obsolete',
  'legacy',
];

// All edu-data files available for editing.
// Paths are relative to copy-editor/index.html (one level up from repo root).
// nn-netitor-docs.json is intentionally excluded — managed via netnet-standard-library.

export const FILES = [
  { label: 'CSS / at-rules',         path: '../src/edu-data/css/at-rules.json' },
  { label: 'CSS / colors',           path: '../src/edu-data/css/colors.json' },
  { label: 'CSS / data-types',       path: '../src/edu-data/css/data-types.json' },
  { label: 'CSS / functions',        path: '../src/edu-data/css/functions.json' },
  { label: 'CSS / properties',       path: '../src/edu-data/css/properties.json' },
  { label: 'CSS / pseudo-classes',   path: '../src/edu-data/css/pseudo-classes.json' },
  { label: 'CSS / pseudo-elements',  path: '../src/edu-data/css/pseudo-elements.json' },
  { label: 'CSS / units',            path: '../src/edu-data/css/units.json' },
  { label: 'HTML / attributes',      path: '../src/edu-data/html/attributes.json' },
  { label: 'HTML / elements',        path: '../src/edu-data/html/elements.json' },
  { label: 'HTML / svg-attributes',  path: '../src/edu-data/html/svg-attributes.json' },
  { label: 'HTML / svg-elements',    path: '../src/edu-data/html/svg-elements.json' },
  { label: 'JS / arrays',            path: '../src/edu-data/js/arrays.json' },
  { label: 'JS / syntax',            path: '../src/edu-data/js/syntax.json' },
  { label: 'JS / canvas2d',          path: '../src/edu-data/js/canvas2d.json' },
  { label: 'JS / date',              path: '../src/edu-data/js/date.json' },
  { label: 'JS / document',          path: '../src/edu-data/js/document.json' },
  { label: 'JS / dom-canvas',        path: '../src/edu-data/js/dom-canvas.json' },
  { label: 'JS / dom-element',       path: '../src/edu-data/js/dom-element.json' },
  { label: 'JS / dom-event-target',  path: '../src/edu-data/js/dom-event-target.json' },
  { label: 'JS / dom-media',         path: '../src/edu-data/js/dom-media.json' },
  { label: 'JS / dom-node',          path: '../src/edu-data/js/dom-node.json' },
  { label: 'JS / events',            path: '../src/edu-data/js/events.json' },
  { label: 'JS / history',           path: '../src/edu-data/js/history.json' },
  { label: 'JS / html-element',      path: '../src/edu-data/js/html-element.json' },
  { label: 'JS / location',          path: '../src/edu-data/js/location.json' },
  { label: 'JS / math',              path: '../src/edu-data/js/math.json' },
  { label: 'JS / navigator',         path: '../src/edu-data/js/navigator.json' },
  { label: 'JS / number',            path: '../src/edu-data/js/number.json' },
  { label: 'JS / refs',              path: '../src/edu-data/js/refs.json' },
  { label: 'JS / string',            path: '../src/edu-data/js/string.json' },
  { label: 'JS / window',            path: '../src/edu-data/js/window.json' },
];

export const SYSTEM_PROMPT = `You are helping improve educational documentation for Netitor, a browser-based code editor used to teach web technologies (HTML, CSS, JavaScript) to complete beginners — often students who have never written a line of code.

Your task is to rewrite description text so it is:
- Clear and beginner-friendly: avoid jargon; if a technical term is unavoidable, briefly explain it in plain English
- Concise: 1–2 short sentences maximum
- Practically helpful: say what this attribute / property / method actually does and, where natural, hint at when or why a student would use it
- Warm and encouraging, never condescending

You will receive the entry name, its current description, and any relevant context (elements it applies to, etc.).

Respond with ONLY a valid JSON array of exactly 3 objects. Each object must have:
  "text" — plain text, no HTML tags whatsoever
  "html" — same content with <code> tags around attribute names, property names, values, and element names; optionally one <a href="..." target="_blank"> link if genuinely useful; keep it simple

IMPORTANT — HTML inside the "html" field:
  Use real double-quote characters around HTML attribute values. Write href="https://..." NOT href=\"https://...\"
  Do not backslash-escape any quotes inside the "html" string. The JSON serialiser handles that automatically.

Return nothing outside the JSON array — no explanation, no markdown fences.

Example:
[
  {"text": "Sets the source URL for an image or media element.", "html": "Sets the source URL for an <code>&lt;img&gt;</code> or media element — point it at the file you want to load."},
  {"text": "...", "html": "..."},
  {"text": "...", "html": "..."}
]`;
