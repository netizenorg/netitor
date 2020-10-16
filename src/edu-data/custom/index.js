const fs = require('fs')
const path = require('path')
const cssProps = require('../css-properties.json')
const customCSSProps = require('./custom-css-properties.js')

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
