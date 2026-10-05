import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { api } from '@/lib/api'

/**
 * Uploads straight to Cloudflare R2 via the admin API and hands back
 * { url, key, alt } objects. `multiple` switches between a single image and
 * a list (used for the Training Standards logo row).
 */
export function ImageUploader({ label, value, onChange, multiple = false, folder = 'courses' }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const images = multiple ? value || [] : value ? [value] : []

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setBusy(true)
    setError('')
    try {
      const data = await api.adminUpload(multiple ? files : [files[0]], folder)
      const uploaded = data.images.map((img) => ({ ...img, alt: '' }))
      onChange(multiple ? [...images, ...uploaded] : uploaded[0])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(image) {
    // Best effort - a failed R2 delete must not block the edit.
    if (image.key) api.adminDeleteUpload(image.key).catch(() => {})
    onChange(multiple ? images.filter((img) => img.url !== image.url) : null)
  }

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-bold text-rocket-dark block">{label}</span>}

      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div
            key={image.url}
            className="relative w-32 h-24 rounded-lg border border-black/15 bg-gray-50 flex items-center justify-center overflow-hidden group"
          >
            <img src={image.url} alt={image.alt || ''} className="max-w-full max-h-full object-contain" />
            <button
              type="button"
              onClick={() => handleRemove(image)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="w-32 h-24 rounded-lg border-2 border-dashed border-black/20 text-gray-500 hover:border-rocket-dark hover:text-rocket-dark flex flex-col items-center justify-center gap-1 text-xs transition disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple={multiple}
        onChange={handleFiles}
        className="hidden"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">PNG, JPG, WEBP, GIF or SVG. Max 8 MB.</p>
    </div>
  )
}

export default ImageUploader
