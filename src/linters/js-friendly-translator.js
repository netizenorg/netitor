function reformatObj (obj, warning) {
  const err = { jshint: obj }
  err.col = obj.character
  err.line = obj.line
  err.type = warning ? 'warning' : 'error'
  err.message = obj.reason
  err.friendly = obj.reason
  err.language = 'javascript'
  return err
}

const lnk = (t, u) => `<a href="${u}" target="_blank">${t}</a>`
const cde = (t) => `<code>${t}</code>`

const dict = {
  E006: (obj) => {
    obj.friendly = 'The ending of your JavaScript code seems unexpected, you might be missing something or you might have something there you shouldn\'t.'
    return obj
  },
  E011: (obj) => {
    if (obj.jshint.evidence.includes('for')) {
      obj.friendly = `The variable ${cde(obj.jshint.a)} is going to get reassigned as your for loop integrates over and over, and ${lnk('cont', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const')} can not be reassigned, you should write ${cde(`let ${obj.jshint.a}`)} instead.`
    } else {
      obj.friendly = `The variable ${cde(obj.jshint.a)} was already declared with the ${lnk('const', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const')} keyword, which means it can't be redclared or reassigned. Try changing the name of your variable to something you haven't used yet, or change the value of your prior ${cde(obj.jshint.a)} declaraion.`
    }
    return obj
  },
  E012: (obj) => {
    obj.friendly = `The variable ${cde(obj.jshint.a)} was declared with the ${lnk('const', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const')} keyword, which means it can't be redclared or reassigned later on. Are you sure you meant to leave it undefined? If you want to change it's value later you should be using ${lnk('let', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let')}`
    obj.type = 'warning'
    return obj
  },
  E013: (obj) => { return dict.E011(obj) },
  E014: (obj) => {
    obj.friendly = `Looks like you might have a ${lnk('regular expression', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions')} literal which could get confused with '/='.`
    obj.type = 'warning'
    return obj
  },
  E015: (obj) => {
    obj.friendly = `You've written a ${lnk('regular expression', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions')} which isn't properly closed.`
    return obj
  },
  E016: (obj) => {
    obj.friendly = `You've written an invalid ${lnk('regular expression', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions')}.`
    return obj
  },
  E017: (obj) => {
    obj.friendly = `You've opened a comment with ${cde('/*')}, but you forgot to close it with ${cde('*/')}`
    return obj
  },
  E018: (obj) => {
    obj.friendly = `You've closed a comment with ${cde('*/')}, but you forgot to initaly open it with ${cde('/*')}`
    return obj
  },
  E019: (obj) => {
    const m = { '{': '}' }
    const c = m[obj.jshint.a] ? `ing ${cde(m[obj.jshint.a])}` : ''
    obj.friendly = `You've got a ${cde(obj.jshint.a)} but you're missing it's match${c}.`
    return obj
  },
  E020: (obj) => {
    obj.friendly = `There's a ${cde(obj.jshint.b)} on this line that seems to be missing it's matching ${cde(obj.jshint.a)} `
    return obj
  },
  E021: (obj) => {
    obj.friendly = `There seems to be a missing ${cde(obj.jshint.a)} on this line.`
    return obj
  },
  // E022: "Line breaking error '{a}'.",
  E023: (obj) => {
    obj.friendly = `It looks like you might be missing a ${cde(obj.jshint.a)}.`
    return obj
  },
  E024: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} seems to be unexpected, did you mean to include that where you did?`
    return obj
  },
  E025: (obj) => {
    obj.friendly = `There seems to be a missing ${cde(':')} in your ${lnk('case clause', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch')}.`
    return obj
  },
  E026: (obj) => {
    obj.friendly = `There seems to be a missing ${cde('}')}.`
    return obj
  },
  E027: (obj) => {
    obj.friendly = `There seems to be a missing ${cde(']')}.`
    return obj
  },
  E028: (obj) => {
    obj.friendly = `There seems to be an improper use of a comma ${cde(',')} on this line.`
    return obj
  },
  E029: (obj) => {
    obj.friendly = `Seems you forgot to close your ${lnk('string', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String')}, don't forget to put quotes on both ends.`
    return obj
  },
  E030: (obj) => {
    if (obj.jshint.a === ')') {
      obj.friendly = `It looks like you might be missing a variable between the ${cde('()')}.`
    } else {
      obj.friendly = `It looks like you put ${cde(obj.jshint.a)} in a spot where you otherwise should have placed a variable (or maybe some specific value).`
    }
    return obj
  },
  E031: (obj) => {
    obj.friendly = `Something is wrong with the way you wrote this line, were you trying to ${lnk('assign a value', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators#Assignment_operators')} to a variable?`
    return obj
  },
  // E032: "Expected a small integer or 'false' and instead saw '{a}'."
  E033: (obj) => {
    obj.friendly = `Did you mean to place an ${lnk('operator', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators')} where you place the ${cde(obj.jshint.a)}?`
    return obj
  },
  // E034: "get/set are ES5 features."
  E035: (obj) => {
    obj.friendly = 'It seems you might be missing a property name'
    return obj
  },
  // E036: "Expected to see a statement and instead saw a block.",
  // E037: null,
  // E038: null,
  E039: (obj) => {
    obj.friendly = `It looks like you might be trying to run/call a function "declaration" (based on the fact that you've got a ${cde('()')} after the declaration block). If this is the case you need to wrap the entire declarationin block (including the ${cde('()')} at the end) in a set of parenthesis.`
    return obj
  },
  // E040: "Each value should have its own case label.",
  E041: (obj) => {
    obj.friendly = 'There\'s something wrong with the way you wrote this line (or maybe a line before or after it), but it\'s hard to tell exactly what, double check your syntax.'
    return obj
  },
  // E042: "Stopping.",
  // E043: "Too many errors.",
  // E044: null,
  // E045: "Invalid for each loop.",
  // E046: "Yield expressions may only occur within generator functions.",
  // E047: null,
  // E048: "{a} declaration not directly within block.",
  // E049: "A {a} cannot be named '{b}'.",
  // E050: "Mozilla requires the yield expression to be parenthesized here.",
  // E051: null,
  E052: (obj) => {
    obj.friendly = `You forgot the closing ${cde('`')} in your ${lnk('template literal', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals')} (aka template string).`
    return obj
  },
  // E053: "{a} declarations are only allowed at the top level of module scope.",
  E054: (obj) => {
    obj.friendly = `a JavaScript ${lnk('class', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes')}'s method name must be followed directly by a ${cde('(')} not a ${cde(obj.jshint.a)}.`
    return obj
  },
  // E055: "The '{a}' option cannot be set after any executable code.",
  E056: (obj) => {
    obj.friendly = `The variable ${cde(obj.jshint.a)} was used before it was declared, it's best to define your varibles before you use them (even if this used to work with older ways of declaring variables in JavaScript, it won't work with ${cde(obj.jshint.b)}).`
    return obj
  },
  E057: (obj) => {
    obj.friendly = `${cde(obj.jshint.b)} is not a valid meta property of the ${cde(obj.jshint.a)} keyword.`
    return obj
  },
  E058: (obj) => {
    obj.friendly = 'There seems to be a missing semicolon <code>;</code>. You may have more than one statement on this line, if so you need a semicolon to separate them. Most programming languages require that you end each line (aka statement) with a semicolon. But in JavaScript they are only required when you have more than one statement written on the same line. For that reason, we recommend avoiding semicolons at the end of lines and only using them when they\'re absolutely necessary (like in this case)'
    return obj
  },
  // E059: "Incompatible values for the '{a}' and '{b}' linting options.",
  E060: (obj) => {
    obj.friendly = `The second operand for the ${lnk('instanceof', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof')} operator (ie. the value that follows it) has to be a class or object which can be instantiated.`
    return obj
  },
  E061: (obj) => {
    obj.friendly = `This is not how the ${lnk('yield', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield')} keyword is meant to be used.`
    return obj
  },
  E062: (obj) => {
    obj.friendly = `You can't apply a ${lnk('default', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters')} value to a ${lnk('rest', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters')} parameter.`
    return obj
  },
  E063: (obj) => {
    obj.friendly = `You are only meant to use the ${lnk('super', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super')} function within a JavaScript ${lnk('class', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes')}'s methods`
    return obj
  },
  E064: (obj) => { return dict.E063(obj) },
  // E065: "Functions defined outside of strict mode with non-simple parameter lists may not " + "enable strict mode.",
  // E066: "Asynchronous iteration is only available with for-of loops.",
  // E067: "Malformed numeric literal: '{a}'."
  // ..
  // ..
  // ..
  // ..
  // ..
  // ..
  // W001: "'hasOwnProperty' is a really bad name.",
  // W002: "Value of '{a}' may be overwritten in IE 8 and earlier.",
  // W003: (obj) => {
  //   obj.friendly = `'${cde(obj.jshint.a)}' was used before it was defined. This will work fine because JavaScript will ${lnk('hoist', 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting')} it for you, but it may lead to some confusing code.`
  //   obj.type = 'warning'
  //   return obj
  // },
  // W004: "'{a}' is already defined.",
  // W005: "A dot following a number can be confused with a decimal point.",
  // W006: "Confusing minuses.",
  // W007: "Confusing plusses.",
  // W008: "A leading decimal point can be confused with a dot: '{a}'.",
  W009: (obj) => {
    obj.friendly = `While it's technically ok to use the ${cde('new Array()')} constructor, it's much more common pracice to use ${cde('[]')}`
    obj.type = 'warning'
    return obj
  },
  W010: (obj) => {
    obj.friendly = `While it's technically ok to use the ${cde('new Object()')} constructor, it's much more common pracice to use ${cde('{}')}`
    obj.type = 'warning'
    return obj
  },
  // W011: null,
  // W012: null,
  // W013: null,
  // W014: "Misleading line break before '{a}'; readers may interpret this as an expression boundary.",
  // W015: null,
  // W016: "Unexpected use of '{a}'.",
  // W017: "Bad operand.",
  // W018: "Confusing use of '{a}'.",
  W019: (obj) => {
    obj.friendly = `While this might work it's best to use the ${lnk('isNaN', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN')} function in this situation.`
    obj.type = 'warning'
    return obj
  },
  // W020: "Read only.",
  // W021: "Reassignment of '{a}', which is a {b}. " + "Use 'var' or 'let' to declare bindings that may change.",
  // W022: "Do not assign to the exception parameter.",
  // W023: null,
  W024: (obj) => {
    obj.friendly = `${cde(obj.jshint.a)} is a reserved word in JavaScript, you'll have to name your variable something else.`
    return obj
  },
  W025: (obj) => {
    obj.friendly = `You forgot to give your function a name, define the name between the ${cde('function')} keyword and the parenthesis ${cde('()')}`
    return obj
  },
  // W026: "Inner functions should be listed at the top of the outer function.",
  W027: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} in this line is "unreachable", this means there's some code before it which will always prevent this line from running. Remove it or edit the code that preceeds it.`
    return obj
  },
  W028: (obj) => {
    obj.friendly = `You've written ${cde(obj.jshint.a)} like a label or property, did you mean to place it within an object ${cde('{ }')}, or maybe you meant to declare a variable like ${cde(`const ${obj.jshint.a} = ${obj.jshint.b}`)}?`
    return obj
  },
  // W029: null,
  W030: (obj) => { return dict.E031(obj) },
  // W031: "Do not use 'new' for side effects.",
  W032: (obj) => {
    obj.friendly = 'You\'ve got an extra or unecessary semicolon here.'
    return obj
  },
  W033: (obj) => { return dict.E058(obj) },
  // W034: "Unnecessary directive \"{a}\".",
  W035: (obj) => {
    obj.friendly = `The block starting on this line is empty, did you forget to put something between the ${cde('{ }')}. If not maybe you should remove this block because it likely isn't doing anything.`
    obj.type = 'warning'
    return obj
  },
  // W036: "Unexpected /*member '{a}'.",
  // W037: "'{a}' is a statement label.",
  // W038: "'{a}' used out of scope.",
  // W039: null,
  // W040: "If a strict mode function is executed using function invocation, " + "its 'this' value will be undefined.",
  // W041: null,
  // W042: "Avoid EOL escaping.",
  // W043: "Bad escaping of EOL. Use option multistr if needed.",
  // W044: "Bad or unnecessary escaping.", /* TODO(caitp): remove W044 */
  // W045: "Value described by numeric literal cannot be accurately " + "represented with a number value: '{a}'.",
  W046: (obj) => {
    const val = obj.jshint.a.replace(/0/g, '')
    obj.friendly = `The zeroes at the start of ${cde(obj.jshint.a)} are unecessary, just write ${cde(val)}.`
    obj.type = 'warning'
    return obj
  },
  W047: (obj) => {
    obj.friendly = `You've got an unecessary decimal dot at the end of ${cde(obj.jshint.a)}, while that's ok, it can be confusing (because the ${cde('.')} is also JavaScript syntax). You should simply write ${cde(obj.jshint.a.slice(0, -1))} instead`
    obj.type = 'warning'
    return obj
  },
  // W048: "Unexpected control character in regular expression.",
  // W049: "Unexpected escaped character '{a}' in regular expression.",
  // W050: "JavaScript URL.",
  // W051: "Variables should not be deleted.",
  W052: (obj) => {
    obj.friendly = `Did you mean to write ${cde(obj.jshint.a)} where you did? It seems unexpected there.`
    return obj
  },
  W053: (obj) => {
    obj.friendly = `You should not use ${cde(obj.jshint.a)} as a constructor.`
    return obj
  },
  // W054: "The Function constructor is a form of eval.",
  // W055: "A constructor name should start with an uppercase letter.",
  // W056: "Bad constructor.",
  // W057: "Weird construction. Is 'new' necessary?",
  // W058: "Missing '()' invoking a constructor.",
  // W059: "Avoid arguments.{a}.",
  W060: (obj) => {
    // obj.friendly = `These days it's considered bad practice to use ${lnk('document.write', 'https://developer.mozilla.org/en-US/docs/Web/API/Document/write')} (because it can be a security risk depending on where the data getting passed into is is coming from). Why don't you use ${lnk('innerHTML', 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML')} instead? like ${cde('document.body.innerHTML = "test"')}`
    // obj.type = 'warning'
    return null
  },
  W061: (obj) => {
    obj.friendly = `These days it's considered bad practice to use ${lnk('eval', 'https://developer.mozilla.org/en-US/docs/Web/API/Document/write')} (because it can be a security risk depending on where the data getting passed into is is coming from).`
    obj.type = 'warning'
    return obj
  },
  // W062: "Wrap an immediate function invocation in parens " +
  W063: (obj) => {
    obj.friendly = `${lnk('Math', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math')} is not a function, it's an object with properties like ${cde('math.PI')} and methods like ${cde('Math.random()')}`
    return obj
  },
  // W064: "Missing 'new' prefix when invoking a constructor.",
  // W065: "Missing radix parameter.",
  // W066: "Implied eval. Consider passing a function instead of a string.",
  // W067: "Unorthodox function invocation.",
  // W068: "Wrapping non-IIFE function literals in parens is unnecessary.",
  W069: (obj) => {
    obj.friendly = `While it's ok to use the bracket notation ${cde(`['${obj.jshint.a}']`)} on an object this way, it's unecessary in this case. The dot notation is cleaner ${cde(`.${obj.jshint.a}`)}.`
    obj.type = 'warning'
    return obj
  },
  // W070: "Extra comma. (it breaks older versions of IE)",
  // W071: "This function has too many statements. ({a})",
  // W072: "This function has too many parameters. ({a})",
  // W073: "Blocks are nested too deeply. ({a})",
  // W074: "This function's cyclomatic complexity is too high. ({a})",
  W075: (obj) => {
    obj.friendly = `You've repeated the same name ${cde(obj.jshint.b)} in your ${obj.jshint.a}`
    return obj
  },
  // W076: "Unexpected parameter '{a}' in get {b} function.",
  // W077: "Expected a single parameter in set {a} function.",
  W078: (obj) => {
    obj.friendly = `When you're creating a JavaScript ${lnk('class', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes')} which includes a setter ${cde('set')} it's a good idea to also include a getter ${cde('get')}`
    obj.type = 'warning'
    return obj
  },
  W079: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} variable already exists (it maybe a built-in JavaScript variable or part of the ${lnk('window', 'https://developer.mozilla.org/en-US/docs/Web/API/Window')} object)`
    obj.type = 'warning'
    return obj
  },
  W080: (obj) => {
    obj.friendly = `It's unecessary to assigne ${cde('undefined')} to a variable, you can simply write ${cde(`let ${obj.jshint.a}`)} without any assignment.`
    return obj
  },
  // W081: null,
  // W082: "Function declarations should not be placed in blocks. " +
  // W083: "Functions declared within loops referencing an outer scoped " +
  W084: (obj) => {
    obj.friendly = `This line is expecting a conditional expression not a variable assignment, did you maybe meant to write something like ${cde('==')} or ${cde('===')}?`
    return obj
  },
  // W085: "Don't use 'with'.",
  W086: (obj) => {
    obj.friendly = `Did you forget to write ${cde('break')} before the following ${cde(obj.jshint.a)}?`
    return obj
  },
  // W087: "Forgotten 'debugger' statement?",
  // W088: "Creating global 'for' variable. Should be 'for (var {a} ...'.",
  // W089: "The body of a for in should be wrapped in an if statement to filter " +
  // W090: "'{a}' is not a statement label.",
  // W091: null,
  // W093: "Did you mean to return a conditional instead of an assignment?",
  // W094: "Unexpected comma.",
  // W095: "Expected a string and instead saw {a}.",
  // W096: "The '{a}' key may produce unexpected results.",
  // W097: "Use the function form of \"use strict\".",
  W098: (obj) => {
    obj.friendly = `You defined ${cde(obj.jshint.a)} but it doesn't seem like you're using it anywhere. Maybe you should either comment it out or remove it if you don't plan to use it.`
    obj.type = 'warning'
    return obj
  },
  // W099: null,
  // W100: null,
  // W101: "Line is too long.",
  // W102: null,
  W103: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} property is no longer supported in JavaScript.`
    return obj
  },
  // W104: "'{a}' is available in ES{b} (use 'esversion: {b}') or Mozilla JS extensions (use moz).",
  // W105: null,
  // W106: "Identifier '{a}' is not in camel case.",
  // W107: "Script URL.",
  // W108: "Strings must use doublequote.",
  // W109: "Strings must use singlequote.",
  // W110: "Mixed double and single quotes.",
  // W111: ???
  W112: (obj) => { return dict.E020(obj) },
  // W113: "Control character in string: {a}.",
  // W114: "Avoid {a}.",
  // W115: "Octal literals are not allowed in strict mode.",
  W116: (obj) => {
    if (obj.jshint.b === '') {
      obj.friendly = `It seems you're missing a ${cde(obj.jshint.a)} at the end of this line.`
    } else {
      obj.friendly = `Did you maybe mean to put ${cde(obj.jshint.a)} instead of  ${cde(obj.jshint.b)}.`
    }
    return obj
  },
  W117: (obj) => {
    obj.friendly = `You're trying to use the variable ${cde(obj.jshint.a)}, but you haven't previously created/defined it (at least not within the same ${lnk('scope', 'https://developer.mozilla.org/en-US/docs/Glossary/Scope')} as this line).`
    obj.type = 'warning'
    return obj
  },
  W118: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} is either obsolete or otherwise no longer available on the web. Try writing this a different way.`
    return obj
  },
  W119: (obj) => {
    obj.friendly = `"${obj.jshint.a}" is only available in ES${obj.jshint.b} (a newer version of the JavaScript language not fully implemented in most browsers). You should avoid writing your code this way.`
    return obj
  },
  // W120: "You might be leaking a variable ({a}) here.",
  // W121: "Extending prototype of native object: '{a}'.",
  W122: (obj) => {
    obj.friendly = `There is no such "type" as "${obj.jshint.a}", did you mean to write "number", "string", "boolean", "function", "object" or "undefined"?`
    return obj
  },
  // W123: "'{a}' is already defined in outer scope.",
  W124: (obj) => {
    obj.friendly = `A generator function should contain at least one ${lnk('yield', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield')} expression.`
    return obj
  },
  // W125: "This line contains non-breaking spaces: http://jshint.com/docs/options/#nonbsp",
  // W126: "Unnecessary grouping operator.",
  // W127: "Unexpected use of a comma operator.",
  // W128: "Empty array elements require elision=true.",
  // W129: "'{a}' is defined in a future version of JavaScript. Use a " +
  // W130: "Invalid element after rest element.",
  // W131: "Invalid parameter after rest parameter.",
  W132: (obj) => {
    obj.friendly = `Using ${cde('var')} is outdated and can lead to buggy code. You should be using ${lnk(cde('const'), 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const')} or ${lnk(cde('let'), 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let')} instead.`
    return obj
  },
  // W133: "Invalid for-{a} loop left-hand-side: {b}.",
  // W134: "The '{a}' option is only available when linting ECMAScript {b} code.",
  // W135: "{a} may not be supported by non-browser environments.",
  W136: (obj) => {
    obj.friendly = `The ${cde(obj.jshint.a)} can only be used within the scope of a function.`
    return obj
  },
  // W137: "Empty destructuring: this is unnecessary and can be removed.",
  W138: (obj) => {
    obj.friendly = `You should place ${lnk('default', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters')} parameters before regular parameters.`
    obj.type = 'warning'
    return obj
  }
  // W139: "Function expressions should not be used as the second operand to instanceof.",
  // W140: "Missing comma.",
  // W141: "Empty {a}: this is unnecessary and can be removed.",
  // W142: "Empty {a}: consider replacing with `import '{b}';`.",
  // W143: "Assignment to properties of a mapped arguments object may cause "
  // W144: "'{a}' is a non-standard language feature. Enable it using the '{b}' unstable option.",
  // W145: "Superfluous 'case' clause.",
  // W146: "Unnecessary `await` expression.",
  // W147: "Regular expressions should include the 'u' flag.",
  // W148: "Unnecessary RegExp 's' flag."
}

function translate (err) {
  if (dict[err.code]) {
    err = reformatObj(err)
    return dict[err.jshint.code](err)
  } else return reformatObj(err)
}

module.exports = translate
