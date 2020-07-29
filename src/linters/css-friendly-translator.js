function reformatObj (obj, warning) {
  obj.col = obj.column
  obj.type = warning ? 'warning' : 'error'
  obj.message = obj.text
  delete obj.column
  delete obj.severity
  delete obj.text
  return obj
}

function parseVals (str) {
  const arr = []
  let init = false
  let idx = -1
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '"') {
      init = !init
      if (init) arr[++idx] = ''
    } else {
      if (init) arr[idx] += str[i]
    }
  }
  return arr
}

const dict = {
  //
  // MY CUSTOM ERRORS
  //
  'selector-type-whitelist': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `This is not a valid CSS "type" selector because there is no <code>${vals[0]}</code> element in HTML, did you mean to make this a "class" selector like <code>.${vals[0]}</code> or an "id" selector like <code>#${vals[0]}</code>`
    return obj
  },
  //
  // SYNTAX ERRORS
  //
  'unclosed-bracket': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It seems you might be missing a closing parentheses <code>)</code> somewhere on this line'
    return obj
  },
  'unknown-word': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'Something is wrong with the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax" target="_blank">CSS rule</a>, did you remember to include both a CSS property name and a CSS property value separated by a <code>:</code> and followed by a <code>;</code>?'
    return obj
  },
  'unexpected-bracket': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It seems the CSS rules block ending on this line may be missing it\'s opening bracket <code>{</code>, or you may have already accidently closed it by adding an extra closing <code>}</code> bracket above it'
    return obj
  },
  'unclosed-block': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It seems this CSS rules block might be missing it\'s closing <code>}</code> bracket'
    return obj
  },
  'double-colon': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It looks like this line has an extra <code>:</code> it shouldn\'t'
    return obj
  },
  'missed-semicolon': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It looks like this line may be missing a <code>;</code> at the end of it'
    return obj
  },
  //
  // OTHER STYLELINT RULES
  //
  'color-no-invalid-hex': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'It looks like you\'re trying to write a color in <a href="https://en.wikipedia.org/wiki/Web_colors#Hex_triplet">Hexadecimal notation</a>, but the value you wrote isn\'t valid Hex code. Hex values must be digits 0-1 and letters A-F (no other letters are valid hex values). make sure you\'ve got a <code>#</code> followed by a valid number of hex values, either 3 (for rgb) 4 (for rgba) 6 (for rrggbb) or 8 (for rrggbbaa)'
    return obj
  },
  'declaration-bang-space-after': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'When using <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#The_!important_exception" target="_blank">!important</a> on a style declaration you should not have a space betweent the <code>!</code> and the <code>important</code>'
    return obj
  },
  'declaration-bang-space-before': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'When using <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity#The_!important_exception" target="_blank">!important</a> on a style declaration you should include a space between the property value and the <code>!important</code> declaration.'
    return obj
  },
  'block-no-empty': (obj) => {
    obj = reformatObj(obj, true)
    obj.friendly = 'A CSS rule block should always have at least one CSS rule (property and value) inside it. If you\'re planning on coming back to this later it\'s good practice to leave a <code>/* comment */</code> inside the CSS rule block in the meantime.'
    return obj
  },
  'declaration-block-no-duplicate-properties': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `It looks like you've declared <code>${vals[0]}</code> twice, it should only be declared once per CSS rule block.`
    return obj
  },
  'declaration-block-no-shorthand-property-overrides': (obj) => {
    obj = reformatObj(obj, true)
    const vals = parseVals(obj.message)
    obj.friendly = `It looks like you declared <code>${vals[0]}</code> after you declared <code>${vals[1]}</code> and so <code>${vals[1]}</code> is being overridden and will have no effect. Are you sure you meant to do this?`
    return obj
  },
  'declaration-colon-space-after': (obj) => {
    obj = reformatObj(obj, true)
    obj.friendly = 'You should always have a space between the <code>:</code> and the property\'s value'
    return obj
  },
  'declaration-colon-space-before': (obj) => {
    obj = reformatObj(obj, true)
    obj.friendly = 'You shouldn\'t put a space between a CSS property name and the <code>:</code>, only between the <code>:</code> and it\'s value'
    return obj
  },
  'function-name-case': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `CSS functions should be written in lower case like <code>${vals[1]}</code> instead of <code>${vals[0]}</code>`
    return obj
  },
  'function-linear-gradient-no-nonstandard-direction': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'This is a non-standard way of writing CSS gradient values, review the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient#Syntax" target="_blank">mozilla developer docs</a> for examples of proper syntax.'
    return obj
  },
  'no-descending-specificity': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `The <code>${vals[0]}</code> CSS selector is more specific than the <code>${vals[1]}</code> selector and thus should be declared after it, not before.`
    return obj
  },
  'no-duplicate-selectors': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `You've declared the <code>${vals[0]}</code> CSS selector twice, this is bad practice. You should group all the CSS rules corresponding to that selector into the same CSS rule block.`
    return obj
  },
  'no-invalid-double-slash-comments': (obj) => {
    obj = reformatObj(obj)
    obj.friendly = 'The <code>// example</code> comment notation works in JavaScript, but not in CSS, you must use "block" comments like <code>/* example */</code>'
    return obj
  },
  'no-unknown-animations': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `You are referncing an <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations/Using_CSS_animations" target="_blank">animation</a> named <code>${vals[0]}</code>, but you have not created one, you must first declare it, for example: <code>@keyframes ${vals[0]} { /* ... */ }</code>`
    return obj
  },
  'property-case': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `CSS property names should be written in lowercase, you wrote <code>${vals[0]}</code> but you should write <code>${vals[1]}</code>`
    return obj
  },
  'property-whitelist': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `There is no <code>${vals[0]}</code> property in CSS`
    return obj
  },
  'selector-type-case': (obj) => {
    obj = reformatObj(obj)
    const vals = parseVals(obj.message)
    obj.friendly = `CSS type selectors should be writtn in lower case, you wrote <code>${vals[0]}</code> but you should write <code>${vals[1]}</code>`
    return obj
  },
  'string-quotes': (obj) => {
    obj = reformatObj(obj, true)
    obj.friendly = 'In CSS it\'s common practice to write strings in double quotes rather than single quotes'
    return obj
  }
}

function translate (err) {
  if (dict[err.rule]) return dict[err.rule](err)
  else {
    if (err.text.includes('Unclosed bracket')) {
      return dict['unclosed-bracket'](err)
    } else if (err.text.includes('Unknown word')) {
      return dict['unknown-word'](err)
    } else if (err.text.includes('Unexpected }')) {
      return dict['unexpected-bracket'](err)
    } else if (err.text.includes('Unclosed block')) {
      return dict['unclosed-block'](err)
    } else if (err.text.includes('Double colon')) {
      return dict['double-colon'](err)
    } else if (err.text.includes('At-rule without name')) {
      return dict['at-rule-no-name'](err)
    } else if (err.text.includes('Missed semicolon')) {
      return dict['missed-semicolon'](err)
    }
  }
}

module.exports = translate
