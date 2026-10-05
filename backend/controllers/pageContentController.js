const PageContent = require('../models/PageContent')
const Course = require('../models/Course')
const { asyncHandler } = require('../middleware/error')
const { deleteObject } = require('../config/r2')
const {
  PAGE_KEYS,
  PAGE_LABELS,
  SCHEMAS,
  DEFAULTS,
  mergeContent,
  sanitizeContent,
  isValidPage
} = require('../utils/pageContent')

// Per-course chrome overrides only exist for these two templates - every
// other page in PAGE_KEYS stays a single shared/global document.
const COURSE_SCOPED_PAGES = new Set(['courseDetail', 'courseEnrollment'])
function isValidCoursePage(page) {
  return COURSE_SCOPED_PAGES.has(page)
}

// R2 keys of every uploaded image ({ url, key, alt }) inside a content blob.
function imageKeys(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => imageKeys(v, out))
  else if (value && typeof value === 'object') {
    if (typeof value.key === 'string' && typeof value.url === 'string') out.add(value.key)
    Object.values(value).forEach((v) => imageKeys(v, out))
  }
  return out
}

// ---------- Public ----------

// GET /api/pages/:page - merged content the marketing page renders from.
const getPublicPage = asyncHandler(async (req, res) => {
  const { page } = req.params
  if (!isValidPage(page)) return res.status(404).json({ message: 'Unknown page' })

  const doc = await PageContent.findOne({ page }).lean()
  res.json({ page, data: mergeContent(DEFAULTS[page], doc?.data || {}) })
})

// ---------- Admin ----------

// GET /api/admin/pages - list of editable pages + last-updated.
const adminListPages = asyncHandler(async (req, res) => {
  const docs = await PageContent.find({ page: { $in: PAGE_KEYS } })
    .select('page updatedAt')
    .lean()
  const byPage = Object.fromEntries(docs.map((d) => [d.page, d.updatedAt]))

  res.json({
    pages: PAGE_KEYS.map((page) => ({
      page,
      label: PAGE_LABELS[page],
      updatedAt: byPage[page] || null,
      customized: Boolean(byPage[page])
    }))
  })
})

// GET /api/admin/pages/:page - schema + current (merged) values + defaults.
const adminGetPage = asyncHandler(async (req, res) => {
  const { page } = req.params
  if (!isValidPage(page)) return res.status(404).json({ message: 'Unknown page' })

  const doc = await PageContent.findOne({ page }).lean()
  res.json({
    page,
    label: PAGE_LABELS[page],
    schema: SCHEMAS[page],
    data: mergeContent(DEFAULTS[page], doc?.data || {}),
    defaults: DEFAULTS[page],
    customized: Boolean(doc)
  })
})

// PUT /api/admin/pages/:page - replace the stored override blob.
const adminUpdatePage = asyncHandler(async (req, res) => {
  const { page } = req.params
  if (!isValidPage(page)) return res.status(404).json({ message: 'Unknown page' })

  const { data } = req.body || {}
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ message: 'data must be an object' })
  }

  // Whitelist against SCHEMAS[page] - only known groups/fields/lists are ever
  // persisted, so an admin (or anyone hitting this endpoint directly) can only
  // ever change copy, never inject arbitrary keys the frontend might read.
  const sanitized = sanitizeContent(page, data)

  const before = await PageContent.findOne({ page }).lean()
  const doc = await PageContent.findOneAndUpdate(
    { page },
    { $set: { data: sanitized } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  )

  // Drop R2 objects for images that were replaced or removed.
  const keysAfter = imageKeys(sanitized)
  for (const key of imageKeys(before?.data)) {
    if (!keysAfter.has(key)) {
      deleteObject(key).catch((err) => console.warn('[r2] cleanup failed', key, err.message))
    }
  }
  res.json({ page, data: mergeContent(DEFAULTS[page], doc.data || {}) })
})

// DELETE /api/admin/pages/:page - revert to shipped defaults.
const adminResetPage = asyncHandler(async (req, res) => {
  const { page } = req.params
  if (!isValidPage(page)) return res.status(404).json({ message: 'Unknown page' })

  await PageContent.deleteOne({ page })
  res.json({ page, data: DEFAULTS[page] })
})

// ---------- Admin: per-course chrome overrides (courseDetail/courseEnrollment) ----------

// GET /api/admin/courses/:id/content/:page
const adminGetCourseContent = asyncHandler(async (req, res) => {
  const { id, page } = req.params
  if (!isValidCoursePage(page)) return res.status(400).json({ message: 'Unknown course content page' })

  const course = await Course.findById(id).lean()
  if (!course) return res.status(404).json({ message: 'Course not found' })

  const override = course.pageContent?.[page] || {}
  res.json({
    page,
    schema: SCHEMAS[page],
    data: mergeContent(DEFAULTS[page], override),
    defaults: DEFAULTS[page],
    customized: Object.keys(override).length > 0
  })
})

// PUT /api/admin/courses/:id/content/:page
const adminUpdateCourseContent = asyncHandler(async (req, res) => {
  const { id, page } = req.params
  if (!isValidCoursePage(page)) return res.status(400).json({ message: 'Unknown course content page' })

  const { data } = req.body || {}
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ message: 'data must be an object' })
  }

  const course = await Course.findById(id)
  if (!course) return res.status(404).json({ message: 'Course not found' })

  const sanitized = sanitizeContent(page, data)
  course.pageContent = course.pageContent || {}
  course.pageContent[page] = sanitized
  course.markModified('pageContent')
  await course.save()

  res.json({ page, data: mergeContent(DEFAULTS[page], sanitized) })
})

// DELETE /api/admin/courses/:id/content/:page - revert this course to defaults.
const adminResetCourseContent = asyncHandler(async (req, res) => {
  const { id, page } = req.params
  if (!isValidCoursePage(page)) return res.status(400).json({ message: 'Unknown course content page' })

  const course = await Course.findById(id)
  if (!course) return res.status(404).json({ message: 'Course not found' })

  course.pageContent = course.pageContent || {}
  course.pageContent[page] = {}
  course.markModified('pageContent')
  await course.save()

  res.json({ page, data: DEFAULTS[page] })
})

module.exports = {
  getPublicPage,
  adminListPages,
  adminGetPage,
  adminUpdatePage,
  adminResetPage,
  adminGetCourseContent,
  adminUpdateCourseContent,
  adminResetCourseContent
}
