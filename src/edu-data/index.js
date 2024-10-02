const CodeMirror = require('codemirror')
const htmlData = require('./modules/htmlData.js')
const cssData = require('./modules/cssData.js')
const jsData = require('./modules/jsData.js')

function eduData (cm) {
  const pos = cm.getCursor()
  const tok = cm.getTokenAt(pos)
  const lan = cm.getModeAt(pos).name
  const inner = CodeMirror.innerMode(cm.getMode(), tok.state)
  const state = inner.state.state

  const i = pos.ch - tok.start
  const o = {
    language: lan === 'xml' ? 'html' : lan,
    data: tok.string,
    type: tok.type === 'tag' ? 'element' : tok.type,
    line: pos.line + 1
  }

  if (o.language === 'html') o.nfo = htmlData(o, i, cm)
  else if (o.language === 'css') o.nfo = cssData(o, state, cm)
  else if (o.language === 'javascript') o.nfo = jsData(o, cm)

  return o
}

module.exports = eduData
