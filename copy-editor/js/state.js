// Shared mutable state — imported by renderer, claude, and main.
// All modules mutate properties on this object directly (e.g. state.idx = 3).

export const state = {
  filePath:  null,       // currently loaded file path (e.g. '../src/edu-data/...')
  fileData:  null,       // raw JSON object from fetch
  entries:   [],         // [{ id, label, data }] — normalized flat list
  idx:       -1,         // currently selected entry index
  editData:  null,       // deep-cloned working copy of entries[idx].data
  savedMap:  new Map(),  // entryId → saved data from IndexedDB
};
