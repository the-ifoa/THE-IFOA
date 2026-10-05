const { asyncHandler } = require('../middleware/error')
const { sendMail } = require('../utils/mailer')
const ContactMessage = require('../models/ContactMessage')

const OFFICE_INBOX = {
  switzerland: 'info@theifoa.com',
  usa: 'info@theifoa.com',
  india: 'info@theifoa.com'
}

const STATUSES = ['new', 'contacted', 'closed']

const AUDIENCE_LABELS = { individual: 'An individual', operator: 'An operator' }

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// ---------- Public ----------

// POST /api/contact
const send = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, organization, topic, message, office } = req.body || {}
  // Training location carried from a course page (?location=india), if any.
  const location = typeof req.body?.location === 'string' ? req.body.location.slice(0, 80) : ''
  const audience = AUDIENCE_LABELS[req.body?.audience] ? req.body.audience : ''
  const audienceLabel = AUDIENCE_LABELS[audience]

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'firstName, lastName, email and message are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'A valid email is required' })
  }

  // Save first so the enquiry is durable even if the email below fails.
  await ContactMessage.create({ firstName, lastName, email, audience, organization, topic, message, office, location })

  const to = process.env.MAIL_TO || OFFICE_INBOX[office] || OFFICE_INBOX.switzerland

  const text = [
    audienceLabel ? `I am: ${audienceLabel}` : null,
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    organization ? `Organization: ${organization}` : null,
    topic ? `Topic: ${topic}` : null,
    location ? `Training location: ${location}` : null,
    '',
    message
  ]
    .filter(Boolean)
    .join('\n')

  const html = `
    ${audienceLabel ? `<p><strong>I am:</strong> ${audienceLabel}</p>` : ''}
    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${organization ? `<p><strong>Organization:</strong> ${escapeHtml(organization)}</p>` : ''}
    ${topic ? `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>` : ''}
    ${location ? `<p><strong>Training location:</strong> ${escapeHtml(location)}</p>` : ''}
    <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
  `

  // Best-effort notification - the message is already saved, so a mail
  // failure (e.g. SMTP not configured) must not turn into a 500 for the visitor.
  try {
    await sendMail({
      to,
      replyTo: email,
      subject: `theIFOA website enquiry${audienceLabel ? ` (${audienceLabel})` : ''}: ${topic || 'General'}${location ? ` - ${location}` : ''} - ${firstName} ${lastName}`,
      text,
      html
    })
  } catch (err) {
    console.error('contactController.send: sendMail failed', err)
  }

  res.status(200).json({ message: 'Message sent' })
})

// ---------- Admin ----------

// GET /api/admin/contact-messages?status=&q=
const list = asyncHandler(async (req, res) => {
  const { status, q } = req.query
  const filter = {}
  if (status && status !== 'all') filter.status = status

  let messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean()

  if (q) {
    const needle = String(q).toLowerCase()
    messages = messages.filter((m) => {
      const hay = (
        `${m.firstName} ${m.lastName} ${m.email} ${m.organization || ''} ${m.topic || ''} ${m.message}`
      ).toLowerCase()
      return hay.includes(needle)
    })
  }

  res.json({ count: messages.length, messages })
})

// GET /api/admin/contact-messages/:id
const getOne = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findById(req.params.id).lean()
  if (!contactMessage) return res.status(404).json({ message: 'Contact message not found' })
  res.json({ contactMessage })
})

// PUT /api/admin/contact-messages/:id - set status and/or admin notes.
const update = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findById(req.params.id)
  if (!contactMessage) return res.status(404).json({ message: 'Contact message not found' })

  const { status, adminNotes } = req.body || {}

  if (status !== undefined) {
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(', ')}` })
    }
    contactMessage.status = status
  }
  if (adminNotes !== undefined) contactMessage.adminNotes = adminNotes

  await contactMessage.save()
  res.json({ contactMessage })
})

// DELETE /api/admin/contact-messages/:id
const remove = asyncHandler(async (req, res) => {
  const deleted = await ContactMessage.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Contact message not found' })
  res.json({ message: 'Contact message deleted' })
})

module.exports = { send, list, getOne, update, remove }
