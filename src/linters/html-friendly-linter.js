// const htmlAttr = require('../edu-data/html-attributes.json')
const htmlEles = require('../edu-data/html-elements.json')

class HTMLFriendlyLinter {
  static verifyStandardElements (doc) {
    const errz = []
    for (let i = 0; i < doc.all.length; i++) {
      const name = doc.all[i].localName
      const valid = Object.prototype.hasOwnProperty.call(htmlEles, name)
      if (!valid) {
        const col = 0
        const line = 0
        const type = 'warning'
        const rule = {
          id: 'standard-elements',
          description: 'Element must be standard HTML',
          link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element'
        }
        const message = `<${name}> is not a standard HTML element`

        const customElement = (
          name.includes('-') &&
          name.indexOf('-') !== 0 &&
          name.indexOf('-') !== name.length - 1
        )

        const fmsg = customElement
          ? 'But it may be a <a href="https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements" alt="Custom Elements" target="_blank">custom element</a>, assuming you\'ve imported this custom element yourself using a library or your own custom code.'
          : 'This won\'t break your HTML page, but it might not do what you\'re expecting.'

        const friendly = `${message}. ${fmsg}`
        const evidence = name
        errz.push({ type, message, friendly, evidence, col, line, rule })
      }
    }
    return errz
  }

  static verify (code, rules) {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(code, 'text/html')
    let errz = []

    if (Object.prototype.hasOwnProperty.call(rules, 'standard-elements')) {
      errz = errz.concat(HTMLFriendlyLinter.verifyStandardElements(doc))
    }

    return errz
  }
}

module.exports = HTMLFriendlyLinter
