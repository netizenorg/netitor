const htmlEles = require('../edu-data/html-elements.json')
const singletons = Object.keys(htmlEles).filter(e => htmlEles[e].singleton)

function parseKeyword (o) {
  return o.message.substring(
    o.message.indexOf(o.start) + o.start.length,
    o.message.indexOf(o.end)
  )
}

function htmlToStr (html) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const translate = {
  'doctype-first': (obj) => {
    obj.type = 'warning'
    obj.friendly = 'You forgot to specify a doctype (aka <a href="https://en.wikipedia.org/wiki/Document_type_declaration" target="_blank">document type declaration</a>). You should let the browser know this code was written in the era of HTML5 (our present web era) by including <code>&lt;!DOCTYPE html&gt;</code> at the top of your file. Using the proper doctype not only avoids having the browser misrender your code (see <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">quirks mode</a>) but also helps to future proof your work.'
    return obj
  },
  'doctype-html5': (obj) => {
    obj.friendly = 'You\'re using a doctype (aka <a href="https://en.wikipedia.org/wiki/Document_type_declaration" target="_blank">document type declaration</a>) from a previous era. We\'re currently in the era of HTML5 so the doctype should look like <code>&lt;!DOCTYPE html&gt;</code>. Using the proper doctype not only avoids having the browser misrender your code (see <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode" target="_blank">quirks mode</a>) but also helps to future proof your work.'
    return obj
  },
  'head-script-disabled': (obj) => {
    obj.friendly = 'Are you sure you meant to put that <code>&lt;script&gt;</code> element in your <code>&lt;head&gt;</code>? JavaScript is often used to dynamically change the content of your HTML document, and so it\'s best to include it after all the other elements in your <code>&lt;body&gt;</code>. This will guarentee all the other elements exist before the JavaScript code attempts to reference and/or modify them. In some rare cases you do need to place the <code>&lt;script&gt;</code> element in your <code>&lt;head&gt;</code> (when including a library that creates custom elements being used in your <code>&lt;body&gt;</code> for example), but if this not one of those cases it might be best to move this <code>&lt;script&gt;</code>'
    return obj
  },
  'style-disabled': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'title-require': (obj) => {
    const msg = obj.message
    obj.type = 'warning'
    if (msg.includes('must not be empty')) {
      obj.friendly = 'Your <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title" target="_blank"><code>&lt;title&gt;</code></a> doesn\'t seem to have any content between it\'s opening and closing tags.'
    } else {
      obj.friendly = 'You are missing a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title" target="_blank"><code>&lt;title&gt;</code></a> element in your <code>&lt;head&gt;</code>. While it is not technically required, it\'s highly recommended. Without it your browser tabs will display the name of the file by default and search engines won\'t know how to list the name of your page in their results.'
    }
    return obj
  },
  'attr-lowercase': (obj) => {
    const attr = parseKeyword({
      message: obj.message,
      start: 'The attribute name of [ ',
      end: ' ] must be in lowercase.'
    })
    obj.type = 'warning'
    obj.friendly = `You shouldn't write attribute names in upper case like <code>${attr}</code>, instead they should be lower case like: <code>${attr.toLowerCase()}</code>. Previous versions of HTML required attribute names to be written in upper case, these days (in the era of HTML5) you can technically write them in either upper or lower case, but it's considered better practice to write them in lower case, because most folks find it easeir to read. In either case, it's best to keep your code consistent.`
    return obj
  },
  'attr-no-duplication': (obj) => {
    const attr = parseKeyword({
      message: obj.message,
      start: 'Duplicate of attribute name [ ',
      end: ' ] was found'
    })
    obj.friendly = `You've declared the <code>${attr}</code> attribute twice in the same element. Attributes should only appear once per element.`
    return obj
  },
  'attr-no-unnecessary-whitespace': (obj) => {
    const attr = parseKeyword({
      message: obj.message, start: 'attribute \'', end: '\' must not'
    })
    obj.friendly = `HTML attributes should not have any spaces between the name, the <code>=</code> symobl, and the value. You're <code>${attr}</code> seems to have an unnecessary space around its <code>=</code> symobl.`
    return obj
  },
  'attr-sorted': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'attr-unsafe-chars': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'attr-value-double-quotes': (obj) => {
    const attr = parseKeyword({
      message: obj.message, start: 'attribute [ ', end: ' ] must'
    })
    obj.friendly = `You're <code>${attr}</code> attribute has it's value set with single quotes, but HTML attribute values should use double quotes.`
    return obj
  },
  'attr-value-not-empty': (obj) => {
    const attr = parseKeyword({
      message: obj.message, start: 'attribute [ ', end: ' ] must'
    })
    // TODO make an exception list for stuff like controls, etc
    obj.friendly = `Your <code>${attr}</code> attribute is missing a value.`
    return obj
  },
  'attr-whitespace': (obj) => {
    const attr = parseKeyword({
      message: obj.message, start: 'The attributes of [ ', end: ' ] must '
    })
    if (obj.message.includes('trailing whitespace')) {
      obj.friendly = `You have unnecessary spaces either before or after the value within the quotes of the <code>${attr}</code> attribute.`
    } else if (attr === 'class') {
      obj.friendly = 'You should only have a single space between a list of class names applied to an element within the quotes of the <code>class</code> attribute\'s value.'
    } else {
      obj.friendly = `You should only have a single space between individual values within the quotes of your <code>${attr}</code> attribute's value.`
    }
    return obj
  },
  'alt-require': (obj) => {
    obj.friendly = `Your <code>${htmlToStr(obj.evidence)}</code> is missing it's <code>alt</code> attribute. The alt attribute's value should be a description of the image, while it isn't mandatory it is incredibly useful for accessibility — screen readers read this description out to their users so they know what the image means. Alt text is also displayed on the page if the image can't be loaded for some reason: for example, network errors, content blocking, or <a href="https://en.wikipedia.org/wiki/Link_rot" target="_blank">linkrot</a>.`
    return obj
  },
  'tags-check': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'tag-pair': (obj) => {
    const msg = obj.message
    // check that singleton's don't have closing tags
    if (msg.includes('Tag must be paired, no start tag: [ </')) {
      const tagname = parseKeyword({
        message: msg,
        start: 'Tag must be paired, no start tag: [ </',
        end: '> ]'
      })
      if (singletons.includes(tagname)) {
        obj.friendly = `The <code>&lt;${tagname}&gt;</code> element is known as a "singleton" or "void element", which means it's one of the few elements that shouldn't have a closing tag (only an opening tag)`
        return obj
      }
    }

    // if not singleton, assuming then either opening/closing tag is missing
    const line = msg.substring(msg.length - 2, msg.length - 1)
    const tagname = parseKeyword({
      message: msg, start: 'tag match failed [ <', end: '> ] on line'
    })

    obj.friendly = `It looks like the <code>&lt;${tagname}&gt;</code> tag on line ${line} doesn't have a matching closing tag. If you did add a closing tag make sure you spelled the element's name correctly in both the <a href="https://media.prod.mdn.mozit.cloud/attachments/2014/11/14/9347/c07aa313dbdd667585430f4eca354dbd/grumpy-cat-small.png" target="_blank">opening and closing tags</a>.`
    return obj
  },
  'tag-self-close': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'tagname-lowercase': (obj) => {
    const tagname = parseKeyword({
      message: obj.message,
      start: 'The html element name of [ ',
      end: ' ] must be in lowercase.'
    })
    obj.type = 'warning'
    obj.friendly = `You shouldn't write tag names in upper case like <code>&lt;${tagname}&gt;</code>, instead they should be lower case like <code>&lt;${tagname.toLowerCase()}&gt;</code>. Previous versions of HTML required tag names to be written in upper case, these days (in the era of HTML5) you can technically write them in either upper or lower case, but it's considered better practice to write them in lower case, because most folks find it easeir to read. In either case, it's best to keep your code consistent.`
    return obj
  },
  'empty-tag-not-self-closed': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'src-not-empty': (obj) => {
    const tagname = parseKeyword({
      message: obj.message,
      start: ' ] of the tag [ ',
      end: ' ] must have'
    })
    const attr = parseKeyword({
      message: obj.message,
      start: 'attribute [ ',
      end: ' ] of the tag [ '
    })
    obj.friendly = `It looks like your <code>&lt;${tagname}&gt;</code> on line ${obj.line} has an empty <code>${attr}</code> attribute. Don't forget to set it's value.`
    return obj
  },
  'href-abs-or-rel': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'input-requires-label': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'script-disabled': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'id-class-ad-disabled': (obj) => {
    const attr = obj.message.includes(' class ') ? 'class' : 'id'
    obj.friendly = `Careful, the <code>${attr}</code> you've set on line ${obj.line} has the word "ad" in it. If a viewer is using an ad-blocker in their browser it might effect this element.`
    return obj
  },
  'id-class-value': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'id-unique': (obj) => {
    const id = parseKeyword({
      message: obj.message, start: 'value [ ', end: ' ] must '
    })
    obj.friendly = `While different elements can have the same <code>class</code> applied to them, the value of the <code>id</code> attribute is meant to be unique. It looks like you've used set <code>id="${id}"</code> on more than one element.`
    return obj
  },
  'inline-script-disabled': (obj) => {
    const attr = parseKeyword({
      message: obj.message, start: 'script [  ', end: ' ] cannot'
    })
    obj.friendly = `Careful, though it is possible to run JavaScript code "inline" by setting attribute event handlers like <code>${attr}</code>, this approach is considered "obsolete", you should <a href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events" target="_blank">handle events like this</a> in your JavaScript code instead.`
    return obj
  },
  'inline-style-disabled': (obj) => {
    const css = parseKeyword({
      message: obj.message, start: 'style [  ', end: ' ] cannot'
    })
    obj.friendly = `Careful, though "inline styling" (like the kind you are doing here <code>${css}</code>) is technically ok, it's better practice to keep your CSS between <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/style" target="_blank">&lt;style&gt;</a> tags or saved in their own CSS file and imported/included in your HTML page using a <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link" target="_blank">&lt;link&gt;</a> tag.`
    return obj
  },
  'space-tab-mixed-disabled': (obj) => {
    obj.friendly = obj.message
    return obj
  },
  'spec-char-escape': (obj) => {
    const char = parseKeyword({
      message: obj.message, start: 'escaped : [ ', end: ' ]'
    }).replace(/\s/g, '')
    const convert = { '<': 'lt;', '>': 'gt;', '&': 'amp;' }
    obj.type = 'warning'
    obj.friendly = `Careful, the "&${convert[char]}" is a special symbol in HTML, use "&amp;${convert[char]}" instead, this will appear like "&${convert[char]}" on your page.`
    return obj
  }
}

module.exports = translate
