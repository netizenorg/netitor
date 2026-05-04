const htmlLinter = require('./htmlLinter.js')
const cssLinter = require('./cssLinter.js')
const jsLinter = require('./jsLinter.js')

function localPathLinter (code, language) {
  const errz = []
  const lines = code.split('\n')
  const localPathRE = /\b(file:\/\/\/?|[a-zA-Z]:[\\/]+|\/Users\/|\/home\/)[^\s"'`)<>]+/g

  lines.forEach((str, idx) => {
    let match
    while ((match = localPathRE.exec(str))) {
      const prefix = match[1]
      const displayPath = prefix.indexOf('file://') === 0
        ? 'file://...'
        : /^[a-zA-Z]:/.test(prefix)
          ? `${prefix[0]}:\\...`
          : `${prefix}...`

      errz.push({
        language,
        type: 'warning',
        rule: 'local-path',
        message: 'Local file paths will not work on the web.',
        friendly: `It looks like you're using a local file path: <code>${displayPath}</code>. This might work on your computer, but it won't work for other people online because their browser can't access files from your machine. Use a relative path to a file in your project like <code>cat.jpg</code> or a web URL that starts with <code>https://</code>.`,
        evidence: str,
        line: idx + 1,
        col: match.index + 1
      })
    }
  })

  return errz
}

function parseMixed (code) {
  const parser = new window.DOMParser()
  const doc = parser.parseFromString(code, 'text/html')
  const obj = { css: [], js: [] }
  const arr = code.split('\n')

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes('<style')) obj.css.push({ offset: i })
    else if (arr[i].includes('<script')) obj.js.push({ offset: i })
  }

  doc.querySelectorAll('style').forEach((e, i) => {
    obj.css[i].code = e.textContent
  })

  doc.querySelectorAll('script').forEach((e, i) => {
    obj.js[i].code = e.textContent
  })

  return obj
}

async function concatErrz (errz, parsed, type) {
  for (let i = 0; i < parsed[type].length; i++) {
    const newErrz = (type === 'css')
      ? await cssLinter(parsed[type][i].code)
      : await jsLinter(parsed[type][i].code) // TODO
    for (let j = 0; j < newErrz.length; j++) {
      newErrz[j].line += parsed[type][i].offset
    }
    errz = errz.concat(newErrz)
  }
  return errz
}

async function linter (cm) {
  const code = cm.getValue()
  const lang = cm.getMode().name

  let errz = (lang === 'css')
    ? await cssLinter(code) : (lang === 'javascript')
      ? jsLinter(code) : htmlLinter(code, cm)

  if (lang === 'htmlmixed') {
    const parsed = parseMixed(code)
    errz = await concatErrz(errz, parsed, 'css')
    errz = await concatErrz(errz, parsed, 'js')
  }

  errz = errz.concat(localPathLinter(code, lang))

  // HACK: not sure why, but some errors return e.line: 0 ???
  errz = errz.map(o => {
    if (o.line === 0) o.line = 1
    return o
  })

  return await errz
}

module.exports = linter
