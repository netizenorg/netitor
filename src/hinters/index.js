const htmlHinter = require('./htmlHinter.js')
const cssHinter = require('./cssHinter.js')
const jsHinter = require('./jsHinter.js')

function reOrder (list, str) {
  const newIdx = 0
  let oldIdx
  let item

  for (let i = 0; i < list.length; i++) {
    const val = list[i]
    if (
      (typeof val === 'string' && val.indexOf(str) === 0) ||
      (typeof val === 'object' && val.displayText.indexOf(str) === 0)
    ) {
      oldIdx = i; item = list[i]; break
    }
  }

  if (item) {
    list.splice(oldIdx, 1)
    list.splice(newIdx, 0, item)
  }
  return list
}

function main (cm, options) {
  const pos = cm.getCursor()
  const tok = cm.getTokenAt(pos)
  const lan = cm.getModeAt(pos).name

  let list = []
  if (lan === 'xml') list = htmlHinter(tok)
  else if (lan === 'css') list = cssHinter(tok, cm)
  else if (lan === 'javascript') list = jsHinter(tok, cm)

  // alphabetical
  if (typeof list[0] === 'string') list = list.sort()
  else list.sort((a, b) => (a.displayText > b.displayText) ? 1 : -1)
  // move most likely item to the top of the list
  if (list) list = reOrder(list, tok.string)

  return {
    list: list,
    from: { line: pos.line, ch: tok.start },
    to: { line: pos.line, ch: tok.end }
  }
}

module.exports = main
