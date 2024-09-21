const HTMLTranslateError = require('./html-friendly-translator.js')
const HTMLStandards = require('./html-standards-validator.js')
const HTMLHint = require('htmlhint').HTMLHint
const svgEles = require('../edu-data/html/svg-elements.json')
const svgAttr = require('../edu-data/html/svg-attributes.json')

const HTMLStandardsRules = {
  'standard-elements': true,
  'standard-attributes': true,
  'avoid-trailing-slashes': true,
  'declare-document-language': true,
  'declare-document-charset': false, // not necesssary these days
  'declare-document-doctype': true
}

// reles: https://github.com/htmlhint/HTMLHint/tree/master/src/core/rules
const HTMLHintRules = {
  // head
  'doctype-first': false,
  'doctype-html5': true,
  'head-script-disabled': true,
  'style-disabled': false, // nope
  'title-require': true,
  // attributes
  'attr-lowercase': true,
  'attr-no-duplication': true,
  'attr-no-unnecessary-whitespace': true,
  'attr-sorted': false, // nope
  'attr-unsafe-chars': true,
  'attr-value-double-quotes': true,
  'attr-value-not-empty': true,
  'attr-whitespace': false, // nope
  'alt-require': true,
  // tags
  'tags-check': false, // nope
  'tag-pair': true,
  'tag-self-close': false, // nope
  'tagname-lowercase': true,
  'empty-tag-not-self-closed': false, // nope
  'src-not-empty': true,
  'href-abs-or-rel': false, // nope
  'input-requires-label': false, // nope
  'script-disabled': false, // nope
  // id
  'id-class-ad-disabled': true,
  'id-class-value': false, // nope
  'id-unique': true,
  // inline
  // 'inline-script-disabled': true,
  // 'inline-style-disabled': true, // too annoying i think
  // formatting
  'space-tab-mixed-disabled': false,
  'spec-char-escape': true
}

// exceptions to empty attribute values
const emptyAttrVals = [
  'allowfullscreen',
  'allowpaymentrequest',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'crossorigin',
  'default',
  'disabled',
  'formnovalidate',
  'hidden',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
  'truespeed '
]

function linter (code, cm) {
  const frdlyErr = HTMLStandards.verify(code, HTMLStandardsRules, cm)
  const err = HTMLHint.verify(code, HTMLHintRules)
    .filter((e) => {
      if (e.rule.id === 'tagname-lowercase') { // exception for SVG elements
        const match = e.message.match(/\[([^\]]+)\]/)
        if (!match) return true
        const ele = match[1].trim()
        if (Object.keys(svgEles).includes(ele)) return false
        else return true
      } else if (e.rule.id === 'attr-lowercase') { // exception for SVG attributes
        const attr = e.raw.trim().split('=')[0].toLowerCase()
        if (Object.keys(svgAttr).includes(attr)) return false
        else return true
      } else if (e.rule.id === 'attr-value-not-empty') { // exception for boolean attributes
        if (emptyAttrVals.includes(e.raw.trim())) return false
        else return true
      } else return true
    })

  for (let i = 0; i < err.length; i++) {
    const rule = err[i].rule.id
    err[i] = HTMLTranslateError[rule](err[i])
    err[i].language = 'html'
  }

  return frdlyErr.concat(err)
}

module.exports = linter
