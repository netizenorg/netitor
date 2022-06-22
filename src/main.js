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

// NOTE: see file for comment
// const applyCustomRootURL = require('./applyCustomRootURL.js')
const prependProxyURL = require('./prependProxyURL.js')

const CSS = require('./css/css.js')
const THEMES = require('./css/themes/index.js')

class Netitor {
  constructor (opts) {
    const langTypes = ['html', 'htmlmixed', 'css', 'javascript']
    if (typeof opts !== 'object') {
      return this.err('expecing options object as an argument')
    } else if (typeof opts.ele === 'undefined') {
      return this.err('expecting an "ele" property with a querySelector string')
    } else if (opts.language && !langTypes.includes(opts.language)) {
      return this.err(`language must be either ${langTypes.join(', ')}`)
    }

    this._code = typeof opts.code === 'string' ? opts.code : ''
    this._lang = typeof opts.language === 'string' ? opts.language : 'html'
    this._libr = typeof opts.library === 'string' ? opts.library : false
    this._titl = typeof opts.displayTitle === 'boolean' ? opts.displayTitle : false
    this._clrz = typeof opts.theme === 'string' ? opts.theme : 'dark'
    this._lint = typeof opts.lint === 'boolean' ? opts.lint : true
    this._hint = typeof opts.hint === 'boolean' ? opts.hint : true
    this._bgcl = typeof opts.background === 'boolean' ? opts.background : true
    this._wrap = typeof opts.wrap === 'boolean' ? opts.wrap : false
    this._read = typeof opts.readOnly === 'boolean' ? opts.readOnly : false
    this._auto = typeof opts.autoUpdate === 'boolean' ? opts.autoUpdate : true
    this._adly = typeof opts.updateDelay === 'number' ? opts.updateDelay : 500
    this._ferr = typeof opts.friendlyErr === 'boolean' ? opts.friendlyErr : true
    this._rerr = typeof opts.renderWithErrors === 'boolean'
      ? opts.renderWithErrors : false
    this._ercb = typeof opts.errorCallback === 'function'
      ? opts.errorCallback : null // NOTE: undocumented

    this.events = {
      'lint-error': [],
      'edu-info': [],
      'hint-select': [],
      'code-update': [],
      'render-update': [],
      'cursor-activity': []
    }

    this.themes = THEMES
    this._highlights = [] // highlighted lines
    this._root = null // path to prepend to all src/href attr

    // exception to standard errors
    this._customElements = {}
    this._customAttributes = {}
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

  get wrap () { return this.cm.getOption('lineWrapping') }
  set wrap (v) { this.cm.setOption('lineWrapping', v) }

  get readOnly () { return this.cm.getOption('readOnly') }
  set readOnly (v) { this.cm.setOption('readOnly', v) }

  get language () { return this._lang }
  set language (v) {
    this._lang = v
    this._temp_code_str = this.code
    const curEditor = document.querySelector('.CodeMirror.cm-s-netizen')
    if (curEditor instanceof HTMLElement) this.ele.removeChild(curEditor)
    this.cm = null
    this._createEditor()
    this.code = this._temp_code_str
    delete this._temp_code_str
  }

  get renderWithErrors () { return this._rerr }
  set renderWithErrors (v) { this._rerr = v }

  get displayTitle () { return this._titl }
  set displayTitle (v) { this._titl = v }

  // ................................................. read-only properties

  get hasCodeInHash () { return window.location.hash.indexOf('#code/') === 0 }
  set hasCodeInHash (v) { this.err('hasCodeInHash is read only') }

  get isTidy () { return this._tidy(true) }
  set isTidy (v) { this.err('isTidy is read only') }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  PUBLIC
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  getLine (num) { return this.cm.getLine(num - 1) }

  on (event, callback) {
    if (Object.prototype.hasOwnProperty.call(this.events, event)) {
      this.events[event].push(callback)
    } else this.err(`${event} is not a valid event`)
  }

  remove (event, callback) {
    this.events[event] = this.events[event].filter(f => f !== callback)
  }

  emit (event, data, eventObj) {
    if (Object.prototype.hasOwnProperty.call(this.events, event)) {
      // if (typeof this.events[event] === 'function') this.events[event](data)
      this.events[event].forEach(f => f(data, eventObj))
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

  spotlight (lines, transition) {
    if (typeof lines === 'number') lines = [lines]
    const codeLines = [...this.ele.querySelectorAll('.CodeMirror-code > div')]
    const nums = [...this.ele.querySelectorAll('.CodeMirror-linenumber')]
      .filter(g => g.innerText.length > 0)
    const dict = {}
    nums.forEach((g, i) => { dict[g.innerText] = codeLines[i] })

    const t = transition || 'opacity 500ms cubic-bezier(0.165, 0.84, 0.44, 1)'

    for (const num in dict) {
      const d = dict[num] // code line element
      const n = Number(num) // gutter number
      d.style.transition = t
      if (lines instanceof Array) { // line numbers to spotlight...
        if (lines.includes(n)) setTimeout(() => { d.style.opacity = 1 })
        else setTimeout(() => { d.style.opacity = 0.25 })
      } else setTimeout(() => { d.style.opacity = 1 }) // nothing to spotlight
    }

    if (lines instanceof Array && lines.length > 0) {
      this._spotlighting = true
    } else this._spotlighting = false
  }

  marker (line, color, callback) {
    if (!line) return this.cm.clearGutter('gutter-marker')
    const c = document.createElement('div')
    c.className = 'netitor-gutter-marker'
    c.style.width = '8px'
    c.style.height = '8px'
    c.style.borderRadius = '50%'
    c.style.transform = 'translate(30px, 9px)'
    c.style.backgroundColor = color || 'red'
    if (typeof callback === 'function') {
      c.style.cursor = 'pointer'
      c.addEventListener('click', () => callback())
    }
    this.cm.setGutterMarker(line - 1, 'gutter-marker', c)
    this._repositionGutterMarkers()
    return c
  }

  generateHash () {
    const data = this._encode(this.code)
    return '#code/' + data
  }

  saveToHash () {
    const data = this._encode(this.code)
    window.location.hash = '#code/' + data
    return window.btoa(data)
  }

  loadFromHash () {
    if (this.hasCodeInHash) {
      const code = window.location.hash.substr(6)
      const decoded = this._decode(code)
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

  addCustomRoot (path) {
    if (path === null) {
      this._root = null
      this._delayUpdate(this.cm)
    } else if (typeof path === 'string') {
      this._root = path
      this._delayUpdate(this.cm)
    } else if (typeof path === 'object') {
      this._root = path.base
      this._proxy = path.proxy
      this._delayUpdate(this.cm)
    }
  }

  addCustomElements (obj) {
    let m = 'addCustomElements() expects an object as it\'s argument '
    m += 'with a structure that looks like this: '
    m += 'https://github.com/netizenorg/netitor/blob/master/src/edu-data/html-elements.json'

    if (typeof obj === 'object') {
      for (const ele in obj) {
        this._customElements[ele] = obj[ele]
        // create very generic attribute info for this element's attributes
        this._customElements[ele].attributes.forEach(a => {
          const o = this._customAttributes[a] || {}
          const et = o.elements ? o.elements.text + ',' : ''
          const eh = o.elements ? o.elements.html + ',' : ''
          const dt = o.description ? o.description.text + ','
            : 'This is a custom attribute used by'
          const dh = o.description ? o.description.html + ','
            : 'This is a custom attribute used by'
          o.keyword = { html: a, text: a }
          o.elements = {
            html: `${eh} <code>&lt;${ele}&gt;</code>`, text: `${et} <${ele}>`
          }
          o.description = {
            html: `${dh} <code>&lt;${ele}&gt;</code>`, text: `${dt} <${ele}>`
          }
          this._customAttributes[a] = o
        })
      }
    } else return this.err(m)

    this._delayUpdate(this.cm)
  }

  addCustomAttributes (obj) {
    let m = 'addCustomAttributes() expects an object as it\'s argument '
    m += 'with a structure that looks like this: '
    m += 'https://github.com/netizenorg/netitor/blob/master/src/edu-data/html-attributes.json'

    if (typeof obj === 'object') {
      for (const attr in obj) this._customAttributes[attr] = obj[attr]
    } else return this.err(m)

    this._delayUpdate(this.cm)
  }

  addErrorException (err, specific) {
    if (typeof err === 'string') this._errExceptions.push(err)
    else this._errExceptions.push(this._err2str(err, specific))
    this._delayUpdate(this.cm)
  }

  removeErrorException (err, specific) {
    err = typeof err === 'string' ? err : this._err2str(err, specific)
    const idx = this._errExceptions.indexOf(err)
    if (idx >= 0) this._errExceptions.splice(idx, 1)
    this._delayUpdate(this.cm)
  }

  clearErrorExceptions () {
    this._errExceptions = []
    this._delayUpdate(this.cm)
  }

  update () {
    if (this.iframe) this._updateRenderIframe()
  }

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
      lineWrapping: this._wrap,
      matchBrackets: true,
      matchTags: true,
      mode: (this._lang === 'html') ? 'htmlmixed' : this._lang,
      value: this._code,
      theme: 'netizen',
      keyMap: 'sublime',
      readOnly: this._read,
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

    // this.cm.setOption('extraKeys', {
    //   Tab: function (cm) {
    //     const spaces = Array(cm.getOption('indentUnit') + 1).join(' ')
    //     cm.replaceSelection(spaces)
    //   }
    // })

    this.cm.on('change', (cm) => this._delayUpdate(cm))
    this.cm.on('renderLine', (cm, line, elt) => {
      const wrap = cm.getOption('lineWrapping')
      if (wrap) { // handles "soft warpping"
        const cw = cm.defaultCharWidth()
        const ts = cm.getOption('tabSize')
        const off = CodeMirror.countColumn(line.text, null, ts) * cw
        elt.style.textIndent = '-' + off + 'px'
        elt.style.paddingLeft = (4 + off) + 'px'
      }
    })
    this.cm.on('cursorActivity', (cm) => this._cursorActivity(cm))
    this.cm.on('mousedown', (cm, e) => {
      // HACK: 'dblclick' doesn't always fire for some reason
      // had to create a custom 'dblclick' event that would
      if (Date.now() < this._lastMouseDown + 400) {
        let obj = eduData(cm)
        obj = this._customElementsNfo(obj)
        obj = this._customAttributesNfo(obj)
        this.emit('edu-info', obj, e)
      }
      this._lastMouseDown = Date.now()
    })
    this.cm.on('scroll', (e) => {
      if (this._spotlighting) this.spotlight(null)
      this._repositionGutterMarkers()
    })
    this.ele.addEventListener('mouseup', () => {
      this._cursorActivity(this.cm, true)
    })
  }

  _createRenderIframe (opts) {
    if (typeof opts.render === 'string' || opts.render instanceof HTMLElement) {
      if (this._lang !== 'html' && this._lang !== 'javascript') {
        const m = `language is set to ${this._lang}, render option is html or javascript only`
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

  _cursorActivity (cm, allowSelection) {
    const debounce = 250 // HOW LONG TO WAIT BEFORE REGISTERING NEXT EVENT
    const sel = allowSelection ? true : cm.getSelection() === ''
    if (sel) {
      const p = cm.getCursor()
      const t = cm.getTokenAt(p)
      const m = cm.getModeAt(p)
      const o = {
        line: p.line,
        col: p.ch,
        language: (m.name === 'xml') ? 'html' : m.name,
        data: {
          line: cm.getLine(p.line),
          type: t.type,
          token: t.string,
          tokenColStart: t.start,
          tokenColEnd: t.end
        }
      }
      if (allowSelection) o.selection = cm.getSelection()
      if (this._caDebounce) clearTimeout(this._caDebounce)
      this._caDebounce = setTimeout(() => { this._caHold = false }, debounce)
      if (!this._caHold) this.emit('cursor-activity', o)
      this._caHold = true
    }
  }

  _mouseAction (cm, clickType, e) {
    // TBD: fires when mouse is pressed,
    // let's u moidfy behavior of mouse selection and dragging.
    // see "configureMouse" in code mirror manual
    return {}
  }

  _repositionGutterMarkers () {
    const x = document.querySelector('.CodeMirror-gutter-elt').offsetWidth
    this.ele.querySelectorAll('.netitor-gutter-marker').forEach(m => {
      m.style.transform = `translate(${x}px, 9px)`
    })
  }

  // NOTE: see applyCustomRoot.js
  // _applyCustomRoot (doc, code) {
  //   applyCustomRootURL({
  //     root: this._root,
  //     lang: this.language,
  //     doc: doc,
  //     code: code,
  //     cm: this.cm
  //   })
  // }

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
    this.iframe.contentWindow.addEventListener('error', (err) => {
      if (this._ercb) this._ercb(err)
      return true
    })
    if (!this._root && !this._libr && this._lang !== 'javascript') content.write(this.code)
    // else this._applyCustomRoot(content, this.code) // see applyCustomRoot.js
    else {
      const base = `<base href="${this._root}">`
      let jsopen = ''
      let jsclose = ''

      if (this._lang === 'javascript') {
        if (this._libr) {
          jsopen = '<script src="' + this._libr + '"></script><script>'
        } else {
          jsopen = '<script>'
        }
        jsclose = '</script>'
      }

      let code = base + jsopen + this.code + jsclose

      if (this._proxy) { code = prependProxyURL(code, this._proxy) }

      content.write(code)
    }
    if (this._titl) document.title = content.title
    content.close()
    this._checkForCORSerr()
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
    this.errz = (this._lint && !h) ? await linter(cm) : []
    this.errz = this.errz.length > 0 ? this._rmvExceptions(this.errz) : this.errz
    if (this.errz) this.emit('lint-error', this.errz)
    if (this._auto && !h && this._passThroughErrz(this.errz)) this.update()
  }

  // ~ ~ ~ errz ~ ~ ~

  _passThroughErrz (errz) {
    if (this._rerr) return true
    else return errz.length === 0
  }

  _checkForCORSerr () {
    const emitErr = (path, err) => {
      const lines = this.cm.getValue().split('\n')
      const filtered = lines.filter(s => s.includes(path))
      filtered.forEach(str => {
        const arr = str.split('/')
        const img = arr[arr.length - 1].replace(/"/g, '').replace(/>/g, '')
        if (!this.errz) this.errz = []
        this.errz.push({
          type: 'error',
          language: 'html',
          message: err.toString(),
          friendly: `The ${img} image you are trying to request is on a server that prevents "<a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/403" target="_blank">cross domain requests</a>"`,
          line: lines.indexOf(str) + 1,
          col: 0
        })
      })
      this.emit('lint-error', this.errz)
    }
    // find all img elements, check for CORS errors
    // ex: https://www.iconsdb.com/icons/preview/white/dvd-xxl.png
    const iframe = this.render.querySelector('iframe')
    let doc = iframe.contentWindow || iframe.contentDocument
    if (doc.document) doc = doc.document
    const paths = [...doc.querySelectorAll('img')]
    paths.map(ele => ele.getAttribute('src')).forEach(p => {
      window.fetch(p).then(r => { /* ok */ }).catch(e => emitErr(p, e))
    })
  }

  _err2str (err, specific) {
    const obj = {}
    if (err.language === 'javascript') {
      obj.rule = err.jshint.code
      if (specific) obj.message = err.message
    } else if (err.language === 'css') {
      obj.rule = err.rule
      if (specific) obj.message = err.message
    } else { // html
      obj.rule = err.rule.id
      if (specific) obj.message = err.message
    }
    return JSON.stringify(obj)
  }

  _rmvExceptions (errz) {
    // check for specific error exceptions
    if (this._errExceptions.length > 0) {
      for (let i = errz.length - 1; i >= 0; i--) {
        const s1 = this._errExceptions.includes(this._err2str(errz[i]))
        const s2 = this._errExceptions.includes(this._err2str(errz[i], true))
        if (s1 || s2) errz.splice(i, 1)
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
    const swap = (marker) => {
      const arr = this.code.split('\n')
      const str = arr.find(s => s.includes(marker))
      const idx = arr.indexOf(str)
      const col = str.indexOf(marker)
      this.code = this.code.replace(marker, '')
      return { line: idx, ch: col }
    }

    const cur = '<CURSOR_GOES_HERE>'
    const curStart = '<CURSOR_STARTS_HERE>'
    const curEnd = '<CURSOR_ENDS_HERE>'
    if (typeof data === 'string') data = { text: data }
    if (data.text.includes(cur) && this.code.includes(cur)) {
      const pos = swap(cur)
      cm.setCursor(pos)
    } else if (data.text.includes(curStart) && this.code.includes(curStart)) {
      const start = swap(curStart)
      const end = swap(curEnd)
      cm.setSelection(start, end)
    } else if (data.text.includes('></')) {
      const pos = cm.getCursor()
      const arr = data.text.split('></')
      const col = pos.ch - (arr[1].length + 2)
      cm.setCursor({ line: pos.line, ch: col })
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

  _customAttributesNfo (obj) {
    if (obj.language === 'html' && obj.type === 'attribute') {
      const pos = this.cm.getCursor()
      const tok = this.cm.getTokenAt(pos)
      const tag = tok.state.htmlState.tagName
      const ele = this._customElements[tag]
      const nfo = this._customAttributes[obj.data]
      if (ele && nfo) obj.nfo = nfo
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
      if (p !== 'metadata') {
        const cssVar = `--netizen-${p.replace(/_/g, '-')}`
        const val = this.themes[v][p]
        document.documentElement.style.setProperty(cssVar, val)
      }
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

  _decode (code) { return pako.inflate(window.atob(code), { to: 'string' }) }
  _encode (code) { return window.btoa(pako.deflate(code, { to: 'string' })) }

  prependProxyURL (code, proxy) { return prependProxyURL(code, proxy) }
}

window.Netitor = Netitor
