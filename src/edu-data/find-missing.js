/* eslint-disable no-prototype-builtins */
const fs = require('fs')
const path = require('path')

// Function to load a JSON file and parse it
const loadJSONFile = (filePath) => {
  const absolutePath = path.resolve(filePath)
  const data = fs.readFileSync(absolutePath, 'utf8')
  return JSON.parse(data)
}

// Function to find missing keys
const findMissingKeys = (json1, json2) => {
  const missingKeys = {}
  for (const key in json2) {
    if (!json1.hasOwnProperty(key)) {
      missingKeys[key] = json2[key]
    }
  }
  return missingKeys
}

// Main function to handle the comparison
const compareJSONFiles = (file1, file2, outputFile) => {
  const json1 = loadJSONFile(file1)
  const json2 = loadJSONFile(file2)

  const missingKeys = findMissingKeys(json1, json2)

  // Write the result to a new JSON file
  fs.writeFileSync(outputFile, JSON.stringify(missingKeys, null, 2), 'utf8')
  console.log(`Missing keys saved to ${outputFile}`)
}

// Usage example
const file1 = process.argv[2]
const file2 = process.argv[3]
const outputFile = './missingKeys.json' // Output file path

compareJSONFiles(file1, file2, outputFile)
