const htmlAttr = require('../edu-data/html-attributes.json')
const htmlEles = require('../edu-data/html-elements.json')
const snippets = require('./customSnippets.js').snippets.html

function elementHintList (tok, tag) {
  const str = tok.string
  const list = []
  for (const ele in htmlEles) {
    if (ele.includes(str)) {
      let text = htmlEles[ele].singleton ? `${ele}>` : `${ele}></${ele}>`
      if (snippets[ele]) text = snippets[ele]
      if (!tag) text = '<' + text
      list.push({ text, displayText: ele })
    }
  }
  for (const snip in snippets) {
    if (!Object.prototype.hasOwnProperty.call(htmlEles, snip)) {
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
  for (const attr in htmlAttr) {
    if (attr.includes(str) && htmlEles[ele].attributes.includes(attr)) {
      list.push({ text: attr + '=""', displayText: attr })
    }
  }
  return list
}

function htmlHinter (token) {
  // TBD: in future the token.state could be used to determine context
  // for example: to decide whether or not to include <a-frame> elements
  // console.log(token)
  if (!token.type) return elementHintList(token)
  else if (token.type === 'attribute') return attributeHintList(token)
  else if (token.type === 'tag') return elementHintList(token, true)
}

module.exports = htmlHinter
