import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2,
  Check,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  RefreshCw,
  MousePointerClick
} from 'lucide-react'
import { api } from '@/lib/api'
import { PATH_BY_PAGE } from './pagesMeta'
import { clone, getAtPath, setAtPath } from '@/lib/objectPath'


// The iframe renders the real public page (?__preview=1) with its text
// wrapped in <CmsText> (see components/admin/CmsEditable.jsx), which becomes
// directly contentEditable there. Edits post up here as ifoa-edit-* messages;
// this component is the only place that owns `data`, and it echoes the
// updated state back down through the same channel the old split-preview
// used - so what's on screen in the iframe IS the save target, not a copy.
export function EditablePreview({ page, data, onEditChange, onEditAdd, onEditRemove, path }) {
  const iframeRef = useRef(null)
  const debounceRef = useRef(null)
  const [iframeKey, setIframeKey] = useState(0)
  const previewPath = path || PATH_BY_PAGE[page]

  const sendContent = () => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'ifoa-preview-content', page, data },
      window.location.origin
    )
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(sendContent, 200)
    return () => clearTimeout(debounceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, iframeKey])

  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const msg = event.data
      if (!msg) return
      if (msg.type === 'ifoa-preview-ready' && msg.page === page) sendContent()
      else if (msg.type === 'ifoa-edit-change') onEditChange(msg.path, msg.value)
      else if (msg.type === 'ifoa-edit-add') onEditAdd(msg.path, msg.blank)
      else if (msg.type === 'ifoa-edit-remove') onEditRemove(msg.path, msg.index)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, data])

  if (!previewPath) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-xs font-semibold text-gray-500">
        No live editor for shared template pages. Use the per-course "Edit Page Text" link below instead.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-[#020617] shadow-xs">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#34E06E]">
          <MousePointerClick className="h-3.5 w-3.5" /> Click any text below to edit it directly
        </span>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          title="Refresh preview"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>
      <div className="border-t border-white/5 bg-slate-900 p-1.5">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={`${previewPath}?__preview=1`}
            title="Editable page preview"
            className="h-[calc(100vh-13rem)] min-h-[560px] w-full"
            onLoad={sendContent}
          />
        </div>
      </div>
    </div>
  )
}

export function AdminPageEditorPage() {
  const { page } = useParams()

  const [data, setData] = useState(null)
  const [customized, setCustomized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await api.adminGetPage(page)
      setData(res.data)
      setCustomized(res.customized)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleEditChange = (path, value) =>
    setData((prev) => {
      const next = clone(prev)
      setAtPath(next, path, value)
      return next
    })

  const handleEditAdd = (path, blank) =>
    setData((prev) => {
      const next = clone(prev)
      const arr = getAtPath(next, path)
      if (Array.isArray(arr)) arr.push(clone(blank))
      return next
    })

  const handleEditRemove = (path, index) =>
    setData((prev) => {
      const next = clone(prev)
      const arr = getAtPath(next, path)
      if (Array.isArray(arr)) arr.splice(index, 1)
      return next
    })

  async function handleSave() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.adminUpdatePage(page, data)
      setCustomized(true)
      setMessage('Saved. The public page now shows this content.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!window.confirm('Discard all edits and revert this page to the default content?')) return
    setSaving(true)
    setError('')
    try {
      const res = await api.adminResetPage(page)
      setData(res.data)
      setCustomized(false)
      setMessage('Reverted to default content.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) {
    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 max-w-3xl mx-auto">
          {error}
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-ifoa-navy" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading page content…</p>
      </div>
    )
  }

  const label = page.charAt(0).toUpperCase() + page.slice(1)

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rocket-dark uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-rocket-dark mt-1">{label} page content</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {customized ? (
              <span className="text-emerald-600 font-semibold">Custom content is live</span>
            ) : (
              <span className="text-amber-600 font-semibold">Currently showing default content</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {PATH_BY_PAGE[page] && (
            <a
              href={PATH_BY_PAGE[page]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border border-gray-300 text-rocket-dark font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View
            </a>
          )}
          {customized && (
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 border border-amber-300 text-amber-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-amber-50 disabled:opacity-60 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#020617] text-white hover:bg-black font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-rocket-lime" />
            ) : (
              <Check className="w-4 h-4 text-rocket-lime" />
            )}
            <span>{saving ? 'Saving…' : 'Save Content'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <EditablePreview
        page={page}
        data={data}
        onEditChange={handleEditChange}
        onEditAdd={handleEditAdd}
        onEditRemove={handleEditRemove}
      />

    </div>
  )
}

export default AdminPageEditorPage
