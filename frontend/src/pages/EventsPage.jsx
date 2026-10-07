import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  RiWhatsappFill,
  RiArrowRightSLine
} from 'react-icons/ri'
import { HiArrowUpRight } from 'react-icons/hi2'

import { Reveal } from '@/components/common/Reveal'
import { CmsText, CmsRemoveItem, CmsImageButton } from '@/components/admin/CmsEditable'
import { usePageContent } from '@/hooks/usePageContent'
import { Seo } from '@/components/common/Seo'
import { readPreload } from '@/lib/preload'
import { graph, organizationSchema, breadcrumbSchema, absoluteUrl } from '@/lib/seo'
// Hero background: FAA aircraft dispatcher license, cropped from the IFOA USA poster.
import bannerEventsHero from '@/assets/events/events_hero_faa_card.webp'
import multipleAirImg from '@/assets/events/multiple-air.webp'
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'

// Tarmac Photography Banners
const easaTarmacHero = '/course-images/EASA.jpeg'
const faaTarmacHero = '/course-images/Part-65.jpeg'
const doubleProgrammeHero = '/course-images/Flight-Dispatch-Webpage-Small.jpg'

// Content the page ships with; editable at /admin/pages/events.
const FALLBACK = {
  hero: {
    title: 'Open-enrollment cohorts, worldwide.',
    subtitle:
      'Dispatcher courses you can apply for directly, on published dates or rolling admissions, alongside the custom fleet training we build for airlines and operators.',
    primaryLabel: 'View Open Courses',
    secondaryLabel: 'Ask us on WhatsApp',
    image: null
  },
  programs: {
    eyebrow: 'Open-Enrollment Courses',
    title: 'Your Next Step in Aviation Starts Here',
    intro:
      'Explore our range of open-enrollment courses, developed to build practical knowledge, professional skills, and operational capability across aviation. Find your course and join an upcoming intake.',
    badge: 'Rolling Global Intakes',
    emptyTitle: 'No open intakes right now',
    emptyDesc: 'New cohorts are published here as admissions open. Leave your email below to be notified.'
  },
  develop: {
    eyebrow: 'What You Develop',
    title: 'Knowledge is only useful when you can apply it operationally.',
    intro:
      'The program develops the technical knowledge, situational awareness and operational judgment required to support safe and efficient flight operations.'
  },
  curriculum: {
    eyebrow: 'Curriculum Overview',
    title: 'What the Flight Dispatch program covers',
    intro: 'Organized around operational capability, not a flat list of disconnected subjects.',
    footnote: '',
    modules: [
      {
        num: '01',
        title: 'The Operating Environment',
        iconName: 'airspace',
        items: ['Air law and regulations', 'ICAO and EASA framework', 'Air traffic management', 'Aeronautical communications']
      },
      {
        num: '02',
        title: 'Know the Aircraft',
        iconName: 'altimeter',
        items: ['Aircraft systems for dispatchers', 'Mass and balance', 'Aircraft performance', 'MEL and CDL']
      },
      {
        num: '03',
        title: 'Plan the Flight',
        iconName: 'flight-route',
        items: ['Aviation meteorology', 'Navigation and route planning', 'Fuel planning and alternates', 'NOTAMs and flight plan filing']
      },
      {
        num: '04',
        title: 'Control the Operation',
        iconName: 'dispatcher-headset',
        items: ['Flight following and monitoring', 'Operational control', 'Communicating with crew and stakeholders', 'Managing disruptions']
      },
      {
        num: '05',
        title: 'Make the Decision',
        iconName: 'situational-awareness',
        items: ['Decision-making under uncertainty', 'Threat and error management', 'Human factors in dispatch', 'Scenario exercises']
      }
    ]
  },
  theoryToAircraft: {
    eyebrow: 'FROM THEORY TO THE AIRCRAFT',
    title: 'Know the aircraft. Understand the operation.',
    intro:
      'Take aircraft knowledge beyond the classroom. Our training connects aircraft systems, performance, limitations, mass and balance, and flight planning to the operational decisions professionals make every day.',
    tags: ['AIRCRAFT SYSTEMS', 'PERFORMANCE', 'MASS & BALANCE', 'FLIGHT PLANNING', 'LIMITATIONS']
  },
  finalCta: {
    title: 'Want fleet-wide training instead of an open cohort?',
    desc: "Airlines and operators don't wait for a public calendar date: we schedule custom training around your ops.",
    primaryLabel: 'Talk to Us About Your Team',
    secondaryLabel: 'Browse Training Courses'
  }
}

// Events lists fixed-date, open-enrollment cohorts. Every other discipline
// (Crew Control, Dangerous Goods, Train the Trainer, etc.) is discovered from
// the Services page instead, so only the flagship Flight Dispatch programs
// (EASA and FAA) show here.
const EVENTS_SLUGS = ['flight-dispatcher-double-programme', 'flight-dispatcher-initial-certification', 'aircraft-dispatcher-training-faa-part-65']

export function EventsPage() {
  const navigate = useNavigate()
  const [liveCourses, setLiveCourses] = useState(() => (readPreload('courses') || []).filter((course) => EVENTS_SLUGS.includes(course.slug)))
  const { c } = usePageContent('events', FALLBACK)

  useEffect(() => {
    api
      .listCourses()
      .then((data) => setLiveCourses((data.courses || []).filter((course) => EVENTS_SLUGS.includes(course.slug))))
      .catch(() => {
        // Keep the prerendered/cached cards when the API is slow or down.
      })
  }, [])

  return (
    <div className="bg-white text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="events-page">
      <Seo
        path="/events"
        title="Flight Dispatcher Courses and Start Dates | IFOA"
        description="Open-enrollment flight dispatcher courses in Sønderborg, Denmark · Florida, USA · New Delhi, India, including the Double Program: FAA & EASA. Fees, formats and next intakes."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Courses', path: '/events' }
          ]),
          liveCourses.length > 0 && {
            '@type': 'ItemList',
            name: 'Upcoming IFOA training intakes',
            itemListElement: liveCourses.map((course, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: course.title,
              url: absoluteUrl(`/courses/${course.slug}`)
            }))
          }
        )}
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[460px] md:min-h-[500px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-16 overflow-hidden">
        {/* Ambient Aviation Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Blurred copy fills the sides; the sharp image is fitted to the
              hero height so the whole certificate stays in view. */}
          <img
            src={c.hero.image?.url || bannerEventsHero}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
          />
          <img
            src={c.hero.image?.url || bannerEventsHero}
            alt="IFOA Training Events and Courses"
            className="relative mx-auto h-full w-auto max-w-none object-contain opacity-75 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/70 via-[#020617]/55 to-[#020617]/95" />
        </div>
        <CmsImageButton path="hero.image" className="top-24 right-4 sm:right-6" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center space-y-6 [text-shadow:0_2px_12px_rgba(2,6,23,0.85)] flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            <CmsText path="hero.title" value={c.hero.title} />
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            <CmsText path="hero.subtitle" value={c.hero.subtitle} />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#open-enrollment-programs"
              className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-7 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(52,224,110,0.4)] hover:scale-105 cursor-pointer"
            >
              <CmsText path="hero.primaryLabel" value={c.hero.primaryLabel} />
            </a>
            <a
              href="https://wa.me/41782273103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-200"
            >
              <RiWhatsappFill className="w-4 h-4 text-white" />
              <span>
                <CmsText path="hero.secondaryLabel" value={c.hero.secondaryLabel} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. OPEN ENROLLMENTS & INTAKES */}
      <Reveal as="section" id="open-enrollment-programs" className="py-20 sm:py-24 bg-slate-50/60 border-b border-slate-200/80 scroll-mt-24" data-purpose="open-enrollment-programs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="max-w-2xl space-y-2.5">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="programs.eyebrow" value={c.programs.eyebrow} />
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                <CmsText path="programs.title" value={c.programs.title} />
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                <CmsText path="programs.intro" value={c.programs.intro} />
              </p>
            </div>

          </div>

          {/* Cards Grid: 3 Clean & Compact High-Impact Cards matching Image 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7 max-w-[1280px] mx-auto">
            {/* CARD 0: Double Program FAA + EASA */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={c.programs.imageDouble?.url || doubleProgrammeHero}
                  alt="Double Program: FAA & EASA"
                  className="w-full h-full object-cover object-[center_60%] group-hover:scale-105 transition-transform duration-700"
                />
                <CmsImageButton path="programs.imageDouble" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Program badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-950 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                      FAA & EASA
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                      <img src={logoFaa} alt="FAA" className="h-4 w-auto object-contain" />
                      <img src={logoEasa} alt="EASA" className="h-4 w-auto object-contain" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-800">Double</span>
                    </div>
                  </div>
                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug line-clamp-2 min-h-[48px] flex items-center">
                      Double Program: FAA & EASA
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal min-h-[3.75rem] line-clamp-3">
                      The FAA Part 65 approved course plus ICAO and EASA operations in one program. The FAA issues the license.
                    </p>
                  </div>
                </div>

                {/* Footer: Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/courses/flight-dispatcher-double-programme"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer text-center group/btn"
                    >
                      <span>VIEW DETAILS</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      to="/courses/flight-dispatcher-double-programme/enroll"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer text-center group/btn"
                    >
                      <span>APPLY</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-300 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 1: Flight Dispatcher Initial Training */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={c.programs.imageInitial?.url || easaTarmacHero}
                  alt="Flight Dispatcher Initial"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <CmsImageButton path="programs.imageInitial" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Program badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-950 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                      ICAO DOC 10106
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                      <img src={logoEasa} alt="EASA" className="h-4 w-auto object-contain" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-800">With EASA ops</span>
                    </div>
                  </div>
                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug line-clamp-2 min-h-[48px] flex items-center">
                      Flight Dispatcher Initial
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal min-h-[3.75rem] line-clamp-3">
                      ICAO Doc 10106, with EASA operations. Build the knowledge and skills for an OCC career.
                    </p>
                  </div>
                </div>

                {/* Footer: Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/courses/flight-dispatcher-initial-certification"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer text-center group/btn"
                    >
                      <span>VIEW DETAILS</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      to="/courses/flight-dispatcher-initial-certification/enroll"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer text-center group/btn"
                    >
                      <span>APPLY</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-300 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Aircraft Dispatcher Course */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={c.programs.imageFaa?.url || faaTarmacHero}
                  alt="FAA Aircraft Dispatcher"
                  className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-700"
                />
                <CmsImageButton path="programs.imageFaa" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Program badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-950 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                      FAA PART 65
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200">
                      <img src={logoFaa} alt="FAA" className="h-4 w-auto object-contain" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-800">FAA Approved</span>
                    </div>
                  </div>
                  {/* Title & Desc */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug line-clamp-2 min-h-[48px] flex items-center">
                      FAA Aircraft Dispatcher
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal min-h-[3.75rem] line-clamp-3">
                      FAA Part 65 approved training that prepares you for the FAA Aircraft Dispatcher license.
                    </p>
                  </div>
                </div>

                {/* Footer: Action Buttons */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/courses/aircraft-dispatcher-training-faa-part-65"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-slate-900 text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer text-center group/btn"
                    >
                      <span>VIEW DETAILS</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      to="/courses/aircraft-dispatcher-training-faa-part-65/enroll"
                      className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer text-center group/btn"
                    >
                      <span>APPLY</span>
                      <RiArrowRightSLine className="w-3.5 h-3.5 text-slate-300 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Upcoming courses: route to every start date */}
      <Reveal as="section" className="py-14 sm:py-16 bg-slate-950 text-white" data-purpose="upcoming-courses-cta">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-8 space-y-3">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-white border-b-2 border-[#34E06E] pb-1 inline-block">
              Start dates
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              See what is starting next
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Every upcoming intake in one place: start dates, duration, location and fee for each course.
            </p>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <Link
              to="/upcoming-courses"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-4 px-9 rounded-full text-sm uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 cursor-pointer"
            >
              View upcoming courses
              <RiArrowRightSLine className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* 3. WHAT YOU DEVELOP */}
      <Reveal as="section" className="py-20 sm:py-24 bg-white border-b border-slate-200/80" data-purpose="what-you-develop">
        <div className="max-w-[1280px] mx-auto px-6 space-y-12">
          {/* Header Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end justify-between">
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="develop.eyebrow" value={c.develop.eyebrow} />
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
                <CmsText path="develop.title" value={c.develop.title} />
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                <CmsText path="develop.intro" value={c.develop.intro} />
              </p>
            </div>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                title: 'Anticipate',
                desc: 'Identify developing operational constraints and understand their potential impact before they affect the flight.'
              },
              {
                num: '02',
                title: 'Decide',
                desc: 'Build situational awareness and make structured operational decisions using available information.'
              },
              {
                num: '03',
                title: 'Coordinate',
                desc: "Understand the dispatcher's role within the wider operation and coordinate effectively with operational stakeholders."
              },
              {
                num: '04',
                title: 'Optimize',
                desc: 'Balance safety, compliance, operational constraints and available resources rather than simply following predefined tasks.'
              }
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="group rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-[#34E06E]/40 hover:-translate-y-1.5 transition-all duration-300 p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <span className="text-xs font-mono font-black text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block">
                    {pillar.num}
                  </span>
                  <h3 className="text-xl font-bold text-slate-950 tracking-tight leading-snug group-hover:text-[#34E06E] transition-colors min-h-[1.75rem] flex items-start">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal min-h-[4.5rem]">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* 4. FROM THEORY TO THE AIRCRAFT (B737-NG OPERATIONAL TRAINING) */}
      <Reveal as="section" className="py-16 sm:py-24 bg-[#0a0f1d] text-white border-b border-slate-800" data-purpose="b737-operational-training">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
            {/* Left: message + topic grid */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white border-b-2 border-[#34E06E] pb-1 inline-block">
                  <CmsText path="theoryToAircraft.eyebrow" value={c.theoryToAircraft.eyebrow} />
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] [text-wrap:balance]">
                  <CmsText path="theoryToAircraft.title" value={c.theoryToAircraft.title} />
                </h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                  <CmsText path="theoryToAircraft.intro" value={c.theoryToAircraft.intro} />
                </p>
              </div>

              {/* Topics covered */}
              <div className="grid grid-cols-1 sm:grid-cols-2 rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10 sm:divide-y-0">
                {(c.theoryToAircraft.tags || []).map((tag, idx, all) => (
                  <div
                    key={idx}
                    className={`relative flex items-center gap-3 px-4 py-3.5 bg-white/[0.02] ${
                      idx % 2 === 0 ? 'sm:border-r sm:border-white/10' : ''
                    } ${idx < all.length - (all.length % 2 === 0 ? 2 : 1) ? 'sm:border-b sm:border-white/10' : ''} ${
                      all.length % 2 === 1 && idx === all.length - 1 ? 'sm:col-span-2 sm:border-r-0' : ''
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold text-[#34E06E] w-6 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">
                      <CmsText path={`theoryToAircraft.tags.${idx}`} value={tag} />
                    </span>
                    <CmsRemoveItem listPath="theoryToAircraft.tags" index={idx} label="Remove tag" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right: aircraft image, same height as the text column */}
            <div className="relative min-h-[260px] rounded-2xl overflow-hidden border border-white/10 bg-[#0f172a]">
              <img
                src={c.theoryToAircraft.image?.url || multipleAirImg}
                alt="Aircraft operations training"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <CmsImageButton path="theoryToAircraft.image" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* 5. FINAL FLEET-WIDE CTA */}
      <Reveal as="section" className="py-20 sm:py-28 bg-white text-center" data-purpose="events-final-cta">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <div className="relative rounded-[2.5rem] bg-[#020617] border border-white/10 p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-2xl mx-auto">
              <CmsText path="finalCta.title" value={c.finalCta.title} />
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
              <CmsText path="finalCta.desc" value={c.finalCta.desc} />
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/contact')}
                className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-9 py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-xl hover:shadow-[0_0_24px_rgba(52,224,110,0.45)] hover:scale-105 cursor-pointer"
              >
                <CmsText path="finalCta.primaryLabel" value={c.finalCta.primaryLabel} />
              </button>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-200 group"
              >
                <span>
                  <CmsText path="finalCta.secondaryLabel" value={c.finalCta.secondaryLabel} />
                </span>
                <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
