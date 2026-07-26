/* global ne */
class MainMenu extends window.HTMLElement {
  connectedCallback () {
    const modifier = navigator.platform.toLowerCase().includes('mac') ? 'CMD' : 'CTRL'

    this.innerHTML = `
      <style>
        #main-menu {
          display: none;
          justify-content: center;
          align-items: center;
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100vw;
          height: 100vh;
          background: rgba(28, 28, 54, 0.8);
          z-index: 100;
        }

        #main-menu > div {
          gap: 40px;
          max-width: 640px;
          font-family: 'FiraMono', inconsolata, monospace;
          background-color: var(--netizen-text);
          padding: 20px;
          border: 1px solid black;
        }

        #main-menu > div > .top-menu {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          height: auto;
        }

        #main-menu ul {
          padding: 0;
          list-style: none;
        }

        #main-menu li {
          margin: 6px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        #main-menu label {
          min-width: 90px;
        }

        #main-menu select {
          font-family: 'FiraMono', inconsolata, monospace;
          font-size: inherit;
          background-color: var(--netizen-background);
          color: var(--netizen-tag);
          border: none;
          padding: 3px 6px;
          cursor: pointer;
        }
      </style>

      <section id="main-menu">
        <div>
          <section class="top-menu">
            <div>
              <h1>settings</h1>
              <ul>
                <li>
                  <label>auto-update</label>
                  <select id="setting-auto-update">
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </li>
                <li>
                  <label>theme</label>
                  <select id="setting-theme">
                    <option value="dark">dark</option>
                    <option value="light">light</option>
                    <option value="monokai">monokai</option>
                    <option value="sonnenzimmer">sonnenzimmer</option>
                    <option value="moz-dark">moz-dark</option>
                    <option value="moz-light">moz-light</option>
                  </select>
                </li>
                <li>
                  <label>word-wrap</label>
                  <select id="setting-wrap">
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                </li>
              </ul>
            </div>
            <div>
              <h1>shortcuts</h1>
              <ul id="shortcuts-list">
                <li><i>save</i>: <code>${modifier} + S</code></li>
                <li><i>open</i>: <code>${modifier} + O</code></li>
                <li><i>tidy</i>: <code>${modifier} + Shift + T</code></li>
              </ul>
            </div>
          </section>
          <p>
            To learn more about <a href="https://netnet.studio" target="_blank">netnet.studio</a> visit the <a href="https://netnet.studio/docs" target="_blank">docs</a>.
          </p>
        </div>
      </section>
    `

    this.mm = document.querySelector('#main-menu')

    this.addEventListener('click', (e) => {
      if (e.target.id === 'main-menu') this.toggle()
    })

    this.addEventListener('change', (e) => {
      if (e.target.id === 'setting-auto-update') {
        ne.autoUpdate = e.target.value === 'true'
        this._updateShortcuts()
      } else if (e.target.id === 'setting-theme') {
        ne.theme = e.target.value
      } else if (e.target.id === 'setting-wrap') {
        ne.wrap = e.target.value === 'true'
      }
    })
  }

  _updateShortcuts () {
    const modifier = navigator.platform.toLowerCase().includes('mac') ? 'CMD' : 'CTRL'
    const list = document.querySelector('#shortcuts-list')
    const runLi = list.querySelector('#shortcut-run')
    if (!ne.autoUpdate) {
      if (!runLi) {
        const li = document.createElement('li')
        li.id = 'shortcut-run'
        li.innerHTML = `<i>run</i>: <code>Shift + Enter</code>`
        list.appendChild(li)
      }
    } else {
      if (runLi) runLi.remove()
    }
  }

  _syncSettings () {
    document.querySelector('#setting-auto-update').value = ne.autoUpdate ? 'true' : 'false'
    document.querySelector('#setting-theme').value = ne.theme
    document.querySelector('#setting-wrap').value = ne.wrap ? 'true' : 'false'
    this._updateShortcuts()
  }

  toggle () {
    if (this.mm.style.display !== 'flex') {
      this._syncSettings()
      this.mm.style.display = 'flex'
    } else {
      this.mm.style.display = 'none'
    }
  }
}

window.customElements.define('main-menu', MainMenu)
