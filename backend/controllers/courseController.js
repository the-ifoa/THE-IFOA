const Course = require('../models/Course')
const FormSchema = require('../models/FormSchema')
const { asyncHandler } = require('../middleware/error')
const { deleteObject } = require('../config/r2')
const { DEFAULTS, mergeContent } = require('../utils/pageContent')
const { defaultFormSchema } = require('../utils/defaultFormSchema')

// Fields a client is never allowed to set directly.
const PROTECTED = ['_id', 'createdAt', 'updatedAt', '__v']

function sanitize(body) {
  const out = { ...body }
  for (const field of PROTECTED) delete out[field]
  return out
}

// ---------- Public ----------

// GET /api/courses?category=&q=&featured=
const listPublic = asyncHandler(async (req, res) => {
  const { category, q, featured } = req.query
  const filter = { status: 'published' }
  if (category && category !== 'all') filter.category = category
  if (featured === 'true') filter.featured = true
  if (q) filter.$text = { $search: q }

  const courses = await Course.find(filter)
    .sort({ featured: -1, order: 1, 'schedule.startDate': 1, createdAt: -1 })
    .lean()

  // hasForm: the course has an online application form, so its Apply button can open it.
  const formed = new Set(
    (await FormSchema.find({ course: { $in: courses.map((c) => c._id) } }).select('course').lean()).map((f) => String(f.course))
  )
  for (const c of courses) c.hasForm = formed.has(String(c._id))

  res.json({ count: courses.length, courses })
})

// GET /api/courses/:slug
const getBySlug = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: 'published' }).lean()
  if (!course) return res.status(404).json({ message: 'Course not found' })

  // Merge this course's own chrome-text overrides on top of the shipped
  // defaults, so the public page gets its per-course copy in this same
  // request rather than a second call to the shared pages API.
  course.content = {
    courseDetail: mergeContent(DEFAULTS.courseDetail, course.pageContent?.courseDetail || {}),
    courseEnrollment: mergeContent(DEFAULTS.courseEnrollment, course.pageContent?.courseEnrollment || {})
  }
  course.hasForm = Boolean(await FormSchema.exists({ course: course._id }))

  res.json({ course })
})

// ---------- Admin ----------

// GET /api/admin/courses - includes drafts
const listAdmin = asyncHandler(async (req, res) => {
  const { status, q } = req.query
  const filter = {}
  if (status && status !== 'all') filter.status = status
  if (q) filter.title = { $regex: q, $options: 'i' }

  const courses = await Course.find(filter).sort({ updatedAt: -1 }).lean()

  const formedIds = new Set(
    (await FormSchema.find({ course: { $in: courses.map((c) => c._id) } }).select('course').lean()).map((f) =>
      String(f.course)
    )
  )
  const withFormStatus = courses.map((c) => ({ ...c, hasCustomForm: formedIds.has(String(c._id)), hasForm: formedIds.has(String(c._id)) }))

  res.json({ count: withFormStatus.length, courses: withFormStatus })
})

// GET /api/admin/courses/:id
const getById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).lean()
  if (!course) return res.status(404).json({ message: 'Course not found' })

  // Same merged chrome-text shape as the public getBySlug response, so the
  // admin preview page (which fetches by id) renders identically.
  course.content = {
    courseDetail: mergeContent(DEFAULTS.courseDetail, course.pageContent?.courseDetail || {}),
    courseEnrollment: mergeContent(DEFAULTS.courseEnrollment, course.pageContent?.courseEnrollment || {})
  }

  course.hasForm = Boolean(await FormSchema.exists({ course: course._id }))

  res.json({ course })
})

// PUT /api/admin/courses/:id
const update = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Course not found' })

  const keysBefore = new Set(course.imageKeys())
  course.set(sanitize(req.body))
  await course.save()

  // Drop R2 objects the course no longer references.
  const keysAfter = new Set(course.imageKeys())
  for (const key of keysBefore) {
    if (!keysAfter.has(key)) {
      // Orphaned files must not fail the update.
      deleteObject(key).catch((err) => console.warn('[r2] cleanup failed', key, err.message))
    }
  }

  res.json({ course })
})

// Copy text edits from `incoming` onto `current`, but only where `current`
// already holds a string - the inline editor changes wording, never the
// shape of the page (block types, links, layout flags stay as they are).
const STRUCTURE_KEYS = new Set([
  'type', 'layout', 'href', 'anchor', 'tone', 'tagTone', 'icon', 'image', 'src', 'id', 'slug',
  'adaptive', 'currency', 'url', 'mode'
])

function applyTextEdits(current, incoming) {
  if (Array.isArray(current)) {
    return current.map((v, i) => (Array.isArray(incoming) ? applyTextEdits(v, incoming[i]) : v))
  }
  // Plain objects only - ObjectIds, Dates etc. are kept as they are.
  if (current && typeof current === 'object' && Object.getPrototypeOf(current) === Object.prototype) {
    const out = { ...current }
    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
      for (const key of Object.keys(current)) {
        if (!STRUCTURE_KEYS.has(key)) out[key] = applyTextEdits(current[key], incoming[key])
      }
    }
    return out
  }
  if (typeof current === 'string' && typeof incoming === 'string') return incoming.slice(0, 5000)
  return current
}

// PUT /api/admin/courses/:id/overview - save inline text edits to the
// course page copy (course.overview).
const updateOverview = asyncHandler(async (req, res) => {
  const { overview } = req.body || {}
  if (!overview || typeof overview !== 'object' || Array.isArray(overview)) {
    return res.status(400).json({ message: 'overview must be an object' })
  }
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Course not found' })
  if (!course.overview) return res.status(400).json({ message: 'This course has no page copy to edit' })

  course.overview = applyTextEdits(course.overview, overview)
  course.markModified('overview')
  await course.save()
  res.json({ overview: course.overview })
})

// Course fields whose wording the inline page editor may change. Keep in sync
// with frontend/src/lib/courseText.js.
const TEXT_FIELDS = [
  'title', 'summary', 'eyebrow', 'heroNote', 'badges', 'trustStat', 'duration', 'location', 'format',
  'intakeLabel', 'curriculum', 'whatYouWillLearn', 'whoShouldAttend', 'entryRequirements', 'certification',
  'trainingStandards', 'bottomBanner', 'processSteps', 'trainingPhilosophy', 'dgrExplorer', 'sidebarSpecs',
  'price', 'rateCard', 'ctaLabel'
]

// PUT /api/admin/courses/:id/text-fields - save inline edits to the wording
// stored on the course. Numbers, currencies and list shapes are kept.
const updateTextFields = asyncHandler(async (req, res) => {
  const { fields } = req.body || {}
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return res.status(400).json({ message: 'fields must be an object' })
  }
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Course not found' })

  for (const key of TEXT_FIELDS) {
    if (fields[key] === undefined) continue
    const current = course.toObject()[key]
    if (current === undefined || current === null) continue
    course.set(key, applyTextEdits(current, fields[key]))
  }
  await course.save()
  res.json({ course })
})

// POST /api/admin/courses - starts a new course as a draft; the rest is filled in
// from the course settings and the live page editor.
const create = asyncHandler(async (req, res) => {
  const { title, category, slug } = req.body || {}
  if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'A course title is required' })
  const data = { title: title.trim().slice(0, 200), status: 'draft' }
  if (typeof category === 'string' && Course.schema.path('category').enumValues.includes(category)) data.category = category
  if (typeof slug === 'string' && slug.trim()) data.slug = slug.trim()
  try {
    const course = await Course.create(data)
    // Give the course the default application form so applications are accepted and
    // show up under Registrations. The admin can edit it per course afterwards.
    const template = await FormSchema.findOne({ isTemplate: true }).lean()
    await FormSchema.create({ course: course._id, isTemplate: false, sections: template?.sections || defaultFormSchema.sections })
    res.status(201).json({ course })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A course with that slug already exists' })
    throw err
  }
})

// DELETE /api/admin/courses/:id - removes the course, its application form and its images.
const remove = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: 'Course not found' })
  const keys = course.imageKeys()
  await FormSchema.deleteMany({ course: course._id })
  await course.deleteOne()
  for (const key of keys) {
    deleteObject(key).catch((err) => console.warn('[r2] cleanup failed', key, err.message))
  }
  res.json({ ok: true })
})

module.exports = { listPublic, getBySlug, listAdmin, getById, create, update, remove, updateOverview, updateTextFields }
