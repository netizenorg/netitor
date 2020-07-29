**WORK IN PROGRESS**

# netitor

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A pedagogical web based code editor for creative netizens in training. You can play with a [live demo here](https://netizenorg.github.io/netitor/).

# How To

The [index.html](https://github.com/netizenorg/netitor/blob/master/index.html) in the root of the directory is a working example of how to implement the netitor. The first thing you need to do is instantiate a new instance of `Netitor`. The constructor requires an options object with query selector string of an element in your HTML page, like:

```js
// assuming there's something like a <div id="editor"></div> on your page
const ne = new Netitor({
  ele: '#editor'
})
```

there are a series of additional optional arguments you can pass.

```js
const ne = new Netitor({
  ele: '#editor',
  render: '#output',
  code: '<h1> example code here </h1>',
  theme: 'dark',
  background: true,
  language: 'html',
  lint: true,
  hint: true,
  autoUpdate: true,
  updateDelay: 500,
  friendlyErr: true
})
```

| property | default | description |
|:---:|:---:|:---:|
| render | none | query selector string of an element to display the realtime  code output in
| code | none | initial code to include in the editor
| theme | dark | syntax highlight theme to use
| background | true | if false, background will be transparent
| language | html | can be html, css or javascript
| lint | true | whether or not to check for errors in realtime
| hint | true | whether or not to display autocomplete menus
| autoUpdate | true | whether or not to update the render preview when code changes
| updateDelay | 500 | how many milliseconds to wait after code changes before preview updates
| friendlyErr | true | whether or not to translate default error messages into beginner friendly vernacular (when available)

## Properties

all of these options can be changed at any point by reassigning the property of the same name:

```js
ne.code = '<h1> some other code </h1>'
ne.theme = 'monokai' // or 'light' or 'dark'
ne.background = false
ne.language = 'css'
ne.lint = false
ne.hint = false
ne.autoUpdate = false
ne.updateDelay = 2000
ne.friendlyErr = false
```
### read-only properites

Netitor is a fully static web-based editor, as such it allows you to save and load code sketches to the URL (no database or back-end needed to save/share/remix/etc), in order to check if the current URL has a hash with code/data in it you can use `ne.hasCodeInHash`, this read-only property returns either `true` or `false`

You can check to see if the code in the editor is "tidy" (aka property formatted/indented) by calling `ne.isTidy`.

## Methods

**update()**: if the `autoUpdate` is set to `false` you can control when you want the preview window to update yourself by calling: `ne.update()`

**highlight(lineNumber, color)**: this method will highlight a line of code in the editor. It requires a number as it's first argument (the line you want to highlight) with a CSS color string as an optional second argument (the default color is a translucent red). To remove a highlight simply call the method with 0 as the first argument (ex: `ne.highlight(0)`).

**saveToHash()**: this method will take all the code currently in the editor and save an encoded/compressed version of it to the current site's URL hash.

**loadFromHash()**: if the current site's URL hash has encoded/compressed code in it (which you can check for using `ne.hasCodeInHash`) this will decode the URL and load the data into the editor.

**loadFromURL(url)**: if you have some example code saved online somewhere (with CORS enabled) this method will send a fetch request for that code and load it up in the editor.

**tidy()**: calling this method will clean-up (aka format) the code in the editor (fix spacing, indentation, etc).

**on('event-name', callbackFunction)**: the netitor has a l(still working on it)ist of events you can listen for and pass a callback function to, for example:

```js
ne.on('code-update', (event) => {
  // this function will run every time the code in the editor changes
})
```

### events

**code-update**: This fires every time the code in the netitor changes. The `data` passed into the callback function is a string containing all the code currently in the editor (essentially the same as `ne.code`)

**hint-select**: This fires every time the user tabs up or down in the autocomplete hinting menu with the up/down arrow keys. The data object passed into the callback function contains the language of and the autocomplete option currently selected, an example might look like this:
```js
{
  language: "css",
  data: "color"
}
```

**lint-error**: Assuming you have `lint` set to `true`, if/when there are any errors in the netitor this callback will fire. The callback gets passed an array of error objects. These error objects vary a bit between languages but will all have at the very least the following properties:
```js
{
  type: "error", // or "warning"
  message: "traditional error message in programmer lingo",
  friendly: "beginner friendly error message",
  line: 6, // line where the error was found
  col: 3 // column where the error was found
}
```

**edu-info**: Anytime you double-click on a piece of code in the netitor this callback will fire. The data object passed into the callback function will at the very least look this:
```js
{
  language: "html",
  data: "class",
  type: "attribute",
  nfo: {…}
}
```
The `nfo` property will contain an object with educational/reference information as well as links to further resources on that particular piece of code. This may not always be available, it depends on whether the particular piece of code selected has additional info. This info is generated from our [eduscraper](https://github.com/netizenorg/eduscraper) you can take a look at that repo to get a sense of the structure of the data.


# Development

As with most node/javascript projects, you'll need to run `npm install` after cloning this repository to download it's dependencies.

All the source code can be found in `src`. As mentioned before the `index.html` page is a working example and can be used to test changes you make to the source code. The `build` folder contains the compiled source code (which is used by `index.html`) and can be built by running `npm run build`. The build process will do the following:

1. First it'll run `npm run lint` to make sure all the srouce code conforms to the [JavaScript Standard Style](https://standardjs.com/), if it does not then it will throw errors in the console letting you know what line is off (I recommend installing the the [JS Standard plugin](https://standardjs.com/#are-there-text-editor-plugins) in your code editor so you spot lint errors while you code rather than having to bounce back and fourth between your editor and console everytime you build)

2. Then it'll run `npm run compile-css` which takes our `src/css/main.css` (which contains our custom syntax highlighting themes) file as well as the codemirror CSS files and bundles them up into a js module `src/css/main.js` which is used by the `src/main.js` to inject the relevant CSS into the page.

3. Then it'll run `browserify` to bundle all the source code into `build/netitor.js`

To make things easier, you can alternatively run `npm run watch` which will listen for any changes to any js files in `src` and auto-run the build process for you everytime you make changes. **NOTE:** this only watches chaanges to js files, so any changes to `js/css/main.css` requires a manually running `npm run build` or `npm run compile-css` directly.

### edu-info

The `nfo` property in the object passed to callbacks attached to the `edu-info` event is populated with data from the json files located in the `edu-data` folder. These files are generated by running `npm run eduscraper`. It is VERY UNLIKELY you will need to run this script. These json files have already been created, so the only reason to run this script is if/when there is new data available in one of the scraped websites and/or if there's been an update to the [eduscraper](https://github.com/netizenorg/eduscraper) repo (in which case you would first need to delete the `node_modules/eduscraper` directory && rerun `npm install` to download the latest version before running it).
