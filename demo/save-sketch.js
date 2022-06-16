/* global ne */
class SaveSketch extends window.HTMLElement {
  connectedCallback () {
    this.innerHTML = `
      <style>
        #save-dialogue {
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

        #save-dialogue > div {
          max-width: 640px;
          font-family: 'FiraMono', inconsolata, monospace;
          background-color: var(--netizen-text);
          padding: 20px;
          border: 1px solid black;
        }

        #save-dialogue textarea,
        #save-dialogue input {
          background-color: var(--netizen-background);
          color: var(--netizen-tag);
          border: none;
          padding: 12px;
          width: 100%;
          margin: 8px 0px;
        }

        #save-dialogue textarea::-moz-selection { /* Code for Firefox */
          background: var(--netizen-tag);
          color: var(--netizen-background);
        }

        #save-dialogue textarea::selection {
          background: var(--netizen-tag);
          color: var(--netizen-background);
        }

        #save-dialogue input {
          font-size: 18px;
        }

        #save-dialogue button {
          color: var(--netizen-background);
          background: var(--netizen-tag);
          border: none;
          font-size: 18px;
          padding: 13px 25px;
          cursor: pointer;
        }

        #save-gist {
          display: none;
        }

        #toggle-gist,
        #save-dialogue a {
          text-decoration: underline;
          cursor: pointer;
          color: var(--netizen-tag);
        }
      </style>

      <section id="save-dialogue">
        <div>
          the URL below has been copied! use it to share this sketch
          <textarea></textarea>
          <br><br>
          want to save this sketch as as a <span id="toggle-gist">GitHub Gist</span>?
          <div id="save-gist">
            <input id="gist-title" placeholder="title for this sketch">
            <input id="gist-token" placeholder="your GitHub token" style="width:calc(100% - 152px)">
            <button id="save-gist-button">save as gist</button>
            <div id="gist-status">
              (<a href="https://github.com/settings/tokens/new" target="_blank">click here to create a new GitHub token</a>, make sure to select the "gist" scope box)
            </div>
          </div>
        </div>
      </section>
    `

    this.sd = document.querySelector('#save-dialogue')
    this.ta = this.sd.querySelector('textarea')

    this.addEventListener('click', (e) => {
      if (e.target.id === 'save-dialogue') {
        this.hide()
        this.toggleGist()
      } else if (e.target.id === 'toggle-gist') {
        this.toggleGist('init')
      } else if (e.target.id === 'save-gist-button') {
        this.saveGist()
      } else if (e.target === this.ta) {
        this.copySelectURL()
      }
    })
  }

  hide () {
    this.sd.style.display = 'none'
  }

  copySelectURL () {
    this.ta.focus(); this.ta.select()
    navigator.clipboard.writeText(this.ta.value)
  }

  toggleGist (display, req) {
    const s = document.querySelector('#gist-status')
    if (display === 'init') {
      s.innerHTML = '(<a href="https://github.com/settings/tokens/new" target="_blank">click here to create a new GitHub token</a>, make sure to select the "gist" scope box)'
      const t = window.localStorage.getItem('ghtoken')
      if (t) document.querySelector('#gist-token').value = t
      else document.querySelector('#gist-token').value = ''
      document.querySelector('#gist-title').value = ''
      document.querySelector('#save-gist').style.display = 'block'
    } else if (display === 'saving') {
      s.innerHTML = '...saving to GitHub...'
      s.style.display = 'block'
    } else if (display === 'saved') {
      const url = `https://gist.github.com/${req.data.owner.login}/${req.data.id}`
      s.innerHTML = `<a href="${url}" target="_blank">${url}</a>`
    } else {
      document.querySelector('#save-gist').style.display = 'none'
    }
  }

  async saveGist () {
    const title = document.querySelector('#gist-title').value
    const token = document.querySelector('#gist-token').value
    if (!token) return window.alert('saving as gist requires a GitHub token')
    else if (!title) return window.alert('dont\'t forget to title your sketch')

    this.toggleGist('saving')
    const { Octokit } = await import('https://cdn.skypack.dev/@octokit/core')
    window.localStorage.setItem('ghtoken', token)
    const data = {}
    data[`${title}.html`] = { content: ne.code }
    const octokit = new Octokit({ auth: token })
    await octokit.request('GET /gists', {})
    const req = await octokit.request('POST /gists', {
      description: '◕ ◞ ◕ This sketch was made using https://netizenorg.github.io/netitor',
      files: data
    })
    this.toggleGist('saved', req)
  }

  async displaySaveDialogue () {
    this.ta.value = window.location.toString()
    this.sd.style.display = 'flex'
    this.copySelectURL()
  }
}

window.customElements.define('save-sketch', SaveSketch)
