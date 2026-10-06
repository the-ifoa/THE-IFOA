// Gives every published course its own enrollment-form schema, cloned from the
// default template (falls back to the built-in default schema if no template
// doc exists). Courses without a schema show "Registration is not open yet".
//   npm run seed:course-forms              # only courses that have no form yet
//   npm run seed:course-forms -- --force   # overwrite every course's form
//   npm run seed:course-forms -- --all     # include draft courses too
require('dotenv').config()

const mongoose = require('mongoose')
const { connectDB } = require('../config/db')
const Course = require('../models/Course')
const FormSchema = require('../models/FormSchema')
const { defaultFormSchema } = require('../utils/defaultFormSchema')

async function run() {
  const force = process.argv.includes('--force')
  const includeDrafts = process.argv.includes('--all')
  await connectDB()

  const template = await FormSchema.findOne({ isTemplate: true }).lean()
  const sections = template?.sections?.length ? template.sections : defaultFormSchema.sections
  console.log(
    `Using ${template?.sections?.length ? 'saved template' : 'built-in default'} (${sections.length} sections).`
  )

  const filter = includeDrafts ? {} : { status: 'published' }
  const courses = await Course.find(filter).select('_id title slug').lean()
  console.log(`${courses.length} course(s) to process.`)

  let created = 0
  let overwritten = 0
  let skipped = 0

  // These editions apply through the Flight Dispatcher Initial form (see enrollPath in the frontend), so they get no form of their own.
  const APPLY_VIA_OTHER_FORM = new Set(['flight-dispatcher-initial-training-india', 'flight-dispatcher-initial-training-usa'])

  for (const course of courses) {
    if (APPLY_VIA_OTHER_FORM.has(course.slug)) {
      skipped++
      continue
    }
    const existing = await FormSchema.findOne({ course: course._id })
    if (existing && !force) {
      skipped++
      continue
    }
    if (existing) {
      existing.sections = sections
      existing.isTemplate = false
      await existing.save()
      overwritten++
      console.log(`  overwritten  ${course.slug}`)
    } else {
      await FormSchema.create({ course: course._id, isTemplate: false, sections })
      created++
      console.log(`  created      ${course.slug}`)
    }
  }

  console.log(`\nDone. created: ${created}, overwritten: ${overwritten}, skipped (already had one): ${skipped}`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
