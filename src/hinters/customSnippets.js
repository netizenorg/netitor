const hint = (cm, self, data) => {
  // custom hint function for snippets
  // so that it "smart indents" multi-line content
  const from = cm.getCursor('from')
  from.ch = cm.getLine(from.line).indexOf(cm.getLine(from.line).trim())
  const to = cm.getCursor('to')
  const str = data.text
  cm.replaceSelection(str)
  const lines = (str.match(/\n/g) || '').length + 1
  const t = { line: to.line + lines }
  cm.setSelection(from, t)
  cm.indentSelection('smart')
  // cm.setSelection(t)
}

const list = (type, str) => {
  const t = type.split('.')
  const dict = (t.length === 2) ? snippets[t[0]][t[1]] : snippets[t[0]]
  const list = []
  for (const snip in dict) {
    const text = dict[snip]
    const displayText = snip
    if (displayText.includes(str)) list.push({ text, displayText, hint })
  }
  return list
}

const snippets = {
  html: {
    doctype: '<!DOCTYPE html>',
    html: 'html lang="en-US"><CURSOR_GOES_HERE></html>',
    link: 'link rel="stylesheet" href="#">',
    a: 'a href="#"><CURSOR_GOES_HERE></a>',
    'a (new tab)': '<a href="#" target="_blank"><CURSOR_GOES_HERE></a>',
    img: 'img src="<CURSOR_STARTS_HERE>filename.jpg<CURSOR_ENDS_HERE>" alt="description of image">',
    'html (template)': '<!DOCTYPE html>\n<html lang="en-US">\n\t<head>\n\t\t<meta charset="utf-8">\n\t\t<title>Untitled</title>\n\t</head>\n\t<body>\n\t\t<CURSOR_GOES_HERE>\n\t</body>\n</html>\n'
  },
  css: {
    atRules: {
      '@keyframes (template)': '@keyframes {\n0% {\n<CURSOR_STARTS_HERE>/* from this */<CURSOR_ENDS_HERE>\n}\n100% {\n/* to this */\n}\n}',
      '@media (template)': '@media (max-width: 415px) {\n<CURSOR_STARTS_HERE>/* screens less than 415px wide */<CURSOR_ENDS_HERE>\n}',
      '@font-face (template)': '@font-face {\nfont-family: "<CURSOR_STARTS_HERE>your-font-name<CURSOR_ENDS_HERE>";\nsrc: url("path/to/your-font-file.woff2") format("woff2"),\nurl("path/to/your-font-file.woff") format("woff");\n}'
    }
  },
  js: {
    for: 'for (let i = 0; i < <CURSOR_STARTS_HERE>100<CURSOR_ENDS_HERE>; i++) {\n\n}\n',
    while: 'let i = 0\nwhile (i < <CURSOR_STARTS_HERE>100<CURSOR_ENDS_HERE>) {\ni++\n}',
    function: 'function <CURSOR_STARTS_HERE>name<CURSOR_ENDS_HERE> () {\n\n}\n',
    'canvas (template)': '// create canvas\nconst canvas = document.createElement(\'canvas\')\ndocument.body.appendChild(canvas)\nconst ctx = canvas.getContext(\'2d\')\n\n// initial setup function (runs once)\nfunction setup () {\n\n}\n\n// draw loop (runs ~60 times a second)\nfunction draw () {\nrequestAnimationFrame(draw)\n  \n}\n\n// run setup() and draw() when page loads\nwindow.addEventListener(\'load\', setup)\nwindow.addEventListener(\'load\', draw)\n',
    'canvas (template++)': '// create canvas\nconst canvas = document.createElement(\'canvas\')\ncanvas.width = window.innerWidth\ncanvas.height = window.innerHeight\ndocument.body.appendChild(canvas)\nconst ctx = canvas.getContext(\'2d\')\n\n// initial setup function (runs once)\nfunction setup () {\nconst x = canvas.width / 2 - 50\nconst y = canvas.height / 2 - 50\nctx.fillRect(x, y, 100, 100)\n}\n\n// draw loop (runs ~60 times a second)\nfunction draw () {\nrequestAnimationFrame(draw)\nctx.fillStyle = \'pink\'\nconst x = Math.random() * canvas.width\nconst y = Math.random() * canvas.height\nctx.fillRect(x, y, 10, 10)\n}\n\n// run setup() and draw() when page loads\nwindow.addEventListener(\'load\', setup)\nwindow.addEventListener(\'load\', draw)\n'
  }
}

const classIdSnippets = ['div', 'section', 'span', 'p']
classIdSnippets.forEach(snip => {
  let key = `${snip} (class)`
  let val = `<${snip} class="<CURSOR_GOES_HERE>"></${snip}>`
  snippets.html[key] = val
  key = `${snip} (id)`
  val = `<${snip} id="<CURSOR_GOES_HERE>"></${snip}>`
  snippets.html[key] = val
})

module.exports = { hint, snippets, list }
