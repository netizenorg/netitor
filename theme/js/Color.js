/*
    Color
    -----------
    by Nick Briz <nickbriz@gmail.com>
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2019

    -----------
       info
    -----------

    A vanilla JS class with common Color maths

    -----------
       usage
    -----------

    // hsv && hsl methods that start w/an underscore expect/return values like:
    // { h: 0-1, s: 0-1, v: 0-1 }
    // where as those that don't expect/return values like:
    // { h: 0-360, s: 0-100, v: 0-100 }

    Color.alpha2hex(a)
    Color.hex2alpha(hex)

    Color._hex2rgb(hex)
    Color.hex2rgb(hex)
    Color._hex2hsl(hex)
    Color.hex2hsl(hex)
    Color._hex2hsv(hex)
    Color.hex2hsv(hex)

    Color._rgb2hex(r, g, b)
    Color.rgb2hex(r, g, b)
    Color._rgb2hsl(r, g, b)
    Color.rgb2hsl(r, g, b)
    Color._rgb2hsv(r, g, b)
    Color.rgb2hsv(r, g, b)

    Color._hsl2hex(h, s, l)
    Color.hsl2hex(h, s, l)
    Color._hsl2rgb(h, s, l)
    Color.hsl2rgb(h, s, l)
    Color._hsl2hsv(h, s, l)
    Color.hsl2hsv(h, s, l)

    Color._hsv2hex(h, s, v)
    Color.hsv2hex(h, s, v)
    Color._hsv2rgb(h, s, v)
    Color.hsv2rgb(h, s, v)
    Color._hsv2hsl(h, s, v)
    Color.hsv2hsl(h, s, v)

    // creates a random color string
    Color.random()

    // also accepts two optional arguments, type and alpha
    // type can be: 'hex', 'rgb', 'rgba', 'hsl' or 'hsla'
    // alpha can be a float value (0.0 - 1.0) or a boolean
    Color.random(type, alpha)

    // determines whether a hex or rgb color string is light or dark
    // returns true for light colors and false for dark colors
    Color.isLight(colorString)

    // match method takes a string and returns the first color string it finds
    // in the form of a parsed array (if no color is found it returns null)
    // for example:

    Color.match('color: rgba(34, 56, 88, 0.5); font-size: 23px;')
    // returns ["rgb", "rgba(34, 56, 88, 0.5)", "34", "56", "88", "0.5"]
*/
class Color {
  static alpha2hex (a) {
    const n = a * 255
    const v = n.toString(16)
    const h = v.split('.')[0]
    return (h.length === 1) ? `0${h}` : h
  }

  static hex2alpha (hex) {
    const v = parseInt(hex, 16) / 255
    return Math.round(v * 100) / 100
  }

  // ................................................................. HEX .....

  static _hex2rgb (hex) { // ('#ff0000') => { r: 1, g: 0, b: 0 }
    const o = this.hex2rgb(hex)
    return { r: o.r / 255, g: o.g / 255, b: o.b / 255 }
  }

  static hex2rgb (hex) { // ('#ff0000') => { r: 255, g: 0, b: 0 }
    if (hex.length === 9) hex = hex.substring(0, 7)
    else if (hex.length === 5) hex = hex.substring(0, 4)

    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b
    })

    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return res ? {
      r: parseInt(res[1], 16),
      g: parseInt(res[2], 16),
      b: parseInt(res[3], 16)
    } : null
  }

  static _hex2hsl (hex) { // ('#ff0000') => { h: 0, s: 1, l: 0.5 }
    const c = this.hex2rgb(hex)
    return this._rgb2hsl(c.r / 255, c.g / 255, c.b / 255)
  }

  static hex2hsl (hex) { // ('#ff0000') => { h: 0, s: 100, l: 50 }
    if (hex.length === 9) hex = hex.substring(0, 7)
    else if (hex.length === 5) hex = hex.substring(0, 4)
    const c = this.hex2rgb(hex)
    return this.rgb2hsl(c.r, c.g, c.b)
  }

  static _hex2hsv (hex) { // ('#ff0000') => { h: 0, s: 1, v: 1 }
    const c = this.hex2rgb(hex)
    return this._rgb2hsv(c.r / 255, c.g / 255, c.b / 255)
  }

  static hex2hsv (hex) { // ('#ff0000') => { h: 0, s: 100, v: 100 }
    const c = this.hex2rgb(hex)
    return this.rgb2hsv(c.r, c.g, c.b)
  }

  // ................................................................. RGB .....

  static _rgb2hex (r, g, b) { // (1, 0, 0) => '#ff0000'
    r *= 255
    g *= 255
    b *= 255
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  static rgb2hex (r, g, b) { // (255, 0, 0) => '#ff0000'
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  static _rgb2hsl (r, g, b) { // (1, 0, 0) => { h: 0, s: 1, l: 0.5 }
    const c = this._rgb2hsv(r, g, b)
    return this._hsv2hsl(c.h, c.s, c.v)
  }

  static rgb2hsl (r, g, b) { // (255, 0, 0) => { h: 0, s: 100, l: 50 }
    const c = this._rgb2hsv(r / 255, g / 255, b / 255)
    const o = this._hsv2hsl(c.h, c.s, c.v)
    return {
      h: Math.round(o.h * 360),
      s: Math.round(o.s * 100),
      l: Math.round(o.l * 100)
    }
  }

  static _rgb2hsv (r, g, b) { // (1, 0, 0) => { h: 0, s: 1, v: 1 }
    r *= 255
    g *= 255
    b *= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const dif = max - min

    let h
    const s = max === 0 ? 0 : dif / max
    const v = max / 255

    switch (max) {
      case min: h = 0; break
      case r: h = (g - b) + dif * (g < b ? 6 : 0); h /= 6 * dif; break
      case g: h = (b - r) + dif * 2; h /= 6 * dif; break
      case b: h = (r - g) + dif * 4; h /= 6 * dif; break
    }

    return { h, s, v }
  }

  static rgb2hsv (r, g, b) { // (255, 0, 0) => { h: 0, s: 100, v: 100 }
    const c = this._rgb2hsv(r / 255, g / 255, b / 255)
    return {
      h: Math.round(c.h * 360),
      s: Math.round(c.s * 100),
      v: Math.round(c.v * 100)
    }
  }

  // ................................................................. HSL .....

  static _hsl2hex (h, s, l) { // (0, 1, 0.5) => '#ff0000'
    // const c = this._hsl2rgb(h, s, l)
    // return this._rgb2hex(c.r, c.g, c.b)
    const f = this._hsl2rgb(h, s, l)

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(f.r)}${toHex(f.g)}${toHex(f.b)}`
  }

  static hsl2hex (h, s, l) { // (0, 100, 50) => '#ff0000'
    // const c = this.hsl2rgb(h, s, l)
    // return this.rgb2hex(c.r, c.g, c.b)
    h /= 360
    s /= 100
    l /= 100

    return this._hsl2hex(h, s, l)
  }

  static _hsl2rgb (h, s, l) { // (0, 1, 0.5) => { r: 1, g: 0, b: 0 }
    h = h * 360
    const a = s * Math.min(l, 1 - l)
    const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return { r: f(0), g: f(8), b: f(4) }
  }

  static hsl2rgb (h, s, l) { // (0, 100, 50) => { r: 255, g: 0, b: 0 }
    const scale = (num, inMin, inMax, outMin, outMax) => {
      return (num - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    }
    h = Math.round(scale(h, 0, 360, 0, 1) * 10) / 10
    s = Math.round(scale(s, 0, 100, 0, 1) * 10) / 10
    l = Math.round(scale(l, 0, 100, 0, 1) * 10) / 10

    const c = this._hsl2rgb(h, s, l)

    return {
      r: Math.ceil(c.r * 255),
      g: Math.ceil(c.g * 255),
      b: Math.ceil(c.b * 255)
    }
  }

  static _hsl2hsv (h, s, l) { // (0, 1, 0.5) => { h: 0, s: 1, v: 1 }
    l *= 2
    s *= (l <= 1) ? l : 2 - 1
    const v = (1 + s) / 2
    s = (2 * s) / (l + s)
    return { h, s, v }
  }

  static hsl2hsv (h, s, l) { // (0, 100, 50) => { h: 0, s: 100, v: 100 }
    h /= 360
    s /= 100
    l /= 100
    const c = this._hsl2hsv(h, s, l)
    return {
      h: Math.round(c.h * 360),
      s: Math.round(c.s * 100),
      v: Math.round(c.v * 100)
    }
  }

  // ................................................................. HSV ....

  static _hsv2hex (h, s, v) { // (0, 1, 1) => '#ff0000'
    const c = this._hsv2rgb(h, s, v)
    return this._rgb2hex(c.r, c.g, c.b)
  }

  static hsv2hex (h, s, v) { // (0, 100, 100) => '#ff0000'
    const c = this.hsv2rgb(h, s, v)
    return this.rgb2hex(c.r, c.g, c.b)
  }

  static _hsv2rgb (h, s, v) { // (0, 1, 1) => { r: 1, g: 0, b: 0 }
    let r, g, b
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break
      case 1: r = q; g = v; b = p; break
      case 2: r = p; g = v; b = t; break
      case 3: r = p; g = q; b = v; break
      case 4: r = t; g = p; b = v; break
      case 5: r = v; g = p; b = q; break
    }
    return { r, g, b }
  }

  static hsv2rgb (h, s, v) { // (0, 100, 100) => { r: 255, g: 0, b: 0 }
    h /= 360
    s /= 100
    v /= 100
    const c = this._hsv2rgb(h, s, v)
    return {
      r: Math.round(c.r * 255),
      g: Math.round(c.g * 255),
      b: Math.round(c.b * 255)
    }
  }

  static _hsv2hsl (h, s, v) { // (0, 1, 1) => { h: 0, s: 1, l: 0.5 }
    const l = (2 - s) * v / 2
    if (l !== 0) {
      if (l === 1) s = 0
      else if (l < 0.5) s = s * v / (l * 2)
      else s = s * v / (2 - l * 2)
    }
    return { h, s, l }
  }

  static hsv2hsl (h, s, v) { // (0, 100, 100) => { h: 0, s: 100, l: 50 }
    h /= 360
    s /= 100
    v /= 100
    const c = this._hsv2hsl(h, s, v)
    return {
      h: Math.round(c.h * 360),
      s: Math.round(c.s * 100),
      l: Math.round(c.l * 100)
    }
  }

  // ~ ~ ~
    
  static random (type, alpha) {
    let r, g, b, h, s, l, a, hex
    const opac = type === 'rgba' || type === 'hsla'
    if (typeof alpha === 'number') {
      a = type === 'hex' ? this.alpha2hex(alpha) : alpha
    } else if (alpha === true || opac) {
      a = type === 'hex'
        ? Math.floor(Math.random() * 255).toString(16)
        : Math.round(Math.random() * 100) / 100
    }

    if (type === 'rgb' || type === 'rgba') {
      r = Math.floor(Math.random() * 255)
      g = Math.floor(Math.random() * 255)
      b = Math.floor(Math.random() * 255)
      if (a) {
        return `rgba(${r}, ${g}, ${b}, ${a})`
      } else {
        return `rgb(${r}, ${g}, ${b})`
      }
    } else if (type === 'hsl' || type === 'hsla') {
      h = Math.floor(Math.random() * 360)
      s = Math.floor(Math.random() * 100)
      l = Math.floor(Math.random() * 100)
      if (a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`
      } else {
        return `hsl(${h}, ${s}%, ${l}%)`
      }
    } else {
      hex = `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`
      return a ? hex + a : hex
    }
  }

  // via: https://awik.io/determine-color-bright-dark-using-javascript/
  static isLight (color) {
    // Variables for red, green, blue values
    let r, g, b
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {
      // If RGB --> store the red, green, blue values in separate variables
      color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
      r = color[1]
      g = color[2]
      b = color[3]
    } else {
      // If hex --> Convert it to RGB: http://gist.github.com/983661
      color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'))
      r = color >> 16
      g = color >> 8 & 255
      b = color & 255
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

    // Using the HSP value, determine whether the color is light or dark
    return hsp > 127.5
  }

  static match (str) {
    const hexRegex = /#[a-f\d]{3}(?:[a-f\d]?|(?:[a-f\d]{3}(?:[a-f\d]{2})?)?)\b/
    const hex = str.match(hexRegex)
    const rgbRegex = /rgba?\((?:(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%),\s*(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%),\s*(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%)(?:,\s*((?:\d{1,2}|100)%|0(?:\.\d+)?|1))?|(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%)\s+(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%)\s+(25[0-5]|2[0-4]\d|1?\d{1,2}|(?:\d{1,2}|100)%)(?:\s+((?:\d{1,2}|100)%|0(?:\.\d+)?|1))?)\)/
    const rgb = str.match(rgbRegex)
    const hslRegex = /hsla?\((?:(-?\d+(?:deg|g?rad|turn)?),\s*((?:\d{1,2}|100)%),\s*((?:\d{1,2}|100)%)(?:,\s*((?:\d{1,2}|100)%|0(?:\.\d+)?|1))?|(-?\d+(?:deg|g?rad|turn)?)\s+((?:\d{1,2}|100)%)\s+((?:\d{1,2}|100)%)(?:\s+((?:\d{1,2}|100)%|0(?:\.\d+)?|1))?)\)/
    const hsl = str.match(hslRegex)
    if (hex) return ['hex', ...hex]
    else if (rgb) return ['rgb', ...rgb]
    else if (hsl) return ['hsl', ...hsl]
    else return null
  }
}

if (typeof module !== 'undefined') module.exports = Color
