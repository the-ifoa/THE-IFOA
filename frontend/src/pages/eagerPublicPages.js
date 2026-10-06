// Real, synchronous page components - imported only by entry-server.jsx (the
// module scripts/prerender.mjs uses). renderToString() can't await a lazy
// import, so SSR needs these eager or a lazy page would render as its
// Suspense fallback in the prerendered HTML that crawlers index.
//
// Deliberately kept out of App.jsx: if this file's imports and
// lazyPublicPages.js's imports both lived in one module, Rollup would see
// each page as reachable via both a static and a dynamic edge from the same
// graph and refuse to split it into its own chunk for the browser build
// (this is exactly what happened before this file existed - see git history
// on App.jsx if you're wondering).
import { HomePage } from './HomePage'
import { NotFoundPage } from './NotFoundPage'
import { AboutPage } from './AboutPage'
import { ServicesPage } from './ServicesPage'
import { EventsPage } from './EventsPage'
import { ContactPage } from './ContactPage'
import { FaqPage } from './FaqPage'
import { CourseDetailPage } from './CourseDetailPage'
import { CourseEnrollmentPage } from './CourseEnrollmentPage'
import { FoxtrotDeltaPage } from './FoxtrotDeltaPage'
import { UpcomingCoursesPage } from './UpcomingCoursesPage'
import { ImpressumPage, PrivacyPolicyPage } from './LegalPages'

export const eagerPublicPages = {
  HomePage,
  NotFoundPage,
  AboutPage,
  ServicesPage,
  EventsPage,
  ContactPage,
  FaqPage,
  CourseDetailPage,
  CourseEnrollmentPage,
  FoxtrotDeltaPage,
  UpcomingCoursesPage,
  ImpressumPage,
  PrivacyPolicyPage
}
