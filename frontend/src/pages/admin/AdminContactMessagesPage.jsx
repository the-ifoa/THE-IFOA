import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2,
  Mail,
  Clock,
  Phone,
  CheckCircle2,
  Search,
  Trash2,
  ChevronRight,
  RotateCcw,
  X,
  User,
  Building2,
  Inbox
} from 'lucide-react'
import { api } from '@/lib/api'

const STATUSES = ['new', 'contacted', 'closed']

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
    hint: 'In discussion'
  },
  closed: {
    label: 'Closed',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500',
    tone: 'text-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    hint: 'Resolved'
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

function getInitials(first = '', last = '') {
  const f = first.trim()[0] || ''
  const l = last.trim()[0] || ''
  return (f + l).toUpperCase() || 'U'
}

export function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    api
      .adminListContactMessages({ status, q })
      .then((d) => setMessages(d.messages || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function handleDelete(m) {
    const name = `${m.firstName} ${m.lastName}`
    if (!window.confirm(`Delete message from "${name}"? This cannot be undone.`)) return
    setBusyId(m._id)
    try {
      await api.adminDeleteContactMessage(m._id)
      setMessages((prev) => prev.filter((x) => x._id !== m._id))
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const counts = useMemo(() => {
    const c = { new: 0, contacted: 0, closed: 0 }
    for (const m of messages) {
      if (c[m.status] !== undefined) c[m.status] += 1
    }
    return c
  }, [messages])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Inquiries"
          value={messages.length}
          hint="All recorded messages"
          icon={Mail}
          toneClass="text-slate-900"
          iconStyle="bg-purple-50 text-purple-600 border-purple-100"
          isActive={status === 'all'}
          onClick={() => setStatus('all')}
        />
        <StatCard
          label="New / Unread"
          value={counts.new}
          hint="Awaiting response"
          icon={Clock}
          toneClass="text-blue-600"
          iconStyle="bg-blue-50 text-blue-600 border-blue-100"
          isActive={status === 'new'}
          onClick={() => setStatus('new')}
        />
        <StatCard
          label="Contacted"
          value={counts.contacted}
          hint="In communication"
          icon={Phone}
          toneClass="text-amber-600"
          iconStyle="bg-amber-50 text-amber-600 border-amber-100"
          isActive={status === 'contacted'}
          onClick={() => setStatus('contacted')}
        />
        <StatCard
          label="Resolved / Closed"
          value={counts.closed}
          hint="Completed inquiries"
          icon={CheckCircle2}
          toneClass="text-emerald-600"
          iconStyle="bg-emerald-50 text-emerald-600 border-emerald-100"
          isActive={status === 'closed'}
          onClick={() => setStatus('closed')}
        />
      </div>

      {/* 2. UNIFIED SEARCH & FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar */}
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
              placeholder="Search by sender name, email, topic, or message…"
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

        {/* Status Filter Tabs & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-slate-100/90 p-1 rounded-xl">
            {['all', ...STATUSES].map((s) => {
              const isSelected = status === s
              const count = s === 'all' ? messages.length : counts[s] || 0
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

          <button
            type="button"
            onClick={load}
            title="Refresh Inquiries"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

      {/* 3. MESSAGES TABLE / LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <p className="text-sm font-bold text-slate-800">Loading inquiries…</p>
          <p className="text-xs text-slate-400">Fetching messages from prospective candidates &amp; operators</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-dashed border-slate-300 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-base font-bold text-slate-900">No contact messages found</p>
            <p className="text-xs text-slate-500">
              {q || status !== 'all'
                ? 'Try adjusting your search criteria or filter to see messages.'
                : 'Enquiries submitted through the public contact form appear here.'}
            </p>
          </div>
          {(q || status !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setQ('')
                setStatus('all')
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Sender / Contact</th>
                  <th className="px-5 py-4">Topic &amp; Audience</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Received</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {messages.map((m) => {
                  const initials = getInitials(m.firstName, m.lastName)
                  const cfg = STATUS_CONFIG[m.status] || STATUS_CONFIG.new

                  return (
                    <tr
                      key={m._id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Sender */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 text-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/contact-messages/${m._id}`}
                              className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors block truncate"
                            >
                              {m.firstName} {m.lastName}
                            </Link>
                            <a
                              href={`mailto:${m.email}`}
                              className="text-xs text-slate-500 hover:text-slate-800 transition-colors truncate block"
                            >
                              {m.email}
                            </a>
                            {m.phone && (
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {m.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Topic & Audience */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 block">
                            {m.topic || 'General Inquiry'}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {m.audience && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70">
                                {m.audience === 'operator' ? (
                                  <>
                                    <Building2 className="w-3 h-3 text-slate-400" />
                                    <span>Operator</span>
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 text-slate-400" />
                                    <span>Individual</span>
                                  </>
                                )}
                              </span>
                            )}
                            {m.organization && (
                              <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                {m.organization}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className="capitalize">{cfg.label}</span>
                        </span>
                      </td>

                      {/* Received Date */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-semibold text-slate-700">
                          {new Date(m.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDelete(m)}
                            disabled={busyId === m._id}
                            title="Delete message"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/contact-messages/${m._id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-[#34E06E] text-white hover:text-slate-950 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs group-hover:shadow-xs"
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
              Showing <strong className="text-slate-800">{messages.length}</strong> inquiries
            </span>
            <span className="text-[11px] text-slate-400">IFOA Communications CRM</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContactMessagesPage

