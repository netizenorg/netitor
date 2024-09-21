const htmlAttr = require('../edu-data/html/attributes.json')
const svgAttr = require('../edu-data/html/svg-attributes.json')
const htmlEles = require('../edu-data/html/elements.json')
const svgEles = require('../edu-data/html/svg-elements.json')
const allEles = { ...svgEles, ...htmlEles }
const allAttr = { ...svgAttr, ...htmlAttr }
const allSnippets = require('./customSnippets.js').snippets

function checkSVGcontext (editor) {
  const pos = editor.getCursor()
  const token = editor.getTokenAt(pos)
  const state = token.state
  let context = state.context || state.htmlState.context
  while (context) {
    if (context.tagName && context.tagName.toLowerCase() === 'svg') {
      return true
    }
    context = context.prev
  }
  return false
}

function elementHintList (tok, tag, cm) {
  const str = tok.string
  const list = []
  const inSVG = checkSVGcontext(cm)
  const snippets = inSVG ? allSnippets.svg : allSnippets.html
  const eles = inSVG ? svgEles : htmlEles

  for (const ele in eles) {
    if (ele.includes(str)) {
      let text = eles[ele].singleton ? `${ele}>` : `${ele}></${ele}>`
      if (snippets[ele]) text = snippets[ele]
      if (!tag) text = '<' + text
      list.push({ text, displayText: ele })
    }
  }

  for (const snip in snippets) {
    if (!Object.prototype.hasOwnProperty.call(eles, snip)) {
      if (snip.includes(str)) {
        const text = (tok.type === 'tag')
          ? snippets[snip].substr(1) : snippets[snip]
        list.push({ text, displayText: snip })
      }
    }
  }
  return list
}

function attributeHintList (tok) {
  const str = tok.string
  const ele = tok.state.htmlState.tagName
  const list = []
  for (const attr in allAttr) {
    if (attr.includes(str) && allEles[ele].attributes.includes(attr)) {
      list.push({ text: attr + '=""', displayText: attr })
    }
  }
  return list
}

function htmlHinter (token, cm) {
  // TBD: in future the token.state could be used to determine context
  // for example: to decide whether or not to include <a-frame> elements
  // console.log(token)
  if (!token.type) return elementHintList(token, false, cm)
  else if (token.type === 'attribute') return attributeHintList(token)
  else if (token.type === 'tag') return elementHintList(token, true, cm)
}

module.exports = htmlHinter
