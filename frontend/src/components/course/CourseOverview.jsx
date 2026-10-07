import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiAddLine, RiSubtractLine, RiArrowDownSLine, RiArrowRightSLine, RiCheckLine, RiUser3Line } from 'react-icons/ri'
import { CmsText, isPreviewEditMode } from '@/components/admin/CmsEditable'
import { COURSE_TEXT_FIELDS } from '@/lib/courseText'

// Data-driven course overview. When a course has `overview` set (see
// backend/scripts/courseOverviews.js), CourseDetailView renders these blocks
// in order instead of its fixed section template, so each course page can
// follow its own approved copy section-for-section.

const CARD = 'rounded-[2rem] bg-white border border-slate-200/90 p-7 sm:p-8 lg:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
const H2 = 'text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-950 tracking-tight'
const MUTED = 'text-xs sm:text-sm text-slate-500 leading-relaxed'

// Course the overview belongs to, so its /contact links pre-select the topic.
const CourseSlugContext = createContext('')

// Smart link: internal paths use the router, everything else a plain anchor.
function SmartLink({ href: rawHref, className, children }) {
  const courseSlug = useContext(CourseSlugContext)
  const href = rawHref === '/contact' && courseSlug ? `/contact?course=${courseSlug}` : rawHref
  if (href && href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    )
  }
  const external = /^https?:/.test(href || '')
  return (
    <a
      href={href}
      className={className}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  )
}

// Minimal inline formatting for copy: **bold** and [label](href).
function Rich({ text }) {
  if (!text) return null
  const parts = String(text).split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) return <strong key={i} className="font-bold text-slate-900">{bold[1]}</strong>
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <SmartLink key={i} href={link[2]} className="font-semibold text-slate-950 underline underline-offset-4 hover:text-[#16a952]">
          {link[1]}
        </SmartLink>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

// ---- Inline editing (admin preview) ---------------------------------------
// In the admin's live preview every overview string becomes click-to-edit.
// Paths are found by object identity: the provider walks the overview once
// and records where each object/array sits, so a renderer only needs to say
// "field k of object o". Anything not found (derived objects) renders plain.
const EditPathContext = createContext(null)

export function OverviewEditProvider({ overview, course, children }) {
  const paths = useMemo(() => {
    if ((!overview && !course) || !isPreviewEditMode()) return null
    const map = new WeakMap()
    const walk = (value, path) => {
      if (!value || typeof value !== 'object') return
      map.set(value, path)
      for (const key of Object.keys(value)) walk(value[key], `${path}.${key}`)
    }
    // Course text fields (older page layout, sidebar) edit under "course.*".
    if (course) {
      map.set(course, 'course')
      for (const key of COURSE_TEXT_FIELDS) walk(course[key], `course.${key}`)
    }
    if (overview) walk(overview, 'overview')
    return map
  }, [overview, course])
  return <EditPathContext.Provider value={paths}>{children}</EditPathContext.Provider>
}

// Channel the admin course-text editor streams this course's edits on.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export const coursePreviewKey = (slug) => `course:${slug}`

// Inside the admin editor's preview iframe: the editor's in-progress text for
// this course ({ overview, courseDetail, courseEnrollment }), else null.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function useCoursePreview(course) {
  const [live, setLive] = useState(null)
  const slug = course?.slug
  useEffect(() => {
    if (!slug || !isPreviewEditMode()) return
    const key = coursePreviewKey(slug)
    const onMessage = (event) => {
      if (event.origin !== window.location.origin) return
      const msg = event.data
      if (msg?.type === 'ifoa-preview-content' && msg.page === key && msg.data) setLive(msg.data)
    }
    window.addEventListener('message', onMessage)
    window.parent.postMessage({ type: 'ifoa-preview-ready', page: key }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [slug])
  return live
}

export function E({ o, k, rich }) {
  const paths = useContext(EditPathContext)
  const value = o?.[k]
  const base = paths && o && typeof o === 'object' ? paths.get(o) : undefined
  // The course object itself only exposes its whitelisted text fields.
  const allowed = base !== 'course' || COURSE_TEXT_FIELDS.includes(k)
  if (base === undefined || !allowed || typeof value !== 'string') return rich ? <Rich text={value} /> : value ?? null
  return <CmsText path={`${base}.${k}`} value={value} />
}

function Heading({ title, intro, compact, o }) {
  if (!title && !intro) return null
  return (
    <div className="space-y-1.5">
      {title && (
        <h2 className={compact ? 'text-lg sm:text-xl font-bold text-slate-950 tracking-tight' : H2}>{o ? <E o={o} k="title" /> : title}</h2>
      )}
      {intro && (
        <p className={MUTED}>
          {o ? <E o={o} k="intro" rich /> : <Rich text={intro} />}
        </p>
      )}
    </div>
  )
}

// ---- Hero pieces -----------------------------------------------------------

function Track({ block }) {
  const cols = block.items.length
  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-2 sm:grid-cols-[repeat(var(--n),minmax(0,1fr))] rounded-2xl border border-slate-300 overflow-hidden bg-white"
        style={{ '--n': cols }}
      >
        {block.items.map((item, i) => {
          const on = item.tone === 'on'
          const prep = item.tone === 'prep'
          // Odd count on the 2-column phone grid: last item takes the full row.
          const lone = cols % 2 === 1 && i === cols - 1
          return (
            <div
              key={i}
              className={`p-3.5 sm:p-4 min-h-[92px] flex flex-col justify-between gap-2 border-slate-200 ${
                i < cols - 1 ? 'sm:border-r' : ''
              } ${i % 2 === 0 && !lone ? 'border-r sm:border-r' : ''} ${i < cols - (lone ? 1 : 2) ? 'border-b sm:border-b-0' : ''} ${
                lone ? 'col-span-2 sm:col-span-1' : ''
              } ${
                on ? 'bg-slate-950 text-white' : prep ? 'bg-slate-100 text-slate-950' : 'bg-white text-slate-950'
              }`}
            >
              {item.label && (
                <span className={`text-[11px] font-mono uppercase tracking-wider ${on ? 'text-slate-300' : 'text-slate-500'}`}>
                  <E o={item} k="label" />
                </span>
              )}
              <strong className="text-sm sm:text-base font-bold leading-snug"><E o={item} k="title" /></strong>
              {item.sub && <small className={`text-[11px] leading-snug ${on ? 'text-slate-300' : 'text-slate-500'}`}><E o={item} k="sub" /></small>}
            </div>
          )
        })}
      </div>
      {block.key?.length > 0 && (
        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
          {block.key.map((k, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-sm border ${
                  k.tone === 'on'
                    ? 'bg-slate-950 border-slate-950'
                    : k.tone === 'prep'
                      ? 'bg-slate-100 border-slate-300'
                      : 'bg-white border-slate-300'
                }`}
              />
              <E o={k} k="label" />
            </span>
          ))}
        </div>
      )}
      {block.note && <p className={MUTED}><E o={block} k="note" /></p>}
    </div>
  )
}

function Split({ block }) {
  return (
    <div className="space-y-3">
      <div
        className="grid rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs"
        style={{ gridTemplateColumns: block.items.map((i) => `${i.weight || 1}fr`).join(' ') }}
      >
        {block.items.map((item, i) => (
          <div
            key={i}
            className={`p-4 sm:p-5 min-h-[110px] flex flex-col justify-between text-white ${
              i === 0 ? 'bg-slate-950' : 'bg-slate-900 border-l border-slate-800'
            }`}
          >
            <b className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight"><E o={item} k="value" /></b>
            <span className="text-xs sm:text-sm text-slate-300 font-medium opacity-90"><E o={item} k="label" /></span>
          </div>
        ))}
      </div>
      {block.note && <p className={MUTED}><E o={block} k="note" /></p>}
    </div>
  )
}

export function OverviewHero({ hero, fallbackTitle, fallbackLead }) {
  return (
    <div className="space-y-5">
      <div className="space-y-3.5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-slate-950 tracking-tight leading-[1.14] [text-wrap:balance]">
          {hero.title ? <E o={hero} k="title" /> : fallbackTitle}
        </h1>
        {hero.slogan && <p className="text-lg sm:text-xl font-bold text-[#16a952] leading-snug"><E o={hero} k="slogan" /></p>}
        {(hero.lead || fallbackLead) && (
          <p className="text-sm sm:text-base md:text-[16px] text-slate-600 font-normal leading-relaxed max-w-3xl">
            {hero.lead ? <E o={hero} k="lead" rich /> : <Rich text={fallbackLead} />}
          </p>
        )}
      </div>
      {(hero.blocks || []).map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

// ---- Body blocks -------------------------------------------------------------

// Hover opens on devices with a real pointer; tap/click pins an item open
// everywhere (and is the only trigger on touch screens).
const canHover = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches


// Smooth height reveal (grid-rows 0fr -> 1fr) without measuring content.
function Reveal({ open, children, className = '', inline = false }) {
  // inline: spans instead of divs, for use inside buttons.
  const Box = inline ? 'span' : 'div'
  return (
    <Box
      className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <Box className={`block overflow-hidden min-h-0 ${className}`}>
        <Box
          className={`block transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none ${
            open ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 -translate-y-1'
          }`}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

function PlusMinus({ open }) {
  return (
    <span
      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
        open ? 'bg-emerald-50 text-[#16a952]' : 'bg-slate-100 text-slate-400'
      }`}
    >
      {open ? <RiSubtractLine className="w-3.5 h-3.5" /> : <RiAddLine className="w-3.5 h-3.5" />}
    </span>
  )
}

// One card per phase with every topic visible, so the whole programme reads
// in one pass without opening anything.
function PhaseCard({ item, index, isStatic, wide }) {
  const num = item.num || String(index + 1).padStart(2, '0')
  const count = item.bullets?.length || 0
  return (
    <li className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3.5">
        <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-lg bg-slate-950 text-white font-mono text-xs font-bold tracking-wide shrink-0">
          {num}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] sm:text-base font-bold text-slate-950 leading-snug"><E o={item} k="title" /></span>
          {!isStatic && count > 0 && (
            <span className="block mt-0.5 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              {count} {count === 1 ? 'topic' : 'topics'}
            </span>
          )}
        </span>
        {item.tag && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
              item.tagTone === 'accent' ? 'bg-red-50 text-red-700 border border-red-100' : 'text-slate-500 bg-slate-100 border border-slate-200'
            }`}
          >
            <E o={item} k="tag" />
          </span>
        )}
      </div>
      {(item.text || count > 0 || item.competency) && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 flex-1">
          {item.text && <p className="text-[13px] text-slate-600 leading-relaxed"><E o={item} k="text" /></p>}
          {count > 0 && !isStatic && (
            <ul className={wide ? 'grid gap-x-8 gap-y-2 sm:grid-cols-2' : 'space-y-2'}>
              {item.bullets.map((b, j) => (
                <li key={j} className="flex items-start gap-2 text-[13px] text-slate-700 leading-snug">
                  <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0 mt-[3px]" />
                  <span><E o={item.bullets} k={j} /></span>
                </li>
              ))}
            </ul>
          )}
          {item.competency && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0" />
              <E o={item} k="competency" />
            </span>
          )}
        </div>
      )}
    </li>
  )
}

// All items shown at once as a card grid; an odd last card spans the full row.
function ItemList({ items, startIndex = 0, isStatic }) {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 md:[&>li:last-child:nth-child(odd)]:col-span-2">
      {items.map((item, i) => (
        <PhaseCard key={i} item={item} index={startIndex + i} isStatic={isStatic} wide={items.length % 2 === 1 && i === items.length - 1} />
      ))}
    </ol>
  )
}

function Practice({ practice }) {
  return (
    <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-slate-700 space-y-1">
      <strong className="block font-bold text-slate-950"><E o={practice} k="title" /></strong>
      <p className="text-slate-600 leading-relaxed font-normal"><E o={practice} k="text" /></p>
    </div>
  )
}

// Module card shown inside an open day/part panel: everything visible, no
// nested expand, so the only thing that moves on hover is the panel width.
function ModuleCard({ item, index }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-1.5">
      <div className="flex items-start gap-2">
        <span className="font-mono text-[11px] font-bold text-[#16a952] bg-emerald-50 border border-emerald-100/80 px-1.5 py-0.5 rounded shrink-0">
          {item.num || String(index + 1).padStart(2, '0')}
        </span>
        <strong className="text-xs sm:text-[13px] font-bold text-slate-950 leading-snug"><E o={item} k="title" /></strong>
      </div>
      {item.text && <p className="text-[11.5px] text-slate-600 leading-relaxed"><E o={item} k="text" /></p>}
      {item.bullets?.length > 0 && (
        <ul className="space-y-1 text-[11.5px] text-slate-600 leading-relaxed">
          {item.bullets.map((b, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0 mt-[3px]" />
              <span><E o={item.bullets} k={j} /></span>
            </li>
          ))}
        </ul>
      )}
      {item.competency && (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
          <E o={item} k="competency" />
        </span>
      )}
    </div>
  )
}

function GroupContent({ group, start, cols }) {
  return (
    <div className="space-y-3">
      <div className={`grid gap-2.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {group.items.map((item, i) => (
          <ModuleCard key={i} item={item} index={start + i} />
        ))}
      </div>
      {group.practice && <Practice practice={group.practice} />}
    </div>
  )
}

const ACTIVE_GROW = 3.2
const GAP = 16

// Titled groups (days, program parts) as a horizontal accordion on large
// screens: hovering a panel widens it, the others shrink to a summary. The
// open panel's content is laid out at a fixed width (the width an open panel
// gets), so switching panels changes width only - the row height stays put.
// Below lg the panels stack and open in height instead.
function GroupAccordion({ groups }) {
  const [pinned, setPinned] = useState(0)
  const [hovered, setHovered] = useState(null)
  const active = hovered ?? pinned
  const rowRef = useRef(null)
  const [openWidth, setOpenWidth] = useState(0)
  const starts = groups.map((_, gi) => groups.slice(0, gi).reduce((n, g) => n + g.items.length, 0))
  const unit = groups.every((g) => g.items.every((it) => /^M\d+/.test(it.num || ''))) ? 'modules' : 'topics'

  useEffect(() => {
    const el = rowRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const measure = () => {
      const total = el.clientWidth - GAP * (groups.length - 1)
      setOpenWidth((total * ACTIVE_GROW) / (ACTIVE_GROW + groups.length - 1))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [groups.length])

  // Panel padding is 24px each side; content keeps the open panel's inner width.
  const contentWidth = Math.max(openWidth - 48, 0)
  const cols = contentWidth >= 480 ? 2 : 1

  return (
    <>
      {/* lg+: horizontal, width-only accordion */}
      <div ref={rowRef} className="hidden lg:flex items-stretch w-full overflow-hidden" style={{ gap: GAP }} onMouseLeave={() => setHovered(null)}>
        {groups.map((group, gi) => {
          const open = active === gi
          return (
            <div
              key={gi}
              onMouseEnter={() => canHover() && setHovered(gi)}
              onClick={() => setPinned(gi)}
              className={`relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-[flex-grow,background-color,border-color,box-shadow] duration-500 ease-out min-w-0 ${
                open
                  ? 'bg-slate-50/40 border-emerald-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
                  : 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300'
              }`}
              style={{ flexGrow: open ? ACTIVE_GROW : 1, flexBasis: 0 }}
              aria-expanded={open}
            >
              {/* Full content, fixed width so its height never depends on the panel width */}
              <div
                className={`transition-opacity duration-300 ${open ? 'opacity-100 delay-150' : 'opacity-0 pointer-events-none'}`}
                style={{ width: contentWidth || undefined }}
                aria-hidden={!open}
              >
                <div className="flex items-baseline justify-between gap-3 pb-2.5 mb-3.5 border-b border-slate-200/70">
                  <h3 className="text-lg font-bold text-slate-950 tracking-tight"><E o={group} k="title" /></h3>
                  {group.subtitle && <span className="text-xs font-medium text-slate-500"><E o={group} k="subtitle" /></span>}
                </div>
                <GroupContent group={group} start={starts[gi]} cols={cols} />
              </div>

              {/* Collapsed summary */}
              <div
                className={`absolute inset-0 p-6 flex flex-col transition-opacity duration-300 ${
                  open ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-150'
                }`}
                aria-hidden={open}
              >
                <h3 className="text-base font-bold text-slate-900 tracking-tight"><E o={group} k="title" /></h3>
                {group.subtitle && <span className="mt-1 text-xs font-medium text-slate-500 leading-snug"><E o={group} k="subtitle" /></span>}
                <span className="mt-3 inline-flex w-fit items-center text-[11px] font-mono font-bold text-[#16a952] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  {group.items.length} {group.items.length === 1 ? unit.replace(/s$/, '') : unit}
                </span>
                <ul className="mt-4 space-y-2 text-[11.5px] text-slate-500 leading-snug">
                  {group.items.map((item, i) => (
                    <li key={i} className="line-clamp-2">
                      <E o={item} k="title" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* Below lg: vertical, height-only accordion */}
      <div className="lg:hidden space-y-3">
        {groups.map((group, gi) => {
          const open = pinned === gi
          return (
            <div
              key={gi}
              className={`rounded-2xl border p-5 transition-colors ${open ? 'bg-slate-50/40 border-emerald-200' : 'bg-slate-50/70 border-slate-200/90'}`}
            >
              <button
                type="button"
                onClick={() => setPinned(open ? -1 : gi)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <span>
                  <span className="block text-base font-bold text-slate-950"><E o={group} k="title" /></span>
                  {group.subtitle && <span className="block text-xs text-slate-500 mt-0.5"><E o={group} k="subtitle" /></span>}
                </span>
                <PlusMinus open={open} />
              </button>
              <Reveal open={open}>
                <div className="pt-4">
                  <GroupContent group={group} start={starts[gi]} cols={1} />
                </div>
              </Reveal>
            </div>
          )
        })}
      </div>
    </>
  )
}

function Accordion({ block }) {
  const groups = block.groups || [{ items: block.items || [] }]
  const titled = groups.length > 1 && groups.every((g) => g.title)
  return (
    <section id={block.anchor || undefined} className={`${CARD} space-y-6 scroll-mt-28`}>
      <Heading o={block} title={block.title} intro={block.intro} />
      {titled && block.layout === 'vertical' ? (
        // Long parts stack vertically: a heading per part, then its topics
        // as a vertical accordion (height-only).
        <div className="space-y-7">
          {groups.map((group, gi) => (
            <div key={gi} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-2.5 border-b border-slate-200/70">
                <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight"><E o={group} k="title" /></h3>
                {group.subtitle && <span className="text-xs font-medium text-slate-500 sm:text-right"><E o={group} k="subtitle" /></span>}
              </div>
              <ItemList items={group.items} isStatic={block.static} />
              {group.practice && <Practice practice={group.practice} />}
            </div>
          ))}
        </div>
      ) : titled ? (
        <GroupAccordion groups={groups} />
      ) : (
        // Untitled lists run as one vertical column: rows open downward, so
        // side-by-side columns would jump unevenly when one expands.
        <div>
          <ItemList items={groups.flatMap((g) => g.items)} isStatic={block.static} />
          {groups.map((group, gi) => group.practice && <Practice key={gi} practice={group.practice} />)}
        </div>
      )}
    </section>
  )
}

function Checks({ block, bare, fill }) {
  const body = (
    <div className={`space-y-4 ${fill ? 'flex-1 flex flex-col' : ''}`}>
      <Heading o={block} title={block.title} intro={block.intro} compact={bare} />
      <ul
        className={`rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 ${fill ? 'flex-1 flex flex-col' : ''}`}
      >
        {block.items.map((item, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 px-4 py-3.5 text-[13px] sm:text-sm text-slate-700 leading-snug ${fill ? 'flex-1' : ''}`}
          >
            <span className="w-5 h-5 rounded-full bg-[#34E06E]/15 text-[#16a952] flex items-center justify-center shrink-0">
<RiCheckLine className="w-3.5 h-3.5" />
</span>
            <span className="flex-1">
              <E o={block.items} k={i} rich />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
  return bare ? body : <section className={`${CARD} space-y-4`}>{body}</section>
}

function Facts({ block, bare, fill }) {
  const body = (
    <>
      <Heading o={block} title={block.title} intro={block.intro} compact={bare} />
      {block.text && (
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <E o={block} k="text" rich />
        </p>
      )}
      {block.boxes?.length > 0 && (
        <div className="grid sm:grid-cols-3 rounded-2xl border border-slate-300 overflow-hidden">
          {block.boxes.map((box, i) => (
            <div
              key={i}
              className={`p-4 ${i < block.boxes.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-slate-200' : 'bg-red-50'}`}
            >
              <strong className="block text-sm font-bold text-slate-950"><E o={box} k="title" /></strong>
              <span className="text-xs text-slate-600"><E o={box} k="text" /></span>
            </div>
          ))}
        </div>
      )}
      {block.items?.length > 0 && (
        <div
          className={`rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 ${
            fill && !block.standards?.length ? 'flex-1 flex flex-col' : ''
          }`}
        >
          {block.items.map((fact, i) => (
            <div key={i} className={`flex gap-3.5 px-4 py-3.5 ${fill && !block.standards?.length ? 'flex-1' : ''}`}>
              <span className="w-7 h-7 rounded-md bg-slate-950 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <strong className="block text-sm font-bold text-slate-950"><E o={fact} k="title" /></strong>
                <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                  <E o={fact} k="text" rich />
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {block.standards?.length > 0 && (
        <div className="space-y-2">
          <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Standards referenced</span>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 divide-y divide-slate-200/60">
            {block.standards.map((s, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 px-4 py-2.5 items-baseline">
                <strong className="text-[13px] font-bold text-slate-900"><E o={s} k="title" /></strong>
                <span className="text-xs text-slate-500 leading-snug"><E o={s} k="text" /></span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
  return bare ? (
    <div className={`space-y-4 ${fill ? 'flex-1 flex flex-col' : ''}`}>{body}</div>
  ) : (
    <section className={`${CARD} space-y-4`}>{body}</section>
  )
}

function Pills({ block, bare, fill }) {
  const body = (
    <div className={`space-y-3.5 ${fill ? 'flex-1 flex flex-col' : ''}`}>
      <Heading o={block} title={block.title} intro={block.intro} compact={bare} />
      <ul className={`space-y-2.5 ${fill ? 'flex-1 flex flex-col' : ''}`}>
        {block.items.map((item, i) => (
          <li
            key={i}
            className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-800 leading-snug hover:bg-white hover:border-slate-300 transition-colors shadow-2xs ${fill ? 'flex-1' : ''}`}
          >
            <span className="w-6 h-6 rounded-full bg-[#34E06E]/15 text-[#16a952] flex items-center justify-center shrink-0">
<RiUser3Line className="w-3.5 h-3.5" />
</span>
            <span className="flex-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
  return bare ? body : <section className={`${CARD} space-y-4`}>{body}</section>
}

// Standards as a horizontal row of tiles (code + what it covers).
function Standards({ block, bare }) {
  const body = (
    <>
      <Heading o={block} title={block.title} intro={block.intro} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {block.items.map((s, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 hover:bg-white hover:border-slate-300 transition-colors">
            <strong className="block text-sm font-bold text-slate-950"><E o={s} k="title" /></strong>
            <span className="block mt-0.5 text-xs text-slate-500 leading-snug"><E o={s} k="text" /></span>
          </div>
        ))}
      </div>
    </>
  )
  return bare ? <div className="space-y-4">{body}</div> : <section className={`${CARD} space-y-5`}>{body}</section>
}

function Proof({ block, bare }) {
  const body = (
    <div className="text-center space-y-5">
      {block.title && (
        <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight text-center">
          <E o={block} k="title" />
        </h2>
      )}
      {block.intro && (
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto text-center">
          <E o={block} k="intro" rich />
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-1">
        {block.items.map((p, i) => (
          <div key={i} className="text-center">
            <b className="block text-3xl sm:text-4xl font-extrabold text-slate-950 leading-none tracking-tight"><E o={p} k="value" /></b>
            <span className="text-xs sm:text-sm text-slate-500 block mt-1.5 font-medium"><E o={p} k="label" /></span>
          </div>
        ))}
      </div>
    </div>
  )
  return bare ? <div className="space-y-4">{body}</div> : <section className={`${CARD} py-8 sm:py-9`}>{body}</section>
}

// Master/detail view for text-heavy card sets: a numbered list of titles on
// the left, the selected item's description and bullets on the right.
// Hover (or tap) switches the selection; it stays until another is chosen.
function TabCards({ block }) {
  const [active, setActive] = useState(0)
  const item = block.items[active]
  return (
    <section id={block.anchor || undefined} className={`${CARD} space-y-6 scroll-mt-28`}>
      <Heading o={block} title={block.title} intro={block.intro} />

      {/* md+: list + detail panel */}
      <div className="hidden md:grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-5">
        <ol className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 overflow-hidden">
          {block.items.map((it, i) => {
            const on = i === active
            return (
              <li key={i}>
                <button
                  type="button"
                  onMouseEnter={() => canHover() && setActive(i)}
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors ${
                    on ? 'bg-slate-950 text-white' : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-md font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      on ? 'bg-[#34E06E] text-slate-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-snug"><E o={it} k="title" /></span>
                  <RiArrowDownSLine className={`w-4 h-4 -rotate-90 shrink-0 ${on ? 'text-[#34E06E]' : 'text-slate-300'}`} />
                </button>
              </li>
            )
          })}
        </ol>

        <div key={active} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 flex flex-col animate-overview-fade animate-[overviewFadeIn_.25s_ease-out]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            {String(active + 1).padStart(2, '0')} / {String(block.items.length).padStart(2, '0')}
          </span>
          <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-950 tracking-tight"><E o={item} k="title" /></h3>
          {item.text && <p className="mt-2 text-sm text-slate-600 leading-relaxed"><E o={item} k="text" /></p>}
          {item.bullets?.length > 0 && (
            <ul className="mt-5 pt-4 border-t border-slate-200/70 space-y-2.5">
              {item.bullets.map((b, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-slate-800">
                  <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0" />
                  <E o={item.bullets} k={j} />
                </li>
              ))}
            </ul>
          )}
          {item.who && <span className="mt-auto pt-4 text-xs font-bold text-slate-900"><E o={item} k="who" /></span>}
        </div>
      </div>

      {/* Mobile: stacked accordion */}
      <div className="md:hidden">
        <ItemList items={block.items.map((it) => ({ title: it.title, text: it.text, bullets: it.bullets }))} />
      </div>
    </section>
  )
}

function Cards({ block }) {
  if (block.layout === 'tabs') return <TabCards block={block} />
  const n = block.items.length
  return (
    <section id={block.anchor || undefined} className={`${CARD} space-y-5 scroll-mt-28`}>
      <Heading o={block} title={block.title} intro={block.intro} />
      <div className={`grid gap-4 ${n % 3 === 0 ? 'md:grid-cols-3' : n === 2 || n === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
        {block.items.map((item, i) => (
          <div key={i} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col gap-2">
            <h3 className="text-base font-bold text-slate-950"><E o={item} k="title" /></h3>
            {item.text && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed"><E o={item} k="text" /></p>}
            {item.bullets?.length > 0 && (
              <ul className="mt-auto pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                {item.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="w-2.5 h-[3px] bg-[#34E06E] shrink-0" />
                    <E o={item.bullets} k={j} />
                  </li>
                ))}
              </ul>
            )}
            {item.who && <span className="mt-auto pt-1 text-xs font-bold text-slate-900"><E o={item} k="who" /></span>}
          </div>
        ))}
      </div>
    </section>
  )
}

function Notice({ block }) {
  return (
    <section
      id={block.anchor || undefined}
      className={`${CARD} grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start scroll-mt-28`}
    >
      <div
        className="w-12 h-12 rounded-2xl bg-slate-950 text-[#34E06E] flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 select-none"
        aria-hidden="true"
      >
        !
      </div>
      <div className="space-y-3">
        <h2 className={H2}><E o={block} k="title" /></h2>
        {block.paragraphs.map((p, i) => (
          <p key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <E o={block.paragraphs} k={i} rich />
          </p>
        ))}
      </div>
    </section>
  )
}

function Table({ block }) {
  // "Flight Dispatcher Initial (this course)" -> name + a separate "This course" marker.
  const head = block.head.map((h) => String(h).replace(/\s*\(this course\)\s*$/i, ''))
  const cols = head.length - 1
  return (
    <section id={block.anchor || undefined} className={`${CARD} space-y-6 scroll-mt-28`}>
      <Heading o={block} title={block.title} intro={block.intro} />

      {/* Narrow containers (phones, tablet column): one card per course */}
      <div className="@container">
      <div className="grid gap-3 @[640px]:hidden">
        {head.slice(1).map((name, ci) => {
          const col = ci + 1
          const hl = col === block.highlight
          return (
            <div
              key={col}
              className={`rounded-2xl border overflow-hidden ${hl ? 'border-[#34E06E]/60 bg-emerald-50/40' : 'border-slate-200/90 bg-white'}`}
            >
              <div className={`px-4 py-3 border-b ${hl ? 'border-[#34E06E]/30' : 'border-slate-100'}`}>
                {hl && (
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#16a952]">This course</span>
                )}
                <strong className="block text-[15px] font-bold text-slate-950">{name}</strong>
              </div>
              <dl className="divide-y divide-slate-100">
                {block.rows.map((row, ri) => (
                  <div key={ri} className="px-4 py-2.5 grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3">
                    <dt className="text-xs font-medium text-slate-500"><E o={row} k={0} /></dt>
                    <dd className={`text-[13px] leading-snug ${hl ? 'font-semibold text-slate-950' : 'text-slate-800'}`}><E o={row} k={col} /></dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>

      {/* Wide containers: full comparison table */}
      <div className="hidden @[640px]:block rounded-2xl border border-slate-200/90 bg-white overflow-hidden">
        <div>
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col className="w-[24%]" />
              {Array.from({ length: cols }, (_, i) => (
                <col key={i} style={{ width: `${76 / cols}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {head.map((h, i) => {
                  const hl = i === block.highlight
                  return (
                    <th
                      key={i}
                      scope="col"
                      className={`px-5 pt-5 pb-4 align-bottom border-b border-slate-200 ${
                        hl ? 'bg-emerald-50/60 border-t-2 border-t-[#34E06E]' : ''
                      }`}
                    >
                      {hl && (
                        <span className="block mb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#16a952]">
                          This course
                        </span>
                      )}
                      <span className="block text-sm sm:text-[15px] font-bold text-slate-950 leading-snug">{h}</span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={i < block.rows.length - 1 ? 'border-b border-slate-100' : ''}>
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th key={j} scope="row" className="px-5 py-4 align-top text-[13px] font-medium text-slate-500">
                        <E o={row} k={j} />
                      </th>
                    ) : (
                      <td
                        key={j}
                        className={`px-5 py-4 align-top text-[13px] sm:text-sm leading-relaxed ${
                          j === block.highlight ? 'bg-emerald-50/60 text-slate-950 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <E o={row} k={j} />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {block.links?.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {block.links.map((l, i) => (
            <SmartLink
              key={i}
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-[#16a952] transition-colors"
            >
              <E o={l} k="label" />
              <RiArrowRightSLine className="w-4 h-4 text-slate-400 group-hover:text-[#16a952] group-hover:translate-x-0.5 transition-transform" />
            </SmartLink>
          ))}
        </div>
      )}
    </section>
  )
}

function Faq({ block }) {
  const [open, setOpen] = useState(-1)
  return (
    <section id="faq" className={`${CARD} space-y-4 scroll-mt-28`}>
      <Heading title={block.title || 'Questions'} />
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {block.items.map((item, i) => (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
              className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-slate-950"><E o={item} k="q" /></span>
              {open === i ? <RiSubtractLine className="w-5 h-5 text-[#16a952] shrink-0" /> : <RiAddLine className="w-5 h-5 text-[#16a952] shrink-0" />}
            </button>
            {open === i && (
              <p className="pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <E o={item} k="a" rich />
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function Related({ block }) {
  return (
    <section className="rounded-2xl bg-emerald-50 border border-emerald-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
      <p className="text-xs sm:text-sm text-slate-800"><E o={block} k="text" /></p>
      <SmartLink href={block.href} className="text-xs sm:text-sm font-bold text-slate-950 underline underline-offset-4 hover:text-[#16a952]">
        <E o={block} k="label" />
      </SmartLink>
    </section>
  )
}

function Band({ block }) {
  return (
    <section id={block.anchor || undefined} className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#040814] text-white p-8 sm:p-9 grid md:grid-cols-2 gap-6 scroll-mt-28">
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight"><E o={block} k="title" /></h2>
        {block.intro && <p className="text-xs sm:text-sm text-slate-300 leading-relaxed"><E o={block} k="intro" /></p>}
        {block.ctaLabel && (
          <SmartLink
            href={block.href || '/contact'}
            className="inline-flex mt-2 items-center justify-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold py-3 px-6 rounded-full text-xs uppercase tracking-wider"
          >
            <E o={block} k="ctaLabel" />
          </SmartLink>
        )}
      </div>
      <ul className="divide-y divide-white/10 border-t border-white/10">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-3 text-xs sm:text-sm text-slate-200">
            <span className="w-5 h-5 rounded-full bg-[#34E06E]/15 text-[#16a952] flex items-center justify-center shrink-0 mt-px">
<RiCheckLine className="w-3.5 h-3.5" />
</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Text({ block, bare }) {
  const body = (
    <>
      <Heading title={block.title} />
      {block.paragraphs.map((p, i) => (
        <p key={i} className={`text-xs sm:text-sm leading-relaxed ${block.mutedLast && i === block.paragraphs.length - 1 ? 'text-slate-500' : 'text-slate-700'}`}>
          <E o={block.paragraphs} k={i} rich />
        </p>
      ))}
    </>
  )
  return bare ? (
    <div className="space-y-3">{body}</div>
  ) : (
    <section id={block.anchor || undefined} className={`${CARD} space-y-3 scroll-mt-28`}>
      {body}
    </section>
  )
}

const BARE = { checks: Checks, facts: Facts, pills: Pills, standards: Standards, proof: Proof, text: Text }

function Cols({ block }) {
  return (
    <section id={block.anchor || undefined} className={`${CARD} grid md:grid-cols-2 gap-8 md:gap-10 scroll-mt-28`}>
      {block.columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-6 h-full">
          {col.map((b, j) => {
            const C = BARE[b.type]
            // A lone list stretches to the height of the other column.
            return C ? <C key={j} block={b} bare fill={col.length === 1} /> : <Block key={j} block={b} />
          })}
        </div>
      ))}
    </section>
  )
}

// ---- Dangerous Goods role/operation picker --------------------------------------

// Role / operation / course-type choice, shared between the picker in the page
// body and the sidebar course card (DgSidebar) when a DgProvider wraps both.
const DgContext = createContext(null)

function useDgState(block) {
  const roleKeys = Object.keys(block?.roles || {})
  const opKeys = Object.keys(block?.ops || {})
  const [role, setRole] = useState(roleKeys[0])
  const [op, setOp] = useState(opKeys[0])
  const [type, setType] = useState('initial')
  return { role, setRole, op, setOp, type, setType }
}

export function DgProvider({ block, children }) {
  const state = useDgState(block)
  if (!block) return children
  return <DgContext.Provider value={state}>{children}</DgContext.Provider>
}

function useDg(block) {
  const shared = useContext(DgContext)
  const local = useDgState(block)
  const s = shared || local
  const opDef = block.ops[s.op]
  // Cargo carries no cabin crew: fall back to the first role.
  const role = opDef.noCabin && s.role === 'cabin' ? Object.keys(block.roles)[0] : s.role
  return { ...s, role, opDef, roleLabel: block.roles[role].label }
}

// Sidebar course card for Dangerous Goods: reflects the chosen role and
// operation, with an Initial / Recurrent switch.
// Sidebar wording lives in the dgExplorer block (block.sidebar) so it can be
// edited in the admin; these defaults cover data saved before it existed.
const DG_SIDEBAR_DEFAULTS = {
  priceTitle: 'Price per group',
  priceNote: 'on request',
  rows: [
    { label: 'Duration', value: '4 hours' },
    { label: 'Format', value: 'Self-paced online' },
    { label: 'Assessment', value: '' },
    { label: 'Certificate', value: 'Valid 24 months' },
    { label: 'Start', value: 'Scheduled with your group' }
  ],
  ctaLabel: 'Request a proposal',
  secondaryLabel: 'What operators get'
}

export function DgSidebar({ block, contactHref = '/contact' }) {
  const { role, type, setType, opDef, roleLabel } = useDg(block)
  const sb = block.sidebar || DG_SIDEBAR_DEFAULTS
  // The Assessment row follows the selected role unless it has its own text.
  const rowValue = (row) => (row.label === 'Assessment' && !row.value ? block.assessShort?.[role] : null)
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
          {roleLabel}, {type}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5"><E o={opDef} k="label" /></p>
      </div>
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label="Course type">
        {['initial', 'recurrent'].map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={type === k}
            onClick={() => setType(k)}
            className={`px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold capitalize transition-colors cursor-pointer ${
              type === k ? 'bg-[#C8102E] text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="text-3xl font-extrabold text-slate-950 tracking-tight leading-none">
        <E o={sb} k="priceTitle" /> <small className="text-sm font-medium text-slate-500"><E o={sb} k="priceNote" /></small>
      </p>
      <dl className="border-t border-slate-100 text-xs sm:text-[13px]">
        {sb.rows.map((row, i) => (
          <div key={i} className="flex justify-between gap-4 py-2.5 border-b border-slate-100">
            <dt className="text-slate-500"><E o={row} k="label" /></dt>
            <dd className="font-bold text-slate-950 text-right">{rowValue(row) ?? <E o={row} k="value" />}</dd>
          </div>
        ))}
      </dl>
      <div className="space-y-2.5">
        <Link
          to={contactHref}
          className="block w-full text-center bg-slate-950 hover:bg-[#C8102E] text-white font-extrabold py-3.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors"
        >
          <E o={sb} k="ctaLabel" />
        </Link>
        <a
          href="#operators"
          className="block w-full text-center border border-slate-300 hover:border-slate-950 text-slate-900 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
        >
          <E o={sb} k="secondaryLabel" />
        </a>
      </div>
    </div>
  )
}

function Seg({ items, value, onChange, disabled = () => false }) {
  return (
  <div className="flex flex-wrap gap-2">
    {Object.entries(items).map(([k, v]) => (
      <button
        key={k}
        type="button"
        disabled={disabled(k)}
        aria-pressed={value === k}
        onClick={() => onChange(k)}
        className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
          value === k ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
        } disabled:opacity-40 disabled:line-through disabled:cursor-not-allowed cursor-pointer`}
      >
        <E o={v} k="label" />
      </button>
    ))}
  </div>
)
}

function DgExplorer({ block }) {
  const { role: activeRole, setRole, op, setOp, opDef, roleLabel } = useDg(block)

  const forWhom = `For ${roleLabel.toLowerCase()}s in ${opDef.label.toLowerCase()}.`
  const pick = (d) => d.all || d[op] || (opDef.carry ? d.carry : d.nocarry)
  const o = block.outcomes[activeRole]
  let outcomes = [...o.all]
  if (!opDef.carry && o.nocarry) outcomes = outcomes.concat(o.nocarry)
  if (opDef.carry && o.carry) outcomes = outcomes.concat(o.carry)
  if (op === 'cargo' && o.cargo) outcomes = outcomes.concat(o.cargo)

  return (
    <>
      <section className={`${CARD} space-y-5`}>
        <div className="space-y-2">
          <strong className="block text-sm font-bold text-slate-950">{block.roleLegend || 'Your role'}</strong>
          <Seg items={block.roles} value={activeRole} onChange={setRole} disabled={(k) => k === 'cabin' && opDef.noCabin} />
        </div>
        <div className="space-y-2">
          <strong className="block text-sm font-bold text-slate-950">{block.opLegend || 'Your operation'}</strong>
          <Seg items={block.ops} value={op} onChange={setOp} />
          <p className="text-xs text-slate-500 min-h-[1.2em]">{opDef.noCabin ? block.noCabinNote : ''}</p>
        </div>
      </section>

      <section id="modules" className={`${CARD} space-y-5 scroll-mt-28`}>
        <Heading
          title={block.modulesTitle}
          intro={`Seven modules for ${roleLabel.toLowerCase()}s in ${opDef.label.toLowerCase()}. Modules marked adapted change with your operation.`}
        />
        <ol className="border-t border-slate-100">
          {block.modules.map((m, i) => (
            <li key={i} className="grid grid-cols-[44px_1fr_auto] gap-3 items-baseline py-4 border-b border-slate-100">
              <b className="font-mono text-sm font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</b>
              <div>
                <h3 className="text-sm sm:text-[15px] font-bold text-slate-950"><E o={m} k="t" /></h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{pick(m.d)}</p>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                  m.adapt ? 'bg-red-50 text-red-700 border border-red-100' : 'text-slate-500 border border-slate-200'
                }`}
              >
                {m.adapt ? 'Adapted' : 'All operations'}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${CARD} grid md:grid-cols-2 gap-8 md:gap-10`}>
        {/* Same heading + one-line intro on both sides, cards stretch to equal height */}
        <div className="flex flex-col h-full">
          <Checks bare fill block={{ title: block.outcomesTitle, intro: forWhom, items: outcomes }} />
        </div>
        <div className="flex flex-col h-full">
          <Facts
            bare
            fill
            block={{
              title: block.assessTitle,
              intro: forWhom,
              items: [{ title: 'Scenarios', text: block.assess[activeRole].replace(/^Scenarios:\s*/, '') }, ...(block.assessFacts || [])]
            }}
          />
        </div>
      </section>
    </>
  )
}

const BLOCKS = {
  track: Track,
  split: Split,
  notice: Notice,
  accordion: Accordion,
  checks: Checks,
  facts: Facts,
  pills: Pills,
  standards: Standards,
  proof: Proof,
  cards: Cards,
  table: Table,
  faq: Faq,
  related: Related,
  band: Band,
  text: Text,
  cols: Cols,
  dgExplorer: DgExplorer
}

function Block({ block }) {
  const C = BLOCKS[block.type]
  return C ? <C block={block} /> : null
}

export function OverviewBlocks({ blocks, courseSlug = '' }) {
  return (
    <CourseSlugContext.Provider value={courseSlug}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </CourseSlugContext.Provider>
  )
}
