// Copies enrollment submissions from the old standalone forms app (database
// ifoa_forms, connection string in forms_ifoa/backend/.env) into the main site's
// Submission collection, as Flight Dispatcher Initial applications for Europe
// (Denmark, Sønderborg).
//
//   node scripts/seedLegacySubmissions.js           # dry run: prints what would be written
//   node scripts/seedLegacySubmissions.js --write   # writes to the database in MONGO_URI
//
// The target is whatever MONGO_URI in backend/.env points to, so check the
// "target" line the script prints before using --write. Safe to run twice:
// submissions already present (same passport number and submission time) are skipped.
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const Course = require('../models/Course')
const FormSchema = require('../models/FormSchema')
const Submission = require('../models/Submission')

const COURSE_SLUG = 'flight-dispatcher-initial-certification'
const TRAINING_LOCATION = 'Denmark (Sønderborg, Europe)'
// Old promotion batch label -> intake label on the course.
const BATCH_TO_INTAKE = { 'FDIN-2701': '4 January 2027' }

const write = process.argv.includes('--write')

function legacyUri() {
  const envFile = path.join(__dirname, '../../forms_ifoa/backend/.env')
  const m = fs.readFileSync(envFile, 'utf8').match(/^MONGO_URI=(.*)$/m)
  if (!m) throw new Error(`MONGO_URI not found in ${envFile}`)
  return m[1].trim()
}

const host = (uri) => uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@/, '').split('?')[0]

async function main() {
  const targetUri = process.env.MONGO_URI
  console.log(`target : ${host(targetUri)}`)
  console.log(`source : ${host(legacyUri())}`)
  console.log(write ? 'mode   : WRITE' : 'mode   : dry run (nothing is written)')

  const legacy = await mongoose.createConnection(legacyUri(), { serverSelectionTimeoutMS: 15000 }).asPromise()
  const oldSubs = await legacy.db.collection('submissions').find().sort({ submittedAt: 1 }).toArray()
  await legacy.close()
  console.log(`\n${oldSubs.length} submission(s) in the old database`)

  await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 15000 })
  const course = await Course.findOne({ slug: COURSE_SLUG }).lean()
  if (!course) throw new Error(`course ${COURSE_SLUG} not found in the target database`)
  const form = await FormSchema.findOne({ course: course._id }).lean()
  if (!form) throw new Error(`no application form for ${COURSE_SLUG}`)
  const sections = form.sections

  // Target field ids per section, to map the old answers onto the current form.
  const fieldIds = Object.fromEntries(sections.map((s) => [s.id, new Set(s.fields.map((f) => f.id))]))
  const intakeSection = sections.find((s) => s.fields.some((f) => f.type === 'intake'))
  const intakeFieldId = intakeSection?.fields.find((f) => f.type === 'intake')?.id
  const countrySection = sections.find((s) => s.fields.some((f) => f.id === 'trainingCountry'))

  let created = 0
  let skipped = 0
  for (const old of oldSubs) {
    const oldAnswers = old.answers || {}
    const answers = {}
    const unmapped = []

    for (const [sectionId, sectionAnswers] of Object.entries(oldAnswers)) {
      for (const [fieldId, value] of Object.entries(sectionAnswers || {})) {
        if (fieldIds[sectionId]?.has(fieldId)) {
          answers[sectionId] = { ...answers[sectionId], [fieldId]: value }
        } else {
          unmapped.push(`${sectionId}.${fieldId}`)
        }
      }
    }

    const intakeLabel = BATCH_TO_INTAKE[old.promotionBatch]
    if (!intakeLabel) throw new Error(`no intake mapping for promotion batch "${old.promotionBatch}"`)
    if (intakeSection && intakeFieldId) {
      answers[intakeSection.id] = { ...answers[intakeSection.id], [intakeFieldId]: intakeLabel }
    }
    if (countrySection) {
      answers[countrySection.id] = { ...answers[countrySection.id], trainingCountry: TRAINING_LOCATION }
    }

    const info = oldAnswers['student-info'] || {}
    const name = `${info.firstName || ''} ${info.surname || ''}`.trim() || String(old._id)
    const passport = info.passportNumber || ''
    const dupe = passport
      ? await Submission.exists({
          courseSlug: COURSE_SLUG,
          submittedAt: old.submittedAt,
          'answers.student-info.passportNumber': passport
        })
      : null

    console.log(
      `\n- ${name} | batch ${old.promotionBatch} -> intake "${intakeLabel}" | ${new Date(old.submittedAt).toISOString()}` +
        (dupe ? '\n  already in the target, skipped' : '')
    )
    if (unmapped.length) console.log(`  not mapped (no matching field in the current form): ${unmapped.join(', ')}`)
    if (dupe) {
      skipped++
      continue
    }

    if (write) {
      await Submission.create({
        course: course._id,
        courseTitle: course.title,
        courseRefCode: course.refCode || '',
        courseSlug: course.slug,
        formSchemaSnapshot: sections,
        intake: intakeLabel,
        answers,
        status: 'new',
        submittedAt: old.submittedAt
      })
    }
    created++
  }

  console.log(`\n${write ? 'created' : 'would create'}: ${created}, skipped (already there): ${skipped}`)
  if (!write) console.log('Dry run only. Re-run with --write to save.')
  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
