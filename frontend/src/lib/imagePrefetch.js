// Background image loading, so the next page's pictures are already in the
// browser cache when a visitor gets there.
//
// How it stays smart and light:
//  - It starts only once the current page has finished loading, and then loads
//    one picture at a time per idle slot, so scrolling and clicks never wait.
//  - Order: pages the visitor is most likely to open next, then everything else.
//    Hovering or touching a link moves that page's pictures to the front.
//  - It backs off on Data Saver and slow connections, and pauses in hidden tabs.
//  - Course pictures that come from the API (card and hero images) are picked up
//    from the responses automatically.
//
// Client-only: imported from main.jsx, never from code the prerender uses.

// URLs of every bundled picture (Vite hashes them). Only the strings are bundled
// here; the image files themselves are not downloaded until queued.
const BUNDLED = import.meta.glob('/src/assets/**/*.{webp,jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default'
})

const under = (...prefixes) =>
  Object.entries(BUNDLED)
    .filter(([key]) => prefixes.some((p) => key.startsWith(`/src/assets/${p}`)))
    .map(([, url]) => url)

// Pictures each page shows (bundled folders plus the static /course-images files).
const ROUTE_IMAGES = {
  '/': () => under('home/hero', 'home/testimonial', 'home/world-map', 'shared/brand/', 'partners/'),
  '/services': () => under('services/', 'shared/standards-logos/'),
  '/events': () => [
    ...under('events/', 'shared/standards-logos/'),
    '/course-images/EASA.jpeg',
    '/course-images/Part-65.jpeg',
    '/course-images/Flight-Dispatch-Webpage-Small.jpg'
  ],
  '/upcoming-courses': () => under('shared/photos/IOFA-banner_10'),
  '/about': () => under('shared/flags/', 'shared/photos/aviation-aircraft-clouds', 'shared/standards-logos/'),
  '/contact': () => under('shared/flags/', 'shared/photos/IOFA-banner_10'),
  '/faq': () => under('shared/photos/IOFA-banner_10'),
  '/foxtrot-delta': () => under('foxtrotDelta/', 'shared/photos/aviation-aircraft-clouds'),
  // Course pages: banners and the discipline pictures their cards use.
  '/courses': () => under('shared/course-media/', 'shared/standards-logos/', 'services/')
}

// Where a visitor is most likely to go next from each page.
const NEXT = {
  '/': ['/services', '/events', '/upcoming-courses', '/courses', '/about', '/contact'],
  '/services': ['/courses', '/events', '/contact', '/faq'],
  '/events': ['/upcoming-courses', '/courses', '/services', '/contact'],
  '/upcoming-courses': ['/courses', '/events', '/contact'],
  '/about': ['/contact', '/services', '/events'],
  '/contact': ['/services', '/events', '/faq'],
  '/faq': ['/contact', '/services', '/courses'],
  '/foxtrot-delta': ['/', '/services', '/contact'],
  '/courses': ['/contact', '/upcoming-courses', '/services']
}
const DEFAULT_NEXT = ['/services', '/events', '/upcoming-courses', '/courses', '/about', '/contact', '/faq', '/foxtrot-delta']
const ALL_ROUTES = Object.keys(ROUTE_IMAGES)

const IMAGE_URL = /\.(?:webp|jpe?g|png|avif)(?:\?.*)?$/i

// A path like /courses/some-slug counts as the "/courses" group.
function routeKey(path = '/') {
  const p = (path.split(/[?#]/)[0].replace(/\/+$/, '') || '/')
  if (p.startsWith('/courses/') || p.startsWith('/enroll/')) return '/courses'
  return ROUTE_IMAGES[p] ? p : null
}

const finished = new Set() // loaded or failed: never fetched twice
const active = new Set() // in flight right now
let queue = [] // urls waiting, in order
let running = 0
let started = false
let current = '/'

// 0 = nothing, 1 = nearby pages only (slow-ish connections), 2 = everything.
function budget() {
  const c = typeof navigator !== 'undefined' ? navigator.connection : null
  if (!c) return 2
  if (c.saveData) return 0
  if (/(^|-)2g$/.test(c.effectiveType || '')) return 0
  if (c.effectiveType === '3g') return 1
  return 2
}

const pending = (u) => u && !finished.has(u) && !active.has(u)
const unique = (urls) => [...new Set(urls)]

function loadOne(url) {
  active.add(url)
  return new Promise((resolve) => {
    const img = new Image()
    const finish = () => {
      active.delete(url)
      finished.add(url)
      resolve()
    }
    const timer = setTimeout(finish, 15000)
    if ('fetchPriority' in img) img.fetchPriority = 'low'
    // Loading into the HTTP cache is the point; the next page then gets the file instantly.
    img.onload = () => {
      clearTimeout(timer)
      finish()
    }
    img.onerror = () => {
      clearTimeout(timer)
      finish()
    }
    img.src = url
  })
}

const idle = (fn) =>
  typeof requestIdleCallback === 'function' ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 200)

// Two workers at most; each takes the next picture when the browser is idle.
function pump() {
  if (!started || !queue.length) return
  if (typeof document !== 'undefined' && document.hidden) return // resumes on visibilitychange
  while (running < 2 && queue.length) {
    running += 1
    idle(async () => {
      const url = queue.shift()
      if (pending(url)) await loadOne(url)
      running -= 1
      pump()
    })
  }
}

function planFor(path) {
  const level = budget()
  if (level === 0) return []
  const here = routeKey(path)
  const near = (here ? NEXT[here] : DEFAULT_NEXT) || DEFAULT_NEXT
  const nearUrls = near.flatMap((r) => ROUTE_IMAGES[r]?.() || [])
  if (level === 1) return unique(nearUrls)
  const rest = ALL_ROUTES.filter((r) => r !== here && !near.includes(r)).flatMap((r) => ROUTE_IMAGES[r]())
  return unique([...nearUrls, ...rest])
}

// Re-plan from a new page: its neighbors first, whatever is left behind them.
function replan(path) {
  current = path
  queue = planFor(path).filter(pending)
  pump()
}

// Move one page's pictures to the front (hover, focus or touch on a link).
function prioritize(path) {
  const key = routeKey(path)
  if (!key || budget() === 0) return
  const urls = unique(ROUTE_IMAGES[key]()).filter(pending)
  if (!urls.length) return
  queue = [...urls, ...queue.filter((u) => !urls.includes(u))]
  pump()
}

// Pictures found inside an API response (course cards, banners...).
export function prefetchImagesFrom(data) {
  if (budget() === 0) return
  const found = []
  const walk = (v, depth) => {
    if (found.length >= 40 || depth > 8 || v == null) return
    if (typeof v === 'string') {
      if (IMAGE_URL.test(v) && (/^https?:\/\//i.test(v) || v.startsWith('/'))) found.push(v)
    } else if (Array.isArray(v)) v.forEach((x) => walk(x, depth + 1))
    else if (typeof v === 'object') Object.values(v).forEach((x) => walk(x, depth + 1))
  }
  walk(data, 0)
  const fresh = unique(found).filter((u) => pending(u) && !queue.includes(u))
  if (fresh.length) {
    queue = [...queue, ...fresh]
    pump()
  }
}

export function startImagePrefetch() {
  if (started || typeof window === 'undefined') return
  const begin = () => {
    started = true
    replan(window.location.pathname)

    // Every page change re-plans from the new page.
    window.addEventListener('ifoa:route', (e) => replan(e.detail || window.location.pathname))
    // Pictures named in API responses.
    window.addEventListener('ifoa:images', (e) => prefetchImagesFrom(e.detail))
    // Intent: hovering, focusing or touching a link loads that page's pictures first.
    const onIntent = (e) => {
      const a = e.target?.closest?.('a[href^="/"]')
      if (a) prioritize(a.getAttribute('href'))
    }
    document.addEventListener('pointerover', onIntent, { passive: true })
    document.addEventListener('touchstart', onIntent, { passive: true })
    document.addEventListener('focusin', onIntent)
    // Pick up again when the tab comes back.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) pump()
    })
  }
  // Wait for the page itself to finish, then a short beat, so these downloads
  // never compete with what the visitor is looking at.
  const afterLoad = () => setTimeout(() => idle(begin), 800)
  if (document.readyState === 'complete') afterLoad()
  else window.addEventListener('load', afterLoad, { once: true })
  // Handy in the browser console: window.__ifoaImages.pending
  window.__ifoaImages = { get current() { return current }, get pending() { return queue.length }, get finished() { return finished.size } }
}
