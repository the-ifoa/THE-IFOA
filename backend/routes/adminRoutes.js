const express = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../controllers/authController')
const courses = require('../controllers/courseController')
const formSchema = require('../controllers/formSchemaController')
const submissions = require('../controllers/submissionController')
const contact = require('../controllers/contactController')
const pageContent = require('../controllers/pageContentController')
const uploads = require('../controllers/uploadController')
const { requireAdmin } = require('../middleware/auth')
const { upload } = require('../middleware/upload')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' }
})

// ---- Auth ----
router.post('/auth/login', loginLimiter, auth.login)
router.post('/auth/logout', auth.logout)
router.get('/auth/me', requireAdmin, auth.me)

// Everything below requires a valid admin session.
router.use(requireAdmin)

// ---- Courses ----
router.get('/courses', courses.listAdmin)
router.post('/courses', courses.create)
router.get('/courses/:id', courses.getById)
router.put('/courses/:id', courses.update)
router.delete('/courses/:id', courses.remove)
router.put('/courses/:id/overview', courses.updateOverview)
router.put('/courses/:id/text-fields', courses.updateTextFields)

// ---- Per-course enrollment form schema ----
router.get('/courses/:id/form-schema', formSchema.getCourseSchema)
router.put('/courses/:id/form-schema', formSchema.updateCourseSchema)
router.delete('/courses/:id/form-schema', formSchema.resetCourseSchema)

// ---- Default form template ----
router.get('/form-template', formSchema.getTemplate)
router.put('/form-template', formSchema.updateTemplate)

// ---- Editable marketing-page content ----
router.get('/pages', pageContent.adminListPages)
router.get('/pages/:page', pageContent.adminGetPage)
router.put('/pages/:page', pageContent.adminUpdatePage)
router.delete('/pages/:page', pageContent.adminResetPage)

// ---- Per-course chrome overrides (courseDetail/courseEnrollment) ----
router.get('/courses/:id/content/:page', pageContent.adminGetCourseContent)
router.put('/courses/:id/content/:page', pageContent.adminUpdateCourseContent)
router.delete('/courses/:id/content/:page', pageContent.adminResetCourseContent)

// ---- Submissions (dynamic enrollment forms) ----
router.get('/submissions', submissions.list)
router.get('/submissions/:id', submissions.getOne)
router.put('/submissions/:id', submissions.update)
router.delete('/submissions/:id', submissions.remove)

// ---- Legacy (pre-dynamic-form) registrations, read-only ----
router.get('/registrations/legacy', submissions.listLegacyRegistrations)

// ---- Contact form enquiries ----
router.get('/contact-messages', contact.list)
router.get('/contact-messages/:id', contact.getOne)
router.put('/contact-messages/:id', contact.update)
router.delete('/contact-messages/:id', contact.remove)

// ---- Media (Cloudflare R2) ----
router.post('/uploads', upload.array('files', 10), uploads.uploadImages)
router.delete('/uploads', uploads.removeImage)

module.exports = router
