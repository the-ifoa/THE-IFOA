import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { RouteTitle } from './components/common/RouteTitle'
import { ChatWidget } from './components/common/ChatWidget'

import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import { SmoothScroll } from './components/common/SmoothScroll'
import { RiLoader4Line } from 'react-icons/ri'

function PublicLoadingFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <RiLoader4Line className="w-6 h-6 animate-spin text-slate-300" />
    </div>
  )
}

// The admin console is never part of the prerendered SEO snapshot (excluded
// from scripts/prerender.mjs's route list and disallowed in robots.txt), so
// lazy-loading it is free: public visitors never download any of this code,
// and it doesn't touch what crawlers see.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })))
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })))
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage').then((m) => ({ default: m.AdminCoursesPage })))
const AdminCourseFormPage = lazy(() => import('./pages/admin/AdminCourseFormPage').then((m) => ({ default: m.AdminCourseFormPage })))
const AdminCoursePreviewPage = lazy(() => import('./pages/admin/AdminCoursePreviewPage').then((m) => ({ default: m.AdminCoursePreviewPage })))
const AdminSubmissionsPage = lazy(() => import('./pages/admin/AdminSubmissionsPage').then((m) => ({ default: m.AdminSubmissionsPage })))
const AdminSubmissionDetailPage = lazy(() => import('./pages/admin/AdminSubmissionDetailPage').then((m) => ({ default: m.AdminSubmissionDetailPage })))
const AdminContactMessagesPage = lazy(() => import('./pages/admin/AdminContactMessagesPage').then((m) => ({ default: m.AdminContactMessagesPage })))
const AdminContactMessageDetailPage = lazy(() => import('./pages/admin/AdminContactMessageDetailPage').then((m) => ({ default: m.AdminContactMessageDetailPage })))
const AdminFormBuilderPage = lazy(() => import('./pages/admin/AdminFormBuilderPage').then((m) => ({ default: m.AdminFormBuilderPage })))
const AdminPageEditorPage = lazy(() => import('./pages/admin/AdminPageEditorPage').then((m) => ({ default: m.AdminPageEditorPage })))
const AdminCourseTextEditor = lazy(() =>
  import('./pages/admin/AdminCourseTextEditor').then((m) => ({ default: m.AdminCourseTextEditor }))
)

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rocket-dark">
      <RiLoader4Line className="w-8 h-8 animate-spin text-[#34E06E]" />
    </div>
  )
}

// ScrollToTop helper on route change
function ScrollToTop() {
  const { pathname, state } = useLocation()
  useEffect(() => {
    // In-page switches (e.g. a course's location switch) keep the position.
    if (state?.keepScroll) return
    window.scrollTo(0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Tell the background image loader which page the visitor is on now.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ifoa:route', { detail: pathname }))
  }, [pathname])
  return null
}

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}

// Gate for any admin-only screen. Used for both the console shell and
// standalone admin pages (e.g. course preview) that render without the shell.
function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rocket-dark">
        <RiLoader4Line className="w-8 h-8 animate-spin text-[#34E06E]" />
      </div>
    )
  }
  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }
  return children
}

import { RouteProgressBar } from './components/common/RouteProgressBar'

// Public site chrome: navbar + footer around the marketing pages. `pages`
// defaults to the eager set (what SSR always gets); the browser entry passes
// the lazy set explicitly so only the visited page's chunk is fetched.
function PublicSite({ pages }) {
  const {
    HomePage: Home,
    ServicesPage: Services,
    EventsPage: Events,
    FoxtrotDeltaPage: FoxtrotDelta,
    UpcomingCoursesPage: UpcomingCourses,
    AboutPage: About,
    ContactPage: Contact,
    FaqPage: Faq,
    CourseDetailPage: CourseDetail,
    CourseEnrollmentPage: CourseEnrollment,
    NotFoundPage: NotFound,
    ImpressumPage: Impressum,
    PrivacyPolicyPage: PrivacyPolicy
  } = pages

  return (
    <div className="min-h-screen flex flex-col bg-white text-rocket-dark selection:bg-rocket-lime selection:text-black">
      <RouteProgressBar />
      <Navbar />

      <main className="grow">
        <Suspense fallback={<PublicLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events-courses" element={<Navigate to="/events" replace />} />
            <Route path="/foxtrot-delta" element={<FoxtrotDelta />} />
            <Route path="/upcoming-courses" element={<UpcomingCourses />} />
            <Route path="/magazine" element={<Navigate to="/foxtrot-delta" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/faqs" element={<Navigate to="/faq" replace />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/courses/:slug/enroll" element={<CourseEnrollment />} />
            <Route path="/enroll/:slug" element={<CourseEnrollment />} />
            <Route path="/enroll" element={<Navigate to="/events" replace />} />
            <Route path="/courses" element={<Navigate to="/events" replace />} />
            <Route path="/training" element={<Navigate to="/services" replace />} />
            <Route path="/compliance" element={<ExternalRedirect to="https://agent.theifoa.com/" />} />
            <Route path="/agent-for-service" element={<ExternalRedirect to="https://agent.theifoa.com/" />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-protection-policy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <ChatWidget />
    </div>
  )
}

// Router-agnostic app tree. The browser entry wraps this in BrowserRouter via
// <App>; scripts/prerender.mjs wraps the same tree in StaticRouter so every
// route can be rendered to static HTML at build time. `publicPages` defaults
// to the eager set - entry-server.jsx calls this with no props, so
// prerendering is unaffected either way.
export function AppRoutes({ publicPages }) {
  return (
    <>
      <SmoothScroll>
        <ScrollToTop />
        <RouteTitle />
        <AdminAuthProvider>
          <Suspense fallback={<AdminLoadingFallback />}>
          <Routes>
            {/* Admin console */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            {/* Full-screen course preview - outside the console shell */}
            <Route
              path="/admin/courses/:id/preview"
              element={
                <RequireAdmin>
                  <AdminCoursePreviewPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="courses/:id" element={<AdminCourseFormPage />} />
              <Route path="courses/:id/form" element={<AdminFormBuilderPage />} />
              <Route path="courses/:id/text" element={<AdminCourseTextEditor />} />
              <Route path="form-template" element={<AdminFormBuilderPage />} />
              <Route path="pages" element={<Navigate to="/admin" replace />} />
              <Route path="pages/:page" element={<AdminPageEditorPage />} />
              <Route path="submissions" element={<AdminSubmissionsPage />} />
              <Route path="submissions/:id" element={<AdminSubmissionDetailPage />} />
              <Route path="registrations" element={<Navigate to="/admin/submissions" replace />} />
              <Route path="contact-messages" element={<AdminContactMessagesPage />} />
              <Route path="contact-messages/:id" element={<AdminContactMessageDetailPage />} />
            </Route>

            {/* Public site */}
            <Route path="/*" element={<PublicSite pages={publicPages} />} />
          </Routes>
          </Suspense>
        </AdminAuthProvider>
      </SmoothScroll>
    </>
  )
}

// Browser-only composition (wrapping AppRoutes in BrowserRouter and passing
// lazyPublicPages) lives in main.jsx, not here - this file must never import
// either page-map itself, or the client build's code-splitting breaks. See
// pages/eagerPublicPages.js for why.
