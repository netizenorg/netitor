const JSHINT = require('jshint').JSHINT
const globals = require('./js-globals.json')

const options = {
  esversion: 6,
  undef: true, // catch undefined variables
  latedef: true, // make sure they're defined before used
  unused: true, // catch unused vars  // TODO: make 'warning'
  eqeqeq: true, // require === vs == (etc)
  varstmt: true, // prevent 'var'
  asi: true, // supress semicolon errors
  browser: true,
  maxerr: 50
}

function linter (code) {
  JSHINT(code, options, globals)
  const errz = JSHINT.data().errors
  // console.log(errz)

  if (errz) { // TODO: replace w/friendly-translator
    for (let i = 0; i < errz.length; i++) {
      errz[i].friendly = errz[i].reason
    }
  }
  return errz || []
}

module.exports = linter
