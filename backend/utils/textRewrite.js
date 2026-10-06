// Shared by the one-off copy-fix scripts (fixFormText.js, fixCourseCopy.js):
// walks a MongoDB document, applies string rules to every string value, and
// reports each change as { path, before, after } without mutating the input.
const mongoose = require('mongoose')

const SKIP_KEYS = new Set(['_id', '__v', 'slug', 'courseSlug', 'url', 'key', 'href', 'createdAt', 'updatedAt'])

const isPlainContainer = (v) =>
  v && typeof v === 'object' && !(v instanceof Date) && !(v instanceof mongoose.Types.ObjectId) && !v._bsontype

// Rules are [from, to, label?]. Returns the new string and the labels of the rules that fired.
function applyRules(str, rules) {
  let out = str
  const hits = []
  for (const [from, to, label] of rules) {
    const next = out.replace(from, to)
    if (next !== out) hits.push(label || String(from).slice(0, 40))
    out = next
  }
  return { out, hits }
}

function rewrite(value, rules, changes, pathParts = []) {
  const key = pathParts[pathParts.length - 1]
  if (typeof key === 'string' && SKIP_KEYS.has(key)) return value
  if (typeof value === 'string') {
    const { out, hits } = applyRules(value, rules)
    if (out !== value) changes.push({ path: pathParts.join('.'), before: value, after: out, hits })
    return out
  }
  if (Array.isArray(value)) return value.map((v, i) => rewrite(v, rules, changes, [...pathParts, i]))
  if (isPlainContainer(value)) {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = rewrite(v, rules, changes, [...pathParts, k])
    return out
  }
  return value
}

// A short window around the first difference, for readable dry-run output.
function snippet(before, after, width = 70) {
  let i = 0
  while (i < before.length && before[i] === after[i]) i++
  const start = Math.max(0, i - 25)
  const cut = (s) => `${start ? '…' : ''}${s.slice(start, start + width)}${s.length > start + width ? '…' : ''}`.replace(/\n/g, '\\n')
  return { before: cut(before), after: cut(after) }
}

module.exports = { rewrite, snippet }
