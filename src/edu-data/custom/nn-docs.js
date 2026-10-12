// merges nn's docs with the docs for nn extensions (netnet-machine-learning)
const docs = [
  require('./nn-netitor-docs.json'),
  require('./nn-ml-netitor-docs.json')
]
const merged = {}
for (const d of docs) {
  for (const ns in d) merged[ns] = { ...merged[ns], ...d[ns] }
}
module.exports = merged
