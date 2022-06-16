/* global ne */
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•* some example helper functions

window.reset = () => {
  const netnetFace = '<div class="face"><a href="https://netnet.studio"><div></div></a></div class="face">'
  document.querySelector('#nfo').innerHTML = netnetFace
  document.querySelector('#nfo').className = ''
  ne.spotlight('clear')
}

window.showJSNFO = (eve) => {
  const status = (eve.nfo.status && eve.nfo.status !== 'standard')
    ? `. (<b>NOTE</b>: this CSS feature is ${eve.nfo.status}). ` : ''

  document.querySelector('#nfo').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${status}</p>
  `
}

window.showHTMLNFO = (eve) => {
  const type = (typeof eve.nfo.singleton === 'boolean')
    ? 'element' : 'attribute'
  const note = eve.nfo.note
    ? eve.nfo.note.html
    : (eve.nfo.status && eve.nfo.status !== 'standard')
      ? `This ${type} is ${eve.nfo.status}. ` : ''

  document.querySelector('#nfo').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${note}</p>
  `
}

window.showCSSNFO = (eve) => {
  const status = (eve.nfo.status && eve.nfo.status !== 'standard')
    ? `. (<b>NOTE</b>: this CSS feature is ${eve.nfo.status}). ` : ''

  let links = '' // css properties have multiple reference URLs
  if (eve.nfo.urls) {
    links = Object.keys(eve.nfo.urls)
      .map(k => `<a href="${eve.nfo.urls[k]}" target="_blank">${k}</a>`)
    if (links.length > 0) {
      links = `To learn more visit ${links.join(', ').slice(0, -2)}.`
    }
  }

  document.querySelector('#nfo').innerHTML = `
    <h1>${eve.nfo.keyword.html}</h1>
    <p>${eve.nfo.description.html} ${status} ${links}</p>
  `
}

window.markErrors = (eve) => {
  const explainError = (err) => {
    ne.spotlight(err.line)
    document.querySelector('#nfo').className = 'error'
    document.querySelector('#nfo').innerHTML = err.friendly
      ? `<p>${err.friendly}</p>` : `<p>${err.message}</p>`
  }

  ne.marker(null)
  const lines = []
  if (eve.length === 0) window.reset()
  eve.forEach(e => {
    if (lines.includes(e.line)) return
    lines.push(e.line)
    const clk = () => explainError(e)
    if (e.type === 'warning') ne.marker(e.line, 'yellow', clk)
    else ne.marker(e.line, 'red', clk)
  })
}
