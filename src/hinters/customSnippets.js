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

const creativeLibImports = {
  d3: '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.4/d3.min.js"></script>',
  gsap: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>',
  hydra: '<script src="https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js"></script>',
  nn: '<script src="https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js"></script>',
  p5: '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.10.0/p5.min.js"></script>',
  paper: '<script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.15/paper-full.min.js"></script>',
  three: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.js"></script>',
  tone: '<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.39/Tone.min.js"></script>'
}

const creativeLibTemplates = {
  d3: `${creativeLibImports.d3}\n<script>\n\t/* global d3 */\n\tfunction setup () {\n\t\tconst data = [30, 86, 168, 281, 303, 365]\n\t\tconst width = 400\n\t\tconst height = 400\n\t\tconst barWidth = width / data.length\n\n\t\tconst svg = d3.select('body')\n\t\t\t.append('svg')\n\t\t\t.attr('width', width)\n\t\t\t.attr('height', height)\n\n\t\tsvg.selectAll('rect')\n\t\t\t.data(data)\n\t\t\t.enter()\n\t\t\t\t.append('rect')\n\t\t\t\t.attr('x', (d, i) => i * barWidth)\n\t\t\t\t.attr('y', d => height - d)\n\t\t\t\t.attr('width', barWidth - 5)\n\t\t\t\t.attr('height', d => d)\n\t\t\t\t.style('fill', 'teal')\n\t}\n\t\n\twindow.addEventListener('load', setup)\n</script>`,

  gsap: `${creativeLibImports.gsap}\n<script>\n\t/* global gsap */\n\tfunction setup () {\n\t\t// Create a box element\n\t\tconst box = document.createElement('div')\n\t\tbox.style.width = '100px'\n\t\tbox.style.height = '100px'\n\t\tbox.style.backgroundColor = 'red'\n\t\tbox.style.position = 'absolute'\n\t\tbox.style.top = '50px'\n\t\tbox.style.left = '50px'\n\t\tdocument.body.appendChild(box)\n\t\t\n\t\t// Animate the box using GSAP\n\t\tgsap.to(box, {\n\t\t\tduration: 2,\n\t\t\tx: 300,\n\t\t\trotation: 360,\n\t\t\tscale: 1.5,\n\t\t\trepeat: -1,\n\t\t\tyoyo: true,\n\t\t\tease: 'power1.inOut'\n\t\t})\n\t}\n\t\n\twindow.addEventListener('load', setup)\n</script>`,

  hydra: `${creativeLibImports.hydra}\n<script>\n\t/* global Hydra, osc */\n\tfunction setup () {\n\t\tconst canvas = document.createElement('canvas')\n\t\tcanvas.width = 400\n\t\tcanvas.height = 400\n\t\t\n\t\tconst hydra = new Hydra({ canvas, detectAudio: false })\n\t\t\n\t\tosc(10, 0.1, 1.2)\n\t\t\t.color(0.9, 0.8, 0.2)\n\t\t\t.out()\n\t\t\n\t\tdocument.body.appendChild(hydra.canvas)\n\t}\n\t\n\twindow.addEventListener('load', setup)\n</script>`,

  nn: `${creativeLibImports.nn}\n<script>\n\t/* global nn */\n\t<CURSOR_GOES_HERE>\n</script>`,

  p5: `${creativeLibImports.p5}\n<script>\n\t/* global p5 */\n\tlet sketch = (p) => {\n\t\tp.setup = () => {\n\t\t\tp.createCanvas(400, 400)\n\t\t\tp.background(0, 255, 255)\n\t\t}\n\n\t\tp.draw = () => {\n\t\t\tp.fill(255, 0, 200)\n\t\t\tp.ellipse(p.mouseX, p.mouseY, 50, 50)\n\t\t}\n\t}\n\tnew p5(sketch)\n</script>`,

  paper: `<div>click on the canvas below</div>\n${creativeLibImports.paper}\n<script>\n\t/* global paper */\n\tconst circles = []\n\t\n\t// function to run when we click on the canvas\n\tfunction click(event) {\n\t\tconst circle = new paper.Path.Circle({\n\t\t\tcenter: event.point,\n\t\t\tradius: 20,\n\t\t\tfillColor: 'blue',\n\t\t\tstrokeColor: 'black',\n\t\t\tstrokeWidth: 2\n\t\t})\n\n\t\tcircles.push(circle)\n\n\t\t// Animate the circle's radius\n\t\tcircle.onFrame = function () {\n\t\t\tthis.scale(0.99)\n\t\t\tif (this.bounds.width < 1) {\n\t\t\t\tthis.remove()\n\t\t\t\tcircles.splice(circles.indexOf(this), 1)\n\t\t\t}\n\t\t}\n\t}\n\n\tfunction setup() {\n\t\t// Create and append the canvas to the document body\n\t\tconst canvas = document.createElement('canvas')\n\t\tcanvas.width = 400\n\t\tcanvas.height = 400\n\t\tdocument.body.appendChild(canvas)\n\n\t\t// Setup Paper.js with the created canvas\n\t\tpaper.setup(canvas)\n\n\t\t// Create a background rectangle\n\t\tnew paper.Path.Rectangle({\n\t\t\tpoint: [0, 0],\n\t\t\tsize: [400, 400],\n\t\t\tfillColor: '#f0f0f0'\n\t\t})\n\n\t\t// Function to handle mouse clicks\n\t\tpaper.view.attach('mousedown', click)\n  }\n\n  window.addEventListener('load', setup)\n</script>`,

  three: `${creativeLibImports.three}\n<script>\n\t/* global THREE */\n\tlet scene, camera, renderer, cube\n\tlet width = 400\n\tlet height = 400\n\t\t\n\tfunction setup () {\n\t\tscene = new THREE.Scene()\n\t\tcamera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000)\n\n\t\trenderer = new THREE.WebGLRenderer()\n\t\trenderer.setSize(width, height)\n\t\tdocument.body.appendChild(renderer.domElement)\n\n\t\tconst geometry = new THREE.BoxGeometry(1, 1, 1)\n\t\tconst material = new THREE.MeshNormalMaterial()\n\t\tcube = new THREE.Mesh(geometry, material)\n\t\tscene.add(cube)\n\n\t\tcamera.position.z = 2\n\t}\n\t\n\tfunction animate() {\n\t\trequestAnimationFrame(animate)\n\t\n\t\tcube.rotation.x += 0.01\n\t\tcube.rotation.y += 0.01\n\n\t\trenderer.render(scene, camera)\n\t}\n\n\twindow.addEventListener('load', setup)\n\twindow.addEventListener('load', animate)\n\t\n</script>`,

  tone: `<div>click anywhere to play a note</div>\n${creativeLibImports.tone}\n<script>\n\t/* global Tone */\n\tlet synth\n\tfunction setup () {\n\t\tsynth = new Tone.Synth().toDestination()\n\t}\n\t\n\tfunction play () {\n\t\tsynth.triggerAttackRelease('C4', '8n')\n\t}\n\t\n\twindow.addEventListener('load', setup)\n\twindow.addEventListener('click', play)\n</script>`
}

const snippets = {
  html: {
    doctype: '<!DOCTYPE html>',
    html: 'html lang="en-US"><CURSOR_GOES_HERE></html>',
    link: 'link rel="stylesheet" href="#">',
    a: 'a href="#"><CURSOR_GOES_HERE></a>',
    'a (new tab)': '<a href="#" target="_blank"><CURSOR_GOES_HERE></a>',
    img: 'img src="<CURSOR_STARTS_HERE>filename.jpg<CURSOR_ENDS_HERE>" alt="description of image">',
    'html (template)': '<!DOCTYPE html>\n<html lang="en-US">\n\t<head>\n\t\t<meta charset="utf-8">\n\t\t<title>Untitled</title>\n\t</head>\n\t<body>\n\t\t<CURSOR_GOES_HERE>\n\t</body>\n</html>\n',
    'script (d3.js)': creativeLibImports.d3,
    'script (gsap.js)': creativeLibImports.gsap,
    'script (hydra.js)': creativeLibImports.hydra,
    'script (nn.js)': creativeLibImports.nn,
    'script (p5.js)': creativeLibImports.p5,
    'script (paper.js)': creativeLibImports.paper,
    'script (three.js)': creativeLibImports.three,
    'script (tone.js)': creativeLibImports.tone,
    'd3.js (template)': creativeLibTemplates.d3,
    'gsap.js (template)': creativeLibTemplates.gsap,
    'hydra.js (template)': creativeLibTemplates.hydra,
    'nn.js (template)': creativeLibTemplates.nn,
    'p5.js (template)': creativeLibTemplates.p5,
    'paper.js (template)': creativeLibTemplates.paper,
    'three.js (template)': creativeLibTemplates.three,
    'tone.js (template)': creativeLibTemplates.tone
  },
  svg: {},
  css: {
    atRules: {
      '@keyframes (template)': '@keyframes {\n0% {\n<CURSOR_STARTS_HERE>/* from this */<CURSOR_ENDS_HERE>\n}\n100% {\n/* to this */\n}\n}',
      '@media (template)': '@media (max-width: 415px) {\n<CURSOR_STARTS_HERE>/* screens less than 415px wide */<CURSOR_ENDS_HERE>\n}',
      '@font-face (template)': '@font-face {\nfont-family: "<CURSOR_STARTS_HERE>your-font-name<CURSOR_ENDS_HERE>";\nsrc: url("path/to/your-font-file.woff2") format("woff2"),\nurl("path/to/your-font-file.woff") format("woff");\n}'
    }
  },
  js: {
    for: 'for (let i = 0; i < <CURSOR_STARTS_HERE>100<CURSOR_ENDS_HERE>; i++) {\n\n}\n',
    while: 'let i = 0\nwhile (i < <CURSOR_STARTS_HERE>100<CURSOR_ENDS_HERE>) {\n\ni++\n}\n',
    function: 'function <CURSOR_STARTS_HERE>name<CURSOR_ENDS_HERE> () {\n\n}\n',
    'canvas (template)': '// create canvas\nconst canvas = document.createElement(\'canvas\')\nconst ctx = canvas.getContext(\'2d\')\n\n// initial setup function (runs once)\nfunction setup () {\ndocument.body.appendChild(canvas)\n  \n}\n\n// draw loop (runs ~60 times a second)\nfunction draw () {\nrequestAnimationFrame(draw)\n  \n}\n\n// run setup() and draw() when page loads\nwindow.addEventListener(\'load\', setup)\nwindow.addEventListener(\'load\', draw)\n',
    'canvas (template++)': '// create canvas\nconst canvas = document.createElement(\'canvas\')\ncanvas.width = window.innerWidth\ncanvas.height = window.innerHeight\nconst ctx = canvas.getContext(\'2d\')\n\n// initial setup function (runs once)\nfunction setup () {\ndocument.body.appendChild(canvas)\nconst x = canvas.width / 2 - 50\nconst y = canvas.height / 2 - 50\nctx.fillRect(x, y, 100, 100)\n}\n\n// draw loop (runs ~60 times a second)\nfunction draw () {\nrequestAnimationFrame(draw)\nctx.fillStyle = \'pink\'\nconst x = Math.random() * canvas.width\nconst y = Math.random() * canvas.height\nctx.fillRect(x, y, 10, 10)\n}\n\n// run setup() and draw() when page loads\nwindow.addEventListener(\'load\', setup)\nwindow.addEventListener(\'load\', draw)\n',
    log: 'console.log(<CURSOR_STARTS_HERE>\'hello world\'<CURSOR_ENDS_HERE>)'
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
