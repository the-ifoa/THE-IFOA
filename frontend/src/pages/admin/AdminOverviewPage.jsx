import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Mail,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { api } from '@/lib/api'
import { PATH_BY_PAGE } from './pagesMeta'
import { CourseLinksGrid } from '@/components/admin/CourseLinksGrid'

function StatCard({ label, value, subtext, icon: Icon, tone = 'emerald', to, loading }) {
  const tones = {
    emerald: {
      bg: 'bg-emerald-50/80 text-emerald-600 border-emerald-100',
      num: 'text-slate-900',
      pill: 'bg-emerald-500/10 text-emerald-700'
    },
    blue: {
      bg: 'bg-blue-50/80 text-blue-600 border-blue-100',
      num: 'text-slate-900',
      pill: 'bg-blue-500/10 text-blue-700'
    },
    amber: {
      bg: 'bg-amber-50/80 text-amber-600 border-amber-100',
      num: 'text-slate-900',
      pill: 'bg-amber-500/10 text-amber-700'
    },
    purple: {
      bg: 'bg-purple-50/80 text-purple-600 border-purple-100',
      num: 'text-slate-900',
      pill: 'bg-purple-500/10 text-purple-700'
    }
  }
  const currentTone = tones[tone] || tones.emerald

  return (
    <Link
      to={to}
      className="group relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${currentTone.num}`}>
              {loading ? ' - ' : value}
            </span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${currentTone.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-500">{subtext}</span>
        <span className="inline-flex items-center gap-1 font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">
          View <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  )
}

export function AdminOverviewPage() {
  const [stats, setStats] = useState({
    courses: null,
    totalSubmissions: null,
    newSubmissions: null,
    totalMessages: null,
    newMessages: null
  })
  const [pages, setPages] = useState(null)
  const [courses, setCourses] = useState(null)

  useEffect(() => {
    api
      .adminListPages()
      .then((data) => setPages((data.pages || []).filter((p) => PATH_BY_PAGE[p.page] !== null)))
      .catch(() => setPages([]))

    api
      .adminListCourses({})
      .then((data) => {
        setCourses(data.courses || [])
        setStats((prev) => ({ ...prev, courses: (data.courses || []).length }))
      })
      .catch(() => {
        setCourses([])
        setStats((prev) => ({ ...prev, courses: 0 }))
      })

    api
      .adminListSubmissions({})
      .then((data) => {
        const subs = data.submissions || []
        setStats((prev) => ({
          ...prev,
          totalSubmissions: subs.length,
          newSubmissions: subs.filter((s) => s.status === 'new').length
        }))
      })
      .catch(() => setStats((prev) => ({ ...prev, totalSubmissions: 0, newSubmissions: 0 })))

    api
      .adminListContactMessages({})
      .then((data) => {
        const msgs = data.messages || []
        setStats((prev) => ({
          ...prev,
          totalMessages: msgs.length,
          newMessages: msgs.filter((m) => m.status === 'new').length
        }))
      })
      .catch(() => setStats((prev) => ({ ...prev, totalMessages: 0, newMessages: 0 })))
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. WHAT NEEDS ATTENTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          to="/admin/courses"
          label="Academic Programs"
          value={stats.courses}
          subtext="Active in database"
          icon={BookOpen}
          tone="emerald"
          loading={stats.courses === null}
        />
        <StatCard
          to="/admin/submissions"
          label="Candidate Registrations"
          value={stats.newSubmissions != null ? `${stats.newSubmissions} New` : ' - '}
          subtext={`${stats.totalSubmissions || 0} total applications`}
          icon={Users}
          tone="blue"
          loading={stats.newSubmissions === null}
        />
        <StatCard
          to="/admin/contact-messages"
          label="Contact Inquiries"
          value={stats.newMessages != null ? `${stats.newMessages} New` : ' - '}
          subtext={`${stats.totalMessages || 0} total messages`}
          icon={Mail}
          tone="amber"
          loading={stats.newMessages === null}
        />
      </div>


      {/* 2. WEBSITE PAGES - one click to edit */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
            Website Pages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click a page below to edit its text and images directly. Changes go live as soon as you save.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pages === null
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[132px] rounded-2xl border border-slate-200/90 bg-white animate-pulse"
                />
              ))
            : pages.map((p) => {
                const publicPath = PATH_BY_PAGE[p.page]
                return (
                  <div
                    key={p.page}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{p.label}</h3>
                        <span
                          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.customized
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-slate-100 text-slate-500 border-slate-200/60'
                          }`}
                        >
                          {p.customized ? 'Customized' : 'Default'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 block mt-0.5 truncate">
                        {publicPath}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {publicPath && (
                        <a
                          href={publicPath}
                          target="_blank"
                          rel="noreferrer"
                          title="View live page"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        to={`/admin/pages/${p.page}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-[#020617] group-hover:bg-[#34E06E] text-white group-hover:text-black font-extrabold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <span>Edit</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
        </div>
      </section>


      {/* 3. COURSES - each course's page, application form and settings */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900">Course Pages</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit a course's page or application form right on the page. Settings holds price, dates and status.
            </p>
          </div>
          <Link to="/admin/courses" className="text-xs font-bold text-slate-700 hover:text-emerald-600">
            Manage courses →
          </Link>
        </div>
        {courses === null ? (
          <div className="h-[120px] rounded-2xl border border-slate-200/90 bg-white animate-pulse" />
        ) : (
          <CourseLinksGrid courses={courses} />
        )}
      </section>
    </div>
  )
}

export default AdminOverviewPage

