const htmlEles = require('../edu-data/html-elements.json')
const htmlAttr = require('../edu-data/html-attributes.json')

class HTMLStandards {
  static verifyStandardElements (doc, code) {
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
        const match = lines.filter(str => str.indexOf(name) >= 0)[0]
        line = lines.indexOf(match) + 1
        if (match) col = match.indexOf(name)

        const fmsg = customElement
          ? 'But it may be a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" target="_blank">custom element</a>, assuming you\'ve imported this custom element yourself using a library or your own custom code.'
          : 'This might not break your HTML page, but regardless is probably not doing what you might be expecting.'

        const friendly = `${htmlMsg}. ${fmsg}`
        const evidence = name
        errz.push({ type, message, friendly, evidence, col, line, rule })
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
      if (Object.prototype.hasOwnProperty.call(htmlEles, element)) {
        const attrs = doc.all[i].attributes
        for (let i = 0; i < attrs.length; i++) {
          const attr = attrs[i].localName
          const evidence = attr
          const message = `${attr} is not a standard HTML attribute`
          const htmlMsg = `<code>${attr}</code> is not a standard HTML <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes" target="_blank">attribute</a>`
          const lines = code.split('\n')
          const match = lines.filter(str => str.indexOf(attr) >= 0)[0]
          line = lines.indexOf(match) + 1
          if (match) col = match.indexOf(attr)

          if (!Object.keys(htmlAttr).includes(attr)) {
            const reEvent = /^on(unload|message|submit|select|scroll|resize|mouseover|mouseout|mousemove|mouseleave|mouseenter|mousedown|load|keyup|keypress|keydown|focus|dblclick|click|change|blur|error)$/i
            if (attr.indexOf('data-') !== 0 && !reEvent.test(attr)) {
              const fmsg = `Check your spelling. If you were trying to create your own <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes" target="_blank">custom data attribute</a> you need to write it like this: <code>data-${attr}</code>`
              const friendly = `${htmlMsg}. ${fmsg}`

              errz.push({ type, message, friendly, evidence, col, line, rule })
            }
          } else if (htmlAttr[attr].status !== 'standard') {
            let fmsg = 'It may be depreciated or obsolete.'
            if (htmlAttr[attr].status === 'experimental') {
              fmsg = `<code>${attr}</code> is an experimental attribute, it may not work on all browsers. If browser compatability is important to you make sure you test your work on different browsers to be safe (or maybe avoid using it).`
            } else if (htmlAttr[attr].status === 'obsolete') {
              if (htmlAttr[attr].note) fmsg += htmlAttr[attr].note.html
            }
            const friendly = `${htmlMsg}. ${fmsg}`

            errz.push({ type, message, friendly, evidence, col, line, rule })
          }
        }
      }
    }
    return errz
  }

  static verify (code, rules) {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    let errz = []

    if (Object.prototype.hasOwnProperty.call(rules, 'standard-elements')) {
      errz = errz.concat(HTMLStandards.verifyStandardElements(doc, code))
    }

    if (Object.prototype.hasOwnProperty.call(rules, 'standard-attributes')) {
      errz = errz.concat(HTMLStandards.verifyStandardAttributes(doc, code))
    }

    return errz
  }
}

module.exports = HTMLStandards
