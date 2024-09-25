const fs = require('fs')
const path = require('path')

// Function to sort object keys alphabetically
const sortKeysAlphabetically = (obj) => {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key]
      return acc
    }, {})
}

// Main function to read, sort, and write the JSON file
const processJsonFile = (filePath) => {
  const absolutePath = path.resolve(filePath)

  // Read the original JSON file
  const data = fs.readFileSync(absolutePath, 'utf8')
  const jsonObject = JSON.parse(data)

  // Sort the keys alphabetically
  const sortedJsonObject = sortKeysAlphabetically(jsonObject)

  // Create a new file name with "-sorted" suffix
  const newFileName = path.basename(filePath, '.json') + '-sorted.json'
  const newFilePath = path.join(path.dirname(absolutePath), newFileName)

  // Write the sorted JSON to a new file
  fs.writeFileSync(newFilePath, JSON.stringify(sortedJsonObject, null, 2), 'utf8')

  console.log(`Sorted JSON saved to ${newFilePath}`)
}

// Get the relative file path from the command line argument
const relativeFilePath = process.argv[2]

if (!relativeFilePath) {
  console.error('Please provide the relative path to a JSON file.')
  process.exit(1)
}

// Process the provided JSON file
processJsonFile(relativeFilePath)
