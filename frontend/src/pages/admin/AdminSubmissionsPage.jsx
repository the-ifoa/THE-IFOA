import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Loader2,
  Users,
  Clock,
  CheckCircle2,
  Phone,
  Search,
  FileText,
  Download,
  Trash2,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  X,
  Inbox,
  GraduationCap
} from 'lucide-react'
import { api } from '@/lib/api'
import { openEnrollmentPdf, downloadEnrollmentPdf } from '@/pdf/generateEnrollmentPdf'
import { getSubmissionQuickInfo } from '@/components/formEngine/formSchema'
import { hasEnrollmentForm } from '@/components/course/CourseCard'

const STATUSES = ['new', 'contacted', 'confirmed', 'rejected']

const STATUS_CONFIG = {
  new: {
    label: 'New',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500',
    tone: 'text-blue-600',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    hint: 'Needs review'
  },
  contacted: {
    label: 'Contacted',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
    dot: 'bg-amber-500',
    tone: 'text-amber-600',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    hint: 'In dialogue'
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    tone: 'text-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    hint: 'Admitted student'
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
    dot: 'bg-rose-500',
    tone: 'text-rose-600',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    hint: 'Declined'
  }
}

function StatCard({ label, value, hint, icon: Icon, toneClass, iconStyle, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full relative overflow-hidden rounded-2xl p-5 border transition-all duration-200 cursor-pointer group bg-white ${
        isActive
          ? 'ring-2 ring-slate-900 border-slate-900 shadow-md'
          : 'border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className={`text-3xl font-extrabold tracking-tight ${toneClass || 'text-slate-900'}`}>
            {value}
          </p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 ${iconStyle}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {hint && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{hint}</span>
          <span className="font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
            Filter &rarr;
          </span>
        </div>
      )}
    </button>
  )
}

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AP'
  )
}

export function AdminSubmissionsPage() {
  const [searchParams] = useSearchParams()
  const [submissions, setSubmissions] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  // Deep-linkable from the page-editor's cross-link panel, e.g. /admin/submissions?course=<courseId>.
  const [course, setCourse] = useState(() => searchParams.get('course') || '')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [legacy, setLegacy] = useState(null)
  const [legacyOpen, setLegacyOpen] = useState(false)
  const [legacyLoading, setLegacyLoading] = useState(false)

  useEffect(() => {
    api
      .adminListCourses()
      .then((d) => setCourses(d.courses || []))
      .catch(() => {})
  }, [])

  function load() {
    setLoading(true)
    setError('')
    api
      .adminListSubmissions({ status, course, q })
      .then((d) => setSubmissions(d.submissions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, course])

  async function handleDelete(s, name) {
    if (!window.confirm(`Delete submission for "${name}"? This cannot be undone.`)) return
    setBusyId(s._id)
    try {
      await api.adminDeleteSubmission(s._id)
      setSubmissions((prev) => prev.filter((x) => x._id !== s._id))
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function loadLegacy() {
    if (legacy) {
      setLegacyOpen((o) => !o)
      return
    }
    setLegacyLoading(true)
    try {
      const d = await api.adminListLegacyRegistrations()
      setLegacy(d.registrations || [])
      setLegacyOpen(true)
    } catch (err) {
      alert(err.message)
    } finally {
      setLegacyLoading(false)
    }
  }

  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, confirmed: 0, rejected: 0 }
    for (const s of submissions) {
      if (c[s.status] !== undefined) c[s.status] += 1
    }
    return c
  }, [submissions])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Candidates"
          value={submissions.length}
          hint="All applications"
          icon={Users}
          toneClass="text-slate-900"
          iconStyle="bg-purple-50 text-purple-600 border-purple-100"
          isActive={status === 'all'}
          onClick={() => setStatus('all')}
        />
        <StatCard
          label="New / Pending"
          value={counts.new}
          hint="Awaiting verification"
          icon={Clock}
          toneClass="text-blue-600"
          iconStyle="bg-blue-50 text-blue-600 border-blue-100"
          isActive={status === 'new'}
          onClick={() => setStatus('new')}
        />
        <StatCard
          label="In Dialogue"
          value={counts.contacted}
          hint="Candidate contacted"
          icon={Phone}
          toneClass="text-amber-600"
          iconStyle="bg-amber-50 text-amber-600 border-amber-100"
          isActive={status === 'contacted'}
          onClick={() => setStatus('contacted')}
        />
        <StatCard
          label="Confirmed"
          value={counts.confirmed}
          hint="Admitted to program"
          icon={CheckCircle2}
          toneClass="text-emerald-600"
          iconStyle="bg-emerald-50 text-emerald-600 border-emerald-100"
          isActive={status === 'confirmed'}
          onClick={() => setStatus('confirmed')}
        />
      </div>

      {/* 2. UNIFIED SEARCH & FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              load()
            }}
            className="flex items-center gap-2 flex-1 max-w-lg"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by student name, email, answer, passport…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ('')
                    setTimeout(() => load(), 0)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Filters & Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Pills */}
            <div className="flex bg-slate-100/90 p-1 rounded-xl">
              {['all', ...STATUSES].map((s) => {
                const isSelected = status === s
                const count = s === 'all' ? submissions.length : counts[s] || 0
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>{s}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Course Filter Dropdown */}
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer transition-all"
            >
              <option value="">All Academic Programs ({courses.length})</option>
              {courses.filter((c) => hasEnrollmentForm(c) || c._id === course).map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={load}
              title="Refresh Submissions"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="text-xs font-bold uppercase underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. SUBMISSIONS TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm font-bold text-slate-800">Loading student submissions…</p>
          <p className="text-xs text-slate-400">Fetching enrollment application data</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-base font-bold text-slate-900">No submissions found</p>
            <p className="text-xs text-slate-500">
              {q || status !== 'all' || course
                ? 'Try adjusting your search query, status filter, or course selection.'
                : 'Enrollment form submissions submitted by candidate students will appear here.'}
            </p>
          </div>
          {(q || status !== 'all' || course) && (
            <button
              type="button"
              onClick={() => {
                setQ('')
                setStatus('all')
                setCourse('')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Applicant / Student</th>
                  <th className="px-5 py-4">Course Program</th>
                  <th className="px-5 py-4">Intake</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((s) => {
                  const info = getSubmissionQuickInfo(s)
                  const initials = getInitials(info.name)
                  const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.new

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Applicant */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/submissions/${s._id}`}
                              className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors block truncate"
                            >
                              {info.name}
                            </Link>
                            <a
                              href={`mailto:${info.email}`}
                              className="text-xs text-slate-500 hover:text-slate-800 transition-colors truncate block"
                            >
                              {info.email || 'No email provided'}
                            </a>
                            {info.phone && (
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {info.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            {s.course?.title || s.courseTitle || ' - '}
                          </span>
                          {info.citizenship && (
                            <span className="text-[11px] text-slate-400 block">
                              {info.citizenship} {info.passportNumber ? `• Passport: ${info.passportNumber}` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Intake */}
                      <td className="px-5 py-4">
                        {s.intake ? (
                          <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                            {s.intake}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="capitalize">{cfg.label}</span>
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-700">
                          {new Date(s.submittedAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(s.submittedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEnrollmentPdf(s)}
                            title="View Generated PDF"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadEnrollmentPdf(s, `IFOA-Enrollment-${s._id}.pdf`)}
                            title="Download PDF"
                            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s, info.name)}
                            disabled={busyId === s._id}
                            title="Delete submission"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/submissions/${s._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-[#34E06E] text-white hover:text-slate-950 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs group-hover:shadow-xs ml-1"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{submissions.length}</strong> candidates
            </span>
            <span className="text-[11px] text-slate-400">IFOA Admissions Registry</span>
          </div>
        </div>
      )}

      {/* 4. LEGACY REGISTRATIONS DRAWER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <button
          type="button"
          onClick={loadLegacy}
          className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span>Legacy registrations (read-only archive)</span>
            {legacy && (
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                {legacy.length} archived
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {legacyLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${legacyOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {legacyOpen && legacy && (
          <div className="border-t border-slate-100 p-6 bg-slate-50/30">
            {legacy.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No legacy archive records found in database.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Applicant Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Enrolled Course</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {legacy.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {[r.firstName, r.middleName, r.lastName].filter(Boolean).join(' ')}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{r.email}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {r.course?.title || r.courseTitle || ' - '}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminSubmissionsPage

