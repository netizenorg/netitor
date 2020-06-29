# netitor
a pedagogical web based code editor for creative netizens in training

**WORK IN PROGRESS**

# USAGE

```js
const ne = new Netitor({
  ele: '#editor', // required
  render: '#output', // optional
  code: '<h1> example code here </h1>', // optional
  language: 'html', // default (optional)
  lint: true, // default (optional)
  hint: true, // default (optional)
  autoUpdate: true, // default (optional)
  updateDelay: 500, // default (optional)
  friendlyErr: true // default (optional)
})

ne.update()

ne.on('lint-error', callback)
ne.on('edu-info', callback)
ne.on('hint-select', callback)
ne.on('code-update', callback)
```
