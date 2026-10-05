const mongoose = require('mongoose')
const Course = require('../models/Course')
const FormSchema = require('../models/FormSchema')
const Submission = require('../models/Submission')
const { asyncHandler } = require('../middleware/error')
const { validateAnswers, findIntakeFieldId, conditionMet } = require('../utils/validateAnswers')
const { sendMail } = require('../utils/mailer')

const STATUSES = ['new', 'contacted', 'confirmed', 'rejected']

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const formatAnswer = (field, value) => {
  if (field.type === 'checkbox') return value === true ? 'Yes' : 'No'
  if (field.type === 'checkboxGroup') return Array.isArray(value) && value.length ? value.join(', ') : 'Not provided'
  if (value === undefined || value === null || value === '') return 'Not provided'
  return String(value)
}

// Best-effort notification to the office inbox with the full submission -
// mirrors contactController's pattern (save first, email is not required to succeed).
async function notifySubmission({ course, intake, sections, answers, submissionId }) {
  let replyTo
  let applicant = ''
  let trainingLocation = ''
  const rows = []

  for (const section of sections) {
    const sectionAnswers = (answers && answers[section.id]) || {}
    const fields = [...section.fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    for (const field of fields) {
      if (field.type === 'staticText') continue
      // Skip fields the applicant never saw (e.g. company details when they
      // answered "No" to enrolling on behalf of a company).
      if (field.visibleIf && !conditionMet(field.visibleIf, sectionAnswers)) continue
      const value = sectionAnswers[field.id]
      if (field.type === 'email' && !replyTo && typeof value === 'string' && value) replyTo = value
      if (field.id === 'trainingCountry' && value) trainingLocation = String(value)
      if (section.id === 'student-info' && (field.id === 'firstName' || field.id === 'surname') && value) {
        applicant = applicant ? `${applicant} ${value}` : String(value)
      }
      rows.push({ section: section.title, label: field.label || field.id, value: formatAnswer(field, value) })
    }
  }

  // Always state where the applicant wants to train: the location they picked,
  // else the course's own location (courses without a location question).
  const location = trainingLocation || course.location || 'Not specified'

  // Tuition for the chosen training location (falls back to the course price).
  const lp = (course.locationPrices || []).find((p) => p.location === trainingLocation)
  const price = lp || course.price
  const tuition =
    price && price.amount != null
      ? `${Number(price.amount).toLocaleString(price.currency === 'INR' ? 'en-IN' : 'en-US')} ${price.currency || ''}`.trim()
      : ''

  const text = [
    `Course: ${course.title}${course.refCode ? ` (${course.refCode})` : ''}`,
    `Training location: ${location}`,
    applicant ? `Applicant: ${applicant}` : null,
    tuition ? `Tuition: ${tuition}` : null,
    `Intake: ${intake || 'Not specified'}`,
    `Submission ID: ${submissionId}`,
    '',
    ...rows.map((r) => `${r.section} - ${r.label}: ${r.value}`)
  ]
    .filter((line) => line !== null)
    .join('\n')

  const html = `
    <p><strong>Course:</strong> ${escapeHtml(course.title)}${course.refCode ? ` (${escapeHtml(course.refCode)})` : ''}</p>
    <p><strong>Training location:</strong> ${escapeHtml(location)}</p>
    ${applicant ? `<p><strong>Applicant:</strong> ${escapeHtml(applicant)}</p>` : ''}
    ${tuition ? `<p><strong>Tuition:</strong> ${escapeHtml(tuition)}</p>` : ''}
    <p><strong>Intake:</strong> ${escapeHtml(intake || 'Not specified')}</p>
    <p><strong>Submission ID:</strong> ${escapeHtml(submissionId)}</p>
    ${Object.entries(
      rows.reduce((acc, r) => {
        ;(acc[r.section] = acc[r.section] || []).push(r)
        return acc
      }, {})
    )
      .map(
        ([sectionTitle, sectionRows]) => `
          <h3 style="margin:18px 0 6px">${escapeHtml(sectionTitle)}</h3>
          ${sectionRows
            .map(
              (r) =>
                `<p style="margin:2px 0"><strong>${escapeHtml(r.label)}:</strong> ${escapeHtml(r.value)}</p>`
            )
            .join('')}
        `
      )
      .join('')}
  `

  await sendMail({
    to: process.env.MAIL_TO || 'info@theifoa.com',
    replyTo,
    subject: `New enrollment: ${course.title} - ${location}${intake ? ` (${intake})` : ''}${applicant ? ` - ${applicant}` : ''}`,
    text,
    html
  })
}

// ---------- Public ----------

// POST /api/courses/:slug/register
const create = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: 'published' })
  if (!course) return res.status(404).json({ message: 'Course not found' })
  if (!course.registrationOpen) {
    return res.status(409).json({ message: 'Registration is closed for this course' })
  }

  const { answers } = req.body || {}
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ message: 'answers is required' })
  }

  const schema = await FormSchema.findOne({ course: course._id }).lean()
  if (!schema) {
    return res.status(409).json({ message: 'Registration is not open for this course' })
  }
  const sections = schema.sections

  const errors = validateAnswers(sections, answers)

  const intakeRef = findIntakeFieldId(sections)
  const intake = intakeRef ? answers[intakeRef.sectionId]?.[intakeRef.fieldId] || '' : ''

  // Enforce the intake choice only when the course actually offers intakes.
  if (intakeRef) {
    const section = sections.find((s) => s.id === intakeRef.sectionId)
    const field = section?.fields.find((f) => f.id === intakeRef.fieldId)
    const activeIntakes = (course.intakes || []).filter((i) => i.isActive)
    if (field?.required && activeIntakes.length > 0 && !intake) {
      errors.push(`${section.title}: ${field.label || 'Intake'} is required.`)
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }

  const submission = await Submission.create({
    course: course._id,
    courseTitle: course.title,
    courseRefCode: course.refCode,
    courseSlug: course.slug,
    formSchemaSnapshot: sections,
    intake,
    answers
  })

  try {
    await notifySubmission({ course, intake, sections, answers, submissionId: String(submission._id) })
  } catch (err) {
    console.error('submissionController.create: notifySubmission failed', err)
  }

  res.status(201).json({
    message:
      'Enrollment received. Download your completed form below and email the signed copy to info@theIFOA.com.',
    submissionId: submission._id,
    id: submission._id
  })
})

// GET /api/submissions/:id - used by the public success screen to render the PDF.
const getPublicOne = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Submission not found' })
  }
  const submission = await Submission.findById(req.params.id)
    .select('formSchemaSnapshot answers intake courseTitle courseRefCode submittedAt')
    .lean()
  if (!submission) return res.status(404).json({ message: 'Submission not found' })
  res.json({ submission })
})

// ---------- Admin ----------

// GET /api/admin/submissions?course=&status=&q=
const list = asyncHandler(async (req, res) => {
  const { course, status, q } = req.query
  const filter = {}
  if (course) filter.course = course
  if (status && status !== 'all') filter.status = status

  let submissions = await Submission.find(filter)
    .populate('course', 'title slug refCode')
    .sort({ submittedAt: -1 })
    .lean()

  if (q) {
    const needle = String(q).toLowerCase()
    submissions = submissions.filter((s) => {
      const hay = (
        JSON.stringify(s.answers || {}) +
        ' ' +
        (s.courseTitle || '') +
        ' ' +
        (s.intake || '')
      ).toLowerCase()
      return hay.includes(needle)
    })
  }

  res.json({ count: submissions.length, submissions })
})

// GET /api/admin/submissions/:id
const getOne = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('course', 'title slug refCode')
    .lean()
  if (!submission) return res.status(404).json({ message: 'Submission not found' })
  res.json({ submission })
})

// PUT /api/admin/submissions/:id - edit answers and/or workflow fields.
const update = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
  if (!submission) return res.status(404).json({ message: 'Submission not found' })

  const { answers, status, adminNotes } = req.body || {}

  if (answers !== undefined) {
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'answers must be an object' })
    }
    const errors = validateAnswers(submission.formSchemaSnapshot, answers)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors })
    }
    submission.answers = answers

    const intakeRef = findIntakeFieldId(submission.formSchemaSnapshot)
    if (intakeRef) {
      const next = answers[intakeRef.sectionId]?.[intakeRef.fieldId]
      if (next) submission.intake = next
    }
  }

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(', ')}` })
    }
    submission.status = status
  }
  if (adminNotes !== undefined) submission.adminNotes = adminNotes

  await submission.save()
  res.json({ submission })
})

// DELETE /api/admin/submissions/:id
const remove = asyncHandler(async (req, res) => {
  const deleted = await Submission.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Submission not found' })
  res.json({ message: 'Submission deleted' })
})

// GET /api/admin/registrations/legacy - read-only view of the pre-dynamic-form
// Registration rows so historical data stays reachable.
const listLegacyRegistrations = asyncHandler(async (req, res) => {
  let Registration
  try {
    Registration = require('../models/Registration')
  } catch {
    return res.json({ count: 0, registrations: [] })
  }
  const registrations = await Registration.find({})
    .populate('course', 'title slug refCode')
    .sort({ createdAt: -1 })
    .lean()
  res.json({ count: registrations.length, registrations })
})

module.exports = { notifySubmission, create, getPublicOne, list, getOne, update, remove, listLegacyRegistrations }
