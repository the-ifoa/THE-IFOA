import { Link } from 'react-router-dom'
import { TbClockHour4 } from 'react-icons/tb'
import { HiArrowUpRight } from 'react-icons/hi2'

import bannerDispatcher from '@/assets/shared/course-media/easa-hero.webp'
import bannerPart65 from '@/assets/shared/course-media/part65-hero.webp'
import bannerGroundOps from '@/assets/shared/course-media/course_banner_ground_ops_3d.jpg'
// Same photography as the Services page cards, so a course and its matching
// service present the same image instead of a generic unrelated stock photo.
import imgFlightDispatch from '@/assets/services/01_flight_dispatch.webp'
import imgDgr from '@/assets/services/02_dangerous_goods.webp'
import imgTrainTrainer from '@/assets/services/03_train_trainer.webp'
import imgHumanFactors from '@/assets/services/04_human_factors.webp'
import imgCrewControl from '@/assets/services/05_crew_control.webp'
import imgConsulting from '@/assets/services/06_consulting.webp'

// Keyed by Course.category (backend/models/Course.js). Categories with no
// matching Services card (ground, security, other) keep their own image.
const CATEGORY_IMG = {
  dispatch: imgFlightDispatch,
  'dangerous-goods': imgDgr,
  'train-the-trainer': imgTrainTrainer,
  'human-factors': imgHumanFactors,
  crew: imgCrewControl,
  consulting: imgConsulting,
  ground: bannerGroundOps
}

// Single source of truth for the Events & Courses catalog card. Used by the
// public catalog and by the admin editor's live preview. Every `card.*`
// override falls back to a course-level field or a sensible default.
// Treat "" / null / undefined as "not set" so blank admin fields fall back.
const first = (...vals) => vals.find((v) => v !== '' && v !== null && v !== undefined)

// Tablet-mockup banners for the two initial dispatcher programs. Used as the
// program-overview thumbnail and the registration-form thumbnail.
const PROGRAMME_BANNER = {
  'flight-dispatcher-initial-certification': bannerDispatcher,
  'flight-dispatcher-initial-training-india': bannerDispatcher,
  'flight-dispatcher-initial-training-usa': bannerDispatcher,
  'aircraft-dispatcher-training-faa-part-65': bannerPart65,
  'flight-dispatcher-double-programme': bannerDispatcher
}

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function programmeBanner(course = {}) {
  return PROGRAMME_BANNER[course.slug] || null
}

// Courses that apply through another course's form, with a training location
// pre-selected (the India edition uses the Flight Dispatcher Initial form).
const ENROLL_VIA = {
  'flight-dispatcher-initial-training-india': '/courses/flight-dispatcher-initial-certification/enroll?location=india',
  'flight-dispatcher-initial-training-usa': '/courses/flight-dispatcher-initial-certification/enroll?location=united'
}

// Courses taught in several locations with their own page each (content,
// duration and price differ). The course page shows a location switch.
const EDITIONS = [
  [
    { label: 'Denmark', location: 'denmark', slug: 'flight-dispatcher-initial-certification' },
    { label: 'India', location: 'india', slug: 'flight-dispatcher-initial-training-india' }
  ]
]

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function courseEditions(slug) {
  return EDITIONS.find((group) => group.some((e) => e.slug === slug)) || null
}

// Where a course's "Apply online" button goes.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function enrollPath(course = {}) {
  return ENROLL_VIA[course.slug] || `/courses/${course.slug}/enroll`
}

// The built-in programs have a registration form; so does any other individual
// (non-corporate) course that has its own form, e.g. one added in admin. Corporate
// courses and courses without a form send enquiries to the Contact page instead.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function hasEnrollmentForm(course = {}) {
  return course.slug in PROGRAMME_BANNER || Boolean(course.hasForm && !course.isCorporate)
}

// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function resolveCard(course = {}) {
  const c = course.card || {}
  const isGround = course.category === 'ground' || course.category === 'ramp'
  const isDgr =
    course.category === 'dangerous-goods' ||
    course.category === 'dgr' ||
    course.slug?.includes('dangerous-goods') ||
    course.slug?.includes('dgr') ||
    course.title?.toLowerCase().includes('dangerous goods')
  const isFaa = course.slug?.includes('part-65') || course.slug?.includes('faa')
  const defaultBanner = isDgr
    ? imgDgr
    : CATEGORY_IMG[course.category] || (isFaa ? bannerPart65 : bannerDispatcher)
  const rating = first(c.rating, course.rating, 5)

  const resolvedImage = isDgr
    ? (c.image?.url && !c.image?.url?.includes('ground') && !c.image?.url?.includes('dispatcher')
      ? c.image.url
      : course.heroImage?.url && !course.heroImage?.url?.includes('ground') && !course.heroImage?.url?.includes('dispatcher')
        ? course.heroImage.url
        : imgDgr)
    : first(c.image?.url, course.heroImage?.url, defaultBanner)

  return {
    image: resolvedImage,
    badge: first(
      c.badge,
      course.authority,
      isDgr ? 'IATA CBTA / ICAO' : (isGround ? 'IATA ISAGO / EASA' : (isFaa ? 'FAA Part 65' : 'EASA Compliant'))
    ),
    badgeTone: isGround ? 'ground' : (isDgr ? 'dgr' : 'default'),
    rating: Number(rating).toFixed(1),
    reviews: first(c.reviewsLabel, '480+ Reviews'),
    duration: first(
      c.durationLabel,
      course.duration,
      isDgr ? '2 Weeks CBTA Track' : (isGround ? '4 Weeks Station Track' : '5 Weeks Hybrid')
    ),
    blurb: first(
      c.blurb,
      course.summary,
      course.whatYouWillLearn?.intro,
      'Comprehensive aviation program aligned with international regulatory standards.'
    )
  }
}

export function CourseCard({ course, preview = false }) {
  const v = resolveCard(course)
  const title = course.title || 'Untitled course'

  const Banner = (
    <div className="relative h-[220px] sm:h-[230px] overflow-hidden bg-slate-950 select-none border-b border-slate-100 flex items-center justify-center">
      <img
        src={v.image}
        alt={title}
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 select-none"
      />
    </div>
  )

  return (
    <div className="group rounded-[2rem] overflow-hidden border border-slate-200/90 bg-white hover:border-[#34E06E]/40 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
      {Banner}

      <div className="p-6 sm:p-7 text-left bg-white flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3.5 flex-1 flex flex-col">
          {/* Top Scope / Tag & Duration row */}
          <div className="flex items-center justify-between gap-2 min-h-[1.75rem]">
            {v.badge ? (
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block truncate max-w-[150px]">
                {v.badge}
              </span>
            ) : <span />}

            {/* Clean Duration Tag */}
            {v.duration && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                <TbClockHour4 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[170px]">{v.duration}</span>
              </span>
            )}
          </div>

          <div className="min-h-[3.25rem] flex items-start">
            <h3 className="text-lg sm:text-xl font-bold text-slate-950 leading-snug group-hover:text-[#34E06E] transition-colors line-clamp-2">
              {title}
            </h3>
          </div>

          <div className="flex-1 min-h-[3.75rem]">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-3">
              {v.blurb}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {preview ? (
            <div className="inline-flex items-center justify-between w-full text-xs sm:text-sm font-bold text-slate-950 transition-colors py-1">
              <span>View Course Details</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-950 group-hover:text-white flex items-center justify-center transition-all shrink-0 shadow-xs">
                <HiArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          ) : (
            <Link
              to={`/courses/${course.slug}`}
              className="inline-flex items-center justify-between w-full text-xs sm:text-sm font-bold text-slate-950 transition-colors py-1"
            >
              <span>View Course Details</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-slate-950 group-hover:text-white flex items-center justify-center transition-all shrink-0 shadow-xs">
                <HiArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCard
