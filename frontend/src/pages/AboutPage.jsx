import { Link, useNavigate } from 'react-router-dom'
import { HiArrowUpRight } from 'react-icons/hi2'

import { Reveal } from '@/components/common/Reveal'
import { CmsText, CmsRemoveItem, CmsAddItem, CmsImageButton } from '@/components/admin/CmsEditable'
import { usePageContent } from '@/hooks/usePageContent'
import { Seo } from '@/components/common/Seo'
import { graph, organizationSchema, breadcrumbSchema } from '@/lib/seo'

// Standards Logos
import logoFaa from '@/assets/shared/standards-logos/logo-faa.webp'
import logoEasa from '@/assets/shared/standards-logos/logo-easa.webp'
import logoIcao from '@/assets/shared/standards-logos/logo-icao.webp'
import logoDgca from '@/assets/shared/standards-logos/logo-dgca.webp'

// Country Flags
import flagSwitzerland from '@/assets/shared/flags/flag-switzerland.webp'
import flagUsa from '@/assets/shared/flags/flag-usa.webp'
import flagIndia from '@/assets/shared/flags/flag-india.jpg'

// Official Background
import imgAircraftClouds from '@/assets/shared/photos/aviation-aircraft-clouds.jpg'

// Content the page ships with; editable at /admin/pages/about.
const FALLBACK = {
  hero: {
    title: 'The Global Flight Dispatch Standard',
    subtitle:
      'Five years in, we became the standard other schools get measured against.',
    primaryLabel: 'Request a proposal',
    secondaryLabel: 'Explore Courses',
    image: null
  },
  executive: {
    heading:
      'In just five years, we became the leading aviation training company in Europe for the education and development of flight dispatchers.',
    sub: 'A position earned through relentless commitment to quality, industry relevance, and real-world results.'
  },
  mission: {
    eyebrow: 'OUR MISSION',
    title: 'Prepared, not just certified',
    intro:
      'Our mission is simple: your team operates at the highest level of safety and efficiency, trained through courses that are effective and affordable, with never a trade-off between the two.',
    values: [
      {
        idx: '01',
        title: 'World-class, accessible',
        desc: 'We take pride in delivering world-class services at accessible prices: excellence and value for every customer we serve.'
      },
      {
        idx: '02',
        title: 'Built on trust',
        desc: "We hold the same uncompromising standard whether or not anyone's watching."
      },
      {
        idx: '03',
        title: 'Driving innovation',
        desc: 'We anchor our culture in continuous improvement, enhancing the training experience and the value we deliver, year over year.'
      }
    ]
  },
  footprint: {
    eyebrow: 'GLOBAL FOOTPRINT',
    title: 'Operational wherever airlines fly',
    intro:
      'Three regional hubs, plus our European training site in Sønderborg, Denmark, supporting carriers, students and dispatch teams across 3 continents.',
    regions: [
      {
        name: 'Europe HQ',
        location: 'Zeiningen, Switzerland',
        facility: 'IFOA',
        desc: 'European headquarters. European courses are taught in Sønderborg, Denmark, at Air Alsie, to ORO.GEN.110 (Regulation (EU) 965/2012).'
      },
      {
        name: 'North America',
        location: 'Daytona Beach, FL',
        facility: 'IFOA USA',
        desc: 'FAA Part 65 approved Aircraft Dispatcher school and Agent for Service.'
      },
      {
        name: 'India & Asia-Pacific',
        location: 'New Delhi, India',
        facility: 'IFOA INDIA',
        desc: 'South Asian school delivering the FAA Part 65 approved course and Flight Dispatcher Initial, built on ICAO Doc 10106, on-site in New Delhi.'
      }
    ]
  },
  finalCta: {
    title: 'Want to see how this plays out for your team?',
    desc: 'Talk to us about your fleet, your ops manual, and where your OCC needs to be stronger.',
    primaryLabel: 'Request a proposal',
    secondaryLabel: 'Browse Training Courses'
  }
}

export function AboutPage() {
  const navigate = useNavigate()
  const { c } = usePageContent('about', FALLBACK)

  const coreValues = c.mission.values.map((v, i) => ({ ...v, _path: `mission.values.${i}`, _index: i }))
  const regions = c.footprint.regions.map((r, i) => ({ ...r, _path: `footprint.regions.${i}`, _index: i }))

  return (
    <div className="bg-white text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950 font-sans" data-purpose="about-page">
      <Seo
        path="/about"
        title="About IFOA | Flight Operations Academy, Europe, USA & India"
        description="IFOA trains flight dispatchers to ICAO Doc 10106, EASA ORO.GEN.110 and FAA Part 65 standards, with operational hubs in Switzerland, the United States and India."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' }
          ])
        )}
      />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[480px] md:min-h-[520px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-16 overflow-hidden">
        {/* Ambient Aviation Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={c.hero.image?.url || imgAircraftClouds}
            alt="IFOA Aviation History and Standards"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]" />
        </div>
        <CmsImageButton path="hero.image" className="top-24 right-4 sm:right-6" />

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 sm:px-8 text-center space-y-6 flex flex-col items-center justify-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            <CmsText path="hero.title" value={c.hero.title} />
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            <CmsText path="hero.subtitle" value={c.hero.subtitle} />
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-200 shadow-xl hover:shadow-[0_0_20px_rgba(52,224,110,0.4)] hover:scale-105 cursor-pointer"
            >
              <CmsText path="hero.primaryLabel" value={c.hero.primaryLabel} />
            </button>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-200 group"
            >
              <span>
                <CmsText path="hero.secondaryLabel" value={c.hero.secondaryLabel} />
              </span>
              <HiArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. EXECUTIVE CLAIM / LEADERSHIP CALLOUT */}
      <Reveal as="section" className="py-16 sm:py-20 bg-slate-50/70 border-b border-slate-200/80" data-purpose="executive-claim">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <div className="relative rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] transition-all duration-300 p-8 sm:p-12 md:p-14 space-y-5 overflow-hidden text-left">
            {/* Sleek Top Indicator Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-[#34E06E] to-slate-900" />

            <div className="space-y-3 max-w-4xl">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                Industry Track Record
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                <CmsText path="executive.heading" value={c.executive.heading} />
              </h2>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs sm:text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                <CmsText path="executive.sub" value={c.executive.sub} />
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3. OUR MISSION & CORE VALUES (Styled as 3 Modern Process Cards) */}
      <Reveal as="section" className="py-20 sm:py-24 bg-white border-b border-slate-200/80" data-purpose="mission-values">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="mission.eyebrow" value={c.mission.eyebrow} />
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="mission.title" value={c.mission.title} />
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed">
              <CmsText path="mission.intro" value={c.mission.intro} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {coreValues.map((val) => (
              <div
                key={val.idx}
                className="group relative rounded-[2rem] bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-[#34E06E]/50 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 p-8 sm:p-10 flex flex-col justify-between space-y-6"
              >
                <CmsRemoveItem listPath="mission.values" index={val._index} label="Remove value" />
                
                {/* Top Dark Badge with Lime Index */}
                <div className="w-12 h-12 rounded-full bg-slate-950 text-[#34E06E] font-mono font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  {val.idx}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-950 tracking-tight leading-snug group-hover:text-slate-950 transition-colors">
                    <CmsText path={`${val._path}.title`} value={val.title} />
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    <CmsText path={`${val._path}.desc`} value={val.desc} />
                  </p>
                </div>

                {/* Bottom Step Pill */}
                <div className="pt-2">
                  <span className="inline-block bg-slate-950 text-white text-[11px] font-mono font-bold px-4 py-1.5 rounded-full uppercase tracking-wider group-hover:bg-[#34E06E] group-hover:text-slate-950 transition-colors duration-300">
                    Pillar {val.idx}
                  </span>
                </div>
              </div>
            ))}
            <CmsAddItem
              listPath="mission.values"
              label="Add value"
              blank={{ idx: String(coreValues.length + 1).padStart(2, '0'), title: 'New Value', desc: '' }}
            />
          </div>
        </div>
      </Reveal>

      {/* 4. GLOBAL REGULATORY STANDARDS & AUTHORITIES (Clean 4 Card Grid) */}
      <Reveal as="section" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80" data-purpose="standards-authorities">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              Accreditation & Standards
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              Trained to World Civil Aviation Frameworks
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed">
              Every course, manual, and flight dispatch syllabus at IFOA is engineered in direct alignment with the world's most recognized civil aviation authority standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7 items-stretch">
            {/* FAA Card */}
            <div className="p-7 rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="h-12 flex items-center justify-start">
                  <img src={logoFaa} alt="FAA" className="h-10 w-auto object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">FAA Part 65</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  FAA-approved Aircraft Dispatcher training school and official US Agent for Service operations.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block pt-3 border-t border-slate-100">
                Federal Aviation Administration
              </span>
            </div>

            {/* EASA Card */}
            <div className="p-7 rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="h-12 flex items-center justify-start">
                  <img src={logoEasa} alt="EASA" className="h-10 w-auto object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">EASA ORO.GEN.110</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  European flight operations standard curriculum, syllabus frameworks, and recurrent training protocols.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block pt-3 border-t border-slate-100">
                European Union Aviation Safety
              </span>
            </div>

            {/* ICAO Card */}
            <div className="p-7 rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="h-12 flex items-center justify-start">
                  <img src={logoIcao} alt="ICAO" className="h-10 w-auto object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">ICAO Doc 10106</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Competency-based training and assessment (CBTA) framework for international flight operations officers.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block pt-3 border-t border-slate-100">
                UN Civil Aviation Organization
              </span>
            </div>

            {/* DGCA Card */}
            <div className="p-7 rounded-[2rem] bg-white border border-slate-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="h-12 flex items-center justify-start">
                  <img src={logoDgca} alt="DGCA" className="h-10 w-auto object-contain" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">DGCA India</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Civil Aviation Requirements (CAR) aligned flight operations curricula delivered onsite in New Delhi.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block pt-3 border-t border-slate-100">
                Directorate General of Civil Aviation
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 5. GLOBAL FOOTPRINT */}
      <Reveal as="section" className="py-20 sm:py-24 bg-white border-b border-slate-200/80" data-purpose="global-footprint">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 space-y-12">
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
              <CmsText path="footprint.eyebrow" value={c.footprint.eyebrow} />
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
              <CmsText path="footprint.title" value={c.footprint.title} />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              <CmsText path="footprint.intro" value={c.footprint.intro} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {regions.map((reg, idx) => {
              const name = ((reg.name || '') + ' ' + (reg.location || '')).toLowerCase()
              const flagImg = name.includes('switzerland') || name.includes('europe') || name.includes('basel')
                ? flagSwitzerland
                : name.includes('united states') || name.includes('usa') || name.includes('north america') || name.includes('daytona')
                  ? flagUsa
                  : name.includes('india') || name.includes('delhi') || name.includes('asia')
                    ? flagIndia
                    : [flagSwitzerland, flagUsa, flagIndia][idx] || flagSwitzerland

              return (
                <div
                  key={idx}
                  className="group rounded-[2rem] bg-[#020617] border border-white/10 hover:border-[#34E06E]/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col justify-between space-y-6 relative overflow-hidden text-white hover:-translate-y-1.5 min-h-[280px]"
                >
                  <CmsRemoveItem listPath="footprint.regions" index={reg._index} label="Remove region" />
                  
                  {/* Ambient Flag Background Art */}
                  <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 overflow-hidden pointer-events-none z-0">
                    <img
                      src={flagImg}
                      alt=""
                      className="w-full h-full object-cover object-center opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 select-none filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
                  </div>

                  <div className="relative z-10 space-y-2 max-w-sm min-h-[5.5rem] flex flex-col justify-start">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#34E06E] border-b border-[#34E06E]/40 pb-0.5 inline-block w-fit">
                      <CmsText path={`${reg._path}.name`} value={reg.name} />
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight pt-1">
                      <CmsText path={`${reg._path}.location`} value={reg.location} />
                    </h3>
                    <p className="text-xs text-slate-400 font-mono font-medium">
                      <CmsText path={`${reg._path}.facility`} value={reg.facility} />
                    </p>
                  </div>

                  <p className="relative z-10 text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-3 border-t border-white/10 min-h-[4.5rem]">
                    <CmsText path={`${reg._path}.desc`} value={reg.desc} />
                  </p>
                </div>
              )
            })}
            <CmsAddItem
              listPath="footprint.regions"
              label="Add region"
              blank={{ name: 'New Region', location: '', facility: '', desc: '' }}
            />
          </div>
        </div>
      </Reveal>

      {/* 6. FINAL CONSULTATION CTA (Styled as Reference's Dark CTA Banner) */}
      <Reveal as="section" className="py-20 sm:py-28 bg-slate-50/60 text-center" data-purpose="about-final-cta">
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

export default AboutPage
