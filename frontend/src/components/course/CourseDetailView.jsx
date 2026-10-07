import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useGoBack } from '@/hooks/useGoBack'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiArrowLeftLine,
  RiArrowDownSLine,
  RiShareForwardLine,
  RiWhatsappFill,
  RiShieldCheckFill,
  RiCalendarEventLine,
  RiMapPin2Line,
  RiStackLine,
  RiCheckboxCircleFill,
  RiUserLine,
  RiGlobalLine,
  RiAwardLine,
  RiInformationLine,
  RiCheckLine
} from 'react-icons/ri'
import { TbClockHour4, TbCertificate, TbBook2 } from 'react-icons/tb'
import { HiArrowUpRight } from 'react-icons/hi2'
import { MdOutlineMail } from 'react-icons/md'

import { mergeContent } from '@/hooks/usePageContent'

// Assets
import { hasEnrollmentForm, enrollPath, courseEditions } from '@/components/course/CourseCard'
import { PriceTag, InrConverter, taxNote } from '@/components/course/PriceTag'
import { OverviewHero, OverviewBlocks, DgProvider, DgSidebar, OverviewEditProvider, useCoursePreview, E as T } from '@/components/course/CourseOverview'
import { CmsText } from '@/components/admin/CmsEditable'
import { getAtPath } from '@/lib/objectPath'
import { api } from '@/lib/api'
import { prefetchCourse } from '@/lib/courseCache'
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'
import logoIcao from '@/assets/shared/standards-logos/logo-icao.webp'
import logoDgca from '@/assets/shared/standards-logos/logo-dgca.webp'
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'

// Shared accordion motion: height eases out long and soft, content fades a
// touch faster so text never shows half-clipped.
const ACCORDION_TRANSITION = {
  height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  opacity: { duration: 0.3, ease: 'easeOut' }
}

const FALLBACK = {
  labels: {
    backLabel: 'All Intakes & Events',
    previewLabel: 'Preview Mode',
    refFallback: 'IFOA Training',
    easaBadge: 'EASA Compliant',
    dgcaBadge: 'DGCA & ICAO Aligned',
    shareLabel: 'Share',
    copiedLabel: 'Copied',
    eyebrowPrimary: 'Professional Aviation Training',
    eyebrowSecondary: 'Flight Dispatch Curriculum',
    easaComplianceBadge: 'EASA ORO.GEN.110 Aligned',
    dgcaComplianceBadge: 'DGCA & ICAO Aligned Training',
    faaComplianceBadge: 'FAA Part 65 Aligned',
    cbtaBadge: 'Competency-Based Training',
    applyOnlineLabel: 'View Course',
    viewModulesLabel: 'View Course Modules',
    outcomesEyebrow: 'Competency Outcomes',
    outcomesTitle: 'Built for Operational Control',
    complianceEyebrow: 'Regulatory & Training Framework',
    complianceTitleEasa: 'EASA & ICAO Training Framework',
    complianceTitleDgca: 'DGCA & ICAO Training Framework',
    complianceTitleFaa: 'FAA & ICAO Training Framework',
    complianceTag1Easa: 'EASA ORO.GEN.110',
    complianceTag1Dgca: 'DGCA CAR',
    complianceTag1Faa: 'FAA 14 CFR Part 65',
    complianceTag2: 'ICAO Doc 10106',
    complianceTag3: 'CBTA Framework',
    glanceLabel: 'Program at a Glance',
    eligibilityEyebrow: 'Eligibility Profile',
    eligibilityTitle: 'Who Should Attend?',
    entryReqEyebrow: 'Admissions',
    entryReqTitle: 'Entry Requirements',
    assessmentEyebrow: 'Evaluation',
    assessmentTitle: 'Assessment',
    certEyebrow: 'On Completion',
    certTitle: 'Certification',
    datesEyebrow: 'Schedule',
    datesTitle: 'Upcoming Courses',
    faqEyebrow: 'Questions',
    faqTitle: 'Frequently Asked Questions',
    admissionsEyebrow: 'Admissions Portal',
    admissionsTitle: 'Ready to Start Your Dispatch Career?',
    admissionsDesc: 'Reserve your seat for the upcoming training or connect directly with our team.',
    admissionsApplyLabel: 'Apply Online ↗',
    admissionsWhatsappLabel: 'WhatsApp Chat',
    sidebarAdmissionsOpenBadge: 'Admissions Open',
    sidebarOverviewLabel: 'Program Overview',
    sidebarTuitionLabel: 'Training Fee',
    sidebarTuitionNote: '+ 18% GST / Track · Inclusive of official materials',
    sidebarEnrollLabel: 'Enroll Now - Apply Online ↗',
    sidebarWhatsappLabel: 'Inquire on WhatsApp',
    sidebarDurationLabel: 'Duration',
    sidebarIntakeLabel: 'Next Course',
    sidebarLocationLabel: 'Training Location',
    sidebarDeliveryLabel: 'Format',
    sidebarStandardLabel: 'Standard',
    sidebarStandardValueEasa: 'EASA-Compliant',
    sidebarStandardValueDgca: 'DGCA / EASA Aligned',
    sidebarStandardValueFaa: 'FAA Part 65',
    sidebarCertificateLabel: 'Certificate',
    sidebarCertificateValue: 'IFOA Certificate of Completion',
    sidebarSupportTitle: 'Admissions Support',
    sidebarSupportDesc: 'Questions about eligibility or group bookings?'
  },
  curriculum: {
    eyebrow: 'Curriculum Framework',
    title: 'What the Flight Dispatch Program Covers',
    subtitle: 'Structured around the core competencies required for international airline dispatch.',
    phases: [
      {
        num: '01',
        label: 'PHASE 01',
        title: 'The Operating Environment',
        description: 'Establish foundational regulatory frameworks, airspace structure, and air traffic communication systems.',
        topics: [
          'Air Law & Civil Regulations',
          'ICAO / EASA Alignment',
          'Air Traffic Management (ATM)',
          'Aeronautical Communications'
        ]
      },
      {
        num: '02',
        label: 'PHASE 02',
        title: 'Know the Aircraft',
        description: 'Understand modern commercial aircraft systems, performance envelopes, limitations, and flight mechanics.',
        topics: [
          'Aircraft Systems & Avionics',
          'Flight Instrumentation',
          'Principles of Flight & Aerodynamics',
          'Aircraft Performance & Limits'
        ]
      },
      {
        num: '03',
        label: 'PHASE 03',
        title: 'Plan the Flight',
        description: 'Master meteorological analysis, route construction, fuel calculations, and operational flight dispatch releases.',
        topics: [
          'Aviation Navigation & Routes',
          'Synoptic Aeronautical Meteorology',
          'Mass & Balance Calculations',
          'Operational Flight Planning (OFP)'
        ]
      },
      {
        num: '04',
        label: 'PHASE 04',
        title: 'Control the Operation',
        description: 'Execute live flight following, manage real-time deviations, and coordinate airline operational control.',
        topics: [
          'Live OCC Flight Monitoring',
          'Standard Operational Procedures',
          'Crew & Dispatch Human Factors',
          'OCC Operational Coordination'
        ]
      },
      {
        num: '05',
        label: 'PHASE 05',
        title: 'Make the Decision',
        description: 'Apply tactical problem-solving during in-flight emergencies, weather diversions, and high-tempo simulator scenarios.',
        topics: [
          'Tactical Situational Awareness',
          'Risk Assessment & Mitigation',
          'Collaborative Decision Making (CDM)',
          'Complex Scenario Simulator Drills'
        ]
      }
    ]
  }
}

// null when no real date is set - callers fall back to the course's own
// intakeLabel (e.g. "[Next cohort start date]" or "Rolling Admissions")
// instead of a fake hardcoded date.
function formatDate(value, opts = { month: 'long', day: 'numeric', year: 'numeric' }) {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-US', opts)
}

// null when no real amount is set - callers show the course's own price.note
// (e.g. "Contact admissions for current tuition") instead of a fake number.
function formatPrice(price) {
  if (!price || price.amount == null) return null
  const symbol = price.currency === 'INR' ? '₹' : price.currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.amount.toLocaleString('en-US')}`
}

// India: the course itself is 5 weeks (2 online + 3 on-site); the one-week FAA exam is taken separately, in Florida, within 6 months.
const FAA_WEEKS_NOTE = /The 6 weeks include one week for the FAA exams, taken in Florida, USA\./
const FAA_INDIA_NOTE = 'In India the course is 5 weeks (2 online, 3 on-site). The one-week FAA exam is taken separately in Florida, USA, within 6 months.'
function heroForLocation(hero, location) {
  if (location !== 'india' || !hero.blocks?.some((b) => FAA_WEEKS_NOTE.test(b?.note || ''))) return hero
  return { ...hero, blocks: hero.blocks.map((b) => (b?.note ? { ...b, note: b.note.replace(FAA_WEEKS_NOTE, FAA_INDIA_NOTE) } : b)) }
}

// India: comparison tables use the India edition of Flight Dispatcher Initial
// (own duration, location and fee) instead of the Denmark/USA course.
const FDI_NAME = /^Flight Dispatcher Initial$/i
const FDI_INDIA_SLUG = 'flight-dispatcher-initial-training-india'
const FDI_INDIA_CELLS = {
  'issued by': 'IFOA',
  'regulatory focus': 'ICAO',
  duration: '4 weeks',
  location: 'Online preparation, then New Delhi, India',
  format: 'Online preparation, then New Delhi, India',
  fee: '€1,000 + GST'
}
const FAA_NAME = /^FAA Aircraft Dispatcher/i
const INDIA_PLACE = 'Online preparation, then New Delhi, India'
const INDIA_FAA_DURATION = '200 hours, 5 weeks, plus an exam week taken within 6 months'
function tableForIndia(block) {
  const head = block.head || []
  const col = head.findIndex((h) => FDI_NAME.test(String(h).trim()))
  const faaCol = head.findIndex((h) => FAA_NAME.test(String(h).trim()))
  if (col < 1 && faaCol < 1) return block
  return {
    ...block,
    head: head.map((h, i) => (i === col ? 'Flight Dispatcher Initial (India)' : h)),
    rows: block.rows.map((row) => {
      const label = String(row[0]).trim().toLowerCase()
      return row.map((cell, i) => {
        if (i === col) return FDI_INDIA_CELLS[label] ?? cell
        // Other courses: show only their India delivery, not the other locations.
        if (i === faaCol) {
          if (label === 'duration') return INDIA_FAA_DURATION
          if ((label === 'location' || label === 'format') && /Denmark|Sønderborg|Daytona/.test(cell)) return INDIA_PLACE
        }
        return cell
      })
    }),
    links: (block.links || []).map((l) =>
      /\/courses\/flight-dispatcher-initial-certification/.test(l.href || '')
        ? { ...l, label: 'See Flight Dispatcher Initial (India)', href: `/courses/${FDI_INDIA_SLUG}` }
        : l
    )
  }
}

// FAA course taught in India: the Meteorology area also covers Indian meteorology.
function blocksForLocation(blocks, location, slug) {
  if (location !== 'india') return blocks
  const addTopic = (item) =>
    item.title === 'Meteorology' && !item.bullets?.includes(INDIAN_MET)
      ? { ...item, bullets: [...(item.bullets || []), INDIAN_MET] }
      : item
  return blocks.map((b) => {
    if (b.type === 'table') return tableForIndia(b)
    if (b.type === 'accordion' && slug?.includes('part-65')) {
      return { ...b, groups: (b.groups || []).map((g) => ({ ...g, items: (g.items || []).map(addTopic) })) }
    }
    return b
  })
}
const INDIAN_MET = 'Indian meteorology: IMD weather reports and regional hazards'

export function CourseDetailView({ course: savedCourse, preview = false }) {
  const handleBack = useGoBack('/events')
  const liveCourse = useCoursePreview(savedCourse)
  const [searchParams] = useSearchParams()
  const editions = courseEditions(savedCourse?.slug)

  // Location switch: every training location the course's application form
  // offers. A location with its own page (an "edition", e.g. India) links
  // there; any other stays on this page with ?location= set.
  const formSlug = editions ? editions[0].slug : savedCourse?.slug
  const [locationOptions, setLocationOptions] = useState([])
  useEffect(() => {
    if (!formSlug || !hasEnrollmentForm({ slug: formSlug })) return undefined
    let cancelled = false
    api
      .getCourseForm(formSlug)
      .then((data) => {
        const field = (data.sections || []).flatMap((s) => s.fields || []).find((f) => f.id === 'trainingCountry')
        if (!cancelled) setLocationOptions(field?.options || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [formSlug])
  const locationItems = locationOptions.map((opt) => {
    const key = opt.split(/[\s(]/)[0].toLowerCase()
    const edition = editions?.find((e) => e.location === key)
    return { opt, key, label: opt.split('(')[0].trim(), slug: edition?.slug || formSlug }
  })
  // Other location editions load in the background so the switch is instant.
  useEffect(() => {
    editions?.forEach((e) => e.slug !== savedCourse?.slug && prefetchCourse(e.slug))
  }, [editions, savedCourse?.slug])
  const pageEdition = editions?.find((e) => e.slug === savedCourse?.slug)
  const onBasePage = !pageEdition || pageEdition.slug === formSlug
  const homeCity = (savedCourse?.location || '').split(',')[0].trim()
  const defaultItem =
    locationItems.find((i) => i.slug === formSlug && homeCity && i.opt.includes(homeCity)) ||
    locationItems.find((i) => i.slug === formSlug)
  const paramKey = (searchParams.get('location') || '').toLowerCase()
  const activeItem = onBasePage
    ? locationItems.find((i) => i.key === paramKey && i.slug === formSlug) || defaultItem
    : locationItems.find((i) => i.key === pageEdition.location)
  // Chosen location differs from the page's own: sidebar shows it instead.
  const locationOverride = onBasePage && activeItem && activeItem !== defaultItem ? activeItem.opt : null
  const preferredLocation = activeItem?.key || searchParams.get('location') || pageEdition?.location || ''
  // India admissions has its own inbox.
  const supportEmail = preferredLocation === 'india' ? 'info-india@theifoa.com' : 'info@theifoa.com'
  // In the admin editor, the course's text fields come from the editor's
  // in-progress copy; everywhere else this is just the saved course.
  const course = liveCourse?.course && savedCourse ? { ...savedCourse, ...liveCourse.course } : savedCourse

  const [copied, setCopied] = useState(false)
  const [activePhase, setActivePhase] = useState(0)
  const [activeRoleIdx, setActiveRoleIdx] = useState(0)
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0)

  const c = mergeContent(FALLBACK, liveCourse?.courseDetail || course?.content?.courseDetail || {})
  // Page labels: plain strings on the site, click-to-edit in the admin editor.
  const editing = Boolean(liveCourse)
  const C = (group, key) =>
    editing ? <CmsText path={`courseDetail.${group}.${key}`} value={c[group]?.[key]} /> : c[group]?.[key]
  const L = (key) => C('labels', key)
  // Sidebar wording stored on the course itself (spec rows, price note, CTAs).
  const fields = course
  const F = (path) => {
    const value = getAtPath(fields, path)
    return editing && typeof value === 'string' ? <CmsText path={`course.${path}`} value={value} /> : value
  }

  // Desktop layout: the sidebar floats right and sections sit beside it. To leave no
  // empty space next to the sidebar, sections that fit the remaining height are
  // pulled up beside it; one too tall for the space (e.g. the program) goes below,
  // full width, after the sidebar ends.
  const heroRef = useRef(null)
  const asideRef = useRef(null)
  const itemRefs = useRef([])
  const [arrange, setArrange] = useState({ order: null, skipFrom: 0, fillH: 0, asideMin: 0 })
  const [fitTick, setFitTick] = useState(0)
  const blockCount = (liveCourse?.overview || savedCourse?.overview)?.blocks?.length || 0
  useEffect(() => {
    if (!blockCount) return undefined
    const reflow = () => {
      setArrange({ order: null, skipFrom: 0, fillH: 0, asideMin: 0 })
      setFitTick((t) => t + 1)
    }
    reflow()
    window.addEventListener('resize', reflow)
    document.fonts?.ready?.then(reflow)
    return () => window.removeEventListener('resize', reflow)
  }, [blockCount, preferredLocation])
  useLayoutEffect(() => {
    const hero = heroRef.current
    const aside = asideRef.current
    if (!blockCount || !hero || !aside || arrange.order) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const GAP = 64
    const SLACK = 120
    const room = aside.offsetHeight
    let y = hero.offsetHeight + GAP
    const placed = []
    const skipped = []
    let lastH = 0
    for (let i = 0; i < blockCount; i++) {
      const h = itemRefs.current[i]?.offsetHeight || 0
      if (y < room - 24 && y + h <= room + SLACK) {
        placed.push(i)
        lastH = h
        y += h + GAP
      } else skipped.push(i)
    }
    // Stretch the last section beside the sidebar down to the sidebar's bottom edge.
    // If the left side ends lower than the sidebar, stretch the sidebar instead.
    const leftBottom = placed.length ? y - GAP : 0
    const extra = Math.max(0, room - leftBottom)
    setArrange({
      order: [...placed, ...skipped],
      skipFrom: placed.length,
      fillH: placed.length && extra ? lastH + extra : 0,
      asideMin: leftBottom > room ? leftBottom : 0
    })
  }, [arrange, fitTick, blockCount])

  if (!course) return null

  // Price and facts for a location picked in the switch (else the course's own).
  const overridePrice = locationOverride
    ? (course.locationPrices || []).find((p) => p.location === locationOverride)
    : null
  const sidebarPrice = overridePrice ? { amount: overridePrice.amount, currency: overridePrice.currency } : course.price
  const overrideLocationLabel = locationOverride
    ? (() => {
        const m = /^(.*?)\s*\((.*)\)$/.exec(locationOverride)
        if (!m) return locationOverride
        const [city, region] = m[2].split(',').map((x) => x.trim())
        if (region === 'Florida') return 'Florida, USA'
        return region && region !== 'Europe' ? `${city}, ${region}` : `${city}, ${m[1].trim()}`
      })()
    : null
  const specOverride = (label = '') => {
    if (!locationOverride) return null
    if (/^location$/i.test(label)) return overrideLocationLabel
    if (/^duration$/i.test(label) && overridePrice?.duration) return overridePrice.duration
    // FAA course taught in New Delhi: same 2 online + 3 on-site split as Flight Dispatcher Initial.
    if (/^format$/i.test(label) && preferredLocation === 'india' && course.slug?.includes('part-65')) return '2 weeks online, 3 weeks on-site'
    if (/^duration$/i.test(label) && preferredLocation === 'india' && course.slug?.includes('part-65')) return '200 h, 5 weeks + ADX self-study'
    return null
  }

  const { schedule = {} } = course
  // OCC consulting is a service, not a course: its fee is scoped per engagement.
  const isConsulting = course.slug?.includes('consulting')
  const isIndiaProgram =
    course.slug?.includes('india') ||
    course.refCode?.includes('IPIN') ||
    course.title?.toLowerCase().includes('india')
  // GST applies to anything taught in India, including another course with India picked in the location switch.
  const taxIsGst = isIndiaProgram || preferredLocation === 'india'
  // Slug/refCode only - course.authority often *mentions* FAA on non-FAA
  // courses too (e.g. the EASA course's authority is "EASA / FAA Part 65
  // Standards" as a comparison), which caused false positives here.
  const isFaaProgram =
    !isIndiaProgram &&
    (course.slug?.includes('faa') ||
      course.slug?.includes('part-65') ||
      course.refCode?.toLowerCase().includes('faa'))

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: course.title,
          url: window.location.href
        })
        .catch(() => { })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  // Role + operation segment explorer (Dangerous Goods only, for now) - the
  // same curriculum reads differently depending on who you are and whether
  // your operation carries DG at all, so this drives phase 04/05's copy below.
  const dgrExplorer =
    course.dgrExplorer?.roles?.length > 0 && course.dgrExplorer?.segments?.length > 0 ? course.dgrExplorer : null
  const activeExplorerRole = dgrExplorer?.roles[activeRoleIdx] || dgrExplorer?.roles[0]
  const activeExplorerSegment = dgrExplorer?.segments[activeSegmentIdx] || dgrExplorer?.segments[0]

  // 5 Phase curriculum structured for professional presentation
  const rawPhaseCurriculum = course.curriculum?.phases?.length
    ? course.curriculum.phases
    : c.curriculum?.phases?.length
      ? c.curriculum.phases
      : FALLBACK.curriculum.phases

  const phaseCurriculum = dgrExplorer
    ? rawPhaseCurriculum.map((phase) =>
      phase.adaptive === 'acceptance'
        ? { ...phase, description: activeExplorerSegment.acceptance || phase.description }
        : phase.adaptive === 'loading'
          ? { ...phase, description: activeExplorerSegment.loading || phase.description }
          : phase
    )
    : rawPhaseCurriculum

  const learningOutcomes = course.whatYouWillLearn?.points?.length
    ? course.whatYouWillLearn.points
    : [
      'Plan and prepare complex international flights according to ICAO / EASA standards',
      'Assess operational risks, NOTAMs, weather hazards, and aerodrome constraints',
      'Calculate precise fuel requirements, alternate selection, and payload limitations',
      'Monitor live flights in OCC environments and proactively anticipate disruptions',
      'Support safe operational decision-making in high-workload airline environments',
      'Apply EASA, ICAO, and operator Standard Operating Procedures (SOPs)'
    ]

  const audienceProfiles = (course.whoShouldAttend?.points || []).map((raw) => {
    // In the admin editor each point stays whole so it can be edited as one.
    if (editing) return { title: raw, desc: null }
    const [title, ...rest] = raw.split(/ [ - –-] |: /)
    return rest.length ? { title, desc: rest.join(': ') } : { title: raw, desc: null }
  })

  const entryRequirements = course.entryRequirements?.points || []
  const assessmentPoints = course.certification?.points || []
  const certificationText = course.certification?.text || ''



  // Course-specific overview blocks (approved page copy) replace the fixed
  // section template when present.
  const liveOverview = liveCourse?.overview || course.overview
  const overview = liveOverview?.blocks?.length ? liveOverview : null
  // Red-hatched sidebar border for Dangerous Goods, like a Shipper's Declaration.
  const dgHatch = { background: 'repeating-linear-gradient(-45deg, #C8102E 0 5px, transparent 5px 10px)' }
  // Dangerous Goods: the sidebar card follows the role/operation picked in the page body.
  const dgBlock = overview?.blocks?.find((b) => b.type === 'dgExplorer') || null
  const overviewBlocks = overview
    ? editing
      ? overview.blocks || []
      : blocksForLocation(overview.blocks || [], preferredLocation, course.slug)
    : []
  // Contact links carry the course so the Contact form pre-selects its topic.
  const contactHref = `/contact?course=${course.slug}${preferredLocation ? `&location=${encodeURIComponent(preferredLocation)}` : ''}`
  // A ?location= on this page (e.g. from the India region card) is passed on
  // so the application form opens with that training location selected.
  const baseEnroll = hasEnrollmentForm(course) ? enrollPath(course) : contactHref
  const enrollHref =
    preferredLocation && hasEnrollmentForm(course) && !baseEnroll.includes('location=')
      ? `${baseEnroll}${baseEnroll.includes('?') ? '&' : '?'}location=${encodeURIComponent(preferredLocation)}`
      : baseEnroll
  return (
    <OverviewEditProvider overview={overview} course={editing ? course : null}>
    <DgProvider block={dgBlock}>
    <div
      className={`w-full min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#34E06E] selection:text-slate-950 ${preview ? '' : 'pt-24 pb-16'
        }`}
      data-purpose="course-detail-view"
    >
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-slate-100/60 via-[#eef4f9]/30 to-transparent pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN CONTAINER                                                 */}
      {/* ========================================================================= */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sections flow in one column. The sidebar floats right at the top and each
            section (its own formatting context) sits beside it until the sidebar ends,
            then takes the full width, so no empty space is left beside the sidebar. */}
        <div className="flex flex-col gap-10 sm:gap-14 lg:block max-lg:[&>*]:order-3 lg:[&>*:not(aside)]:mb-16 lg:[&>*:not(aside)]:[contain:layout]">
          {/* ===================================================================== */}
          {/* SIDEBAR: floats right beside the opening sections, then the page runs full width */}
          {/* ===================================================================== */}
          <aside
            ref={asideRef}
            className={`lg:flex lg:flex-col max-lg:!order-2 lg:float-right lg:w-[calc(41.666%-1rem)] xl:w-[calc(33.333%-1.5rem)] lg:ml-8 xl:ml-10 lg:mb-10 text-slate-900 ${
              dgBlock
                ? 'p-1.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
                : 'bg-white border border-slate-200/90 rounded-[2rem] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
            }`}
            style={{ ...(dgBlock ? dgHatch : {}), ...(arrange.asideMin ? { minHeight: arrange.asideMin } : {}) }}
            aria-label="Program overview"
          >
            <div className={`lg:flex-1 lg:flex lg:flex-col lg:justify-between ${dgBlock ? 'bg-white rounded-xl p-6 sm:p-7 space-y-6' : 'space-y-6'}`}>
            {dgBlock ? (
              <DgSidebar block={dgBlock} contactHref={contactHref} />
            ) : (
              <>
            {/* Header & Price / Rate Display */}
            <div>
              <div>
                {course.isCorporate ? (
                  <>
                    <span className="block text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">
                      {isConsulting ? 'Consulting Fee' : L('sidebarTuitionLabel')}
                    </span>
                    <strong className="block text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight mt-0.5">
                      {fields.rateCard?.value && fields.rateCard.value !== 'Corporate Rate' ? F('rateCard.value') : 'Training Fee'}
                    </strong>
                    <p className="text-sm text-slate-700 font-normal mt-2 leading-relaxed">
                      {F('rateCard.note') ||
                        "Custom quote, based on group size and delivery format, tailored to the operator's operational environment."}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="block text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">
                      {L('sidebarTuitionLabel')}
                    </span>
                    <strong className="block text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight mt-0.5">
                      {formatPrice(sidebarPrice) ? <PriceTag price={sidebarPrice} /> : 'Contact for Pricing'}
                    </strong>
                    {taxNote(sidebarPrice, taxIsGst) && (
                      <span className="block text-sm font-semibold text-slate-800 mt-1.5">{taxNote(sidebarPrice, taxIsGst)}</span>
                    )}
                    {taxIsGst && <InrConverter price={sidebarPrice} />}
                    <small className="block text-sm text-slate-700 font-normal mt-2 leading-relaxed">
                      {F('price.note') ||
                        (formatPrice(course.price)
                          ? isIndiaProgram
                            ? '+ 18% GST / Track · Inclusive of official materials'
                            : 'Inclusive of official study materials & exam certification'
                          : 'Contact admissions for current tuition')}
                    </small>
                  </>
                )}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5">
              {course.isCorporate ? (
                <>
                  <Link
                    to={contactHref}
                    className="w-full block text-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-5 rounded-full text-xs uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    {course.ctaLabel || 'Request a Corporate Quote'}
                  </Link>

                  <Link
                    to={contactHref}
                    className="w-full block text-center bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold py-3 px-4 rounded-full text-xs transition-colors cursor-pointer"
                  >
                    {F('rateCard.secondaryCtaLabel') || 'Contact Training Team'}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={enrollHref}
                    className="w-full block text-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-5 rounded-full text-xs uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    {L('sidebarEnrollLabel')}
                  </Link>

                  <a
                    href="https://wa.me/41782273103"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-950 font-bold py-3 px-4 rounded-full text-xs transition-colors cursor-pointer"
                  >
                    <RiWhatsappFill className="w-4 h-4 text-[#25D366]" />
                    <span>{L('sidebarWhatsappLabel')}</span>
                  </a>
                </>
              )}
            </div>

            {/* Specifications Rows */}
            {fields.sidebarSpecs?.length > 0 ? (
              <div className="border-t border-slate-100 pt-3 space-y-1 text-[13px] sm:text-sm">
                {fields.sidebarSpecs.map((_, idx) => (
                  // One line per row: label never wraps, a value too long for the card ends in "…" (full text on hover).
                  <div key={idx} className="flex justify-between items-center gap-3 py-2 border-b border-slate-200/80 whitespace-nowrap">
                    <span className="text-slate-600 font-medium shrink-0">{F(`sidebarSpecs.${idx}.label`)}</span>
                    <strong
                      className="font-bold text-slate-950 text-right min-w-0 truncate"
                      title={specOverride(fields.sidebarSpecs[idx]?.label) || fields.sidebarSpecs[idx]?.value || undefined}
                    >
                      {specOverride(fields.sidebarSpecs[idx]?.label) || F(`sidebarSpecs.${idx}.value`)}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-3 space-y-3 text-xs sm:text-[13px]">
                <div className="flex justify-between items-center gap-4 py-1.5 border-b border-slate-100/70">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0">
                    <TbClockHour4 className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarDurationLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 text-right">{course.duration ? <T o={course} k="duration" /> : '5 Weeks'}</strong>
                </div>

                <div className="flex justify-between items-center gap-4 py-1.5 border-b border-slate-100/70">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0">
                    <RiCalendarEventLine className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarIntakeLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 font-mono text-right">
                    {formatDate(schedule.startDate) || (course.intakeLabel && <T o={course} k="intakeLabel" />) || 'Contact for dates'}
                  </strong>
                </div>

                <div className="flex justify-between items-start gap-4 py-1.5 border-b border-slate-100/70">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0 pt-0.5">
                    <RiMapPin2Line className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarLocationLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 text-right leading-snug">
                    {(course.location && <T o={course} k="location" />) || (isIndiaProgram ? 'New Delhi' : 'Online 2 Weeks, 3 Weeks Onsite Sønderborg (Denmark)')}
                  </strong>
                </div>

                <div className="flex justify-between items-center gap-4 py-1.5 border-b border-slate-100/70">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0">
                    <RiStackLine className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarDeliveryLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 text-right">{schedule.mode || (isIndiaProgram ? 'Onsite' : 'Hybrid')}</strong>
                </div>

                <div className="flex justify-between items-center gap-4 py-1.5 border-b border-slate-100/70">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0">
                    <RiShieldCheckFill className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarStandardLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 text-right">
                    {isIndiaProgram
                      ? L('sidebarStandardValueDgca')
                      : isFaaProgram
                        ? L('sidebarStandardValueFaa')
                        : L('sidebarStandardValueEasa')}
                  </strong>
                </div>

                <div className="flex justify-between items-center gap-4 py-1.5">
                  <span className="text-slate-500 font-medium flex items-center gap-2 shrink-0">
                    <TbCertificate className="w-4 h-4 text-slate-400" />
                    <span>{L('sidebarCertificateLabel')}</span>
                  </span>
                  <strong className="font-bold text-slate-950 text-right">{L('sidebarCertificateValue')}</strong>
                </div>
              </div>
            )}

            {overview?.sidebarNote && (
              <p className="text-xs text-slate-600 leading-relaxed"><T o={overview} k="sidebarNote" /></p>
            )}

            {/* Trust Badge at bottom of sidebar */}
            {course.isCorporate && (
              <div className="rounded-2xl bg-emerald-50/90 text-emerald-900 border border-emerald-200/90 p-3 text-center text-xs font-bold">
                {course.rateCard?.trustBadge ? <T o={course.rateCard} k="trustBadge" /> : 'Delivered to 70+ operators worldwide'}
              </div>
            )}

              </>
            )}

            {/* Additional Certification Costs */}
            {course.additionalCosts?.items?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4">
                {course.additionalCosts.intro && (
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 pb-3 mb-1 border-b border-slate-200">
                    {course.additionalCosts.intro}
                  </p>
                )}
                <dl className="divide-y divide-slate-200/70">
                  {course.additionalCosts.items.map((item, idx) => {
                    const isTotal = /^total\b/i.test(item.label || '')
                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-[1fr_auto] items-baseline gap-x-4 ${
                          isTotal ? 'pt-3.5 mt-1 border-t-2 border-slate-900 !divide-y-0' : 'py-2.5'
                        }`}
                      >
                        <dt className={`leading-snug ${isTotal ? 'text-sm font-bold text-slate-950' : 'text-[13px] text-slate-600'}`}>
                          {item.label}
                        </dt>
                        <dd
                          className={`whitespace-nowrap text-right tabular-nums ${
                            isTotal ? 'text-base font-extrabold text-slate-950' : 'text-sm font-semibold text-slate-900'
                          }`}
                        >
                          {item.amount}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
                {course.additionalCosts.note && (
                  <p className="text-slate-600 text-xs leading-relaxed pt-3 mt-1 border-t border-slate-200">
                    {course.additionalCosts.note}
                  </p>
                )}
              </div>
            )}

            {/* Help line */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 text-[13px] sm:text-sm">
              <span className="text-slate-600">{course.isCorporate ? 'Operator inquiries' : L('sidebarSupportTitle')}</span>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-[#16a952] transition-colors"
              >
                <MdOutlineMail className="w-4 h-4 text-slate-500" />
                {supportEmail}
              </a>
            </div>
            </div>
          </aside>

          {/* ===================================================================== */}
          {/* LEFT CONTENT COLUMN (7.5 - 8 Cols)                                    */}
          {/* ===================================================================== */}

            {/* 1. HERO SECTION (Executive, Sleek & Clean) */}
            <section ref={heroRef} id="overview" className="space-y-6 sm:space-y-8 max-lg:!order-1">
              {/* Sleek Breadcrumb & Action Bar */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3 pb-3.5 border-b border-slate-200/80">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs font-medium text-slate-500 min-w-0 max-w-full flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white transition-colors text-[13px] font-semibold shadow-sm group cursor-pointer shrink-0"
                  >
                    <RiArrowLeftLine className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back</span>
                  </button>
                  {locationItems.length > 1 && !editing && (
                    <div className="flex items-center gap-3 min-w-0 max-w-full max-sm:w-full max-sm:order-last">
                      <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 shrink-0">
                        <RiMapPin2Line className="w-4 h-4" />
                        Training location
                      </span>
                      <div
                        className="inline-flex items-center gap-1 h-10 rounded-full bg-white p-1 max-sm:w-full border border-slate-300 shadow-sm max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                        role="tablist"
                        aria-label="Training location"
                      >
                        {locationItems.map((item) => {
                          const active = item === activeItem
                          return (
                            <Link
                              key={item.opt}
                              to={`/courses/${item.slug}?location=${item.key}`}
                              replace
                              preventScrollReset
                              state={{ keepScroll: true }}
                              role="tab"
                              aria-selected={active}
                              className={`max-sm:flex-1 max-sm:text-center inline-flex items-center justify-center h-8 px-2 sm:px-4 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors shrink-0 outline-none ${
                                active
                                  ? 'bg-slate-950 text-white shadow-sm'
                                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:text-slate-950'
                              }`}
                            >
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-auto sm:ml-0 max-sm:self-start">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 h-10 text-[13px] font-semibold text-slate-800 hover:text-slate-950 bg-white hover:bg-slate-100 border border-slate-300 px-4 rounded-full transition-colors shadow-sm cursor-pointer active:scale-95 shrink-0 outline-none focus-visible:bg-slate-100"
                  >
                    <RiShareForwardLine className="w-4 h-4 text-slate-600" />
                    <span>{copied ? L('copiedLabel') : L('shareLabel')}</span>
                  </button>
                </div>
              </div>

              {overview ? (
                <OverviewHero hero={heroForLocation(overview.hero || {}, preferredLocation)} fallbackTitle={course.title} fallbackLead={course.summary} />
              ) : (
                <>
              {/* Title & Authoritative Headline */}
              <div className="space-y-3.5">
                {course.eyebrow && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800">
                    <T o={course} k="eyebrow" />
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-[1.14] [text-wrap:balance]">
                  {course.title ? <T o={course} k="title" /> : 'Flight Dispatcher Initial Certification'}
                </h1>

                {/* Summary Copy */}
                <p className="text-sm sm:text-base md:text-[16px] text-slate-600 font-normal leading-relaxed max-w-3xl">
                  {(course.summary && <T o={course} k="summary" />) ||
                    `A complete ${course.duration || '5-week'} ${isIndiaProgram ? 'DGCA & ICAO' : 'EASA'}-aligned licensing curriculum designed to build technical mastery, situational awareness, and operational command for modern airline operations.`}
                </p>

                {/* Optional single-point clarifying callout */}
                {course.heroNote && (
                  <div className="flex items-start gap-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 max-w-2xl shadow-2xs">
                    <RiInformationLine className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                      <T o={course} k="heroNote" />
                    </span>
                  </div>
                )}
              </div>

              {/* Badges & Regulatory Alignment Strip */}
              {course.badges?.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
                  {course.badges.map((_, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold shadow-xs"
                    >
                      <RiShieldCheckFill className="w-3.5 h-3.5 text-[#34E06E] shrink-0" />
                      <span className="font-mono tracking-tight"><T o={course.badges} k={idx} /></span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-0.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold shadow-xs">
                    <RiShieldCheckFill className="w-3.5 h-3.5 text-[#34E06E] shrink-0" />
                    <span className="font-mono tracking-tight font-bold">
                      {isIndiaProgram
                        ? L('dgcaComplianceBadge')
                        : isFaaProgram
                          ? L('faaComplianceBadge')
                          : L('easaComplianceBadge')}
                    </span>
                  </div>
                  {!isFaaProgram && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold shadow-xs">
                      <RiGlobalLine className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono tracking-tight">ICAO Standard Aligned</span>
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-white text-xs font-semibold shadow-xs">
                    <RiAwardLine className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono tracking-tight">{L('cbtaBadge')}</span>
                  </div>
                </div>
              )}

              {/* Trust Stat Row - shown when admin sets one */}
              {course.trustStat && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs sm:text-sm text-slate-600 font-medium"><T o={course} k="trustStat" /></span>
                </div>
              )}

              {/* Primary Action Area (Clean & Balanced on Mobile & Desktop) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full max-w-lg sm:max-w-none">
                {course.isCorporate ? (
                  <Link
                    to={contactHref}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#34E06E] hover:bg-[#2fe069] active:bg-[#28c85e] text-slate-950 font-bold px-7 py-3.5 rounded-full text-xs sm:text-sm tracking-wide transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 active:scale-[0.98] group cursor-pointer text-center w-full sm:w-auto"
                  >
                    <span>{F('ctaLabel') || 'Request a Corporate Quote'}</span>
                    <HiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : (
                  <Link
                    to={enrollHref}
                    className="inline-flex items-center justify-center gap-2.5 bg-[#34E06E] hover:bg-[#2fe069] active:bg-[#28c85e] text-slate-950 font-bold px-7 py-3.5 rounded-full text-xs sm:text-sm tracking-wide transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 active:scale-[0.98] group cursor-pointer text-center w-full sm:w-auto"
                  >
                    <span>{L('applyOnlineLabel')}</span>
                    <HiArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )}

                <a
                  href="#modules"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 hover:border-slate-900 text-slate-800 font-semibold px-6 py-3.5 rounded-full text-xs sm:text-sm transition-all duration-150 shadow-2xs hover:-translate-y-0.5 group cursor-pointer text-center w-full sm:w-auto"
                >
                  <TbBook2 className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>{L('viewModulesLabel')}</span>
                </a>
              </div>
                </>
              )}
            </section>

            {overview ? (
              (arrange.order || overviewBlocks.map((_, i) => i)).map((bi, pos) => (
                <div
                  key={bi}
                  ref={(el) => {
                    itemRefs.current[bi] = el
                  }}
                  className={
                    arrange.order && pos >= arrange.skipFrom
                      ? 'lg:clear-right'
                      : arrange.fillH && pos === arrange.skipFrom - 1
                        ? 'lg:flex lg:flex-col lg:[&>*]:flex-1 lg:[&>section:not(.grid)]:flex lg:[&>section:not(.grid)]:flex-col lg:[&>section:not(.grid)>:last-child]:flex-1'
                        : ''
                  }
                  style={arrange.fillH && pos === arrange.skipFrom - 1 ? { minHeight: arrange.fillH } : undefined}
                >
                  <OverviewBlocks blocks={[overviewBlocks[bi]]} courseSlug={course.slug} />
                </div>
              ))
            ) : (
              <>
            {/* 2B. ROLE + OPERATION EXPLORER (Dangerous Goods only - dgrExplorer set) */}
            {dgrExplorer && (
              <section className="space-y-8">
                {/* Step 1 - Role */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                      Step 1 • Your Role
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                      What do you actually deal with?
                    </h2>
                  </div>

                  {/* Desktop / Tablet: Expanding Strips (mirrors curriculum phase explorer below) */}
                  <div className="hidden md:flex flex-row items-stretch gap-3.5 w-full h-[380px]">
                    {dgrExplorer.roles.map((role, idx) => {
                      const isActive = activeRoleIdx === idx
                      const roleNum = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`

                      return (
                        <motion.div
                          key={role.code || idx}
                          layout
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          onMouseEnter={() => setActiveRoleIdx(idx)}
                          onClick={() => setActiveRoleIdx(idx)}
                          className={`relative h-full rounded-[2rem] border overflow-hidden cursor-pointer select-none transition-shadow duration-200 ${isActive
                              ? 'flex-[4] min-w-[340px] bg-white border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-7 flex flex-col'
                              : 'flex-[0.6] min-w-[56px] max-w-[80px] bg-white/80 hover:bg-white hover:border-slate-300 border-slate-200/90 shadow-2xs p-3 py-6 flex flex-col items-center justify-between'
                            }`}
                        >
                          {isActive ? (
                            <motion.div
                              key="active-pane"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.12 }}
                              className="flex flex-col h-full w-full overflow-y-auto space-y-4"
                            >
                              {role.code && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white shadow-2xs shrink-0 w-fit">
                                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-200">
                                    Category {role.code}
                                  </span>
                                </div>
                              )}

                              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                <T o={role} k="title" />
                              </h3>

                              {role.scenarios?.length > 0 && (
                                <div className="space-y-2.5 pt-1">
                                  {role.scenarios.map((_, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed"
                                    >
                                      <span className="text-[#0E7A4B] font-bold shrink-0">&rsaquo;</span>
                                      <span><T o={role.scenarios} k={sIdx} /></span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="collapsed-pane"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.12 }}
                              className="flex flex-col items-center justify-between h-full w-full"
                            >
                              <div className="w-8 h-8 rounded-full border border-slate-200/90 bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold shadow-2xs shrink-0">
                                {roleNum}
                              </div>
                              <div className="flex-1 flex items-center justify-center my-4 overflow-hidden w-full">
                                <span className="text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap [writing-mode:vertical-rl] rotate-180 tracking-wide text-center">
                                  <T o={role} k="title" />
                                </span>
                              </div>
                              <div className="text-xs font-mono font-bold text-slate-400 shrink-0">
                                {roleNum}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Mobile: tap-select cards + detail box below */}
                  <div className="md:hidden space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {dgrExplorer.roles.map((role, idx) => {
                        const isSel = activeRoleIdx === idx
                        return (
                          <button
                            key={role.code || idx}
                            type="button"
                            onClick={() => setActiveRoleIdx(idx)}
                            className={`text-left rounded-2xl border-2 p-4 transition-colors cursor-pointer ${isSel ? 'bg-emerald-50/80 border-emerald-500' : 'bg-white border-slate-200/90 hover:border-slate-300'
                              }`}
                          >
                            {role.code && (
                              <div
                                className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-1 ${isSel ? 'text-emerald-700' : 'text-slate-500'
                                  }`}
                              >
                                Category {role.code}
                              </div>
                            )}
                            <div className="text-base font-bold text-slate-950"><T o={role} k="title" /></div>
                          </button>
                        )
                      })}
                    </div>

                    {activeExplorerRole?.scenarios?.length > 0 && (
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                        <div className="text-xs font-bold text-[#0A5E39] uppercase tracking-wider mb-3">
                          What {activeExplorerRole.title} actually deal with
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                          {activeExplorerRole.scenarios.map((_, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                              <span className="text-[#0E7A4B] font-bold shrink-0">&rsaquo;</span>
                              <span><T o={activeExplorerRole.scenarios} k={idx} /></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2 - Operation segment */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                      Step 2 • Your Operation
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                      No-carry isn't a shorter carry course
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {dgrExplorer.segments.map((segment, idx) => {
                      const isSel = activeSegmentIdx === idx
                      return (
                        <button
                          key={segment.id || idx}
                          type="button"
                          onClick={() => setActiveSegmentIdx(idx)}
                          className={`px-5 py-2.5 rounded-full border-2 text-sm font-bold transition-all cursor-pointer ${isSel
                              ? 'bg-emerald-50/80 border-emerald-500 text-[#0A5E39] shadow-xs'
                              : 'bg-white border-slate-200/90 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                          <T o={segment} k="title" />
                        </button>
                      )
                    })}
                  </div>

                  {activeExplorerSegment?.descriptor && (
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 text-sm text-emerald-900 font-medium leading-relaxed">
                      <T o={activeExplorerSegment} k="descriptor" />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3. CURRICULUM FRAMEWORK & INTERACTIVE PHASE EXPLORER (EXPANDS ON HOVER & CLICK) */}
            <section id="modules" className="space-y-6 sm:space-y-7 scroll-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3.5 border-b border-slate-200/80">
                <div className="space-y-1.5">
                  <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                    {course.curriculum?.eyebrow ? <T o={course.curriculum} k="eyebrow" /> : C('curriculum', 'eyebrow')}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {course.curriculum?.title ? <T o={course.curriculum} k="title" /> : C('curriculum', 'title')}
                  </h2>
                  {dgrExplorer && (
                    <p className="text-xs sm:text-sm text-emerald-700 font-semibold">
                      Adapted to {activeExplorerSegment.title}
                    </p>
                  )}
                </div>
                {(course.curriculum?.subtitle || c.curriculum.subtitle) && (
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm sm:text-right font-normal">
                    {course.curriculum?.subtitle ? <T o={course.curriculum} k="subtitle" /> : C('curriculum', 'subtitle')}
                  </p>
                )}
              </div>

              {phaseCurriculum.length <= 5 ? (
                <>
                  {/* Desktop / Tablet: Expanding Strips Accordion (GPU-Accelerated Layout, Zero Ghosting) */}
                  <div className="hidden md:flex flex-row items-stretch gap-3.5 w-full h-[510px]">
                    {phaseCurriculum.map((phase, idx) => {
                      const isActive = activePhase === idx
                      const phaseNum = phase.num || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)
                      const totalPhases = phaseCurriculum.length < 10 ? `0${phaseCurriculum.length}` : `${phaseCurriculum.length}`

                      return (
                        <motion.div
                          key={phase.num || idx}
                          layout
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                          onMouseEnter={() => setActivePhase(idx)}
                          onClick={() => setActivePhase(idx)}
                          className={`relative h-full rounded-[2rem] border overflow-hidden cursor-pointer select-none transition-shadow duration-200 ${isActive
                              ? 'flex-[4] min-w-[340px] bg-white border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-7 flex flex-col justify-between'
                              : 'flex-[0.6] min-w-[56px] max-w-[80px] bg-white/80 hover:bg-white hover:border-slate-300 border-slate-200/90 shadow-2xs p-3 py-6 flex flex-col items-center justify-between'
                            }`}
                        >
                          {isActive ? (
                            <motion.div
                              key="active-pane"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.12 }}
                              className="flex flex-col justify-between h-full w-full"
                            >
                              <div className="space-y-4">
                                {/* Top Header Row */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white shadow-2xs shrink-0">
                                      <span className="w-5 h-5 rounded-full bg-white/20 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                                        {phaseNum}
                                      </span>
                                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-200">
                                        PHASE
                                      </span>
                                    </div>
                                    {phase.adaptive && dgrExplorer && (
                                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                        Adapted
                                      </span>
                                    )}
                                  </div>

                                  <span className="text-[11px] font-mono font-bold tracking-wider text-slate-950 uppercase relative pb-1 border-b-2 border-[#34E06E] shrink-0 select-none">
                                    ACTIVE PHASE
                                  </span>
                                </div>

                                {/* Phase Title & Subtitle */}
                                <div className="space-y-1">
                                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                    <T o={phase} k="title" />
                                  </h3>
                                  <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                                    {phase.description ? <T o={phase} k="description" /> : 'Key operational competencies and syllabus objectives:'}
                                  </p>
                                </div>

                                {/* Syllabus Topics */}
                                {phase.topics?.length > 0 ? (
                                  <div className="space-y-2.5 pt-1">
                                    {phase.topics.map((_, topicIdx) => (
                                      <div
                                        key={topicIdx}
                                        className="p-3.5 px-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/90 transition-all flex items-center gap-3 group shadow-2xs"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-[#34E06E] transition-colors shrink-0" />
                                        <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                          <T o={phase.topics} k={topicIdx} />
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 text-sm text-slate-700">
                                    <T o={phase} k="description" />
                                  </div>
                                )}
                              </div>

                              {/* Footer Row */}
                              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-medium text-slate-400 select-none">
                                <span>
                                  Phase {phaseNum} of {totalPhases}
                                </span>
                                <span>IFOA Training Standard</span>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="collapsed-pane"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.12 }}
                              className="flex flex-col items-center justify-between h-full w-full"
                            >
                              {/* Top Number Box */}
                              <div className="w-8 h-8 rounded-full border border-slate-200/90 bg-slate-100 flex items-center justify-center text-slate-700 font-mono text-xs font-bold shadow-2xs shrink-0">
                                {phaseNum}
                              </div>

                              {/* Vertical Rotated Title */}
                              <div className="flex-1 flex items-center justify-center my-4 overflow-hidden w-full">
                                <span className="text-xs sm:text-sm font-semibold text-slate-600 whitespace-nowrap [writing-mode:vertical-rl] rotate-180 tracking-wide text-center">
                                  <T o={phase} k="title" />
                                </span>
                              </div>

                              {/* Bottom Number */}
                              <div className="text-xs font-mono font-bold text-slate-400 shrink-0">
                                {phaseNum}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Mobile Accordion Stack (< md viewports) */}
                  <div className="md:hidden space-y-3">
                    {phaseCurriculum.map((phase, idx) => {
                      const isActive = activePhase === idx
                      const phaseNum = phase.num || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)
                      const totalPhases = phaseCurriculum.length < 10 ? `0${phaseCurriculum.length}` : `${phaseCurriculum.length}`

                      return (
                        <div
                          key={phase.num || idx}
                          onClick={() => setActivePhase(isActive ? -1 : idx)}
                          className={`rounded-2xl border transition-all duration-300 p-4 cursor-pointer overflow-hidden ${isActive
                              ? 'bg-white border-slate-300 shadow-sm'
                              : 'bg-white/80 border-slate-200/80 hover:bg-white'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-7 h-7 rounded-full bg-slate-950 text-white font-mono font-bold text-xs grid place-items-center shadow-2xs shrink-0">
                                {phaseNum}
                              </span>
                              <span className="font-bold text-sm text-slate-900"><T o={phase} k="title" /></span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {phase.adaptive && dgrExplorer && (
                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                  Adapted
                                </span>
                              )}
                              <motion.span
                                animate={{ rotate: isActive ? 180 : 0 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="text-slate-500 flex items-center justify-center"
                              >
                                <RiArrowDownSLine className="w-5 h-5" />
                              </motion.span>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={ACCORDION_TRANSITION}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                  {phase.description && (
                                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                                      <T o={phase} k="description" />
                                    </p>
                                  )}
                                  {phase.topics?.length > 0 && (
                                    <div className="space-y-2">
                                      {phase.topics.map((_, topicIdx) => (
                                        <div
                                          key={topicIdx}
                                          className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                                        >
                                          <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0" />
                                          <span><T o={phase.topics} k={topicIdx} /></span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
                                    <span>Phase {phaseNum} of {totalPhases}</span>
                                    <span>IFOA Standard</span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                /* Vertical Accordion Stack for Comprehensive Multi-Module Courses (>5 modules) */
                <div className="space-y-3 w-full">
                  {phaseCurriculum.map((phase, idx) => {
                    const isActive = activePhase === idx
                    const phaseNum = phase.num || (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`)
                    const totalPhases = phaseCurriculum.length < 10 ? `0${phaseCurriculum.length}` : `${phaseCurriculum.length}`

                    return (
                      <div
                        key={phase.num || idx}
                        onClick={() => setActivePhase(isActive ? -1 : idx)}
                        onMouseEnter={() => setActivePhase(idx)}
                        className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 cursor-pointer overflow-hidden ${isActive
                            ? 'bg-white border-slate-300 shadow-sm'
                            : 'bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-slate-950 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                              {phaseNum}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-slate-900"><T o={phase} k="title" /></span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-auto">
                            {phase.adaptive && dgrExplorer && (
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                Adapted
                              </span>
                            )}
                            {isActive && (
                              <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-wider text-slate-950 uppercase relative pb-0.5 border-b-2 border-[#34E06E]">
                                ACTIVE MODULE
                              </span>
                            )}
                            <motion.span
                              animate={{ rotate: isActive ? 180 : 0 }}
                              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                              className="text-slate-500 flex items-center justify-center"
                            >
                              <RiArrowDownSLine className="w-5 h-5" />
                            </motion.span>
                          </div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={ACCORDION_TRANSITION}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
                                {phase.description && (
                                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                                    <T o={phase} k="description" />
                                  </p>
                                )}
                                {phase.topics?.length > 0 && (
                                  <div className="space-y-2">
                                    {phase.topics.map((_, topicIdx) => (
                                      <div
                                        key={topicIdx}
                                        className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                                      >
                                        <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0" />
                                        <span><T o={phase.topics} k={topicIdx} /></span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
                                  <span>Module {phaseNum} of {totalPhases}</span>
                                  <span>IFOA Training Standard</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* 4. OPERATIONAL COMPETENCIES */}
            <section className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6 sm:space-y-7">
              <div className="space-y-1.5">
                <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                  {course.whatYouWillLearn?.eyebrow ? <T o={course.whatYouWillLearn} k="eyebrow" /> : L('outcomesEyebrow')}
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-950 tracking-tight">
                  {course.whatYouWillLearn?.title ? <T o={course.whatYouWillLearn} k="title" /> : L('outcomesTitle')}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {learningOutcomes.map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-100/90 hover:bg-slate-50 hover:border-slate-200 transition-colors text-xs sm:text-sm text-slate-800 leading-snug"
                  >
                    <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0 mt-[3px]" />
                    <span><T o={learningOutcomes} k={i} /></span>
                  </div>
                ))}
              </div>

              {/* Process Steps Flow Banner */}
              {course.processSteps?.length > 0 && (
                <div className="pt-2">
                  <div className="rounded-2xl sm:rounded-full bg-emerald-50/80 border border-emerald-200/60 py-3.5 px-5 sm:px-8 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2 text-center">
                    {course.processSteps.map((_, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-[11px] sm:text-xs font-bold sm:font-extrabold uppercase tracking-wider text-[#085A3C]">
                          <T o={course.processSteps} k={idx} />
                        </span>
                        {idx < course.processSteps.length - 1 && (
                          <span className="text-xs sm:text-sm text-[#085A3C]/70 font-semibold select-none">
                            →
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 5. REGULATORY & TRAINING FRAMEWORK (Sleek Dark Aviation Panel) */}
            <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white p-8 sm:p-9 lg:p-10 shadow-lg border border-white/10 space-y-6 sm:space-y-7 relative overflow-hidden">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#34E06E] font-mono text-xs font-bold uppercase tracking-wider">
                  {course.trainingStandards?.eyebrow ? <T o={course.trainingStandards} k="eyebrow" /> : L('complianceEyebrow')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {(course.trainingStandards?.title && <T o={course.trainingStandards} k="title" />) ||
                    (isIndiaProgram
                      ? L('complianceTitleDgca')
                      : isFaaProgram
                        ? L('complianceTitleFaa')
                        : L('complianceTitleEasa'))}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
                {(course.trainingStandards?.intro && <T o={course.trainingStandards} k="intro" />) ||
                  'This curriculum meets rigorous international civil aviation standards, structured in full compliance with applicable EASA Air Operations requirements and ICAO Flight Operations Officer competencies.'}
              </p>

              {course.trainingStandards?.cards?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.trainingStandards.cards.map((card, idx) => (
                    <div
                      key={idx}
                      className="p-4.5 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors space-y-1.5"
                    >
                      <div className="text-sm font-mono font-bold text-[#34E06E]">
                        <T o={card} k="code" />
                      </div>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        <T o={card} k="title" />
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors">
                    <div className="h-10 w-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                      <img
                        src={isIndiaProgram ? logoDgca : isFaaProgram ? logoFaa : logoEasa}
                        alt={isIndiaProgram ? 'DGCA' : isFaaProgram ? 'FAA' : 'EASA'}
                        className="max-h-7 max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white leading-tight">
                        {isIndiaProgram ? 'DGCA CAR Compliant' : isFaaProgram ? L('complianceTag1Faa') : 'EASA ORO.GEN.110'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {isIndiaProgram
                          ? L('complianceTag1Dgca')
                          : isFaaProgram
                            ? 'Aircraft Dispatcher Certification'
                            : 'Air Operations Specification'}
                      </div>
                    </div>
                  </div>

                  {isFaaProgram ? (
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors">
                      <div className="h-10 w-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                        <TbCertificate className="w-6 h-6 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white leading-tight">AC 65-34A</div>
                        <div className="text-[11px] text-slate-400 font-mono">Training Framework</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-colors">
                      <div className="h-10 w-14 bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                        <img src={logoIcao} alt="ICAO" className="max-h-7 max-w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white leading-tight">ICAO Doc 10106</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          FOO / Dispatch Competency
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* TRAINING PHILOSOPHY */}
            {course.trainingPhilosophy?.title && (
              <section className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6 sm:space-y-7">
                <div className="space-y-1.5">
                  {course.trainingPhilosophy.eyebrow && (
                    <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                      <T o={course.trainingPhilosophy} k="eyebrow" />
                    </span>
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    <T o={course.trainingPhilosophy} k="title" />
                  </h2>
                  {course.trainingPhilosophy.intro && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                      <T o={course.trainingPhilosophy} k="intro" />
                    </p>
                  )}
                </div>

                {course.trainingPhilosophy.cards?.length > 0 && (
                  <div className="grid sm:grid-cols-3 gap-3.5">
                    {course.trainingPhilosophy.cards.map((card, idx) => (
                      <div key={idx} className="p-4.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                        <div className="text-sm font-bold text-slate-900"><T o={card} k="title" /></div>
                        <p className="text-xs text-slate-600 leading-relaxed"><T o={card} k="desc" /></p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 6. WHO SHOULD ATTEND (Audience Profile) */}
            <section className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6 sm:space-y-7">
              <div className="border-b border-slate-100 pb-3.5 space-y-1.5">
                <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                  {course.whoShouldAttend?.eyebrow ? <T o={course.whoShouldAttend} k="eyebrow" /> : L('eligibilityEyebrow')}
                </span>
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                  {course.whoShouldAttend?.title ? <T o={course.whoShouldAttend} k="title" /> : L('eligibilityTitle')}
                </h2>
              </div>

              {course.whoShouldAttend?.intro && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs sm:text-sm font-bold text-emerald-900">
                  <RiCheckboxCircleFill className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><T o={course.whoShouldAttend} k="intro" /></span>
                </div>
              )}

              {audienceProfiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {audienceProfiles.map((item, idx) => {
                    const isLastOdd = audienceProfiles.length % 2 === 1 && idx === audienceProfiles.length - 1
                    return item.desc ? (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition-colors space-y-1.5 ${
                          isLastOdd ? 'sm:col-span-2 sm:w-[calc(50%-0.375rem)] sm:mx-auto w-full' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                          <RiUserLine className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-bold text-slate-900">{item.title}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      </div>
                    ) : (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 leading-snug font-medium ${
                          isLastOdd ? 'sm:col-span-2 sm:w-[calc(50%-0.375rem)] sm:mx-auto w-full' : ''
                        }`}
                      >
                        <RiCheckboxCircleFill className="w-4 h-4 text-[#16a952] shrink-0" />
                        <span>{editing ? <T o={course.whoShouldAttend.points} k={idx} /> : item.title}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {course.whoShouldAttend?.outro && (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                  <T o={course.whoShouldAttend} k="outro" />
                </p>
              )}
            </section>

            {/* 7. ENTRY REQUIREMENTS */}
            {entryRequirements.length > 0 && (
              <section className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5 sm:space-y-6">
                <div className="space-y-1.5">
                  <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                    {L('entryReqEyebrow')}
                  </span>
                  <h2 className="text-xl font-bold text-slate-950 tracking-tight">{L('entryReqTitle')}</h2>
                  {course.entryRequirements?.intro && (
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                      <T o={course.entryRequirements} k="intro" />
                    </p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {entryRequirements.map((_, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-snug">
                      <RiCheckboxCircleFill className="w-4 h-4 text-[#16a952] shrink-0 mt-0.5" />
                      <span><T o={entryRequirements} k={idx} /></span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 8 & 9. ASSESSMENT & CERTIFICATION */}
            {(assessmentPoints.length > 0 || certificationText) && (
              <section className="grid sm:grid-cols-2 gap-6 sm:gap-7">
                {assessmentPoints.length > 0 && (
                  <div className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="space-y-1.5">
                      <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                        {L('assessmentEyebrow')}
                      </span>
                      <h2 className="text-lg font-bold text-slate-950 tracking-tight">{L('assessmentTitle')}</h2>
                    </div>
                    <div className="space-y-2.5">
                      {assessmentPoints.map((_, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-snug">
                          <RiCheckboxCircleFill className="w-4 h-4 text-[#16a952] shrink-0 mt-0.5" />
                          <span><T o={assessmentPoints} k={idx} /></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {certificationText && (
                  <div className="rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="space-y-1.5">
                      <span className="inline-block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[#34E06E] pb-0.5 w-fit">
                        {L('certEyebrow')}
                      </span>
                      <h2 className="text-lg font-bold text-slate-950 tracking-tight">{L('certTitle')}</h2>
                    </div>
                    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                      <TbCertificate className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium"><T o={course.certification} k="text" /></p>
                    </div>
                  </div>
                )}
              </section>
            )}


            {/* 12. BOTTOM CALLOUT BANNER */}
            <section
              id="quote"
              className="rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-[#0a1220] to-slate-950 text-white p-8 sm:p-10 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-md">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#34E06E] font-mono text-xs font-bold uppercase tracking-wider">
                  {course.bottomBanner?.eyebrow ? <T o={course.bottomBanner} k="eyebrow" /> : L('admissionsEyebrow')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                  {course.bottomBanner?.title ? <T o={course.bottomBanner} k="title" /> : L('admissionsTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  {course.bottomBanner?.desc ? <T o={course.bottomBanner} k="desc" /> : L('admissionsDesc')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {course.isCorporate ? (
                  <Link
                    to={contactHref}
                    className="inline-flex items-center justify-center gap-2 bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-7 rounded-full text-xs uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{course.bottomBanner?.ctaLabel ? <T o={course.bottomBanner} k="ctaLabel" /> : 'Request a Corporate Quote'}</span>
                  </Link>
                ) : (
                  <Link
                    to={enrollHref}
                    className="inline-flex items-center justify-center gap-2 bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-7 rounded-full text-xs uppercase tracking-wider transition-all duration-150 shadow-[0_4px_20px_rgba(52,224,110,0.35)] hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>{L('admissionsApplyLabel')}</span>
                  </Link>
                )}

                <a
                  href="https://wa.me/41782273103"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold py-3.5 px-5 rounded-full text-xs transition-colors cursor-pointer"
                >
                  <RiWhatsappFill className="w-4 h-4 text-[#25D366]" />
                  <span>{L('admissionsWhatsappLabel')}</span>
                </a>
              </div>
            </section>
              </>
            )}

        </div>

      </div>
    </div>
    </DgProvider>
    </OverviewEditProvider>
  )
}

export default CourseDetailView


