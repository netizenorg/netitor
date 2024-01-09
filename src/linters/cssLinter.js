/*
  NOTE:
  though i had used CSSLint (https://www.npmjs.com/package/csslint)
  in the old editor for wwweb-snorkeler, it now feels a bit old/out-dated
  (doesn't recognize CSS3 stuff for example). while doing research i
  came across stylelint (https://stylelint.io/) which seems way better
  (more modern + significantly more rules + control/extensability).
  ...unfortunately, (like so many other linters i've looked at) it's
  really only desgined to be used as dev-tool, as a result it can't be
  bundled for client-side use (which we need in our case).
  ...fortunately, they've been discussing the possability for a bit:
  ref: https://github.com/stylelint/stylelint/issues/3935
  doesn't seem like those efforts have been merged to master yet though,
  ref: https://github.com/stylelint/stylelint/compare/browser-bundle
  but i was able to get this fork working:
  https://github.com/m-allanson/stylelint-browser-bundle
  that fork however constantly logs garbage, so i rmv'd logs in my own fork:
  https://github.com/nbriz/stylelint-browser-bundle
  so that's what's currently in our package.json
  ...that said, we prolly want to check in on this development,
  b/c in the long term it be a bit more stable to rely on the
  core lib rather than my fork of a fork (also, worth noting that not
  all the stylelint rules are available in this fork, to see which were
  i had to checkout the bundled.js's source code)
*/

const CSSTranslateError = require('./css-friendly-translator.js')
const cssProps = require('../edu-data/css-properties.json')
const htmlEles = require('../edu-data/html-elements.json')
const stylelint = require('stylelint-browser-bundle').default

const CssSelectorParser = require('css-selector-parser').CssSelectorParser
const cssSelector = new CssSelectorParser()
cssSelector.registerNestingOperators('>', '+', '~')
cssSelector.registerAttrEqualityMods('^', '$', '*', '~')
cssSelector.enableSubstitutes()

function parseTypeSelectors (rule, frags) {
  frags = frags || []
  if (rule.tagName) frags.push(rule.tagName)
  if (rule.rule) return parseTypeSelectors(rule.rule, frags)
  else return frags
}

function findIndexOfMatch (str, lines) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(str)) return i
  }
  return -1
}

function catchTypeSelectorErrz (code) {
  const errz = []
  const lines = code.split('\n')
  let strs = code.match(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g)
  if (!strs) return errz // probably there's another err taking precedence
  else strs = strs.filter(s => !s.includes('@')).filter(s => !s.includes('%'))
  // remove comments that get misclassified as selectors
  // this causes bugs otherwise when left in the array
  strs = strs.filter(s => s.trim().indexOf('/*') !== 0)
  for (let i = 0; i < strs.length; i++) {
    const s = strs[i].substr(0, strs[i].length - 1).trim()
    if (s === '') {
      errz.push({
        column: 0,
        language: 'css',
        line: lines.map(l => l.trim()).indexOf(strs[i].trim()) + 1,
        type: 'error',
        rule: 'selector-type-blank', // custom rule
        text: 'CSS blocks must begin with a selector'
      })
    } else {
      const o = cssSelector.parse(s)
      const types = parseTypeSelectors(o)
      types.forEach(t => {
        if (!Object.keys(htmlEles).includes(t) && t !== '*') {
          errz.push({
            column: 0,
            language: 'css',
            // line: lines.indexOf(strs[i]) + 1,
            line: findIndexOfMatch(strs[i], lines) + 1,
            type: 'error',
            rule: 'selector-type-whitelist', // custom rule
            text: `"${t}" is not a valid type selector`
          })
        }
      })
    }
  }
  return errz
}

const stylelintRules = {
  'color-no-invalid-hex': true,
  'block-no-empty': [true, { ignore: ['comments'] }],
  'declaration-bang-space-after': 'never',
  'declaration-bang-space-before': 'always',
  'declaration-block-no-duplicate-properties': true,
  'declaration-block-no-shorthand-property-overrides': true,
  'declaration-colon-space-after': 'always',
  'declaration-colon-space-before': 'never',
  'function-name-case': 'lower',
  'function-linear-gradient-no-nonstandard-direction': true,
  'no-descending-specificity': [true, { ignore: ['selectors-within-list'] }],
  'no-duplicate-selectors': true,
  'no-invalid-double-slash-comments': true,
  'no-unknown-animations': false, /* b/c it errors w/multiple animation names separated by commas */
  'property-case': 'lower',
  'property-whitelist': Object.keys(cssProps),
  'selector-type-case': 'lower'
  // 'string-quotes': 'double'
}

async function linter (code) {
  if (!code) return []

  const lint = await stylelint({
    code: code,
    config: { rules: stylelintRules }
  })

  let err = lint.results[0].warnings
  err = err.concat(catchTypeSelectorErrz(code))

  for (let i = 0; i < err.length; i++) {
    err[i] = CSSTranslateError(err[i])
    err[i].language = 'css'
  }

  return err
}

module.exports = linter
