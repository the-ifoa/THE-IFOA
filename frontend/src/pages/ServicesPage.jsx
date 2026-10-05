import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  RiWhatsappFill,
  RiSearchLine,
  RiGroupLine
} from 'react-icons/ri'
import {
  HiArrowRight
} from 'react-icons/hi2'

import { Reveal } from '@/components/common/Reveal'
import { AviationIcon } from '@/components/common/AviationIcon'
import { usePageContent } from '@/hooks/usePageContent'
import { Seo } from '@/components/common/Seo'
import { graph, organizationSchema, breadcrumbSchema, courseListSchema } from '@/lib/seo'
import { CmsText, CmsRemoveItem, CmsAddItem, isPreviewEditMode, CmsImageButton } from '@/components/admin/CmsEditable'

// Standards Logos
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'
import logoIcao from '@/assets/shared/standards-logos/logo-icao.webp'

// Official Discipline Media
import imgFlightDispatch from '@/assets/services/01_flight_dispatch.webp'
import imgDgr from '@/assets/services/02_dangerous_goods.webp'
import imgTrainTrainer from '@/assets/services/03_train_trainer.webp'
import imgHumanFactors from '@/assets/services/04_human_factors.webp'
import imgCrewControl from '@/assets/services/05_crew_control.webp'
import imgConsulting from '@/assets/services/06_consulting.webp'
import imgOccLarge from '@/assets/services/occ-flight-dispatch-large.jpg'

// Discipline card images stay bundled; matched to a discipline by its number.
const DISCIPLINE_IMG_BY_ID = {
  '01': imgFlightDispatch,
  '02': '/course-images/Flight-Dispatch-Webpage-Small.jpg',
  '03': imgDgr,
  '04': imgTrainTrainer,
  '05': imgHumanFactors,
  '06': imgCrewControl,
  '07': imgConsulting
}

// Content the page ships with; editable at /admin/pages/services.
const FALLBACK = {
  hero: {
    title: 'Built on competency, not just compliance.',
    subtitle:
      "Every IFOA course and service in one place. Filter by who it's for, compare length, delivery and price, then open the one you need.",
    primaryLabel: 'Contact Us',
    whatsappLabel: 'WhatsApp Us',
    image: null
  },
  pathways: {
    eyebrow: 'START HERE',
    title: 'Choose your course',
    intro:
      'Dispatcher courses for individuals, and tailored flight dispatch training for operators. Compare length, delivery and price.',
    cards: [
      {
        region: 'Europe · India',
        title: 'Flight Dispatcher Initial',
        desc: 'ICAO and EASA dispatcher training built on ICAO Doc 10106.',
        badge1: '200 HRS · 5 WKS',
        badge2: '€3,500',
        action: 'Enquire'
      },
      {
        region: 'USA',
        title: 'FAA Aircraft Dispatcher',
        desc: 'FAA Part 65 approved. Prepares you for the FAA certificate.',
        badge1: '200 HRS · 6 WKS',
        badge2: '$4,500 USD',
        action: 'Enquire'
      },
      {
        region: 'Europe',
        title: 'Double Programme: FAA & EASA',
        desc: 'FAA Part 65 plus ICAO and EASA operations in one programme.',
        badge1: '280 HRS · 7 WKS',
        badge2: '$5,500 USD',
        action: 'Enquire'
      },
      {
        region: 'Operators',
        title: 'Tailored Dispatch Training',
        desc: 'Initial, recurrent and advanced training built around your operation.',
        badge1: 'ON REQUEST',
        badge2: 'TAILORED',
        action: 'Get a proposal'
      }
    ]
  },
  cbta: {
    eyebrow: 'Competency-Based Training & Assessment (CBTA)',
    title: 'How we train',
    intro:
      "Competency-Based Training and Assessment isn't just a regulatory buzzword, it is the engineering foundation of every curriculum we design, ensuring flight dispatchers are prepared for 3am critical decisions.",
    pillars: [
      {
        idx: '01',
        title: 'Real OCC situations',
        subtitle: 'REAL-WORLD OCC CONTEXT',
        desc: 'Every course is built on scenarios from the operation, not textbook examples.',
        iconName: 'flight-route'
      },
      {
        idx: '02',
        title: 'Taught by practitioners',
        subtitle: 'ACTIVE INDUSTRY PRACTITIONERS',
        desc: 'Instructors who work, or have worked, in operations control.',
        iconName: 'instructor-board'
      },
      {
        idx: '03',
        title: 'Your format',
        subtitle: 'ONSITE, VIRTUAL & HYBRID',
        desc: 'On-site, online or hybrid, depending on the course and your team.',
        iconName: 'occ-console'
      },
      {
        idx: '04',
        title: 'Assessed on performance',
        subtitle: 'COMPETENCY-FOCUSED ASSESSMENT',
        desc: 'You show what you can do, not only what you remember.',
        iconName: 'official-certificate'
      }
    ]
  },
  specialist: {
    eyebrow: 'All Courses and Services',
    title: 'Every IFOA course and service in one place',
    intro:
      "Filter by who it's for, compare length, delivery and price, then open the one you need.",
    note: '',
    searchPlaceholder: 'Search courses and services...',
    disciplineCtaLabel: 'Inquire',
    moreTitle: 'Not sure which course fits?',
    moreDesc:
      "Tell us your role or your team, and we'll point you to the right one.",
    categories: [
      { id: 'all', label: 'All Services (6)' },
      { id: 'flight-ops', label: 'Flight Operations & OCC' },
      { id: 'train-trainer', label: 'Train the Trainer' },
      { id: 'consulting', label: 'Consulting' }
    ],
    disciplines: [
      {
        id: '01',
        title: 'Flight Dispatch',
        subtitle: 'Own the operation from the ground.',
        desc: 'FAA Part 65 approved and ICAO and EASA-based dispatcher courses for individuals, plus tailored initial, recurrent and advanced training for operators.',
        audience: 'Individuals & Operators',
        forAudience: 'individuals operators',
        category: 'flight-ops',
        tag: 'Flight Operations',
        iconName: 'dispatcher-headset',
        image: null,
        // Two pathways exist for this discipline - the card offers both
        // rather than picking one for the visitor.
        courseChoices: [
          { label: 'EASA', courseSlug: 'flight-dispatcher-initial-certification' },
          { label: 'FAA Part 65', courseSlug: 'aircraft-dispatcher-training-faa-part-65' }
        ]
      },
      {
        id: '02',
        title: 'Double Programme: FAA & EASA',
        subtitle: 'Two qualifications, one programme.',
        desc: 'The FAA Part 65 approved course plus ICAO and EASA operations. 280 hours, 7 weeks, plus ADX self-study. Hybrid, Europe. $5,500 USD.',
        audience: 'Individuals',
        forAudience: 'individuals',
        category: 'flight-ops',
        tag: 'FAA & EASA',
        iconName: 'dispatcher-headset',
        image: null,
        courseSlug: 'flight-dispatcher-double-programme'
      },
      {
        id: '02',
        title: 'Dangerous Goods',
        subtitle: 'Know the risks. Move with confidence.',
        desc: 'For pilots, dispatchers and cabin crew, adapted to carry or no-carry operations. Initial and recurrent, 4 hours, self-paced online, virtual or in-house.',
        audience: 'Pilots, Dispatchers & Cabin Crew',
        forAudience: 'operators',
        category: 'flight-ops',
        tag: 'DGR Compliance',
        iconName: 'dgr-flame',
        image: null,
        courseSlug: 'dangerous-goods-regulations-cbta-initial'
      },
      {
        id: '03',
        title: 'Train the Trainer',
        subtitle: 'Turn expertise into exceptional training.',
        desc: 'For aviation professionals who teach. Ten modules and two assessed teaching practices over 4 days, as an open course or in-house.',
        audience: 'Aviation Professionals Who Teach',
        forAudience: 'operators',
        category: 'train-trainer',
        tag: 'Instructional Pedagogy',
        iconName: 'instructor-board',
        image: null,
        courseSlug: 'train-the-trainer-icao-cbta-instructor'
      },
      {
        id: '04',
        title: 'Human Factors for the OCC',
        subtitle: 'Performance under pressure starts with people.',
        desc: 'Not CRM for flight crew. Fatigue, stress, decisions and working alongside AI tools. 2 days at your OCC or an IFOA facility.',
        audience: 'OCC & Flight Operations Personnel',
        forAudience: 'operators',
        category: 'flight-ops',
        tag: 'Human Factors for OCC',
        iconName: 'human-brain-crm',
        image: null,
        courseSlug: 'human-factors-in-the-occ'
      },
      {
        id: '05',
        title: 'Crew Control',
        subtitle: 'Keep the operation moving.',
        desc: 'EASA Part FTL or your OM-A Chapter 7, fatigue risk and crew control operations, with long-haul exercises. 2 days, online or at your base.',
        audience: 'Crew Schedulers & Controllers',
        forAudience: 'operators',
        category: 'flight-ops',
        tag: 'Crew Scheduling',
        iconName: 'crew-roster',
        image: null,
        courseSlug: 'airline-crew-control-flight-rostering'
      },
      {
        id: '06',
        title: 'OCC Consulting',
        subtitle: 'Turn operational challenges into better performance.',
        desc: 'Assessments, operational control setup, manuals, CBTA programmes, audit support and AI readiness. Fixed scope or retainer, on-site or remote.',
        audience: 'Airlines & Aviation Organisations',
        forAudience: 'operators',
        category: 'consulting',
        tag: 'Aviation Advisory',
        iconName: 'airline-audit',
        image: null,
        courseSlug: 'airline-occ-setup-operational-consulting'
      }
    ]
  }
}

export function ServicesPage() {
  const navigate = useNavigate()
  const { c } = usePageContent('services', FALLBACK)
  // ?for=individuals / ?for=operators (linked from the home page) preselects
  // the matching audience filter.
  const [searchParams] = useSearchParams()
  const [selectedDiscipline, setSelectedDiscipline] = useState(() => {
    const forParam = searchParams.get('for')
    return forParam === 'individuals' || forParam === 'operators' ? forParam : 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')

  const REG_LOGOS = [
    { logo: logoEasa },
    { logo: logoFaa },
    { logo: logoEasa, secondLogo: logoFaa },
    { logo: logoIcao }
  ]
  // Each card keeps a `_path` back into the underlying content array (its
  // position there, not its position in this possibly-filtered/reordered
  // display list) so inline edits and remove/add controls write to the
  // right storage slot.
  const certificationPathways = c.pathways.cards.map((card, i) => ({
    ...card,
    ...(REG_LOGOS[i] || {}),
    _path: `pathways.cards.${i}`,
    _index: i
  }))

  const cbtaPillars = (c.cbta?.pillars || FALLBACK.cbta.pillars).map((p, i) => ({
    ...p,
    _path: `cbta.pillars.${i}`,
    _index: i
  }))

  const EXCLUDED_DISCIPLINES = new Set(['ground operations', 'aviation sustainability'])

  const disciplines = (c.specialist?.disciplines || FALLBACK.specialist.disciplines)
    .map((d, originalIndex) => ({ d, originalIndex }))
    .filter(({ d }) => !EXCLUDED_DISCIPLINES.has((d.title || '').trim().toLowerCase()))
    .map(({ d, originalIndex }, index) => {
      const formattedId = String(index + 1).padStart(2, '0')
      const lowerTitle = (d.title || '').toLowerCase()
      let category
      if (lowerTitle.includes('train')) category = 'train-trainer'
      else if (lowerTitle.includes('consulting')) category = 'consulting'
      else category = 'flight-ops'

      return {
        ...d,
        id: formattedId,
        category,
        image: d.image?.url || DISCIPLINE_IMG_BY_ID[formattedId] || DISCIPLINE_IMG_BY_ID[d.id] || imgConsulting,
        _path: `specialist.disciplines.${originalIndex}`,
        _originalIndex: originalIndex
      }
    })

  const categories = [
    { id: 'all', label: `All Services (${disciplines.length})` },
    { id: 'individuals', label: 'For individuals' },
    { id: 'operators', label: 'For operators' },
    { id: 'flight-ops', label: 'Flight Operations & OCC' },
    { id: 'train-trainer', label: 'Train the Trainer' },
    { id: 'consulting', label: 'Consulting' }
  ]

  const filteredDisciplines = disciplines.filter((d) => {
    if (selectedDiscipline === 'individuals' || selectedDiscipline === 'operators') {
      const who = (d.forAudience || 'operators').toLowerCase()
      if (!who.includes('both') && !who.includes(selectedDiscipline)) return false
    } else if (selectedDiscipline !== 'all' && d.category !== selectedDiscipline) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        d.title.toLowerCase().includes(q) ||
        d.desc.toLowerCase().includes(q) ||
        d.audience.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="bg-white text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="services-page">
      <Seo
        path="/services"
        title="Flight Dispatch, Dangerous Goods & OCC Training | IFOA"
        description="Every IFOA course in one place: flight dispatch, dangerous goods, train the trainer, human factors, crew control and OCC consulting."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' }
          ]),
          courseListSchema(
            'IFOA courses and services',
            disciplines
              .flatMap((d) =>
                d.courseChoices?.length
                  ? d.courseChoices.map((ch) => ({ name: `${d.title} (${ch.label})`, description: d.desc, slug: ch.courseSlug }))
                  : [{ name: d.title, description: d.desc, slug: d.courseSlug }]
              )
              .filter((d) => d.slug)
              .map((d) => ({ ...d, path: `/courses/${d.slug}` }))
          )
        )}
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[460px] md:min-h-[500px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-16 overflow-hidden">
        {/* Ambient Aviation Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={c.hero.image?.url || imgOccLarge}
            alt="Aviation Flight Operations Training"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]" />
        </div>
        <CmsImageButton path="hero.image" className="top-24 right-4 sm:right-6" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center space-y-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            <CmsText path="hero.title" value={c.hero.title} />
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            <CmsText path="hero.subtitle" value={c.hero.subtitle} />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-7 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(52,224,110,0.4)] hover:scale-105 cursor-pointer"
            >
              <CmsText path="hero.primaryLabel" value={c.hero.primaryLabel} />
            </button>
            <a
              href="https://wa.me/41782273103"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-200"
            >
              <RiWhatsappFill className="w-4 h-4 text-white" />
              <CmsText path="hero.whatsappLabel" value={c.hero.whatsappLabel} />
            </a>
          </div>
        </div>
      </section>

      {/* 2. SPECIALIST & OPERATIONAL SERVICES (TOP SHOWCASE) */}
      <Reveal as="section" className="py-16 sm:py-24 bg-white border-b border-slate-200/80" data-purpose="specialist-operational-training">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="max-w-2xl space-y-2.5">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="specialist.eyebrow" value={c.specialist.eyebrow} />
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                <CmsText path="specialist.title" value={c.specialist.title} />
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                <CmsText path="specialist.intro" value={c.specialist.intro} />
              </p>
              {c.specialist.note || isPreviewEditMode() ? (
                <p className="text-xs sm:text-sm text-slate-500 font-medium italic">
                  <CmsText path="specialist.note" value={c.specialist.note} />
                </p>
              ) : null}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <RiSearchLine className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={c.specialist.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-slate-200/80 pb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedDiscipline(cat.id)}
                className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedDiscipline === cat.id
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-950 border border-slate-200/90 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Clean & Organized 3-Column Luxury Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredDisciplines.map((item) => (
              <article
                key={item.id}
                className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.22)] transition-[border-color,box-shadow] duration-300 flex flex-col overflow-hidden"
              >
                <CmsRemoveItem listPath="specialist.disciplines" index={item._originalIndex} label="Remove discipline" />
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <CmsImageButton path={`${item._path}.image`} className="top-3 left-3" />
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    {item.tag ? (
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-900 border-b-2 border-[#34E06E] pb-0.5">
                        {item.tag}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-[11px] font-mono font-bold text-slate-300">{item.id}</span>
                  </div>

                  <h3 className="mt-4 text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-snug">
                    <CmsText path={`${item._path}.title`} value={item.title} />
                  </h3>

                  {item.subtitle || isPreviewEditMode() ? (
                    <p className="mt-1 text-sm font-medium text-slate-500 leading-snug">
                      <CmsText path={`${item._path}.subtitle`} value={item.subtitle} />
                    </p>
                  ) : null}

                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    <CmsText path={`${item._path}.desc`} value={item.desc} />
                  </p>

                  {/* Who it's for + actions, pinned to the card bottom */}
                  <div className="mt-auto pt-4">
                    <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <RiGroupLine className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <CmsText path={`${item._path}.audience`} value={item.audience} />
                    </p>
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      {item.courseChoices?.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {item.courseChoices.map((choice) => (
                            <Link
                              key={choice.courseSlug}
                              to={`/courses/${choice.courseSlug}`}
                              className="group/btn inline-flex items-center justify-center gap-1.5 h-9 rounded-full border border-slate-200 text-xs font-bold text-slate-900 hover:bg-slate-950 hover:border-slate-950 hover:text-white transition-colors"
                            >
                              {choice.label}
                              <HiArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          to={item.courseSlug ? `/courses/${item.courseSlug}` : '/events'}
                          className="group/btn flex items-center justify-between text-sm font-bold text-slate-950"
                        >
                          <span>{item.linkText || (item.courseSlug ? 'View course' : c.specialist.disciplineCtaLabel)}</span>
                          <span className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center transition-colors group-hover/btn:bg-[#34E06E] group-hover/btn:text-slate-950">
                            <HiArrowRight className="w-4 h-4" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <CmsAddItem
              listPath="specialist.disciplines"
              label="Add discipline"
              blank={{
                title: 'New Discipline',
                subtitle: '',
                desc: '',
                audience: '',
                category: 'flight-ops',
                tag: '',
                iconName: 'dispatcher-headset',
                image: null
              }}
            />
          </div>
        </div>
      </Reveal>

      {/* 3. CHOOSE YOUR CERTIFICATION PATH */}
      <Reveal as="section" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80" data-purpose="certification-pathways">
        <div className="max-w-[1280px] mx-auto px-6 space-y-12">
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="pathways.eyebrow" value={c.pathways.eyebrow} />
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="pathways.title" value={c.pathways.title} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              <CmsText path="pathways.intro" value={c.pathways.intro} />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {certificationPathways.map((card, idx) => (
              <div
                key={idx}
                className="group relative rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:border-[#34E06E]/40 hover:-translate-y-1.5 p-7 flex flex-col justify-between transition-all duration-300 h-full"
              >
                <CmsRemoveItem listPath="pathways.cards" index={card._index} label="Remove card" />
                <div className="flex flex-col flex-1">
                  {/* Standardized Header Row */}
                  <div className="flex items-start justify-between gap-2 min-h-[2.5rem] mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 line-clamp-2 leading-tight flex-1">
                      <CmsText path={`${card._path}.region`} value={card.region} />
                    </span>
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-950 border-b-2 border-[#34E06E] pb-0.5 whitespace-nowrap shrink-0 ml-2">
                      <CmsText path={`${card._path}.badge2`} value={card.badge2} />
                    </span>
                  </div>

                  {/* Standardized Logo Row */}
                  <div className="h-10 flex items-center gap-3 shrink-0 mb-4">
                    {card.logo && (
                      <img
                        src={card.logo}
                        alt="Regulator Logo"
                        className="h-7 max-h-7 w-auto object-contain"
                      />
                    )}
                    {card.secondLogo && (
                      <img
                        src={card.secondLogo}
                        alt="Second Regulator Logo"
                        className="h-7 max-h-7 w-auto object-contain"
                      />
                    )}
                  </div>

                  {/* Standardized Title Heading */}
                  <div className="min-h-[3.25rem] flex items-start shrink-0 mb-3">
                    <h3 className="text-xl font-bold text-slate-950 tracking-tight leading-snug group-hover:text-[#34E06E] transition-colors line-clamp-2">
                      <CmsText path={`${card._path}.title`} value={card.title} />
                    </h3>
                  </div>

                  {/* Standardized Description Body */}
                  <div className="flex-1 min-h-[5.5rem] mb-4">
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed line-clamp-4">
                      <CmsText path={`${card._path}.desc`} value={card.desc} />
                    </p>
                  </div>
                </div>

                {/* Standardized Footer Row */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0 mt-auto">
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block">
                    <CmsText path={`${card._path}.badge1`} value={card.badge1} />
                  </span>
                  <button
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:text-[#34E06E] transition-colors cursor-pointer group/btn"
                  >
                    <span>
                      <CmsText path={`${card._path}.action`} value={card.action} />
                    </span>
                    <HiArrowRight className="w-3.5 h-3.5 text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
            <CmsAddItem
              listPath="pathways.cards"
              label="Add path"
              blank={{ region: 'New Region', title: 'New Path', desc: '', badge1: '', badge2: '', action: 'Explore' }}
            />
          </div>
        </div>
      </Reveal>

      {/* 4. THE CBTA OPERATIONAL APPROACH (MODERN EXECUTIVE METHODOLOGY) */}
      <Reveal as="section" className="py-20 sm:py-24 bg-white border-b border-slate-200/80" data-purpose="cbta-approach">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header Row */}
          <div className="max-w-3xl space-y-3">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="cbta.eyebrow" value={c.cbta.eyebrow} />
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="cbta.title" value={c.cbta.title} />
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              <CmsText path="cbta.intro" value={c.cbta.intro} />
            </p>
          </div>

          {/* 4 CBTA Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cbtaPillars.map((p, idx) => (
              <div
                key={idx}
                className="group relative rounded-[2rem] bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-[#34E06E]/40 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 p-7 flex flex-col justify-between space-y-5"
              >
                <CmsRemoveItem listPath="cbta.pillars" index={p._index} label="Remove pillar" />
                <div className="space-y-4">
                  {/* Top Step & Icon */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-950 text-[#34E06E] group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-md">
                      <AviationIcon name={p.iconName} className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {p.idx}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block min-h-[1.25rem]">
                      <CmsText path={`${p._path}.subtitle`} value={p.subtitle} />
                    </span>
                    <h3 className="text-lg font-bold text-slate-950 tracking-tight leading-snug min-h-[3.25rem] flex items-start">
                      <CmsText path={`${p._path}.title`} value={p.title} />
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed pt-1 min-h-[4.75rem]">
                    <CmsText path={`${p._path}.desc`} value={p.desc} />
                  </p>
                </div>
              </div>
            ))}
            <CmsAddItem
              listPath="cbta.pillars"
              label="Add pillar"
              blank={{ idx: '05', title: 'New Pillar', subtitle: '', desc: '', iconName: 'flight-route' }}
            />
          </div>
        </div>
      </Reveal>
    </div>
  )
}
