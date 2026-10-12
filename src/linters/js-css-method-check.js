// catches CSS syntax written inside nn's .css() method, for example:
// .css(background-color: red) or .css({ background-color: red; })
const cssProps = require('../edu-data/css/properties.json')
const cssColors = require('../edu-data/css/colors.json')
const cssFuncs = new Set(Object.keys(require('../edu-data/css/functions.json')))

const cde = (t) => `<code>${t}</code>`
const camelCase = (s) => s.toLowerCase().replace(/-(.)/g, (m, c) => c.toUpperCase())
const kebabCase = (s) => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase())

const props = new Set()
for (const p in cssProps) { props.add(p); props.add(camelCase(p)) }

// common CSS keywords students are likely to leave unquoted
const keywords = new Set([
  ...Object.keys(cssColors), 'none', 'auto', 'block', 'inline', 'flex', 'grid',
  'absolute', 'relative', 'fixed', 'sticky', 'static', 'hidden', 'visible',
  'bold', 'italic', 'normal', 'center', 'left', 'right', 'top', 'bottom',
  'solid', 'dashed', 'dotted', 'pointer', 'transparent', 'inherit', 'initial',
  'uppercase', 'lowercase', 'underline', 'wrap', 'nowrap', 'column', 'row',
  'cover', 'contain', 'scroll', 'serif', 'monospace'
])

// returns index of the ) that closes the ( right before start, skipping strings
function findClose (code, start) {
  let depth = 1
  let quote = null
  for (let i = start; i < code.length; i++) {
    const ch = code[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
    } else if (ch === '"' || ch === "'" || ch === '`') quote = ch
    else if (ch === '(') depth++
    else if (ch === ')' && --depth === 0) return i
  }
  return -1
}

const isDeclared = (v, code) => {
  return new RegExp(`\\b(let|const|var|function|class)\\s+${v}\\b`).test(code) ||
    new RegExp(`\\b${v}\\s*=(?!=)`).test(code)
}

// is this an unquoted CSS value, rather than a JS value (number, variable, expression)
function isRawCSS (val, code) {
  if (/^['"`]/.test(val)) return false
  if (/^-?(\d+\.?\d*|\.\d+)[a-z%]+$/i.test(val)) return true // 20px, 50%
  if (/^#[0-9a-f]{3,8}$/i.test(val)) return true // #ff0000
  const fn = val.match(/^([a-z-]+)\(/i) // CSS functions like rgb(0, 0, 0)
  if (fn && cssFuncs.has(fn[1]) && !isDeclared(fn[1], code)) return true
  if (/[+*/'"`()[\]?]/.test(val)) return false // looks like a JS expression
  if (/\s/.test(val)) return true // 1px solid red
  if (/^[a-z]+(-[a-z]+)+$/.test(val)) return true // inline-block
  return keywords.has(val) && !isDeclared(val, code)
}

// parses the argument passed to .css() into a list of { prop, val } declarations,
// returns null if it doesn't look like CSS written the way you would in a stylesheet
function parseArg (arg, code) {
  const trimmed = arg.trim()
  let inner = trimmed
  let form = 'parens' // .css(color: red)
  if (/^\{[\s\S]*\}$/.test(trimmed)) {
    inner = trimmed.slice(1, -1)
    form = 'object' // .css({ color: red })
  } else if (/^(['"])[^'"]*\1$/.test(trimmed)) {
    inner = trimmed.slice(1, -1)
    form = 'string' // .css('color: red')
  }
  inner = inner.trim().replace(/[;,]$/, '')
  if (!inner) return null

  const parts = inner.split(/[;,\n](?=\s*['"]?[a-zA-Z-]+['"]?\s*:)/)
    .filter(part => part.trim())
  const decls = []
  for (const part of parts) {
    const m = part.match(/^\s*(['"]?)([a-zA-Z][a-zA-Z-]*)\1\s*:\s*([\s\S]*?)\s*[;,]?\s*$/)
    if (!m || !props.has(m[2]) || !m[3]) return null
    decls.push({ prop: m[2], quoted: !!m[1], val: m[3] })
  }

  const semicolons = form === 'object' && /;/.test(inner)
  const dashes = form === 'object' && decls.some(d => !d.quoted && d.prop.includes('-'))
  const values = form !== 'string' && decls.some(d => isRawCSS(d.val, code))
  if (form === 'object' && !semicolons && !dashes && !values) return null
  return { form, decls, semicolons, dashes, values }
}

function fixVal (val, form, code) {
  if (form === 'string') return `'${val}'`
  if (/^['"`]/.test(val) || /^-?(\d+\.?\d*|\.\d+)$/.test(val)) return val
  if (isRawCSS(val, code)) return `'${val}'`
  return val // variable or expression
}

function suggestions (p, code) {
  const ds = p.decls.map(d => ({ ...d, val: fixVal(d.val, p.form, code) }))
  const kebab = ds.map(d => {
    const k = kebabCase(d.prop)
    return `${k.includes('-') ? `'${k}'` : k}: ${d.val}`
  })
  const camel = ds.map(d => `${camelCase(kebabCase(d.prop))}: ${d.val}`)
  const fixes = []
  if (ds.length === 1) fixes.push(`.css('${kebabCase(ds[0].prop)}', ${ds[0].val})`)
  fixes.push(`.css({ ${kebab.join(', ')} })`)
  if (camel.join() !== kebab.join()) fixes.push(`.css({ ${camel.join(', ')} })`)
  return fixes
}

function friendly (p, code) {
  const d = p.decls.find(d => d.prop.includes('-')) || p.decls[0]
  const reasons = []
  if (p.form === 'parens') {
    reasons.push(`The ${cde('.css()')} method expects either two strings, a property and a value, or an object ${cde('{ }')} of properties and values.`)
  } else if (p.form === 'string') {
    reasons.push('The property and value need to be passed in as separate strings (or in an object), not together in one string.')
  }
  if (p.dashes) reasons.push(`In JavaScript a name with a dash in it, like ${cde(kebabCase(d.prop))}, can't be used as a property name unless it's in quotes (otherwise JavaScript reads the ${cde('-')} as a minus sign), or you can write it in "camelCase" like ${cde(camelCase(kebabCase(d.prop)))}.`)
  else if (p.form === 'parens' && p.decls.some(d => d.prop.includes('-'))) reasons.push(`Property names with a dash, like ${cde(kebabCase(d.prop))}, also need to be in quotes, or written in "camelCase" like ${cde(camelCase(kebabCase(d.prop)))}.`)
  if (p.values) {
    const v = p.decls.find(d => isRawCSS(d.val, code)).val
    reasons.push(`CSS values like ${cde(v)} need to be in quotes (as strings), otherwise JavaScript will think ${cde(v)} is a variable or some other piece of code.`)
  }
  if (p.semicolons) reasons.push(`Inside a JavaScript object, each property and value pair is separated by a comma ${cde(',')}, not a semicolon ${cde(';')}.`)
  const fixes = suggestions(p, code).map(f => cde(f))
  const last = fixes.length > 1 ? ` or ${fixes.pop()}` : ''
  return `It looks like you've written CSS the way you would in a stylesheet, but inside the ${cde('.css()')} method you're writing JavaScript, so the syntax is a little different. ${reasons.join(' ')} Try writing it like this instead: ${fixes.join(', ')}${last}`
}

// returns the errors found, along with a version of the code where each
// offending argument is blanked out (keeping line/col positions intact)
// so that JSHint can still lint the rest of the code
function cssMethodCheck (code) {
  const errz = []
  let clean = code
  const re = /\.css\(/g
  let m
  while ((m = re.exec(code))) {
    const start = m.index + m[0].length
    const end = findClose(code, start)
    if (end < 0) continue
    const p = parseArg(code.slice(start, end), code)
    if (!p) continue

    const before = code.slice(0, m.index).split('\n')
    const line = before.length
    const message = 'CSS syntax used inside JavaScript\'s .css() method.'
    errz.push({
      jshint: { code: 'nn-css', reason: message },
      language: 'javascript',
      type: 'error',
      message,
      friendly: friendly(p, code),
      evidence: code.split('\n')[line - 1],
      line,
      col: before[line - 1].length + 1
    })

    const blank = '{}' + code.slice(start + 2, end).replace(/[^\n]/g, ' ')
    clean = clean.slice(0, start) + blank.slice(0, end - start) + clean.slice(end)
    re.lastIndex = end
  }
  return { errz, code: clean }
}

module.exports = cssMethodCheck
