import { Link } from 'react-router-dom'
import { RiArrowRightLine } from 'react-icons/ri'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { graph, organizationSchema, breadcrumbSchema, courseListSchema } from '@/lib/seo'
import bannerHero from '@/assets/shared/photos/IOFA-banner_10@1920x1280.jpg'

// Shared column layout for the board's heading row and course rows.
const ROW_GRID = 'lg:grid-cols-[150px_minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_90px_170px] lg:gap-x-4'

// Open courses individuals can book themselves, next start date first.
const COURSES = [
  {
    color: '#A86A12',
    when: '4 Jan 2027',
    whenNote: 'Seats open',
    title: 'Flight Dispatcher Initial',
    slug: 'flight-dispatcher-initial-certification',
    desc: 'ICAO and EASA-focused dispatcher training built on ICAO Doc 10106.',
    facts: [
      ['Duration', '5 weeks'],
      ['Where', '2 weeks online, 3 weeks in Sønderborg, Denmark'],
      ['Fee', '€3,500']
    ],
    cta: { label: 'Apply online', to: '/courses/flight-dispatcher-initial-certification/enroll' }
  },
  {
    color: '#2F5D8C',
    when: 'Rolling',
    whenNote: "Start when you're ready",
    title: 'FAA Aircraft Dispatcher',
    slug: 'aircraft-dispatcher-training-faa-part-65',
    desc: 'FAA Part 65 approved. Prepares you for the FAA Aircraft Dispatcher certificate.',
    facts: [
      ['Duration', '200 hours, plus ADX self-study'],
      ['Where', 'Online preparation, then Daytona Beach, Florida'],
      ['Fee', '$4,500']
    ],
    cta: { label: 'Apply online', to: '/courses/aircraft-dispatcher-training-faa-part-65/enroll' }
  },
  {
    color: '#0B6E99',
    when: 'Next date',
    whenNote: 'To be announced',
    title: 'Train the Trainer',
    slug: 'train-the-trainer-icao-cbta-instructor',
    desc: 'For aviation professionals who teach. You teach twice, with feedback each time.',
    facts: [
      ['Duration', '4 days'],
      ['Where', 'Classroom'],
      ['Fee', 'On request']
    ],
    cta: { label: 'Ask for the next date', to: '/contact?course=train-the-trainer-icao-cbta-instructor' }
  }
]

export function UpcomingCoursesPage() {
  return (
    <div className="bg-[#f8fafc] text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="upcoming-courses-page">
      <Seo
        path="/upcoming-courses"
        title="Upcoming Courses and Start Dates | IFOA"
        description="Next start dates for IFOA courses: Flight Dispatcher Initial (4 January 2027), FAA Aircraft Dispatcher (rolling admissions), and Train the Trainer."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Upcoming courses', path: '/upcoming-courses' }
          ]),
          courseListSchema(
            'Upcoming IFOA courses',
            COURSES.map((c) => ({ name: c.title, description: c.desc, path: `/courses/${c.slug}` }))
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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">Upcoming courses</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Courses you can book yourself, with their next start date. Training a whole team? We schedule it around your
            operation instead.
          </p>
        </div>
      </section>

      {/* 2. DEPARTURES BOARD: one table, identical columns on every row */}
      <Reveal as="section" className="py-14 sm:py-20" data-purpose="upcoming-board">
        <div className="max-w-[1280px] mx-auto px-6 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden">
            {/* Column headings (desktop) */}
            <div className={`hidden lg:grid ${ROW_GRID} px-7 py-3.5 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400`}>
              <span>Next start</span>
              <span>Course</span>
              <span>Duration</span>
              <span>Where</span>
              <span>Fee</span>
              <span />
            </div>

            {COURSES.map((course, i) => {
              const fact = Object.fromEntries(course.facts)
              return (
                <article
                  key={course.slug}
                  className={`grid grid-cols-1 ${ROW_GRID} gap-y-4 px-6 sm:px-7 py-6 items-center ${
                    i > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  {/* When */}
                  <div>
                    <b className="block text-xl font-extrabold text-slate-950 tracking-tight leading-none">{course.when}</b>
                    <span className="block mt-1.5 text-xs font-semibold text-[#16a952]">{course.whenNote}</span>
                  </div>

                  {/* Course */}
                  <div className="pr-4">
                    <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                      <Link to={`/courses/${course.slug}`} className="hover:text-[#16a952] transition-colors">
                        {course.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">{course.desc}</p>
                  </div>

                  {/* Facts: own columns on desktop, labelled list on mobile */}
                  {['Duration', 'Where', 'Fee'].map((label) => (
                    <div key={label} className="flex lg:block justify-between gap-4 text-sm lg:pr-4">
                      <span className="lg:hidden text-xs text-slate-500">{label}</span>
                      <span className="font-semibold text-slate-900 text-right lg:text-left leading-snug">{fact[label]}</span>
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="flex flex-col gap-2 pt-1 lg:pt-0">
                    <Link
                      to={course.cta.to}
                      className="w-full text-center bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-full text-xs transition-colors"
                    >
                      {course.cta.label}
                    </Link>
                    <Link
                      to={`/courses/${course.slug}`}
                      className="group/link inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
                    >
                      Course details
                      <RiArrowRightLine className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            Dates can change. Your place is confirmed once your application is accepted and payment is received, as set out in
            our Terms and Conditions.
          </p>
        </div>
      </Reveal>

      {/* 3. OPERATORS BAND */}
      <Reveal as="section" className="pb-16 sm:pb-24" data-purpose="upcoming-operators">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white p-8 sm:p-10 grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center border border-white/10 shadow-xl">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Training your whole team?</h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Operators don't wait for a public date. We schedule flight dispatch, crew control, dangerous goods, train the
                trainer and human factors training around your operation, online or at your base.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                to="/contact"
                className="text-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                Talk to us about your team
              </Link>
              <Link
                to="/services?for=operators"
                className="text-center border border-white/25 hover:bg-white/10 text-white font-bold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                See operator courses
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

export default UpcomingCoursesPage
