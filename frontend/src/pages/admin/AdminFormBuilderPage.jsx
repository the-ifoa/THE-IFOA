import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Plus, Trash2, ChevronDown, ArrowUp, ArrowDown, X, Check, ArrowLeft, RotateCcw, ExternalLink } from 'lucide-react'
import { api } from '@/lib/api'
import { AdminCourseTextEditor } from './AdminCourseTextEditor'

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Address' },
  { value: 'tel', label: 'Phone Number (with flag)' },
  { value: 'country', label: 'Country (with flag)' },
  { value: 'date', label: 'Date Picker' },
  { value: 'textarea', label: 'Long Text (Textarea)' },
  { value: 'select', label: 'Dropdown (Single choice)' },
  { value: 'radio', label: 'Radio Pills (Single choice)' },
  { value: 'checkbox', label: 'Checkbox (Yes/No toggle)' },
  { value: 'checkboxGroup', label: 'Checkbox Group (Multi-choice)' },
  { value: 'staticText', label: 'Notice / Info Text Block' },
  { value: 'intake', label: 'Course Intake (from course schedule)' }
]

const OPTION_TYPES = ['select', 'radio', 'checkboxGroup']

const slugifyField = (text) =>
  text
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
    .join('') || `field${Date.now()}`

const slugifySection = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `section-${Date.now()}`

function move(array, index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= array.length) return array
  const copy = [...array]
  ;[copy[index], copy[newIndex]] = [copy[newIndex], copy[index]]
  return copy.map((item, i) => ({ ...item, order: i }))
}

function IconBtn({ onClick, title, children, disabled, variant = 'default' }) {
  const variants = {
    default: 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300'
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex h-8 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {children}
    </button>
  )
}

function FieldEditor({ field, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, index }) {
  const set = (key) => (e) => onChange({ ...field, [key]: e.target.value })
  const setOptions = (raw) =>
    onChange({ ...field, options: raw.split(',').map((s) => s.trim()).filter(Boolean) })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3 hover:border-gray-300 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold text-gray-500">
            {index + 1}
          </span>
          <input
            type="text"
            value={field.label}
            onChange={set('label')}
            placeholder="Field Label (e.g. Passport Number)"
            className="flex-1 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm font-semibold text-rocket-dark focus:bg-white focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={field.type}
            onChange={set('type')}
            className="rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-ifoa-navy focus:bg-white focus:outline-none"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <IconBtn onClick={onMoveUp} title="Move up" disabled={!canMoveUp}>
              <ArrowUp className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={onMoveDown} title="Move down" disabled={!canMoveDown}>
              <ArrowDown className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={onDelete} title="Delete field" variant="danger">
              <X className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-500">id: {field.id}</span>
        {field.type !== 'staticText' && field.type !== 'intake' && (
          <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-gray-700">
            <input
              type="checkbox"
              checked={!!field.required}
              onChange={(e) => onChange({ ...field, required: e.target.checked })}
              className="h-4 w-4 rounded accent-ifoa-navy"
            />
            <span>Mandatory field</span>
          </label>
        )}
        {(field.visibleIf || field.requiredIf) && (
          <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] text-amber-700">
            has conditional rule
          </span>
        )}
      </div>

      {field.type !== 'staticText' && field.type !== 'checkbox' && field.type !== 'intake' && (
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={set('placeholder')}
          placeholder="Placeholder helper text…"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/15"
        />
      )}

      {OPTION_TYPES.includes(field.type) && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-900">
            Options (comma-separated)
          </label>
          <input
            type="text"
            value={(field.options || []).join(', ')}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="Option 1, Option 2, Option 3"
            className="w-full rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs text-rocket-dark focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>
      )}

      {field.type === 'staticText' && (
        <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
            Notice / policy content
          </label>
          <textarea
            value={field.content || ''}
            onChange={set('content')}
            rows={3}
            placeholder="Announcement, legal disclaimer or instructions…"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-rocket-dark focus:border-ifoa-navy focus:outline-none focus:ring-1 focus:ring-ifoa-navy/20"
          />
        </div>
      )}
    </div>
  )
}

function SectionEditor({ section, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown, index }) {
  const [open, setOpen] = useState(true)

  const updateField = (idx, newField) => {
    const fields = [...section.fields]
    fields[idx] = newField
    onChange({ ...section, fields })
  }
  const deleteField = (idx) => onChange({ ...section, fields: section.fields.filter((_, i) => i !== idx) })
  const moveField = (idx, dir) => onChange({ ...section, fields: move(section.fields, idx, dir) })
  const addField = () => {
    const label = 'New Field'
    onChange({
      ...section,
      fields: [
        ...section.fields,
        { id: slugifyField(`${label}${section.fields.length}`), label, type: 'text', required: false, order: section.fields.length }
      ]
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs">
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ifoa-navy text-xs font-extrabold text-black">
              {index + 1}
            </span>
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={section.title}
                onChange={(e) => onChange({ ...section, title: e.target.value })}
                placeholder="Section Title"
                className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-extrabold text-rocket-dark hover:border-gray-200 focus:border-ifoa-navy focus:bg-white focus:outline-none"
              />
              <input
                type="text"
                value={section.description || ''}
                onChange={(e) => onChange({ ...section, description: e.target.value })}
                placeholder="Section subtitle / instructions (optional)…"
                className="w-full rounded-md border border-transparent bg-transparent px-2 py-0.5 text-xs text-gray-500 hover:border-gray-200 focus:border-ifoa-navy focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-bold text-gray-500 mr-1">
              {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
            </span>
            <IconBtn onClick={() => setOpen(!open)} title={open ? 'Collapse' : 'Expand'}>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </IconBtn>
            <IconBtn onClick={onMoveUp} title="Move section up" disabled={!canMoveUp}>
              <ArrowUp className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={onMoveDown} title="Move section down" disabled={!canMoveDown}>
              <ArrowDown className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={onDelete} title="Delete section" variant="danger">
              <Trash2 className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>
      </div>

      {open && (
        <div className="bg-gray-50/40 p-5 space-y-4">
          <div className="space-y-3">
            {section.fields.map((field, idx) => (
              <FieldEditor
                key={field.id + idx}
                field={field}
                index={idx}
                onChange={(f) => updateField(idx, f)}
                onDelete={() => deleteField(idx)}
                onMoveUp={() => moveField(idx, -1)}
                onMoveDown={() => moveField(idx, 1)}
                canMoveUp={idx > 0}
                canMoveDown={idx < section.fields.length - 1}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addField}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-xs font-bold text-gray-600 hover:border-ifoa-navy hover:text-ifoa-navy transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add field to {section.title || 'section'}</span>
          </button>
        </div>
      )}
    </div>
  )
}

export function AdminFormBuilderPage() {
  const { id: courseId } = useParams()
  const isCourseMode = Boolean(courseId)

  const [sections, setSections] = useState(null)
  const [meta, setMeta] = useState({ course: null, usingTemplate: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      if (isCourseMode) {
        const data = await api.adminGetCourseForm(courseId)
        setSections(data.schema.sections)
        setMeta({ course: data.course, usingTemplate: data.usingTemplate })
      } else {
        const data = await api.adminGetFormTemplate()
        setSections(data.schema.sections)
        setMeta({ course: null, usingTemplate: false })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  // Course mode opens on the live application page (edit wording and images
  // in place); "Form structure" is the builder for fields, types and options.
  const [mode, setMode] = useState('page')
  const [pageDirty, setPageDirty] = useState(false)
  const switchMode = (next) => {
    if (next === mode) return
    if (mode === 'page' && pageDirty && !window.confirm('Discard unsaved changes on the page?')) return
    if (next === 'structure') load()
    setPageDirty(false)
    setMode(next)
  }
  const modeToggle = isCourseMode && (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1" role="tablist">
      {[
        ['page', 'Page view'],
        ['structure', 'Form structure']
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={mode === key}
          onClick={() => switchMode(key)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
            mode === key ? 'bg-[#020617] text-white' : 'text-gray-600 hover:text-rocket-dark'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  if (isCourseMode && mode === 'page') {
    return (
      <AdminCourseTextEditor
        initialTab="enroll"
        showTabs={false}
        heading="Enrollment Form"
        toolbar={modeToggle}
        onDirtyChange={setPageDirty}
      />
    )
  }

  if (loading || !sections) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin text-ifoa-navy" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading form builder…</p>
      </div>
    )
  }

  const updateSection = (idx, s) => setSections(sections.map((x, i) => (i === idx ? s : x)))
  const deleteSection = (idx) => {
    if (!window.confirm(`Delete section "${sections[idx].title}" and all its fields?`)) return
    setSections(sections.filter((_, i) => i !== idx))
  }
  const moveSection = (idx, dir) => setSections(move(sections, idx, dir))
  const addSection = () => {
    const title = 'New Section'
    setSections([
      ...sections,
      { id: slugifySection(`${title}-${sections.length}`), title, description: '', order: sections.length, fields: [] }
    ])
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = sections.map((s, i) => ({ ...s, order: i }))
      if (isCourseMode) {
        const data = await api.adminUpdateCourseForm(courseId, payload)
        setSections(data.schema.sections)
        setMeta((m) => ({ ...m, usingTemplate: false }))
        setMessage('Saved. This course now uses its own custom form.')
      } else {
        await api.adminUpdateFormTemplate(payload)
        setMessage('Template saved. New courses will start from this form.')
      }
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(Array.isArray(err.errors) ? err.errors.join(' ') : err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!window.confirm('Discard this course’s custom form and revert to the default template?')) return
    setSaving(true)
    setError('')
    try {
      const data = await api.adminResetCourseForm(courseId)
      setSections(data.schema.sections)
      setMeta((m) => ({ ...m, usingTemplate: true }))
      setMessage('Reverted to the default template.')
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          {isCourseMode ? (
            <Link
              to={`/admin/courses/${courseId}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rocket-dark uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to course
            </Link>
          ) : (
            <Link
              to="/admin/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rocket-dark uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Courses
            </Link>
          )}
          <h1 className="text-xl sm:text-2xl font-black text-rocket-dark mt-1">
            {isCourseMode ? 'Enrollment Form' : 'Default Form Template'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isCourseMode ? (
              <>
                {meta.course?.title}
                {' - '}
                {meta.usingTemplate ? (
                  <span className="text-amber-600 font-semibold">currently using the default template</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">custom form for this course</span>
                )}
              </>
            ) : (
              'The starting point every new course clones. Editing this does not change existing courses.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {modeToggle}
          {isCourseMode && meta.course?.slug && (
            <a
              href={`/courses/${meta.course.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border border-gray-300 text-rocket-dark font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> View
            </a>
          )}
          {isCourseMode && !meta.usingTemplate && (
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
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-rocket-lime" /> : <Check className="w-4 h-4 text-rocket-lime" />}
            <span>{saving ? 'Saving…' : 'Save Form'}</span>
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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">{error}</div>
      )}

      <div className="space-y-5">
        {sections.map((section, idx) => (
          <SectionEditor
            key={section.id + idx}
            section={section}
            index={idx}
            onChange={(s) => updateSection(idx, s)}
            onDelete={() => deleteSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
            canMoveUp={idx > 0}
            canMoveDown={idx < sections.length - 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-bold text-gray-600 hover:border-ifoa-navy hover:text-ifoa-navy transition-all"
      >
        <Plus className="h-5 w-5" />
        <span>Add new section</span>
      </button>
    </div>
  )
}

export default AdminFormBuilderPage
