// One-off: rewrites British "programme(s)" to US "program(s)" in the text
// stored in MongoDB (courses, site page overrides, form schemas). Slugs and
// URLs such as flight-dispatcher-double-programme are left alone so links
// keep working.
//
//   node scripts/usProgramSpelling.js           (dry run, prints what would change)
//   node scripts/usProgramSpelling.js --apply   (writes the changes)
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Course = require('../models/Course')
const PageContent = require('../models/PageContent')
const FormSchema = require('../models/FormSchema')

const APPLY = process.argv.includes('--apply')
const PATTERN = /(?<![-\w/])([Pp])rogramme(s?)\b/g
const SKIP_KEYS = new Set(['_id', 'slug', 'courseSlug', 'url', 'key', 'href'])

// Returns [newValue, count] without mutating the input.
function rewrite(value, key) {
  if (SKIP_KEYS.has(key)) return [value, 0]
  if (typeof value === 'string') {
    let n = 0
    const out = value.replace(PATTERN, (_, p, s) => {
      n++
      return `${p}rogram${s}`
    })
    return [out, n]
  }
  if (Array.isArray(value)) {
    let total = 0
    const out = value.map((v) => {
      const [nv, n] = rewrite(v, null)
      total += n
      return nv
    })
    return [out, total]
  }
  if (value && typeof value === 'object' && !(value instanceof Date) && !(value instanceof mongoose.Types.ObjectId)) {
    let total = 0
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const [nv, n] = rewrite(v, k)
      out[k] = nv
      total += n
    }
    return [out, total]
  }
  return [value, 0]
}

async function migrate(Model, label) {
  const docs = await Model.find({}).lean()
  let changedDocs = 0
  let changes = 0
  for (const doc of docs) {
    const { _id, __v, ...rest } = doc
    const [next, n] = rewrite(rest, null)
    if (!n) continue
    changedDocs++
    changes += n
    console.log(`${label} ${doc.slug || doc.page || doc.name || _id}: ${n}`)
    if (APPLY) await Model.collection.updateOne({ _id }, { $set: next })
  }
  console.log(`${label}: ${changes} replacement(s) in ${changedDocs} of ${docs.length} doc(s)`)
}

async function main() {
  await connectDB()
  await migrate(Course, 'Course')
  await migrate(PageContent, 'PageContent')
  await migrate(FormSchema, 'FormSchema')
  console.log(APPLY ? 'Applied.' : 'Dry run only. Re-run with --apply to write.')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
