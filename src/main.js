/* global HTMLElement */
const pako = require('pako')
const stringSimilarity = require('string-similarity')
const beautifyJS = require('js-beautify')
const beautifyCSS = require('js-beautify').css
const beautifyHTML = require('js-beautify').html
const CodeMirror = require('codemirror')
require('codemirror/mode/htmlmixed/htmlmixed')
require('codemirror/keymap/sublime')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/edit/matchtags')
require('codemirror/addon/edit/closetag')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/comment/comment')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/xml-hint')
require('codemirror/addon/hint/html-hint')
require('codemirror/addon/hint/css-hint')
require('codemirror/addon/hint/javascript-hint')

const linter = require('./linters/index.js')
const hinter = require('./hinters/index.js')
const eduData = require('./edu-data/index.js')

const CSS = require('./css/css.js')
const THEMES = require('./css/themes/index.js')

class Netitor {
  constructor (opts) {
    const langTypes = ['html', 'htmlmixed', 'css', 'javasscript']
    if (typeof opts !== 'object') {
      return this.err('expecing options object as an argument')
    } else if (typeof opts.ele === 'undefined') {
      return this.err('expecting an "ele" property with a querySelector string')
    } else if (opts.language && !langTypes.includes(opts.language)) {
      return this.err(`langauge must be either ${langTypes.join(', ')}`)
    }

    this._code = typeof opts.code === 'string' ? opts.code : ''
    this._lang = typeof opts.language === 'string' ? opts.language : 'html'
    this._clrz = typeof opts.theme === 'string' ? opts.theme : 'dark'
    this._lint = typeof opts.lint === 'boolean' ? opts.lint : true
    this._hint = typeof opts.hint === 'boolean' ? opts.hint : true
    this._bgcl = typeof opts.background === 'boolean' ? opts.background : true
    this._auto = typeof opts.autoUpdate === 'boolean' ? opts.autoUpdate : true
    this._adly = typeof opts.updateDelay === 'number' ? opts.updateDelay : 500
    this._ferr = typeof opts.friendlyErr === 'boolean' ? opts.friendlyErr : true
    this._rerr = typeof opts.renderWithErrors === 'boolean'
      ? opts.renderWithErrors : false

    this.events = {
      'lint-error': null,
      'edu-info': null,
      'hint-select': null,
      'code-update': null,
      'render-update': null,
      'cursor-activity': null
    }

    this.themes = THEMES
    this._highlights = [] // highlighted lines

    // exception to standard errors
    this._customElements = {}
    this._errExceptions = []

    this.edu = {
      html: {
        attributes: require('./edu-data/html-attributes.json'),
        elements: require('./edu-data/html-elements.json')
      },
      css: {
        'at-rules': require('./edu-data/css-at-rules.json'),
        colors: require('./edu-data/css-colors.json'),
        'data-types': require('./edu-data/css-data-types.json'),
        functions: require('./edu-data/css-functions.json'),
        properties: require('./edu-data/css-properties.json'),
        'pseudo-classes': require('./edu-data/css-pseudo-classes.json'),
        'pseudo-elements': require('./edu-data/css-pseudo-elements.json'),
        units: require('./edu-data/css-units.json')
      },
      js: {
        arrays: require('./edu-data/js-arrays.json'),
        canvas: require('./edu-data/js-canvas.json'),
        date: require('./edu-data/js-date.json'),
        document: require('./edu-data/js-document.json'),
        'dom-node': require('./edu-data/js-dom-node.json'),
        events: require('./edu-data/js-events.json'),
        // history: require('./edu-data/js-history.json'),
        location: require('./edu-data/js-location.json'),
        math: require('./edu-data/js-math.json'),
        navigator: require('./edu-data/js-navigator.json'),
        number: require('./edu-data/js-number.json'),
        refs: require('./edu-data/js-refs.json'),
        string: require('./edu-data/js-string.json'),
        window: require('./edu-data/js-window.json')
      }
    }

    this._injectStyles()
    this._createEditor(opts.ele)
    this._createRenderIframe(opts)
  }

  err (m, type) {
    if (type === 'ele') {
      console.error('Netitor:', 'no match for this querySelector:', m)
    } else {
      console.error('Netitor:', m)
    }
  }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸  PROPERTIES

  get code () { return this.cm.getValue() }
  set code (v) { this.cm.setValue(v) }

  get lint () { return this._lint }
  set lint (v) { this._lint = v }

  get hint () { return this._hint }
  set hint (v) { this._hint = v }

  get autoUpdate () { return this._auto }
  set autoUpdate (v) { this._auto = v }

  get updateDelay () { return this._adly }
  set updateDelay (v) { this._adly = v }

  get friendlyErr () { return this._ferr }
  set friendlyErr (v) { this._ferr = v }

  get theme () { return this._clrz }
  set theme (v) { this._updateTheme(v) }

  get background () { return this._bgcl }
  set background (v) { this._updateBG(v) }

  get language () { return this._lang }
  set language (v) {
    this._lang = v
    const curEditor = document.querySelector('.CodeMirror.cm-s-netizen')
    if (curEditor instanceof HTMLElement) this.ele.removeChild(curEditor)
    this.cm = null
    this._createEditor()
  }

  get renderWithErrors () { return this._rerr }
  set renderWithErrors (v) { this._rerr = v }

  // ................................................. read-only properties

  get hasCodeInHash () { return window.location.hash.indexOf('#code/') === 0 }
  set hasCodeInHash (v) { this.err('hasCodeInHash is read only') }

  get isTidy () { return this._tidy(true) }
  set isTidy (v) { this.err('isTidy is read only') }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  SETUP
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  _injectStyles () {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = CSS
    document.getElementsByTagName('head')[0].appendChild(style)
    // update CSS variables to match chosen theme
    this._updateTheme(this._clrz)
    this._updateBG(this._bgcl)
  }

  _createEditor (ele) {
    if (typeof ele === 'string') {
      this.ele = document.querySelector(ele)
      if (!(this.ele instanceof HTMLElement)) return this.err(ele, 'ele')
    } else if (ele instanceof HTMLElement) {
      this.ele = ele
    } // else assumes this.ele was already defined

    this.cm = CodeMirror(this.ele, {
      tabSize: 2,
      indentUnit: 2,
      indentWithTabs: false,
      lineNumbers: true,
      matchBrackets: true,
      matchTags: true,
      mode: (this._lang === 'html') ? 'htmlmixed' : this._lang,
      value: this._code,
      theme: 'netizen',
      keyMap: 'sublime',
      autoCloseBrackets: true,
      autoCloseTags: true,
      gutters: ['gutter-marker', 'CodeMirror-linenumbers'],
      hintOptions: {
        hint: (cm, options) => this._hinter(cm, options),
        closeOnUnfocus: true,
        completeSingle: false
      },
      configureMouse: (cm, ct, e) => this._mouseAction(cm, ct, e)
    })

    this.cm.setOption('extraKeys', {
      Tab: function (cm) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
        cm.replaceSelection(spaces)
      }
    })

    this.cm.on('change', (cm) => this._delayUpdate(cm))
    this.cm.on('cursorActivity', (cm) => this._cursorActivity(cm))
    this.cm.on('mousedown', (cm, e) => {
      // HACK: 'dblclick' doesn't always fire for some reason
      // had to create a custom 'dblclick' event that would
      if (Date.now() < this._lastMouseDown + 400) {
        let obj = eduData(cm)
        obj = this._customElementsNfo(obj)
        this.emit('edu-info', obj)
      }
      this._lastMouseDown = Date.now()
    })
  }

  _createRenderIframe (opts) {
    if (typeof opts.render === 'string' || opts.render instanceof HTMLElement) {
      if (this._lang !== 'html') {
        const m = `langauge is set to ${this._lang}, render option is html only`
        return this.err(m)
      }

      if (opts.render instanceof HTMLElement) this.render = opts.render
      else this.render = document.querySelector(opts.render)

      if (this.render) {
        this._updateRenderIframe()
      } else {
        return this.err(opts.render, 'ele')
      }
    }
  }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.• PRIVATE
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  _cursorActivity (cm) {
    if (cm.getSelection() === '') {
      const p = cm.getCursor()
      const t = cm.getTokenAt(p)
      const m = cm.getModeAt(p)
      this.emit('cursor-activity', {
        line: p.line,
        col: p.ch,
        langauge: (m.name === 'xml') ? 'html' : m.name,
        data: {
          line: cm.getLine(p.line),
          type: t.type,
          token: t.string,
          tokenColStart: t.start,
          tokenColEnd: t.end
        }
      })
    }
  }

  _mouseAction (cm, clickType, e) {
    // TBD: fires when mouse is pressed,
    // let's u moidfy behavior of mouse selection and dragging.
    // see "configureMouse" in code mirror manual
    return {}
  }

  _updateRenderIframe () {
    // TODO https://stackoverflow.com/questions/62546174/clear-iframe-content-including-its-js-global-scope
    if (this.iframe) this.iframe.parentElement.removeChild(this.iframe)
    this.iframe = document.createElement('iframe')
    this.iframe.style.width = '100%'
    this.iframe.style.height = '100%'
    this.iframe.style.border = '0'
    this.render.appendChild(this.iframe)
    const content = this.iframe.contentDocument || this.iframe.contentWindow.document
    content.open()
    content.write(this.code)
    content.close()
    this.emit('render-update')
  }

  _delayUpdate (cm) {
    // TODO: i feel like this could have better debounce logic,
    // maybe doesn't run unless there's been an _adly worth of stillness
    // (ie. nothing has been typed) in the editor?
    clearTimeout(this._autoCallback)
    this.emit('code-update', this.code)
    this._autoCallback = setTimeout(() => { this._update(cm) }, this._adly)
    this._prevState = this.cm.getValue()
  }

  async _update (cm) {
    const h = document.querySelector('.CodeMirror-hints')
    if (this._hint && this._shouldHint(cm) && !h) cm.showHint()
    let errz = (this._lint && !h) ? await linter(cm) : []
    errz = errz.length > 0 ? this._rmvExceptions(errz) : errz
    if (errz) this.emit('lint-error', errz)
    if (this._auto && !h && this._passThroughErrz(errz)) this.update()
  }

  // ~ ~ ~ errz ~ ~ ~

  _passThroughErrz (errz) {
    if (this._rerr) return true
    else return errz.length === 0
  }

  _err2str (err) {
    const obj = {}
    if (err.jshint) {
      obj.code = err.jshint.code
      obj.evidence = err.jshint.evidence.trim()
    } else {
      obj.rule = err.rule
      obj.message = err.message
    }
    return JSON.stringify(obj)
  }

  _rmvExceptions (errz) {
    // check for specific error exceptions
    if (this._errExceptions.length > 0) {
      for (let i = errz.length - 1; i >= 0; i--) {
        const str = this._err2str(errz[i])
        if (this._errExceptions.includes(str)) errz.splice(i, 1)
      }
    }
    // then check for custom elements
    const eles = Object.keys(this._customElements)
    if (eles.length > 0) {
      for (let i = errz.length - 1; i >= 0; i--) {
        if (errz[i].rule && errz[i].rule.id === 'standard-elements') {
          if (eles.includes(errz[i].evidence)) errz.splice(i, 1)
        }
      }
    }
    return errz
  }

  // ~ ~ ~ hinting ~ ~ ~

  _shouldHint (cm) {
    const pos = cm.getCursor()
    const tok = cm.getTokenAt(pos)
    const line = cm.getLine(pos.line)
    // check to make sure user is actually typing something
    const typing = tok.string.replace(/\s/g, '').length > 0
    const nextChar = line.slice(tok.end, tok.end + 1)
    // check to make sure the cursor is at the end of a lone word
    // otherwise we'll be creating hint menus all the time
    const alone = nextChar === '' || nextChar === ' '
    // allow hinting when inside parens
    const paren = nextChar === ')'
    // check to see if the cursor is inside of a tag (for attributes)
    const tagAttr = nextChar === '>'
    // check for JS event args (rest of logic in jsHinter)
    const jsArg = cm.getModeAt(pos).name === 'javascript' && nextChar === ','

    return typing && (alone || paren || tagAttr || jsArg)
  }

  _placeHintCursor (cm, data) {
    const cur = '<CURSOR_GOES_HERE>'
    if (data.text.includes(cur) && this.code.includes(cur)) {
      const arr = this.code.split('\n')
      const str = arr.find(s => s.includes(cur))
      const idx = arr.indexOf(str)
      const col = str.indexOf(cur)
      this.code = this.code.replace(cur, '')
      cm.setCursor({ line: idx, ch: col })
    }
  }

  _hinter (cm, options) {
    const pos = cm.getCursor()
    const lan = cm.getModeAt(pos).name
    const res = hinter(cm, options)
    if (!res) return null
    if (!res.list) res.list = []
    CodeMirror.on(res, 'close', () => { this._delayUpdate(cm) })
    CodeMirror.on(res, 'pick', (d) => { this._placeHintCursor(cm, d) })
    CodeMirror.on(res, 'select', (data) => {
      const language = lan === 'xml' ? 'html' : lan
      this.emit('hint-select', { language, data })
    })
    return res
  }

  // ~ ~ ~ misc ~ ~ ~

  _customElementsNfo (obj) { // ...for edu-info
    if (obj.language === 'html' && obj.type === 'element' && !obj.nfo) {
      if (this._customElements[obj.data]) {
        obj.nfo = this._customElements[obj.data]
      }
    }
    return obj
  }

  _tidy (checkOnly) {
    const o = {
      indent_size: 2,
      indent_inner_html: true,
      extra_liners: []
    }

    const clean = (this._lang === 'css')
      ? beautifyCSS(this.code, o) : (this._lang === 'javascript')
        ? beautifyJS(this.code, o) : beautifyHTML(this.code, o)

    if (!checkOnly) this.code = clean
    return this.code === clean
  }

  _updateTheme (v) {
    if (!this.themes[v]) return this.err(`${v} is not a valid theme`)

    this._clrz = v
    for (const p in this.themes[v]) {
      const cssVar = `--netizen-${p.replace(/_/g, '-')}`
      const val = this.themes[v][p]
      document.documentElement.style.setProperty(cssVar, val)
    }
  }

  _updateBG (v) {
    if (typeof v !== 'boolean') return this.err('background must be a boolean')

    this._bgcl = v
    const bg = this.themes[this.theme].background
    const val = (this._bgcl) ? bg : bg + '00'
    document.documentElement.style.setProperty('--netizen-background', val)
  }

  _compareTwoStrings (a, b) { return stringSimilarity.compareTwoStrings(a, b) }
  _findBestMatch (a, b) { return stringSimilarity.findBestMatch(a, b) }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  PUBLIC
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  on (event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.events, event)) {
      this.events[event] = callback
    } else this.err(`${event} is not a valid event`)
  }

  emit (event, data) {
    if (Object.prototype.hasOwnProperty.call(this.events, event)) {
      if (typeof this.events[event] === 'function') this.events[event](data)
    } else this.err(`${event} is not a valid event`)
  }

  highlight (line, color) {
    if (!line) {
      this._highlights.forEach((m) => m.clear())
      this._highlights = []
      return
    }

    // ~ ~ ~ [start of error checking]
    if (typeof line === 'object') {
      if (typeof line.startLine !== 'number') {
        const m = 'to include a startLine propery set to a number'
        return this.err('highlight expects it\'s options argument ' + m)
      }
    } else if (typeof line !== 'number') {
      return this.err('highlight expects a number as it\'s first arg')
    }
    if (color && typeof color !== 'string') {
      return this.err('highlight expects third arg to be a css color value')
    }
    // ~ ~ ~ [end of error checking]

    if (typeof line === 'object' && line.color) color = line.color
    const start = {
      line: (typeof line === 'object') ? line.startLine - 1 : line - 1,
      ch: (typeof line === 'object' && line.startCol) ? line.startCol : 0
    }
    const end = {
      line: (typeof line === 'object' && line.endLine)
        ? line.endLine - 1 : start.line,
      ch: (typeof line === 'object' && line.endCol) ? line.endCol : null
    }
    const css = color ? `background: ${color}` : 'background: rgba(255,0,0,0.3)'
    this._highlights.push(this.cm.markText(start, end, { css }))
  }

  marker (line, color) {
    if (!line) return this.cm.clearGutter('gutter-marker')
    const c = document.createElement('div')
    c.style.width = '12px'
    c.style.height = '12px'
    c.style.borderRadius = '50%'
    c.style.transform = 'translate(29px, 6px)'
    c.style.backgroundColor = color || 'red'
    this.cm.setGutterMarker(line - 1, 'gutter-marker', c)
  }

  saveToHash () {
    const data = pako.deflate(this.code, { to: 'string' })
    window.location.hash = '#code/' + window.btoa(data)
    return window.btoa(data)
  }

  loadFromHash () {
    if (this.hasCodeInHash) {
      const code = window.location.hash.substr(6)
      const decoded = pako.inflate(window.atob(code), { to: 'string' })
      this.code = decoded
      return decoded
    } else {
      this.err('.decodeFromURL() did not find any #code in the current URL')
    }
  }

  loadFromURL (url) {
    if (!url) {
      return this.err('loadFromURL() expects a url to a raw text/html file')
    }
    window.fetch(url, { method: 'GET' })
      .then(res => res.text())
      .then(text => { this.code = text })
      .catch(err => this.err(err))
  }

  tidy () { this._tidy() }

  addCustomElements (obj) {
    let m = 'addCustomElements() expects an object as it\'s argument '
    m += 'with a structure that looks like this: '
    m += 'https://github.com/netizenorg/netitor/blob/master/src/edu-data/html-elements.json'

    if (typeof obj === 'object') {
      for (const ele in obj) this._customElements[ele] = obj[ele]
    } else return this.err(m)

    this._delayUpdate(this.cm)
  }

  addErrorException (err) {
    this._errExceptions.push(this._err2str(err))
    this._delayUpdate(this.cm)
  }

  clearErrorExceptions () {
    this._errExceptions = []
    this._delayUpdate(this.cm)
  }

  update () {
    if (this.iframe) this._updateRenderIframe()
  }
}

window.Netitor = Netitor
