import { useEffect, useMemo, useState } from 'react'
import {
  RiCheckboxCircleFill,
  RiLoader4Line,
  RiDownload2Line,
  RiAlertFill
} from 'react-icons/ri'
import { api } from '@/lib/api'
import { DynamicSection } from '@/components/formEngine/DynamicSection'
import {
  buildEmptyAnswers,
  isSectionComplete,
  isTrackableSection,
  getDetailedValidationErrors
} from '@/components/formEngine/formSchema'
import { downloadEnrollmentPdf } from '@/pdf/generateEnrollmentPdf'

// `liveSections` is the admin editor's in-progress form (preview iframe only):
// it replaces the saved sections and tags each section/field with its path in
// that array, so their wording renders click-to-edit. `text` holds the
// header/submit wording (strings, or editable nodes in the admin preview).
export function RegistrationForm({ slug, courseTitle, onAnswersChange, locationPrices = [], liveSections, text = {} }) {
  const [savedSections, setSections] = useState(null)
  const sections = useMemo(() => {
    if (!Array.isArray(liveSections)) return savedSections
    return liveSections
      .map((s, i) => ({ ...s, _path: `form.${i}`, fields: (s.fields || []).map((f, j) => ({ ...f, _path: `form.${i}.fields.${j}` })) }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [liveSections, savedSections])
  const [formAvailable, setFormAvailable] = useState(true)
  const [course, setCourse] = useState(null)
  const [answers, setAnswers] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [errors, setErrors] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [done, setDone] = useState(null) // submission id
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    api
      .getCourseForm(slug)
      .then((data) => {
        if (cancelled) return
        const sorted = [...(data.sections || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setFormAvailable(data.formAvailable !== false && sorted.length > 0)
        setSections(sorted)
        setCourse(data.course)
        setAnswers(buildEmptyAnswers(sorted))
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err.message)
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug])

  const intakes = course?.intakes || []

  // The "Selected Training Program" box shows the price for the chosen
  // training location when the course has one (e.g. India in INR).
  const trainingCountry = answers?.intake?.trainingCountry
  const displaySections = useMemo(() => {
    const lp = locationPrices.find((p) => p.location === trainingCountry)
    if (!lp) return sections
    const priceText = `${Number(lp.amount).toLocaleString('en-IN')} ${lp.currency}`
    return sections.map((s) => ({
      ...s,
      fields: s.fields.map((f) =>
        f.id === 'programInfo' && f.content
          ? {
              ...f,
              content: f.content.replace(/^(.*?),\s*[\d.,]+\s*[A-Z]{2,4}(\s*)$/m, `$1, ${priceText}$2`)
            }
          : f
      )
    }))
  }, [sections, locationPrices, trainingCountry])

  // Lets the page react to answers (e.g. price by training location).
  useEffect(() => {
    onAnswersChange?.(answers)
  }, [answers, onAnswersChange])

  function updateSection(sectionId, sectionAnswers) {
    setAnswers((prev) => ({ ...prev, [sectionId]: sectionAnswers }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${sectionId}.`)) delete next[key]
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Admin editor preview: never send a real application.
    if (liveSections) return
    const detailed = getDetailedValidationErrors(sections, answers)

    // Require an intake choice only when the course offers intakes.
    if (intakes.length > 0) {
      for (const section of sections) {
        const f = section.fields.find((x) => x.type === 'intake' && x.required)
        if (f && !answers[section.id]?.[f.id]) {
          detailed.unshift({
            sectionId: section.id,
            fieldId: f.id,
            label: f.label || 'Intake',
            message: `${section.title}: ${f.label || 'Intake'} is required.`
          })
        }
      }
    }

    if (detailed.length > 0) {
      const map = {}
      detailed.forEach((err) => {
        const msg = err.fieldMessage || `${err.label} is required`
        map[`${err.sectionId}.${err.fieldId}`] = msg
        map[err.fieldId] = msg
      })
      setFieldErrors(map)
      setErrors(detailed.map((d) => d.message))
      const first = detailed[0]
      const target =
        document.getElementById(first.fieldId) ||
        document.getElementById(`field-wrap-${first.fieldId}`) ||
        document.getElementById(`section-${first.sectionId}`)
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setFieldErrors({})
    setErrors([])
    setSubmitError('')
    setSubmitting(true)
    try {
      const data = await api.submitCourseForm(slug, answers)
      setDone(data.submissionId || data.id)
      window.scrollTo({
        top: (document.getElementById('register')?.offsetTop || 0) - 80,
        behavior: 'smooth'
      })
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length) {
        setErrors(err.errors)
      } else {
        setSubmitError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDownloadPdf() {
    if (!done) return
    setPdfBusy(true)
    setSubmitError('')
    try {
      const { submission } = await api.getSubmission(done)
      await downloadEnrollmentPdf(submission, `IFOA-Enrollment-${done}.pdf`)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setPdfBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center flex flex-col items-center gap-3">
        <RiLoader4Line className="w-7 h-7 animate-spin text-rocket-dark" />
        <p className="text-sm font-medium text-gray-500">Loading enrollment form…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-2">
        <RiAlertFill className="w-8 h-8 mx-auto text-red-500" />
        <p className="text-sm font-semibold text-red-700">Could not load the enrollment form</p>
        <p className="text-xs text-red-600">{loadError}</p>
      </div>
    )
  }

  if (!formAvailable || (course && course.registrationOpen === false)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-2">
        <RiAlertFill className="w-8 h-8 mx-auto text-amber-500" />
        <p className="text-base font-bold text-amber-900">Registration is not open yet</p>
        <p className="text-sm text-amber-700">
          The application form for this program has not been published. Contact{' '}
          <a className="underline font-semibold" href="mailto:info@theifoa.com">info@theifoa.com</a> to be
          notified when the next intake opens.
        </p>
      </div>
    )
  }

  if (done) {
    const steps = [
      { title: 'Download your application', text: 'Your completed form as a PDF.' },
      {
        title: 'Sign and send it',
        text: (
          <>
            Email the signed copy with two copies of your passport or photo ID to{' '}
            <a className="font-semibold text-slate-900 underline underline-offset-2 hover:text-[#16a952]" href="mailto:info@theifoa.com">
              info@theifoa.com
            </a>
            .
          </>
        )
      },
      { title: 'We confirm your place', text: 'Admissions checks your application and sends your place offer and invoice.' }
    ]
    return (
      <div className="rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_16px_48px_rgba(15,23,42,0.06)] p-7 sm:p-10 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
          <span className="w-11 h-11 rounded-full bg-[#34E06E]/15 text-[#16a952] flex items-center justify-center shrink-0">
            <RiCheckboxCircleFill className="w-6 h-6" />
          </span>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">Application received</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Thank you. Your application{courseTitle ? ` for ${courseTitle}` : ''} has been sent to our admissions team.
            </p>
          </div>
        </div>

        {/* Next steps */}
        <div className="py-6 space-y-4">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Next steps</span>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="w-7 h-7 rounded-md bg-slate-950 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <strong className="block text-sm font-bold text-slate-950">{step.title}</strong>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Action + reference */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-60 cursor-pointer"
          >
            {pdfBusy ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiDownload2Line className="w-4 h-4" />}
            <span>{pdfBusy ? 'Preparing PDF…' : 'Download application (PDF)'}</span>
          </button>
          <div className="text-xs text-slate-500">
            Reference <span className="font-mono font-semibold text-slate-800 break-all">{done}</span>
          </div>
        </div>
        {submitError && (
          <p className="mt-4 text-xs font-medium text-red-600">
            Could not create the PDF ({submitError}). Please try again, or email info@theifoa.com with your reference.
          </p>
        )}
      </div>
    )
  }

  const trackable = sections.filter((s) => isTrackableSection(s))
  const completed = trackable.filter((s) => isSectionComplete(s, answers[s.id])).length

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[2rem] border border-slate-200/90 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)] bg-white"
    >
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-6 sm:px-8 py-6 sm:py-7 text-white border-b border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#34E06E] inline-block">
              {text.eyebrow || 'Candidate Registration Form'}
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {text.title || courseTitle || 'Flight Operations & Dispatch Program'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {text.instructions || 'Please complete all required fields marked with an asterisk'} (<span className="text-red-400 font-bold">*</span>)
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8 bg-white">
        {errors.length > 0 && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-4.5">
            <p className="text-sm font-bold text-red-900">
              Please complete all required fields ({errors.length}):
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs font-medium text-red-700">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          {displaySections.map((section, idx) => (
            <DynamicSection
              key={section.id}
              section={section}
              stepNumber={idx + 1}
              intakes={intakes}
              value={answers[section.id]}
              fieldErrors={fieldErrors}
              onChange={(sa) => updateSection(section.id, sa)}
            />
          ))}
        </div>

        {submitError && (
          <p className="mt-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {submitError}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-500 font-medium">
            {trackable.length > 0
              ? `${completed} of ${trackable.length} sections complete • Encrypted & Confidential`
              : 'Encrypted & Confidential'}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(52,224,110,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition transform hover:-translate-y-0.5"
          >
            {submitting && <RiLoader4Line className="w-4 h-4 animate-spin" />}
            {submitting ? 'Submitting Application…' : text.submitLabel || 'Submit Application Now'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default RegistrationForm
