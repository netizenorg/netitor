// IndexedDB helpers — module-level `db` variable keeps the open connection.
// DB name intentionally differs from the old editor.html ('netitor-editor')
// since file paths changed (now prefixed with '../') so keys would differ anyway.

let db = null;

export function initDB () {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('netitor-copy-editor', 1);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('edits')) {
        d.createObjectStore('edits', { keyPath: 'key' });
      }
    };
    req.onsuccess = e => { db = e.target.result; resolve(); };
    req.onerror   = e => reject(e.target.error);
  });
}

function idbKey (filePath, entryId) {
  return `${filePath}||${entryId}`;
}

export function idbGet (filePath, entryId) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('edits', 'readonly')
                  .objectStore('edits')
                  .get(idbKey(filePath, entryId));
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror   = e => reject(e.target.error);
  });
}

export function idbDelete (filePath, entryId) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('edits', 'readwrite')
                  .objectStore('edits')
                  .delete(idbKey(filePath, entryId));
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

export function idbPut (filePath, entryId, data) {
  return new Promise((resolve, reject) => {
    const req = db.transaction('edits', 'readwrite')
                  .objectStore('edits')
                  .put({ key: idbKey(filePath, entryId), filePath, entryId, data, savedAt: Date.now() });
    req.onsuccess = () => resolve();
    req.onerror   = e => reject(e.target.error);
  });
}

/**
 * Delete every saved edit that belongs to filePath.
 */
export function idbDeleteAllForFile (filePath) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('edits', 'readwrite');
    const store = tx.objectStore('edits');
    const req   = store.openCursor();
    req.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.filePath === filePath) cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror    = e => reject(e.target.error);
  });
}

/**
 * Returns a Map of entryId → data for all saved edits belonging to filePath.
 */
export function idbGetAllForFile (filePath) {
  return new Promise((resolve, reject) => {
    const results = new Map();
    const req = db.transaction('edits', 'readonly')
                  .objectStore('edits')
                  .openCursor();
    req.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.filePath === filePath) {
          results.set(cursor.value.entryId, cursor.value.data);
        }
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = e => reject(e.target.error);
  });
}
