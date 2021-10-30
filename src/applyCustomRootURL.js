// opts.code = opts.code.replace(/<style[^>]*>([\S\s]*?)<\/style>/g, (s) => add2css(s))
// opts.code = opts.code.replace(/<script[^>]*>([^>]*?)<\/script>/g, (s) => add2js(s))
// "safer" regex than above: https://stackoverflow.com/a/64396746/1104148
const cssRegex = /(?:<(style)(?:\s+(?=((?:"[\S\s]*?"|'[\S\s]*?'|(?:(?!\/>)[^>])?)+))\2)?\s*>)([\S\s]*?)<\/\1\s*>/g
const jsRegex = /(?:<(script)(?:\s+(?=((?:"[\S\s]*?"|'[\S\s]*?'|(?:(?!\/>)[^>])?)+))\2)?\s*>)([\S\s]*?)<\/\1\s*>/g
const attrRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g

function add2css (str, root) {
  const urlMatches = str.match(/\burl\(([^()]*)\)/g) || [] // match all url(...)
  const srcMatches = str.match(attrRegex).filter(m => m.includes('src=')) || []

  urlMatches.forEach(m => {
    const n = (m.includes('"') || m.includes("'")) ? 5 : 4
    const s = m.substring(n, m.length)
    if (s.indexOf('http') !== 0) str = str.replace(s, root + s)
  })

  srcMatches.forEach(m => {
    const ms = m.indexOf('="') >= 0 ? '="' : m.indexOf("='") >= 0 ? "='" : '='
    const a = m.split(ms)
    a[1] = root + a[1]
    const b = a.join(ms)
    str = str.replace(m, b)
  })

  return str
}

function add2js (str, root) {
  const matches = str.match(/(['"code.match(jsRegex), ])((\\\1|.)*?)\1/gm) // match all strings
  if (!matches) return str
  matches.forEach(m => {
    const s = m.substring(1, m.length - 1)
    if (s.indexOf('http') !== 0) {
      const cs = s.indexOf('.') === 0 // check for class selector
      const split = s.split('.')
      const ex = split[split.length - 1]
      // NOTE: making a HUGE assumptions here (>_<) trying to see if the
      // matched string ends with a short extention: .jpg|.json|.webm|etc
      if (!cs && split.length > 1 && (ex.length > 2 && ex.length < 5)) {
        str = str.replace(s, root + s)
      }
    }
  })
  return str
}

function handleAframeAttributes (str, root) {
  if (str.includes(';')) {
    const arr = str.split(';')
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].includes('src')) {
        arr[i] = `src: ${root}${arr[i].split(':')[1].trim()}`
      }
    }
    str = `"${arr.join(';')}`
  } else {
    str = `"src: ${root}${str.split(':')[1].trim()}`
  }
  return str
}

function add2attr (code, root, cm) {
  const temps = {} // remove <style> && <script> temporarily
  temps.jsMatches = code.match(jsRegex) || []
  temps.cssMatches = code.match(cssRegex) || []

  temps.jsMatches.forEach((matches, i) => {
    code = code.replace(matches[0], `JS_TEMP_INSERT_${i}`)
  })
  temps.cssMatches.forEach((matches, i) => {
    code = code.replace(matches[0], `CSS_TEMP_INSERT_${i}`)
  })

  // find matches for HTML attributes
  code = code.replace(attrRegex, (attr) => {
    const a = attr.split('=')
    if ((a[0] === 'src' || a[0] === 'href') && a[1].indexOf('http') !== 1) {
      a[1] = `"${root}${a[1].substring(1, a[1].length - 1)}"`
    } else if (a[0] === 'material' && a[1].includes('src')) {
      a[1] = handleAframeAttributes(a[1], root)
    }
    return `${a[0]}=${a[1]}`
  })

  // re-inject original <style> && <script>
  temps.jsMatches.forEach((matches, i) => {
    code = code.replace(`JS_TEMP_INSERT_${i}`, matches[0])
  })
  temps.cssMatches.forEach((matches, i) => {
    code = code.replace(`CSS_TEMP_INSERT_${i}`, matches[0])
  })

  return code
}

module.exports = (opts) => {
  if (opts.lang === 'html') {
    opts.code = add2attr(opts.code, opts.root, opts.cm)
    opts.code = opts.code.replace(cssRegex, (s) => add2css(s, opts.root))
    opts.code = opts.code.replace(jsRegex, (s) => add2js(s, opts.root))
    opts.doc.write(opts.code)
  } else if (opts.lang === 'css') opts.doc.write(add2css(opts.code, opts.root))
  else if (opts.lang === 'javascript') opts.doc.write(add2js(opts.code, opts.root))
}
