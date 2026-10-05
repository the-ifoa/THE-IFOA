import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, X, Pencil } from 'lucide-react'

import { api } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseDetailView } from '@/components/course/CourseDetailView'

// Full public course page as the admin will see it, fetched through the admin
// API so drafts render too. Meant to be opened in a new tab from the editor.
export function AdminCoursePreviewPage() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // true when we're showing the editor's in-memory draft (via localStorage)
  // rather than what's actually saved in the DB.
  const [isDraft, setIsDraft] = useState(false)
  // Guards the draft read below against React StrictMode's dev-only double
  // effect invocation: the read is destructive (it deletes the key so a later
  // reload of this tab falls back to the real saved version), so a naive
  // effect would consume it on the first invocation and then, on the second,
  // find nothing and fall through to fetching + overwriting with stale DB
  // data. The ref persists across both invocations, so only the first one
  // actually runs the consume-and-set logic.
  const consumedDraftRef = useRef(false)

  useEffect(() => {
    if (consumedDraftRef.current) return
    consumedDraftRef.current = true

    // The editor tab stashes its current unsaved form state here right before
    // opening this tab (a separate browsing context with no shared React
    // state).
    //
    // localStorage, not sessionStorage: sessionStorage only carries over into
    // a new tab when that tab has an opener relationship, which the editor's
    // `window.open(..., 'noopener')` deliberately breaks. localStorage is
    // shared by every tab on the origin regardless of how it was opened.
    let draft = null
    try {
      const raw = localStorage.getItem(`course-draft-preview:${id}`)
      if (raw) {
        draft = JSON.parse(raw)
        localStorage.removeItem(`course-draft-preview:${id}`)
      }
    } catch {
      // localStorage unavailable - fall through to the API fetch below.
    }

    if (draft) {
      setCourse(draft)
      setIsDraft(true)
      setLoading(false)
      return
    }

    api
      .adminGetCourse(id)
      .then(({ course: c }) => setCourse(c))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const closeTab = () => {
    // Works when opened via target="_blank"; otherwise fall back to the editor.
    window.close()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Preview ribbon */}
      <div className="sticky top-0 z-[60] bg-amber-400 text-black px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">
          PREVIEW
          {course && (
            <span className="font-normal">
              {' - '}
              {isDraft
                ? 'showing your unsaved edits'
                : course.status === 'published'
                  ? 'this is the live version'
                  : 'draft, not visible to the public yet'}
            </span>
          )}
        </span>
        <div className="flex items-center gap-4">
          <Link
            to={`/admin/courses/${id}`}
            className="inline-flex items-center gap-1.5 font-bold hover:underline"
          >
            <Pencil className="w-3.5 h-3.5" /> Back to editor
          </Link>
          <button onClick={closeTab} className="inline-flex items-center gap-1.5 font-bold hover:underline">
            <X className="w-3.5 h-3.5" /> Close
          </button>
        </div>
      </div>

      <Navbar variant="static" />

      <main className="grow">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rocket-dark" />
          </div>
        ) : error || !course ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
            <h1 className="text-2xl font-bold text-rocket-dark">Cannot load preview</h1>
            <p className="text-gray-600 max-w-md">{error || 'Course not found.'}</p>
            <Link to={`/admin/courses/${id}`} className="text-sm font-bold text-rocket-dark underline">
              Back to editor
            </Link>
          </div>
        ) : (
          <CourseDetailView course={course} preview />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default AdminCoursePreviewPage
