// Client-only, code-split versions of the public pages - imported only by
// main.jsx. Each becomes its own chunk, fetched only when a visitor actually
// navigates to that route, instead of every page shipping in the one bundle
// every visitor downloads on first load. See eagerPublicPages.js for why
// this lives in a separate file rather than alongside the eager imports.
//
// To avoid the blank loading screen: main.jsx waits for the current route's
// chunk before rendering (preloadForPath), then prefetchPublicPages() fetches
// the rest in the background so later navigation is instant.
import { createElement, lazy } from 'react'

const loaders = {
  HomePage: () => import('./HomePage').then((m) => ({ default: m.HomePage })),
  NotFoundPage: () => import('./NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
  AboutPage: () => import('./AboutPage').then((m) => ({ default: m.AboutPage })),
  ServicesPage: () => import('./ServicesPage').then((m) => ({ default: m.ServicesPage })),
  EventsPage: () => import('./EventsPage').then((m) => ({ default: m.EventsPage })),
  ContactPage: () => import('./ContactPage').then((m) => ({ default: m.ContactPage })),
  FaqPage: () => import('./FaqPage').then((m) => ({ default: m.FaqPage })),
  CourseDetailPage: () => import('./CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })),
  CourseEnrollmentPage: () => import('./CourseEnrollmentPage').then((m) => ({ default: m.CourseEnrollmentPage })),
  FoxtrotDeltaPage: () => import('./FoxtrotDeltaPage').then((m) => ({ default: m.FoxtrotDeltaPage })),
  UpcomingCoursesPage: () => import('./UpcomingCoursesPage').then((m) => ({ default: m.UpcomingCoursesPage })),
  ImpressumPage: () => import('./LegalPages').then((m) => ({ default: m.ImpressumPage })),
  PrivacyPolicyPage: () => import('./LegalPages').then((m) => ({ default: m.PrivacyPolicyPage }))
}

// One shared promise per page, plus the resolved module once it arrives.
const cache = {}
const loaded = {}
const load = (name) =>
  (cache[name] ||= loaders[name]().then((mod) => {
    loaded[name] = mod.default
    return mod
  }))

// A page whose chunk is already here renders directly; React.lazy would
// still suspend for one tick and flash the loading screen.
function makePage(name) {
  const LazyPage = lazy(() => load(name))
  const Page = (props) => createElement(loaded[name] || LazyPage, props)
  Page.displayName = name
  return Page
}

export const lazyPublicPages = Object.fromEntries(Object.keys(loaders).map((name) => [name, makePage(name)]))

function pageForPath(pathname = '/') {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/') return 'HomePage'
  if (/^\/courses\/[^/]+\/enroll$|^\/enroll\/[^/]+$/.test(p)) return 'CourseEnrollmentPage'
  if (/^\/courses\/[^/]+$/.test(p)) return 'CourseDetailPage'
  return (
    {
      '/services': 'ServicesPage',
      '/events': 'EventsPage',
      '/about': 'AboutPage',
      '/contact': 'ContactPage',
      '/faq': 'FaqPage',
      '/foxtrot-delta': 'FoxtrotDeltaPage',
      '/upcoming-courses': 'UpcomingCoursesPage',
      '/impressum': 'ImpressumPage',
      '/privacy-policy': 'PrivacyPolicyPage'
    }[p] || null
  )
}

// Resolves once the route's chunk is loaded (or immediately for admin/unknown
// routes). Never rejects - a failed fetch falls back to the normal lazy load.
export function preloadForPath(pathname) {
  const name = pageForPath(pathname)
  return name ? load(name).catch(() => {}) : Promise.resolve()
}

// Fetch every public page in the background once the browser is idle.
export function prefetchPublicPages() {
  const run = () => Object.keys(loaders).forEach((name) => load(name).catch(() => {}))
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 3000 })
  else setTimeout(run, 1500)
}
