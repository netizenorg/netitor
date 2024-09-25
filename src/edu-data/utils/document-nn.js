#!/usr/bin/env node

/**
 * document-nn.js
 *
 * This script parses a Markdown (.md) file containing documentation
 * and generates a module.exports object with structured documentation.
 *
 * Usage:
 *   node document-nn.js path/to/documentation.md
 *
 * The output is written to 'nn-docs.js' in the current directory.
 */

// Import required modules
const fs = require('fs')
const path = require('path')

// Helper function to convert HTML to plain text
function htmlToText (html) {
  // Remove HTML tags using regex
  let text = html.replace(/<\/?[^>]+(>|$)/g, '')

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

// Helper function to extract the key name from <dt>
function extractKey (dtContent) {
  // Match the content inside <a href="#key">KeyName()</a>
  const aTagMatch = dtContent.match(/<a\s+href="#([^"]+)">([^<]+)<\/a>/i)

  if (aTagMatch && aTagMatch.length >= 3) {
    let key = aTagMatch[2].trim()

    // Remove any parentheses and content after them
    key = key.split('(')[0]

    // Remove any trailing underscores or non-alphanumeric characters
    key = key.replace(/[^a-zA-Z0-9_]/g, '')

    return key
  }

  return null
}

// Helper function to check if a string is a valid JS identifier
function isValidIdentifier (str) {
  // Regular expression for valid JavaScript identifiers
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(str)
}

// Custom serialization function to convert object to JS string
function serializeToJS (obj, indent = 2) {
  const spacer = ' '.repeat(indent)

  if (typeof obj === 'string') {
    // Escape single quotes and backslashes in strings
    const escapedStr = obj.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    return `'${escapedStr}'`
  }

  if (Array.isArray(obj)) {
    const arrayItems = obj.map(item => serializeToJS(item, indent + 2))
    return `[\n${spacer}${arrayItems.join(`,\n${spacer}`)}\n${' '.repeat(indent - 2)}]`
  }

  if (typeof obj === 'object' && obj !== null) {
    const entries = Object.entries(obj).map(([key, value]) => {
      const serializedKey = isValidIdentifier(key) ? key : `'${key.replace(/'/g, "\\'")}'`
      const serializedValue = serializeToJS(value, indent + 2)
      return `${serializedKey}: ${serializedValue}`
    })
    return `{\n${spacer}${entries.join(`,\n${spacer}`)}\n${' '.repeat(indent - 2)}}`
  }

  // For other types (number, boolean, null, undefined), use JSON.stringify
  return JSON.stringify(obj)
}

// Check for correct usage
if (process.argv.length < 3) {
  console.error('Usage: node document-nn.js path/to/documentation.md')
  process.exit(1)
}

// Get the input file path
const inputFilePath = process.argv[2]

// Verify that the input file exists
if (!fs.existsSync(inputFilePath)) {
  console.error(`Error: File not found at path "${inputFilePath}"`)
  process.exit(1)
}

// Read the content of the input file
const fileContent = fs.readFileSync(inputFilePath, 'utf8')

// Function to extract methods/properties and their descriptions
function extractDocs (content) {
  const docs = []

  // Define sections to parse (Members and Functions)
  const sections = ['Members', 'Functions']

  sections.forEach(section => {
    // Create a regex to find the section
    const sectionRegex = new RegExp(`##\\s+${section}[\\s\\S]*?(?=##\\s+|$)`, 'gi')
    const sectionMatch = content.match(sectionRegex)

    if (sectionMatch) {
      // For each matched section
      sectionMatch.forEach(sec => {
        // Regex to find all <dt>...</dt> and <dd>...</dd> pairs
        const dtDdRegex = /<dt>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi
        let match

        while ((match = dtDdRegex.exec(sec)) !== null) {
          const dtContent = match[1].trim()
          const ddContent = match[2].trim()

          const key = extractKey(dtContent)

          if (key) {
            docs.push({
              key: key,
              descriptionHtml: ddContent
            })
          } else {
            console.warn('Warning: Could not extract key from <dt> content:', dtContent)
          }
        }
      })
    }
  })

  return docs
}

// Extract documentation entries
const docs = extractDocs(fileContent)

// Initialize the exports object
const exportsObject = {}

// Iterate over each documentation entry and construct the documentation object
docs.forEach(doc => {
  const { key, descriptionHtml } = doc

  // Remove <p> tags from descriptionHtml
  let cleanedDescriptionHtml = descriptionHtml.replace(/^<p>([\s\S]+)<\/p>$/i, '$1')

  // Check if cleanedDescriptionHtml ends with a period
  const endsWithPeriod = cleanedDescriptionHtml.trim().endsWith('.')

  // If not, append a period
  if (!endsWithPeriod) {
    cleanedDescriptionHtml += '.'
  }

  // Convert HTML description to plain text
  let descriptionText = htmlToText(cleanedDescriptionHtml)

  // Remove the appended period from text if it was already present in the HTML
  // to prevent duplicate periods
  if (endsWithPeriod && descriptionText.endsWith('.')) {
    // No action needed as we already have one period
  } else if (!endsWithPeriod && descriptionText.endsWith('.')) {
    // Remove the extra period if it was added
    descriptionText = descriptionText.slice(0, -1)
  }

  // Ensure there's a space between the preamble and the description in HTML
  // Insert a space after the preamble's period
  const htmlPreamble = 'If you\'ve included the netnet-standard-library in your project then you should have access to the global <code>nn</code> object in your JavaScript.'
  const htmlConcluding = 'To learn how to use external libraries like this one you should always start by referring to library\'s documentation often found on their <a href="https://github.com/netizenorg/netnet-standard-library/#netnet-standard-library" target="_blank">website or GitHub page</a>.'

  const fullHtml = `${htmlPreamble} ${cleanedDescriptionHtml.trim()} ${htmlConcluding}`

  // Similarly, ensure a space in the text field
  const textPreamble = 'If you\'ve included the netnet-standard-library in your project then you should have access to the global nn object in your JavaScript.'
  const textConcluding = 'To learn how to use external libraries like this one you should always start by referring to library\'s documentation often found on their website or GitHub page.'

  const fullText = `${textPreamble} ${descriptionText.trim()} ${textConcluding}`

  // Construct the documentation entry
  exportsObject[key] = {
    status: 'standard',
    url: `https://github.com/netizenorg/netnet-standard-library/blob/main/docs/API.md#${key}`,
    html: fullHtml,
    text: fullText
  }
})

// Define the output file path
const outputFilePath = path.join(process.cwd(), 'nn-docs.js')

// Convert the exports object to a properly formatted JS string
const serializedExports = serializeToJS(exportsObject, 2)

// Define the final content with module.exports
const outputContent = `module.exports = ${serializedExports};\n`

// Write the output to the file
fs.writeFileSync(outputFilePath, outputContent, 'utf8')

console.log(`Documentation successfully written to ${outputFilePath}`)
