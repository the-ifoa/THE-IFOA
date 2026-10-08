import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  RiCustomerService2Fill,
  RiSendPlaneFill,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
  RiQuestionLine,
  RiWhatsappFill,
  RiHome5Fill,
  RiHome5Line,
  RiMessage3Fill,
  RiMessage3Line,
  RiQuestionAnswerFill,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiLoader4Line,
  RiCheckLine
} from 'react-icons/ri'
import { MdOutlineMail } from 'react-icons/md'
import { api } from '@/lib/api'
import ifoaLogo from '@/assets/shared/brand/ifoa-logo.webp'

const SUGGESTIONS = [
  'Which dispatcher course is right for me?',
  'How long is Flight Dispatcher Initial, and what does it cost?',
  'Is there an EASA flight dispatcher license?',
  'What are the FAA Aircraft Dispatcher requirements?',
  'How do I apply, and when do courses start?',
  'Do you train OCC teams online or at our base?',
]

// ── Home view (Matches reference layout) ─────────────────────────────────────
function HomeView({ onAsk, onViewMessages }) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Greeting */}
      <div className="px-6 pt-7 pb-5 bg-gray-50">
        <h2 className="text-2xl font-black text-gray-900 leading-snug mb-1">
          Hi there 👋
        </h2>
        <h3 className="text-2xl font-black text-gray-900 leading-snug">
          How can we help?
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Recent message card */}
        <button
          onClick={onViewMessages}
          className="w-full bg-white rounded-2xl p-4 text-left transition-all hover:shadow-md border border-gray-200 cursor-pointer"
        >
          <p className="text-xs font-bold text-gray-500 mb-3">Recent message</p>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <img src={ifoaLogo} alt="IFOA" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-900">IFOA Assistant</p>
                <p className="text-xs text-gray-400 shrink-0 ml-2">now</p>
              </div>
              <p className="text-sm text-gray-500 truncate">
                Hi! I'm the IFOA Academy Assistant. How can I help you today?
              </p>
            </div>
          </div>
        </button>

        {/* Ask a question */}
        <button
          onClick={() => onAsk('')}
          className="w-full bg-white rounded-2xl px-5 py-4 flex items-center justify-between text-left transition-all hover:shadow-md border border-gray-200 cursor-pointer"
        >
          <span className="text-sm font-bold text-gray-900">Ask a question</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <RiQuestionLine className="w-4 h-4 text-gray-700" />
          </div>
        </button>

        {/* Search / common questions */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Search for help</span>
            <RiSearchLine className="w-4 h-4 text-gray-400" />
          </div>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => onAsk(s)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left transition-colors hover:bg-gray-50 group cursor-pointer"
              style={{ borderBottom: i < SUGGESTIONS.length - 1 ? '1px solid #f3f4f6' : 'none' }}
            >
              <span className="text-sm text-gray-700 leading-snug pr-3">{s}</span>
              <RiArrowRightSLine className="w-4 h-4 text-gray-400 shrink-0 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Help view (Direct Contact) ────────────────────────────────────────────────
function HelpView({ onAsk }) {
  const ADMISSIONS_EMAIL = 'info@theifoa.com'
  const WHATSAPP_NUMBER = '+41 78 227 3103'

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-snug mb-1">Need more help?</h2>
          <p className="text-sm text-gray-500">Our academic admissions team is here to assist with flight ops programs and enrollment.</p>
        </div>

        {/* Email contact card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <MdOutlineMail className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Email Admissions</p>
              <p className="text-sm font-bold text-gray-900 leading-none">Course Consultation</p>
            </div>
          </div>
          <a
            href={`mailto:${ADMISSIONS_EMAIL}?subject=IFOA%20Course%20Inquiry`}
            className="block w-full text-center rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold py-2.5 transition-colors"
          >
            {ADMISSIONS_EMAIL}
          </a>
          <p className="text-[11px] text-gray-400 text-center mt-2">We reply to every inquiry within two working days.</p>
        </div>

        {/* WhatsApp Card */}
        <div className="rounded-2xl border border-gray-200 p-5 bg-gradient-to-br from-slate-50 to-slate-100/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center shrink-0 text-white text-xl font-bold shadow-xs">
              <RiWhatsappFill className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">WhatsApp Live Support</p>
              <p className="text-sm font-bold text-gray-900 leading-none">{WHATSAPP_NUMBER}</p>
            </div>
          </div>
          <a
            href="https://wa.me/41782273103"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-xl bg-slate-950 hover:bg-black text-white text-sm font-extrabold py-2.5 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <RiWhatsappFill className="w-4 h-4 text-white shrink-0" />
            <span>Message on WhatsApp</span>
          </a>
        </div>

        {/* Ask the assistant */}
        <button
          onClick={() => onAsk?.(null)}
          className="w-full flex items-center justify-between rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm px-5 py-4 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 text-left">
            <RiCustomerService2Fill className="w-5 h-5 text-gray-700 shrink-0" />
            <div>
              <p className="text-sm font-bold text-gray-900">Chat with the assistant</p>
              <p className="text-[11px] text-gray-400">Instant answers to curriculum questions</p>
            </div>
          </div>
          <RiArrowRightSLine className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>
    </div>
  )
}

// ── Chat view ─────────────────────────────────────────────────────────────────
function ChatView({ messages, setMessages, loading, setLoading, initialQuestion, onInitialConsumed }) {
  const [input, setInput] = useState(initialQuestion || '')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRef = useRef(null)
  const sentInitial = useRef(false)

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
  }, [messages])

  const sendMessage = async (text) => {
    const msg = (text !== undefined ? text : input).trim()
    if (!msg || loading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '42px'

    const history = [...messages, { role: 'user', content: msg }]
    setMessages(history)
    setLoading(true)

    try {
      const apiPayload = history.map(m => ({
        role: m.role === 'assistant' ? 'bot' : 'user',
        text: m.content
      }))
      const { reply } = await api.chat(apiPayload.slice(-12))
      setMessages(prev => [...prev, { role: 'assistant', content: reply || "Sorry, I couldn't process that." }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please reach out via info@theifoa.com or WhatsApp +41 78 227 3103."
      }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuestion && !sentInitial.current) {
      sentInitial.current = true
      // Clear it in the parent so re-opening / re-mounting the chat view
      // never auto-fires the same question again.
      onInitialConsumed?.()
      sendMessage(initialQuestion)
    } else {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Rich text: links, bold, numbered steps, bullet lists, course chips ─────
  const LINK_RE = /(https?:\/\/[^\s]+|\/courses\/[a-z0-9/-]+|\/events\b|\/contact\b)/gi
  const COURSE_RE = /^(.{2,120}?)\s+[ - –-]\s+((?:https?:\/\/[^\s]+)|(?:\/courses\/[a-z0-9/-]+))\s*$/i
  const STEP_RE = /^\s*(\d{1,2})[.)]\s+(.*)$/
  const BULLET_RE = /^\s*[-•*]\s+(.*)$/

  const linkLabel = (href) => {
    if (/^\/courses\/[a-z0-9-]+\/enroll$/i.test(href)) return 'enrollment page'
    if (/^\/courses\/[a-z0-9-]+$/i.test(href)) return 'course page'
    if (/^\/events\b/i.test(href)) return 'Events page'
    if (/^\/contact\b/i.test(href)) return 'Contact page'
    return href.replace(/^https?:\/\//, '')
  }

  const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w][\w.-]*\b/
  const PHONE_RE = /\+?\d[\d ().-]{7,}\d/
  const CONTACT_RE = new RegExp(`(${EMAIL_RE.source}|${PHONE_RE.source})`, 'g')

  const renderInline = (text, kp = '') =>
    text.split(LINK_RE).map((seg, j) => {
      if (seg && /^(https?:\/\/|\/courses\/|\/events|\/contact)/i.test(seg)) {
        return (
          <a
            key={`${kp}l${j}`}
            href={seg}
            target={seg.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="text-[#34E06E] font-semibold underline decoration-1 underline-offset-2 hover:text-[#28c85e] break-words"
          >
            {linkLabel(seg)}
          </a>
        )
      }
      return seg.split(/\*\*(.*?)\*\*/g).map((p, k) =>
        k % 2 === 1
          ? <strong key={`${kp}b${j}-${k}`} className="font-semibold text-slate-900">{p}</strong>
          : <React.Fragment key={`${kp}t${j}-${k}`}>{p}</React.Fragment>
      )
    })

  // Pull emails / phone numbers out of a line into their own full-width chips.
  const renderRich = (text, kp = '') =>
    String(text).split(CONTACT_RE).map((seg, j) => {
      if (seg && EMAIL_RE.test(seg)) {
        return (
          <a
            key={`${kp}e${j}`}
            href={`mailto:${seg}`}
            className="my-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-[13px] font-semibold text-slate-900 no-underline transition-colors hover:border-[#34E06E] hover:bg-emerald-50/50"
          >
            <svg className="w-4 h-4 shrink-0 text-[#34E06E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="break-all">{seg}</span>
          </a>
        )
      }
      if (seg && PHONE_RE.test(seg) && seg.replace(/\D/g, '').length >= 8) {
        return (
          <a
            key={`${kp}w${j}`}
            href={`https://wa.me/${seg.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="my-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-emerald-50/50 px-3 py-2 text-[13px] font-semibold text-slate-900 no-underline transition-colors hover:border-[#34E06E] hover:bg-emerald-50"
          >
            <svg className="w-4 h-4 shrink-0 text-[#34E06E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span>{seg.trim()}</span>
          </a>
        )
      }
      return <React.Fragment key={`${kp}f${j}`}>{renderInline(seg, `${kp}${j}-`)}</React.Fragment>
    })

  const renderText = (text) => {
    const blocks = []
    let list = null // { type: 'ol' | 'ul', items: [] }
    const flush = () => { if (list) { blocks.push(list); list = null } }

    String(text).split('\n').forEach((line, i) => {
      const course = line.match(COURSE_RE)
      if (course) {
        flush()
        blocks.push({ type: 'course', label: course[1].trim(), href: course[2].trim(), key: i })
        return
      }
      const step = line.match(STEP_RE)
      if (step) {
        if (!list || list.type !== 'ol') { flush(); list = { type: 'ol', items: [] } }
        list.items.push(step[2])
        return
      }
      const bullet = line.match(BULLET_RE)
      if (bullet) {
        if (!list || list.type !== 'ul') { flush(); list = { type: 'ul', items: [] } }
        list.items.push(bullet[1])
        return
      }
      flush()
      if (line.trim() === '') { blocks.push({ type: 'gap', key: i }); return }
      blocks.push({ type: 'p', text: line, key: i })
    })
    flush()

    return blocks.map((b, bi) => {
      if (b.type === 'gap') return <div key={`g${bi}`} className="h-1.5" />
      if (b.type === 'p') {
        return (
          <div key={`p${bi}`} className="whitespace-pre-wrap">
            {renderRich(b.text, `p${bi}-`)}
          </div>
        )
      }
      if (b.type === 'course') {
        const external = b.href.startsWith('http')
        const isEnroll = /\/enroll$/i.test(b.href)
        return (
          <a
            key={`c${bi}`}
            href={b.href}
            target={external ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 no-underline transition-colors hover:border-[#34E06E] hover:bg-emerald-50/50 group"
          >
            <span className="text-[13px] font-semibold text-slate-900 leading-snug">{b.label}</span>
            <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#34E06E] group-hover:text-[#28c85e]">
              {isEnroll ? 'Enroll' : 'View'}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        )
      }
      if (b.type === 'ol') {
        return (
          <ol key={`ol${bi}`} className="space-y-1.5">
            {b.items.map((it, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px] font-bold">
                  {k + 1}
                </span>
                <span className="flex-1 leading-relaxed">{renderRich(it, `ol${bi}-${k}-`)}</span>
              </li>
            ))}
          </ol>
        )
      }
      if (b.type === 'ul') {
        return (
          <ul key={`ul${bi}`} className="space-y-1">
            {b.items.map((it, k) => (
              <li key={k} className="flex gap-2">
                <RiCheckLine className="w-3.5 h-3.5 text-[#16a952] shrink-0 mt-[3px]" />
                <span className="flex-1 leading-relaxed">{renderRich(it, `ul${bi}-${k}-`)}</span>
              </li>
            ))}
          </ul>
        )
      }
      return null
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50 min-h-0">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                <img src={ifoaLogo} alt="" className="h-7 w-auto object-contain" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-950 text-white rounded-2xl rounded-br-sm shadow-sm'
                  : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-200 shadow-sm'
              }`}
            >
              <div className="space-y-1.5">{renderText(msg.content)}</div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src={ifoaLogo} alt="" className="h-7 w-auto object-contain" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-4 shadow-sm flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="block w-2 h-2 rounded-full bg-[#34E06E]"
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={(el) => {
              inputRef.current = el
              textareaRef.current = el
            }}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={handleKey}
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition leading-relaxed"
            style={{ height: 44, maxHeight: 100 }}
            onFocus={(e) => {
              e.target.style.borderColor = '#34E06E'
              e.target.style.background = '#fff'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.background = '#f9fafb'
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shrink-0 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed bg-slate-900 hover:bg-black cursor-pointer"
          >
            {loading ? (
              <RiLoader4Line className="w-5 h-5 animate-spin text-white" />
            ) : (
              <RiSendPlaneFill className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Width sizes ───────────────────────────────────────────────────────────────
const WIDTH_SIZES = [430, 540, 640]

// ── Root ChatWidget component ─────────────────────────────────────────────────
const STORAGE_KEY = 'ifoa-chat-v1'
const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hi! 👋 I'm the IFOA Academy Assistant.\n\nI can help with flight dispatch certifications, OCC training curriculum, cohort dates, or admissions questions. What would you like to know?",
}

function loadSavedChat() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    if (saved && Array.isArray(saved.messages) && saved.messages.length) return saved
  } catch { /* storage unavailable or corrupt */ }
  return null
}

export function ChatWidget() {
  const [saved] = useState(loadSavedChat)
  const [open, setOpen] = useState(saved?.open ?? false)
  const [view, setView] = useState(saved?.view ?? 'home') // 'home' | 'chat' | 'help'
  const [widthIndex, setWidthIndex] = useState(0)
  const [messages, setMessages] = useState(saved?.messages ?? [WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [initialQuestion, setInitialQuestion] = useState(null)
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [pastHeroNow, setPastHeroNow] = useState(false)

  const { pathname } = useLocation()
  const isAdminPage = pathname.startsWith('/admin')
  const isHomePage = pathname === '/'

  // Sticky one-way reveal: once the visitor has scrolled past the hero on
  // any page, keep the launcher visible for the rest of the session - except
  // on the landing page, where it hides again whenever the hero is in view. This
  // widget persists across route changes (it doesn't remount), but
  // ScrollToTop resets window.scrollY to 0 on every navigation - a two-way
  // toggle here would re-hide the launcher on every page change, which reads
  // as the chat "vanishing" when browsing from page to page.
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isPast = window.scrollY > Math.min(window.innerHeight * 0.7, 450)
          setPastHeroNow(isPast)
          if (isPast) setScrolledPastHero(true)
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
    if (open) setUnread(0)
  }, [open])

  const skipUnreadRef = useRef(true)
  useEffect(() => {
    // Skip the mount run so a restored conversation doesn't show a fake unread badge.
    if (skipUnreadRef.current) { skipUnreadRef.current = false; return }
    if (!open && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
      setUnread((n) => n + 1)
    }
  }, [messages, open])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, open, view }))
    } catch { /* storage unavailable */ }
  }, [messages, open, view])

  const handleAsk = (q) => {
    setInitialQuestion(q || null)
    setView('chat')
  }

  const handleViewMessages = () => {
    setInitialQuestion(null)
    setView('chat')
  }

  const currentWidth = WIDTH_SIZES[widthIndex]
  const cycleWidth = () => {
    setWidthIndex((i) => (i + 1) % WIDTH_SIZES.length)
  }

  // Hide on admin console
  if (isAdminPage) return null

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: view === 'home' ? <RiHome5Fill className="w-5 h-5 text-gray-900" /> : <RiHome5Line className="w-5 h-5" />,
    },
    {
      id: 'chat',
      label: 'Messages',
      icon: view === 'chat' ? <RiMessage3Fill className="w-5 h-5 text-gray-900" /> : <RiMessage3Line className="w-5 h-5" />,
    },
    {
      id: 'help',
      label: 'Help',
      icon: view === 'help' ? <RiQuestionAnswerFill className="w-5 h-5 text-gray-900" /> : <RiQuestionLine className="w-5 h-5" />,
    },
  ]

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] transition-all duration-300 ease-out ${
        (isHomePage ? pastHeroNow : scrolledPastHero) || open
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {/* Floating Action Button */}
      {!open && (
        <motion.button
          key="fab"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center bg-slate-950 text-white hover:bg-black transition-colors cursor-pointer border border-white/20"
        >
          <RiCustomerService2Fill className="w-6 h-6 text-white" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#34E06E] text-black text-[10px] font-black flex items-center justify-center shadow-xs">
              {unread}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            className="absolute bottom-0 right-0 bg-white rounded-3xl overflow-hidden flex flex-col max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-48px)] max-h-[calc(100vh-90px)] sm:max-h-[calc(100vh-120px)] shadow-[0_24px_80px_rgba(0,0,0,0.22),_0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200/90 origin-bottom-right"
            style={{
              width: currentWidth,
              height: 600,
              transition: 'width 0.28s cubic-bezier(0.16, 1, 0.3, 1), height 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                  <img src={ifoaLogo} alt="IFOA" className="h-8 w-auto object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 leading-none">IFOA Assistant</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-none truncate">
                    International Flight Operations Academy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Width toggle */}
                <button
                  onClick={cycleWidth}
                  title={`Width: ${currentWidth}px - click to resize`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  {widthIndex === WIDTH_SIZES.length - 1 ? (
                    <RiFullscreenExitLine className="w-4 h-4 text-gray-600" />
                  ) : (
                    <RiFullscreenLine className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Back button */}
                {view !== 'home' && (
                  <button
                    onClick={() => setView('home')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <RiArrowLeftSLine className="w-5 h-5 text-gray-600" />
                  </button>
                )}

                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <RiCloseLine className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* View content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {view === 'home' && (
                <HomeView
                  onAsk={handleAsk}
                  onViewMessages={handleViewMessages}
                />
              )}
              {view === 'chat' && (
                <ChatView
                  messages={messages}
                  setMessages={setMessages}
                  loading={loading}
                  setLoading={setLoading}
                  initialQuestion={initialQuestion}
                  onInitialConsumed={() => setInitialQuestion(null)}
                />
              )}
              {view === 'help' && (
                <HelpView onAsk={handleAsk} />
              )}
            </div>

            {/* Bottom tab bar */}
            <div className="shrink-0 border-t border-gray-100 bg-white">
              <div className="flex items-center">
                {tabs.map((tab) => {
                  const isActive = view === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === 'home') setView('home')
                        else if (tab.id === 'chat') {
                          setInitialQuestion(null)
                          setView('chat')
                        } else if (tab.id === 'help') {
                          setView('help')
                        }
                      }}
                      className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors relative cursor-pointer"
                      style={{ color: isActive ? '#111827' : '#9ca3af' }}
                    >
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gray-900" />
                      )}
                      {tab.icon}
                      <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatWidget
