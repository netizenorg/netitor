const translate = {
  'doctype-first': (message) => {
    return null
  },
  'tag-pair': (message) => {
    const startStr = ' open tag match failed [ <'
    const endStr = '> ] on line'
    const tagname = message.substring(
      message.indexOf(startStr) + startStr.length,
      message.indexOf(endStr)
    )
    const line = message.substring(message.length - 2, message.length - 1)
    return `It looks like the <${tagname}> tag on line ${line} doesn't have a matching closing tag. If you did add a closing tag make sure you spelled the element's name right.`
  }
}

module.exports = translate
