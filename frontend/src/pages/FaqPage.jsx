import { Fragment, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RiAddLine, RiSearchLine, RiArrowRightLine, RiCloseLine } from 'react-icons/ri'
import { Seo } from '@/components/common/Seo'
import { graph, organizationSchema, breadcrumbSchema, faqSchema } from '@/lib/seo'
import { FAQ_SECTIONS, faqPlainText } from '@/data/faqs'
import { CustomSelect } from '@/components/ui/CustomSelect'
import bannerHero from '@/assets/shared/photos/IOFA-banner_10@1920x1280.jpg'

// Same **bold** / [label](href) markup the course overview blocks use.
function Rich({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) return <strong key={i} className="font-bold text-slate-900">{bold[1]}</strong>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const cls = 'font-semibold text-slate-950 underline underline-offset-4 hover:text-[#16a952]'
      return link[2].startsWith('/') ? (
        <Link key={i} to={link[2]} className={cls}>{link[1]}</Link>
      ) : (
        <a key={i} href={link[2]} className={cls} target="_blank" rel="noopener noreferrer">{link[1]}</a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

const SERVICE_OPTIONS = [{ value: 'all', label: 'All services' }, ...FAQ_SECTIONS.map((x) => ({ value: x.id, label: x.title }))]

function FaqItem({ item, open, onToggle, id }) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className="text-sm sm:text-base font-bold text-slate-950">{item.q}</span>
        {/* One plus that turns into a cross, instead of swapping two icons */}
        <RiAddLine
          className={`w-5 h-5 text-[#16a952] shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? 'rotate-45' : ''
          }`}
        />
      </button>
      {/* Height animates from 0fr to 1fr; the answer fades and slides in as it opens */}
      <div
        id={id}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p
            className={`pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl transition-transform duration-300 ease-out motion-reduce:transition-none ${
              open ? 'translate-y-0' : '-translate-y-1'
            }`}
          >
            <Rich text={item.a} />
          </p>
        </div>
      </div>
    </div>
  )
}

export function FaqPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState({})
  const service = FAQ_SECTIONS.some((s) => s.id === params.get('service')) ? params.get('service') : 'all'

  const selectService = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('service')
    else next.set('service', id)
    setParams(next, { replace: true, state: { keepScroll: true } })
  }

  const q = query.trim().toLowerCase()
  const sections = useMemo(
    () =>
      FAQ_SECTIONS.filter((s) => service === 'all' || s.id === service)
        .map((s) => ({
          ...s,
          items: q
            ? s.items.filter((it) => `${it.q} ${faqPlainText(it.a)} ${s.title}`.toLowerCase().includes(q))
            : s.items
        }))
        .filter((s) => s.items.length),
    [service, q]
  )

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }))

  return (
    <div className="bg-slate-50/60">
      <Seo
        path="/faq"
        title="Frequently Asked Questions | IFOA"
        description="Answers about IFOA flight dispatcher, FAA Part 65, dangerous goods, crew control, human factors, train the trainer and OCC consulting services."
        jsonLd={graph(
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' }
          ]),
          faqSchema(
            FAQ_SECTIONS.flatMap((s) => s.items.map((it) => ({ question: it.q, answer: faqPlainText(it.a) })))
              // Several services share a question; Google wants each once.
              .filter((it, i, all) => all.findIndex((x) => x.question === it.question) === i)
          )
        )}
      />

      {/* 1. HERO */}
      <section className="relative min-h-[340px] md:min-h-[380px] flex flex-col items-center justify-center bg-[#020617] text-white pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img src={bannerHero} alt="" className="w-full h-full object-cover object-center opacity-30 scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]" />
        </div>
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">Frequently asked questions</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Answers for every IFOA course and service. Pick a service or search below.
          </p>
          <label className="relative block max-w-xl mx-auto">
            <span className="sr-only">Search questions</span>
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-full bg-white text-slate-900 placeholder:text-slate-400 pl-12 pr-10 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[#34E06E]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            )}
          </label>
        </div>
      </section>

      {/* 2. SERVICE FILTER + QUESTIONS */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] gap-6 lg:gap-12 items-start">
          <nav aria-label="Services" className="min-w-0 lg:sticky lg:top-28">
            <p className="hidden lg:block mb-3 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Services</p>
            {/* Phones and tablets: one dropdown with every service, nothing cut off or hidden off-screen */}
            <div className="lg:hidden">
              <label className="mb-1.5 block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">
                Show questions for
              </label>
              <CustomSelect
                value={service}
                onChange={selectService}
                options={SERVICE_OPTIONS}
                placeholder="All services"
              />
            </div>

            {/* Desktop: the full list down the left side */}
            <div className="hidden lg:flex lg:flex-col gap-2">
              {SERVICE_OPTIONS.map((o) => {
                const active = service === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => selectService(o.value)}
                    aria-pressed={active}
                    className={`text-left rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-slate-950 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="min-w-0 space-y-5 sm:space-y-6">
            {sections.length === 0 && (
              <div className="rounded-[2rem] bg-white border border-slate-200/90 p-8 text-sm text-slate-600">
                No questions match “{query}”. Try another word, or{' '}
                <Link to="/contact" className="font-semibold text-slate-950 underline underline-offset-4 hover:text-[#16a952]">
                  ask us directly
                </Link>
                .
              </div>
            )}

            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-28 rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-950 tracking-tight">{s.title}</h2>
                  <Link
                    to={`/courses/${s.courseSlug}`}
                    className="group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-950"
                  >
                    View service
                    <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {s.items.map((item, i) => {
                    const key = `${s.id}-${i}`
                    // Searching opens every match so the answer is visible straight away.
                    return (
                      <FaqItem key={key} id={`faq-${key}`} item={item} open={!!q || !!open[key]} onToggle={() => toggle(key)} />
                    )
                  })}
                </div>
              </section>
            ))}

            <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white p-8 sm:p-10 flex flex-wrap items-center justify-between gap-6 border border-white/10">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Didn't find your answer?</h2>
                <p className="text-sm text-slate-300">Send us your question and the team will reply.</p>
              </div>
              <Link
                to="/contact"
                className="bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3.5 px-6 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FaqPage
