// Dotted-path access into nested content objects (e.g. "blocks.2.items.0.title").
export function getAtPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)
}

// Mutates `obj` in place, creating intermediate objects as needed. Array
// segments are plain numeric-string keys (e.g. "disciplines.2.title"), which
// work the same way on arrays as on objects.
export function setAtPath(obj, path, value) {
  const keys = path.split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    cur = cur[k]
  }
  cur[keys[keys.length - 1]] = value
}

// Deep copy of plain JSON content.
export const clone = (v) => JSON.parse(JSON.stringify(v ?? null))
