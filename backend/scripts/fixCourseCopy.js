// One-off: fixes course copy stored in MongoDB so it matches the site.
//
//   node scripts/fixCourseCopy.js           (dry run: prints every change, writes nothing)
//   node scripts/fixCourseCopy.js --apply   (writes the changes)
//
// Changes (the seed scripts carry the same edits, so a reseed does not undo them):
//   - "Terms and Conditions" sidebar note (there is no Terms page)
//   - Flight Dispatcher Initial: authority is ICAO Doc 10106 / EASA Air Ops, not "FAA Part 65 Standards"
//   - comparison heading "EASA or FAA: which course?" -> "Which course is right for you?"
//   - USA Initial hero note: Europe-focused text replaced (TODO: confirm wording)
//   - Double Program: "hybrid program in Europe" -> Denmark or India
//   - Double Program certificate text: "course completion certificate" -> IFOA Certificate of Completion
//   - FAA course in India: one description, "5 weeks, plus an exam week taken within 6 months"
//   - Initial (Denmark) 4 January 2027 intake no longer lists "United States"
//     (TODO: confirm the USA edition does not start that day)
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Course = require('../models/Course')
const { rewrite, snippet } = require('../utils/textRewrite')

const APPLY = process.argv.includes('--apply')

const GLOBAL_RULES = [
  ['Payment, cancellation and refunds: see our Terms and Conditions.', 'Payment, cancellation and refund terms are part of the application form.', 'terms note'],
  ['EASA or FAA: which course?', 'Which course is right for you?', 'comparison heading'],
  [/200 hours, 5 weeks plus exam week/g, '200 hours, 5 weeks, plus an exam week taken within 6 months', 'FAA India duration'],
  [/\(in India: 5 weeks, with the exam week taken within 6 months\)/g, '(in India: 5 weeks, plus an exam week taken within 6 months)', 'FAA India duration']
]

const SLUG_RULES = {
  'flight-dispatcher-initial-certification': [
    ['EASA / FAA Part 65 Standards', 'ICAO Doc 10106 / EASA Air Ops', 'authority']
  ],
  'flight-dispatcher-initial-training-usa': [
    ['EASA / FAA Part 65 Standards', 'ICAO Doc 10106 / EASA Air Ops', 'authority']
  ],
  'flight-dispatcher-double-programme': [
    ['taught as one hybrid program in Europe', 'taught as one hybrid program in Denmark or India', 'delivery intro'],
    ['hybrid program in Europe', 'hybrid program in Denmark or India', 'SEO description'],
    ['From IFOA: a course completion certificate,', 'From IFOA: the IFOA Certificate of Completion,', 'certificate name']
  ]
}

// TODO(confirm wording with IFOA)
const USA_HERO_NOTE =
  'This course gives you an IFOA Certificate of Completion, built on ICAO Doc 10106. It does not lead to an FAA certificate. US airlines require the FAA Aircraft Dispatcher certificate, so if that is your goal, take our FAA Aircraft Dispatcher course instead.'

// Pure: returns the corrected course and the changes made.
function fixCourse(course) {
  const { _id, __v, ...doc } = course
  const changes = []
  let next = rewrite(doc, [...GLOBAL_RULES, ...(SLUG_RULES[course.slug] || [])], changes)

  if (course.slug === 'flight-dispatcher-initial-training-usa' && /^There is no EASA flight dispatcher license/.test(next.heroNote || '')) {
    changes.push({ path: 'heroNote', before: next.heroNote, after: USA_HERO_NOTE, hits: ['USA hero note'] })
    next = { ...next, heroNote: USA_HERO_NOTE }
  }

  if (course.slug === 'flight-dispatcher-initial-certification' && Array.isArray(next.intakes)) {
    next = {
      ...next,
      intakes: next.intakes.map((intake, i) => {
        if (!(intake.locations || []).includes('United States')) return intake
        const locations = intake.locations.filter((l) => l !== 'United States')
        changes.push({ path: `intakes.${i}.locations`, before: intake.locations.join(', '), after: locations.join(', '), hits: ['intake locations'] })
        return { ...intake, locations }
      })
    }
  }
  return { next, changes }
}

async function main() {
  await connectDB()
  console.log(`database: ${(process.env.MONGO_URI || '').replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('?')[0]}`)
  console.log(APPLY ? 'mode: APPLY' : 'mode: dry run (nothing is written)')

  const courses = await Course.find({}).lean()
  let changedDocs = 0
  let total = 0

  for (const course of courses) {
    const { next, changes } = fixCourse(course)
    if (!changes.length) continue
    changedDocs++
    total += changes.length
    console.log(`\n${course.slug}: ${changes.length} change(s)`)
    for (const c of changes) {
      const s = snippet(c.before, c.after)
      console.log(`  ${c.path}  [${c.hits.join(', ')}]\n    - ${s.before}\n    + ${s.after}`)
    }
    if (APPLY) await Course.collection.updateOne({ _id: course._id }, { $set: next })
  }

  console.log(`\n${total} change(s) in ${changedDocs} of ${courses.length} course(s). ${APPLY ? 'Applied.' : 'Dry run only. Re-run with --apply to write.'}`)
  await mongoose.disconnect()
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { fixCourse }
