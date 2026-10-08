import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  RiCheckboxCircleFill,
  RiSendPlaneFill
} from 'react-icons/ri'

import { Reveal } from '@/components/common/Reveal'
import { CmsText, CmsRemoveItem, CmsAddItem, CmsImageButton } from '@/components/admin/CmsEditable'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { usePageContent } from '@/hooks/usePageContent'
import { Seo } from '@/components/common/Seo'
import { graph, organizationSchema, localBusinessSchemas, breadcrumbSchema } from '@/lib/seo'
import { api } from '@/lib/api'
import flagSwitzerland from '@/assets/shared/flags/flag-switzerland.webp'
import flagUsa from '@/assets/shared/flags/flag-usa.webp'
import flagIndia from '@/assets/shared/flags/flag-india.webp'
import bannerContactHero from '@/assets/shared/photos/IOFA-banner_10@1920x1280.webp'

// Content the page ships with; the admin can override any of it via /admin/pages/contact.
const FALLBACK = {
  hero: {
    title: 'Talk to us',
    subtitle: "Tell us who you are and what you need. We'll pass it to the right person.",
    image: null
  },
  form: {
    eyebrow: 'SEND A MESSAGE',
    title: 'Start the conversation',
    submitLabel: 'Send message',
    audienceLegend: 'I am',
    audiences: [
      { title: 'An individual', desc: 'Becoming a dispatcher, or joining a course' },
      { title: 'An operator', desc: 'Training or consulting for my team' }
    ],
    topics: [
      'FAA Aircraft Dispatcher',
      'Flight Dispatcher Initial',
      'Double Program: FAA & EASA',
      'Train the Trainer',
      'Which course is right for me?',
      'Something else'
    ],
    operatorTopics: [
      'Flight Dispatch: tailored initial, recurrent or advanced',
      'Crew Control',
      'Dangerous Goods for our crews',
      'Train the Trainer in-house',
      'Human Factors for the OCC',
      'OCC consulting',
      'Something else'
    ],
    // Shown only when the "Flight Dispatch" topic is selected - two
    // certification pathways exist for that discipline.
    flightDispatchPathways: ['ICAO & EASA', 'FAA Part 65'],
    locationLabel: 'Where do you want to train?',
      locationOptions: [
        'Denmark (Sønderborg)',
        'United States (Daytona Beach)',
        'India (New Delhi)',
        'Online',
        'At our base (for operators)',
        'Not sure yet'
      ]
  },
  offices: {
    eyebrow: 'OFFICES',
    title: 'Our offices',
    items: [
      {
        region: 'Headquarters',
        country: 'Switzerland',
        address: 'Oberdorf 26, 4314 Zeiningen, Aargau, Switzerland',
        phone: '+41 78 227 3103',
        email: 'info@theifoa.com'
      },
      {
        region: 'Americas',
        country: 'United States',
        address: '1616 Concierge Blvd, Suite 100, Daytona Beach, FL 32117, USA',
        phone: '+1 508 838 5880',
        email: 'info@theifoa.com'
      },
      {
        region: 'Asia',
        country: 'India',
        address: 'Innov8 Old Fort, 2nd Floor, Saket District Centre, New Delhi 110017, India',
        phone: '+91 98101 44034',
        email: 'info@theifoa.com',
        email2: 'info-india@theifoa.com'
      }
    ]
  },
  direct: {
    eyebrow: 'DIRECT LINES',
    title: 'Direct lines',
    lines: [
      { label: 'Email', value: 'info@theifoa.com', href: 'mailto:info@theifoa.com' },
      { label: 'WhatsApp', value: '+41 78 227 3103', href: 'https://wa.me/41782273103' }
    ],
    replyNote: 'We reply to every inquiry within two working days.',
    coursesPrefix: 'Looking for a course date? See',
    coursesLinkLabel: 'upcoming courses'
  }
}

// Course slug -> the contact topic (and audience) it maps to.
const COURSE_TOPICS = {
  'flight-dispatcher-initial-certification': { topic: 'Flight Dispatcher Initial', audience: 'individual' },
  'aircraft-dispatcher-training-faa-part-65': { topic: 'FAA Aircraft Dispatcher', audience: 'individual' },
  'flight-dispatcher-initial-training-india': { topic: 'Flight Dispatcher Initial', audience: 'individual' },
  'flight-dispatcher-initial-training-usa': { topic: 'Flight Dispatcher Initial', audience: 'individual' },
  'flight-dispatcher-double-programme': { topic: 'Double Program: FAA & EASA', audience: 'individual' },
  'train-the-trainer-icao-cbta-instructor': { topic: 'Train the Trainer', audience: 'individual' },
  'dangerous-goods-regulations-cbta-initial': { topic: 'Dangerous Goods for our crews', audience: 'operator' },
  'airline-crew-control-flight-rostering': { topic: 'Crew Control', audience: 'operator' },
  'human-factors-in-the-occ': { topic: 'Human Factors for the OCC', audience: 'operator' },
  'airline-occ-setup-operational-consulting': { topic: 'OCC consulting', audience: 'operator' }
}

const LOCATION_NAMES = { india: 'India (New Delhi)', denmark: 'Denmark (Sønderborg)', united: 'United States (Daytona Beach)' }

export function ContactPage() {
  const { c } = usePageContent('contact', FALLBACK)
  // Arriving from a course page (/contact?course=<slug>) pre-selects that
  // course as the topic, and "An operator" for team/corporate courses.
  const [searchParams] = useSearchParams()
  const fromCourse = COURSE_TOPICS[searchParams.get('course')] || null
  // ?location=india from a region card / course page pre-selects where they want to train.
  const presetLocation = LOCATION_NAMES[(searchParams.get('location') || '').toLowerCase()] || ''
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    audience: fromCourse?.audience || 'individual',
    topic: fromCourse?.topic || '',
    pathway: '',
    location: presetLocation,
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const topic =
        formData.topic === 'Flight Dispatch' && formData.pathway
          ? `Flight Dispatch: ${formData.pathway}`
          : formData.topic
      if (!formData.location) {
        setError('Please choose where you want to train.')
        return
      }
      await api.sendContact({ ...formData, topic: topic || topicOptions[0], location: formData.location })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const audiences = c.form.audiences || FALLBACK.form.audiences
  // One topic list for everyone: switching "I am" never changes or clears the
  // chosen topic. Individual topics first, then operator-only ones.
  const allTopics = [...new Set([...(c.form.topics || []), ...(c.form.operatorTopics || FALLBACK.form.operatorTopics || [])])]
  // Keep the catch-all option at the end of the combined list.
  const topicOptions = [...allTopics.filter((x) => x !== 'Something else'), ...allTopics.filter((x) => x === 'Something else')]

  const offices = c.offices.items.map((o, i) => ({ ...o, _path: `offices.items.${i}`, _index: i }))

  return (
    <div className="bg-white text-rocket-dark selection:bg-[#34E06E] selection:text-slate-950" data-purpose="contact-page">
      <Seo
        path="/contact"
        title="Contact IFOA | Flight Dispatch Training Inquiries"
        description="Talk to IFOA about a flight dispatcher course or training for your team. Offices in Switzerland, the United States and India. We reply within two working days."
        jsonLd={graph(
          organizationSchema(),
          localBusinessSchemas(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' }
          ])
        )}
      />
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[460px] md:min-h-[500px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-16 overflow-hidden">
        {/* Ambient Aviation Background Art */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={c.hero.image?.url || bannerContactHero}
            alt="IFOA Aviation Operations Contact"
            className="w-full h-full object-cover object-center opacity-30 scale-105"
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
        </div>
      </section>

      {/* 2. MAIN CONTACT SECTION (FORM + DIRECT LINES) */}
      <Reveal as="section" id="contact-main-section" className="py-20 sm:py-24 bg-white border-b border-slate-200/80 scroll-mt-20" data-purpose="contact-main">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Single Unified Grid with Sticky Right Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: Header + Contact Form Card */}
            <div className="lg:col-span-7 space-y-6">
              {/* Left Header */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 block w-fit">
                  <CmsText path="form.eyebrow" value={c.form.eyebrow} />
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                  <CmsText path="form.title" value={c.form.title} />
                </h2>
              </div>

              {/* Contact Form Card */}
              <div className="rounded-[2rem] bg-slate-50/70 border border-slate-200/90 p-5 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between">
                {submitted ? (
                  <div className="text-center py-12 space-y-4 animate-in fade-in duration-300 my-auto">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-[#34E06E] flex items-center justify-center mx-auto">
                      <RiCheckboxCircleFill className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-950">
                      Message sent
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting IFOA. We'll reply by email within two working days.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold uppercase tracking-wider text-[#34E06E] hover:underline pt-2 cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 flex-1 flex flex-col justify-between">
                    {/* Who is writing: switches the topic list */}
                    <fieldset className="space-y-2">
                      <legend className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider mb-2">
                        <CmsText path="form.audienceLegend" value={c.form.audienceLegend} />
                      </legend>
                      
                      {/* Smooth Animated Sliding Toggle */}
                      <div className="relative rounded-2xl bg-white border border-slate-200/90 p-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 shadow-2xs">
                        {/* Hardware-accelerated sliding background pill (sm+) */}
                        <div
                          className="hidden sm:block absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-xl bg-slate-950 shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
                          style={{
                            transform: formData.audience === 'operator' ? 'translateX(100%)' : 'translateX(0%)'
                          }}
                        />

                        {['individual', 'operator'].map((value, i) => {
                          const selected = formData.audience === value
                          return (
                            <button
                              key={value}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setFormData({ ...formData, audience: value })}
                              className={`relative z-10 text-left px-5 py-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
                                selected
                                  ? 'max-sm:bg-slate-950 text-white'
                                  : 'max-sm:bg-transparent text-slate-900 hover:text-slate-950'
                              }`}
                            >
                              <span
                                className={`block text-base sm:text-lg font-bold tracking-tight transition-colors duration-200 ${
                                  selected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                <CmsText path={`form.audiences.${i}.title`} value={audiences[i]?.title} />
                              </span>
                              <span
                                className={`block mt-0.5 text-xs sm:text-sm transition-colors duration-200 ${
                                  selected ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                <CmsText path={`form.audiences.${i}.desc`} value={audiences[i]?.desc} />
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jane"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="jane.doe@airline.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        Organization
                      </label>
                      <input
                        type="text"
                        placeholder="Airline, operator, or 'Individual'"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        I'm interested in
                      </label>
                      <CustomSelect
                        value={formData.topic || topicOptions[0]}
                        onChange={(val) =>
                          setFormData({ ...formData, topic: val, pathway: val === 'Flight Dispatch' ? formData.pathway : '' })
                        }
                        options={topicOptions}
                      />
                    </div>

                    {formData.topic === 'Flight Dispatch' ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                          Which certification?
                        </label>
                        <CustomSelect
                          value={formData.pathway}
                          onChange={(val) => setFormData({ ...formData, pathway: val })}
                          options={c.form.flightDispatchPathways || ['ICAO & EASA', 'FAA Part 65']}
                          placeholder="Select EASA or FAA Part 65..."
                        />
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        {c.form.locationLabel || FALLBACK.form.locationLabel}
                      </label>
                      <CustomSelect
                        value={formData.location}
                        onChange={(val) => setFormData({ ...formData, location: val })}
                        options={c.form.locationOptions || FALLBACK.form.locationOptions}
                        placeholder="Select a location..."
                      />
                    </div>

                    <div className="space-y-1.5 flex-1 flex flex-col">
                      <label className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                        Message
                      </label>
                      <textarea
                        placeholder="Tell us the course or topic, and for teams, the number of people."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full flex-1 min-h-[110px] px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-hidden focus:border-[#34E06E] focus:ring-1 focus:ring-[#34E06E] transition-all resize-y"
                      />
                    </div>

                    {error ? (
                      <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold text-xs uppercase tracking-widest py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(52,224,110,0.4)] cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                      <span>
                        {loading
                          ? 'Transmitting...'
                          : (c.form.submitLabel || 'Send Message').replace(/[→\->]/g, '').trim()}
                      </span>
                      {!loading && (
                        <RiSendPlaneFill className="w-4 h-4 text-slate-950 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Header + Direct Lines Card (Sticky) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-6">
              {/* Right Header */}
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 block w-fit">
                  <CmsText path="direct.eyebrow" value={c.direct.eyebrow} />
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">
                  <CmsText path="direct.title" value={c.direct.title} />
                </h2>
              </div>

              {/* Direct Lines Card */}
              <div className="rounded-[2rem] bg-slate-50/70 border border-slate-200/90 p-5 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-8">
                <div className="divide-y divide-slate-200/80">
                  {c.direct.lines.map((line, idx) => (
                    <a
                      key={idx}
                      href={line.href}
                      target={/^https?:/.test(line.href || '') ? '_blank' : undefined}
                      rel={/^https?:/.test(line.href || '') ? 'noopener noreferrer' : undefined}
                      className="relative flex items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0 group"
                    >
                      <CmsRemoveItem listPath="direct.lines" index={idx} label="Remove line" />
                      <span className="text-sm sm:text-base text-slate-500 font-medium">
                        <CmsText path={`direct.lines.${idx}.label`} value={line.label} />
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-950 group-hover:text-[#1fa855] transition-colors">
                        <CmsText path={`direct.lines.${idx}.value`} value={line.value} />
                      </span>
                    </a>
                  ))}
                  <CmsAddItem listPath="direct.lines" label="Add line" blank={{ label: 'New line', value: '', href: '' }} />
                </div>

                <div className="pt-6 border-t border-slate-200/80 space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    <CmsText path="direct.replyNote" value={c.direct.replyNote} />
                  </p>
                  <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                    <CmsText path="direct.coursesPrefix" value={c.direct.coursesPrefix} />{' '}
                    <Link to="/upcoming-courses" className="font-bold text-slate-950 underline underline-offset-4 hover:text-[#1fa855]">
                      <CmsText path="direct.coursesLinkLabel" value={c.direct.coursesLinkLabel} />
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3. REGIONAL OFFICES */}
      <Reveal as="section" className="py-16 sm:py-20 bg-white border-b border-slate-200/80" data-purpose="contact-offices">
        <div className="max-w-[1280px] mx-auto px-6 space-y-8">
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1 inline-block">
                  <CmsText path="offices.eyebrow" value={c.offices.eyebrow} />
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
                  <CmsText path="offices.title" value={c.offices.title} />
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                {offices.map((office, idx) => {
                  const name = (office.country || '').toLowerCase()
                  const flagImg = name.includes('switzerland')
                    ? flagSwitzerland
                    : name.includes('united states') || name.includes('usa')
                    ? flagUsa
                    : name.includes('india')
                    ? flagIndia
                    : [flagSwitzerland, flagUsa, flagIndia][idx] || flagSwitzerland

                  return (
                    <div
                      key={idx}
                      className="group relative rounded-[2rem] bg-[#020617] border border-white/10 hover:border-[#34E06E]/40 shadow-xl hover:shadow-2xl transition-all duration-300 p-7 flex flex-col justify-between space-y-4 overflow-hidden text-white min-h-[190px] hover:-translate-y-1"
                    >
                      <CmsRemoveItem listPath="offices.items" index={office._index} label="Remove office" />
                      {/* Ambient Flag Background Art */}
                      <div className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 overflow-hidden pointer-events-none z-0">
                        <img
                          src={flagImg}
                          alt=""
                          className="w-full h-full object-cover object-center opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 select-none filter contrast-125"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent" />
                      </div>

                      <div className="relative z-10 space-y-1.5 max-w-sm">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#34E06E] border-b border-[#34E06E]/40 pb-0.5 inline-block">
                          <CmsText path={`${office._path}.region`} value={office.region} />
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                          <CmsText path={`${office._path}.country`} value={office.country} />
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-0.5">
                          <CmsText path={`${office._path}.address`} value={office.address} />
                        </p>
                      </div>

                      <div className="relative z-10 pt-3.5 border-t border-white/10 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-mono">Phone:</span>
                          <a
                            href={`tel:${office.phone.replace(/[^0-9+]/g, '')}`}
                            className="font-semibold text-white hover:text-[#34E06E] transition-colors"
                          >
                            <CmsText path={`${office._path}.phone`} value={office.phone} />
                          </a>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-slate-400 font-mono">Email:</span>
                          <div className="flex flex-col items-end gap-1 min-w-0">
                            <a
                              href={`mailto:${office.email}`}
                              className="font-semibold text-white hover:text-[#34E06E] transition-colors break-all text-right"
                            >
                              <CmsText path={`${office._path}.email`} value={office.email} />
                            </a>
                            {office.email2 && (
                              <a
                                href={`mailto:${office.email2}`}
                                className="font-semibold text-white hover:text-[#34E06E] transition-colors break-all text-right"
                              >
                                <CmsText path={`${office._path}.email2`} value={office.email2} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <CmsAddItem
                  listPath="offices.items"
                  label="Add office"
                  blank={{ region: 'New Region', country: 'New Country', address: '', phone: '', email: 'info@theifoa.com' }}
                />
              </div>
        </div>
      </Reveal>
    </div>
  )
}
