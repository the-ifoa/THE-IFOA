import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { readPreload } from '@/lib/preload'
import { priceText } from '@/components/course/PriceTag'
import flagSwitzerland from '@/assets/shared/flags/flag-switzerland.webp'
import flagUsa from '@/assets/shared/flags/flag-usa.webp'
import flagIndia from '@/assets/shared/flags/flag-india.webp'
import { motion, AnimatePresence } from 'framer-motion'
import { Seo } from '@/components/common/Seo'
import { Reveal } from '@/components/common/Reveal'
import { graph, organizationSchema, ORGANIZATION_ID, SITE_NAME, SITE_URL, SITE_ALTERNATE_NAMES } from '@/lib/seo'
import {
  RiStarFill,
  RiUser3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiGlobalLine,
  RiMapPin2Line,
  RiTimeLine,
  RiCheckLine
} from 'react-icons/ri'
import {
  PiAirplaneTakeoffFill
} from 'react-icons/pi'
import {
  HiArrowUpRight,
  HiArrowRight
} from 'react-icons/hi2'

import { usePageContent } from '@/hooks/usePageContent'
import { useSwipe } from '@/hooks/useSwipe'
import { CmsText, CmsRemoveItem, CmsAddItem, CmsImageButton, isPreviewEditMode } from '@/components/admin/CmsEditable'
import { CosmicParallaxBg } from '@/components/common/CosmicParallaxBg'
import hero3dMockup from '@/assets/home/hero-3d-mockup.webp'
import hero3dMockupPng from '@/assets/home/hero-3d-mockup.webp'

// Tarmac Photography Banners
const easaTarmacHero = '/course-images/EASA.jpeg'
const faaTarmacHero = '/course-images/Part-65.jpeg'
const doubleProgrammeHero = '/course-images/Flight-Dispatch-Webpage-Small.jpg'

// Testimonial Brand Logos
import logoDHL from '@/assets/partners/DHL-150.webp'
import logoAirAlsie from '@/assets/partners/Air-Alsie-150.webp'
import logoJetfly from '@/assets/partners/Jetfly-150.webp'
import logoComlux from '@/assets/partners/Comlux-150.webp'
import logoENAC from '@/assets/partners/ENAC-150.webp'
import logoChallenge from '@/assets/partners/Challenge-Group-150.webp'
import logoAzerbaijan from '@/assets/partners/Azerbaijan-Airlines-150.webp'
import logoSilkWayWest from '@/assets/partners/SWW-150.webp'
import logoDAT from '@/assets/partners/DAT-150.webp'
import logoShankhAir from '@/assets/partners/Shankh-Air-150.webp'

// Official Testimonial Graphic Posters
import cardJetfly from '@/assets/home/testimonial-card-1.webp'
import cardChallenge from '@/assets/home/testimonial-card-2.webp'
import cardDAT from '@/assets/home/testimonial-card-3.webp'
import cardShankh from '@/assets/home/testimonial-card-4.webp'
import cardSilkWayWest from '@/assets/home/testimonial-card-5.webp'
import cardAzerbaijan from '@/assets/home/testimonial-card-6.webp'

// Standards Logos
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'
import logoIcao from '@/assets/shared/standards-logos/logo-icao.webp'
import logoDgca from '@/assets/shared/standards-logos/logo-dgca.webp'

const STANDARD_LOGOS = { icao: logoIcao, faa: logoFaa, easa: logoEasa, dgca: logoDgca }

import imageData from '@/data/image.json'

// Vite eager glob import for all downloaded partner images
const partnerImageModules = import.meta.glob('/src/assets/partners/*.{webp,jpg,jpeg,svg}', {
  eager: true,
  import: 'default'
})

// Compared against item.masterFilename by basename (extension stripped) so this
// stays correct regardless of whether image.json or the files on disk are .png
// or .webp - masterFilename is a frozen WordPress-era snapshot, still .png for
// almost everything, independent of what's actually in src/assets/partners.
const stripExt = (filename) => filename.replace(/\.[^.]+$/, '')

const excludedPartnerBasenames = new Set(
  [
    'astra',
    'DHL-Austria-Initial-Training-Zoom',
    'EANC-2025',
    'cropped-logo_bleu_vert-Identity',
    'FCG-Ops-150',
    // Not part of the "OUR CUSTOMERS" airline/operator list (strategic partners,
    // consultancies, or logos absent from that sheet)
    'Airconomics-Logo-150',
    'Avincis-FKT-150-1',
    'Click-Logo-150',
    'Compass-DeIcing-Consultancy-Logo-150',
    'Dynamic-Advanced-Logo-150',
    'GetJet-Airlines-150',
    'Jester-Logo-150',
    'Jetflite-150-1',
    'Logo-short-Fox-Trot-AeroSolutions',
    'Osprey_logo_PNG',
    'Precadet-Logo-150',
    'X-Operations-150'
  ].map(stripExt)
)

function getCleanPartnerName(label, filename) {
  let name = (label || '').trim()
  for (const suffix of [' 150 1', ' 150', ' 1', ' PNG']) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length)
    }
  }
  name = name.replace(/\s+Logo\s*$/i, '').replace(/^Logo\s+/i, '').replace(/^Logo\s+short\s+/i, '').replace(/^Short\s+/i, '').trim()
  if (filename.includes('Fox-Trot') || filename.includes('Foxtrot')) return 'Foxtrot AeroSolutions'
  if (name.toLowerCase() === 'fcg' || name.toLowerCase() === 'fcg ops') return 'FCG Ops'
  if (name.toLowerCase() === 'avincis fkt') return 'Avincis'
  if (name.toLowerCase() === 'g ops') return 'G-OPS'
  if (name.toLowerCase() === 'wilderoe') return 'Widerøe'
  return name
}

const seenPartnerNames = new Set()
const partnerLogos = []

for (const item of imageData) {
  if (
    (item.category === 'Partner & Airline Logos' || item.type === 'partner_logo') &&
    !excludedPartnerBasenames.has(stripExt(item.masterFilename))
  ) {
    const cleanName = getCleanPartnerName(item.label, item.masterFilename)
    if (!seenPartnerNames.has(cleanName)) {
      seenPartnerNames.add(cleanName)
      // Resolved by the Vite glob above; every marquee logo lives in src/assets/partners
      // as .webp now, but image.json (a snapshot of the old WordPress media library)
      // still lists most of them with their original .png filename.
      const webpFilename = item.masterFilename.replace(/\.(png|jpe?g)$/i, '.webp')
      const localSrc =
        partnerImageModules[`/src/assets/partners/${webpFilename}`] ||
        partnerImageModules[`/src/assets/partners/${item.masterFilename}`]
      partnerLogos.push({
        name: cleanName,
        filename: item.masterFilename,
        url: localSrc
      })
    }
  }
}

// Content the page ships with; editable at /admin/pages/home.
const FALLBACK = {
  hero: {
    eyebrow: 'International Flight Operations Academy',
    title: 'Training for',
    titleHighlight: 'Real-World Operations',
    subtitle:
      'IFOA prepares Flight Dispatchers and OCC teams to anticipate change, make sound decisions, and keep operations moving, because real operations don’t simply follow an exam syllabus.',
    primaryLabel: 'Find a course',
    secondaryLabel: 'For operators',
    stats: [
      { value: '500+', label: 'PROFESSIONALS TRAINED A YEAR' },
      { value: '70+', label: 'OPERATORS TRAINED' },
      { value: 'FAA', label: 'PART 65 APPROVED SCHOOL' },
      { value: '4.7/5', label: 'FROM 458 POST-TRAINING SURVEYS' }
    ]
  },
  featuredCourses: {
    eyebrow: 'OPEN-ENROLLMENT COURSES',
    title: 'Flight dispatcher courses',
    intro: 'For individuals. Apply online, then start on a published date or on rolling admissions.',
    badgeLabel: 'Europe, USA and India'
  },
  regions: {
    eyebrow: 'Where We Train',
    title: 'Flight dispatcher training in Europe, the USA and India',
    intro: 'Train where you plan to work, under the rules you’ll dispatch by.',
    cards: [
      {
        name: 'Europe',
        city: 'Sønderborg, Denmark',
        desc: 'Three courses: Flight Dispatcher Initial (ICAO Doc 10106, with EASA operations, 200 hours, 5 weeks), FAA Aircraft Dispatcher (Part 65 approved course, 200 hours, 6 weeks) and the Double Program: FAA & EASA (280 hours, 7 weeks).',
        link1Label: 'Flight Dispatcher Initial',
        link1Slug: 'flight-dispatcher-initial-certification',
        link2Label: 'FAA Aircraft Dispatcher',
        link2Slug: 'aircraft-dispatcher-training-faa-part-65',
        link3Label: 'Double Program: FAA & EASA',
        link3Slug: 'flight-dispatcher-double-programme'
      },
      {
        name: 'USA',
        city: 'Daytona Beach, Florida',
        desc: 'FAA Aircraft Dispatcher: the Part 65 approved course that prepares you for the FAA license.',
        link1Label: 'FAA Aircraft Dispatcher',
        link1Slug: 'aircraft-dispatcher-training-faa-part-65',
        link2Label: '',
        link2Slug: ''
      },
      {
        name: 'India',
        city: 'New Delhi, India',
        desc: 'Three courses: Flight Dispatcher Initial (ICAO Doc 10106, 4 weeks, online preparation then on-site), FAA Aircraft Dispatcher (Part 65 approved course, 200 hours, 5 weeks, plus an exam week taken within 6 months) and the Double Program: FAA & EASA (280 hours, 7 weeks).',
        link1Label: 'Flight Dispatcher Initial',
        link1Slug: 'flight-dispatcher-initial-training-india',
        link2Label: 'FAA Aircraft Dispatcher',
        link2Slug: 'aircraft-dispatcher-training-faa-part-65',
        link3Label: 'Double Program: FAA & EASA',
        link3Slug: 'flight-dispatcher-double-programme'
      }
    ]
  },
  trustRating: {
    eyebrow: 'Verified Post-Training Feedback',
    title: 'Rated by the people we trained',
    desc: 'Average rating from 458 post-training surveys from 70+ operators. 98% would recommend IFOA.',
    learnMoreLabel: 'Learn more',
    ratingValue: '4.7',
    ratingSuffix: '/5',
    reviewCountLabel: '(458 post-training surveys)',
    badgeLabel: '98% would recommend IFOA'
  },
  pathways: {
    eyebrow: 'For airlines and OCCs',
    title: 'Delivered at your base or online, built around your manuals, fleet and procedures.',
    seeMoreLabel: 'See More',
    cards: [
      {
        category: 'Initial, Recurrent, Advanced',
        title: 'Flight Dispatch for your team',
        desc: 'Tailored initial, recurrent and advanced training, built around your manuals, fleet and regulator.',
        hours: 'Operator Team Training\nOnline or at your base',
        linkText: 'See operator courses',
        url: '/services?for=operators'
      },
      {
        category: 'EASA Part FTL',
        title: 'Crew Control',
        desc: 'EASA Part FTL or your OM-A Chapter 7, with acclimatization and long-haul exercises.',
        hours: '2 Days Intensive Workshop\nOnline or at your base',
        linkText: 'View course',
        courseSlug: 'airline-crew-control-flight-rostering'
      },
      {
        category: 'Dangerous Goods',
        title: 'Dangerous Goods for your crews',
        desc: 'Pilots, dispatchers and cabin crew, adapted to your operation type and DG policy, with expiry tracking.',
        hours: 'No-carry, carry, airline, cargo\nSelf-paced online, live virtual or in-house',
        linkText: 'View course',
        courseSlug: 'dangerous-goods-regulations-cbta-initial'
      },
      {
        category: 'Train the Trainer',
        title: 'Train your instructors',
        desc: 'Train the Trainer in-house, with teaching practice on your own training topics.',
        hours: '4 Days Instructor Course\nDelivered at your base',
        linkText: 'View course',
        courseSlug: 'train-the-trainer-icao-cbta-instructor'
      },
      {
        category: 'Human Factors',
        title: 'Human Factors for the OCC',
        desc: 'Not CRM for flight crew. Fatigue, stress, decisions and working alongside AI tools.',
        hours: '2 Days TEM & Decision Making\nAt your OCC or an IFOA facility',
        linkText: 'View course',
        courseSlug: 'human-factors-in-the-occ'
      },
      {
        category: 'FAA & EASA',
        title: 'Double Program: FAA & EASA',
        desc: 'The FAA Part 65 approved course plus ICAO and EASA operations in one program. The FAA license is issued by the FAA.',
        hours: '280 Hours (7 Weeks) · Hybrid\nDenmark, India · $5,500 USD',
        linkText: 'View course',
        courseSlug: 'flight-dispatcher-double-programme'
      },
      {
        category: 'FAA Part 65',
        title: 'FAA Aircraft Dispatcher',
        desc: 'Prepares you for the FAA Aircraft Dispatcher license. Part 65 approved.',
        hours: '200 Hours (6 Weeks) · Hybrid\nDenmark, USA, India · $4,500 USD',
        linkText: 'View course',
        courseSlug: 'aircraft-dispatcher-training-faa-part-65'
      },
      {
        category: 'ICAO Doc 10106',
        title: 'Flight Dispatcher Initial',
        desc: 'ICAO Doc 10106, with EASA operations.',
        hours: '200 Hours (5 Weeks) · Hybrid\nDenmark · €3,500 (India: 4 Weeks, €1,000 + GST)',
        linkText: 'View course',
        courseSlug: 'flight-dispatcher-initial-certification'
      }
    ]
  },
  network: {
    eyebrow: 'Global Airline Network',
    title: 'Some of the 70+ operators whose staff we’ve trained',
    intro: 'Flight dispatcher training in Europe, the USA and India. Train where you plan to work, under the rules you’ll dispatch by.'
  },
  audience: {
    eyebrow: 'Two Different Needs',
    title: 'Built for careers. Built for operations.',
    intro: '',
    cards: [
      {
        eyebrow: 'For Individuals',
        trackBadge: 'Career Pathway',
        title: 'I want to become a dispatcher',
        desc:
          'FAA Part 65 approved and ICAO-based courses in Europe, the USA and India, with published fees and start dates.',
        bullet1: 'Scenario-based training',
        bullet2: 'FAA Part 65 & ICAO, in Europe, the USA and India',
        ctaLabel: 'See dispatcher courses'
      },
      {
        eyebrow: 'For Airlines',
        trackBadge: 'Airlines & OCC',
        title: 'I train an OCC team',
        desc:
          'Flight dispatch, crew control, dangerous goods, train the trainer and human factors, built around your operation.',
        bullet1: 'Customized operations training',
        bullet2: 'Online or at your base, built around your manuals',
        ctaLabel: 'See operator training'
      }
    ]
  },
  testimonialsSection: {
    eyebrow: 'Verified Industry Feedback',
    title: 'Stories from Those Who Know Us Best',
    intro:
      'Operational expertise, not generic aviation education. Real-world feedback from flight dispatchers, OCC managers, and airline training leaders.',
    visualTabLabel: 'Airline Showcase',
    executiveTabLabel: 'Executive Statements',
    allTabLabel: 'All Feedback'
  },
  framework: {
    eyebrow: 'Training Framework',
    title: 'Built on the standards operators are audited against',
    standards: [
      { title: 'ICAO Doc 10106', logo: 'icao', desc: 'Competency-based training for flight operations officers and dispatchers' },
      { title: 'FAA 14 CFR Part 65', logo: 'faa', desc: 'IFOA is an FAA-approved aircraft dispatcher school' },
      { title: 'EASA Air Operations', logo: 'easa', desc: 'Regulation (EU) 965/2012, taught across our European courses' }
    ]
  },
  beyond: {
    eyebrow: 'Explore IFOA',
    title: 'Careers, insights and opportunities',
    intro: 'Find your next role and stay connected with the people shaping flight dispatch.',
    cards: [
      {
        title: 'Smart Talent',
        desc: 'Our aviation recruitment platform, connecting dispatchers and OCC professionals with operators.',
        linkLabel: 'Visit Smart Talent',
        livePreview: 'yes',
        url: 'https://talent.theifoa.com/'
      },
      {
        title: 'Foxtrot Delta',
        desc: 'Our magazine on flight dispatch and operations control.',
        linkLabel: 'Read Foxtrot Delta',
        url: '/foxtrot-delta'
      }
    ]
  },
  finalCta: {
    eyebrow: 'OPERATIONAL EXCELLENCE',
    title: 'Train for the operation, not only for the exam.',
    desc: 'Find a course, or talk to us about training for your team.',
    findCourseLabel: 'Find a course',
    ctaLabel: 'Talk to us about your team'
  }
}

// Region card links carry the region, so the course's "Apply online" opens
// the form with that training location already selected.
const REGION_LOCATION = { europe: 'denmark', usa: 'united', india: 'india' }
// Flag artwork behind each region card (Europe uses the Swiss headquarters flag).
const REGION_FLAG = { europe: flagSwitzerland, usa: flagUsa, india: flagIndia }

// A live, non-interactive view of another site, scaled down to fill its box. The picture
// behind it stays visible until the page has loaded (or if it cannot be shown).
const PREVIEW_W = 1440
function LivePreview({ url, title }) {
  const box = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = size.w ? size.w / PREVIEW_W : 0
  return (
    <div ref={box} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {scale > 0 && (
        <iframe
          src={url}
          title={title}
          tabIndex={-1}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`absolute left-0 top-0 border-0 origin-top-left pointer-events-none bg-white transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ width: PREVIEW_W, height: size.h / scale, transform: `scale(${scale})` }}
        />
      )}
    </div>
  )
}

// Artwork for the "Beyond the course" cards, matched by card title. `ink` is the colour
// of the number and arrow drawn over the image.
const BEYOND_IMAGE = {
  'smart talent': { src: '/Talent.jpeg', panel: 'bg-[#050f1e]', ink: 'text-white' },
  'foxtrot delta': { src: '/delta.jpeg', panel: 'bg-[#ececec]', ink: 'text-slate-900' }
}

const regionQuery = (name = '') => {
  const loc = REGION_LOCATION[name.trim().toLowerCase()]
  return loc ? `?location=${loc}` : ''
}

export function HomePage() {
  const navigate = useNavigate()
  const { c } = usePageContent('home', FALLBACK)
  const [activePage, setActivePage] = useState(0)
  // Course facts for the hover popups on the "Where we train" cards.
  const [courseBySlug, setCourseBySlug] = useState(() =>
    Object.fromEntries((readPreload('courses') || []).map((course) => [course.slug, course]))
  )
  useEffect(() => {
    api
      .listCourses()
      .then((data) => setCourseBySlug(Object.fromEntries((data.courses || []).map((course) => [course.slug, course]))))
      .catch(() => {
        // Popups simply stay empty when the API is unavailable.
      })
  }, [])

  const testimonials = [
    {
      name: 'Challenge Group',
      role: 'Duty Manager Team Member / Initial Training · 2026',
      company: 'Challenge Group',
      logo: logoChallenge,
      cardImage: cardChallenge,
      invertOnDark: false,
      logoSize: 'h-10 max-w-[150px]',
      quote:
        'In an environment where we rely heavily on automation, revisiting the basics reinforced core principles and improved overall situational understanding.',
      badge: 'Initial Training'
    },
    {
      name: 'Fabrice Laroye',
      role: 'Nominated Person Crew Training / Jetfly',
      company: 'Jetfly',
      logo: logoJetfly,
      cardImage: cardJetfly,
      invertOnDark: true,
      logoSize: 'h-11 max-w-[150px]',
      quote:
        "It's by far the best “DG non-Carry” course I've taken, and it's very relevant to our operations. You highlighted the noticeable items of our OMs and provided specific approval for a better understanding of our crews' day-to-day work and responsibilities.",
      badge: 'Crew Training Accredited'
    },
    {
      name: 'Danish Air Transport',
      role: 'Flight Dispatch Team Member / Recurrent Training · 2025',
      company: 'DAT',
      logo: logoDAT,
      cardImage: cardDAT,
      invertOnDark: false,
      logoSize: 'h-10 max-w-[130px]',
      quote: 'Great training, it was an amazing time',
      badge: 'Recurrent Training'
    },
    {
      name: 'Silk Way West Airlines',
      role: 'Flight Dispatch Team Member / EDTO & Recurrent Training · 2026',
      company: 'Silk Way West Airlines',
      logo: logoSilkWayWest,
      cardImage: cardSilkWayWest,
      invertOnDark: false,
      logoSize: 'h-9 max-w-[150px]',
      quote:
        'The training strengthened my confidence in applying the procedures in real operations.',
      badge: 'EDTO & Recurrent Training'
    },
    {
      name: 'Shankh Aviation',
      role: 'Safety Manager / Train the Trainer · 2025',
      company: 'Shankh Air',
      logo: logoShankhAir,
      cardImage: cardShankh,
      invertOnDark: false,
      logoSize: 'h-9 max-w-[150px]',
      quote:
        'The training session was utterly exceptional, the instructor was exceedingly knowledgeable.',
      badge: 'Train the Trainer'
    },
    {
      name: 'Azerbaijan Airlines',
      role: 'Flight Dispatch Team Member / Recurrent Training · 2026',
      company: 'Azerbaijan Airlines',
      logo: logoAzerbaijan,
      cardImage: cardAzerbaijan,
      invertOnDark: false,
      logoSize: 'h-10 max-w-[160px]',
      quote:
        'The most beneficial part was the scenario-based training and the focus on operational decision-making.',
      badge: 'Recurrent Training'
    },
    {
      name: 'Filipe Sanches',
      role: 'OCC Manager / DHL Austria',
      company: 'DHL Austria',
      logo: logoDHL,
      cardImage: null,
      invertOnDark: false,
      logoSize: 'h-8 max-w-[130px]',
      quote:
        'High-quality and tailored training is vital for Flight Operation personnel, but it is also challenging to find in the market. IFOA provides precisely what a high-standard operator looks for. Choosing IFOA is really a no-brainer, as Training quality and flexibility are always guaranteed.',
      badge: 'Operational Control Certified'
    },
    {
      name: 'Hans Jorgen Westen',
      role: 'Deputy Ground Operations Manager / Air Alsie',
      company: 'Air Alsie',
      logo: logoAirAlsie,
      cardImage: null,
      invertOnDark: true,
      logoSize: 'h-11 max-w-[160px]',
      quote:
        'We selected The International Flight Operations Academy due to the fact, that we rely on high-quality training for our Dispatch staff. The training we received from IFOA was very professional and fully met our expectations. IFOA is highly recommendable.',
      badge: 'Flight Operations Validated'
    },
    {
      name: 'Syed Ahmed Zahid',
      role: 'Head of Operations Control / Comlux',
      company: 'Comlux',
      logo: logoComlux,
      cardImage: null,
      invertOnDark: true,
      logoSize: 'h-12 max-w-[160px]',
      quote:
        "IFOA stands out for several reasons. First and foremost, the depth of expertise and professionalism displayed by your team is truly remarkable. From the instructors' in-depth knowledge to the well-structured curriculum, IFOA's commitment to excellence is evident at every step.",
      badge: 'Operations Control Verified'
    },
    {
      name: 'Norbert Papon',
      role: 'Training Manager Flight Dispatch / ENAC',
      company: 'ENAC',
      logo: logoENAC,
      cardImage: null,
      invertOnDark: true,
      logoSize: 'h-11 max-w-[160px]',
      quote:
        "Collaborating with IFOA has been an enriching experience. Their contributions consistently enhance our programs, especially in the Dispatcher courses and Master's programs, making them more robust and up-to-date.",
      badge: 'Academic Partnership Accredited'
    }
  ]

  const [feedbackTab, setFeedbackTab] = useState('visual') // 'visual' | 'executive' | 'all'

  const filteredTestimonials = testimonials.filter((item) => {
    if (feedbackTab === 'visual') return Boolean(item.cardImage)
    if (feedbackTab === 'executive') return !item.cardImage
    return true
  })

  const [reviewsPerView, setReviewsPerView] = useState(3)

  useEffect(() => {
    const updateReviewsPerView = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) setReviewsPerView(3)
        else if (window.innerWidth >= 640) setReviewsPerView(2)
        else setReviewsPerView(1)
      }
    }
    updateReviewsPerView()
    window.addEventListener('resize', updateReviewsPerView)
    return () => window.removeEventListener('resize', updateReviewsPerView)
  }, [])

  const totalPages = Math.max(1, Math.ceil(filteredTestimonials.length / reviewsPerView))
  const safePage = activePage >= totalPages ? 0 : activePage

  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setActivePage((prev) => (prev + 1) % totalPages)
    }, 7000)
  }, [totalPages])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  const handleNextTestimonial = () => {
    setActivePage((prev) => (prev + 1) % totalPages)
    resetTimer()
  }

  const handlePrevTestimonial = () => {
    setActivePage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
    resetTimer()
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const trainingPathways = c.pathways.cards.map((card, i) => ({
    ...card,
    link: card.url || (card.courseSlug ? `/courses/${card.courseSlug}` : '/services?for=operators'),
    _path: `pathways.cards.${i}`,
    _index: i
  }))

  const [pathwayIndex, setPathwayIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)

  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) setCardsPerView(3)
        else if (window.innerWidth >= 640) setCardsPerView(2)
        else setCardsPerView(1)
      }
    }
    updateCardsPerView()
    window.addEventListener('resize', updateCardsPerView)
    return () => window.removeEventListener('resize', updateCardsPerView)
  }, [])

  const totalPathwayPages = Math.ceil(trainingPathways.length / cardsPerView)

  // Back to the first page when the number of cards per page changes (adjusted during render, not in an effect).
  const [prevCardsPerView, setPrevCardsPerView] = useState(cardsPerView)
  if (prevCardsPerView !== cardsPerView) {
    setPrevCardsPerView(cardsPerView)
    setPathwayIndex(0)
  }

  const handleNextPathway = () => {
    setPathwayIndex((prev) => (prev + 1) % totalPathwayPages)
  }

  const handlePrevPathway = () => {
    setPathwayIndex((prev) => (prev === 0 ? totalPathwayPages - 1 : prev - 1))
  }

  const pathwaySwipe = useSwipe(handlePrevPathway, handleNextPathway)
  const testimonialSwipe = useSwipe(handlePrevTestimonial, handleNextTestimonial)


  return (
    <div className="font-sans text-rocket-dark bg-white">
      <Seo
        path="/"
        title="The IFOA | International Flight Operations Academy"
        description="Flight dispatcher training in Europe, the USA and India. FAA Part 65 and ICAO/EASA courses for individuals, and tailored OCC training for operators."
        jsonLd={graph(
          organizationSchema(),
          {
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            url: SITE_URL,
            name: SITE_NAME,
            alternateName: [...SITE_ALTERNATE_NAMES, 'theifoa.com'],
            publisher: { '@id': ORGANIZATION_ID },
            inLanguage: 'en'
          }
        )}
      />
      {/* BEGIN: HeroSection */}
      <section className="relative w-full min-h-[100svh] sm:min-h-[100dvh] lg:h-[100dvh] lg:max-h-[1080px] text-white overflow-hidden border-b border-white/10 flex flex-col justify-between" data-purpose="hero-content">
        <CosmicParallaxBg
          className="cosmic-parallax-bg min-h-[100svh] sm:min-h-[100dvh] lg:h-full flex flex-col justify-between pt-24 sm:pt-24 lg:pt-22 xl:pt-24 pb-8 sm:pb-5 px-4 sm:px-6 lg:px-8"
          contentClassName="justify-between flex-1 flex flex-col h-full w-full max-w-[1280px] mx-auto"
        >
          {/* Main Hero Grid Content (Auto-centered vertically in available viewport) */}
          <div className="w-full my-auto py-0 sm:py-4 lg:py-1 flex-1 flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center w-full">
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-4 lg:space-y-3.5 xl:space-y-5 text-left">
                {/* Eyebrow Label with Green Underline */}
                <div className="inline-flex items-center pb-1 border-b border-white text-white text-[11px] sm:text-xs font-mono font-medium tracking-widest uppercase w-fit">
                  <span>
                    <CmsText path="hero.eyebrow" value={c.hero.eyebrow} />
                  </span>
                </div>

                {/* Main Headline & Subtitle */}
                <div className="space-y-4 sm:space-y-3.5 max-w-2xl">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
                    <CmsText path="hero.title" value={c.hero.title} /> <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-300">
                      <CmsText path="hero.titleHighlight" value={c.hero.titleHighlight} />
                    </span>
                  </h1>

                  <p className="text-slate-300 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base leading-relaxed max-w-xl font-normal">
                    <CmsText path="hero.subtitle" value={c.hero.subtitle} />
                  </p>

                  <div className="grid grid-cols-1 sm:flex sm:flex-row items-center gap-2.5 sm:gap-4 pt-2 sm:pt-2 w-full sm:w-auto max-w-md sm:max-w-none">
                    <button
                      onClick={() => navigate('/events')}
                      className="liquid-btn group gap-2 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider transition-all shadow-xl cursor-pointer !py-3 sm:!py-3.5 !px-3.5 sm:!px-7 w-full sm:w-auto text-center justify-center"
                    >
                      <span className="leading-none font-bold">
                        <CmsText path="hero.primaryLabel" value={c.hero.primaryLabel} />
                      </span>
                    </button>
                    <button
                      onClick={() => navigate('/services')}
                      className="hidden sm:inline-flex items-center justify-center gap-2 !px-3.5 sm:!px-6 !py-3 sm:!py-3.5 rounded-full border border-white/25 hover:border-white/50 hover:bg-white/10 text-white text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer backdrop-blur-xs group w-full sm:w-auto text-center"
                    >
                      <span>
                        <CmsText path="hero.secondaryLabel" value={c.hero.secondaryLabel} />
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Aircraft & Learning Platform Visual (Perfect Center on Mobile & Desktop) */}
              <div className="order-first lg:order-none lg:col-span-5 relative w-full flex items-center justify-center mx-auto mb-2 sm:my-4 lg:my-0">
                {/* Ambient glow accent behind mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-[#34E06E]/15 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="relative w-full max-w-[300px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[500px] 2xl:max-w-[560px] mx-auto flex items-center justify-center text-center sm:animate-float-slow">
                  <picture className="block w-full text-center">
                    <source srcSet={hero3dMockup} type="image/webp" />
                    <img
                      src={hero3dMockupPng}
                      alt="IFOA Flight Operations Training & Certification Platform"
                      className="w-full max-h-[32vh] sm:max-h-[36vh] lg:max-h-[42vh] xl:max-h-[46vh] object-contain select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)] pointer-events-none mx-auto block"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats & Accreditations Metric Strip (Inside Hero - Viewport-Fitted) */}
          <div className="w-full pt-5 sm:pt-4 border-t border-white/15 mt-6 sm:mt-auto pb-1 sm:pb-2 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-0 sm:divide-y md:divide-y-0 md:divide-x divide-white/15">
              {/* Metric 1 */}
              <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 first:pl-0 space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-white tracking-tight">
                  <CmsText path="hero.stats.0.value" value={c.hero.stats[0].value} />
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-xs font-mono font-bold uppercase tracking-wider text-slate-200 leading-tight">
                  <CmsText path="hero.stats.0.label" value={c.hero.stats[0].label} />
                </p>
              </div>

              {/* Metric 2 */}
              <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 pt-1.5 md:pt-2 space-y-0.5 sm:space-y-1 max-sm:border-l max-sm:border-white/15 max-sm:pl-4">
                <p className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-white tracking-tight">
                  <CmsText path="hero.stats.1.value" value={c.hero.stats[1].value} />
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-xs font-mono font-bold uppercase tracking-wider text-slate-200 leading-tight">
                  <CmsText path="hero.stats.1.label" value={c.hero.stats[1].label} />
                </p>
              </div>

              {/* Metric 3 */}
              <div className="hidden sm:block px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 pt-1.5 md:pt-2 space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-[#34E06E] tracking-tight">
                  <CmsText path="hero.stats.2.value" value={c.hero.stats[2].value} />
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-xs font-mono font-bold uppercase tracking-wider text-[#34E06E] leading-tight">
                  <CmsText path="hero.stats.2.label" value={c.hero.stats[2].label} />
                </p>
              </div>

              {/* Metric 4 */}
              <div className="hidden sm:block px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 pt-1.5 md:pt-2 last:pr-0 space-y-0.5 sm:space-y-1">
                <p className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-extrabold text-white tracking-tight">
                  <CmsText path="hero.stats.3.value" value={c.hero.stats[3].value} />
                </p>
                <p className="text-[10px] sm:text-[11px] md:text-xs font-mono font-bold uppercase tracking-wider text-slate-200 leading-tight">
                  <CmsText path="hero.stats.3.label" value={c.hero.stats[3].label} />
                </p>
              </div>
            </div>
          </div>
        </CosmicParallaxBg>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: Open-Enrollment Programs Section (Themed to website's premium aesthetic) */}
      <Reveal as="section" className="pt-12 sm:pt-16 pb-12 sm:pb-16 bg-white" data-purpose="featured-courses">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 sm:mb-12 gap-6">
            <div className="max-w-2xl space-y-3 text-left">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block">
                <CmsText path="featuredCourses.eyebrow" value={c.featuredCourses?.eyebrow || 'OPEN-ENROLLMENT COURSES'} />
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold tracking-tight text-slate-950 leading-tight">
                <CmsText path="featuredCourses.title" value={c.featuredCourses?.title || 'Flight dispatcher courses'} />
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                <CmsText
                  path="featuredCourses.intro"
                  value={
                    c.featuredCourses?.intro ||
                    'For individuals. Apply online, then start on a published date or on rolling admissions.'
                  }
                />
              </p>
            </div>

            {/* Top-Right Badge: International Open Enrollment (Themed) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white border border-slate-800 text-xs sm:text-sm font-semibold shadow-2xs shrink-0 self-start md:self-auto">
              <RiGlobalLine className="w-4 h-4 text-[#34E06E] shrink-0" />
              <span>
                <CmsText path="featuredCourses.badgeLabel" value={c.featuredCourses?.badgeLabel || 'Europe, USA and India'} />
              </span>
            </div>
          </div>

          {/* Cards Grid: 3 Clean & Compact High-Impact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7 max-w-[1280px] mx-auto">
            {/* CARD 0: Double Program FAA + EASA */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={doubleProgrammeHero}
                  alt="Double Program: FAA & EASA"
                  className="w-full h-full object-cover object-[center_60%] group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
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
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={easaTarmacHero}
                  alt="Flight Dispatcher Initial"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
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
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              {/* Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 select-none">
                <img
                  src={faaTarmacHero}
                  alt="FAA Aircraft Dispatcher"
                  className="w-full h-full object-cover object-[center_35%] group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
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

      {/* BEGIN: Where We Train (Europe, USA, India) */}
      <Reveal as="section" className="py-16 sm:py-20 bg-slate-50/70" data-purpose="where-we-train">
        <div className="max-w-[1280px] mx-auto px-6 space-y-10">
          {/* Section Header */}
          <div className="max-w-2xl space-y-3 text-left">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block">
              <CmsText path="regions.eyebrow" value={c.regions.eyebrow} />
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-[40px] font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="regions.title" value={c.regions.title} />
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              <CmsText path="regions.intro" value={c.regions.intro} />
            </p>
          </div>

          {/* 3-Column Clean Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {c.regions.cards.map((region, i) => {
              const links = [
                { label: region.link1Label, slug: region.link1Slug, n: 1 },
                { label: region.link2Label, slug: region.link2Slug, n: 2 },
                { label: region.link3Label, slug: region.link3Slug, n: 3 }
              ].filter((l) => l.label || isPreviewEditMode())

              return (
                <div
                  key={i}
                  className="group relative rounded-[2rem] border border-white/10 bg-[#020617] text-white shadow-xl hover:shadow-2xl hover:border-[#34E06E]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col text-left"
                >
                  <CmsRemoveItem listPath="regions.cards" index={i} label="Remove region" />
                  <CmsImageButton path={`regions.cards.${i}.image`} className="top-3 left-3" label="Replace flag image" />

                  {/* Flag as the card background, centred behind all the content */}
                  <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none z-0">
                    <img
                      src={region.image?.url || REGION_FLAG[(region.name || '').trim().toLowerCase()] || flagSwitzerland}
                      alt=""
                      className="absolute inset-0 m-auto h-[78%] w-[96%] object-contain mix-blend-screen opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 select-none [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_78%)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/55 via-[#020617]/35 to-[#020617]/75" />
                  </div>

                  {/* Region name and city */}
                  <div className="relative z-10 p-6 sm:p-7 pb-0 space-y-3">
                    <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-900 shadow-sm">
                      <RiMapPin2Line className="w-3.5 h-3.5 text-[#16a952] shrink-0" />
                      <CmsText path={`regions.cards.${i}.city`} value={region.city} />
                    </span>
                    <h3 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                      <CmsText path={`regions.cards.${i}.name`} value={region.name} />
                    </h3>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col p-6 sm:p-7 pt-4">
                    {/* Description */}
                    <p className="mb-6 text-sm text-slate-50 leading-relaxed font-medium [text-shadow:0_1px_10px_rgba(2,6,23,0.95)]">
                      <CmsText path={`regions.cards.${i}.desc`} value={region.desc} />
                    </p>

                    {/* Courses offered here: hover or focus a course for its details */}
                    <div className="relative z-10 pt-6 mt-auto border-t border-white/10">
                      <span className="block mb-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-200 [text-shadow:0_1px_8px_rgba(2,6,23,0.95)]">
                        Available Courses
                      </span>
                      <div className="flex flex-col gap-2.5">
                        {links.map((l) => {
                          const info = courseBySlug[l.slug]
                          const fee = info ? priceText(info.price, (l.slug || '').includes('india')) : null
                          return (
                            <div key={l.n} className="group/link relative">
                              <Link
                                to={l.slug ? (l.slug.startsWith('/') ? l.slug : `/courses/${l.slug}${regionQuery(region.name)}`) : '/events'}
                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/15 bg-[#020617]/75 backdrop-blur-sm hover:bg-[#020617]/90 hover:border-[#34E06E]/60 text-sm font-semibold text-white transition-all duration-200"
                              >
                                <span className="leading-snug">
                                  <CmsText path={`regions.cards.${i}.link${l.n}Label`} value={l.label} />
                                </span>
                                <HiArrowRight className="w-4 h-4 shrink-0 text-slate-400 group-hover/link:text-[#34E06E] group-hover/link:translate-x-1 transition-all duration-200" />
                              </Link>

                              {/* Hover / focus popup with the course facts */}
                              {info && !isPreviewEditMode() && (
                                <div
                                  role="tooltip"
                                  className="pointer-events-none absolute left-0 right-0 bottom-full z-30 mb-2 translate-y-1 opacity-0 transition-all duration-200 group-hover/link:translate-y-0 group-hover/link:opacity-100 group-focus-within/link:translate-y-0 group-focus-within/link:opacity-100"
                                >
                                  <div className="rounded-2xl bg-[#0b1220] text-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-white/15 space-y-2">
                                    <strong className="block text-sm font-extrabold leading-snug">{info.title}</strong>
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                                      {info.duration && (
                                        <>
                                          <dt className="text-slate-400">Duration</dt>
                                          <dd className="font-semibold text-right">{info.duration}</dd>
                                        </>
                                      )}
                                      {fee && (
                                        <>
                                          <dt className="text-slate-400">Fee</dt>
                                          <dd className="font-semibold text-right">{fee}</dd>
                                        </>
                                      )}
                                    </dl>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <CmsAddItem
              listPath="regions.cards"
              label="Add region"
              blank={{ name: 'New Region', city: '', desc: '', link1Label: '', link1Slug: '', link2Label: '', link2Slug: '', link3Label: '', link3Slug: '' }}
            />
          </div>
        </div>
      </Reveal>
      {/* END: Where We Train */}

      {/* BEGIN: Accredited Training Programs Trust & Verified Rating Showcase */}
      <Reveal as="section" className="pt-2 pb-14 sm:pb-16 bg-white" data-purpose="course-trust-rating-banner">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-slate-950 via-[#0B132B] to-[#020617] text-white p-7 sm:p-10 md:p-12 border border-slate-800/80 shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
            {/* Subtle radar contour rings matching IFOA aviation aesthetic */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 1000 400"
            >
              <circle cx="820" cy="200" r="140" stroke="#34E06E" strokeWidth="1" strokeDasharray="4 4" fill="none" />
              <circle cx="820" cy="200" r="230" stroke="white" strokeWidth="1" opacity="0.4" fill="none" />
              <circle cx="820" cy="200" r="330" stroke="#34E06E" strokeWidth="1" opacity="0.3" fill="none" />
              <circle cx="820" cy="200" r="450" stroke="white" strokeWidth="1" opacity="0.2" fill="none" />
              <circle cx="120" cy="80" r="180" stroke="white" strokeWidth="1" opacity="0.2" fill="none" />
              <circle cx="120" cy="80" r="300" stroke="#34E06E" strokeWidth="1" opacity="0.2" fill="none" />
            </svg>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Headline & Description */}
              <div className="lg:col-span-7 space-y-3.5 text-left">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#34E06E] border-b border-[#34E06E]/40 pb-0.5 inline-block">
                  <CmsText path="trustRating.eyebrow" value={c.trustRating.eyebrow} />
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
                  <CmsText path="trustRating.title" value={c.trustRating.title} />
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-xl">
                  <CmsText path="trustRating.desc" value={c.trustRating.desc} />{' '}
                  <button
                    onClick={() => {
                      const el = document.getElementById('testimonials') || document.querySelector('[data-purpose="from-the-operation-grid"]')
                      if (el) el.scrollIntoView({ behavior: 'smooth' })
                      else navigate('/events')
                    }}
                    className="font-bold text-[#34E06E] hover:text-white underline underline-offset-4 transition-colors cursor-pointer inline-block"
                  >
                    <CmsText path="trustRating.learnMoreLabel" value={c.trustRating.learnMoreLabel} />
                  </button>
                </p>
              </div>

              {/* Right Column: Prominent Rating & Vivid Stars */}
              <div className="lg:col-span-5 flex flex-col items-start lg:items-center justify-center space-y-2 lg:border-l lg:border-white/10 lg:pl-8">
                <div className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-sans">
                  <CmsText path="trustRating.ratingValue" value={c.trustRating.ratingValue} />
                  <span className="text-2xl sm:text-3xl md:text-4xl font-medium text-[#34E06E]">
                    <CmsText path="trustRating.ratingSuffix" value={c.trustRating.ratingSuffix} />
                  </span>
                </div>

                {/* Accurate Star Rating (4.7 / 5) */}
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starIndex) => {
                    const val = parseFloat(c.trustRating.ratingValue) || 4.7
                    let fillPercent = Math.max(0, Math.min(100, Math.round((val - (starIndex - 1)) * 100)))
                    // For the fractional 5th star (~4.7), fill 85% so the bottom edge and feet are completely covered, leaving only the right edge unfilled
                    if (starIndex === Math.ceil(val) && val % 1 !== 0) {
                      fillPercent = 85
                    }

                    return (
                      <div key={starIndex} className="relative w-6 h-6 sm:w-8 sm:h-8 shrink-0 select-none">
                        {/* Dimmed background empty star */}
                        <RiStarFill className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                        {/* Gold filled foreground star with fixed width inner child */}
                        {fillPercent > 0 && (
                          <div
                            className="absolute inset-0 overflow-hidden pointer-events-none"
                            style={{ width: `${fillPercent}%` }}
                          >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 shrink-0">
                              <RiStarFill className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFB800] drop-shadow-[0_0_12px_rgba(255,184,0,0.35)]" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-400 tracking-wide font-mono">
                  <CmsText path="trustRating.reviewCountLabel" value={c.trustRating.reviewCountLabel} />
                </p>

                <div className="pt-1.5">
                  <span className="inline-flex items-center text-xs sm:text-sm font-mono font-bold text-[#34E06E] tracking-wide">
                    <CmsText path="trustRating.badgeLabel" value={c.trustRating.badgeLabel} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* BEGIN: Training Pathways Smart Shifting Carousel */}
      <Reveal as="section" className="w-full bg-[#020617] border-t border-white/10 text-white py-12 sm:py-16 overflow-hidden" data-purpose="training-pathways-carousel">
        <div className="max-w-[1280px] mx-auto px-6 space-y-8">
          {/* Header: title on the left, controls on the right */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-[#34E06E] border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="pathways.eyebrow" value={c.pathways.eyebrow} />
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                <CmsText path="pathways.title" value={c.pathways.title} />
              </h2>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/events"
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-[#34E06E] text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-colors duration-200"
              >
                <span>
                  <CmsText path="pathways.seeMoreLabel" value={c.pathways.seeMoreLabel} />
                </span>
                <HiArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  onClick={handlePrevPathway}
                  className="w-9 h-9 rounded-full hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous Pathway"
                >
                  <RiArrowLeftSLine className="w-5 h-5" />
                </button>
                <span className="min-w-[3.25rem] text-center text-xs font-mono font-semibold text-slate-300">
                  0{pathwayIndex + 1} / 0{totalPathwayPages}
                </span>
                <button
                  onClick={handleNextPathway}
                  className="w-9 h-9 rounded-full hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next Pathway"
                >
                  <RiArrowRightSLine className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Slide Window - 100% Clean Grid View with 0 Card Cutoffs */}
          <div className="relative overflow-hidden touch-pan-y" {...pathwaySwipe}>
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${pathwayIndex * 100}%)`
              }}
            >
              {Array.from({ length: totalPathwayPages }).map((_, pageIdx) => {
                const pageCards = trainingPathways.slice(
                  pageIdx * cardsPerView,
                  pageIdx * cardsPerView + cardsPerView
                )
                return (
                  <div
                    key={pageIdx}
                    className="w-full shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                  >
                    {pageCards.map((item, idx) => {
                      // "hours" holds two lines: duration/format, then where or how it is delivered.
                      const [metaA, ...metaRest] = String(item.hours || '').split('\n')
                      const metaB = metaRest.join(' ')
                      return (
                        <div
                          key={idx}
                          className="group relative flex flex-col rounded-[1.5rem] bg-white/[0.04] border border-white/10 p-6 sm:p-7 hover:border-[#34E06E]/50 hover:bg-white/[0.07] hover:shadow-[0_0_0_1px_rgba(52,224,110,0.25),0_18px_40px_-18px_rgba(52,224,110,0.35)] transition-[border-color,background-color,box-shadow] duration-300"
                        >
                          <CmsRemoveItem listPath="pathways.cards" index={item._index} label="Remove pathway" />

                          <span className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#34E06E]">
                            <CmsText path={`${item._path}.category`} value={item.category} />
                          </span>

                          <h3 className="mt-4 text-xl font-bold leading-snug text-white tracking-tight">
                            <CmsText path={`${item._path}.title`} value={item.title} />
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-slate-400">
                            <CmsText path={`${item._path}.desc`} value={item.desc} />
                          </p>

                          {/* Key facts */}
                          <div className="mt-5 mb-6 space-y-2 text-sm text-slate-200">
                            {metaA && (
                              <p className="flex items-start gap-2.5">
                                <RiTimeLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>{metaA}</span>
                              </p>
                            )}
                            {metaB && (
                              <p className="flex items-start gap-2.5">
                                <RiMapPin2Line className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>{metaB}</span>
                              </p>
                            )}
                            {isPreviewEditMode() && (
                              <p className="text-[11px] text-slate-500">
                                Facts (two lines): <CmsText path={`${item._path}.hours`} value={item.hours} />
                              </p>
                            )}
                          </div>

                          <Link
                            to={item.link}
                            className="group/link mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-sm font-bold text-white outline-none focus-visible:text-[#34E06E]"
                          >
                            <span className="group-hover/link:text-[#34E06E] transition-colors">
                              <CmsText path={`${item._path}.linkText`} value={item.linkText} />
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#34E06E] group-hover/link:bg-[#34E06E] group-hover/link:text-slate-950 transition-colors">
                              <HiArrowRight className="h-4 w-4" />
                            </span>
                          </Link>
                        </div>
                      )
                    })}
                    {pageIdx === totalPathwayPages - 1 && (
                      <CmsAddItem
                        listPath="pathways.cards"
                        label="Add pathway"
                        blank={{ category: 'New Category', title: 'New Pathway', desc: '', hours: '', linkText: 'Learn More' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: totalPathwayPages }).map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setPathwayIndex(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${dotIdx === pathwayIndex
                  ? 'w-8 bg-[#34E06E]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </Reveal>


      {/* BEGIN: Global Airline Network Infinite Marquee */}
      <Reveal as="section" className="pt-10 sm:pt-14 pb-10 sm:pb-14 bg-white border-b border-black/5 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 text-center space-y-2 mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
            <CmsText path="network.eyebrow" value={c.network.eyebrow} />
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-rocket-dark">
            <CmsText path="network.title" value={c.network.title} />
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 max-w-2xl mx-auto font-normal">
            <CmsText path="network.intro" value={c.network.intro} />
          </p>
        </div>

        <div className="max-w-[1280px] mx-auto px-6">
          <div className="relative w-full overflow-hidden flex items-center py-2">
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="marquee-viewport flex overflow-hidden select-none w-full">
              <div
                className="flex shrink-0 items-center gap-8 sm:gap-12 animate-marquee pr-8 sm:pr-12 py-2"
                style={{ animationDuration: '60s' }}
              >
                {partnerLogos.map((partner, index) => (
                  <div
                    key={`p1-${partner.name}-${index}`}
                    className="flex items-center justify-center shrink-0 px-1 opacity-90 hover:opacity-100 transition-opacity duration-200"
                    title={partner.name}
                  >
                    <img
                      src={partner.url}
                      alt={partner.name || `Airline Logo ${index + 1}`}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="h-7 sm:h-9 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
              <div
                aria-hidden="true"
                className="flex shrink-0 items-center gap-8 sm:gap-12 animate-marquee pr-8 sm:pr-12 py-2"
                style={{ animationDuration: '60s' }}
              >
                {partnerLogos.map((partner, index) => (
                  <div
                    key={`p2-${partner.name}-${index}`}
                    className="flex items-center justify-center shrink-0 px-1 opacity-90 hover:opacity-100 transition-opacity duration-200"
                    title={partner.name}
                  >
                    <img
                      src={partner.url}
                      alt={partner.name || `Airline Logo ${index + 1}`}
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="h-7 sm:h-9 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      {/* END: Global Airline Network Infinite Marquee */}


      {/* 4. DUAL AUDIENCE VALUE PROPOSITION */}
      <Reveal as="section" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/80" data-purpose="dual-audience">
        <div className="max-w-[1280px] mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="audience.eyebrow" value={c.audience.eyebrow} />
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-rocket-dark leading-tight">
                <CmsText path="audience.title" value={c.audience.title} />
              </h2>
              {c.audience.intro || isPreviewEditMode() ? (
                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  <CmsText path="audience.intro" value={c.audience.intro} />
                </p>
              ) : null}
            </div>
          </div>

          {/* Two audiences, identical structure so both cards line up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              { card: c.audience.cards[0], i: 0, Icon: RiUser3Line, to: '/upcoming-courses', dark: false },
              { card: c.audience.cards[1], i: 1, Icon: PiAirplaneTakeoffFill, to: '/services?for=operators', dark: true }
            ].map(({ card, i, Icon, to, dark }) => (
              <div
                key={i}
                className="rounded-3xl bg-white border border-slate-200/90 p-7 sm:p-9 flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)] transition-shadow duration-300"
              >
                {/* Audience label */}
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                    <CmsText path={`audience.cards.${i}.eyebrow`} value={card.eyebrow} />
                  </span>
                </div>

                <h3 className="mt-6 text-2xl sm:text-[28px] font-bold text-slate-950 tracking-tight leading-tight">
                  <CmsText path={`audience.cards.${i}.title`} value={card.title} />
                </h3>
                <p className="mt-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                  <CmsText path={`audience.cards.${i}.desc`} value={card.desc} />
                </p>

                {/* Highlights */}
                <ul className="mt-6 space-y-2.5">
                  {['bullet1', 'bullet2'].map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-[#34E06E]/15 text-[#16a952] flex items-center justify-center shrink-0">
                        <RiCheckLine className="w-3.5 h-3.5" />
                      </span>
                      <CmsText path={`audience.cards.${i}.${key}`} value={card[key]} />
                    </li>
                  ))}
                </ul>

                {/* Action pinned to the bottom so both cards end level */}
                <div className="mt-auto pt-8">
                  <button
                    type="button"
                    onClick={() => navigate(to)}
                    className={`group w-full flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-colors cursor-pointer ${dark ? 'bg-slate-950 hover:bg-slate-800 text-white' : 'bg-[#34E06E] hover:bg-[#28c85e] text-slate-950'
                      }`}
                  >
                    <CmsText path={`audience.cards.${i}.ctaLabel`} value={card.ctaLabel} />
                    <HiArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
      {/* END: Audience Pathways */}

      {/* BEGIN: From the Operation (testimonials) */}
      <Reveal as="section" className="py-14 sm:py-20 bg-[#f8fafc] border-y border-slate-200/80 text-rocket-dark" data-purpose="from-the-operation-grid">
        <div className="max-w-[1280px] mx-auto px-6 space-y-8">

          {/* Section Header */}
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="testimonialsSection.eyebrow" value={c.testimonialsSection.eyebrow} />
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              <CmsText path="testimonialsSection.title" value={c.testimonialsSection.title} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <CmsText path="testimonialsSection.intro" value={c.testimonialsSection.intro} />
            </p>
          </div>

          {/* Controls: tabs left, pager right */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              {[
                { id: 'visual', label: c.testimonialsSection.visualTabLabel, path: 'testimonialsSection.visualTabLabel' },
                { id: 'executive', label: c.testimonialsSection.executiveTabLabel, path: 'testimonialsSection.executiveTabLabel' },
                { id: 'all', label: c.testimonialsSection.allTabLabel, path: 'testimonialsSection.allTabLabel' }
              ].map((tab) => {
                const isActive = feedbackTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setFeedbackTab(tab.id)
                      setActivePage(0)
                      resetTimer()
                    }}
                    className={`-mb-px pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${isActive ? 'border-[#34E06E] text-slate-950' : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <CmsText path={tab.path} value={tab.label} />
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 pb-2.5 shrink-0">
              <span className="text-xs font-mono font-semibold text-slate-400">
                {String(safePage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
              </span>
              <button
                onClick={handlePrevTestimonial}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-950 hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous reviews"
              >
                <RiArrowLeftSLine className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextTestimonial}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-950 hover:text-white text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next reviews"
              >
                <RiArrowRightSLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Review cards: square media, caption below; every card the same size */}
          <div className="relative overflow-hidden touch-pan-y" {...testimonialSwipe}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${feedbackTab}-${safePage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full"
              >
                {filteredTestimonials
                  .slice(safePage * reviewsPerView, safePage * reviewsPerView + reviewsPerView)
                  .map((item, idx) => (
                    <figure
                      key={idx}
                      className="flex flex-col rounded-2xl bg-white border border-slate-200/90 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {item.cardImage ? (
                        <div className="aspect-square bg-slate-100">
                          <img
                            src={item.cardImage}
                            alt={`${item.company} testimonial`}
                            className="w-full h-full object-cover select-none"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square p-7 sm:p-8 flex flex-col bg-white">
                          <span className="text-5xl font-serif text-[#34E06E] leading-none select-none" aria-hidden="true">
                            “
                          </span>
                          <blockquote className="flex-1 mt-2 text-sm sm:text-[15px] text-slate-700 leading-relaxed line-clamp-[9]">
                            {item.quote}
                          </blockquote>
                          <div className="pt-4 mt-4 border-t border-slate-100">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
                          </div>
                        </div>
                      )}

                      {/* Caption: who it's from and which training */}
                      <figcaption className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 mt-auto">
                        <span className="flex items-center h-7 min-w-0">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.company}
                              className="h-6 max-w-[120px] w-auto object-contain select-none"
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-900 truncate">{item.company}</span>
                          )}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                            {item.badge}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Page dots */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }, (_, pageIdx) => (
                <button
                  key={pageIdx}
                  onClick={() => {
                    setActivePage(pageIdx)
                    resetTimer()
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${safePage === pageIdx ? 'w-8 bg-[#34E06E]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  aria-label={`Show reviews page ${pageIdx + 1}`}
                />
              ))}
            </div>
          )}

        </div>
      </Reveal>
      {/* END: From the Operation */}

      {/* BEGIN: Training Framework (Standards operators are audited against) */}
      <Reveal as="section" className="py-16 sm:py-24 bg-white text-rocket-dark border-b border-slate-200/80" data-purpose="training-framework-standards">
        <div className="max-w-[1280px] mx-auto px-6 space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="framework.eyebrow" value={c.framework.eyebrow} />
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-rocket-dark leading-tight">
              <CmsText path="framework.title" value={c.framework.title} />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-200">
            {c.framework.standards.map((std, i) => (
              <div key={i} className="relative py-5 md:pr-6 border-b border-slate-200">
                <CmsRemoveItem listPath="framework.standards" index={i} label="Remove standard" />
                {STANDARD_LOGOS[std.logo] && (
                  <img
                    src={STANDARD_LOGOS[std.logo]}
                    alt={std.logo.toUpperCase()}
                    className="h-10 sm:h-12 w-auto max-w-[110px] object-contain select-none mb-3"
                  />
                )}
                <strong className="block text-base sm:text-lg font-bold text-slate-950">
                  <CmsText path={`framework.standards.${i}.title`} value={std.title} />
                </strong>
                <span className="block mt-1 text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed">
                  <CmsText path={`framework.standards.${i}.desc`} value={std.desc} />
                </span>
              </div>
            ))}
            <CmsAddItem listPath="framework.standards" label="Add standard" blank={{ title: 'New Standard', desc: '' }} />
          </div>
        </div>
      </Reveal>
      {/* END: Training Framework */}

      {/* BEGIN: Beyond the Course (Smart Talent & Foxtrot Delta) */}
      <Reveal as="section" className="py-14 sm:py-20 bg-[#f8fafc]" data-purpose="beyond-the-course">
        <div className="max-w-[1280px] mx-auto px-6 space-y-10">
          {/* Section header, same style as the other home sections */}
          <div className="max-w-2xl space-y-3 text-left">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-0.5 inline-block">
              <CmsText path="beyond.eyebrow" value={c.beyond.eyebrow} />
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-[40px] font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="beyond.title" value={c.beyond.title} />
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              <CmsText path="beyond.intro" value={c.beyond.intro} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {c.beyond.cards.map((card, i) => {
              const external = /^https?:/.test(card.url || '')
              const LinkTag = external ? 'a' : Link
              const linkProps = external
                ? { href: card.url, target: '_blank', rel: 'noopener noreferrer' }
                : { to: card.url || '/' }
              const baseArt = BEYOND_IMAGE[(card.title || '').trim().toLowerCase()]
              // An image uploaded in the admin editor wins over the bundled artwork.
              const art = card.image?.url
                ? { src: card.image.url, panel: baseArt?.panel || 'bg-slate-100', ink: baseArt?.ink || 'text-white' }
                : baseArt
              return (
                <LinkTag
                  key={i}
                  {...linkProps}
                  className="group relative flex flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_18px_44px_-16px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(15,23,42,0.05),0_28px_56px_-18px_rgba(15,23,42,0.22)]"
                >
                  <CmsRemoveItem listPath="beyond.cards" index={i} label="Remove card" />
                  <CmsImageButton path={`beyond.cards.${i}.image`} className="top-16 right-5" label="Replace image" />
                  {art && (
                    <div className={`relative aspect-[2.2/1] overflow-hidden ${art.panel}`}>
                      <img
                        src={art.src}
                        alt={card.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      {card.livePreview === 'yes' && external && !isPreviewEditMode() && (
                        <>
                          <LivePreview url={card.url} title={`${card.title} (live site)`} />
                        </>
                      )}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 px-7 pb-7 pt-6 sm:px-8 sm:pb-8">
                    <span className="text-sm font-semibold tracking-wide text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-2xl sm:text-[30px] font-bold tracking-tight text-slate-950 leading-tight">
                      <CmsText path={`beyond.cards.${i}.title`} value={card.title} />
                    </h3>
                    <p className="max-w-md text-base text-slate-500 font-normal leading-relaxed">
                      <CmsText path={`beyond.cards.${i}.desc`} value={card.desc} />
                    </p>
                    <span className="mt-auto inline-flex w-fit items-center gap-2 pt-3 text-sm font-semibold text-[#16a952]">
                      <span className="border-b-2 border-[#34E06E] pb-0.5">
                        <CmsText path={`beyond.cards.${i}.linkLabel`} value={card.linkLabel} />
                      </span>
                      <HiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </LinkTag>
              )
            })}
            <CmsAddItem
              listPath="beyond.cards"
              label="Add card"
              blank={{ title: 'New Card', desc: '', linkLabel: 'Learn more', url: '/' }}
            />
          </div>
        </div>
      </Reveal>
      {/* END: Beyond the Course */}

      {/* BEGIN: Train for the Operation (closing call to action) */}
      <Reveal as="section" className="py-12 sm:py-16 bg-white" data-purpose="train-for-operation-cta">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="rounded-3xl bg-slate-950 text-white border border-white/10 p-8 sm:p-10 lg:p-12 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
            <div className="space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white border-b-2 border-[#34E06E] pb-1 inline-block">
                <CmsText path="finalCta.eyebrow" value={c.finalCta.eyebrow} />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold tracking-tight leading-[1.15] [text-wrap:balance]">
                <CmsText path="finalCta.title" value={c.finalCta.title} />
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg">
                <CmsText path="finalCta.desc" value={c.finalCta.desc} />
              </p>
            </div>

            {/* Two clear paths */}
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => navigate('/upcoming-courses')}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/15 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.06] px-5 py-4 text-left transition-colors cursor-pointer"
              >
                <span>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">For individuals</span>
                  <span className="block mt-1 text-base font-bold">
                    <CmsText path="finalCta.findCourseLabel" value={c.finalCta.findCourseLabel} />
                  </span>
                </span>
                <HiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="group flex items-center justify-between gap-4 rounded-2xl bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 px-5 py-4 text-left transition-colors cursor-pointer"
              >
                <span>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-800/80">For operators</span>
                  <span className="block mt-1 text-base font-bold">
                    <CmsText path="finalCta.ctaLabel" value={c.finalCta.ctaLabel} />
                  </span>
                </span>
                <HiArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
      {/* END: Train for the Operation */}

    </div>
  )
}

export default HomePage
