const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, { method = 'GET', body, isFormData = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include', // admin session cookie
    headers: isFormData || !body ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : null

  // Let the background image loader see pictures named in public course data.
  if (data && method === 'GET' && typeof window !== 'undefined' && /^\/courses/.test(path)) {
    window.dispatchEvent(new CustomEvent('ifoa:images', { detail: data }))
  }

  if (!res.ok) {
    const error = new Error(data?.message || `Request failed (${res.status})`)
    error.status = res.status
    error.errors = data?.errors
    throw error
  }
  return data
}

export const api = {
  // ---- Public ----
  getRates: () => request('/rates?v=2'),
  listCourses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
    ).toString()
    return request(`/courses${qs ? `?${qs}` : ''}`)
  },
  getCourse: (slug) => request(`/courses/${slug}`),

  // ---- Public editable page content ----
  getPage: (page) => request(`/pages/${page}`),

  // ---- Website chat bot ----
  chat: (messages) => request('/chat', { method: 'POST', body: { messages } }),

  // ---- Contact page inquiry form ----
  sendContact: (payload) => request('/contact', { method: 'POST', body: payload }),

  // ---- Newsletter signup ----
  subscribeNewsletter: (email) => request('/newsletter', { method: 'POST', body: { email } }),

  // ---- Public enrollment form ----
  getCourseForm: (slug) => request(`/courses/${slug}/form`),
  submitCourseForm: (slug, answers) =>
    request(`/courses/${slug}/register`, { method: 'POST', body: { answers } }),
  getSubmission: (id) => request(`/submissions/${id}`),

  // ---- Admin auth ----
  login: (email, password) => request('/admin/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/admin/auth/logout', { method: 'POST' }),
  me: () => request('/admin/auth/me'),

  // ---- Admin courses ----
  adminListCourses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
    ).toString()
    return request(`/admin/courses${qs ? `?${qs}` : ''}`)
  },
  adminGetCourse: (id) => request(`/admin/courses/${id}`),
  adminCreateCourse: (payload) => request('/admin/courses', { method: 'POST', body: payload }),
  adminDeleteCourse: (id) => request(`/admin/courses/${id}`, { method: 'DELETE' }),
  adminUpdateCourse: (id, payload) => request(`/admin/courses/${id}`, { method: 'PUT', body: payload }),

  // ---- Admin: per-course enrollment form schema ----
  adminGetCourseForm: (courseId) => request(`/admin/courses/${courseId}/form-schema`),
  adminUpdateCourseForm: (courseId, sections) =>
    request(`/admin/courses/${courseId}/form-schema`, { method: 'PUT', body: { sections } }),
  adminResetCourseForm: (courseId) =>
    request(`/admin/courses/${courseId}/form-schema`, { method: 'DELETE' }),

  // ---- Admin: default form template ----
  adminGetFormTemplate: () => request('/admin/form-template'),
  adminUpdateFormTemplate: (sections) =>
    request('/admin/form-template', { method: 'PUT', body: { sections } }),

  // ---- Admin: editable marketing-page content ----
  adminListPages: () => request('/admin/pages'),
  adminGetPage: (page) => request(`/admin/pages/${page}`),
  adminUpdatePage: (page, data) => request(`/admin/pages/${page}`, { method: 'PUT', body: { data } }),
  adminResetPage: (page) => request(`/admin/pages/${page}`, { method: 'DELETE' }),

  adminUpdateCourseTextFields: (id, fields) =>
    request(`/admin/courses/${id}/text-fields`, { method: 'PUT', body: { fields } }),
  adminUpdateCourseOverview: (id, overview) =>
    request(`/admin/courses/${id}/overview`, { method: 'PUT', body: { overview } }),

  // ---- Admin: per-course chrome overrides (courseDetail/courseEnrollment) ----
  adminGetCourseContent: (id, page) => request(`/admin/courses/${id}/content/${page}`),
  adminUpdateCourseContent: (id, page, data) =>
    request(`/admin/courses/${id}/content/${page}`, { method: 'PUT', body: { data } }),
  adminResetCourseContent: (id, page) =>
    request(`/admin/courses/${id}/content/${page}`, { method: 'DELETE' }),

  // ---- Admin: submissions ----
  adminListSubmissions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
    ).toString()
    return request(`/admin/submissions${qs ? `?${qs}` : ''}`)
  },
  adminGetSubmission: (id) => request(`/admin/submissions/${id}`),
  adminUpdateSubmission: (id, payload) =>
    request(`/admin/submissions/${id}`, { method: 'PUT', body: payload }),
  adminDeleteSubmission: (id) => request(`/admin/submissions/${id}`, { method: 'DELETE' }),
  adminListLegacyRegistrations: () => request('/admin/registrations/legacy'),

  // ---- Admin: contact form messages ----
  adminListContactMessages: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 'all')
    ).toString()
    return request(`/admin/contact-messages${qs ? `?${qs}` : ''}`)
  },
  adminGetContactMessage: (id) => request(`/admin/contact-messages/${id}`),
  adminUpdateContactMessage: (id, payload) =>
    request(`/admin/contact-messages/${id}`, { method: 'PUT', body: payload }),
  adminDeleteContactMessage: (id) => request(`/admin/contact-messages/${id}`, { method: 'DELETE' }),

  // ---- Admin media (Cloudflare R2) ----
  adminUpload: (files, folder = 'courses') => {
    const form = new FormData()
    for (const file of files) form.append('files', file)
    return request(`/admin/uploads?folder=${folder}`, { method: 'POST', body: form, isFormData: true })
  },
  adminDeleteUpload: (key) =>
    request(`/admin/uploads?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
}

export default api
