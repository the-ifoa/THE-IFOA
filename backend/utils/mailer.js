const nodemailer = require('nodemailer')

// Two mailboxes: the main office (info@) and the India office (info-india@).
// India mail is sent from the India mailbox to itself.
const ACCOUNTS = {
  default: () => ({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }),
  india: () => ({
    host: process.env.SMTP_INDIA_HOST || process.env.SMTP_HOST,
    port: process.env.SMTP_INDIA_PORT || process.env.SMTP_PORT,
    user: process.env.SMTP_INDIA_USER,
    pass: process.env.SMTP_INDIA_PASS
  })
}

const transporters = {}

function getTransporter(account = 'default') {
  if (transporters[account]) return transporters[account]
  const cfg = (ACCOUNTS[account] || ACCOUNTS.default)()
  if (!cfg.host || !cfg.user || !cfg.pass) return null

  const port = Number(cfg.port || 465)
  transporters[account] = nodemailer.createTransport({
    host: cfg.host,
    port,
    secure: port === 465,
    auth: { user: cfg.user, pass: cfg.pass }
  })
  return transporters[account]
}

function isConfigured(account = 'default') {
  return !!getTransporter(account)
}

const isIndia = (location) => /india/i.test(location || '')

// Inbox + sending account for a training location. India goes to the India
// mailbox when it is configured; everything else (or an unconfigured India
// mailbox) falls back to the main office inbox.
function routeFor(location) {
  if (isIndia(location) && isConfigured('india')) {
    return { account: 'india', to: process.env.MAIL_TO_INDIA || process.env.SMTP_INDIA_USER }
  }
  return { account: 'default', to: process.env.MAIL_TO || 'info@theifoa.com' }
}

async function sendMail({ to, replyTo, subject, text, html, account = 'default' }) {
  const t = getTransporter(account)
  if (!t) throw new Error('Mail is not configured')
  const from = account === 'india' ? process.env.SMTP_INDIA_USER : process.env.SMTP_USER
  return t.sendMail({
    from: `"IFOA Website" <${from}>`,
    to,
    replyTo,
    subject,
    text,
    html
  })
}

module.exports = { sendMail, isConfigured, isIndia, routeFor }
