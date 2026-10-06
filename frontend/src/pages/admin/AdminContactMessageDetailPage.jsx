import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Trash2, Check, Mail, Building2 } from 'lucide-react'
import { api } from '@/lib/api'

const STATUSES = ['new', 'contacted', 'closed']

export function AdminContactMessageDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [message, setMessage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    return api.adminGetContactMessage(id).then(({ contactMessage }) => setMessage(contactMessage))
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (error && !message) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error} - <Link to="/admin/contact-messages" className="underline font-semibold">back to contact messages</Link>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-ifoa-navy" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading message…</p>
      </div>
    )
  }

  const name = `${message.firstName} ${message.lastName}`

  async function patch(body, successMsg) {
    setSaving(true)
    setError('')
    setMsg('')
    try {
      const { contactMessage: updated } = await api.adminUpdateContactMessage(id, body)
      setMessage(updated)
      if (successMsg) {
        setMsg(successMsg)
        setTimeout(() => setMsg(''), 4000)
      }
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete this message from "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.adminDeleteContactMessage(id)
      navigate('/admin/contact-messages')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/admin/contact-messages" className="hover:text-ifoa-navy hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Contact Messages
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
              {message.audience && (
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {message.audience === 'operator' ? 'An operator' : 'An individual'}
                </span>
              )}
              {message.topic && (
                <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-ifoa-navy">
                  Topic: {message.topic}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-rocket-dark">{name}</h1>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <a href={`mailto:${message.email}`} className="hover:underline">{message.email}</a>
              {message.organization && (
                <>
                  <span>·</span>
                  <Building2 className="h-3.5 w-3.5 text-gray-400" /> {message.organization}
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              received {new Date(message.createdAt).toLocaleString('en-US')}
              {message.office ? ` · ${message.office}` : ''}
              {message.location ? ` · Training location: ${message.location}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={`mailto:${message.email}?subject=Regarding your inquiry with IFOA`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#020617] hover:bg-[#34E06E] text-white hover:text-black px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Mail className="h-3.5 w-3.5" /> <span>Reply by Email</span>
            </a>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
            >
              <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-5 pt-5 border-t border-slate-100 grid sm:grid-cols-[200px_1fr] gap-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Status</label>
            <select
              value={message.status}
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
              defaultValue={message.adminNotes}
              onBlur={(e) => {
                if (e.target.value !== message.adminNotes) patch({ adminNotes: e.target.value }, 'Notes saved.')
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

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Message Body</label>
        <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-medium bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          {message.message}
        </p>
      </div>
    </div>
  )
}

export default AdminContactMessageDetailPage

