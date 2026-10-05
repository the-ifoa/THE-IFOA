import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiBookReadFill, RiBookOpenLine, RiCheckLine, RiCloseLine, RiExternalLinkLine } from 'react-icons/ri'
import { PiAirplaneTakeoffFill, PiAirplaneTiltFill } from 'react-icons/pi'
import { HiArrowUpRight, HiArrowRight } from 'react-icons/hi2'
import { MdOutlineMail } from 'react-icons/md'

import { CosmicParallaxBg } from '@/components/common/CosmicParallaxBg'
import { Reveal } from '@/components/common/Reveal'
import { CmsText } from '@/components/admin/CmsEditable'
import { Seo } from '@/components/common/Seo'
import { graph, organizationSchema, breadcrumbSchema } from '@/lib/seo'
import { usePageContent } from '@/hooks/usePageContent'

// Official Magazine Issue Covers
import issue01Cover from '@/assets/foxtrotDelta/foxtrot-delta-issue-01.webp'
import issue02Cover from '@/assets/foxtrotDelta/foxtrot-delta-issue-02.webp'
import issue03Cover from '@/assets/foxtrotDelta/foxtrot-delta-issue-03.webp'
import bannerAviationClouds from '@/assets/shared/photos/aviation-aircraft-clouds.jpg'

// Cover images are local static assets keyed by edition ID; the rest of the
// edition's copy (title, dates, highlights, etc.) is admin-editable.
const EDITION_COVERS = {
  'special-edition': issue03Cover,
  'issue-02': issue02Cover,
  'issue-01': issue01Cover
}

// Publuu flipbook for each edition, so a click opens that issue directly
// instead of the whole bookshelf.
const PUBLUU_ACCOUNT = '371907'
const EDITION_FLIPBOOKS = {
  'special-edition': '935013',
  'issue-02': '935033',
  'issue-01': '935041'
}
const flipbookUrl = (id, embed) => `https://publuu.com/flip-book/${PUBLUU_ACCOUNT}/${id}${embed ? '/page/1?embed' : ''}`

// Full-screen reader for one issue. Esc or the backdrop closes it.
function IssueReader({ issue, onClose }) {
  const flipbook = EDITION_FLIPBOOKS[issue.id]
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-[overviewFadeIn_0.25s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label={`Foxtrot Delta ${issue.number}: ${issue.title}`}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full sm:h-[90vh] max-w-6xl bg-white sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-200">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
              {issue.number} · {issue.date}
            </p>
            <p className="text-sm sm:text-base font-bold text-slate-950 truncate">{issue.title}</p>
          </div>
          <a
            href={flipbookUrl(flipbook)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-full border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <RiExternalLinkLine className="w-3.5 h-3.5" />
            Open in new tab
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reader"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        <iframe
          title={`Foxtrot Delta ${issue.number}`}
          src={flipbookUrl(flipbook, true)}
          className="flex-1 w-full border-0 bg-slate-100"
          allow="clipboard-write; autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  )
}

// Content the page ships with; editable at /admin/pages/foxtrotDelta.
const FALLBACK = {
  hero: {
    eyebrow: 'The Voice of Operational Control',
    title: 'Foxtrot Delta Magazine',
    subtitle: 'Meet the Operational Control Teams that make the Magic happen!',
    description:
      'The aviation industry’s first and only publication dedicated exclusively to flight dispatchers, crew controllers, and OCC personnel worldwide, spotlighting the essential roles, daily challenges, and forward-thinking innovations that shape modern aviation.',
    exploreLabel: 'Explore Digital Bookshelf',
    servicesLabel: 'Explore Our Services'
  },
  collection: {
    eyebrow: 'The Collection',
    title: 'Featured Foxtrot Delta Issues',
    intro:
      'Highlights from our landmark publications covering OCC leadership, technological breakthroughs, and flight safety science.',
    viewAllLabel: 'View All on Bookshelf',
    editions: [
      {
        id: 'special-edition',
        number: 'Special Edition',
        date: 'May 2023',
        title: 'Aviation Sustainability',
        subtitle: 'Can Aviation Kick Its Contrail Habit? & Net Zero for Business Aviation',
        theme: 'Sustainability & Ecology',
        readLabel: 'Read Issue',
        highlights: ['SATAVIA Contrail Science', 'AZZERA Net Zero Pathways', 'Eco-Climb Profiles']
      },
      {
        id: 'issue-02',
        number: 'Issue N°2',
        date: 'February 2023',
        title: 'Jetfly OCC & Fleet Pioneers',
        subtitle: 'Managing the World’s Largest Pilatus Fleet with High-Precision Dispatch',
        theme: 'Fleet Operations',
        readLabel: 'Read Issue',
        highlights: ['Jetfly 60+ PC-12/PC-24 OCC', 'SITA EWAS Predictive Analytics', 'SATAVIA Meteorology']
      },
      {
        id: 'issue-01',
        number: 'Issue N°1',
        date: 'November 2022',
        title: 'The Indian Ocean Pearl',
        subtitle: 'Air Mauritius OCC Operations & Threat-Informed Risk Planning',
        theme: 'Oceanic Operations',
        readLabel: 'Read Issue',
        highlights: ['Air Mauritius Isolated Hub', 'Osprey:Sentinel Threat Intel', 'Honeywell Forge Efficiency']
      }
    ]
  },
  finalCta: {
    title: 'Ready to enhance your operational competencies?',
    desc:
      'Book the most suitable training program to acquire essential decision-making skills, regulatory compliance, and peak operational performance.',
    exploreLabel: 'Explore Training Programs',
    contactLabel: 'Contact Us'
  }
}

export function FoxtrotDeltaPage() {
  const bookshelfRef = useRef(null)
  const [reading, setReading] = useState(null)
  const { c } = usePageContent('foxtrotDelta', FALLBACK)
  const featuredEditions = c.collection.editions.map((e, i) => ({ ...e, _path: `collection.editions.${i}` }))

  const scrollToBookshelf = () => {
    bookshelfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-white text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="foxtrot-delta-page">
      <Seo
        path="/foxtrot-delta"
        title="Foxtrot Delta | IFOA Aviation Operations Magazine"
        description="Foxtrot Delta is IFOA's aviation magazine covering airline OCC operations, flight dispatch practice, operational risk planning and aviation sustainability."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Foxtrot Delta', path: '/foxtrot-delta' }
          ])
        )}
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[480px] md:min-h-[520px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-16 overflow-hidden">
        {/* Ambient Aviation Backdrop */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={bannerAviationClouds}
            alt="Foxtrot Delta Magazine"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/95 via-[#020617]/85 to-[#020617]" />
        </div>

        {/* Ambient Starfield */}
        <CosmicParallaxBg className="absolute inset-0 opacity-40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center space-y-6 flex flex-col items-center justify-center">
          <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-[#34E06E] border-b-2 border-[#34E06E] pb-1 inline-block">
            <CmsText path="hero.eyebrow" value={c.hero.eyebrow} />
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            <CmsText path="hero.title" value={c.hero.title} />
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-200 font-medium max-w-3xl mx-auto leading-relaxed">
            <CmsText path="hero.subtitle" value={c.hero.subtitle} />
          </p>

          <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            <CmsText path="hero.description" value={c.hero.description} />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={scrollToBookshelf}
              className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-xl hover:shadow-[0_0_25px_rgba(52,224,110,0.45)] hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <RiBookReadFill className="w-4 h-4 text-slate-950" />
              <span>
                <CmsText path="hero.exploreLabel" value={c.hero.exploreLabel} />
              </span>
            </button>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-200 backdrop-blur-sm"
            >
              <PiAirplaneTakeoffFill className="w-4 h-4 text-slate-300" />
              <span>
                <CmsText path="hero.servicesLabel" value={c.hero.servicesLabel} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE VOICE OF OPERATIONAL CONTROL: INTERACTIVE BOOKSHELF & FEATURED EDITIONS */}
      <Reveal as="section" ref={bookshelfRef} id="digital-bookshelf" className="py-16 sm:py-24 bg-slate-50/70 border-b border-slate-200/80 scroll-mt-20" data-purpose="digital-bookshelf-and-collection">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">

          {/* Clean Integrated Bookshelf Container */}
          <div className="relative rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_16px_45px_rgba(0,0,0,0.05)] overflow-hidden">
            {/* Embedded Responsive HTML5 Bookshelf */}
            <div className="w-full bg-white relative">
              <iframe
                title="Foxtrot Delta Magazine Bookshelf"
                src="https://book577146.publuu.com"
                className="w-full h-[520px] sm:h-[580px] md:h-[620px] border-0"
                allow="clipboard-write; autoplay; fullscreen"
                loading="lazy"
              />
            </div>
          </div>

          {/* Featured Editions Showcase */}
          <div className="space-y-10 pt-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-10 border-t border-slate-200/80">
              <div className="max-w-2xl space-y-3 text-left">
                <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                  <CmsText path="collection.eyebrow" value={c.collection.eyebrow} />
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                  <CmsText path="collection.title" value={c.collection.title} />
                </h3>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                  <CmsText path="collection.intro" value={c.collection.intro} />
                </p>
              </div>

              <button
                onClick={scrollToBookshelf}
                className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-slate-950 hover:text-[#34E06E] transition-colors self-start md:self-auto cursor-pointer group"
              >
                <span>
                  <CmsText path="collection.viewAllLabel" value={c.collection.viewAllLabel} />
                </span>
                <HiArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-[#34E06E] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredEditions.map((issue) => {
                const canRead = Boolean(EDITION_FLIPBOOKS[issue.id])
                const open = () => (canRead ? setReading(issue) : scrollToBookshelf())
                return (
                  <article key={issue.id} className="group flex flex-col text-left rounded-2xl bg-white border border-slate-200/90 overflow-hidden hover:border-slate-300 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] transition-[border-color,box-shadow] duration-300">
                    {/* Cover: the whole cover opens the issue */}
                    <button
                      type="button"
                      onClick={open}
                      aria-label={`Read Foxtrot Delta ${issue.number}: ${issue.title}`}
                      className="relative block bg-slate-100/80 p-6 sm:p-8 cursor-pointer overflow-hidden border-b border-slate-200/80"
                    >
                      <span className="relative block aspect-[3/4] w-full max-w-[300px] mx-auto rounded-md overflow-hidden shadow-[0_18px_40px_-12px_rgba(15,23,42,0.35)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                        <img
                          src={EDITION_COVERS[issue.id]}
                          alt={`Foxtrot Delta ${issue.number} cover`}
                          loading="lazy"
                          className="w-full h-full object-cover object-top"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 group-hover:bg-slate-950/45 transition-colors duration-300">
                          <span className="inline-flex items-center gap-2 bg-white text-slate-950 text-xs font-bold px-4 py-2.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <RiBookOpenLine className="w-4 h-4" />
                            Read now
                          </span>
                        </span>
                      </span>
                    </button>

                    {/* Details */}
                    <div className="flex-1 flex flex-col p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-[#16a952] text-[10px] font-mono font-bold uppercase tracking-widest">
                          <CmsText path={`${issue._path}.number`} value={issue.number} />
                        </span>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                          <CmsText path={`${issue._path}.date`} value={issue.date} />
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-950 tracking-tight leading-snug">
                        <CmsText path={`${issue._path}.title`} value={issue.title} />
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed sm:min-h-[2.75rem]">
                        <CmsText path={`${issue._path}.subtitle`} value={issue.subtitle} />
                      </p>

                      <div className="mt-5 rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Inside this issue</p>
                        <ul className="mt-2.5 space-y-2">
                          {issue.highlights.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-[13px] font-medium text-slate-800 leading-snug">
                              <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0 mt-[3px]" />
                              <span>
                                <CmsText path={`${issue._path}.highlights.${idx}`} value={item} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={open}
                        className="mt-auto pt-5 group/read w-full flex items-center justify-between text-sm font-bold text-slate-950 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <RiBookOpenLine className="w-4 h-4 text-[#16a952]" />
                          <CmsText path={`${issue._path}.readLabel`} value={issue.readLabel} />
                        </span>
                        <span className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center transition-colors group-hover/read:bg-[#34E06E] group-hover/read:text-slate-950">
                          <HiArrowRight className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {reading && <IssueReader issue={reading} onClose={() => setReading(null)} />}

      {/* 3. FINAL CTA */}
      <Reveal as="section" className="py-20 sm:py-28 bg-slate-50/70 text-center border-t border-slate-200/80" data-purpose="foxtrot-final-cta">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-8">
          <div className="relative rounded-[2.5rem] bg-[#020617] border border-white/10 p-10 sm:p-16 text-center text-white overflow-hidden shadow-2xl space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-2xl mx-auto">
              <CmsText path="finalCta.title" value={c.finalCta.title} />
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              <CmsText path="finalCta.desc" value={c.finalCta.desc} />
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/services"
                className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-9 py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-xl hover:shadow-[0_0_24px_rgba(52,224,110,0.45)] hover:scale-105 flex items-center gap-2"
              >
                <PiAirplaneTiltFill className="w-4 h-4 text-slate-950" />
                <span>
                  <CmsText path="finalCta.exploreLabel" value={c.finalCta.exploreLabel} />
                </span>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-200"
              >
                <MdOutlineMail className="w-4 h-4 text-slate-300" />
                <span>
                  <CmsText path="finalCta.contactLabel" value={c.finalCta.contactLabel} />
                </span>
                <HiArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

export default FoxtrotDeltaPage
