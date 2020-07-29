const htmlAttr = require('../html-attributes.json')
const htmlEles = require('../html-elements.json')

const htmlC = {
  name: 'HTML comments',
  url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Getting_started#HTML_comments',
  nfo: 'HTML has a mechanism to write comments in the code. Browsers ignore comments,  effectively making comments invisible to the user. The purpose of comments is to allow you to include notes in the code to explain your logic or coding. This is very useful if you return to a code base after being away for long enough that you don\'t completely remember it.'
}

const htmlD = {
  name: 'HTML doctype',
  url: 'https://en.wikipedia.org/wiki/Document_type_declaration',
  nfo: 'This tag is not an HTML element in the traditional sense. It is a "declaration" to the browser about what document type to expect. This helps the browser determine the best way to <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">render</a> the page. There are different doctypes for code written at different points in history of HTML, we\'re currently in the era of HTML5, so any pages created now should have the HTML5 doctype which looks like <code>&lt;!DOCTYPE html&gt;</code>.'
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

module.exports = htmlData
