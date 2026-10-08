/**
 * Compares each page's frontend FALLBACK (what the prerender gives Google) with
 * the backend DEFAULTS in backend/utils/pageContent.js (what visitors get once
 * the API answers). They should be identical: when they differ, Google indexes
 * one text and visitors read another.
 *
 *   node scripts/checkContentDrift.mjs          prints every difference, exit 1 if any
 *   node scripts/checkContentDrift.mjs --quiet  only the summary line
 *   node scripts/checkContentDrift.mjs --json   the differences as JSON
 *
 * The FALLBACK object literal is read straight out of each page's source, so the
 * check needs no build. Identifiers inside it (images, icons) are stubbed, and
 * only differences in text (strings) are reported.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const { DEFAULTS } = require(path.join(ROOT, '../backend/utils/pageContent.js'))

const PAGES = {
  home: 'src/pages/HomePage.jsx',
  contact: 'src/pages/ContactPage.jsx',
  about: 'src/pages/AboutPage.jsx',
  services: 'src/pages/ServicesPage.jsx',
  events: 'src/pages/EventsPage.jsx',
  foxtrotDelta: 'src/pages/FoxtrotDeltaPage.jsx',
  courseEnrollment: 'src/pages/CourseEnrollmentPage.jsx',
  courseDetail: 'src/components/course/CourseDetailView.jsx'
}

const quiet = process.argv.includes('--quiet')
const asJson = process.argv.includes('--json') // machine-readable list of differences, for tooling
const all = []

// Text of the `const FALLBACK = { ... }` literal, by brace matching that skips strings and comments.
function extractFallback(source) {
  const start = source.indexOf('const FALLBACK = {')
  if (start < 0) return null
  const open = source.indexOf('{', start)
  let depth = 0
  let i = open
  let quote = null
  for (; i < source.length; i++) {
    const ch = source[i]
    const next = source[i + 1]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === '/' && next === '/') { i = source.indexOf('\n', i); continue }
    if (ch === '/' && next === '*') { i = source.indexOf('*/', i) + 1; continue }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue }
    if (ch === '{') depth++
    if (ch === '}' && --depth === 0) return source.slice(open, i + 1)
  }
  return null
}

// Any identifier resolves to a harmless stub, so image/icon references don't break evaluation.
const stub = () => new Proxy(function () {}, { get: (_, k) => (k === Symbol.toPrimitive ? () => '' : stub()), apply: () => stub() })
const scope = new Proxy({}, { has: (_, k) => typeof k === 'string' && k !== 'undefined', get: (_, k) => (k === Symbol.unscopables ? undefined : stub()) })

function evaluate(literal) {
  return new Function('scope', `with (scope) { return (${literal}) }`)(scope)
}

// Flatten to { 'a.b.0.c': 'text' } keeping only strings.
function flatten(value, prefix = '', out = {}) {
  if (typeof value === 'string') out[prefix] = value
  else if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${prefix}.${i}`, out))
  else if (value && typeof value === 'object' && !(typeof value === 'function')) {
    for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out)
  }
  return out
}
Course details

let differences = 0
for (const [page, file] of Object.entries(PAGES)) {Course details

  const literal = extractFallback(readFileSync(path.join(ROOT, file), 'utf8'))
  if (!literal) { console.log(`${page}: no FALLBACK found in ${file}`); differences++; continue }
  let front
  try { front = flatten(evaluate(literal)) } catch (err) { console.log(`${page}: could not read FALLBACK (${err.message})`); differences++; continue }
  const back = flatten(DEFAULTS[page] || {})

  const rows = []
  for (const key of new Set([...Object.keys(front), ...Object.keys(back)])) {
    if (front[key] === back[key]) continue
    rows.push({ key, front: front[key], back: back[key] })
  }
  differences += rows.length
  for (const r of rows) all.push({ page, file, ...r })
  if (!quiet && !asJson) {
    console.log(`\n${page}: ${rows.length ? `${rows.length} difference(s)` : 'identical'}`)
    for (const r of rows) {
      const show = (v) => (v === undefined ? '(missing)' : JSON.stringify(v.length > 110 ? `${v.slice(0, 107)}…` : v))
      console.log(`  ${r.key}\n    frontend: ${show(r.front)}\n    backend : ${show(r.back)}`)
    }
  }
}
if (asJson) {
  console.log(JSON.stringify(all))
  process.exit(differences ? 1 : 0)
}
console.log(`\n${differences ? `${differences} difference(s) found` : 'No differences: frontend fallbacks match backend defaults'}`)
process.exit(differences ? 1 : 0)
