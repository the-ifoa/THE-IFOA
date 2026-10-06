const express = require('express')
const rateLimit = require('express-rate-limit')
const courses = require('../controllers/courseController')
const formSchema = require('../controllers/formSchemaController')
const submissions = require('../controllers/submissionController')
const pageContent = require('../controllers/pageContentController')
const chat = require('../controllers/chatController')
const contact = require('../controllers/contactController')
const newsletter = require('../controllers/newsletterController')
const rates = require('../controllers/ratesController')

const router = express.Router()

router.get('/rates', rates.getRates)

// Chat bot - keep bursts in check per IP.
const chatLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages. Give it a minute and try again.' }
})

// Public form - cap submissions per IP.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many registrations from this address. Try again later.' }
})

// Contact form - cap messages per IP.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages from this address. Try again later.' }
})

router.get('/courses', courses.listPublic)
router.get('/courses/:slug', courses.getBySlug)

// Editable marketing-page content.
router.get('/pages/:page', pageContent.getPublicPage)

// Website chat bot.
router.post('/chat', chatLimiter, chat.ask)

// Contact page enquiry form.
router.post('/contact', contactLimiter, contact.send)

// Newsletter signup.
router.post('/newsletter', contactLimiter, newsletter.subscribe)

// Dynamic enrollment form for a course + submission intake.
router.get('/courses/:slug/form', formSchema.getPublicCourseForm)
router.post('/courses/:slug/register', registerLimiter, submissions.create)
router.get('/submissions/:id', submissions.getPublicOne)

module.exports = router
