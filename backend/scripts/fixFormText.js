// One-off: fixes enrollment-form text stored in MongoDB (the template and every
// per-course form schema) so it matches the website and the privacy policy.
//
//   node scripts/fixFormText.js           (dry run: prints every change, writes nothing)
//   node scripts/fixFormText.js --apply   (writes the changes)
//
// What it changes (see RULES below):
//   - the privacy notice, which contradicted /privacy-policy
//   - the "EU immigration officer" clause, which only fits Europe
//   - "licence" -> "license" (the site uses US English)
//   - "graduation certificate" / "course completion certificate" -> "IFOA Certificate of Completion"
//   - the Course Request section description that mentioned an "EASA statement"
// Then it checks that no form still promises a dispatcher certificate "based on EASA
// regulations" and that non-dispatcher courses carry no dispatcher wording; anything
// left is printed as WARN for a human to read.
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Course = require('../models/Course')
const FormSchema = require('../models/FormSchema')
const { PRIVACY_NOTICE, COURSE_ACKNOWLEDGEMENT_TEXT } = require('../utils/staticContent')
const { rewrite, snippet } = require('../utils/textRewrite')

const APPLY = process.argv.includes('--apply')

const OLD_PRIVACY =
  'IFOA controls how your personal data is used following this notice. We use your personal data only for contacting purposes based on your consent. We may share your personal data with IFOA and non-IFOA trainers inside and outside the EU and USA. We will keep your personal data for one year and securely delete it afterward.'
const OLD_VISA_CLAUSE = 'IFOA cannot be held responsible if the EU immigration officer denies the EU entry at the port of entry.'
const NEW_VISA_CLAUSE = 'IFOA is not responsible if a visa or entry to the training country is refused.'
const IFOA_CERT = 'IFOA Certificate of Completion'

const RULES = [
  [OLD_PRIVACY, PRIVACY_NOTICE, 'privacy notice'],
  [OLD_VISA_CLAUSE, NEW_VISA_CLAUSE, 'visa clause'],
  [/\blicence(s?)\b/g, 'license$1', 'licence -> license'],
  [/\b(a|your) graduation certificate\b/g, (_, w) => (w === 'a' ? `an ${IFOA_CERT}` : `the ${IFOA_CERT}`), 'graduation certificate'],
  [/\ba course completion certificate\b/g, `an ${IFOA_CERT}`, 'course completion certificate'],
  ['Review curriculum program and EASA statement', 'Review the course details and certificate statement', 'section description']
]

// Acknowledgement checkbox. Forms still carrying the old text (a dispatcher
// "certificate based on EASA regulations") get the correct wording for their
// course: dispatcher courses say there is no EASA license; everything else gets
// the neutral line that makes no dispatcher claim.
const DISPATCHER_ACK =
  'I understand that there is no EASA flight dispatcher license: in Europe, each operator decides who may dispatch its flights. IFOA will issue an IFOA Certificate of Completion, built on ICAO Doc 10106 and EASA ORO.GEN.110(c)&(e), when I complete the course. It is not a government-issued license or certificate.'
const isOldAck = (label) => /EASA regulations/.test(label || '')

const DISPATCHER_COURSES = new Set([
  'flight-dispatcher-initial-certification',
  'flight-dispatcher-double-programme',
  'aircraft-dispatcher-training-faa-part-65'
])

const textOf = (sections) =>
  sections.flatMap((s) => [s.title, s.description, ...s.fields.flatMap((f) => [f.label, f.content, ...(f.options || [])])]).filter(Boolean)

// Pure: returns the corrected sections plus the changes made and any warnings.
function fixForm(form, slug) {
  const changes = []
  // Old acknowledgement text first, so it is reported like every other change.
  const withAck = form.sections.map((sec) => ({
    ...sec,
    fields: sec.fields.map((f) => {
      if (f.id !== 'acknowledgementAccepted' || !isOldAck(f.label)) return f
      const label = form.isTemplate || DISPATCHER_COURSES.has(slug) ? DISPATCHER_ACK : COURSE_ACKNOWLEDGEMENT_TEXT
      changes.push({ path: `sections.${sec.id}.fields.${f.id}.label`, before: f.label, after: label, hits: ['old acknowledgement'] })
      return { ...f, label }
    })
  }))
  const sections = rewrite(withAck, RULES, changes, ['sections'])

  // Checks on the text as it will be after the rewrite.
  const text = textOf(sections)
  const warn = []
  if (text.some((t) => /certificate based on (the )?EASA/i.test(t))) warn.push('still promises a certificate "based on EASA regulations"')
  if (!form.isTemplate && !DISPATCHER_COURSES.has(slug)) {
    // Only the Course Request section describes the certificate; background
    // questions (e.g. a "Licensed Flight Dispatcher" job option) are legitimate.
    const hit = textOf(sections.filter((s) => s.id === 'course-request')).find((t) => /dispatcher/i.test(t))
    if (hit) warn.push(`dispatcher wording on a non-dispatcher course: "${hit.slice(0, 90).replace(/\n/g, ' ')}…"`)
  }
  return { sections, changes, warn }
}

async function main() {
  await connectDB()
  console.log(`database: ${(process.env.MONGO_URI || '').replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('?')[0]}`)
  console.log(APPLY ? 'mode: APPLY' : 'mode: dry run (nothing is written)')

  const forms = await FormSchema.find({}).lean()
  const courses = new Map((await Course.find({}).select('slug').lean()).map((c) => [String(c._id), c.slug]))
  let changedDocs = 0
  let total = 0

  for (const form of forms) {
    const slug = form.isTemplate ? 'TEMPLATE' : courses.get(String(form.course)) || String(form.course)
    const { sections, changes, warn } = fixForm(form, slug)

    console.log(`\n${slug}: ${changes.length} change(s)`)
    for (const c of changes) {
      const s = snippet(c.before, c.after)
      console.log(`  ${c.path}  [${c.hits.join(', ')}]\n    - ${s.before}\n    + ${s.after}`)
    }
    for (const w of warn) console.log(`  WARN ${w}`)

    if (changes.length) {
      changedDocs++
      total += changes.length
      if (APPLY) await FormSchema.collection.updateOne({ _id: form._id }, { $set: { sections } })
    }
  }

  console.log(`\n${total} change(s) in ${changedDocs} of ${forms.length} form(s). ${APPLY ? 'Applied.' : 'Dry run only. Re-run with --apply to write.'}`)
  await mongoose.disconnect()
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { fixForm }
