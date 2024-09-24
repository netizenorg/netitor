const htmlEles = require('../edu-data/html/elements.json')
const svgEles = require('../edu-data/html/svg-elements.json')
const htmlAttr = require('../edu-data/html/attributes.json')
const svgAttr = require('../edu-data/html/svg-attributes.json')
const stringSimilarity = require('string-similarity')
const allEles = { ...svgEles, ...htmlEles }
const allAttr = { ...svgAttr, ...htmlAttr }

class HTMLStandards {
  static checkSVGcontext (editor, lineNumber, colNumber = 0) {
    const pos = { line: lineNumber, ch: colNumber }
    const token = editor.getTokenAt(pos)
    const state = token.state
    let context = state.context || state.htmlState.context
    while (context) {
      if (context.tagName && context.tagName.toLowerCase() === 'svg') {
        return true
      }
      context = context.prev
    }
    return false
  }

  static checkSpelling (str, type) {
    const list = type === 'elements'
      ? Object.keys(allEles) : Object.keys(allAttr)
    const matches = stringSimilarity.findBestMatch(str, list)
    if (matches.bestMatch.rating >= 0.5) return matches.bestMatch.target
    else return null
  }

  static verifyStandardElements (doc, code, cm) {
    const language = 'html'
    const errz = []
    const type = 'warning'
    const rule = {
      id: 'standard-elements',
      description: 'Element must be standard HTML',
      link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'
    }

    // Split the code into lines once
    const lines = code.split('\n')

    // Create a map to track the number of times each element name has been processed
    const elementCountMap = {}

    for (let i = 0; i < doc.all.length; i++) {
      const element = doc.all[i]
      const name = element.localName.toLowerCase()

      // Initialize count for this element name if not already done
      if (!elementCountMap[name]) {
        elementCountMap[name] = 0
      }

      // Increment the count for this element
      elementCountMap[name]++

      const isSVG = Object.prototype.hasOwnProperty.call(svgEles, name)
      const isHTML = Object.prototype.hasOwnProperty.call(htmlEles, name)
      const valid = Object.keys(allEles).map(ele => ele.toLowerCase()).includes(name.toLowerCase())
      const message = `<${name}> is not a standard HTML or SVG element`
      const htmlMsg = `<code>&lt;${name}&gt;</code> is not a standard <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element" target="_blank">HTML</a> or <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element" target="_blank">SVG</a> element`

      if (!valid) {
        const customElement = (
          name.includes('-') &&
          name.indexOf('-') !== 0 &&
          name.indexOf('-') !== name.length - 1
        )

        // Find all lines that contain the element's opening tag
        const matchingLines = lines
          .map((str, index) => ({ str: str.toLowerCase(), index }))
          .filter(lineObj => lineObj.str.includes(`<${name}`))

        // Get the specific occurrence based on the count
        const occurrenceIndex = elementCountMap[name] - 1
        const mchObj = matchingLines[occurrenceIndex]

        if (!mchObj) {
          console.warn(`Could not find a matching line for <${name}> occurrence ${elementCountMap[name]}`)
          continue // Skip if no matching line is found
        }

        const mch = lines[mchObj.index]
        const line = mchObj.index + 1 // Convert to 1-based line number
        const col = mch.indexOf(name)

        const smatch = this.checkSpelling(name, 'elements')
        const suggest = smatch ? `Did you mean to write <strong>"${smatch}"</strong>? ` : ''

        const fmsg = customElement
          ? 'But it may be a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" target="_blank">custom element</a>, assuming you\'ve imported this custom element yourself using a library or your own custom code.'
          : 'This might not break your HTML page, but regardless is probably not doing what you might be expecting.'

        const friendly = `${htmlMsg}. ${suggest}${fmsg}`
        const evidence = name
        errz.push({ language, type, message, friendly, evidence, col, line, rule })
      } else if (isSVG && !isHTML && name !== 'svg') {
        // Ensure SVG elements are within <svg> tags
        // .........................................
        // first, find all lines that contain the element's opening tag
        const matchingLines = lines
          .map((str, index) => ({ str: str.toLowerCase(), index }))
          .filter(lineObj => lineObj.str.includes(`<${name}`))

        // Get the specific occurrence based on the count
        const occurrenceIndex = elementCountMap[name] - 1
        const mchObj = matchingLines[occurrenceIndex]

        if (!mchObj) {
          console.warn(`Could not find a matching line for <${name}> occurrence ${elementCountMap[name]}`)
          continue // Skip if no matching line is found
        }

        const mch = lines[mchObj.index]
        const line = mchObj.index + 1 // Convert to 1-based line number
        const col = mch.indexOf(name)

        const inContext = this.checkSVGcontext(cm, line - 1, col) // Adjust to 0-based

        const evidence = name

        if (!inContext) {
          const friendly = `<code>&lt;${name}&gt;</code> is an <a href="https://developer.mozilla.org/en-US/docs/Web/SVG/Element" target="_blank">SVG element</a>, which means it must be defined within an opening <code>&lt;svg&gt;</code> and closing <code>&lt;/svg&gt;</code> tag to render properly.`
          errz.push({ language, type, message, friendly, evidence, col, line, rule })
        }
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
      if (Object.prototype.hasOwnProperty.call(allEles, element)) {
        const attrs = doc.all[i].attributes
        for (let i = 0; i < attrs.length; i++) {
          let attr = attrs[i].localName
          const isSVG = Object.prototype.hasOwnProperty.call(svgAttr, attr.toLowerCase())
          const isHTML = Object.prototype.hasOwnProperty.call(htmlAttr, attr.toLowerCase())
          if (isSVG && !isHTML) attr = attr.toLowerCase()

          const evidence = attr
          const message = `${attr} is not a standard HTML or SVG attribute`
          const isHTMLele = Object.prototype.hasOwnProperty.call(htmlEles, attr)
          const isSVGele = Object.prototype.hasOwnProperty.call(svgEles, attr)
          const htmlMsg = `<code>${attr}</code> is not a standard HTML or SVG <i><a href="https://developer.mozilla.org/en-US/docs/Glossary/Attribute" target="_blank">attribute</a></i>`
          const isEle = (isHTMLele || isSVGele) ? `, but it is an ${isHTML ? 'HTML' : 'SVG'} <i><a href="https://developer.mozilla.org/en-US/docs/Glossary/Element" target="_blank">element</a></i>. Maybe you forgot to put some <code>&lt;</code> angle brackets <code>&gt;</code> around it` : ''
          const lines = code.split('\n')
          const match = lines.filter(str => str.toLowerCase().indexOf(attr) >= 0)[0]
          line = lines.indexOf(match) + 1
          if (match) col = match.indexOf(attr)
          if (!Object.keys(allAttr).includes(attr)) {
            const smatch = this.checkSpelling(attr, 'attributes')
            const suggest = (smatch && (isHTMLele || isSVGele))
              ? `Or maybe you mispelled the <strong>"${smatch}"</strong> attribute? `
              : (smatch) ? `Check your spelling, did you mean to write <strong>"${smatch}"</strong>? ` : ''

            const reEvent = /^on(unload|message|submit|select|scroll|resize|mouseover|mouseout|mousemove|mouseleave|mouseenter|mousedown|load|keyup|keypress|keydown|focus|dblclick|click|change|blur|error)$/i
            if (attr.indexOf('data-') !== 0 && !reEvent.test(attr)) {
              const fmsg = `If you were trying to create your own <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" target="_blank">custom data attribute</a> you need to write it like this: <code>data-${attr}</code>`
              const friendly = `${htmlMsg}${isEle}. ${suggest}${fmsg}`

              errz.push({ language, type, message, friendly, evidence, col, line, rule })
            }
          } else if (allAttr[attr].status !== 'standard') {
            let fmsg = 'It may be depreciated or obsolete.'
            if (allAttr[attr].status === 'experimental') {
              fmsg = `<code>${attr}</code> is an experimental attribute, it may not work on all browsers. If browser compatability is important to you make sure you test your work on different browsers to be safe (or maybe avoid using it).`
            } else if (allAttr[attr].status === 'obsolete') {
              if (allAttr[attr].note) fmsg += allAttr[attr].note.html
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

  // static verifyCharset (doc, code) {
  //   const errz = []
  //   const type = 'warning'
  //   const language = 'html'
  //   const message = '<meata charset=""> must be present in <head> tag.'
  //   const friendly = 'You are missing a <a href="https://developer.mozilla.org/en-US/docs/Glossary/character_encoding" target="_blank"><code>&lt;meta charset="utf-8"&gt;</code></a> element in your <code>&lt;head&gt;</code>. While it is not technically required, it\'s highly recommended. Use UTF-8 unless you have a very good reason not to; it will cover your character needs pretty much regardless of what language you are using in your document. In addition, you should always specify the characterset as early as possible within your HTML\'s <code>&lt;head&gt;</code>, as it protects against a rather nasty <a href="https://support.microsoft.com/en-us/help/928847/internet-explorer-uses-the-wrong-character-set-when-it-renders-an-html" target="_blank">Internet Explorer security vulnerability</a>.'
  //   const rule = {
  //     id: 'declare-document-charset',
  //     description: 'Set document language',
  //     link: 'https://developer.mozilla.org/en-US/docs/MDN/Contribute/Guidelines/Code_guidelines/HTML#Document_characterset'
  //   }
  //
  //   if (code.indexOf('<head') > -1 && code.indexOf('</head>') > -1) {
  //     let hasCharset = false
  //     for (let i = 0; i < doc.head.children.length; i++) {
  //       const child = doc.head.children[i]
  //       if (child.localName.toLowerCase() === 'meta') {
  //         if (child.attributes.charset) {
  //           hasCharset = true
  //           break
  //         }
  //       }
  //     }
  //
  //     if (!hasCharset) {
  //       const lines = code.split('\n')
  //       const match = lines
  //         .filter(str => str.toLowerCase().indexOf('<head') >= 0)[0]
  //       const evidence = ''
  //       const line = lines.indexOf(match) + 1
  //       const col = match.indexOf('<head')
  //       errz.push({ language, type, message, friendly, evidence, col, line, rule })
  //     }
  //   }
  // \
  //   return errz
  // }

  static verifyDoctype (doc, code) {
    const errz = []
    const type = 'warning'
    const language = 'html'
    const message = 'Doctype must be declared first.'
    const friendly = 'You forgot to specify a doctype (aka <a href="https://en.wikipedia.org/wiki/Document_type_declaration" target="_blank">document type declaration</a>). You should let the browser know this code was written in the era of HTML5 (our present web era) by including <code>&lt;!DOCTYPE html&gt;</code> at the top of your file. Using the proper doctype not only avoids having the browser misrender your code (see <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">quirks mode</a>) but also helps to future proof your work.'
    const rule = {
      id: 'declare-document-doctype',
      description: 'Set document doctype',
      link: 'https://en.wikipedia.org/wiki/Document_type_declaration'
    }

    if (code.indexOf('<html') > -1 && code.indexOf('<!DOCTYPE html>') === -1) {
      const evidence = ''
      const line = 1
      const col = 1
      errz.push({ language, type, message, friendly, evidence, col, line, rule })
    }

    return errz
  }

  static checkRule (rules, rule) {
    return Object.prototype.hasOwnProperty.call(rules, rule)
  }

  static verify (code, rules, cm) {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    let errz = []

    if (this.checkRule(rules, 'standard-elements')) {
      errz = errz.concat(this.verifyStandardElements(doc, code, cm))
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

    // if (this.checkRule(rules, 'declare-document-charset')) {
    //   errz = errz.concat(this.verifyCharset(doc, code))
    // }

    if (this.checkRule(rules, 'declare-document-doctype')) {
      errz = errz.concat(this.verifyDoctype(doc, code))
    }

    return errz
  }
}

module.exports = HTMLStandards
