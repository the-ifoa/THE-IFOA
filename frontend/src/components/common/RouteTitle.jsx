import { useEffect } from 'react'
import { useLocation, matchPath } from 'react-router-dom'

const BRAND = 'IFOA | International Flight Operations Academy'

// Admin console only. Public routes render their own <title> (plus description,
// canonical, OG and structured data) through <Seo>; assigning document.title in
// an effect here would run after React commits and clobber those.
// Ordered most-specific first.
const ROUTES = [
  { pattern: '/admin/login', title: 'Admin Login | IFOA' },
  { pattern: '/admin/courses/:id/preview', title: 'Course Preview · Admin | IFOA' },
  { pattern: '/admin/courses/:id/form', title: 'Enrollment Form · Admin | IFOA' },
  { pattern: '/admin/courses/:id', title: 'Edit Course · Admin | IFOA' },
  { pattern: '/admin/courses', title: 'Courses · Admin | IFOA' },
  { pattern: '/admin/form-template', title: 'Form Template · Admin | IFOA' },
  { pattern: '/admin/submissions/:id', title: 'Submission · Admin | IFOA' },
  { pattern: '/admin/submissions', title: 'Submissions · Admin | IFOA' },
  { pattern: '/admin/pages/:page', title: 'Page Content · Admin | IFOA' },
  { pattern: '/admin', title: 'Admin | IFOA' }
]

export function RouteTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (!pathname.startsWith('/admin')) return
    const hit = ROUTES.find((r) =>
      matchPath({ path: r.pattern, end: r.end ?? false }, pathname)
    )
    document.title = hit ? hit.title : BRAND
  }, [pathname])

  return null
}
