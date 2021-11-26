module.exports = (code, proxy) => {
  const jsRegex = /(?:<(script)(?:\s+(?=((?:"[\S\s]*?"|'[\S\s]*?'|(?:(?!\/>)[^>])?)+))\2)?\s*>)/g
  const cssRegex = /(?:<(link)(?:\s+(?=((?:"[\S\s]*?"|'[\S\s]*?'|(?:(?!\/>)[^>])?)+))\2)?\s*>)/g
  const attrRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g

  // prepend proxy URL to any relative paths in <script src="...">
  const jsMatches = code.match(jsRegex) || []
  jsMatches.forEach((m, i) => {
    if (m.includes('src="') && !m.includes('src="http')) {
      const swap = m.replace('src="', `src="${proxy}`)
      code = code.replace(m, swap)
    } else if (m.includes("src='") && !m.includes("src='http")) {
      const swap = m.replace("src='", `src="${proxy}`)
      code = code.replace(m, swap)
    }
  })

  // prepend proxy URL to any relative paths in <link href="...">
  const cssMatches = code.match(cssRegex) || []
  cssMatches.forEach((m, i) => {
    if (m.includes('href="') && !m.includes('href="http')) {
      const swap = m.replace('href="', `href="${proxy}`)
      code = code.replace(m, swap)
    } else if (m.includes("href='") && !m.includes("href='http")) {
      const swap = m.replace("href='", `href="${proxy}`)
      code = code.replace(m, swap)
    }
  })

  // prepend proxy URL to any realtive paths in <a href="...">
  code = code.replace(attrRegex, (attr) => {
    const a = attr.split('=')
    if (a[0] === 'href' && a[1].indexOf('http') !== 1) {
      a[1] = `"${proxy}${a[1].substring(1, a[1].length - 1)}"`
    }
    return `${a[0]}=${a[1]}`
  })

  return code
}
