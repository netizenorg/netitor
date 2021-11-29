/* global HTMLElement Color */
class ColorPicker extends HTMLElement {
  constructor () {
    super()
    this.onupdate = () => { /* setup after insantiating */ }
    this.swatch = null /* updated when .open() is called */
    this.colors = { /* assuming these are defined in :root */
      background: 'var(--c-background)',
      meta: 'var(--c-meta)',
      tag: 'var(--c-tag)'
    }
  }

  connectedCallback () {
    this.innerHTML = `
      <style>
        .clrPkr {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 50vw;
          height: 100vh;
          background-color: #1c1c36cc; /* background w/transparency */
          position: fixed;
          top: 0px;
          left: 0px;
          z-index: 100;
        }

        .clrPkr__main {
          width: 40vw;
          height: 40vw;
          border-radius: 20px;
          display: flex;
          justify-content: flex-end;
          flex-direction: column;
        }

        .clrPkr__cntrls {
          font-family: 'fira-mono-regular', monospace;
          color: ${this.colors.background};
          background-color: ${this.colors.meta};
          border-radius: 0 0 20px 20px;
          padding: 20px;
        }

        .clrPkr__title {
          margin: 22px 30px 4px 0;
          text-align: right;
        }

        .clrPkr input[name="hex"] {
          background: ${this.colors.tag};
          color: black;
          border: none;
          padding: 5px 18px;
          width: 115px;
          text-transform: uppercase;
          border-radius: 20px;
        }

        .clrPkr label {
          width: 1.8em;
          display: inline-block;
        }

        .clrPkr input[type="range"] {
          -webkit-appearance: none;
          height: 10px;
          width: calc(100% - 66px);
          transform: translateY(0.5em);
          margin: 0.6em 0;
          border-radius: 5px;
          outline: none;
          border: 1px solid ${this.colors.background};
          background: ${this.colors.meta};
        }

        .clrPkr input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 6px;
          height: 24px;
          background: #fff;
          cursor: pointer;
          border-radius: 5px;
          border: 1px solid ${this.colors.background};
        }

        .clrPkr input[type="range"]::-moz-range-thumb {
          width: 6px;
          height: 24px;
          background: #fff;
          cursor: pointer;
          border-radius: 5px;
          border: 1px solid ${this.colors.background};
        }

        .clrPkr input[name="r"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, rgb(255, 0, 0), black) repeat scroll 0% 0%;
        }

        .clrPkr input[name="g"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, rgb(0, 255, 0), black) repeat scroll 0% 0%;
        }

        .clrPkr input[name="b"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, rgb(0, 0, 255), black) repeat scroll 0% 0%;
        }

        .clrPkr input[name="h"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, red, rgb(255, 0, 255), blue, cyan, rgb(0, 255, 0), yellow, red) repeat scroll 0% 0%;
        }

        .clrPkr input[name="s"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, rgb(255, 0, 225), white) repeat scroll 0% 0%;
        }

        .clrPkr input[name="l"] {
          background: rgba(0, 0, 0, 0) linear-gradient(to left, white, black) repeat scroll 0% 0%;
        }

      </style>

      <div class="clrPkr" style="display: none;">
        <div class="clrPkr__main">
          <div class="clrPkr__cntrls">
            <div class="clrPkr__hex-select">
              hex: <input type="text" name="hex">
            </div>
            <div class="clrPkr__title">rgb:</div>
            <div class="clrPkr__pickers">
              <label for="r"></label>
              <input type="range" name="r" min="0" max="255">
              <label for="g"></label>
              <input type="range" name="g" min="0" max="255">
              <label for="b"></label>
              <input type="range" name="b" min="0" max="255">
            </div>
            <div class="clrPkr__title">hsl:</div>
            <div class="clrPkr__pickers">
              <label for="h"></label>
              <input type="range" name="h" min="0" max="360">
              <label for="s"></label>
              <input type="range" name="s" min="0" max="100">
              <label for="l"></label>
              <input type="range" name="l" min="0" max="100">
            </div>
            <div class="clrPkr__title">alpha:</div>
            <label for="a"></label>
            <input type="range" name="a" min="0" max="1" step="0.01" value="1">
          </div>
        </div>
      </div>
    `

    // ~ ~ ~ ~ setup event listeners ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
    // hide on enter
    window.addEventListener('keypress', (e) => {
      if (this.isOpen() && e.key === 'Enter') {
        this.$('.clrPkr').style.display = 'none'
      }
    })
    // hide when clicking outside the UI
    this.$('.clrPkr').addEventListener('click', (e) => {
      const isRange = e.target.getAttribute('type') === 'range'
      const isHex = e.target.getAttribute('name') === 'hex'
      if (this.isOpen() && !isRange && !isHex) {
        this.$('.clrPkr').style.display = 'none'
      }
    })
    // setup input range event listeners
    const ranges = ['r', 'g', 'b', 'h', 's', 'l', 'a']
    ranges.forEach(r => {
      this.$(`input[name="${r}"]`)
        .addEventListener('input', (e) => {
          const color = this.calculateColor(r, e.target.value)
          this.update(color)
        })
    })
    // setup hex input box listener
    this.$('input[name="hex"]')
      .addEventListener('input', (e) => this.update(e.target.value))
  }

  /*
    >>>>>>>>>>>>>>>>>>>> METHODS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  */

  $ (s) { return this.querySelector(s) }

  isOpen () { return this.$('.clrPkr').style.display === 'flex' }

  open (swatch, bg) {
    this.swatch = swatch
    bg = bg || 'black'
    const color = this.swatch.dataset.color
    this.$('.clrPkr').style.background = bg + 'cc'
    this.$('.clrPkr').style.display = 'flex'
    this.$('.clrPkr__main').style.background = color
    this.updateControls(color)
  }

  updateControls (color) {
    const rgbArr = ['r', 'g', 'b']
    const rgbClr = Color.hex2rgb(color)
    rgbArr.forEach(v => {
      this.$(`.clrPkr label[for="${v}"]`).textContent = rgbClr[v]
      this.$(`.clrPkr input[name="${v}"]`).value = rgbClr[v]
    })
    const hslArr = ['h', 's', 'l']
    const hslClr = Color.hex2hsl(color)
    hslArr.forEach(v => {
      this.$(`.clrPkr label[for="${v}"]`).textContent = hslClr[v]
      this.$(`.clrPkr input[name="${v}"]`).value = hslClr[v]
    })

    if (color.length === 9) {
      const a = Color.hex2alpha(color.substr(7))
      this.$('.clrPkr input[name="a"]').value = a
    } else {
      this.$('.clrPkr input[name="a"]').value = 1
    }

    this.$('input[name="hex"]').value = color
    this.$('input[name="hex"]').style.background = color
    this.$('input[name="hex"]').style.color = Color.isLight(color) ? '#000' : '#fff'

    const c = Color.hex2hsl(color)
    const hsl = `hsl(${c.h}, 100%, 50%)`
    const sat = `hsl(${c.h}, 0%, ${c.l}%)`
    const abg = `linear-gradient(to left, ${hsl}, transparent) repeat scroll 0% 0%`
    this.$('.clrPkr input[name="a"]').style.background = abg
    const sbg = `linear-gradient(to left, ${hsl}, ${sat}) repeat scroll 0% 0%`
    this.$('.clrPkr input[name="s"]').style.background = sbg
  }

  calculateColor (range, value) {
    let color
    const rgb = ['r', 'g', 'b']
    if (rgb.includes(range)) {
      const c = Color.hex2rgb(this.swatch.dataset.color)
      c[range] = Number(value)
      color = Color.rgb2hex(c.r, c.g, c.b)
    } else {
      const c = Color.hex2hsl(this.swatch.dataset.color)
      c[range] = Number(value)
      color = Color.hsl2hex(c.h, c.s, c.l)
    }

    const alpha = Number(this.$('.clrPkr input[name="a"]').value)
    if (alpha === 1) return color
    color += Color.alpha2hex(alpha)
    return color
  }

  update (color) {
    if (color.indexOf('#') === 0 && window.CSS.supports('color', color)) {
      this.updateControls(color)

      const prop = this.swatch.dataset.prop
      this.swatch.dataset.color = color
      this.swatch.style.backgroundColor = color
      this.swatch.querySelector('label').textContent = `${prop}: ${color}`

      this.$('.clrPkr__main').style.background = color

      this.onupdate(color, prop)
    } else {
      console.warn(`ColorPicker: ${color} is not a valid hex color string`)
    }
  }
}

window.customElements.define('color-picker', ColorPicker)
