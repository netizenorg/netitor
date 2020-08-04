const pseudoEles = require('../css-pseudo-elements.json')
const pseudoClasses = require('../css-pseudo-classes.json')
const CssSelectorParser = require('css-selector-parser').CssSelectorParser
const cssSelector = new CssSelectorParser()
// cssSelector.registerSelectorPseudos('has')
cssSelector.registerNestingOperators('>', '+', '~')
cssSelector.registerAttrEqualityMods('^', '$', '*', '~')
cssSelector.enableSubstitutes()

const refURL = 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors'

function ntro (group) {
  if (group) return 'Commas separate multiple <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors" target="_blank">CSS selectors</a> determining how to apply the CSS rules in the code block that follows it, ' // the 1st ... the 2nd... etc
  else return 'This <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors" target="_blank">CSS selector</a> will apply the CSS rules in the code block that follows it to '
}

function ordinal (num) {
  if (num === 0) return '1st'
  else if (num === 1) return '2nd'
  else if (num === 2) return '3rd'
  else return `${num + 1}th`
}

function gatherGroup (cm, l) {
  let str = ''
  let line = cm.getLine(l).trim()
  while (line.indexOf('{') === -1) { // are we at last ", "
    str += cm.getLine(l).trim() + ' '
    l++; line = cm.getLine(l)
    if (!line) break
    else line = line.trim()
  }
  if (line.trim().length > 1) { // is there more selector left?
    str += line.substr(0, line.indexOf('{'))
  }
  return str
}

function parsePseudos (pseudos) {
  let m = '('
  for (let i = 0; i < pseudos.length; i++) {
    let link
    const key = pseudos[i].name
    if (pseudoEles['::' + key]) {
      link = pseudoEles['::' + key].keyword.html
    } else if (pseudoClasses[':' + key]) {
      link = pseudoClasses[':' + key].keyword.html
    }
    if (pseudoEles['::' + key] || pseudoClasses[':' + key]) {
      m += (i === 0) ? `if/when it is ${link}` : ` and if/when it is ${link}`
    }
  }
  if (m === '(') return ''
  else return m + ')'
}

const isVowel = s => s === 'a' || s === 'e' || s === 'i' || s === 'o' || s === 'u' || s === 'h'

function parseAttr (attr, singular) {
  const has = (singular) ? 'has' : 'have'
  let m = `which also ${has}`
  attr.forEach((a, i) => {
    m += (i > 0) ? ` and also ${has}` : ''
    m += (isVowel(a.name[0])) ? ' an' : ' a'
    m += ` <s>${a.name}<e> attribute`
    if (a.operator) {
      if (a.operator === '=') {
        m += ` with a value of <s>${a.value}<e>`
      } else if (a.operator === '~=') {
        m += ` which includes the word <s>${a.value}<e> in it's value`
      } else if (a.operator === '|=') {
        m += ` whose value is exactly <s>${a.value}<e> or starts with <s>${a.value}-<e>`
      } else if (a.operator === '^=') {
        m += ` whose value starts with <s>${a.value}<e>`
      } else if (a.operator === '$=') {
        m += ` whose value ends with with <s>${a.value}<e>`
      } else if (a.operator === '*=') {
        m += ` which contains the fragment <s>${a.value}<e> somewhere within it's value`
      }
    }
  })
  return m
}

function parseRules (rule, frags) {
  if (!rule.id && !rule.tagName && !rule.classNames) {
    if (rule.rule) return parseRules(rule.rule, frags)
    else return []
  }
  // handle basic slectors: element-type, class, id
  let m = (rule.id) ? 'the ' : 'any '
  if (rule.tagName === 'body') m = `the <s>${rule.tagName}<e> `
  else if (rule.tagName === '*') m += ''
  else if (rule.tagName) m += `<s>${rule.tagName}<e> `
  m += (rule.id || rule.tagName === 'body') ? 'tag ' : 'tags '
  if (rule.id) m += `with <s>id="${rule.id}"<e> `
  if (rule.id && rule.classNames) m += 'and also '
  else if (rule.classNames) m += 'with '
  if (rule.classNames) m += `<s>class="${rule.classNames.join(' ')}"<e> `
  // handle pseudo elements/classes
  if (rule.pseudos) m += parsePseudos(rule.pseudos)
  // handle attribute selectors
  if (rule.attrs) m += parseAttr(rule.attrs, rule.id)

  if (rule.nestingOperator === null) frags.push(' ')
  else if (rule.nestingOperator) frags.push(rule.nestingOperator)
  frags.push(m)

  if (rule.rule) return parseRules(rule.rule, frags)
  else return frags
}

function parseNestedRules (rule) {
  const ops = {
    ' ': 'which is/are a <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Descendant_combinator" target="_blank">descendant</a> of ',
    '>': 'which is/are a <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Child_combinator" target="_blank">direct child</a> of ',
    '~': 'which is/are <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/General_sibling_combinator target="_blank">any sibling</a> of ',
    '+': 'which is/are a <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Adjacent_sibling_combinator" target="_blank">sibling directly following</a> any '
  }
  const frags = parseRules(rule, []).reverse()
  let m = ''
  frags.forEach(str => { m += (ops[str]) ? ops[str] : str })
  return m
}

function checkSelector (o, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line).trim()
  const end = line[line.length - 1]
  const str = (end === ',')
    ? gatherGroup(cm, pos.line) : line.substr(0, line.indexOf('{'))
  const obj = cssSelector.parse(str)
  if (obj === null) return null

  let msg = ''
  if (obj.type === 'selectors') {
    obj.selectors.forEach((r, i) => {
      msg += (i > 0) ? '; ' : ''
      msg += `the ${ordinal(i)} selector applies to ` + parseNestedRules(r)
    })
  } else {
    msg += parseNestedRules(obj.rule)
  }

  msg = ntro(obj.type === 'selectors') + msg
  const html = msg.replace(/<s>/g, '<code>').replace(/<e>/g, '</code>')
  const text = msg.replace(/<s>/g, '[ ').replace(/<e>/g, ' ]')
    .replace(/<a.*?>/g, '').replace(/<\/a>/g, '')

  return {
    url: refURL,
    keyword: {
      html: `<a href="${refURL}" target="_blank">CSS slector</a>`,
      text: 'CSS selector'
    },
    description: { html: html, text: text }
  }
}

module.exports = checkSelector
