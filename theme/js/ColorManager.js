/* global ThemeCreator, FileUploader */
class ColorManager {
  constructor (opts) {
    this.ne = opts.netitor
    this.themes = {}
    this.metadata = {}

    this.themeSwatches = document.querySelector('theme-swatches')
    this.themeSwatches.onhover = (theme) => this._updateStyles(theme)
    this.themeSwatches.onselect = (theme) => {
      this._copyData(theme, 'custom')
      this._loadSwatch(theme)
      this._setupFilterMenu()
      this.ne.themes.custom = this.themes.custom
    }

    this.colorPicker = document.querySelector('color-picker')
    this.colorPicker.onupdate = (color, prop) => {
      this.themes.custom[prop] = color
      this.ne.themes.custom = this.themes.custom
      this._updateStyles('custom')
    }

    this._startLoading(opts)
  }

  $ (sel) { return document.querySelector(sel) }

  async loadExample (path) {
    const res = await window.fetch(path)
    const text = await res.text()
    return text
  }

  _loading (show) {
    if (this._tl) clearTimeout(this._tl)
    if (show) {
      this.$('#loader').style.display = 'flex'
      this._tl = setTimeout(() => {
        this.$('#loader').style.opacity = 1
      }, 100)
    } else {
      this.$('#loader').style.opacity = 0
      this._tl = setTimeout(() => {
        this.$('#loader').style.display = 'none'
      }, 600)
    }
  }

  _startLoading (opts) {
    let count = 0
    let total = opts.example ? 1 : 0
    total += opts.templates.length

    opts.templates.forEach(path => {
      ThemeCreator.loadFile(path).then(obj => {
        this.themes[obj.metadata.name] = obj.data
        this.metadata[obj.metadata.name] = obj.metadata
        count++
        if (count === total) this._createHTML()
      })
    })

    if (opts.example) {
      this.loadExample(opts.example).then(text => {
        this.ne.code = text
        count++
        if (count === total) this._createHTML()
      })
    }
  }

  _copyData (from, to) {
    this.metadata[to] = {
      name: this.metadata[from].name,
      author: this.metadata[from].author,
      description: this.metadata[from].description
    }
    this.themes[to] = JSON.parse(JSON.stringify(this.themes[from]))
  }

  _loadData (obj) {
    this.metadata.custom = obj.metadata
    this.themes.custom = obj.data
    this.ne.themes.custom = this.themes.custom
    this._loadSwatch('custom')
  }

  _updateStyles (theme) {
    const css = this.themes[theme]
    const meta = this.metadata[theme]
    document.documentElement.style.setProperty('--c-tag', css.tag)
    document.documentElement.style.setProperty('--c-meta', css.meta)
    document.documentElement.style.setProperty('--c-background', css.background)
    this.$('#widget .title').textContent = meta.name
    this.$('#widget .author').textContent = meta.author
    this.$('#widget .description').textContent = meta.description
    this.ne._updateTheme(theme)
  }

  _backHome () {
    this.$('#intro').style.display = 'block'
    this.themeSwatches.style.display = 'block'
    this.$('#filters').style.display = 'none'
    this.$('#widget').style.display = 'none'
    this.$('#swatches').style.display = 'none'
  }

  _createHTML () {
    this._loading(false)
    this.themeSwatches.load(this.themes)

    // widget button event listeners -------------------------------------------
    // -------------------------------------------------------------------------

    this.$('#b-btn').addEventListener('click', () => {
      const msg = 'if you have not downloaded your custom theme edits, you will loose your data when you return to the main theme page'
      const confirm = window.confirm(msg)
      if (confirm) this._backHome()
    })

    this.$('#d-btn').addEventListener('click', () => {
      this.metadata.custom.name = this.$('#widget .title').textContent
      this.metadata.custom.author = this.$('#widget .author').textContent
      this.metadata.custom.description = this.$('#widget .description').textContent
      ThemeCreator.download(this.metadata.custom, this.themes.custom)
    })

    this.uploader = new FileUploader({
      maxSize: 1.1,
      types: ['text/javascript', 'application/x-javascript'],
      click: '#u-btn',
      error: (err) => window.alert(err),
      ready: (file) => {
        const data = ThemeCreator.loadData(file.data)
        this._loadData(data)
      }
    })
  }

  _setupFilterMenu () {
    const filt = {
      html: ['meta', 'text', 'background', 'tag', 'tag_bracket', 'attribute', 'comment', 'string'],
      css: ['meta', 'text', 'background', 'comment', 'variable_3', 'variable_2', 'atom', 'tag', 'property', 'number', 'keyword', 'variable_callee', 'variable', 'def', 'qualifier', 'builtin', 'string'],
      js: ['meta', 'background', 'text', 'comment', 'keyword', 'def', 'operator', 'variable', 'property', 'string', 'variable_2', 'atom', 'string_2', 'number'],
      meta: ['text', 'meta', 'background', 'selected', 'line_numbers', 'active_line_bg', 'match_color', 'match_border', 'hint_bg', 'hint_color', 'hint_shadow'],
      all: []
    }

    for (const key in filt) {
      const arr = filt[key].length > 0 ? filt[key] : null
      this.$(`#${key}-filt`).addEventListener('click', () => {
        this._loading(true)
        if (key === 'meta') this.ne.readOnly = false
        else this.ne.readOnly = true
        this._loadSwatch('custom', key, arr)
        this.loadExample(`demos/${key}.html`)
          .then(text => {
            this._loading(false)
            this.ne.code = text
          })
      })
    }
  }

  _loadSwatch (theme, fname, flist) {
    fname = fname || 'all'

    this.$('#intro').style.display = 'none'
    this.themeSwatches.style.display = 'none'

    this._updateStyles(theme)
    this.$('#filters').style.display = 'flex'
    this.$('#widget').style.display = 'block'

    this.$('#swatches').style.display = 'grid'
    this.$('#swatches').className = `swatch-filter-${fname}`
    this.$('#swatches').innerHTML = ''
    const css = this.themes[theme]
    for (const prop in css) {
      const color = css[prop]
      if (!flist || flist.includes(prop)) {
        const swatch = document.createElement('div')
        swatch.setAttribute('id', `${prop}-swatch`)
        swatch.dataset.prop = prop
        swatch.dataset.color = color
        swatch.classList.add('swatch')
        swatch.classList.add(`g-${prop}`)
        swatch.style.backgroundColor = color

        const label = document.createElement('label')
        label.innerText = `${prop}: ${color}`
        swatch.appendChild(label)
        this.$('#swatches').appendChild(swatch)

        swatch.addEventListener('mouseover', () => {
          label.style.background = 'transparent'
        })
        swatch.addEventListener('mouseout', () => {
          label.style.background = '#f0eff1'
        })
        swatch.addEventListener('click', () => {
          this.colorPicker.open(swatch, this.themes.custom.background)
        })
      }
    }
  }
}

window.ColorManager = ColorManager
