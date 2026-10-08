import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine } from 'react-icons/ri'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { api } from '@/lib/api'
import { readPreload } from '@/lib/preload'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePageContent } from '@/hooks/usePageContent'
import { CmsText, CmsRemoveItem, CmsAddItem, isPreviewEditMode } from '@/components/admin/CmsEditable'
import { priceText } from '@/components/course/PriceTag'
import { graph, organizationSchema, breadcrumbSchema, courseListSchema } from '@/lib/seo'
import bannerHero from '@/assets/shared/photos/IOFA-banner_10@1920x1280.jpg'

// Shared column layout for the board's heading row and course rows.
const ROW_GRID = 'lg:grid-cols-[140px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.2fr)_100px_150px] lg:gap-x-6'

// Content the page ships with; editable at /admin/pages/upcoming.
// Open courses individuals can book themselves, next start date first.
const FALLBACK = {
  hero: {
    title: 'Upcoming courses',
    subtitle: 'Courses you can book yourself, with their next start date. Training a whole team? We schedule it around your operation instead.'
  },
  board: {
    colNext: 'Next start',
    colCourse: 'Course',
    colDuration: 'Duration',
    colWhere: 'Location',
    colFee: 'Fee',
    detailsLabel: 'Course details',
    note: 'Dates can change. Your place is confirmed once your application is accepted and payment is received, as set out in the application form.',
    locations: [
      {
        name: 'Denmark',
        code: 'dk'
      },
      {
        name: 'USA',
        code: 'us'
      },
      {
        name: 'India',
        code: 'in'
      }
    ],
    courses: [
      {
        when: '4 Jan 2027',
        whenNote: 'Seats open',
        startDate: '2027-01-04',
        format: 'Hybrid',
        locations: 'Denmark',
        title: 'Flight Dispatcher Initial',
        slug: 'flight-dispatcher-initial-certification',
        variantOf: '',
        desc: 'ICAO Doc 10106, with EASA operations.',
        duration: '5 weeks',
        where: '2 weeks online, 3 weeks in Sønderborg, Denmark',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/flight-dispatcher-initial-certification/enroll'
      },
      {
        when: 'Rolling',
        whenNote: 'Starts at 10 registrations',
        startDate: '',
        format: 'Hybrid',
        locations: 'India',
        title: 'Flight Dispatcher Initial (India)',
        slug: 'flight-dispatcher-initial-training-india',
        variantOf: 'flight-dispatcher-initial-certification',
        desc: 'ICAO Doc 10106, taught in New Delhi after online preparation.',
        duration: '4 weeks',
        where: 'Online preparation, then New Delhi, India',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/flight-dispatcher-initial-certification/enroll?location=india'
      },
      {
        when: 'Rolling',
        whenNote: 'India batches from 8 Feb 2027',
        startDate: '',
        format: 'Hybrid',
        locations: 'Denmark, USA, India',
        title: 'FAA Aircraft Dispatcher',
        slug: 'aircraft-dispatcher-training-faa-part-65',
        variantOf: '',
        desc: 'FAA Part 65 approved. Prepares you for the FAA Aircraft Dispatcher license.',
        duration: '6 weeks (India: 5 weeks, plus an exam week taken within 6 months), plus ADX self-study',
        where: 'Online preparation, then Sønderborg, Florida or New Delhi',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/aircraft-dispatcher-training-faa-part-65/enroll'
      },
      {
        when: 'To be confirmed',
        whenNote: 'Contact us for dates',
        startDate: '',
        format: 'Hybrid',
        locations: 'Denmark, India',
        title: 'Double Program: FAA & EASA',
        slug: 'flight-dispatcher-double-programme',
        variantOf: '',
        desc: 'The FAA Part 65 approved course plus ICAO and EASA operations. One FAA license, trained for both rule sets.',
        duration: '7 weeks, plus ADX self-study',
        where: 'Hybrid, Denmark · India',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/flight-dispatcher-double-programme/enroll'
      },
      {
        when: 'Next date',
        whenNote: 'To be announced',
        startDate: '',
        format: 'On-site',
        locations: '',
        title: 'Train the Trainer',
        slug: 'train-the-trainer-icao-cbta-instructor',
        variantOf: '',
        desc: 'For aviation professionals who teach. You teach twice, with feedback each time.',
        duration: '4 days',
        where: 'Open course, or in-house at your base',
        fee: 'On request',
        ctaLabel: 'Request a proposal',
        ctaTo: '/contact?course=train-the-trainer-icao-cbta-instructor'
      }
    ],
    filterAllLabel: 'All countries',
    sortLabel: 'Sort by',
    formatLabel: 'Format',
    emptyText: 'No upcoming course matches this selection.'
  },
  operators: {
    title: 'Training your whole team?',
    text: 'Operators don\'t wait for a public date. We schedule flight dispatch, crew control, dangerous goods, train the trainer and human factors training around your operation, online or at your base.',
    primaryLabel: 'Talk to us about your team',
    secondaryLabel: 'See operator courses'
  }
}

// Fee shown until the live course price loads (and when the API is down).
const FEE_FALLBACK = {
  'flight-dispatcher-initial-certification': '€3,500',
  'flight-dispatcher-initial-training-india': '€1,000 + GST',
  'aircraft-dispatcher-training-faa-part-65': '$4,500 USD',
  'flight-dispatcher-double-programme': '$5,500 USD'
}

// Country flag from its 2-letter code; hidden if it cannot load.
function Flag({ code }) {
  if (!code) return null
  return (
    <img
      src={`https://flagcdn.com/w40/${String(code).trim().toLowerCase()}.png`}
      alt=""
      width="20"
      height="14"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
      className="h-3.5 w-5 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.12)]"
    />
  )
}

const FORMATS = ['Online', 'Hybrid', 'On-site']
const normFormat = (v = '') => String(v).toLowerCase().replace(/[^a-z]/g, '')
const FORMAT_STYLE = {
  online: 'text-slate-950 border-[#34E06E]',
  hybrid: 'text-slate-950 border-[#34E06E]',
  onsite: 'text-slate-950 border-[#34E06E]'
}

// Length of a course in weeks (days count as a fraction), for sorting; unknown sorts last.
function durationWeeks(text = '') {
  const w = /(\d+(?:\.\d+)?)\s*weeks?/i.exec(text)
  if (w) return Number(w[1])
  const d = /(\d+(?:\.\d+)?)\s*days?/i.exec(text)
  return d ? Number(d[1]) / 7 : Infinity
}

// The countries a course is taught in, as the configured locations (for the flags).
const countryFlags = (course, locations) => {
  const names = String(course.locations || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
  return locations.filter((loc) => names.includes(String(loc.name || '').trim().toLowerCase()))
}

const inCountry = (course, key) => {
  const list = String(course.locations || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
  return list.length === 0 || list.includes(key)
}

const bySlug = (courses) => Object.fromEntries((courses || []).map((c) => [c.slug, c]))

export function UpcomingCoursesPage() {
  // Fees come from the course data so they cannot drift from the course pages;
  // FEE_FALLBACK above is the fallback while it loads or if the API is down.
  const { c } = usePageContent('upcoming', FALLBACK)
  const COURSES = c.board.courses
  const LOCATIONS = c.board.locations || []
  const editing = isPreviewEditMode()
  const [country, setCountry] = useState('all')
  const [format, setFormat] = useState('all')
  const [sort, setSort] = useState('date')
  // Keep each row's index in the saved list so inline edits hit the right entry.
  // A row with "variantOf" is a country version of another course: it is never listed
  // on its own, it only replaces that course's details when its country is selected.
  const rows = COURSES.map((course, idx) => ({ course, idx }))
  const mainRows = rows.filter(({ course }) => !course.variantOf)
  const variantFor = (main) =>
    country === 'all' ? null : rows.find((r) => r.course.variantOf && r.course.variantOf === main.slug && inCountry(r.course, country)) || null
  const visible = editing
    ? rows.map((r) => ({ ...r, shown: r.course, main: r.course }))
    : mainRows
        .map((r) => {
          const variant = variantFor(r.course)
          return { main: r.course, idx: variant ? variant.idx : r.idx, shown: variant ? variant.course : r.course, variant }
        })
        .filter(({ main, variant }) => country === 'all' || variant || inCountry(main, country))
        .filter(({ shown }) => format === 'all' || normFormat(shown.format) === format)
        .sort((a, b) => {
          if (sort === 'name') return String(a.main.title).localeCompare(String(b.main.title))
          if (sort === 'duration') return durationWeeks(a.shown.duration) - durationWeeks(b.shown.duration) || a.idx - b.idx
          const da = a.shown.startDate ? Date.parse(a.shown.startDate) : Infinity
          const db = b.shown.startDate ? Date.parse(b.shown.startDate) : Infinity
          return da - db || a.idx - b.idx
        })
  const [live, setLive] = useState(() => bySlug(readPreload('courses')))
  useEffect(() => {
    api
      .listCourses()
      .then((data) => setLive(bySlug(data.courses)))
      .catch(() => {
        // Keep the fees already on screen.
      })
  }, [])

  return (
    <div className="bg-[#f8fafc] text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="upcoming-courses-page">
      <Seo
        path="/upcoming-courses"
        title="Upcoming Courses and Start Dates | IFOA"
        description="Next start dates for IFOA courses: Flight Dispatcher Initial in Denmark (4 January 2027) and India, FAA Aircraft Dispatcher (rolling admissions), the Double Program and Train the Trainer."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Upcoming courses', path: '/upcoming-courses' }
          ]),
          courseListSchema(
            'Upcoming IFOA courses',
            COURSES.filter((x) => !x.variantOf).map((x) => ({ name: x.title, description: x.desc, path: `/courses/${x.slug}` }))
          )
        )}
      />

      {/* 1. HERO */}
      <section className="relative min-h-[380px] md:min-h-[420px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img src={bannerHero} alt="" className="w-full h-full object-cover object-center opacity-30 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]" />
        </div>
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight"><CmsText path="hero.title" value={c.hero.title} /></h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <CmsText path="hero.subtitle" value={c.hero.subtitle} />
          </p>
        </div>
      </section>

      {/* 2. DEPARTURES BOARD: one table, identical columns on every row */}
      <Reveal as="section" className="py-14 sm:py-20" data-purpose="upcoming-board">
        <div className="max-w-[1280px] mx-auto px-6 space-y-4">
          {/* Country toggle, format filter and sort */}
          <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCountry('all')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                  country === 'all' ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <CmsText path="board.filterAllLabel" value={c.board.filterAllLabel} />
              </button>
              {LOCATIONS.map((loc, li) => {
                const key = String(loc.name || '').trim().toLowerCase()
                return (
                  <span key={`${loc.name}-${li}`} className="relative">
                    <button
                      type="button"
                      onClick={() => setCountry(key)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                        country === key ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <Flag code={loc.code} />
                      <CmsText path={`board.locations.${li}.name`} value={loc.name} />
                      {editing && (
                        <span className="text-[10px] font-mono opacity-70">
                          (<CmsText path={`board.locations.${li}.code`} value={loc.code} />)
                        </span>
                      )}
                    </button>
                    <CmsRemoveItem listPath="board.locations" index={li} label="Remove country" />
                  </span>
                )
              })}
              <div className="w-44 [&>button]:min-h-0 [&>button]:rounded-full [&>button]:py-2">
                <CmsAddItem listPath="board.locations" label="Add country" blank={{ name: 'New country', code: '' }} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CmsText path="board.formatLabel" value={c.board.formatLabel} />
                <CustomSelect
                  className="!w-40"
                  value={format}
                  onChange={setFormat}
                  options={[{ value: 'all', label: 'All' }, ...FORMATS.map((f) => ({ value: normFormat(f), label: f }))]}
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <CmsText path="board.sortLabel" value={c.board.sortLabel} />
                <CustomSelect
                  className="!w-44"
                  value={sort}
                  onChange={setSort}
                  options={[
                    { value: 'date', label: 'Start date' },
                    { value: 'duration', label: 'Duration' },
                    { value: 'name', label: 'Course name' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden">
            {/* Column headings (desktop) */}
            <div className={`hidden lg:grid ${ROW_GRID} px-7 py-3.5 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 text-center`}>
              <span><CmsText path="board.colNext" value={c.board.colNext} /></span>
              <span><CmsText path="board.colCourse" value={c.board.colCourse} /></span>
              <span><CmsText path="board.colDuration" value={c.board.colDuration} /></span>
              <span><CmsText path="board.colWhere" value={c.board.colWhere} /></span>
              <span><CmsText path="board.colFee" value={c.board.colFee} /></span>
              <span />
            </div>

            {visible.length === 0 && (
              <p className="px-7 py-10 text-center text-sm text-slate-500">
                <CmsText path="board.emptyText" value={c.board.emptyText} />
              </p>
            )}
            {visible.map(({ main, shown, idx: i }, pos) => {
              // One row per course: the selected country's version supplies the details.
              const course = { ...shown, title: main.title }
              const allCountries = [main, ...rows.map((r) => r.course).filter((v) => v.variantOf && v.variantOf === main.slug)]
              // An admin-entered fee wins; otherwise the live course price.
              const fee = course.fee || priceText(live[course.slug]?.price, course.slug?.includes('india')) || FEE_FALLBACK[course.slug] || ''
              const p = `board.courses.${i}`
              const facts = [
                ['Duration', c.board.colDuration, 'duration', course.duration],
                ['Where', c.board.colWhere, 'where', course.where],
                ['Fee', c.board.colFee, 'fee', fee]
              ]
              return (
                <article
                  key={`${course.slug}-${i}`}
                  className={`relative grid grid-cols-1 ${ROW_GRID} gap-y-4 px-6 sm:px-7 py-7 lg:items-start hover:bg-slate-50/60 transition-colors ${
                    pos > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <CmsRemoveItem listPath="board.courses" index={i} label="Remove course" />

                  {/* When */}
                  <div className="lg:text-center">
                    <b className="block text-xl font-extrabold text-slate-950 tracking-tight leading-none"><CmsText path={`${p}.when`} value={course.when} /></b>
                    <span className="mt-2 block text-xs font-semibold text-[#16a952]"><CmsText path={`${p}.whenNote`} value={course.whenNote} /></span>
                  </div>

                  {/* Course */}
                  <div className="lg:text-center">
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                      {course.slug ? (
                        <Link to={`/courses/${course.slug}`} className="hover:text-[#16a952] transition-colors">
                          <CmsText path={`${p}.title`} value={course.title} />
                        </Link>
                      ) : (
                        <CmsText path={`${p}.title`} value={course.title} />
                      )}
                    </h2>
                  </div>

                  {/* Facts: own columns on desktop, labeled list on mobile */}
                  {facts.map(([key, label, field, value]) => {
                    const text = String(value || '')
                    // Duration: the headline figure first, the extra detail muted below it.
                    const head = text.split(/\s*[(,]/)[0]
                    const rest = text.slice(head.length).replace(/^[\s,]+/, '')
                    return (
                      <div key={key} className="flex lg:block justify-between gap-4 text-sm lg:text-center">
                        <span className="lg:hidden text-xs text-slate-500">{label}</span>
                        <div className="flex flex-col items-end lg:items-center text-right lg:text-center leading-snug">
                          {key === 'Duration' && (course.format || editing) && (
                            <span
                              className={`mb-2 inline-flex items-center border-b-2 pb-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                FORMAT_STYLE[normFormat(course.format)] || FORMAT_STYLE.onsite
                              }`}
                            >
                              <CmsText path={`${p}.format`} value={course.format} />
                            </span>
                          )}
                          {key === 'Where' && (
                            <span className="mb-2 flex items-center gap-1.5 lg:justify-center justify-end">
                              {countryFlags({ locations: allCountries.map((v) => v.locations).filter(Boolean).join(',') }, LOCATIONS).map((loc) => (
                                <span key={loc.name} title={loc.name}>
                                  <Flag code={loc.code} />
                                </span>
                              ))}
                            </span>
                          )}
                          {key === 'Duration' && !editing ? (
                            <>
                              <span className="block font-bold text-slate-950">{head}</span>
                              {rest && <span className="mt-0.5 block text-xs font-normal text-slate-500">{rest}</span>}
                            </>
                          ) : (
                            <span className={key === 'Where' ? 'font-medium text-slate-700' : 'font-bold text-slate-950'}>
                              <CmsText path={`${p}.${field}`} value={value} />
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-1 lg:pt-0">
                    <Link
                      to={course.ctaTo || '/contact'}
                      className="w-full text-center bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-full text-xs transition-colors"
                    >
                      <CmsText path={`${p}.ctaLabel`} value={course.ctaLabel} />
                    </Link>
                    <Link
                      to={course.slug ? `/courses/${course.slug}` : '/contact'}
                      className="group/link inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                    >
                      <CmsText path="board.detailsLabel" value={c.board.detailsLabel} />
                      <RiArrowRightLine className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              )
            })}
            <div className="px-6 sm:px-7 py-4">
              <CmsAddItem
                listPath="board.courses"
                label="Add course"
                blank={{ when: 'Rolling', whenNote: '', variantOf: '', startDate: '', format: 'Hybrid', locations: '', title: 'New course', slug: '', desc: '', duration: '', where: '', fee: '', ctaLabel: 'Apply', ctaTo: '' }}
              />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            <CmsText path="board.note" value={c.board.note} />
          </p>
        </div>
      </Reveal>

      {/* 3. OPERATORS BAND */}
      <Reveal as="section" className="pb-16 sm:pb-24" data-purpose="upcoming-operators">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white p-8 sm:p-10 grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center border border-white/10 shadow-xl">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight"><CmsText path="operators.title" value={c.operators.title} /></h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                <CmsText path="operators.text" value={c.operators.text} />
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="text-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                <CmsText path="operators.primaryLabel" value={c.operators.primaryLabel} />
              </Link>
              <Link
                to="/services?for=operators"
                className="text-center border border-white/25 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                <CmsText path="operators.secondaryLabel" value={c.operators.secondaryLabel} />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

export default UpcomingCoursesPage
