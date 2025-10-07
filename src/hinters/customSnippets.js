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
  d3: '<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>',
  gsap: '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>',
  hydra: '<script src="https://unpkg.com/hydra-synth@1.3.29/dist/hydra-synth.js"></script>',
  nn: '<script src="https://cdn.jsdelivr.net/gh/netizenorg/netnet-standard-library/build/nn.min.js"></script>',
  p5: '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.10.0/p5.min.js"></script>',
  paper: '<script src="https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.15/paper-full.min.js"></script>',
  three: '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.js"></script>',
  tone: '<script src="https://unpkg.com/tone"></script>',
  two: '<script src="https://cdn.jsdelivr.net/npm/two.js@latest/build/two.js"></script>'
}

const creativeLibTemplates = {
  d3: `${creativeLibImports.d3}
<script>
  /* global d3 */
  function setup() {
    const data = [30, 86, 168, 281, 303, 365]
    const width = 400
    const height = 400
    const barWidth = width / data.length

    const svg = d3.select('body')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i * barWidth)
      .attr('y', d => height - d)
      .attr('width', barWidth - 5)
      .attr('height', d => d)
      .style('fill', 'teal')
  }

  window.addEventListener('load', setup)
</script>`,

  gsap: `${creativeLibImports.gsap}
<script>
  /* global gsap */
  function setup() {
    // Create a box element
    const box = document.createElement('div')
    box.style.width = '100px'
    box.style.height = '100px'
    box.style.backgroundColor = 'red'
    box.style.position = 'absolute'
    box.style.top = '50px'
    box.style.left = '50px'
    document.body.appendChild(box)

    // Animate the box using GSAP
    gsap.to(box, {
      duration: 2,
      x: 300,
      rotation: 360,
      scale: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    })
  }

  window.addEventListener('load', setup)
</script>`,

  hydra: `${creativeLibImports.hydra}
<script>
  /* global Hydra, osc */
  function setup() {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400

    const hydra = new Hydra({
      canvas,
      detectAudio: false
    })

    osc(10, 0.1, 1.2)
      .color(0.9, 0.8, 0.2)
      .out()

    document.body.appendChild(hydra.canvas)
  }

  window.addEventListener('load', setup)
</script>`,

  nn: `${creativeLibImports.nn}
<script>
  /* global nn */
  function randomBG () {
    nn.get('body')
      .css({ background: nn.randomColor() })
  }

  nn.on('load', randomBG)
  nn.on('click', randomBG)
</script>`,

  p5: `${creativeLibImports.p5}
<script>
  /* global p5 */
  let sketch = (p) => {
    p.setup = () => {
      p.createCanvas(400, 400)
      p.background(0, 255, 255)
    }

    p.draw = () => {
      p.fill(255, 0, 200)
      p.ellipse(p.mouseX, p.mouseY, 50, 50)
    }
  }
  new p5(sketch)
</script>`,

  paper: `<div>click on the canvas below</div>
${creativeLibImports.paper}
<script>
  /* global paper */
  const circles = []

  // function to run when we click on the canvas
  function click(event) {
    const circle = new paper.Path.Circle({
      center: event.point,
      radius: 20,
      fillColor: 'blue',
      strokeColor: 'black',
      strokeWidth: 2
    })

    circles.push(circle)

    // Animate the circle's radius
    circle.onFrame = function() {
      this.scale(0.99)
      if (this.bounds.width < 1) {
        this.remove()
        circles.splice(circles.indexOf(this), 1)
      }
    }
  }

  function setup() {
    // Create and append the canvas to the document body
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    document.body.appendChild(canvas)

    // Setup Paper.js with the created canvas
    paper.setup(canvas)

    // Create a background rectangle
    new paper.Path.Rectangle({
      point: [0, 0],
      size: [400, 400],
      fillColor: '#f0f0f0'
    })

    // Function to handle mouse clicks
    paper.view.attach('mousedown', click)
  }

  window.addEventListener('load', setup)
</script>`,

  three: `${creativeLibImports.three}
<script>
  /* global THREE */
  let scene, camera, renderer, cube
  let width = 400
  let height = 400

  function setup() {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(width, height)
    document.body.appendChild(renderer.domElement)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial()
    cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 2
  }

  function animate() {
    requestAnimationFrame(animate)

    cube.rotation.x += 0.01
    cube.rotation.y += 0.01

    renderer.render(scene, camera)
  }

  window.addEventListener('load', setup)
  window.addEventListener('load', animate)
</script>`,

  tone: `<div>click anywhere to play a note</div>
${creativeLibImports.tone}
<script>
  /* global Tone */
  let synth

  function setup() {
    synth = new Tone.Synth().toDestination()
  }

  function play() {
    synth.triggerAttackRelease('C4', '8n')
  }

  window.addEventListener('load', setup)
  window.addEventListener('click', play)
</script>`,
  two: `${creativeLibImports.two}
<script>
  /* global Two */
  const two = new Two()
  let group

  function setup () {
    two.appendTo(document.body)

    const circle = two.makeCircle(-70, 0, 50)
    const rect = two.makeRectangle(70, 0, 100, 100)
    circle.fill = '#FF8000'
    rect.fill = 'rgba(0, 200, 255, 0.75)'

    const cx = two.width * 0.5
    const cy = two.height * 0.5
    group = two.makeGroup(circle, rect)
    group.position.set(cx, cy)
    group.scale = 0
    group.noStroke()

    // run animate everytime Two update
    two.bind('update', animate)
    two.play() // start Two's "update" ~60fps
  }

  function animate (frameCount) {
    // this runs every time two.update() is called
    if (group.scale > 0.9999) {
      group.scale = group.rotation = 0
    }
    const t = (1 - group.scale) * 0.04
    group.scale += t
    group.rotation += t * 4 * Math.PI
  }

  window.addEventListener('load', setup)
</script>`
}

const snippets = {
  html: {
    doctype: '<!DOCTYPE html>',
    html: 'html lang="en-US"><CURSOR_GOES_HERE></html>',
    link: 'link rel="stylesheet" href="#">',
    a: 'a href="#"><CURSOR_GOES_HERE></a>',
    'a (new tab)': '<a href="#" target="_blank"><CURSOR_GOES_HERE></a>',
    img: 'img src="<CURSOR_STARTS_HERE>filename.jpg<CURSOR_ENDS_HERE>" alt="description of image">',
    'html (template)': `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <title>Untitled</title>
  </head>
  <body>
    <CURSOR_GOES_HERE>
  </body>
</html>`,
    'script (d3.js)': creativeLibImports.d3,
    'script (gsap.js)': creativeLibImports.gsap,
    'script (hydra.js)': creativeLibImports.hydra,
    'script (nn.js)': creativeLibImports.nn,
    'script (p5.js)': creativeLibImports.p5,
    'script (paper.js)': creativeLibImports.paper,
    'script (three.js)': creativeLibImports.three,
    'script (tone.js)': creativeLibImports.tone,
    'script (two.js)': creativeLibImports.two,
    'd3.js (template)': creativeLibTemplates.d3,
    'gsap.js (template)': creativeLibTemplates.gsap,
    'hydra.js (template)': creativeLibTemplates.hydra,
    'nn.js (template)': creativeLibTemplates.nn,
    'p5.js (template)': creativeLibTemplates.p5,
    'paper.js (template)': creativeLibTemplates.paper,
    'three.js (template)': creativeLibTemplates.three,
    'tone.js (template)': creativeLibTemplates.tone,
    'two.js (template)': creativeLibTemplates.two,
    svg: `<svg width="200" height="200">
  <circle
    cx="100"
    cy="120"
    r="70"
    fill="pink">
  </circle>
</svg>`
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
