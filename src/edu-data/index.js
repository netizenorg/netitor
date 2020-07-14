const CodeMirror = require('codemirror')
const htmlAttr = require('./html-attributes.json')
const htmlEles = require('./html-elements.json')
const cssProps = require('./css-properties.json')
const pseudoEles = require('./css-pseudo-elements.json')
const pseudoClasses = require('./css-pseudo-classes.json')
const atRules = require('./css-at-rules.json')
const cssColors = require('./css-colors.json')
const cssTypes = require('./css-data-types.json')
const cssUnits = require('./css-units.json')
const cssFunctions = require('./css-functions.json')
const checkSelector = require('./css-read-selector.js')

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  HTML FUNCTIONS
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

const htmlC = {
  name: 'HTML comments',
  url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#HTML_comments',
  nfo: 'HTML has a mechanism to write comments in the code. Browsers ignore comments,  effectively making comments invisible to the user. The purpose of comments is to allow you to include notes in the code to explain your logic or coding. This is very useful if you return to a code base after being away for long enough that you don\'t completely remember it.'
}

const htmlD = {
  name: 'HTML doctype',
  url: 'https://en.wikipedia.org/wiki/Document_type_declaration',
  nfo: 'This tag is not an HTML element in the traditional sense. It is an "declaration" to the browser about what document type to expect. This helps the browser determine the best way to <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">render</a> the page. There are different doctypes for code written at different points in history of HTML, we\'re currently in the era of HTML5, so any pages created now should have the HTML5 doctype which looks like <code>&lt;!DOCTYPE html&gt;</code>.'
}

const genObj = (o) => {
  return {
    url: o.url,
    keyword: {
      html: `<a href="${o.url}" target="_blank">${o.name}</a>`,
      text: 'HTML comments'
    },
    description: { html: o.nfo, text: o.nfo }
  }
}

function htmlData (o) {
  if (o.type === 'element' && htmlEles[o.data]) o.nfo = htmlEles[o.data]
  else if (o.type === 'attribute' && htmlAttr[o.data]) o.nfo = htmlAttr[o.data]
  else if (o.type === 'attribute' && o.data.indexOf('data-') === 0) {
    o.nfo = htmlAttr['data-*']
  } else if (o.type === 'comment') {
    o.nfo = genObj(htmlC)
  } else if (o.data.includes('<!DOCTYPE')) {
    o.nfo = genObj(htmlD)
  }
  return o.nfo
}

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  CSS FUNCTIONS
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

const clrURL = {
  keyword: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#Color_keywords',
  rgb: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#RGB_colors',
  hsl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#HSL_colors',
  hex: 'https://www.w3schools.com/colors/colors_hexadecimal.asp'
}

const cssCommentNfo = {
  url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Comments',
  keyword: {
    html: '<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Comments" target="_blank">comments</a>',
    text: 'comments'
  },
  description: {
    html: 'A CSS comment is used to add explanatory notes to the code or to prevent the browser from interpreting specific parts of the style sheet. By design, comments have no effect on the layout of a document',
    text: 'A CSS comment is used to add explanatory notes to the code or to prevent the browser from interpreting specific parts of the style sheet. By design, comments have no effect on the layout of a document'
  }
}

const cssImportant = {
  url: 'hhttps://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#The_!important_exception',
  keyword: {
    html: '<a href="hhttps://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#The_!important_exception" target="_blank">!important</a>',
    text: '!important'
  },
  description: {
    html: 'When an <code>!important</code> rule is used on a style declaration, this declaration overrides any other declarations. It\'s not considered the best practice (because it can be tricky to debug as it overrides all default CSS specificity rules) so you should use it sparingly when no other options are available',
    text: 'When an !important rule is used on a style declaration, this declaration overrides any other declarations. It\'s not considered the best practice (because it can be tricky to debug as it overrides all default CSS specificity rules) so you should use it sparingly when no other options are available'
  }
}

function createColorNfo (val, type) {
  const nfo = {
    url: cssTypes.color.url,
    keyword: {
      html: cssTypes.color.keyword.html,
      text: cssTypes.color.keyword.text
    },
    description: {
      html: cssTypes.color.description.html,
      text: cssTypes.color.description.text
    }
  }
  if (type === 'keyword') {
    nfo.description.html = nfo.description.html + ` This specific color <code>${val}</code> is defined using a color <a href="${clrURL[type]}" target="_blank">${type}</a>. If this were written as a hex value it would be <code>${cssColors[val].hex}</code>, written as an rgb value it would be <code>${cssColors[val].rgb}</code>`
    nfo.description.text = nfo.description.text + ` This specific color is defined using a color "${type}". If this were written as a hex value it would be ${cssColors[val].hex}, written as an rgb value it would be ${cssColors[val].rgb}`
  } else {
    nfo.description.html = nfo.description.html + ` This specific color is defined in the <a href="${clrURL[type]}" target="_blank">${type}</a> format.`
    nfo.description.text = nfo.description.text + ` This specific color is defined in the "${type}" format.`
  }
  return nfo
}

function vendorPrefix (str) {
  const vp = {
    '-moz-': 'Firefox',
    '-webkit-': 'Webkit (the browser engine inside of Chrome, newer versions of Opera and almost all iOS browsers)',
    '-o-': 'Opera',
    '-ms-': 'Internet Explorer and Microsof Edge'
  }
  const desc = `The "${str}" is the ${vp[str]} vendor prefix. Browser vendors sometimes add prefixes to experimental or nonstandard CSS properties and JavaScript APIs, so developers can experiment with new ideas while—in theory—preventing their experiments from being relied upon and then breaking web developers' code during the standardization process. Developers should wait to include the unprefixed property until browser behavior is standardized.`
  const url = 'https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix'
  return {
    url: url,
    keyword: {
      html: `<a href="${url}" target="_blank">browser vendor prefix</a>`,
      text: 'browser vendor prefix'
    },
    description: { html: desc, text: desc }
  }
}

function cssVariables (str) {
  return {
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/--*',
    keyword: {
      html: '<a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*" target="_blank">custom properties: CSS variables</a>',
      text: 'custom properties: CSS variables'
    },
    description: {
      html: `Property names that are prefixed with <code>--</code>, like <code>${str}</code>, represent <em>custom properties</em> that contain a value that&nbsp;can be used in other declarations using the <a href="/en-US/docs/Web/CSS/var" title="The var() CSS function can be used to insert the value of a custom property (sometimes called a &quot;CSS variable&quot;) instead of any part of a value of another property."><code>var()</code></a>&nbsp;function`,
      text: `Property names that are prefixed with --, like ${str}, represent custom properties that contain a value that can be used in other declarations using the var() function`
    }
  }
}

function cssNumber (str) {
  const n = parseFloat(str)
  const i = `${n}`.length
  const u = str.substr(i)
  if (cssUnits[u]) {
    return {
      status: cssUnits[u].status,
      url: cssUnits[u].url,
      keyword: {
        html: `<a href="${cssUnits[u].url}" target="_blank">${u}</a>`,
        text: 'number'
      },
      description: {
        html: cssUnits[u].html,
        text: cssUnits[u].text
      }
    }
  } else if (u === '' || !cssUnits[u]) {
    return {
      url: cssUnits.number.url,
      keyword: {
        html: `<a href="${cssUnits.number.url}" target="_blank">number</a>`,
        text: 'number'
      },
      description: {
        html: cssUnits.number.html,
        text: cssUnits.number.text
      }
    }
  }
}

function cssFunc (str) {
  if (!cssFunctions[str]) return null
  return {
    status: cssFunctions[str].status,
    url: cssFunctions[str].url,
    keyword: {
      html: `<a href="${cssFunctions[str].url}" target="_blank">${str}()</a>`,
      text: 'number'
    },
    description: {
      html: cssFunctions[str].html,
      text: cssFunctions[str].text
    }
  }
}

function cssData (o, state, cm) {
  if (state === 'top' && o.type !== 'comment' && o.type !== 'variable-3') {
    o.nfo = checkSelector(o, cm)
  } else if (o.type === 'property' && cssProps[o.data]) {
    o.nfo = cssProps[o.data]
  } else if (o.type === 'variable-3') {
    if (pseudoClasses[':' + o.data]) o.nfo = pseudoClasses[':' + o.data]
    else if (pseudoEles['::' + o.data]) o.nfo = pseudoEles['::' + o.data]
  } else if (o.type === 'def' && o.data.indexOf('@') === 0 && atRules[o.data]) {
    o.nfo = atRules[o.data]
  } else if (o.type === 'meta') {
    const prefixes = ['-moz-', '-webkit-', '-o-', '-ms-']
    if (prefixes.includes(o.data)) o.nfo = vendorPrefix(o.data)
  } else if (o.data.indexOf('--') === 0 && o.type === 'variable-2') {
    o.nfo = cssVariables(o.data)
  } else if (o.type === 'comment') {
    o.nfo = cssCommentNfo
  } else if (o.type === 'number') {
    o.nfo = cssNumber(o.data)
  } else if (o.type === 'variable callee') {
    o.nfo = cssFunc(o.data)
  } else if (state === 'prop') {
    // handle colors values
    const c = o.data.toLowerCase()
    if (o.data === '!important') {
      o.nfo = cssImportant
    } else if (o.type === 'keyword' && Object.keys(cssColors).includes(c)) {
      o.nfo = createColorNfo(c, 'keyword')
    } else if (o.data.indexOf('#') === 0) {
      o.nfo = createColorNfo(c, 'hex')
    } else if (o.data.indexOf('rgb') === 0) {
      o.nfo = createColorNfo(c, 'rgb')
    } else if (o.data.indexOf('hsl') === 0) {
      o.nfo = createColorNfo(c, 'hsl')
    }
  }

  return o.nfo
}

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  JS FUNCTIONS
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

function jsData (o) {
  return {
    description: `this is a <a href="https://developer.mozilla.org/en-US/docs/Web/javascript" target="_blank">JavaScript</a> ${o.type}, more info coming soon!`
  }
}

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// main

function eduData (cm) {
  const pos = cm.getCursor()
  const tok = cm.getTokenAt(pos)
  const lan = cm.getModeAt(pos).name
  const inner = CodeMirror.innerMode(cm.getMode(), tok.state)
  const state = inner.state.state

  const o = {
    language: lan === 'xml' ? 'html' : lan,
    data: tok.string,
    type: tok.type === 'tag' ? 'element' : tok.type
  }

  if (o.language === 'html') o.nfo = htmlData(o)
  else if (o.language === 'css') o.nfo = cssData(o, state, cm)
  else if (o.language === 'javascript') o.nfo = jsData(o)

  return o
}

module.exports = eduData
