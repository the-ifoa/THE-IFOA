import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowRightLine } from 'react-icons/ri'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { api } from '@/lib/api'
import { readPreload } from '@/lib/preload'
import { usePageContent } from '@/hooks/usePageContent'
import { CmsText, CmsRemoveItem, CmsAddItem } from '@/components/admin/CmsEditable'
import { priceText } from '@/components/course/PriceTag'
import { graph, organizationSchema, breadcrumbSchema, courseListSchema } from '@/lib/seo'
import bannerHero from '@/assets/shared/photos/IOFA-banner_10@1920x1280.jpg'

// Shared column layout for the board's heading row and course rows.
const ROW_GRID = 'lg:grid-cols-[150px_minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_90px_170px] lg:gap-x-4'

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
    colWhere: 'Where',
    colFee: 'Fee',
    detailsLabel: 'Course details',
    note: 'Dates can change. Your place is confirmed once your application is accepted and payment is received, as set out in the application form.',
    courses: [
      {
        when: '4 Jan 2027',
        whenNote: 'Seats open',
        title: 'Flight Dispatcher Initial',
        slug: 'flight-dispatcher-initial-certification',
        desc: 'ICAO Doc 10106, with EASA operations.',
        duration: '200 hours, 5 weeks',
        where: '2 weeks online, 3 weeks in Sønderborg, Denmark',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/flight-dispatcher-initial-certification/enroll'
      },
      {
        when: 'Rolling',
        whenNote: 'Starts at 10 registrations',
        title: 'Flight Dispatcher Initial (India)',
        slug: 'flight-dispatcher-initial-training-india',
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
        title: 'FAA Aircraft Dispatcher',
        slug: 'aircraft-dispatcher-training-faa-part-65',
        desc: 'FAA Part 65 approved. Prepares you for the FAA Aircraft Dispatcher license.',
        duration: '200 hours, 6 weeks (India: 5 weeks, plus an exam week taken within 6 months), plus ADX self-study',
        where: 'Online preparation, then Sønderborg, Florida or New Delhi',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/aircraft-dispatcher-training-faa-part-65/enroll'
      },
      {
        when: 'To be confirmed',
        whenNote: 'Contact us for dates',
        title: 'Double Program: FAA & EASA',
        slug: 'flight-dispatcher-double-programme',
        desc: 'The FAA Part 65 approved course plus ICAO and EASA operations. One FAA license, trained for both rule sets.',
        duration: '280 hours, 7 weeks, plus ADX self-study',
        where: 'Hybrid, Denmark · India',
        fee: '',
        ctaLabel: 'Apply',
        ctaTo: '/courses/flight-dispatcher-double-programme/enroll'
      },
      {
        when: 'Next date',
        whenNote: 'To be announced',
        title: 'Train the Trainer',
        slug: 'train-the-trainer-icao-cbta-instructor',
        desc: 'For aviation professionals who teach. You teach twice, with feedback each time.',
        duration: '4 days',
        where: 'Open course, or in-house at your base',
        fee: 'On request',
        ctaLabel: 'Request a proposal',
        ctaTo: '/contact?course=train-the-trainer-icao-cbta-instructor'
      }
    ]
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

const bySlug = (courses) => Object.fromEntries((courses || []).map((c) => [c.slug, c]))

export function UpcomingCoursesPage() {
  // Fees come from the course data so they cannot drift from the course pages;
  // FEE_FALLBACK above is the fallback while it loads or if the API is down.
  const { c } = usePageContent('upcoming', FALLBACK)
  const COURSES = c.board.courses
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
            COURSES.map((x) => ({ name: x.title, description: x.desc, path: `/courses/${x.slug}` }))
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
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden">
            {/* Column headings (desktop) */}
            <div className={`hidden lg:grid ${ROW_GRID} px-7 py-3.5 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400`}>
              <span><CmsText path="board.colNext" value={c.board.colNext} /></span>
              <span><CmsText path="board.colCourse" value={c.board.colCourse} /></span>
              <span><CmsText path="board.colDuration" value={c.board.colDuration} /></span>
              <span><CmsText path="board.colWhere" value={c.board.colWhere} /></span>
              <span><CmsText path="board.colFee" value={c.board.colFee} /></span>
              <span />
            </div>

            {COURSES.map((course, i) => {
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
                  className={`relative grid grid-cols-1 ${ROW_GRID} gap-y-4 px-6 sm:px-7 py-6 items-center ${
                    i > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <CmsRemoveItem listPath="board.courses" index={i} label="Remove course" />

                  {/* When */}
                  <div>
                    <b className="block text-xl font-extrabold text-slate-950 tracking-tight leading-none"><CmsText path={`${p}.when`} value={course.when} /></b>
                    <span className="block mt-1.5 text-xs font-semibold text-[#16a952]"><CmsText path={`${p}.whenNote`} value={course.whenNote} /></span>
                  </div>

                  {/* Course */}
                  <div className="pr-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                      {course.slug ? (
                        <Link to={`/courses/${course.slug}`} className="hover:text-[#16a952] transition-colors">
                          <CmsText path={`${p}.title`} value={course.title} />
                        </Link>
                      ) : (
                        <CmsText path={`${p}.title`} value={course.title} />
                      )}
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-600 leading-relaxed"><CmsText path={`${p}.desc`} value={course.desc} /></p>
                  </div>

                  {/* Facts: own columns on desktop, labeled list on mobile */}
                  {facts.map(([key, label, field, value]) => (
                    <div key={key} className="flex lg:block justify-between gap-4 text-sm lg:pr-4">
                      <span className="lg:hidden text-xs text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-900 text-right lg:text-left leading-snug">
                        <CmsText path={`${p}.${field}`} value={value} />
                      </span>
                    </div>
                  ))}

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
                blank={{ when: 'Rolling', whenNote: '', title: 'New course', slug: '', desc: '', duration: '', where: '', fee: '', ctaLabel: 'Apply', ctaTo: '' }}
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
