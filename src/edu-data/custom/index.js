const fs = require('fs')
const path = require('path')
const cssProps = require('../css-properties.json')
const customCSSProps = require('./custom-css-properties.js')
const cssFuncs = require('../css-functions.json')
const customCSSFuncs = require('./custom-css-functions.js')
const htmlAttrs = require('../html-attributes.json')
const customHtmlAttrs = require('./custom-html-attributes.js')

function save (dictionary, destination) {
  const str = JSON.stringify(dictionary, null, 2)
  fs.writeFile(destination, str, (err) => { if (err) console.log(err) })
}

function updateDict (original, updated, filepath) {
  for (const prop in updated) original[prop] = updated[prop]
  const originalPath = path.join(__dirname, filepath)
  save(original, originalPath)
}

updateDict(cssProps, customCSSProps, '../css-properties.json')
updateDict(cssFuncs, customCSSFuncs, '../css-functions.json')
updateDict(htmlAttrs, customHtmlAttrs, '../html-attributes.json')
