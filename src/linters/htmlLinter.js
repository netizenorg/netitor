// TODO: would like to use htmllint...
// but having this issue: https://github.com/htmllint/htmllint/issues/41
// const HTMLLint = require('htmllint')

const htmlparser2 = require('htmlparser2')

function linter (code) {
  const parser = new htmlparser2.Parser({
    onopentag (name, attribs) {
      if (name === 'script') {
        console.log('JS! Hooray!')
      }
    },
    // ontext (text) {
    //   console.log('-->', text)
    // },
    // onclosetag (tagname) {
    //   if (tagname === 'script') {
    //     console.log('That\'s it?!')
    //   }
    // }
    onerror (err) {
      console.log(err)
    }
  }, { decodeEntities: true })
  parser.write(this.code)
  parser.end()

  return null
}

module.exports = linter
