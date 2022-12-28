const jsRefs = require('../js-refs.json')
const jsWindow = require('../js-window.json')
const jsDoc = require('../js-document.json')
const jsMath = require('../js-math.json')
const jsHistory = require('../js-history.json')
const jsLocation = require('../js-location.json')
const jsNavigator = require('../js-navigator.json')
const jsEvents = require('../js-events.json')
const jsNums = require('../js-number.json')
const jsStrs = require('../js-string.json')
const jsDate = require('../js-date.json')
const jsCanv = require('../js-canvas.json')
const jsDOM = require('../js-dom-node.json')
const jsArr = require('../js-arrays.json')

const commentNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Comments',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Comments" target="_blank">comments</a>',
    text: 'comments'
  },
  description: {
    html: 'Comments are used to add hints, notes, suggestions, or warnings to JavaScript code. This can make it easier to read and understand. They can also be used to disable code to prevent it from being executed; this can be a valuable debugging tool',
    text: 'Comments are used to add hints, notes, suggestions, or warnings to JavaScript code. This can make it easier to read and understand. They can also be used to disable code to prevent it from being executed; this can be a valuable debugging tool'
  }
}

const arrowFunc = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions" target="_blank">Arrow function expression</a>',
    text: 'Arrow function expression'
  },
  description: {
    text: 'An arrow function expression is a syntactically compact alternative to a regular function expression, although without its own bindings to the this, arguments, super, or new.target keywords. Arrow function expressions are ill suited as methods, and they cannot be used as constructors',
    html: 'An <strong>arrow function expression</strong> is a syntactically compact&nbsp;alternative to a&nbsp;regular&nbsp;<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function">function expression</a>, although without&nbsp;its own bindings to the&nbsp;<code><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">this</a></code>, <code><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments">arguments</a></code>, <code><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super">super</a></code>, or <code><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target">new.target</a></code>&nbsp;keywords. Arrow&nbsp;function expressions are ill suited as&nbsp;methods,&nbsp;and they cannot&nbsp;be used as constructors.'
  }
}

const varNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables#What_is_a_variable',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Variables#What_is_a_variable" target="_blank">variable</a>',
    text: 'variable'
  },
  description: {
    text: ' is a variable. A variable is a container for a value, like a number we might use in a sum, or a string that we might use as part of a sentence. But one special thing about variables is that their contained values can change.',
    html: '</code> is a variable. A variable is a container for a value, like a number we might use in a sum, or a string that we might use as part of a sentence. But one special thing about variables is that their contained values can change.'
  }
}

const funcNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Functions',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Functions" target="_blank">function</a>',
    text: 'function'
  },
  description: {
    text: 'Functions allow you to store a piece of code that does a single task inside a defined block, and then call that code whenever you need it using a single short command — rather than having to type out the same code multiple times.',
    html: 'Functions allow you to store a piece of code that does a single task inside a defined block, and then call that code whenever you need it using a single short command — rather than having to type out the same code multiple times.'
  }
}

const numNfo = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" target="_blank">number</a>',
    text: 'number'
  },
  description: {
    html: 'This is a number.',
    text: 'This is a number.'
  }
}

const addEveLsnr = {
  status: 'standard',
  url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener" target="_blank">event listener</a>',
    text: 'event listener'
  },
  description: {
    text: 'The EventTarget method addEventListener() sets up a function that will be called whenever the specified event is delivered to the target. Common targets are Element, Document, and Window, but the target may be any object that supports events (such as XMLHttpRequest).',
    html: '<span class="seoSummary">The <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget"><code>EventTarget</code></a> method <code>addEventListener()</code> sets up a function that will be called whenever the specified event is delivered to the target.</span> Common targets are <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Element"><code>Element</code></a>, <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Document"><code>Document</code></a>, and <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window"><code>Window</code></a>, but the target may be any object that supports events (such as <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest"><code>XMLHttpRequest</code></a>).'
  }
}

const stdLib = {
  'Number()': jsNums,
  'String()': jsStrs,
  'Date()': jsDate,
  'Canvas 2d Context': jsCanv,
  'DOM Node': jsDOM,
  'Array()': jsArr
}

const shared = [
  'toLocaleString',
  'toString',
  'valueOf',
  'length',
  'concat',
  'includes',
  'indexOf',
  'lastIndexOf',
  'normalize',
  'slice',
  'fill',
  'filter'
]

function collectObjs (data) {
  const html = []
  const text = []
  for (const key in stdLib) {
    if (Object.keys(stdLib[key]).includes(data)) {
      text.push(key)
      html.push(`<a target="_blank" href="${stdLib[key][data].url}">${key}</a>`)
    }
  }
  return { html, text }
}

function augmentedObjNfo (data) {
  let obj
  for (const key in stdLib) {
    if (Object.keys(stdLib[key]).includes(data)) {
      const t = stdLib[key][data].description.text
      const h = stdLib[key][data].description.html
      stdLib[key][data].description.text = `${data} is a property/method of a ${key} object. ` + t
      stdLib[key][data].description.html = `<a target="_blank" href="${stdLib[key][data].url}">${data}</a> is a property/method of a ${key} object. ` + h
      obj = stdLib[key][data]
      break
    }
  }
  return obj
}

function checkOtherJSObjs (data) {
  if (shared.includes(data)) {
    const obj = collectObjs(data)
    const txt = `Multiple JavaScript object's have a ${data}() method, this could be referring to `
    return {
      status: 'standard',
      url: `https://developer.mozilla.org/en-US/search?q=${data}`,
      keyword: {
        html: `<a href="https://developer.mozilla.org/en-US/search?q=${data}" target="_blank">${data}</a>`,
        text: data
      },
      description: {
        text: txt + obj.text.join(', '),
        html: txt + obj.html.join(', ')
      }
    }
  } else return augmentedObjNfo(data)
}

function isEvent (o, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line).replace(/\s/g, '')
  const idx = line.indexOf(o.data)
  const key = o.data.replace(/'/g, '')
  if (line[idx - 1] === '(' && jsEvents[key]) {
    if (jsEvents[key].length === 1) return jsEvents[key][0]
    else {
      let text = `The ${key} event can be used on a few different interfaces, including`
      let html = `The ${key} event can be used on a few different interfaces, including`
      jsEvents[key].forEach((obj, i) => {
        if (i === jsEvents[key].length - 1) {
          text += ` and ${obj.type}.`
          html += ` and <a href="${obj.url}" target="_blank">${obj.type}</a>.`
        } else {
          text += ` ${obj.type},`
          html += ` <a href="${obj.url}" target="_blank">${obj.type}</a>,`
        }
      })
      return {
        status: 'standard',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Events#event_listing',
        keyword: { html: key, text: key },
        description: { html, text }
      }
    }
  } else return null
}

function isChildOf (str, data, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const arr = line.split('.')
  let match = false
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].startsWith(data) && arr[i - 1] && arr[i - 1].endsWith(str)) {
      match = true
    }
  }
  return match
}

function checkDefNfo (data, cm) {
  const pos = cm.getCursor()
  const line = cm.getLine(pos.line)
  const callee = line.split(data)
  let calling = false
  for (let i = 0; i < callee.length; i++) {
    if (callee[i].indexOf('()') === 0) calling = true
  }
  if (calling || line.includes('function') || line.includes('=>')) {
    const text = ` In this particular case the value being stored in the variable ${data} is an entire function.`
    const html = ` In this particular case the value being stored in the variable <code>${data}</code> is an entire <a href="${funcNfo.url}" target="_blank">function</a>.`
    return {
      status: 'standard',
      url: funcNfo.url,
      keyword: funcNfo.keyword,
      description: {
        text: data + varNfo.description.text + text,
        html: '<code>' + data + varNfo.description.html + html
      }
    }
  } else {
    return {
      status: 'standard',
      url: varNfo.url,
      keyword: varNfo.keyword,
      description: {
        text: data + varNfo.description.text,
        html: '<code>' + data + varNfo.description.html
      }
    }
  }
}

function strNfo (obj) {
  const url = 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/Strings'
  const text = 'This is a string, which is what pieces of text are called in programming. In JavaScript strings can be contained within single quotes or double quotes.'
  const literals = ' This string however uses the "backtick" or "accent" mark, because it\'s actually a special type of string in JavaScript known as a template literal or template string.'
  if (obj.type === 'string-2') {
    return {
      status: 'standard',
      url: url + '#Template_literals',
      keyword: {
        html: `<a href="${url}#Template_literals" target="_blank">template string</a>`,
        text: 'template string'
      },
      description: { text: text + literals, html: text + literals }
    }
  } else {
    return {
      status: 'standard',
      url: url,
      keyword: {
        html: `<a href="${url}" target="_blank">string</a>`,
        text: 'string'
      },
      description: { text: text, html: text }
    }
  }
}

function jsData (o, cm) {
  if (!o.type) return null

  if (o.type === 'def') {
    o.nfo = checkDefNfo(o.data, cm)
  } else if (o.type === 'variable') {
    if (jsWindow[o.data]) o.nfo = jsWindow[o.data]
    else if (jsRefs[o.data]) o.nfo = jsRefs[o.data]
    else o.nfo = checkDefNfo(o.data, cm)
  } else if (o.data === 'function') {
    o.nfo = funcNfo
  } else if (o.type.includes('string')) {
    o.nfo = isEvent(o, cm)
    o.nfo = o.nfo ? o.nfo : strNfo(o)
  } else if (o.type === 'number') {
    o.nfo = numNfo
  } else if (o.type === 'property') {
    if (o.data === 'addEventListener') {
      o.nfo = addEveLsnr
    } else if (isChildOf('window', o.data, cm) && jsWindow[o.data]) {
      o.nfo = jsWindow[o.data]
    } else if (isChildOf('document', o.data, cm) && jsDoc[o.data]) {
      o.nfo = jsDoc[o.data]
    } else if (isChildOf('Math', o.data, cm) && jsMath[o.data]) {
      o.nfo = jsMath[o.data]
    } else if (isChildOf('history', o.data, cm) && jsHistory[o.data]) {
      o.nfo = jsHistory[o.data]
    } else if (isChildOf('location', o.data, cm) && jsLocation[o.data]) {
      o.nfo = jsLocation[o.data]
    } else if (isChildOf('navigator', o.data, cm) && jsNavigator[o.data]) {
      o.nfo = jsNavigator[o.data]
    } else {
      o.nfo = checkOtherJSObjs(o.data)
    }
  } else if (o.type === 'comment') {
    o.nfo = commentNfo
  } else if (o.data === '=>') {
    o.nfo = arrowFunc
  } else if (jsRefs[o.data]) {
    o.nfo = jsRefs[o.data]
  }
  return o.nfo
}

module.exports = jsData
