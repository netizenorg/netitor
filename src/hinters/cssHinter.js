const CodeMirror = require('codemirror')
const cssProps = require('../edu-data/css/properties.json')
const pseudoEles = require('../edu-data/css/pseudo-elements.json')
const pseudoClasses = require('../edu-data/css/pseudo-classes.json')
const atRules = require('../edu-data/css/at-rules.json')
const cssColors = require('../edu-data/css/colors.json')
const htmlEles = require('../edu-data/html/elements.json')
const snippets = require('./customSnippets.js')

const spec = CodeMirror.resolveMode('text/css')
const keywords = Object.keys(spec.valueKeywords)
  .map(key => { return { text: key + ';', displayText: key } })
const colors = Object.keys(cssColors)
  .map(key => { return { text: key + ';', displayText: key } })
const medias = Object.keys(spec.mediaFeatures)
  .map(key => { return { text: key + ': ', displayText: key } })

function getDefinedCssVariables (cm, opts = {}) {
  const { includeInlineStyles = false } = opts
  const mode = String(cm.getOption('mode') || '').toLowerCase()
  const docText = cm.getValue()
  const cssBlocks = []

  if (mode.includes('css') && !mode.includes('html')) {
    cssBlocks.push(docText)
  } else if (mode.includes('html')) {
    // <style> ... </style>
    const styleTagRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
    let m
    while ((m = styleTagRe.exec(docText))) {
      // If a type attribute exists and it's clearly not CSS, skip it
      const tagOpen = docText.slice(m.index, m.index + docText.slice(m.index).indexOf('>') + 1)
      const typeAttr = /type\s*=\s*(['"])([^'"]+)\1/i.exec(tagOpen)
      const type = typeAttr ? typeAttr[2].toLowerCase() : 'text/css'
      if (!typeAttr || /css|postcss/.test(type)) cssBlocks.push(m[1])
    }

    if (includeInlineStyles) {
      // style="--x: 1rem; color: red"
      const styleAttrRe = /style\s*=\s*(['"])([\s\S]*?)\1/gi
      let a
      while ((a = styleAttrRe.exec(docText))) cssBlocks.push(a[2])
    }
  } else {
    // Fallback: treat whole doc as CSS
    cssBlocks.push(docText)
  }

  const strip = str => {
    // remove /* comments */ then neutralize quoted strings
    let s = str.replace(/\/\*[\s\S]*?\*\//g, '')
    s = s.replace(/'(?:\\.|[^'\\])*'/g, "''")
    s = s.replace(/"(?:\\.|[^"\\])*"/g, '""')
    return s
  }

  const names = new Set()
  const declRe = /(^|[^\w-])(--[A-Za-z_][\w-]*)\s*:/g // --name:
  const atPropRe = /@property\s+(--[A-Za-z_][\w-]*)\b/g // @property --name

  for (const block of cssBlocks) {
    const src = strip(block)

    let m1
    while ((m1 = atPropRe.exec(src))) names.add(m1[1])

    let m2
    while ((m2 = declRe.exec(src))) names.add(m2[2])
  }

  return Array.from(names).sort()
}

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
  } else if (state.includes('atBlock_parens')) {
    return medias
  } else if (state.includes('parens')) {
    if (token.string.indexOf('-') === 0) {
      return getDefinedCssVariables(cm)
    } else return null
  } else {
    return mediaTypes(token.string, cm)
  }
}

module.exports = cssHinter
