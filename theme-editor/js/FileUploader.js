/* global alert */
/*
    FileUploader
    -----------
    by Nick Briz <nickbriz@gmail.com>
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2019

    -----------
       info
    -----------

    this class for quickly handling file uploads via clicking on elements or
    drag and dropping onto elements.

    -----------
       usage
    -----------

    const fu = new FileUploader({
      maxSize: 1000,                        // limit max file size in kb
      types: ['image/jpeg','audio/mpeg3'],  // limit allowed file mime types
      filter: callback,                      // or alternative callback filter
      click: '#button',                     // selector for clickable element
      drop: '#background',                  // selector for drag&drop element
      dropping: callback,                   // runs when file is dragged over
      dropped: callback,                    // runs when file has been dropped
      ready: callback,                      // runs when data is ready
      error: callback,                      // runs when there's an error
    })

*/
class FileUploader {
  constructor (config) {
    this.clickEle = document.querySelectorAll(config.click)
    this.dropEle = document.querySelector(config.drop)
    this.dropping = config.dropping
    this.dropped = config.dropped
    this.maxSize = config.maxSize
    this.types = config.types
    this.filter = config.filter
    this.error = config.error
    this.ready = (typeof config.ready === 'function') ? config.ready
      : this.err('missing "ready" callback to constructor to handle data')

    if (this.clickEle) this.createClickable()

    if ('draggable' in document.createElement('span')) {
      if (this.dropEle) {
        this.dropEle.addEventListener('dragenter', (e) => this.dndEnter(e), false)
        this.dropEle.addEventListener('dragover', (e) => this.dndOver(e), false)
        this.dropEle.addEventListener('drop', (e) => this.dndDrop(e), false)
      }
    } else {
      this.err('your browser does not support drag and drop')
    }
  }

  err (message) {
    if (this.error) this.error(message)
    console.error(`FileUploader: ${message}`)
  }

  createClickable () {
    this.input = document.createElement('input')
    this.input.setAttribute('type', 'file')
    this.input.setAttribute('hidden', true)
    document.body.appendChild(this.input)
    this.input.addEventListener('change', (e) => {
      this.readFile(this.input.files[0])
    })
    for (let i = 0; i < this.clickEle.length; i++) {
      this.clickEle[i].addEventListener('click', () => {
        this.input.click()
      })
    }
  }

  dndEnter (e) {
    e.stopPropagation()
    e.preventDefault()
    if (this.dropping) this.dropping(this.dropEle)
  }

  dndOver (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  dndDrop (e) {
    e.stopPropagation()
    e.preventDefault()
    if (this.dropped) this.dropped(this.dropEle)
    if (e.dataTransfer.files.length > 1) {
      alert('You can only drag and drop one file at a time.')
    } else this.readFile(e.dataTransfer.files[0])
  }

  isAllowed (type) {
    if (this.types) {
      return this.types.indexOf(type) > -1
    } else if (this.filter) {
      return this.filter(type)
    } else return true
  }

  readFile (file) {
    const maxBytes = (this.maxSize) ? this.maxSize * 1000 : Infinity
    if (typeof FileReader !== 'undefined' &&
      this.isAllowed(file.type) &&
      file.size <= maxBytes) {
      const reader = new window.FileReader()
      reader.onload = (e) => {
        this.handleFile(file.name, file.type, e.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      if (typeof FileReader === 'undefined' && this.error) {
        this.error('browser does not support FileReader')
      } else if (!this.isAllowed(file.type)) {
        this.error(`attempted to upload restricted file type ${file.type}`)
      } else if (file.size > maxBytes) {
        this.error(`file larger than max size of ${maxBytes}`)
      }
    }
  }

  handleFile (name, type, data) {
    this.ready({ name, type, data })
  }
}

if (typeof module !== 'undefined') module.exports = FileUploader
