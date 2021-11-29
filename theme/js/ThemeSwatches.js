/* global HTMLElement */
class ThemeSwatches extends HTMLElement {
  constructor () {
    super()
    this.onhover = () => { /* setup after insantiating */ }
    this.onselect = () => { /* setup after insantiating */ }
  }

  connectedCallback () {
    this.innerHTML = `
      <style>
        .themeSwatches {}

        .themeSwatches__theme {
          margin: 40px;
          border: 4px solid black;
          border-radius: 20px;
          padding: 20px;
          cursor: pointer;
        }

        .themeSwatches__label {
          font-family: 'fira-mono-regular', monospace;
        }

        .themeSwatches__swatches {
          padding: 1vw;
        }

        .themeSwatches__swatch {
          width: 2.8vw;
          height: 2.9vw;
          border-radius: 50%;
          display: inline-block;
          margin-left: -1.5vw;
        }
      </style>

      <div class="themeSwatches"></div>
    `
  }

  load (data) {
    for (const theme in data) {
      const div = this._createSwatch(data[theme], theme)
      this.querySelector('.themeSwatches').appendChild(div)
    }
  }

  _createSwatch (css, theme) {
    const div = document.createElement('div')
    div.className = 'themeSwatches__theme'
    div.style.borderColor = css.tag
    div.style.backgroundColor = css.background

    const label = document.createElement('label')
    label.textContent = theme
    label.className = 'themeSwatches__label'
    label.style.color = css.text
    div.appendChild(label)

    const swatches = document.createElement('div')
    swatches.className = 'themeSwatches__swatches'
    div.appendChild(swatches)
    for (const prop in css) {
      const clr = css[prop]
      const swtch = document.createElement('div')
      swtch.className = 'themeSwatches__swatch'
      swtch.style.backgroundColor = clr
      swatches.appendChild(swtch)
    }

    div.addEventListener('mouseover', (e) => this.onhover(theme))
    div.addEventListener('click', (e) => this.onselect(theme))

    return div
  }
}

window.customElements.define('theme-swatches', ThemeSwatches)
