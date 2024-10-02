const htmlAttr = require('../html/attributes.json')
const htmlEles = require('../html/elements.json')
const svgEles = require('../html/svg-elements.json')
const svgAttr = require('../html/svg-attributes.json')
const { parseStyleAttr } = require('./parse-css.js')

const htmlB = {
  name: 'angle brackets',
  url: 'https://developer.mozilla.org/en-US/docs/Glossary/HTML#concept_and_syntax',
  html: 'In markup languages (like HTML and others), the <code>&lt;</code> (less-than) and <code>&gt;</code> (greater-than) symbols are <i>syntax</i> used to create <i>tags</i>. <br><br> Tags usually come in pairs, an opening <code>&lt;tag&gt;</code> followed by some content and then a closing <code>&lt;/tag&gt;</code> (differentiated by the forward slash). <br><br> A pair of tags are referred to as an element. Different markup languages have their own list of elements, some even let you create your own!',
  text: 'In markup languages like HTML, the < (less-than) and > (greater-than) symbols are used to create tags. Tags usually come in pairs: an opening <tag>, some content, and a closing </tag> with a forward slash. A pair of tags forms an element, and different markup languages have their own sets of elements, with some allowing custom ones.'
}

const htmlC = {
  name: 'HTML comments',
  url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#HTML_comments',
  html: 'Most coding languages support comments, which are ignored by browsers and used to explain code or temporarily disable it. In HTML, comments start with <code>&lt;!--</code> and end with <code>--&gt;</code>. They help document logic, give credit to code you copy/pasted or "comment out" (temporarily disable) sections. Use the shortcut <b>CTRL + /</b> (or <b>CMD + /</b> on Mac) to quickly add or remove comments.',
  text: 'Most coding languages support comments, which are ignored by browsers and used to explain code or temporarily disable it. In HTML, comments start with &lt;!-- and end with -->. They help document logic, give credit to code you copy/pasted or "comment out" (temporarily disable) sections. Use the shortcut CTRL + / (or CMD + / on Mac) to quickly add or remove comments.'
}

const htmlD = {
  name: 'HTML doctype',
  url: 'https://en.wikipedia.org/wiki/Document_type_declaration',
  html: 'This tag is not an HTML element in the traditional sense. It is a "declaration" to the browser about what document type to expect. This helps the browser determine the best way to <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">render</a> the page. There are different doctypes for code written at different points in history of HTML, we\'re currently in the era of HTML5, so any pages created now should have the HTML5 doctype which looks like <code>&lt;!DOCTYPE html&gt;</code>.',
  text: 'This tag isn\'t a traditional HTML element but a "declaration" to tell the browser what type of document to expect. It helps the browser decide how to render the page. Different doctypes exist for different versions of HTML, but for modern pages, we use the HTML5 doctype: <!DOCTYPE html>.'
}

const genObj = (o) => {
  return {
    url: o.url,
    keyword: {
      html: `<a href="${o.url}" target="_blank">${o.name}</a>`,
      text: o.name
    },
    description: { html: o.html, text: o.text }
  }
}

function htmlData (o, i, cm) {
  if (o.type === 'element' && htmlEles[o.data]) o.nfo = htmlEles[o.data]
  else if (o.type === 'element' && svgEles[o.data]) o.nfo = svgEles[o.data]
  else if (o.type === 'attribute' && htmlAttr[o.data]) o.nfo = htmlAttr[o.data]
  else if (o.type === 'attribute' && svgAttr[o.data.toLowerCase()]) o.nfo = svgAttr[o.data.toLowerCase()]
  else if (o.type === 'attribute' && o.data.indexOf('data-') === 0) {
    o.nfo = htmlAttr['data-*']
  } else if (o.type === 'tag bracket') {
    o.nfo = genObj(htmlB)
  } else if (o.type === 'comment') {
    o.nfo = genObj(htmlC)
  } else if (o.data.includes('<!DOCTYPE')) {
    o.nfo = genObj(htmlD)
  } else if (o.type === 'string') {
    // check attribute value for CSS code
    o.nfo = parseStyleAttr(o.data, i, cm)
  }
  return o.nfo
}

module.exports = htmlData
