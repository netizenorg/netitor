module.exports = `
/* BASICS */

.CodeMirror {
  /* Set height, width, borders, and global font properties here */
  font-family: monospace;
  height: 300px;
  color: black;
  direction: ltr;
}

/* PADDING */

.CodeMirror-lines {
  padding: 4px 0; /* Vertical padding around content */
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  padding: 0 4px; /* Horizontal padding of content */
}

.CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  background-color: white; /* The little square between H and V scrollbars */
}

/* GUTTER */

.CodeMirror-gutters {
  border-right: 1px solid #ddd;
  background-color: #f7f7f7;
  white-space: nowrap;
}
.CodeMirror-linenumbers {}
.CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  white-space: nowrap;
}

.CodeMirror-guttermarker { color: black; }
.CodeMirror-guttermarker-subtle { color: #999; }

/* CURSOR */

.CodeMirror-cursor {
  border-left: 1px solid black;
  border-right: none;
  width: 0;
}
/* Shown when moving in bi-directional text */
.CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver;
}
.cm-fat-cursor .CodeMirror-cursor {
  width: auto;
  border: 0 !important;
  background: #7e7;
}
.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1;
}
.cm-fat-cursor-mark {
  background-color: rgba(20, 255, 20, 0.5);
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
}
.cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
  background-color: #7e7;
}
@-moz-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@-webkit-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}

/* Can style cursor different in overwrite (non-insert) mode */
.CodeMirror-overwrite .CodeMirror-cursor {}

.cm-tab { display: inline-block; text-decoration: inherit; }

.CodeMirror-rulers {
  position: absolute;
  left: 0; right: 0; top: -50px; bottom: 0;
  overflow: hidden;
}
.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0; bottom: 0;
  position: absolute;
}

/* DEFAULT THEME */

.cm-s-default .cm-header {color: blue;}
.cm-s-default .cm-quote {color: #090;}
.cm-negative {color: #d44;}
.cm-positive {color: #292;}
.cm-header, .cm-strong {font-weight: bold;}
.cm-em {font-style: italic;}
.cm-link {text-decoration: underline;}
.cm-strikethrough {text-decoration: line-through;}

.cm-s-default .cm-keyword {color: #708;}
.cm-s-default .cm-atom {color: #219;}
.cm-s-default .cm-number {color: #164;}
.cm-s-default .cm-def {color: #00f;}
.cm-s-default .cm-variable,
.cm-s-default .cm-punctuation,
.cm-s-default .cm-property,
.cm-s-default .cm-operator {}
.cm-s-default .cm-variable-2 {color: #05a;}
.cm-s-default .cm-variable-3, .cm-s-default .cm-type {color: #085;}
.cm-s-default .cm-comment {color: #a50;}
.cm-s-default .cm-string {color: #a11;}
.cm-s-default .cm-string-2 {color: #f50;}
.cm-s-default .cm-meta {color: #555;}
.cm-s-default .cm-qualifier {color: #555;}
.cm-s-default .cm-builtin {color: #30a;}
.cm-s-default .cm-bracket {color: #997;}
.cm-s-default .cm-tag {color: #170;}
.cm-s-default .cm-attribute {color: #00c;}
.cm-s-default .cm-hr {color: #999;}
.cm-s-default .cm-link {color: #00c;}

.cm-s-default .cm-error {color: #f00;}
.cm-invalidchar {color: #f00;}

.CodeMirror-composing { border-bottom: 2px solid; }

/* Default styles for common addons */

div.CodeMirror span.CodeMirror-matchingbracket {color: #0b0;}
div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #a22;}
.CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.CodeMirror-activeline-background {background: #e8f2ff;}

/* STOP */

/* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white;
}

.CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 50px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -50px; margin-right: -50px;
  padding-bottom: 50px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
}
.CodeMirror-sizer {
  position: relative;
  border-right: 50px solid transparent;
}

/* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
.CodeMirror-vscrollbar, .CodeMirror-hscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
}
.CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}
.CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}
.CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}
.CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}

.CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  min-height: 100%;
  z-index: 3;
}
.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -50px;
}
.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important;
}
.CodeMirror-gutter-background {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
}
.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}
.CodeMirror-gutter-wrapper ::selection { background-color: transparent }
.CodeMirror-gutter-wrapper ::-moz-selection { background-color: transparent }

.CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-variant-ligatures: contextual;
  font-variant-ligatures: contextual;
}
.CodeMirror-wrap pre.CodeMirror-line,
.CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}

.CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}

.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: 0.1px; /* Force widget margins to stay inside of the container */
}

.CodeMirror-widget {}

.CodeMirror-rtl pre { direction: rtl; }

.CodeMirror-code {
  outline: none;
}

/* Force content-box sizing for the elements where we expect it */
.CodeMirror-scroll,
.CodeMirror-sizer,
.CodeMirror-gutter,
.CodeMirror-gutters,
.CodeMirror-linenumber {
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}

.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}

.CodeMirror-cursor {
  position: absolute;
  pointer-events: none;
}
.CodeMirror-measure pre { position: static; }

div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}
div.CodeMirror-dragcursors {
  visibility: visible;
}

.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}

.CodeMirror-selected { background: #d9d9d9; }
.CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.CodeMirror-crosshair { cursor: crosshair; }
.CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: #d7d4f0; }
.CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: #d7d4f0; }

.cm-searching {
  background-color: #ffa;
  background-color: rgba(255, 255, 0, .4);
}

/* Used to force a border model for a node */
.cm-force-border { padding-right: .1px; }

@media print {
  /* Hide the cursor when printing */
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}

/* See issue #2901 */
.cm-tab-wrap-hack:after { content: ''; }

/* Help users use markselection to safely style text background */
span.CodeMirror-selectedtext { background: none; }
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;

  margin: 0;
  padding: 2px;

  -webkit-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  -moz-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  border-radius: 3px;
  border: 1px solid silver;

  background: white;
  font-size: 90%;
  font-family: monospace;

  max-height: 20em;
  overflow-y: auto;
}

.CodeMirror-hint {
  margin: 0;
  padding: 0 4px;
  border-radius: 2px;
  white-space: pre;
  color: black;
  cursor: pointer;
}

li.CodeMirror-hint-active {
  background: #08f;
  color: white;
}
:root {
  --netizen-text: #e7e5c9;
  --netizen-background: #1c1c36;
    /* CODE SYNTAX COLORS */
  --netizen-comment: #515199;
  --netizen-tag-bracket: #c3c3db;
  --netizen-property: #c3c3db;
  --netizen-atom: #c3c3db;
  --netizen-def: #c3c3db;
  --netizen-variable-3: #c3c3db;
  --netizen-meta: #c3c3db;
  --netizen-variable: #d5805e;
  --netizen-variable-callee: #82ccd7;
  --netizen-variable-2: #82ccd7;
  --netizen-string: #82ccd7;
  --netizen-string-2: #82ccd7;
  --netizen-number: #E6DB6F;
  --netizen-operator: #c76ebc;
  --netizen-tag: #c76ebc;
  --netizen-attribute: #81c994;
  --netizen-qualifier: #81c994;
  --netizen-builtin: #81c994;
  --netizen-keyword: #81c994;
    /* MISC EDITOR COLORS */
  --netizen-line-numbers: #9885a6;
  --netizen-active-line-bg: #c3c3db;
  --netizen-selected: #c8c8fa19;
    /* MATCHING TAG/BRACKET INDICATORS */
  --netizen-match-color: #e7e5c9;
  --netizen-match-border: #515199;
    /* AUTOCOMPLETE/HINT MENU SELECTED ITEM */
  --netizen-hint-color: #1c1c36;
  --netizen-hint-bg: #dacb8e;
  --netizen-hint-shadow: #515199BF;
}

.cm-s-netizen {
  font-size: 1em;
  line-height: 1.5em;
  font-family: inconsolata, monospace;
  letter-spacing: 0.3px;
  word-spacing: 1px;
  background: var(--netizen-background);
  color: var(--netizen-text);
  height: 100%;
}

.cm-s-netizen .CodeMirror-lines { padding: 8px 0; }

.cm-s-netizen .CodeMirror-gutters {
  background-color: var(--netizen-background);
  color: var(--netizen-text);
  padding-right: 10px;
  z-index: 3;
  border: none;
  margin-right:5px;
}

.cm-s-netizen .CodeMirror-linenumber { color: var(--netizen-line-numbers); }

.cm-s-netizen div.CodeMirror-cursor {
  width: 1px;
  border-left: 2px solid var(--netizen-text);
}

.cm-s-netizen .CodeMirror-activeline-background { background: var(--netizen-active-line-bg); }
.cm-s-netizen .CodeMirror-selected { background: var(--netizen-selected); }
.cm-s-netizen .cm-comment { color: var(--netizen-comment); }
.cm-s-netizen .cm-tag.cm-bracket { color: var(--netizen-tag-bracket); }
.cm-s-netizen .cm-property { color: var(--netizen-property); }
.cm-s-netizen .cm-atom { color: var(--netizen-atom); }
.cm-s-netizen .cm-def { font-style: normal; color: var(--netizen-def); }
.cm-s-netizen .cm-variable-3 { color: var(--netizen-variable-3); }
.cm-s-netizen .cm-meta { color: var(--netizen-meta); }
.cm-s-netizen .cm-variable { color: var(--netizen-variable); }
.cm-s-netizen .cm-variable.cm-callee { color: var(--netizen-variable-callee); }
.cm-s-netizen .cm-variable-2 { color: var(--netizen-variable-2); }
.cm-s-netizen .cm-string { color: var(--netizen-string); }
.cm-s-netizen .cm-string-2 { color: var(--netizen-string-2); }
.cm-s-netizen .cm-number { color: var(--netizen-number); }
.cm-s-netizen .cm-operator { color: var(--netizen-operator); }
.cm-s-netizen .cm-tag { color: var(--netizen-tag); }
.cm-s-netizen .cm-attribute { color: var(--netizen-attribute); }
.cm-s-netizen .cm-qualifier { color: var(--netizen-qualifier); }
.cm-s-netizen .cm-builtin { color: var(--netizen-builtin); }
.cm-s-netizen .cm-keyword { color: var(--netizen-keyword); }

/* THE LITTLE UNDERLINE THAT APPEARS WHEN A TAG OR BRACKET IS SELECTED */
.cm-s-netizen .CodeMirror-matchingbracket {
  /* color: var(--netizen-match-color) !important; */
}
.cm-s-netizen .CodeMirror-matchingbracket, .CodeMirror-matchingtag {
  padding-bottom: 3px;
  /* color: var(--netizen-match-color) !important; */
  border-bottom: 2px solid var(--netizen-match-border);
  background: none;
}

/* HINTING STYLES: AUTO-COMPLETE DROPDOWN LIST */
.CodeMirror-hints.netizen {
  color: var(--netizen-text);
  background: var(--netizen-hint-color);
  padding: 8px 11px;
  font-size: 14px;
  border-radius: 8px;
  border: 3px solid var(--netizen-text);
  box-shadow: -9px 10px 25px -17px var(--netizen-hint-shadow);
}

.CodeMirror-hints.netizen > .CodeMirror-hint {
  /* individual items */
  color: var(--netizen-text);
  margin: 2px 0;
  padding: 3px 4px 4px;
}

.CodeMirror-hints.netizen > .CodeMirror-hint.CodeMirror-hint-active {
  /* selected item */
  color: var(--netizen-hint-color);
  background: var(--netizen-hint-bg);
}
`
