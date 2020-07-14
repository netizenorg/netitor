const htmlLinter = require('./htmlLinter.js')
const cssLinter = require('./cssLinter.js')
const jsLinter = require('./jsLinter.js')

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
    ? cssLinter(code) : (lang === 'javasscript')
      ? jsLinter(code) : htmlLinter(code)

  if (lang === 'htmlmixed') {
    const parsed = parseMixed(code)
    errz = concatErrz(errz, parsed, 'css')
  }

  // // clean err objs
  // for (let i = 0; i < errz.length; i++) {
  //   // col, evidence, friendly, line, message, rule { id, description, link }
  //   delete errz[i].evidence
  //   if (typeof errz[i].rule === 'object') errz[i].rule = errz[i].rule.id
  // }

  return await errz
}

module.exports = linter
