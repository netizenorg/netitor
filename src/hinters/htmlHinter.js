const htmlAttr = require('../edu-data/html-attributes.json')
const htmlEles = require('../edu-data/html-elements.json')
const snippets = require('./snippets.json')

const eleAttrLists = {}
// dictionary to keep track of attributes available on any given element
for (const ele in htmlEles) {
  eleAttrLists[ele] = []
  for (const attr in htmlAttr) {
    const a = htmlAttr[attr]
    const e = a.elements.text
    if (e === 'Global attribute') eleAttrLists[ele].push(attr)
    else {
      const els = e.split(', ').map(s => s.replace(/</g, '').replace(/>/g, ''))
      if (els.includes(ele)) eleAttrLists[ele].push(attr)
    }
  }
}

// function bringToFront (str, arr) {
//   const dtz = arr.map(o => o.displayText)
//   const idx = dtz.indexOf(str)
//   const obj = arr[idx]
//   arr.splice(idx, 1)
//   arr.splice(0, 0, obj)
//   return arr
// }

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
        list.push({ text: snippets[snip], displayText: snip })
      }
    }
  }
  // list = bringToFront(str, list)
  return list
}

function attributeHintList (tok) {
  const str = tok.string
  const ele = tok.state.htmlState.tagName
  const list = []
  for (const attr in htmlAttr) {
    if (attr.includes(str) && eleAttrLists[ele].includes(attr)) {
      list.push({ text: attr + '=""', displayText: attr })
    }
  }
  // list = bringToFront(str, list)
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
