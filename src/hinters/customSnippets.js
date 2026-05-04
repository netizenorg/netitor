const hint = (cm, self, data) => {
  // custom hint function for snippets
  // so that it "smart indents" multi-line content
  const from = cm.getCursor('from')
  from.ch = cm.getLine(from.line).indexOf(cm.getLine(from.line).trim())
  const to = cm.getCursor('to')
  const str = data.text
  cm.replaceSelection(str)
  const lines = (str.match(/\n/g) || '').length + 1
  if (lines > 1) {
    const t = { line: to.line + lines }
    cm.setSelection(from, t)
    cm.indentSelection('smart')
  }
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
  anime: '<script src="https://cdn.jsdelivr.net/npm/animejs/dist/bundles/anime.umd.min.js"></script>',
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
  anime: `${creativeLibImports.anime}
<script>
  function setup () {
    const el = document.createElement('div')
    el.textContent = 'Welcome!'
    el.style.fontSize = '64px'
    el.style.margin = '240px auto'
    el.style.width = 'fit-content'
    document.body.appendChild(el)

    const { chars } = anime.splitText(el, {
      words: false,
      chars: true
    })

    anime.animate(chars, {
      y: [
        { to: '-2.75rem', ease: 'outExpo', duration: 600 },
        { to: 0, ease: 'outBounce', duration: 800, delay: 100 }
      ],
      rotate: { from: '-360deg', delay: 100 },
      delay: anime.stagger(50),
      loopDelay: 1000,
      loop: true
    })
  }

  window.addEventListener('load', setup)
</script>`,
  d3: `${creativeLibImports.d3}
<script>
  function setup () {
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
  function setup () {
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
  function setup () {
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
  function drawGifs () {
    // if mouse is not (!) pressed down exit function
    if (!nn.mouseDown) return
    // otherwise, create a new gif
    nn.create('img')
      .set('src', 'https://netnet.studio/cd.gif')
      .positionOrigin('center')
      .position(nn.mouseX, nn.mouseY)
      .css('pointer-events', 'none')
      .addTo('body')
  }

  // click and drag mouse across the screen
  // to draw new gif img elements
  nn.on('mousemove', drawGifs)
</script>`,

  p5: `${creativeLibImports.p5}
<script>
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

  paper: `${creativeLibImports.paper}
<script>
  let path
  const points = 25
  const segLength = 10

  function setup () {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    document.body.appendChild(canvas)

    paper.setup(canvas)

    path = new paper.Path({
      strokeColor: 'red',
      strokeWidth: 20,
      strokeCap: 'round'
    })

    const start = paper.view.center.divide([10, 1])
    for (let i = 0; i < points; i++) {
      const seg = new paper.Point(i * segLength, 0)
      const point = start.add(seg)
      path.add(point)
    }

    paper.view.onMouseMove = update
  }

  function update (e) {
    path.firstSegment.point = e.point

    for (let i = 0; i < points - 1; i++) {
      const seg = path.segments[i]
      const nextSeg = seg.next
      const vector = seg.point.subtract(nextSeg.point)
      vector.length = segLength
      nextSeg.point = seg.point.subtract(vector)
    }

    path.smooth({ type: 'continuous' })
  }

  window.addEventListener('load', setup)
</script>`,

  three: `${creativeLibImports.three}
<script>
  let scene, camera, renderer, cube
  let width = 400
  let height = 400

  function setup () {
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

  function animate () {
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
  let synth

  function setup () {
    synth = new Tone.Synth().toDestination()
  }

  function play () {
    synth.triggerAttackRelease('C4', '8n')
  }

  window.addEventListener('load', setup)
  window.addEventListener('click', play)
</script>`,
  two: `${creativeLibImports.two}
<script>
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

  function animate () {
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
    'script (anime.js)': creativeLibImports.anime,
    'script (d3.js)': creativeLibImports.d3,
    'script (gsap.js)': creativeLibImports.gsap,
    'script (hydra.js)': creativeLibImports.hydra,
    'script (nn.js)': creativeLibImports.nn,
    'script (p5.js)': creativeLibImports.p5,
    'script (paper.js)': creativeLibImports.paper,
    'script (three.js)': creativeLibImports.three,
    'script (tone.js)': creativeLibImports.tone,
    'script (two.js)': creativeLibImports.two,
    'anime.js (template)': creativeLibTemplates.anime,
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
    log: 'console.log(<CURSOR_GOES_HERE>)'
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
