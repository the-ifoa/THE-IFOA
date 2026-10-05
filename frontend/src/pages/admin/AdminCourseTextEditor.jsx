import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Check, ArrowLeft, ExternalLink, Settings } from 'lucide-react'
import { api } from '@/lib/api'
import { coursePreviewKey } from '@/components/course/CourseOverview'
import { clone, setAtPath } from '@/lib/objectPath'
import { pickCourseText } from '@/lib/courseText'
import { hasEnrollmentForm } from '@/components/course/CourseCard'
import { EditablePreview } from './AdminPageEditorPage'

// Click-to-edit for everything written on a course's pages. The live page
// loads in an iframe and every text is editable in place. One document holds
// the three sources the pages read from, and edit paths start with the source:
//   overview.*          the course's own page copy (course.overview)
//   courseDetail.*      labels on the course page (sidebar, buttons, headings)
//   courseEnrollment.*  the application page header, sidebar and help box
//   course.*            wording stored on the course itself (title, summary,
//                       curriculum, requirements, sidebar rows, CTAs...)
//   form.*              the registration form's sections (titles, field
//                       labels, notices); structure is edited in the builder
//   courseFacts.*       tuition (currency + amount) and next intake date,
//                       edited as text and saved to price / schedule
//   courseMedia.*       uploaded images: cardImage (card.image) and logos
//                       (trainingStandards.logos, the Regulatory Framework row)
const PAGES = [
  { key: 'detail', label: 'Course page', path: (slug) => `/courses/${slug}` },
  { key: 'enroll', label: 'Application page', path: (slug) => `/courses/${slug}/enroll` }
]

// `initialTab` / `heading` / `toolbar` let the Enrollment Form page embed this
// editor on the application page; `onDirtyChange` reports unsaved edits.
// Course facts in the editable shape the preview shows.
const factsOf = (course) => ({
  currency: course.price?.currency || 'EUR',
  priceAmount: course.price?.amount != null ? String(course.price.amount) : '',
  startDate: course.schedule?.startDate ? String(course.schedule.startDate).slice(0, 10) : ''
})

export function AdminCourseTextEditor({ initialTab = 'detail', heading, toolbar, onDirtyChange, showTabs = true }) {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [data, setData] = useState(null)
  const [dirty, setDirty] = useState({})
  const [tab, setTab] = useState(initialTab)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.adminGetCourse(id),
      api.adminGetCourseContent(id, 'courseDetail'),
      api.adminGetCourseContent(id, 'courseEnrollment'),
      api.adminGetCourseForm(id).catch(() => null)
    ])
      .then(([courseRes, detailRes, enrollRes, formRes]) => {
        setCourse(courseRes.course)
        setData({
          overview: courseRes.course?.overview || null,
          course: pickCourseText(courseRes.course || {}),
          courseDetail: detailRes.data,
          courseEnrollment: enrollRes.data,
          ...(formRes?.schema?.sections ? { form: formRes.schema.sections } : {}),
          courseFacts: factsOf(courseRes.course || {}),
          courseMedia: {
            cardImage: courseRes.course?.card?.image || null,
            logos: courseRes.course?.trainingStandards?.logos || []
          }
        })
      })
      .catch((err) => setError(err.message))
  }, [id])

  const isDirty = Object.values(dirty).some(Boolean)
  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const handleEditChange = (path, value) => {
    const source = path.split('.')[0]
    if (!['overview', 'courseDetail', 'courseEnrollment', 'course', 'courseMedia', 'courseFacts', 'form'].includes(source)) return
    setDirty((d) => ({ ...d, [source]: true }))
    setData((prev) => {
      const next = clone(prev)
      setAtPath(next, path, value)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const next = { ...data }
      if (dirty.overview && data.overview) {
        next.overview = (await api.adminUpdateCourseOverview(id, data.overview)).overview
      }
      if (dirty.course) {
        next.course = pickCourseText((await api.adminUpdateCourseTextFields(id, data.course)).course)
      }
      if (dirty.courseDetail) {
        next.courseDetail = (await api.adminUpdateCourseContent(id, 'courseDetail', data.courseDetail)).data
      }
      if (dirty.courseEnrollment) {
        next.courseEnrollment = (await api.adminUpdateCourseContent(id, 'courseEnrollment', data.courseEnrollment)).data
      }
      if (dirty.form && data.form) {
        next.form = (await api.adminUpdateCourseForm(id, data.form)).schema.sections
      }
      if (dirty.courseFacts) {
        const { currency, priceAmount, startDate } = data.courseFacts
        const digits = String(priceAmount || '').replace(/[^\d.]/g, '')
        const saved = (
          await api.adminUpdateCourse(id, {
            'price.currency': (currency || '').trim().toUpperCase() || 'EUR',
            'price.amount': digits ? Number(digits) : null,
            'schedule.startDate': startDate || null
          })
        ).course
        next.courseFacts = factsOf(saved || {})
      }
      if (dirty.courseMedia) {
        // Dotted path so the rest of the card settings stay untouched; the
        // backend deletes the replaced R2 object.
        const saved = (
          await api.adminUpdateCourse(id, {
            'card.image': data.courseMedia.cardImage,
            'trainingStandards.logos': data.courseMedia.logos
          })
        ).course
        next.courseMedia = { cardImage: saved?.card?.image || null, logos: saved?.trainingStandards?.logos || [] }
      }
      setData(next)
      setDirty({})
      setMessage('Saved. The live pages now show these changes.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (error && !course) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 max-w-3xl mx-auto">{error}</div>
    )
  }
  if (!course || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-ifoa-navy" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading course page…</p>
      </div>
    )
  }

  // Contact-only courses have no application page to edit.
  const pages = hasEnrollmentForm(course) ? PAGES : PAGES.filter((p) => p.key !== 'enroll')
  const current = pages.find((p) => p.key === tab) || pages[0]

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white px-5 py-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rocket-dark uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All courses
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-rocket-dark mt-1">{heading || `${course.title}: page text`}</h1>
          <p className="text-xs mt-0.5">
            {isDirty ? (
              <span className="text-amber-600 font-semibold">Unsaved changes</span>
            ) : (
              <span className="text-gray-500">Click any text on the page below to change it, or use “Replace image” on the course image.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className={`${showTabs && pages.length > 1 ? 'inline-flex' : 'hidden'} rounded-xl border border-gray-200 bg-white p-1`} role="tablist">
            {pages.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={tab === p.key}
                onClick={() => setTab(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  tab === p.key ? 'bg-[#020617] text-white' : 'text-gray-600 hover:text-rocket-dark'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {toolbar}
          <Link
            to={`/admin/courses/${id}`}
            className="inline-flex items-center gap-1.5 border border-gray-300 text-rocket-dark font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <a
            href={current.path(course.slug)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-gray-300 text-rocket-dark font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> View
          </a>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 bg-[#020617] text-white hover:bg-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-rocket-lime" /> : <Check className="w-4 h-4 text-rocket-lime" />}
            <span>{saving ? 'Saving…' : 'Save changes'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>}

      <EditablePreview
        key={tab}
        page={coursePreviewKey(course.slug)}
        path={current.path(course.slug)}
        data={data}
        onEditChange={handleEditChange}
        onEditAdd={() => {}}
        onEditRemove={() => {}}
      />
    </div>
  )
}

export default AdminCourseTextEditor
