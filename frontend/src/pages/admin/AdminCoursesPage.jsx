import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Loader2,
  Pencil,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Plane,
  Layers,
  Award,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  X,
  Calendar,
  DollarSign,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  Mail,
  Plus,
  Trash2
} from 'lucide-react'
import { api } from '@/lib/api'
import { hasEnrollmentForm, resolveCard } from '@/components/course/CourseCard'
import { SERVICE_IMAGE_BY_SLUG } from '@/data/serviceImages'

// Helper to get category visual tone and icon
function getCategoryMeta(category = '') {
  switch (category.toLowerCase()) {
    case 'dispatch':
      return { label: 'Flight Dispatch', icon: Plane, color: 'text-blue-600 bg-blue-50 border-blue-200/60' }
    case 'ground':
    case 'ramp':
      return { label: 'Ground Operations', icon: Layers, color: 'text-sky-600 bg-sky-50 border-sky-200/60' }
    case 'train-the-trainer':
      return { label: 'Train the Trainer', icon: Award, color: 'text-purple-600 bg-purple-50 border-purple-200/60' }
    case 'security':
    case 'sms':
      return { label: 'SMS & Risk', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50 border-amber-200/60' }
    case 'consulting':
      return { label: 'Airline Consulting', icon: Briefcase, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' }
    default:
      return { label: 'Aviation Program', icon: BookOpen, color: 'text-slate-600 bg-slate-50 border-slate-200/60' }
  }
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  async function createCourse(e) {
    e.preventDefault()
    if (!newTitle.trim() || creating) return
    setCreating(true)
    setError('')
    try {
      const { course } = await api.adminCreateCourse({ title: newTitle.trim() })
      navigate(`/admin/courses/${course._id}`)
    } catch (err) {
      setError(err.message)
      setCreating(false)
    }
  }

  async function deleteCourse(course) {
    if (!window.confirm(`Delete "${course.title}"? This removes the course, its application form and its images. It cannot be undone.`)) return
    setError('')
    try {
      await api.adminDeleteCourse(course._id)
      setCourses((list) => list.filter((c) => c._id !== course._id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.adminListCourses({ status })
      setCourses(data.courses || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }



  // Filtered courses based on search & category
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        c.title?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q) ||
        c.refCode?.toLowerCase().includes(q) ||
        c.authority?.toLowerCase().includes(q)

      const matchesCat =
        categoryFilter === 'all' ||
        c.category?.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCat
    })
  }, [courses, searchQuery, categoryFilter])

  const totalCount = courses.length
  const publishedCount = courses.filter((c) => c.status === 'published').length
  const draftCount = courses.filter((c) => c.status === 'draft').length
  const publishedPercent = totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
        {/* Total Courses Card */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Curriculum</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalCount}</span>
                <span className="text-xs font-semibold text-slate-500">programs</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                Active in academy database
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Global Coverage</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Active
            </span>
          </div>
        </div>

        {/* Published Courses Card */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published Online</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">{publishedCount}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {publishedPercent}% Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                Open for enrollment &amp; registration
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Public Catalog</span>
            <span className="text-emerald-600 font-bold">
              Live on Site
            </span>
          </div>
        </div>

        {/* Drafts Card */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Drafts &amp; Staging</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{draftCount}</span>
                <span className="text-xs font-semibold text-slate-500">pending</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                {draftCount === 0 ? 'All courses are live and published' : 'Courses hidden from public view'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Staging Mode</span>
            <span className="text-slate-600 font-semibold">{draftCount === 0 ? '0 Pending' : 'Review Needed'}</span>
          </div>
        </div>
      </div>

      {/* 2. UNIFIED SEARCH, FILTER & ACTION TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl w-fit">
            {[
              { id: 'all', label: 'All Courses', count: totalCount },
              { id: 'published', label: 'Published', count: publishedCount },
              { id: 'draft', label: 'Drafts', count: draftCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  status === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    status === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input & Category Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-1 lg:max-w-xl lg:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, ref code, slug…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="dispatch">Flight Dispatch</option>
              <option value="ground">Ground Operations</option>
              <option value="train-the-trainer">Train the Trainer</option>
              <option value="security">SMS &amp; Risk</option>
              <option value="consulting">Airline Consulting</option>
            </select>

            {/* New course */}
            <button
              type="button"
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New course</span>
            </button>

            {/* Default application form new courses start from */}
            <Link
              to="/admin/form-template"
              title="The application form every new course starts from"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Default form</span>
            </Link>

            {/* Reload Button */}
            <button
              onClick={load}
              title="Refresh Catalog"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* 3. COURSES TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#34E06E]" />
          <p className="text-sm font-bold text-slate-700">Loading Academic Catalog…</p>
          <p className="text-xs text-slate-400">Fetching courses and regulatory data</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-base font-bold text-slate-900">No matching programs found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or status filter to find the course you are looking for.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredCourses.map((course) => {
              const meta = getCategoryMeta(course.category)
              const CategoryIcon = meta.icon
              const formattedDate = course.schedule?.startDate
                ? new Date(course.schedule.startDate).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                : null

              return (
                <div
                  key={course._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-slate-300 transition-all overflow-hidden group"
                >
                  {/* Course image (same photo as on the Services page) */}
                  <Link to={`/admin/courses/${course._id}/text`} className="relative block aspect-[16/9] bg-slate-100 overflow-hidden">
                    <img
                      src={SERVICE_IMAGE_BY_SLUG[course.slug] || resolveCard(course).image}
                      alt={course.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </Link>

                  {/* Header */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.color}`}>
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                          course.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80'
                        }`}
                      >
                        <span className="capitalize">{course.status}</span>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <Link
                        to={`/admin/courses/${course._id}/text`}
                        className="font-bold text-slate-900 hover:text-emerald-600 transition-colors leading-snug line-clamp-2 block"
                        title={course.title}
                      >
                        {course.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                          /{course.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(course.slug, `slug-${course._id}`)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                          title="Copy slug"
                        >
                          {copiedId === `slug-${course._id}` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{formattedDate || 'Rolling / On Demand'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {course.price?.amount != null
                            ? `${course.price.currency === 'INR' ? '₹' : course.price.currency === 'EUR' ? '€' : '$'}${course.price.amount.toLocaleString()}`
                            : 'On request'}
                        </span>
                      </div>
                    </div>

                    {course.refCode && (
                      <span className="inline-block font-mono text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                        {course.refCode}
                      </span>
                    )}

                    {/* Registration Form & Page Overrides badge */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {hasEnrollmentForm(course) ? (
                        <Link
                          to={`/admin/courses/${course._id}/form`}
                          title="Edit the online application form for this course"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Online application</span>
                          <LinkIcon className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      ) : (
                        <span
                          title="This course has no application form - its buttons send visitors to the Contact page"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-600 border-slate-200/80"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Inquiries via Contact</span>
                        </span>
                      )}

                      <Link
                        to={`/admin/courses/${course._id}`}
                        title="Price, dates, images, status and other course settings"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-full transition-colors"
                      >
                        <span>Settings</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="border-t border-slate-100 bg-slate-50/80 p-3 flex items-center gap-2">
                    <Link
                      to={`/admin/courses/${course._id}/text`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black text-[11px] font-extrabold uppercase tracking-wider px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                      title="Open the live course page and click any text to edit it"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Page</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteCourse(course)}
                      title="Delete this course"
                      className="inline-flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {hasEnrollmentForm(course) && (
                      <Link
                        to={`/admin/courses/${course._id}/form`}
                        className="inline-flex items-center justify-center gap-1 border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-[11px] font-bold px-2.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                        title="Edit the online application form"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Form</span>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-2 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-800">{filteredCourses.length}</strong> of{' '}
              <strong className="text-slate-800">{courses.length}</strong> total programs
            </span>
            <span className="text-[11px] text-slate-400">IFOA Flight Operations Academic Management</span>
          </div>
        </div>
      )}


      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => !creating && setShowNew(false)}>
          <form
            onSubmit={createCourse}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">New course</h2>
              <button type="button" onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-slate-600">Course title</span>
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Flight Dispatcher Refresher"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <p className="text-xs text-slate-500">The course starts as a draft. Add the category, price, dates and content on the next screen, then publish it.</p>
            <button
              type="submit"
              disabled={!newTitle.trim() || creating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black text-xs font-extrabold uppercase tracking-wider py-3 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Create course</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminCoursesPage
