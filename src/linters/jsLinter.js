const JSHINT = require('jshint').JSHINT
const globals = require('./js-globals.json')
const JSTranslateError = require('./js-friendly-translator.js')

const options = {
  esversion: 8,
  undef: true, // catch undefined variables
  latedef: true, // make sure they're defined before used
  unused: true, // catch unused vars  // TODO: make 'warning'
  eqeqeq: true, // require === vs == (etc)
  varstmt: true, // prevent 'var'
  asi: true, // supress semicolon errors
  browser: true,
  noempty: true,
  maxerr: 50
}

function linter (code) {
  JSHINT(code, options, globals)
  const errz = JSHINT.data().errors

  if (errz) {
    for (let i = 0; i < errz.length; i++) errz[i] = JSTranslateError(errz[i])
  }
  return errz || []
}

module.exports = linter
