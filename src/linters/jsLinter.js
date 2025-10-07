const JSHINT = require('jshint').JSHINT
const globals = require('./js-globals.json')
const JSTranslateError = require('./js-friendly-translator.js')

const options = {
  esversion: 11,
  undef: true, // catch undefined variables
  latedef: 'nofunc', // must define var before used (allow hoisted funcs)
  unused: true, // catch unused vars
  eqeqeq: true, // require === vs == (etc)
  varstmt: true, // prevent 'var'
  asi: true, // supress semicolon errors
  browser: true,
  noempty: true,
  maxerr: 50
}

function linter (code) {
  JSHINT(code, options, globals)
  let errz = JSHINT.data().errors

  if (errz) {
    for (let i = 0; i < errz.length; i++) errz[i] = JSTranslateError(errz[i])
    errz = errz.filter(e => e !== null)
  }

  // filter out "nulls", ie. errors to be ignored, ex W060
  return errz || []
}

module.exports = linter
