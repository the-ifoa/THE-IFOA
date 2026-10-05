import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, FileText, Download, Trash2, Pencil, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { openEnrollmentPdf, downloadEnrollmentPdf } from '@/pdf/generateEnrollmentPdf'
import { SubmissionSummary } from '@/components/formEngine/SubmissionSummary'
import { DynamicSection } from '@/components/formEngine/DynamicSection'
import { getSubmissionDisplayName, getSubmissionQuickInfo } from '@/components/formEngine/formSchema'

const STATUSES = ['new', 'contacted', 'confirmed', 'rejected']

export function AdminSubmissionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [submission, setSubmission] = useState(null)
  const [draft, setDraft] = useState(null)
  const [intakes, setIntakes] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    return api.adminGetSubmission(id).then(({ submission: s }) => {
      setSubmission(s)
      setDraft(s.answers)
      const courseId = s.course?._id || s.course
      if (courseId) {
        api
          .adminGetCourse(courseId)
          .then(({ course }) => setIntakes((course.intakes || []).filter((i) => i.isActive)))
          .catch(() => {})
      }
    })
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (error && !submission) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error} - <Link to="/admin/submissions" className="underline font-semibold">back to submissions</Link>
      </div>
    )
  }

  if (!submission || !draft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-ifoa-navy" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading submission…</p>
      </div>
    )
  }

  const sections = [...(submission.formSchemaSnapshot || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const name = getSubmissionDisplayName(submission)
  const { trainingLocation } = getSubmissionQuickInfo(submission)

  async function patch(body, successMsg) {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const { submission: updated } = await api.adminUpdateSubmission(id, body)
      setSubmission((prev) => ({ ...updated, course: prev.course }))
      setDraft(updated.answers)
      if (successMsg) {
        setMsg(successMsg)
        setTimeout(() => setMsg(''), 4000)
      }
      return true
    } catch (err) {
      setError(Array.isArray(err.errors) ? err.errors.join(' ') : err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAnswers() {
    const ok = await patch({ answers: draft }, 'Submission updated.')
    if (ok) setEditing(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete this submission (${name})? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.adminDeleteSubmission(id)
      navigate('/admin/submissions')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/admin/submissions" className="hover:text-ifoa-navy hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Submissions
        </Link>
        <span>/</span>
        <span className="text-rocket-dark font-semibold truncate max-w-xs">{name}</span>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-gray-600">
                ID: {id}
              </span>
              {submission.intake && (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-ifoa-navy">
                  Intake: {submission.intake}
                </span>
              )}
              {trainingLocation && (
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Location: {trainingLocation}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-rocket-dark">{name}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {submission.course?.title || submission.courseTitle} · submitted{' '}
              {new Date(submission.submittedAt).toLocaleString('en-GB')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openEnrollmentPdf(submission)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <FileText className="h-4 w-4 text-slate-500" /> View PDF
            </button>
            <button
              onClick={() => downloadEnrollmentPdf(submission, `IFOA-Enrollment-${id}.pdf`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <Download className="h-4 w-4 text-slate-500" /> Download
            </button>
            {!editing && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
              >
                <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
            {editing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDraft(submission.answers)
                    setEditing(false)
                    setError('')
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAnswers}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black px-5 py-2 text-xs font-extrabold uppercase tracking-wider disabled:opacity-60 transition-all cursor-pointer shadow-sm"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>{saving ? 'Saving…' : 'Save changes'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Pencil className="h-3.5 w-3.5" /> <span>Edit answers</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid sm:grid-cols-[200px_1fr] gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Status</label>
            <select
              value={submission.status}
              onChange={(e) => patch({ status: e.target.value }, 'Status updated.')}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Admin notes</label>
            <textarea
              rows={2}
              defaultValue={submission.adminNotes}
              onBlur={(e) => {
                if (e.target.value !== submission.adminNotes) patch({ adminNotes: e.target.value }, 'Notes saved.')
              }}
              placeholder="Internal notes (saved on blur)…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" /> {msg}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">{error}</div>
      )}

      {editing ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
            <strong>Editing answers.</strong> Update fields below, then Save changes.
          </div>
          {sections.map((section, idx) => (
            <DynamicSection
              key={section.id}
              section={section}
              stepNumber={idx + 1}
              intakes={intakes}
              value={draft[section.id]}
              onChange={(sa) => setDraft({ ...draft, [section.id]: sa })}
            />
          ))}
        </div>
      ) : (
        <SubmissionSummary schema={{ sections }} answers={submission.answers} uppercaseLabels={false} />
      )}
    </div>
  )
}

export default AdminSubmissionDetailPage
