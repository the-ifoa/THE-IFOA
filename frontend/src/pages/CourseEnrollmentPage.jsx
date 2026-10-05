import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiMapPin2Line,
  RiWhatsappFill,
  RiLoader4Line
} from 'react-icons/ri'
import { TbClockHour4, TbCertificate } from 'react-icons/tb'

import { api } from '@/lib/api'
import RegistrationForm from '@/components/course/RegistrationForm'
import { Seo } from '@/components/common/Seo'
import { mergeContent } from '@/hooks/usePageContent'
import { useCoursePreview } from '@/components/course/CourseOverview'
import { CmsText, CmsImageButton, postEdit } from '@/components/admin/CmsEditable'
import { useGoBack } from '@/hooks/useGoBack'
import { programmeBanner } from '@/components/course/CourseCard'

// Standards Logos
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'
import logoIcao from '@/assets/shared/standards-logos/logo-icao.webp'
import logoDgca from '@/assets/shared/standards-logos/logo-dgca.webp'
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'
// Standard logos are stored by name ("std:easa") so a saved row survives
// rebuilds that change the bundled file URLs.
const STANDARD_LOGOS = {
  easa: { src: logoEasa, alt: 'EASA' },
  icao: { src: logoIcao, alt: 'ICAO' },
  dgca: { src: logoDgca, alt: 'DGCA' },
  faa: { src: logoFaa, alt: 'FAA' }
}
const logoSrc = (url = '') => (url.startsWith('std:') ? STANDARD_LOGOS[url.slice(4)]?.src : url)
import bannerCourseHero from '@/assets/shared/course-media/easa-hero.webp'

// Static chrome the enrollment flow ships with, same for every course;
// editable at /admin/pages/courseEnrollment. Course-specific fields (title,
// price, dates, location, image, etc.) come from the courses API instead.
const FALLBACK = {
  breadcrumb: {
    eventsLabel: 'Events & Programs',
    enrollLabel: 'Online Enrollment'
  },
  header: {
    eyebrow: 'Application form',
    intro:
      'Complete the form below. We check your application against the entry requirements, then send you a place offer with payment and joining details.',
    backLabel: 'Back'
  },
  sidebar: {
    badgeLabel: 'Official Intake',
    tuitionLabel: 'Course Tuition',
    durationLabel: 'Duration',
    intakeLabel: 'Next Intake',
    locationLabel: 'Location',
    credentialLabel: 'Credential',
    credentialValue: 'IFOA Flight Dispatch Cert',
    accreditationLabel: 'Regulatory Framework'
  },
  form: {
    eyebrow: 'Candidate Registration Form',
    instructions: 'Please complete all required fields marked with an asterisk',
    submitLabel: 'Submit Application Now'
  },
  support: {
    title: 'Need Admissions Assistance?',
    desc: 'Have questions regarding eligibility, visa letters, or payment schedules?',
    ctaLabel: 'Chat with Admissions on WhatsApp'
  },
  states: {
    loadingText: 'Loading Official Application Portal…',
    notFoundTitle: 'Application Portal Not Found',
    notFoundCtaLabel: 'View All Open Programs'
  }
}

export function CourseEnrollmentPage() {
  const { slug: paramSlug } = useParams()
  // Back returns to the previous page; opened directly, it goes to the course.
  const goBack = useGoBack(`/courses/${paramSlug}`)

  const activeSlug = paramSlug || ''

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Chrome text comes from this course's own override (merged onto
  // DEFAULTS.courseEnrollment server-side), delivered on `course.content` in
  // the same request that fetched the course. FALLBACK covers the moment
  // before the course has loaded.
  const liveCourse = useCoursePreview(course)
  // Uploaded course image (live from the admin editor while editing).
  const cardImageUrl = liveCourse?.courseMedia ? liveCourse.courseMedia.cardImage?.url : course?.card?.image?.url
  const c = mergeContent(FALLBACK, liveCourse?.courseEnrollment || course?.content?.courseEnrollment || {})
  // Page text: plain strings on the site, click-to-edit in the admin editor.
  const T = (group, key) =>
    liveCourse ? <CmsText path={`courseEnrollment.${group}.${key}`} value={c[group]?.[key]} /> : c[group]?.[key]
  // Wording stored on the course itself (title, duration...), shared with the
  // course page. Click-to-edit in the admin editor when the course has it.
  const CF = (key, fallback) => {
    const live = liveCourse?.course?.[key]
    if (typeof live === 'string') return <CmsText path={`course.${key}`} value={live} />
    const value = course?.[key]
    return (typeof value === 'string' ? value.replace(/[\u2013\u2014]/g, '-') : value) || fallback
  }
  // Regulatory logos uploaded for this course; empty = the standard set.
  const customLogos = (liveCourse?.courseMedia ? liveCourse.courseMedia.logos : course?.trainingStandards?.logos) || []
  // Admin preview: edits rebuild the whole row (standard logos included) so
  // one logo can be replaced or removed on its own.
  const setLogos = (logos) => postEdit('courseMedia.logos', logos)
  // Admin preview: tuition and intake date, edited in place (see AdminCourseTextEditor).
  const facts = liveCourse?.courseFacts || null

  useEffect(() => {
    if (!activeSlug) return
    let cancelled = false
    setLoading(true)
    setError('')

    api
      .getCourse(activeSlug)
      .then((data) => {
        if (!cancelled) setCourse(data.course)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Course could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeSlug])

  // Tuition follows the training location chosen in the form, when the course
  // has a price for that location (e.g. India in INR).
  const [trainingLocation, setTrainingLocation] = useState('')
  const handleAnswersChange = useCallback((answers) => {
    setTrainingLocation(answers?.intake?.trainingCountry || '')
  }, [])
  const locationPrice = (course?.locationPrices || []).find((p) => p.location === trainingLocation)
  const activePrice = locationPrice ? { amount: locationPrice.amount, currency: locationPrice.currency } : course?.price

  // "India (New Delhi)" -> "New Delhi, India"; "United States (Daytona Beach,
  // Florida)" -> "Daytona Beach, Florida"; "Europe (city to be confirmed)" -> "Europe".
  const locationLabel = (option) => {
    const m = /^(.*?)\s*\((.*)\)$/.exec(option || '')
    if (!m) return option
    const [country, inner] = [m[1].trim(), m[2]]
    const [city, region] = inner.split(',').map((s) => s.trim())
    if (/to be confirmed/i.test(inner)) return country
    return region && region !== 'Europe' ? `${city}, ${region}` : `${city}, ${country}`
  }
  const activeLocation = trainingLocation ? locationLabel(trainingLocation) : course?.location

  const formatPrice = (price) => {
    if (!price || price.amount == null) return 'Contact Admissions'
    if (price.currency === 'INR') {
      return `₹${price.amount.toLocaleString('en-IN')}`
    }
    return `${price.currency} ${price.amount.toLocaleString()}`
  }

  const formatDate = (isoString) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return isoString
    }
  }

  // No course in the URL - send visitors to the programs list to pick one.
  if (!activeSlug) {
    return <Navigate to="/events" replace />
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-slate-50">
        <RiLoader4Line className="w-10 h-10 animate-spin text-[#34E06E]" />
        <p className="text-sm font-semibold text-slate-600">{c.states.loadingText}</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-900">{c.states.notFoundTitle}</h1>
        <p className="text-slate-600 max-w-md">{error || 'This program could not be loaded for enrollment.'}</p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-sm hover:brightness-95 transition"
        >
          <RiArrowLeftLine className="w-4 h-4" /> {c.states.notFoundCtaLabel}
        </Link>
      </div>
    )
  }

  const schedule = course.schedule || {}
  // Same slug/refCode-only detection as CourseDetailView - course.authority
  // often *mentions* FAA on non-FAA courses too, which causes false positives.
  const isIndiaProgram =
    course.slug?.includes('india') ||
    course.refCode?.includes('IPIN') ||
    course.title?.toLowerCase().includes('india')
  const isFaaProgram =
    !isIndiaProgram &&
    (course.slug?.includes('faa') ||
      course.slug?.includes('part-65') ||
      course.refCode?.toLowerCase().includes('faa'))
  const standardIds = isFaaProgram ? ['faa'] : isIndiaProgram ? ['dgca', 'icao'] : ['easa', 'icao']
  const rowLogos = customLogos.length
    ? customLogos
    : standardIds.map((id) => ({ url: `std:${id}`, key: '', alt: STANDARD_LOGOS[id].alt }))

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Enrollment forms carry no search value and would compete with the
          course page for the same query - kept out of the index deliberately. */}
      <Seo
        path={`/courses/${course.slug}/enroll`}
        title={`Enroll: ${course.title} | IFOA`}
        description="Complete your IFOA candidate application form."
        noindex
      />
      {/* 1. Header */}
      <section className="relative bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white pt-28 pb-12 sm:pb-14 border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RiArrowLeftLine className="w-4 h-4" />
            <span>{T('header', 'backLabel')}</span>
          </button>

          <div className="space-y-3 max-w-3xl">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-white border-b-2 border-[#34E06E] pb-1">
              {T('header', 'eyebrow')}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight [text-wrap:balance]">
              {CF('title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{T('header', 'intro')}</p>
          </div>
        </div>
      </section>

      {/* 2. Main 2-Column Application Layout */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* Left Sidebar: banner scrolls with page, details card sticks */}
          <aside className="lg:col-span-4 lg:self-stretch space-y-6">
            {/* Course Banner (scrolls away) */}
            <div className="rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden p-6 sm:p-7">
              <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-slate-950/5 border border-slate-100 relative flex items-center justify-center p-2 shadow-2xs">
                <img
                  src={cardImageUrl || programmeBanner(course) || course.image || bannerCourseHero}
                  alt={course.title}
                  className="w-full h-full object-contain object-center"
                />
                <CmsImageButton path="courseMedia.cardImage" folder="courses" />
              </div>
            </div>

            {/* Course Summary Card (sticky) */}
            <div className="lg:sticky lg:top-24 rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden p-6 sm:p-7 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {CF('title')}
              </h2>

              {/* Tuition & Pricing */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  {T('sidebar', 'tuitionLabel')}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {facts && !locationPrice ? (
                    <>
                      <CmsText path="courseFacts.currency" value={facts.currency} />{' '}
                      <CmsText path="courseFacts.priceAmount" value={facts.priceAmount} />
                    </>
                  ) : (
                    formatPrice(activePrice)
                  )}
                </div>
                {facts && !locationPrice && (
                  <span className="block text-[11px] text-slate-400">Leave the amount empty to show “Contact Admissions”.</span>
                )}
              </div>

              {/* Key Quick Metadata */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 shrink-0">
                    <TbClockHour4 className="w-4 h-4 text-slate-400" />
                    <span>{T('sidebar', 'durationLabel')}</span>
                  </span>
                  <strong className="text-slate-900 text-right font-bold">{CF('duration', '4 Weeks')}</strong>
                </div>

                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 shrink-0">
                    <RiCalendarEventLine className="w-4 h-4 text-slate-400" />
                    <span>{T('sidebar', 'intakeLabel')}</span>
                  </span>
                  <strong className="text-slate-900 text-right font-bold font-mono">
                    {facts ? (
                      <span className="flex flex-col items-end gap-1">
                        <input
                          type="date"
                          value={facts.startDate}
                          onChange={(e) => postEdit('courseFacts.startDate', e.target.value)}
                          className="rounded-md border border-dashed border-emerald-400 bg-white px-2 py-1 text-xs font-sans"
                        />
                        {!facts.startDate && CF('intakeLabel', 'To be announced')}
                      </span>
                    ) : schedule.startDate ? (
                      formatDate(schedule.startDate)
                    ) : (
                      CF('intakeLabel', 'To be announced')
                    )}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 shrink-0 pt-0.5">
                    <RiMapPin2Line className="w-4 h-4 text-slate-400" />
                    <span>{T('sidebar', 'locationLabel')}</span>
                  </span>
                  <strong className="text-slate-900 text-right font-bold leading-snug">
                    {liveCourse && !trainingLocation ? CF('location') : activeLocation || 'New Delhi (IAA)'}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-2 shrink-0 pt-0.5">
                    <TbCertificate className="w-4 h-4 text-slate-400" />
                    <span>{T('sidebar', 'credentialLabel')}</span>
                  </span>
                  <strong className="text-slate-900 text-right font-bold leading-snug">
                    {T('sidebar', 'credentialValue')}
                  </strong>
                </div>
              </div>

              {/* Regulatory Accreditations Strip */}
              <div className="relative space-y-2.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  {T('sidebar', 'accreditationLabel')}
                </span>
                {liveCourse && customLogos.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => postEdit('courseMedia.logos', [])}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Use standard logos
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {rowLogos.map((logo, i) => (
                    <div key={`${logo.url}-${i}`} className={liveCourse ? 'group relative flex flex-col items-center gap-1.5' : 'contents'}>
                      <img src={logoSrc(logo.url)} alt={logo.alt || ''} className="h-6 w-auto object-contain" />
                      {liveCourse && (
                        <>
                          <div className="relative h-7 w-[4.5rem]">
                            <CmsImageButton
                              folder="courses"
                              label="Replace"
                              className="top-0 right-0"
                              onUploaded={(img) => setLogos(rowLogos.map((l, j) => (j === i ? img : l)))}
                            />
                          </div>
                          <button
                            type="button"
                            title="Remove logo"
                            onClick={() => setLogos(rowLogos.filter((_, j) => j !== i))}
                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  {liveCourse && (
                    <div className="relative h-7 w-[5.5rem]">
                      <CmsImageButton
                        folder="courses"
                        label="+ Add logo"
                        className="top-0 right-0"
                        onUploaded={(img) => setLogos([...rowLogos, img])}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Admissions WhatsApp Support Box */}
              <div className="p-4.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 text-xs">
                <strong className="font-bold text-[#0d6833] block">{T('support', 'title')}</strong>
                <p className="text-slate-600 leading-relaxed">
                  {T('support', 'desc')}
                </p>
                <a
                  href="https://wa.me/41782273103"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0d6833] hover:underline pt-1"
                >
                  <RiWhatsappFill className="w-3.5 h-3.5" />
                  <span>{T('support', 'ctaLabel')}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Column: Full Registration Form */}
          <main className="lg:col-span-8">
            <RegistrationForm
              slug={course.slug}
              courseTitle={course.title?.replace(/[\u2013\u2014]/g, '-')}
              onAnswersChange={handleAnswersChange}
              locationPrices={course.locationPrices || []}
              liveSections={liveCourse?.form}
              text={{
                title: CF('title'),
                eyebrow: T('form', 'eyebrow'),
                instructions: T('form', 'instructions'),
                submitLabel: T('form', 'submitLabel')
              }}
            />
          </main>

        </div>
      </div>
    </div>
  )
}

export default CourseEnrollmentPage
