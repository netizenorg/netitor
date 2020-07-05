/* global HTMLElement */
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
// require('codemirror/addon/lint/lint')
// require('codemirror/addon/lint/html-lint')
// require('codemirror/addon/lint/css-lint')
// require('codemirror/addon/lint/javascript-lint')

const htmlLinter = require('./linters/htmlLinter.js')
const jsLinter = require('./linters/jsLinter.js')
const cssLinter = require('./linters/cssLinter.js')

const htmlAttr = require('./edu-data/html-attributes.json')
const htmlEles = require('./edu-data/html-elements.json')
const cssProps = require('./edu-data/css-properties.json')

const CSS = require('./css/main.js')

class Netitor {
  constructor (opts) {
    const langTypes = ['html', 'htmlmixed', 'css', 'javasscript']
    if (typeof opts !== 'object') {
      return this.err('expecing options object as an argument')
    } else if (typeof opts.ele !== 'string') {
      return this.err('expecting an "ele" property with a querySelector string')
    } else if (opts.language && !langTypes.includes(opts.language)) {
      return this.err(`langauge must be either ${langTypes.join(', ')}`)
    }

    this._code = typeof opts.code === 'string' ? opts.code : ''
    this._lang = typeof opts.language === 'string' ? opts.language : 'html'
    this._clrz = typeof opts.theme === 'string' ? opts.theme : 'netizen'
    this._lint = typeof opts.lint === 'boolean' ? opts.lint : true
    this._hint = typeof opts.hint === 'boolean' ? opts.hint : true
    this._auto = typeof opts.autoUpdate === 'boolean' ? opts.autoUpdate : true
    this._adly = typeof opts.updateDelay === 'number' ? opts.updateDelay : 500
    this._ferr = typeof opts.friendlyErr === 'boolean' ? opts.friendlyErr : true

    this.events = {
      'lint-error': null,
      'edu-info': null,
      'hint-select': null,
      'code-update': null
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
  set theme (v) { this._clrz = v; this.cm.setOption('theme', v) }

  get language () { return this._lang }
  set language (v) {
    this._lang = v
    const curEditor = document.querySelector('.CodeMirror.cm-s-netizen')
    if (curEditor instanceof HTMLElement) this.ele.removeChild(curEditor)
    this.cm = null
    this._createEditor()
  }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  SETUP
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  _injectStyles () {
    const style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = CSS
    document.getElementsByTagName('head')[0].appendChild(style)
  }

  _createEditor (ele) {
    if (typeof ele === 'string') {
      this.ele = document.querySelector(ele)
      if (!(this.ele instanceof HTMLElement)) return this.err(ele, 'ele')
    } // else assumes this.ele was already defined

    this.cm = CodeMirror(this.ele, {
      tabSize: 2,
      indentUnit: 2,
      lineNumbers: true,
      matchBrackets: true,
      matchTags: true,
      mode: (this._lang === 'html') ? 'htmlmixed' : this._lang,
      value: this._code,
      theme: this._clrz,
      keyMap: 'sublime',
      autoCloseBrackets: true,
      autoCloseTags: true,
      hintOptions: {
        hint: (cm, options) => this._hinter(cm, options),
        closeOnUnfocus: false,
        completeSingle: false
      },
      configureMouse: (cm, ct, e) => this._mouseAction(cm, ct, e)
    })

    this.cm.on('change', (cm) => this._delayUpdate(cm))
    this.cm.on('cursorActivity', (cm) => this._cursorActivity(cm))
    this.cm.on('mousedown', (cm, e) => {
      // HACK: 'dblclick' doesn't always fire for some reason
      // had to create a custom 'dblclick' event that would
      if (Date.now() < this._lastMouseDown + 400) this._dblclick(cm, e)
      this._lastMouseDown = Date.now()
    })
  }

  _createRenderIframe (opts) {
    if (typeof opts.render === 'string') {
      if (this._lang !== 'html') {
        const m = `langauge is set to ${this._lang}, render option is html only`
        return this.err(m)
      }
      this.render = document.querySelector(opts.render)
      if (this.render) {
        this._updateRenderIframe()
      } else {
        return this.err(opts.render, 'ele')
      }
    }
  }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*  PRIVATE EVENTS
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  _cursorActivity (cm) {
    // TBD: this fires everytime the cursor moves
  }

  _mouseAction (cm, clickType, e) {
    // TBD: fires when mouse is pressed,
    // let's u moidfy behavior of mouse selection and dragging.
    // see "configureMouse" in code mirror manual
    return {}
  }

  _dblclick (cm, e) {
    const pos = cm.getCursor()
    const tok = cm.getTokenAt(pos)
    const lan = cm.getModeAt(pos).name
    const obj = this._eduInfo(tok, lan)
    this.emit('edu-info', obj)
  }

  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•  PRIVATE METHODS
  // •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

  _delayUpdate (cm) {
    // TODO: better debounce logic, so this doesn't run unless there's been an _adly worth of non typing in editor
    clearTimeout(this._autoCallback)
    if (this._prevState !== this.cm.getValue()) {
      this.emit('code-update', this.code)
      this._autoCallback = setTimeout(() => { this._update(cm) }, this._adly)
    }
    this._prevState = this.cm.getValue()
  }

  _update (cm) {
    if (this._hint && this._atEndOfWord(cm)) cm.showHint()
    const errz = (this._lint) ? this._runLint(cm) : []
    if (errz) this.emit('lint-error', errz)
    if (this._auto) this.update()
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
  }

  _atEndOfWord (cm) {
    // check to make sure the cursor is at the end of a lone word
    // otherwise we'll be creating hint menus all the time
    const cursor = cm.getCursor()
    const line = cm.getLine(cursor.line)
    let start = cursor.ch
    let end = cursor.ch

    while (start && /\w/.test(line.charAt(start - 1))) --start
    while (end < line.length && /\w/.test(line.charAt(end))) ++end

    const alone = line.slice(end, end + 1) === '' ||
      line.slice(end, end + 1) === ' '
    const word = line.slice(start, end).toLowerCase()

    return word.length > 0 && alone
  }

  _eduInfo (tok, lan) {
    const o = {
      language: lan === 'xml' ? 'html' : lan,
      data: tok.string,
      type: tok.type === 'tag' ? 'element' : tok.type
    }
    if (o.language === 'html') {
      if (o.type === 'element' && htmlEles[o.data]) o.nfo = htmlEles[o.data]
      if (o.type === 'attribute' && htmlAttr[o.data]) o.nfo = htmlAttr[o.data]
      else if (o.type === 'attribute' && o.data.indexOf('data-') === 0) {
        o.nfo = htmlAttr['data-*']
      }
    } else if (o.language === 'css') {
      if (o.type === 'property' && cssProps[o.data]) o.nfo = cssProps[o.data]
    } else if (o.language === 'javascript') {
      // TODO
      o.nfo = {
        description: `this is a <a href="https://developer.mozilla.org/en-US/docs/Web/javascript" target="_blank">JavaScript</a> ${o.type}, more info coming soon!`
      }
    }
    return o
  }

  _hinter (cm, options) {
    // TODO consider how i might augment default lists (see my old hinters)
    const pos = cm.getCursor()
    const res = cm.getHelpers(pos, 'hint')[0](cm, options)
    const lan = cm.getModeAt(pos).name
    CodeMirror.on(res, 'select', (data) => {
      const language = lan === 'xml' ? 'html' : lan
      this.emit('hint-select', { language, data })
    })
    return res
  }

  _runLint (cm) {
    let errz = []
    if (this._lang === 'css') {
      errz = errz.concat(cssLinter(this.code))
    } else if (this._lang === 'javascript') {
      errz = errz.concat(jsLinter(this.code))
    } else {
      // TODO: parse out CSS && JS to lint separately
      errz = errz.concat(htmlLinter(this.code))
    }
    return errz
  }

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
    if (this._marked && line === 0) this._marked.clear()
    if (typeof line !== 'number') {
      return this.err('highlight expects a number as it\'s first arg')
    } else if (color && typeof color !== 'string') {
      return this.err('highlight expects a color string as it\'s second arg')
    }
    const start = { line: line - 1, ch: 0 }
    const end = { line: line - 1, ch: null }
    const css = color ? `background: ${color}` : 'background: rgba(255,0,0,0.3)'
    if (this._marked) this._marked.clear()
    this._marked = this.cm.markText(start, end, { css })
  }

  update () {
    if (this.iframe) this._updateRenderIframe()
  }
}

window.Netitor = Netitor
