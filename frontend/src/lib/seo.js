// Canonical host. Defaults to production so a normal build is still correct;
// set VITE_SITE_URL (and SITE_URL for scripts/prerender.mjs) to override for a
// staging build so canonical/OG/sitemap URLs point at that origin instead.
// Must stay in sync with the redirect rules in public/.htaccess and with
// scripts/generate-sitemap.mjs.
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://theifoa.com'
// Off by default (production stays indexable as before). Set VITE_NOINDEX=true
// on a staging build (and NOINDEX=true for scripts/prerender.mjs's robots.txt)
// so search engines aren't invited to index a pre-launch environment.
export const SITE_NOINDEX = import.meta.env.VITE_NOINDEX === 'true'
export const SITE_NAME = 'IFOA'
export const SITE_LEGAL_NAME = 'International Flight Operations Academy GmbH'
// Names people type to find us ("theifoa" is the domain). Google uses these
// for brand queries and the site name shown above search results.
export const SITE_ALTERNATE_NAMES = ['theIFOA', 'The IFOA', 'International Flight Operations Academy']
export const SOCIAL_PROFILES = [
  'https://www.linkedin.com/company/71556135/',
  'https://www.instagram.com/theifoa/',
  'https://www.facebook.com/profile.php?id=100069215447113',
  'https://www.youtube.com/channel/UCH2vo2z3uLuPOTI1TwFaT7A'
]
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`

export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

// Trimmed to the ~155 chars Google renders before truncating.
export function clampDescription(text, limit = 155) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= limit) return clean
  return `${clean.slice(0, clean.lastIndexOf(' ', limit - 1)).trim()}…`
}

export const OFFICES = [
  {
    id: 'ch',
    name: `${SITE_LEGAL_NAME} - Europe HQ`,
    street: 'Oberdorf 26',
    postalCode: '4314',
    city: 'Zeiningen',
    region: 'Aargau',
    country: 'CH',
    phone: '+41 78 227 3103'
  },
  {
    id: 'us',
    name: 'IFOA USA',
    street: '1616 Concierge Blvd, Suite 100',
    postalCode: '32117',
    city: 'Daytona Beach',
    region: 'FL',
    country: 'US',
    phone: '+1 508 838 5880'
  },
  {
    id: 'in',
    name: 'IFOA India',
    street: 'Innov8 Old Fort, 2nd Floor, Saket District Centre',
    postalCode: '110017',
    city: 'New Delhi',
    region: 'DL',
    country: 'IN',
    phone: '+91 98101 44034'
  }
]

// Site-wide publisher identity. Referenced by @id from the per-page graphs so
// Google resolves every Course/Article back to one organization entity.
export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export function organizationSchema() {
  return {
    '@type': 'EducationalOrganization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: SITE_LEGAL_NAME,
    alternateName: SITE_ALTERNATE_NAMES,
    url: SITE_URL,
    sameAs: SOCIAL_PROFILES,
    logo: `${SITE_URL}/favicon-512.png`,
    email: 'info@theifoa.com',
    description:
      'Aviation training academy specializing in flight dispatcher certification and flight operations training to ICAO Doc 10106, EASA ORO.GEN.110 and FAA 14 CFR Part 65 standards.',
    address: OFFICES.map((o) => ({
      '@type': 'PostalAddress',
      streetAddress: o.street,
      postalCode: o.postalCode,
      addressLocality: o.city,
      addressRegion: o.region,
      addressCountry: o.country
    })),
    contactPoint: OFFICES.map((o) => ({
      '@type': 'ContactPoint',
      contactType: 'admissions',
      telephone: o.phone,
      email: 'info@theifoa.com',
      areaServed: o.country,
      availableLanguage: 'en'
    }))
  }
}

export function localBusinessSchemas() {
  return OFFICES.map((o) => ({
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/contact#${o.id}`,
    parentOrganization: { '@id': ORGANIZATION_ID },
    name: o.name,
    telephone: o.phone,
    email: 'info@theifoa.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.street,
      postalCode: o.postalCode,
      addressLocality: o.city,
      addressRegion: o.region,
      addressCountry: o.country
    }
  }))
}

export function breadcrumbSchema(trail = []) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  }
}

export function faqSchema(items = []) {
  if (!items.length) return null
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  }
}

const COURSE_MODE = {
  online: 'Online',
  virtual: 'Online',
  hybrid: 'Blended',
  onsite: 'Onsite',
  classroom: 'Onsite'
}

function courseModeFor(course) {
  const raw = `${course.schedule?.mode || course.format || ''}`.toLowerCase()
  const hit = Object.keys(COURSE_MODE).find((k) => raw.includes(k))
  return hit ? COURSE_MODE[hit] : 'Blended'
}

// "280 Hours · 7 Weeks" -> "PT280H"; schema.org wants ISO 8601 durations.
// Hours win over weeks because they describe the workload, not the calendar.
function isoDuration(text) {
  const raw = `${text || ''}`.toLowerCase()
  const n = (unit) => raw.match(new RegExp(`(\\d+)\\s*${unit}`))?.[1]
  if (n('hour')) return `PT${n('hour')}H`
  if (n('week')) return `P${n('week')}W`
  if (n('day')) return `P${n('day')}D`
  return undefined
}

// Titles of the overview's accordion/cards items, used as the syllabus when
// the course page is driven by overview blocks rather than courseContent.
function overviewSyllabus(course) {
  const names = []
  for (const block of course.overview?.blocks || []) {
    if (block.type === 'accordion') {
      for (const group of block.groups || []) for (const item of group.items || []) names.push(item.title)
    }
  }
  return names.filter(Boolean)
}

function offerFor(course, amount, currency, extra = {}) {
  return {
    '@type': 'Offer',
    price: amount,
    priceCurrency: currency || 'EUR',
    category: 'Tuition',
    availability:
      course.registrationOpen === false ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    url: absoluteUrl(`/courses/${course.slug}`),
    ...extra
  }
}

// Course rich results need provider + at least one hasCourseInstance carrying
// courseMode and courseWorkload (or a schedule), otherwise Search Console
// rejects the item. Courses without a published date still get an instance.
export function courseSchema(course) {
  if (!course) return null

  const workload = isoDuration(course.duration)
  const place = course.location ? { '@type': 'Place', name: course.location } : undefined
  const instance = (extra) => ({
    '@type': 'CourseInstance',
    name: course.title,
    courseMode: courseModeFor(course),
    courseWorkload: workload,
    location: place,
    ...extra
  })

  const instances = (course.intakes || [])
    .filter((i) => i.startDate && i.isActive !== false)
    .map((i) => instance({ name: i.label || course.title, startDate: new Date(i.startDate).toISOString().slice(0, 10) }))

  if (instances.length === 0 && course.schedule?.startDate) {
    instances.push(
      instance({
        startDate: new Date(course.schedule.startDate).toISOString().slice(0, 10),
        endDate: course.schedule.endDate ? new Date(course.schedule.endDate).toISOString().slice(0, 10) : undefined
      })
    )
  }
  if (instances.length === 0 && workload) instances.push(instance())

  const offers = []
  if (course.price?.amount != null) offers.push(offerFor(course, course.price.amount, course.price.currency))
  for (const lp of course.locationPrices || []) {
    if (lp?.amount != null) {
      offers.push(offerFor(course, lp.amount, lp.currency, { areaServed: lp.location, name: `${course.title}, ${lp.location}` }))
    }
  }

  const syllabus = (course.courseContent?.modules || []).map((m) => (typeof m === 'string' ? m : m?.title)).filter(Boolean)
  const sections = syllabus.length ? syllabus : overviewSyllabus(course)

  return {
    '@type': 'Course',
    '@id': `${absoluteUrl(`/courses/${course.slug}`)}#course`,
    name: course.title,
    description: clampDescription(
      course.seo?.metaDescription || course.summary || course.whatYouWillLearn?.intro,
      300
    ),
    url: absoluteUrl(`/courses/${course.slug}`),
    courseCode: course.refCode || undefined,
    provider: { '@id': ORGANIZATION_ID },
    inLanguage: 'en',
    teaches: (course.whatYouWillLearn?.points || []).slice(0, 10),
    syllabusSections: sections.slice(0, 25).map((name, i) => ({ '@type': 'Syllabus', position: i + 1, name })),
    timeRequired: workload,
    hasCourseInstance: instances.length > 0 ? instances : undefined,
    offers: offers.length === 1 ? offers[0] : offers.length ? offers : undefined
  }
}

// Minimal Course entity for list pages (services, upcoming courses): enough
// for an ItemList of courses without duplicating the full course page graph.
export function courseListSchema(name, items = []) {
  return {
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: item.name,
        description: clampDescription(item.description, 200),
        url: absoluteUrl(item.path),
        provider: { '@id': ORGANIZATION_ID }
      }
    }))
  }
}

// Wraps the per-page entities into a single @graph so one script tag carries
// everything and entities can cross-reference by @id.
export function graph(...entities) {
  const nodes = entities.flat().filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@graph': nodes
  }
}
