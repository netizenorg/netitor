/* eslint-disable no-new-func */
const jsRefs = require('../edu-data/js-refs.json')
const jsEvents = require('../edu-data/js-events.json')
const nnProps = require('../edu-data/custom/custom-nn.min.js')
const snippets = require('./customSnippets.js')

const roots = {
  document: require('../edu-data/js-document.json'),
  Math: require('../edu-data/js-math.json'),
  history: require('../edu-data/js-history.json'),
  location: require('../edu-data/js-location.json'),
  window: require('../edu-data/js-window.json'),
  navigator: require('../edu-data/js-navigator.json')
}

const instances = {
  jsNums: require('../edu-data/js-number.json'),
  jsStrs: require('../edu-data/js-string.json'),
  jsDate: require('../edu-data/js-date.json'),
  jsArr: require('../edu-data/js-arrays.json'),
  jsDOM: require('../edu-data/js-dom-node.json'),
  jsEle: require('../edu-data/js-dom-element.json'),
  jsHTML: require('../edu-data/js-html-element.json'),
  jsTarg: require('../edu-data/js-dom-event-target.json'),
  jsMedia: require('../edu-data/js-dom-media.json'),
  jsCanv: require('../edu-data/js-dom-canvas.json'),
  jsCtx: require('../edu-data/js-canvas2d.json')
}

// CSS properties for HTMLElement.style object
const CSS = require('../edu-data/css-properties.json')
const cssPropsList = []
const camelCase = (input) => {
  return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase()
  })
}
for (const prop in CSS) {
  const p = camelCase(prop)
  if (p.indexOf('Moz') !== 0 && p.indexOf('Ms') !== 0 && p.indexOf('Webkit') !== 0) {
    cssPropsList.push({ text: p, displayText: p })
  }
}

const jsSnips = Object.keys(snippets.snippets.js)

function evaluate (lines, root) {
  const l = lines[lines.length - 1]
  if (!l) return
  if (l.includes('document.querySelector') ||
    l.includes('document.getElement') ||
    l.includes('document.createElement')) {
    return 'jsDOM'
  } else if (l.includes('.getContext(')) {
    return 'jsCtx'
  }

  try {
    if (new Function(`${l}\n return typeof ${root} === 'string'`)()) {
      return 'jsStrs'
    } else if (new Function(`${l}\n return typeof ${root} === 'number'`)()) {
      return 'jsNums'
    } else if (new Function(`${l}\n return ${root} instanceof Array`)()) {
      return 'jsArr'
    } else if (new Function(`${l}\n return ${root} instanceof Date`)()) {
      return 'jsDate'
    }
  } catch (err) {
    return null
  }
}

function genList (str, obj, key) {
  const list = []
  let o
  if (key === 'jsDOM') {
    o = { ...obj.jsDOM, ...obj.jsEle, ...obj.jsHTML, ...obj.jsTarg, ...obj.jsMedia, ...obj.jsCanv }
  } else {
    o = obj[key]
  }
  // ...
  for (const prop in o) {
    if (prop.includes(str)) {
      list.push({ text: o[prop].keyword.text, displayText: prop })
    }
  }
  return list
}

function getPropList (str, cm) {
  let list = []
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const array = line.split(' ')
  const arr = array.find(s => s.includes(`.${str}`)).split('.')

  let rootIdx
  if (str === '') {
    rootIdx = arr.indexOf('') - 1
  } else {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].includes(str)) { rootIdx = i - 1; break }
    }
  }
  const root = arr[rootIdx]

  if (roots[root]) { // is global JS object
    list = genList(str, roots, root)
  } else if (root) { // user created variable
    const lines = cm.getDoc().children[0].lines
      .filter((o, i) => cm.getModeAt({ line: i }).helperType === 'javascript')
      .map(o => o.text)
      .filter(txt => txt.includes(`${root}=`) || txt.includes(`${root} =`))

    const type = evaluate(lines, root)
    if (type) {
      list = genList(str, instances, type)
    }
  }
  return list
}

function propHintList (str, cm) {
  const list = snippets.list('js', str)

  for (const prop in jsRefs) {
    if (prop.includes(str) && !jsSnips.includes(prop) && str !== prop) {
      list.push({ text: jsRefs[prop].keyword.text, displayText: prop })
    }
  }
  for (const prop in roots.window) {
    if (prop.includes(str) && str !== prop) {
      list.push({ text: roots.window[prop].keyword.text, displayText: prop })
    }
  }
  return list
}

function checkForEvents (str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const list = []
  str = str.replace(/'/g, '').replace(/"/g, '')
  if (line.includes('addEventListener')) {
    for (const eve in jsEvents) {
      if (eve.includes(str)) {
        list.push({ text: `'${eve}'`, displayText: eve })
      }
    }
  }
  return list
}

function checkForObj (o, str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const s = line.substr(line.length - o.length - str.length, o.length)
  if (s === o) return true
  else return false
}

function genStyleList (str) {
  return cssPropsList.filter(o => o.text.includes(str))
}

function genNNList (str) {
  const list = []
  for (const p in nnProps) {
    if (p.includes(str)) list.push({ text: p, displayText: p })
  }
  return list
}

function jsHinter (token, cm, pos) {
  let list = []
  if (token.type === 'property' || token.string === '.') {
    const s = token.string === '.' ? '' : token.string
    list = checkForObj('.style.', s, cm)
      ? genStyleList(s) : checkForObj('nn.', s, cm)
        ? genNNList(s) : getPropList(s, cm)
  } else if (token.type === 'def') {
    // NOTE: no autocomplete when defining variables
  } else if (token.type === 'string') {
    list = checkForEvents(token.string, cm)
  } else if (token.type !== 'number' && token.string !== '(' && token.string !== ')') {
    list = propHintList(token.string, cm)
  }
  return list
}

module.exports = jsHinter
