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

        #save-dialogue textarea {
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
          You can also <a id="download-sketch">download this sketch</a> to your computer!
        </div>
      </section>
    `

    this.sd = document.querySelector('#save-dialogue')
    this.ta = this.sd.querySelector('textarea')

    this.addEventListener('click', (e) => {
      if (e.target.id === 'save-dialogue') {
        this.hide()
      } else if (e.target.id === 'download-sketch') {
        this.downloadSketch()
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

  downloadSketch () {
    const blob = new window.Blob([ne.code], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'index.html'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async displaySaveDialogue () {
    this.ta.value = window.location.toString()
    this.sd.style.display = 'flex'
    this.copySelectURL()
  }
}

window.customElements.define('save-sketch', SaveSketch)
