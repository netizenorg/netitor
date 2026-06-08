class ThemeCreator {
  static loadData (data) {
    const str = ThemeCreator.validate(data)
    if (str) return ThemeCreator.parse(str)
    else return { error: 'no valid data' }
  }

  static async loadFile (path) {
    const res = await window.fetch(path)
    const raw = await res.text()
    const str = ThemeCreator.validate(raw)
    if (str) return ThemeCreator.parse(str)
    else return { error: 'no valid data' }
  }

  static validate (data) {
    const warning = 'that file doesn\'t seem to be a valid netitor theme'
    let str = data
    if (str.includes('base64,')) {
      const b64 = str.split('base64,')[1]
      str = window.atob(b64)
    }

    const valid = str.includes('module.exports = {') &&
      str.includes('metadata:') &&
      str.includes('variable_callee:')

    if (!valid) window.alert(warning)
    return valid ? str : null
  }

  static parse (str) {
    const data = {}

    str.split('\n')
      .filter(s => s.includes(':'))
      .map(s => s.replace(/'/g, '').replace(/,/g, '').trim().split(': '))
      .forEach(a => { data[a[0]] = a[1] })

    const metadata = {
      name: data.name,
      author: data.author,
      description: data.description
    }
    delete data.name
    delete data.author
    delete data.description
    delete data.metadata

    return { metadata, data }
  }

  static download (meta, data) {
    const str = `
module.exports = {
  metadata: {
    name: '${meta.name}',
    author: '${meta.author}',
    description: '${meta.description}'
  },
  /* THEME STARTS HERE */
  text: '${data.text}',
  background: '${data.background}',
  /* CODE SYNTAX COLORS */
  meta: '${data.meta}',
  tag: '${data.tag}',
  tag_bracket: '${data.tag_bracket}',
  attribute: '${data.attribute}',
  qualifier: '${data.qualifier}',
  comment: '${data.comment}',
  variable: '${data.variable}',
  variable_2: '${data.variable_2}',
  variable_3: '${data.variable_3}',
  variable_callee: '${data.variable_callee}',
  def: '${data.def}',
  builtin: '${data.builtin}',
  property: '${data.property}',
  keyword: '${data.keyword}',
  string: '${data.string}',
  string_2: '${data.string_2}',
  number: '${data.number}',
  atom: '${data.atom}',
  operator: '${data.operator}',
  /* MISC EDITOR COLORS */
  line_numbers: '${data.line_numbers}',
  active_line_bg: '${data.active_line_bg}',
  selected: '${data.selected}',
  /* MATCHING TAG/BRACKET INDICATORS */
  match_color: '${data.match_color}',
  match_border: '${data.match_border}',
  /* AUTOCOMPLETE/HINT MENU SELECTED ITEM */
  hint_color: '${data.hint_color}',
  hint_bg: '${data.hint_bg}',
  hint_shadow: '${data.hint_shadow}'
}`
    const b64 = window.btoa(str)
    const uri = `data:application/x-javascript;base64,${b64}`
    const a = document.createElement('a')
    a.setAttribute('download', `${meta.name}.js`)
    a.setAttribute('href', uri)
    a.click()
    a.remove()
  }
}

window.ThemeCreator = ThemeCreator
