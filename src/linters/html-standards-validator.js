const htmlEles = require('../edu-data/html-elements.json')
const htmlAttr = require('../edu-data/html-attributes.json')
const stringSimilarity = require('string-similarity')

class HTMLStandards {
  static checkSpelling (str, type) {
    const list = type === 'elements'
      ? Object.keys(htmlEles) : Object.keys(htmlAttr)
    const matches = stringSimilarity.findBestMatch(str, list)
    if (matches.bestMatch.rating >= 0.5) return matches.bestMatch.target
    else return null
  }

  static verifyStandardElements (doc, code) {
    const language = 'html'
    const errz = []
    let line = 0
    let col = 0
    const type = 'warning'
    const rule = {
      id: 'standard-elements',
      description: 'Element must be standard HTML',
      link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'
    }

    for (let i = 0; i < doc.all.length; i++) {
      const name = doc.all[i].localName
      const valid = Object.prototype.hasOwnProperty.call(htmlEles, name)
      const message = `<${name}> is not a standard HTML element`
      const htmlMsg = `<code>&lt;${name}&gt;</code> is not a standard HTML <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element" target="_blank">element</a>`
      if (!valid) {
        const customElement = (
          name.includes('-') &&
          name.indexOf('-') !== 0 &&
          name.indexOf('-') !== name.length - 1
        )

        const lines = code.split('\n')
        const mch = lines.filter(str => str.toLowerCase().indexOf(name) >= 0)[0]
        line = lines.indexOf(mch) + 1
        if (mch) col = mch.indexOf(name)

        const smatch = this.checkSpelling(name, 'elements')
        const suggest = smatch ? `Did you mean to write <strong>"${smatch}"</strong>? ` : ''

        const fmsg = customElement
          ? 'But it may be a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" target="_blank">custom element</a>, assuming you\'ve imported this custom element yourself using a library or your own custom code.'
          : 'This might not break your HTML page, but regardless is probably not doing what you might be expecting.'

        const friendly = `${htmlMsg}. ${suggest}${fmsg}`
        const evidence = name
        errz.push({ language, type, message, friendly, evidence, col, line, rule })
      }
    }
    return errz
  }

  static verifyStandardAttributes (doc, code) {
    const errz = []
    let line = 0
    let col = 0
    const type = 'warning'
    const rule = {
      id: 'standard-attributes',
      description: 'Attribute must be standard HTML',
      link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes'
    }

    for (let i = 0; i < doc.all.length; i++) {
      const element = doc.all[i].localName
      const language = 'html'
      if (Object.prototype.hasOwnProperty.call(htmlEles, element)) {
        const attrs = doc.all[i].attributes
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i].localName
          const evidence = attr
          const message = `${attr} is not a standard HTML attribute`
          const htmlMsg = `<code>${attr}</code> is not a standard HTML <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes" target="_blank">attribute</a>`
          const lines = code.split('\n')
          const match = lines.filter(str => str.toLowerCase().indexOf(attr) >= 0)[0]
          line = lines.indexOf(match) + 1
          if (match) col = match.indexOf(attr)

          if (!Object.keys(htmlAttr).includes(attr)) {
            const smatch = this.checkSpelling(attr, 'attributes')
            const suggest = smatch
              ? `Check your spelling, did you mean to write <strong>"${smatch}"</strong>? ` : ''

            const reEvent = /^on(unload|message|submit|select|scroll|resize|mouseover|mouseout|mousemove|mouseleave|mouseenter|mousedown|load|keyup|keypress|keydown|focus|dblclick|click|change|blur|error)$/i
            if (attr.indexOf('data-') !== 0 && !reEvent.test(attr)) {
              const fmsg = `If you were trying to create your own <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" target="_blank">custom data attribute</a> you need to write it like this: <code>data-${attr}</code>`
              const friendly = `${htmlMsg}. ${suggest}${fmsg}`

              errz.push({ language, type, message, friendly, evidence, col, line, rule })
            }
          } else if (htmlAttr[attr].status !== 'standard') {
            let fmsg = 'It may be depreciated or obsolete.'
            if (htmlAttr[attr].status === 'experimental') {
              fmsg = `<code>${attr}</code> is an experimental attribute, it may not work on all browsers. If browser compatability is important to you make sure you test your work on different browsers to be safe (or maybe avoid using it).`
            } else if (htmlAttr[attr].status === 'obsolete') {
              if (htmlAttr[attr].note) fmsg += htmlAttr[attr].note.html
            }
            const friendly = `${htmlMsg}. ${fmsg}`

            errz.push({ language, type, message, friendly, evidence, col, line, rule })
          }
        }
      }
    }
    return errz
  }

  static verifyTrailingSlashes (doc, code) {
    const errz = []
    const language = 'html'
    const type = 'warning'
    const message = 'void elements should not have trailing slashes'
    const friendly = 'It used to be common to include "<a href="https://developer.mozilla.org/en-US/docs/MDN/Contribute/Guidelines/Code_guidelines/HTML#Trailing_slashes" target="_blank">trailing slashes</a>" in void elements (aka singleton elements) like <code>&lt;br/&gt;</code> or <code>&lt;img/&gt;</code> but these days we avoid them, it\'s better to write them like <code>&lt;br&gt;</code> and <code>&lt;img&gt;</code> '
    const rule = {
      id: 'avoid-trailing-slashes',
      description: 'Don\'t include trailing slashes for empty elements',
      link: 'https://developer.mozilla.org/en-US/docs/MDN/Contribute/Guidelines/Code_guidelines/HTML#Trailing_slashes'
    }
    const lines = code.split('\n')
    lines.filter(str => str.indexOf('/>') >= 0).forEach(match => {
      console.log(match)
      const evidence = match
      const line = lines.indexOf(match) + 1
      const col = match.indexOf('/>')
      errz.push({ language, type, message, friendly, evidence, col, line, rule })
    })

    return errz
  }

  static verifyLanAttr (doc, code) {
    const errz = []
    const type = 'warning'
    const language = 'html'
    const message = '<html> element should have lang attribute'
    const friendly = 'Your <code>&lt;html&gt;</code> element should include a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang" target="_blank">lang</a> attribute for accessibility and search enginges, for example <code>&lt;html lang="en-US"&gt;</code>'
    const rule = {
      id: 'declare-document-language',
      description: 'Set document language',
      link: 'https://developer.mozilla.org/en-US/docs/MDN/Contribute/Guidelines/Code_guidelines/HTML#Document_language'
    }

    if (code.indexOf('<html') > -1 && code.indexOf('</html>') > -1) {
      if (!doc.documentElement.attributes.lang) {
        const lines = code.split('\n')
        const match = lines
          .filter(str => str.toLowerCase().indexOf('<html') >= 0)[0]
        const evidence = match
        const line = lines.indexOf(match) + 1
        const col = match.indexOf('<html')
        errz.push({ language, type, message, friendly, evidence, col, line, rule })
      }
    }

    return errz
  }

  static verifyCharset (doc, code) {
    const errz = []
    const type = 'warning'
    const language = 'html'
    const message = '<meata charset=""> must be present in <head> tag.'
    const friendly = 'You are missing a <a href="https://developer.mozilla.org/en-US/docs/Glossary/character_encoding" target="_blank"><code>&lt;meta charset="utf-8"&gt;</code></a> element in your <code>&lt;head&gt;</code>. While it is not technically required, it\'s highly recommended. Use UTF-8 unless you have a very good reason not to; it will cover your character needs pretty much regardless of what language you are using in your document. In addition, you should always specify the characterset as early as possible within your HTML\'s <code>&lt;head&gt;</code>, as it protects against a rather nasty <a href="https://support.microsoft.com/en-us/help/928847/internet-explorer-uses-the-wrong-character-set-when-it-renders-an-html" target="_blank">Internet Explorer security vulnerability</a>.'
    const rule = {
      id: 'declare-document-charset',
      description: 'Set document language',
      link: 'https://developer.mozilla.org/en-US/docs/MDN/Contribute/Guidelines/Code_guidelines/HTML#Document_characterset'
    }

    if (code.indexOf('<head') > -1 && code.indexOf('</head>') > -1) {
      let hasCharset = false
      for (let i = 0; i < doc.head.children.length; i++) {
        const child = doc.head.children[i]
        if (child.localName.toLowerCase() === 'meta') {
          if (child.attributes.charset) {
            hasCharset = true
            break
          }
        }
      }

      if (!hasCharset) {
        const lines = code.split('\n')
        const match = lines
          .filter(str => str.toLowerCase().indexOf('<head') >= 0)[0]
        const evidence = ''
        const line = lines.indexOf(match) + 1
        const col = match.indexOf('<head')
        errz.push({ language, type, message, friendly, evidence, col, line, rule })
      }
    }

    return errz
  }

  static checkRule (rules, rule) {
    return Object.prototype.hasOwnProperty.call(rules, rule)
  }

  static verify (code, rules) {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    let errz = []

    if (this.checkRule(rules, 'standard-elements')) {
      errz = errz.concat(this.verifyStandardElements(doc, code))
    }

    if (this.checkRule(rules, 'standard-attributes')) {
      errz = errz.concat(this.verifyStandardAttributes(doc, code))
    }

    if (this.checkRule(rules, 'avoid-trailing-slashes')) {
      errz = errz.concat(this.verifyTrailingSlashes(doc, code))
    }

    if (this.checkRule(rules, 'declare-document-language')) {
      errz = errz.concat(this.verifyLanAttr(doc, code))
    }

    if (this.checkRule(rules, 'declare-document-charset')) {
      errz = errz.concat(this.verifyCharset(doc, code))
    }

    return errz
  }
}

module.exports = HTMLStandards
