const CodeMirror = require('codemirror')
const cssProps = require('../edu-data/css-properties.json')
const pseudoEles = require('../edu-data/css-pseudo-elements.json')
const pseudoClasses = require('../edu-data/css-pseudo-classes.json')
const atRules = require('../edu-data/css-at-rules.json')
const cssColors = require('../edu-data/css-colors.json')
const htmlEles = require('../edu-data/html-elements.json')
const snippets = require('./customSnippets.js')

const spec = CodeMirror.resolveMode('text/css')
const keywords = Object.keys(spec.valueKeywords)
  .map(key => { return { text: key + ';', displayText: key } })
const colors = Object.keys(cssColors)
  .map(key => { return { text: key + ';', displayText: key } })
const medias = Object.keys(spec.mediaFeatures)
  .map(key => { return { text: key + ': ', displayText: key } })

function propHintList (str) {
  const list = []
  for (const prop in cssProps) {
    if (prop.includes(str)) {
      list.push({ text: prop + ': ', displayText: prop })
    }
  }
  return list
}

function pseudoHintList (str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const list = []
  if (line.includes('::')) {
    for (const pe in pseudoEles) {
      if (pe.includes(str)) list.push({ text: pe.substr(1), displayText: pe })
    }
  } else {
    for (const pc in pseudoClasses) if (pc.includes(str)) list.push(pc)
  }
  return list
}

function atRulesHintList (str, cm) {
  const list = []
  for (const ar in atRules) if (ar.includes(str)) list.push(ar)
  return [...list, ...snippets.list('css.atRules', str)]
}

function valHintList (str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  if (line.includes('color')) return colors
  else return keywords
}

function mediaTypes (str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  if (line.includes('@media')) return Object.keys(spec.mediaTypes)
  else return []
}

function cssHinter (token, cm) {
  const inner = CodeMirror.innerMode(cm.getMode(), token.state)
  const state = inner.state.state

  if (token.type === 'tag') {
    return Object.keys(htmlEles)
  } else if (state === 'block' || state === 'maybeprop') {
    return propHintList(token.string)
  } else if (state === 'pseudo' || token.type === 'variable-3') {
    return pseudoHintList(token.string, cm)
  } else if (state === 'at') {
    return atRulesHintList(token.string, cm)
  } else if (state === 'prop' && token.type === 'variable') {
    return valHintList(token.string, cm)
  } else if (state.includes('parens')) {
    return medias
  } else {
    return mediaTypes(token.string, cm)
  }
}

module.exports = cssHinter
