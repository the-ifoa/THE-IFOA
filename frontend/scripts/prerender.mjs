/**
 * Turns the SPA build into real HTML files, one per public route, and writes
 * sitemap.xml.
 *
 * Why: crawlers and link-preview bots that do not execute JavaScript only ever
 * saw `<div id="root"></div>`. Each route now ships server-rendered markup with
 * its own title, description, canonical and structured data.
 *
 * Run via `npm run build` (client build -> SSR build -> this script).
 *
 * Course pages are rendered from live API data at build time, so publishing or
 * editing a course needs a rebuild for its static HTML and sitemap entry to
 * catch up. The SPA still refetches at runtime, so visitors always see current
 * data; only the crawler-visible snapshot is build-time.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public_html')
const SERVER_ENTRY = path.join(ROOT, '.prerender/server/entry-server.js')

// Matches src/lib/seo.js — defaults to production, override with SITE_URL for
// a staging build so the generated sitemap doesn't advertise production URLs.
const SITE_URL = process.env.SITE_URL || 'https://theifoa.com'
const API_BASE = process.env.PRERENDER_API_BASE || 'http://localhost:5001/api'

// Routes that exist regardless of database contents.
// Every page gets a <lastmod> (Google ignores changefreq/priority, and a
// sitemap where only some URLs carry a date reads as unreliable). Static pages
// use the build date; course pages use the course's last update.
const BUILD_DATE = new Date().toISOString().slice(0, 10)
const STATIC_ROUTES = [
  { path: '/' },
  { path: '/services' },
  { path: '/events' },
  { path: '/about' },
  { path: '/contact' },
  { path: '/foxtrot-delta' },
  { path: '/upcoming-courses' },
  { path: '/impressum' },
  { path: '/privacy-policy' }
]

const SEO_BLOCK = /<!--SEO:START-->[\s\S]*?<!--SEO:END-->/

// React emits document metadata inline in the rendered subtree; move it into
// <head> so it is valid and so bots that only parse <head> still see it.
const HEAD_TAG = /<title>[\s\S]*?<\/title>|<meta\b[^>]*\/?>|<link\b[^>]*rel="canonical"[^>]*\/?>|<script\b[^>]*type="application\/ld\+json"[\s\S]*?<\/script>/gi

function splitHead(html) {
  const head = html.match(HEAD_TAG) || []
  return { head: head.join('\n    '), body: html.replace(HEAD_TAG, '') }
}

async function fetchCourses() {
  try {
    const res = await fetch(`${API_BASE}/courses`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { courses = [] } = await res.json()
    return courses
  } catch (err) {
    console.warn(
      `[prerender] Could not reach ${API_BASE}/courses (${err.message}).\n` +
        '            Static pages will still build; course pages will be skipped.\n' +
        '            Start the backend (or set PRERENDER_API_BASE) to include them.'
    )
    return null
  }
}

async function fetchCourse(slug) {
  const res = await fetch(`${API_BASE}/courses/${slug}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} for /courses/${slug}`)
  const { course } = await res.json()
  return course
}

async function writeRoute(routePath, html) {
  // "/" -> public_html/index.html, "/about" -> public_html/about/index.html,
  // which Apache serves for /about and /about/ alike.
  const target =
    routePath === '/'
      ? path.join(OUT_DIR, 'index.html')
      : path.join(OUT_DIR, routePath.replace(/^\//, ''), 'index.html')

  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, html, 'utf8')
}

function buildSitemap(entries) {
  const urls = entries
    .map(
      ({ path: p, lastmod }) => `  <url>
    <loc>${SITE_URL}${p === '/' ? '/' : p}</loc>
    <lastmod>${lastmod || BUILD_DATE}</lastmod>
  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function main() {
  const template = await readFile(path.join(OUT_DIR, 'index.html'), 'utf8')

  if (!SEO_BLOCK.test(template)) {
    throw new Error(
      'index.html is missing the <!--SEO:START--> / <!--SEO:END--> markers; ' +
        'prerendered pages would keep the default meta tags on every route.'
    )
  }

  const { render } = await import(SERVER_ENTRY)
  const courses = await fetchCourses()
  const sitemap = [...STATIC_ROUTES]

  async function renderRoute(routePath, preload = {}) {
    globalThis.__IFOA_PRELOAD__ = preload
    const appHtml = render(routePath)
    const { head, body } = splitHead(appHtml)

    const preloadScript = Object.keys(preload).length
      ? `\n    <script>window.__IFOA_PRELOAD__=${JSON.stringify(preload).replace(
          /</g,
          '\\u003c'
        )}</script>`
      : ''

    const html = template
      .replace(SEO_BLOCK, `${head}${preloadScript}`)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`)

    await writeRoute(routePath, html)
    globalThis.__IFOA_PRELOAD__ = undefined
  }

  for (const route of STATIC_ROUTES) {
    const isEventsRoute = route.path === '/events'
    const preload = isEventsRoute && courses ? { courses } : {}
    await renderRoute(route.path, preload)
    console.log(`[prerender] ${route.path}`)
  }

  if (courses) {
    for (const listed of courses) {
      const course = await fetchCourse(listed.slug)
      const routePath = `/courses/${course.slug}`
      await renderRoute(routePath, { [`course:${course.slug}`]: course })
      sitemap.push({
        path: routePath,
        lastmod: course.updatedAt ? new Date(course.updatedAt).toISOString().slice(0, 10) : undefined
      })
      console.log(`[prerender] ${routePath}`)
    }
  }

  await writeFile(path.join(OUT_DIR, 'sitemap.xml'), buildSitemap(sitemap), 'utf8')
  console.log(`[prerender] sitemap.xml — ${sitemap.length} URLs`)

  // NOINDEX=true (set this for any pre-launch environment, e.g. staging) blocks
  // crawling entirely instead of shipping the production robots.txt as-is —
  // matches src/components/common/Seo.jsx's SITE_NOINDEX meta-robots override.
  if (process.env.NOINDEX === 'true') {
    await writeFile(
      path.join(OUT_DIR, 'robots.txt'),
      'User-agent: *\nDisallow: /\n',
      'utf8'
    )
    console.log('[prerender] robots.txt — NOINDEX=true, blocked all crawling')
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
