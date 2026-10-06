import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'

// True inline editing for admin page content: the admin's live-preview iframe
// (?__preview=1, see usePageContent) renders the exact public page, and text
// wrapped in <CmsText> becomes directly contentEditable there. Edits post up
// to the parent admin tab (AdminPageEditorPage), which updates its `data`
// state and echoes it back down through the existing preview channel - same
// round trip the live-preview already used, just now driven from inside the
// iframe instead of a separate form.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function isPreviewEditMode() {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('__preview') === '1'
}

const debounceTimers = {}

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function postEdit(path, value) {
  window.parent.postMessage({ type: 'ifoa-edit-change', path, value }, window.location.origin)
}

function debouncedPostEdit(path, value) {
  clearTimeout(debounceTimers[path])
  debounceTimers[path] = setTimeout(() => postEdit(path, value), 150)
}

// Plural "OCCs" must keep its lowercase "s" even inside uppercase-styled
// labels (eyebrows, badges), where CSS would otherwise render "OCCS".
function keepOccsCase(value) {
  if (typeof value !== 'string' || !value.includes('OCCs')) return value
  return value.split(/(OCCs)/).map((part, i) =>
    part === 'OCCs' ? (
      <span key={i} className="normal-case">
        OCCs
      </span>
    ) : (
      part
    )
  )
}

// Renders `value` as plain text on the real public site. Inside the admin
// preview iframe, renders the same text as an editable region in place - // no separate form field anywhere.
export function CmsText({ path, value, as: Tag = 'span', className = '' }) {
  const ref = useRef(null)
  const editing = isPreviewEditMode()

  useEffect(() => {
    if (!editing) return
    const el = ref.current
    if (!el) return
    // Only overwrite the DOM text when the field isn't focused, so the
    // round-tripped echo doesn't fight the admin's cursor mid-keystroke.
    if (document.activeElement !== el && el.innerText !== (value || '')) {
      el.innerText = value || ''
    }
  }, [value, editing])

  if (!editing) {
    return <Tag className={className}>{keepOccsCase(value)}</Tag>
  }

  return (
    <Tag
      ref={ref}
      className={`${className} ifoa-cms-editable`}
      contentEditable
      suppressContentEditableWarning
      data-cms-path={path}
      // Many editable fields sit inside a button/Link whose own click
      // navigates somewhere (e.g. a CTA's label) - swallow the click here so
      // starting to edit never fires that navigation from inside the admin
      // preview iframe.
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onInput={(e) => debouncedPostEdit(path, e.currentTarget.innerText)}
      onBlur={(e) => postEdit(path, e.currentTarget.innerText)}
    />
  )
}

// Small "×" control shown over a list item (discipline card, pathway card,
// pillar, etc.) in edit mode only - removes that item from the array at
// `listPath` via the same postMessage channel as CmsText.
export function CmsRemoveItem({ listPath, index, label = 'Remove' }) {
  if (!isPreviewEditMode()) return null
  return (
    <button
      type="button"
      title={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        window.parent.postMessage({ type: 'ifoa-edit-remove', path: listPath, index }, window.location.origin)
      }}
      className="ifoa-cms-remove absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-colors cursor-pointer"
    >
      ×
    </button>
  )
}

// "+ Add" ghost tile appended after a list's rendered items in edit mode - // appends a blank item (shape given by `blank`) to the array at `listPath`.
export function CmsAddItem({ listPath, blank, label = 'Add' }) {
  if (!isPreviewEditMode()) return null
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        window.parent.postMessage({ type: 'ifoa-edit-add', path: listPath, blank }, window.location.origin)
      }}
      className="ifoa-cms-add flex min-h-[160px] w-full items-center justify-center rounded-3xl border-2 border-dashed border-emerald-400 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition-colors cursor-pointer"
    >
      + {label}
    </button>
  )
}

// "Replace image" control shown over an image in edit mode only. Uploads the
// picked file to Cloudflare R2 from inside the preview iframe (same origin, so
// the admin session cookie applies) and posts the { url, key, alt } result to
// `path` through the same channel as CmsText. Place it inside a positioned
// container that sits above the image; the editor's Save persists it, and
// the backend drops the old R2 object once nothing references it.
// `multiple` uploads several files and posts them as an array (logo rows).
// `onUploaded` takes the result instead of posting it to `path` (for callers
// that rebuild a whole list, e.g. replacing one logo in a row).
export function CmsImageButton({
  path,
  folder = 'pages',
  className = 'top-3 right-3',
  multiple = false,
  label = 'Replace image',
  onUploaded
}) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!isPreviewEditMode()) return null

  async function handleFile(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setBusy(true)
    setError('')
    try {
      const { images } = await api.adminUpload(multiple ? files : [files[0]], folder)
      const uploaded = images.map((img) => ({ ...img, alt: img.alt || '' }))
      const result = multiple ? uploaded : uploaded[0]
      if (onUploaded) onUploaded(result)
      else postEdit(path, result)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div
      className={`ifoa-cms-image absolute z-30 flex flex-col items-end gap-1 ${className}`}
      onClick={(e) => {
        e.stopPropagation()
        // The file input's own click bubbles here too; cancelling it would
        // stop the browser opening the file picker.
        if (e.target !== inputRef.current) e.preventDefault()
      }}
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-[11px] font-bold text-white shadow-md ring-1 ring-white/20 hover:bg-black disabled:opacity-60 cursor-pointer"
      >
        {busy ? 'Uploading…' : label}
      </button>
      {error && <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple={multiple}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
