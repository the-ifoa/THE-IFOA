const Course = require('../models/Course')
const { asyncHandler } = require('../middleware/error')
const { PAGE_KEYS, DEFAULTS, mergeContent } = require('../utils/pageContent')
const PageContent = require('../models/PageContent')

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
const GEMINI_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const FALLBACK_REPLY =
  "I can't reach the assistant right now. For course details, schedules or enrollment help, " +
  'use the contact form on the Contact page or message us on WhatsApp at +41 78 227 3103.'

const MAX_TURNS = 12
const MAX_CHARS = 2000

// ---- Knowledge base (rebuilt at most every 5 min) --------------------------

let kbCache = { text: '', at: 0 }

function priceLine(price) {
  if (!price || price.amount == null) return 'price on request'
  const sym = price.currency === 'INR' ? '₹' : price.currency === 'EUR' ? '€' : '$'
  // Dollars carry the code ("$4,500 USD"), as on the site; euro and rupee signs stand alone.
  return price.currency === 'USD' ? `${sym}${price.amount.toLocaleString()} USD` : `${sym}${price.amount.toLocaleString()}`
}

// Courses with a live online application form (mirrors hasEnrollmentForm in
// frontend/src/components/course/CourseCard.jsx). Every other course is
// inquired about through the Contact page.
// The India and USA editions of Flight Dispatcher Initial apply through that
// course's form, with the training location pre-selected.
const ONLINE_APPLICATION = new Set([
  'flight-dispatcher-initial-certification',
  'flight-dispatcher-initial-training-india',
  'flight-dispatcher-initial-training-usa',
  'aircraft-dispatcher-training-faa-part-65',
  'flight-dispatcher-double-programme'
])

// Published courses the site promotes outside the Services page (footer,
// Upcoming courses, the course page's location switch): the bot knows them too.
const ALSO_SHOWN = [
  'flight-dispatcher-initial-training-india',
  'flight-dispatcher-initial-training-usa',
  'flight-dispatcher-double-programme'
]

const clean = (s) => String(s || '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()

// Flatten a course's overview blocks (the approved page copy) into compact
// plain text so the bot can answer questions about modules, assessment,
// eligibility, formats and comparisons.
function overviewText(ov) {
  if (!ov) return ''
  const out = []
  const push = (s) => s && out.push(clean(s))
  const walk = (b) => {
    if (!b) return
    switch (b.type) {
      case 'notice':
      case 'text':
        push(b.title && `${b.title}:`)
        ;(b.paragraphs || []).forEach(push)
        break
      case 'accordion':
        push(`${b.title || 'Program'}: ${b.intro || ''}`)
        ;(b.groups || [{ items: b.items || [] }]).forEach((g) => {
          if (g.title) push(`${g.title}${g.subtitle ? ` (${g.subtitle})` : ''}:`)
          ;(g.items || []).forEach((it) => {
            const extra = [it.text, (it.bullets || []).join('; '), it.competency].filter(Boolean).join(' - ')
            push(`  ${it.num ? `${it.num} ` : ''}${it.title}${extra ? `: ${extra}` : ''}`)
          })
          if (g.practice) push(`  ${g.practice.title}: ${g.practice.text}`)
        })
        break
      case 'checks':
      case 'pills':
        push(`${b.title || ''}${b.intro ? ` (${b.intro})` : ''}: ${(b.items || []).join('; ')}`)
        break
      case 'facts':
        push(b.title && `${b.title}:`)
        push(b.text)
        ;(b.boxes || []).forEach((x) => push(`  ${x.title}: ${x.text}`))
        ;(b.items || []).forEach((x) => push(`  ${x.title}: ${x.text}`))
        if (b.standards?.length) push(`  Standards: ${b.standards.map((s) => `${s.title} (${s.text})`).join('; ')}`)
        break
      case 'standards':
        push(`${b.title}: ${(b.items || []).map((s) => `${s.title} (${s.text})`).join('; ')}`)
        break
      case 'cards':
        push(`${b.title || ''}${b.intro ? ` - ${b.intro}` : ''}:`)
        ;(b.items || []).forEach((x) =>
          push(`  ${x.title}: ${[x.text, (x.bullets || []).join('; '), x.who].filter(Boolean).join(' - ')}`)
        )
        break
      case 'table':
        push(`${b.title}:`)
        ;(b.rows || []).forEach((r) =>
          push(`  ${r[0]}: ${r.slice(1).map((cell, i) => `${b.head?.[i + 1] || ''} = ${cell}`).join(' | ')}`)
        )
        break
      case 'band':
        push(`${b.title}: ${b.intro || ''} ${(b.items || []).join('; ')}`)
        break
      case 'proof':
        push(`${b.title}: ${(b.items || []).map((p) => `${p.value} ${p.label}`).join(', ')}`)
        break
      case 'related':
        push(`${b.text} ${b.label}: ${b.href}`)
        break
      case 'split':
        push((b.items || []).map((i) => `${i.value} ${i.label}`).join(' + ') + (b.note ? `. ${b.note}` : ''))
        break
      case 'track':
        push((b.items || []).map((i) => [i.label, i.title, i.sub].filter(Boolean).join(' ')).join(' -> ') + (b.note ? `. ${b.note}` : ''))
        break
      case 'cols':
        ;(b.columns || []).flat().forEach(walk)
        break
      case 'dgExplorer':
        push('Dangerous Goods by role and operation (roles: ' + Object.values(b.roles || {}).map((r) => r.label).join(', ') +
          '; operations: ' + Object.values(b.ops || {}).map((o) => o.label).join(', ') + ').')
        ;(b.modules || []).forEach((m) =>
          push(`  ${m.t}${m.adapt ? ' (adapted to operation)' : ''}: ${Object.entries(m.d).map(([k, v]) => (k === 'all' ? v : `${k}: ${v}`)).join(' / ')}`)
        )
        Object.entries(b.outcomes || {}).forEach(([role, o]) =>
          push(`  Outcomes for ${role}: ${Object.entries(o).map(([k, v]) => `${k}: ${v.join('; ')}`).join(' | ')}`)
        )
        Object.entries(b.assess || {}).forEach(([role, a]) => push(`  Assessment for ${role}: ${a}`))
        ;(b.assessFacts || []).forEach((x) => push(`  ${x.title}: ${x.text}`))
        break
      default:
        break
    }
  }
  const hero = ov.hero || {}
  push(hero.title && `Page headline: ${hero.title}${hero.slogan ? ` - ${hero.slogan}` : ''}`)
  push(hero.lead)
  ;(hero.blocks || []).forEach(walk)
  ;(ov.blocks || []).forEach(walk)
  return out.join('\n').slice(0, 4000)
}

// The name the website shows: the page headline when it is a short course
// name (e.g. "FAA Aircraft Dispatcher Course"), otherwise the course title.
const displayName = (c) => {
  const h = c.overview?.hero?.title
  return h && h.length <= 35 && !h.endsWith('.') ? h : c.title
}

async function buildKnowledge() {
  if (kbCache.text && Date.now() - kbCache.at < 5 * 60 * 1000) return kbCache.text

  const courses = await Course.find({ status: 'published' })
    .select('title slug summary duration location price category format careerPath registrationOpen card isCorporate rateCard sidebarSpecs additionalCosts intakes locationPrices overview')
    .sort({ featured: -1, order: 1 })
    .lean()

  const courseLines = courses.map((c) => {
    const intakes = (c.intakes || [])
      .filter((i) => i.isActive !== false)
      .map((i) => (i.locations?.length ? `${i.label} (${i.locations.join(', ')} only)` : i.label))
    const online = ONLINE_APPLICATION.has(c.slug)
    const bits = [
      `### ${displayName(c)} (slug: ${c.slug})`,
      c.summary || c.card?.blurb ? `  summary: ${(c.summary || c.card?.blurb).slice(0, 400)}` : null,
      c.duration ? `  duration: ${c.duration}` : null,
      c.location ? `  location: ${c.location}` : null,
      c.format ? `  format: ${c.format}` : null,
      `  tuition: ${c.isCorporate || c.price?.amount == null ? c.rateCard?.value || 'price on request' : priceLine(c.price)}`,
      c.price?.note ? `  tuition note: ${c.price.note}` : null,
      ...(c.locationPrices || []).map((p) => `  tuition when training in ${p.location}: ${priceLine(p)}`),
      c.additionalCosts?.items?.length
        ? `  ${c.additionalCosts.intro || 'additional costs'}: ${c.additionalCosts.items.map((i) => `${i.label} ${i.amount}`).join('; ')}`
        : null,
      c.sidebarSpecs?.length ? `  key facts: ${c.sidebarSpecs.map((s) => `${s.label}: ${s.value}`).join('; ')}` : null,
      intakes.length ? `  intakes: ${intakes.join('; ')}` : null,
      c.careerPath ? `  for / leads to: ${c.careerPath}` : null,
      `  detail page: /courses/${c.slug}`,
      online
        ? `  how to apply: online application form at /courses/${c.slug}/enroll`
        : '  how to apply: no online form - request a proposal or ask via the Contact page (/contact)',
      overviewText(c.overview)
        ? '  page content:\n' + overviewText(c.overview).split('\n').map((l) => `    ${l}`).join('\n')
        : null
    ].filter(Boolean)
    return bits.join('\n')
  })

  // Pull a little copy from the editable pages for tone / facts.
  const docs = await PageContent.find({ page: { $in: PAGE_KEYS } })
    .select('page data')
    .lean()
  const byPage = Object.fromEntries(docs.map((d) => [d.page, d.data]))
  const contact = mergeContent(DEFAULTS.contact, byPage.contact || {})
  const offices = (contact.offices?.items || [])
    .map((o) => `  ${o.country}: ${o.address} · ${o.phone} · ${o.email}`)
    .join('\n')

  // Services page disciplines - the site's top-level framing of what IFOA
  // offers, plus which real course each one currently links to, so the bot
  // can answer "do you do X" with the actual course/enrol link instead of
  // just the raw course catalog.
  const services = mergeContent(DEFAULTS.services, byPage.services || {})
  const disciplineLines = (services.specialist?.disciplines || []).map((d) => {
    const links = d.courseChoices?.length
      ? d.courseChoices.map((ch) => `${ch.label}: /courses/${ch.courseSlug}`).join(', ')
      : d.courseSlug
        ? `/courses/${d.courseSlug}`
        : 'no dedicated course page yet - direct to Contact'
    return [
      `- ${d.title}: ${d.desc || d.subtitle || ''}`.trim(),
      d.audience ? `  audience: ${d.audience}` : null,
      `  page: ${links}`
    ].filter(Boolean).join('\n')
  })

  // Courses the website actually promotes (linked from the Services page).
  // Anything else is published but hidden - only mention it if asked about.
  const promoted = new Set([
    ...ALSO_SHOWN,
    ...(services.specialist?.disciplines || []).flatMap((d) =>
      d.courseChoices?.length ? d.courseChoices.map((ch) => ch.courseSlug) : d.courseSlug ? [d.courseSlug] : []
    )
  ])
  const catalog = courses
    .filter((c) => promoted.has(c.slug))
    .map((c) => `  ${displayName(c)} - /courses/${c.slug}`)
  // Only courses the website shows are described to the bot.
  const shownCourseLines = courses
    .map((c, i) => (promoted.has(c.slug) ? courseLines[i] : null))
    .filter(Boolean)

  // Events page - the open-enrollment / fixed-date cohort framing.
  const events = mergeContent(DEFAULTS.events, byPage.events || {})

  // Home page "Where we train" regions and the contact page's direct lines.
  const home = mergeContent(DEFAULTS.home, byPage.home || {})
  const regionLines = (home.regions?.cards || []).map(
    (r) => `  ${r.name} (${r.city}): ${r.desc}`
  )
  const direct = contact.direct || {}
  const directLines = (direct.lines || []).map((l) => `  ${l.label}: ${l.value}`)

  kbCache = {
    at: Date.now(),
    text: [
      'FULL CATALOG (everything IFOA offers: the Services page plus the India and USA editions and the Double Program - list ALL of these when asked what courses or services are available):',
      catalog.join('\n'),
      '',
      'COURSE DETAILS:',
      shownCourseLines.join('\n') || '  (none published yet)',
      '',
      'SERVICES OFFERED (from the Services page - use these when a user asks what IFOA does or offers, and link to the specific course page listed):',
      disciplineLines.join('\n') || '  (see published courses above)',
      '',
      'COURSES PAGE (/events): ' + (events.hero?.subtitle || 'Fixed-date, open-enrollment cohorts you can register for directly.'),
      '',
      'UPCOMING COURSES PAGE (/upcoming-courses): courses individuals can book themselves -',
      '  Flight Dispatcher Initial (Denmark): January 4, 2027, seats open, apply at /courses/flight-dispatcher-initial-certification/enroll',
      '  Flight Dispatcher Initial (USA): dates on request, apply at /courses/flight-dispatcher-initial-training-usa/enroll',
      '  Flight Dispatcher Initial (India): rolling admissions, starts once 10 registrations are received, apply at /courses/flight-dispatcher-initial-training-india/enroll',
      '  FAA Aircraft Dispatcher: rolling admissions in Denmark and the USA; India has four batches in 2027 (Feb 8 - Mar 12, May 3 - Jun 4, Aug 30 - Oct 1, Nov 15 - Dec 17); apply at /courses/aircraft-dispatcher-training-faa-part-65/enroll',
      '  Double Program: FAA & EASA: dates to be confirmed, apply at /courses/flight-dispatcher-double-programme/enroll',
      '  Train the Trainer: next date to be announced, ask via /contact',
      "  Dates can change. A place is confirmed once the application is accepted and payment is received. Operators don't wait for public dates: IFOA schedules team training around their operation, online or at their base.",
      '',
      'HOW THE LOCATIONS DIFFER (use these exact facts):',
      '  Flight Dispatcher Initial: Denmark (Sønderborg, Air Alsie) and USA (Daytona Beach): 200 hours, 5 weeks, 2 weeks online then 3 weeks on-site, EUR 3,500 + VAT where applicable. India (New Delhi): 4 weeks, online preparation then on-site, EUR 1,000 + GST, rolling admissions with a minimum of 10 registrations.',
      '  FAA Aircraft Dispatcher: USD 4,500 at every location (Denmark, USA, India), 200 hours, Part 65 approved. Denmark and USA: 6 weeks including one exam week. India: 200 hours, 5 weeks (2 weeks online then 3 weeks on-site), plus an exam week taken within 6 months. ADX preparation is self-study on top, using the learning portal and weekly masterclasses. FAA test fees are separate: ADX knowledge test USD 175, practical test USD 600 paid to the examiner, so USD 5,275 in total to the certificate.',
      '  Double Program: FAA & EASA: USD 5,500 at every location (Denmark and India), 280 hours over 7 weeks including one exam week, hybrid. Same FAA test fees on top (USD 175 + USD 600, USD 6,275 in total).',
      '  Tax: GST applies to courses taught in India, VAT where applicable elsewhere. Travel, accommodation, meals and visa are never included.',
      '  Fees: there is no separate registration fee. You pay the course fee only. Payment, cancellation and refund terms are part of the application form; there is no separate Terms page, so do not send people to one.',
      '',
      'FAQ PAGE (/faq): questions grouped by service. Short answers you can give:',
      '  No EASA flight dispatcher license exists. Each European operator decides who may dispatch; the IFOA Certificate of Completion shows structured training built on ICAO Doc 10106.',
      '  No course can guarantee a job.',
      '  The IFOA Certificate of Completion is not the FAA certificate. The FAA issues the Aircraft Dispatcher certificate after the ADX knowledge test (valid 24 months) and the practical test with an FAA examiner. Minimum age 21 for the ADX, 23 for the certificate; English required; any nationality; no dispatch experience needed.',
      '  Visas and accommodation are not included: contact IFOA before applying to learn what support is available.',
      '  Dangerous Goods certificates are valid 24 months; recurrent training follows.',
      '',
      'WHERE WE TRAIN:',
      regionLines.join('\n') || '  Europe (Sønderborg, Denmark), USA (Daytona Beach, Florida), India (New Delhi)',
      '',
      'CONTACT PAGE (/contact): visitors choose "An individual" or "An operator", then a topic and message. ' +
        (direct.replyNote || 'We reply to every inquiry within two working days.'),
      directLines.join('\n'),
      '',
      'OFFICES:',
      offices || '  Switzerland (HQ), USA, India',
      '',
      'ENROLLMENT: only courses marked "online application form" have an /enroll page. For every other course, send users to the Contact page to request a proposal or dates.',
      'WhatsApp: +41 78 227 3103.'
    ].join('\n')
  }
  return kbCache.text
}

function systemPrompt(kb) {
  return [
    'You are the IFOA assistant, a helpful chat bot on the International Flight Operations Academy (IFOA) website.',
    'IFOA trains flight dispatchers and flight operations / OCC staff (FAA Part 65, and ICAO Doc 10106 with EASA operations) and runs consulting for airlines.',
    '',
    'Rules:',
    '- Answer only from the information below and general aviation-training knowledge. If you do not know, say so and point the user to the Contact page.',
    '- Be concise and professional. 1-3 short sentences for most answers.',
    '- Plain text only. No markdown, no asterisks, no bold, no headings.',
    '- Write in US English (program, center, license, enroll, inquiry, canceled). Write dates like January 4, 2027 and prices like $4,500 USD or EUR 3,500.',
    '- Never use em dashes. Use commas, colons or a plain hyphen instead.',
    '- Put each course you list on its own line as: "Course name - /courses/<slug>".',
    '- When the user asks what courses or services are available, list EVERY item in the FULL CATALOG (one per line), not a subset.',
    '- When the user asks for a recommendation, list only the 1-3 best matches.',
    '- If the user asks about a course or topic that is not in the FULL CATALOG, say IFOA does not currently list it as a course, suggest at most 1-2 closest catalog items if genuinely related, and point to the Contact page. Do not list the whole catalog in that case.',
    '- When one course clearly fits, recommend just that one with its course page, and its /enroll page only if it has an online application form.',
    '- Be precise about qualifications: only the FAA issues the FAA Aircraft Dispatcher certificate; there is no EASA dispatcher license; IFOA issues the IFOA Certificate of Completion, which is not an FAA certificate.',
    '- Never invent prices, dates, or accreditations. Do not promise admission or discounts.',
    '- You cannot take payments, book seats, or change records. For those, direct users to the Contact page or WhatsApp.',
    '- Stay on IFOA / aviation-training topics. Politely decline unrelated requests in one sentence.',
    '',
    'When a user asks how to buy, book, enroll, register, or pay for a course, walk them through',
    'the ENROLLMENT PROCESS below as short numbered steps (1., 2., 3. ...), in order. If you know',
    'which course they want, use that course\'s real enroll link in step 2 and skip asking; otherwise',
    'ask which program they want first, then give the steps.',
    '',
    'ENROLLMENT PROCESS:',
    '1. Pick a program. See start dates on the Upcoming courses page (/upcoming-courses) or browse a course page (/courses/<slug>).',
    '2. Open that course\'s application page (/courses/<slug>/enroll) and click "Apply online". Flight Dispatcher Initial (Denmark and India), FAA Aircraft Dispatcher and the Double Program have online applications; for other courses use the Contact page.',
    '3. Complete the online application form: first choose where you want to train (Denmark, USA or India) and the intake offered for that location, then personal and contact details and background.',
    '4. Submit the form. You get a reference number and can download your completed application as a PDF.',
    '5. Sign the PDF and email the signed copy plus two photo-ID copies to info@theifoa.com.',
    '6. Admissions reviews your prerequisites, confirms your seat, and sends an invoice.',
    '7. Pay per the bank details on the invoice. Your place is confirmed once payment is received.',
    'For help choosing or with any step, point them to the Contact page or WhatsApp +41 78 227 3103.',
    '',
    '=== IFOA INFORMATION ===',
    kb
  ].join('\n')
}

// ---- Controller -----------------------------------------------------------

// POST /api/chat  { messages: [{ role: 'user' | 'bot', text }] }
const ask = asyncHandler(async (req, res) => {
  const raw = Array.isArray(req.body?.messages) ? req.body.messages : []
  const turns = raw
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === 'bot' || m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      text: m.text.trim().slice(0, MAX_CHARS)
    }))

  // Conversation must start with a user turn.
  while (turns.length && turns[0].role === 'model') turns.shift()
  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    return res.status(400).json({ message: 'A user message is required.' })
  }

  if (!GEMINI_KEY) {
    return res.json({ reply: FALLBACK_REPLY, degraded: true })
  }

  let kb
  try {
    kb = await buildKnowledge()
  } catch {
    kb = '(course list unavailable)'
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt(kb) }] },
    contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  try {
    const r = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
      body: JSON.stringify(body),
      signal: controller.signal
    })
    const data = await r.json().catch(() => null)
    if (!r.ok) {
      console.warn('[chat] gemini error', r.status, data?.error?.message || '')
      return res.json({ reply: FALLBACK_REPLY, degraded: true })
    }
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text)
      .filter(Boolean)
      .join('')
      // The site uses no em dashes; replace any the model still produces.
      .replace(/\s*\u2014\s*/g, ' - ')
      .trim()
    if (!reply) return res.json({ reply: FALLBACK_REPLY, degraded: true })
    return res.json({ reply })
  } catch (err) {
    console.warn('[chat] request failed', err.message)
    return res.json({ reply: FALLBACK_REPLY, degraded: true })
  } finally {
    clearTimeout(timer)
  }
})

module.exports = { ask }
