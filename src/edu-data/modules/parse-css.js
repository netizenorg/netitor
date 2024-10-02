const cssProps = require('../css/properties.json')

function parseCSS (string) {
  const parsedCode = { property: '', value: [] }

  const regExp = /\(([^)]+)\)/g
  let matches = string.match(regExp) // find css functions

  const line = string.split(':')
  parsedCode.property = line[0]

  if (line.length < 2) return null

  if (matches) {
    // store CSS function names
    const funcs = line[1].split(' ')
      .filter(item => item.includes('('))
      .map(item => item.split('(')[0])

    // create string version of all CSS vals (including non functions)
    let valueArr = line[1]
    matches.forEach(m => { valueArr = valueArr.replace(m, '') })

    // create mutli-dimentoinal-array of CSS function arguments
    matches = matches.map((item) => {
      item = item.replace(/[()]/g, '')
      return item.split(',')
    })
    // add coresponding func name to start of the arrays
    matches.forEach((item, index) => {
      item.unshift(funcs[index])
    })

    // interweave non-function values && function values together
    let count = 0
    valueArr = valueArr.split(' ')
      .filter(el => el.trim().length > 0)
      .map(el => el.replace(';', ''))
      .map(v => {
        if (funcs.includes(v)) {
          const nxtArr = matches[count]
          count++
          return nxtArr
        } else return v
      })

    parsedCode.value = valueArr
  } else {
    const valueArr = line[1].split(' ')
      .filter(el => el.trim().length > 0)
      .map(el => el.replace(';', ''))

    parsedCode.value = valueArr
  }

  return parsedCode
}

function getWordAtIndex (cssString, index) {
  if (index < 0 || index >= cssString.length) return null
  const boundaries = [' ', ';', ':']

  let start = index
  while (start > 0 && !boundaries.includes(cssString[start - 1])) {
    start--
  }

  let end = index
  while (end < cssString.length && !boundaries.includes(cssString[end])) {
    end++
  }
  return cssString.slice(start, end)
}

function parseStyleAttr (data, i, cm) {
  // remove surrdounding quotes
  if (data[0] === '"') {
    data = data.substr(1, data.length - 2)
    i--
  }

  // selection
  const sel = getWordAtIndex(data, i)

  // create dict
  const styles = {}
  data.split(';').forEach(s => {
    if (s.includes(':')) {
      const prop = s.split(':')[0].trim()
      if (cssProps[prop]) {
        const parsed = parseCSS(s.trim())
        styles[parsed.property] = parsed.value
      }
    }
  })

  if (styles[sel]) {
    const nfo = cssProps[sel]
    return nfo
  } else {
    for (const prop in styles) {
      if (styles[prop].includes(sel)) {
        const nfo = cssProps[prop]
        const p = styles[prop].length > 1 ? 'part of the value' : 'the value'
        const h = nfo.description.html
        const t = nfo.description.text
        nfo.description = {
          html: `Here <code>${sel}</code> is ${p} being set for the <a href="${nfo.url}" target="_blank">${prop}</a> property. ${h}`,
          text: `Here ${sel} is ${p} being set for the ${prop} property. ${t}`
        }
        return nfo
      }
    }
  }
  return null
}

module.exports = { parseStyleAttr }
