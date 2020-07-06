const htmlHinter = require('./htmlHinter.js')

function coreHinter (cm, options) {
  const pos = cm.getCursor()
  const tok = cm.getTokenAt(pos)
  const lan = cm.getModeAt(pos).name

  let list = []
  if (lan === 'xml') list = htmlHinter(tok)
  // const list = htmlHinter(tok)
  // console.log(list)

  console.log(tok)

  return {
    list: list,
    from: { line: pos.line, ch: tok.start },
    to: { line: pos.line, ch: tok.end }
  }
}

module.exports = coreHinter
