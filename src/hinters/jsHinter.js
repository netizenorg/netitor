const jsRefs = require('../edu-data/js-refs.json')
const jsEvents = require('../edu-data/js-events.json')
// TODO: figure out a way to keep track if vars ar instances of the blow,
// so that we can add props/methods from json files below to autocompete
// const jsNums = require('../edu-data/js-number.json')
// const jsStrs = require('../edu-data/js-string.json')
// const jsDate = require('../edu-data/js-date.json')
// const jsCanv = require('../edu-data/js-canvas.json')
// const jsDOM = require('../edu-data/js-dom-node.json')
// const jsArr = require('../edu-data/js-arrays.json')
const roots = {
  document: require('../edu-data/js-document.json'),
  Math: require('../edu-data/js-math.json'),
  history: require('../edu-data/js-history.json'),
  location: require('../edu-data/js-location.json'),
  window: require('../edu-data/js-window.json'),
  navigator: require('../edu-data/js-navigator.json')
}

const snippets = {
  for: 'for (let i = 0; i < 100; i++) {\n<S><I><C>\n<S>}\n',
  function: 'function nameMe<C> () {\n<S><I>\n<S>}\n'
}

function cntSps (str) {
  let c = ''
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ' ') c += ' '
    else break
  }
  return c
}

function propHintList (str, cm) {
  const list = []
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const s = cntSps(line)

  for (const prop in snippets) {
    if (prop.includes(str)) {
      let v = snippets[prop]
      v = v.replace(/<S>/g, s)
      v = v.replace(/<I>/g, '  ')
      v = v.replace(/<C>/g, '<CURSOR_GOES_HERE>')
      list.push({ text: v, displayText: prop })
    }
  }
  for (const prop in jsRefs) {
    if (prop.includes(str) && !snippets[prop] && str !== prop) {
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

function getPropList (str, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const array = line.split(' ')
  const arr = array.find(s => s.includes(`.${str}`)).split('.')
  let rootIdx
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes(str)) { rootIdx = i - 1; break }
  }
  const list = []
  const root = arr[rootIdx]
  if (roots[root]) {
    for (const prop in roots[root]) {
      if (prop.includes(str) && str !== prop) {
        list.push({ text: roots[root][prop].keyword.text, displayText: prop })
      }
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

function jsHinter (token, cm) {
  let list = []
  if (token.type === 'property') {
    list = getPropList(token.string, cm)
  } else if (token.type === 'def') {
    // NOTE: no autocomplete when defining variables
  } else if (token.type === 'string') {
    list = checkForEvents(token.string, cm)
  } else {
    list = propHintList(token.string, cm)
  }
  return list
}

module.exports = jsHinter
