const HTMLTranslateError = require('./html-friendly-translator.js')
const HTMLFriendlyLinter = require('./html-friendly-linter.js')
const HTMLHint = require('htmlhint').HTMLHint

const HTMLFriendlyLinterRules = {
  'standard-elements': true
}

// reles: https://github.com/htmlhint/HTMLHint/tree/master/src/core/rules
const HTMLHintRules = {
  // head
  'doctype-first': true,
  'doctype-html5': true,
  'head-script-disabled': true,
  'style-disabled': false, // nope
  'title-require': true,
  // attributes
  'attr-lowercase': true,
  'attr-no-duplication': true,
  'attr-no-unnecessary-whitespace': true,
  'attr-sorted': false,
  'attr-unsafe-chars': true,
  'attr-value-double-quotes': true,
  'attr-value-not-empty': true,
  'attr-whitespace': true,
  'alt-require': true,
  // tags
  'tags-check': false, // AGGRESIVE!!!
  'tag-pair': true,
  'tag-self-close': false, // nope
  'tagname-lowercase': true,
  'empty-tag-not-self-closed': false, // nope
  'src-not-empty': true,
  'href-abs-or-rel': true,
  'input-requires-label': false, // nope
  'script-disabled': false, // nope
  // id
  'id-class-ad-disabled': true,
  'id-class-value': true,
  'id-unique': true,
  // inline
  'inline-script-disabled': true,
  'inline-style-disabled': true,
  // formatting
  'space-tab-mixed-disabled': true,
  'spec-char-escape': true
}

function linter (code) {
  const err = HTMLHint.verify(code, HTMLHintRules)
  const friendlyErr = HTMLFriendlyLinter.verify(code, HTMLFriendlyLinterRules)

  for (let i = 0; i < err.length; i++) {
    const rule = err[i].rule.id
    const message = err[i].message
    err[i].friendly = HTMLTranslateError[rule](message)
  }

  return err.concat(friendlyErr)
}

module.exports = linter
