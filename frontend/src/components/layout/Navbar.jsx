import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiMenu4Fill,
  RiCloseLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiDashboard3Line,
  RiBookOpenLine,
  RiGroupLine,
  RiLogoutBoxRLine
} from 'react-icons/ri'
import ifoaLogo from '@/assets/shared/brand/ifoa-logoweb.webp'
import { useAdminAuth } from '@/context/AdminAuthContext'

const ADMIN_LINKS = [
  { name: 'Admin Dashboard', path: '/admin/courses', icon: RiDashboard3Line },
  { name: 'Courses', path: '/admin/courses', icon: RiBookOpenLine },
  { name: 'Registrations', path: '/admin/registrations', icon: RiGroupLine }
]

function initialsOf(name = '', email = '') {
  const source = name.trim() || email
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'AD'
}

// Profile badge + dropdown shown in the header when an admin is signed in.
function AdminMenu({ admin, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-1 pr-2 py-1 hover:bg-white/10 transition cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid place-items-center w-7 h-7 rounded-full bg-rocket-lime text-black text-xs font-bold">
          {initialsOf(admin.name, admin.email)}
        </span>
        <span className="hidden sm:block text-xs font-semibold text-white/90 max-w-[120px] truncate">
          {admin.name || admin.email}
        </span>
        <RiArrowDownSLine className={`w-4 h-4 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            role="menu"
            className="absolute right-0 mt-2 w-60 rounded-2xl bg-white text-rocket-dark shadow-2xl border border-black/10 overflow-hidden z-50 origin-top-right"
          >
            <div className="px-4 py-3 border-b border-black/5">
              <p className="text-sm font-bold truncate">{admin.name || 'IFOA Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{admin.email}</p>
              <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider bg-rocket-lime/30 text-rocket-dark px-2 py-0.5 rounded">
                {admin.role || 'admin'}
              </span>
            </div>

            <div className="py-1">
              {ADMIN_LINKS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                  role="menuitem"
                >
                  <item.icon className="w-4 h-4 text-gray-400" />
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-black/5 py-1">
              <button
                onClick={() => {
                  setOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                role="menuitem"
              >
                <RiLogoutBoxRLine className="w-4 h-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// variant="fixed" (default) is the marketing sticky header.
// variant="static" flows in the document - used inside the admin console
// and course preview so it never overlaps other chrome.
export function Navbar({ variant = 'fixed' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()
  const isStatic = variant === 'static'

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const shouldScroll = window.scrollY > 20
          setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev))
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Flight Dispatch Courses', path: '/events' },
    { name: 'Upcoming Courses', path: '/upcoming-courses' },
    { name: 'Agent for Service', path: 'https://agent.theifoa.com/', external: true },
    { name: 'Smart Talent', path: 'https://talent.theifoa.com/', external: true },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' }
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path === '/services' && (location.pathname === '/services' || location.pathname.startsWith('/services/'))) return true
    if (path === '/events' && (location.pathname === '/events' || location.pathname.startsWith('/events/'))) return true
    if (path === '/upcoming-courses' && location.pathname === '/upcoming-courses') return true
    if (path === '/foxtrot-delta' && (location.pathname.startsWith('/foxtrot-delta') || location.pathname.startsWith('/magazine'))) return true
    if (path === '/faq' && location.pathname === '/faq') return true
    if (path === '/contact' && (location.pathname === '/contact' || location.pathname.startsWith('/contact/'))) return true
    return false
  }

  // Close mobile drawer on route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header
      className={`${isStatic ? 'relative' : 'fixed'} top-0 left-0 w-full z-50 text-white transform-gpu will-change-transform transition-[background-color,border-color,box-shadow] duration-200 ${
        isScrolled || mobileMenuOpen
          ? 'bg-[#020617] backdrop-blur-md border-b border-white/10 shadow-xl'
          : 'bg-[#020617] backdrop-blur-md border-b border-white/10 shadow-sm'
      }`}
      data-purpose="sticky-navigation"
    >
      {/* Top Navbar Row */}
      <div className="h-20 w-full flex items-center">
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group outline-none shrink-0">
            <img
              src={ifoaLogo}
              alt="IFOA International Flight Operations Academy"
              className="h-8 sm:h-9 md:h-10 w-auto object-contain brightness-105 group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Nav Links with Smooth Underline Animation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap text-sm font-medium">
            {navLinks.filter((link) => link.name !== 'Contact' && link.name !== 'FAQ').map((link) => {
              const active = isActive(link.path)
              if (link.external) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative py-2 text-sm font-medium text-white/80 hover:text-white transition-colors duration-200 outline-none focus:outline-none"
                  >
                    <span>{link.name}</span>
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rocket-lime rounded-full transition-all duration-300 ease-out origin-left scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100" />
                  </a>
                )
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative py-2 text-sm font-medium transition-colors duration-200 outline-none focus:outline-none ${
                    active ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] bg-rocket-lime rounded-full transition-all duration-300 ease-out origin-left ${
                      active
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          {/* CTA Button / Admin badge & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {admin && <AdminMenu admin={admin} onLogout={handleLogout} />}

            {/* FAQ: outlined pill beside Contact. */}
            <Link
              to="/faq"
              className={`hidden lg:inline-flex items-center border font-bold px-5 py-2 rounded-full text-sm transition-colors duration-200 outline-none focus:outline-none ${
                isActive('/faq') ? 'border-[#34E06E] text-[#34E06E]' : 'border-white/30 text-white hover:border-white hover:bg-white/10'
              }`}
            >
              FAQ
            </Link>

            {/* Contact: always-visible green pill on the right, apart from the page links. */}
            <Link
              to="/contact"
              className="hidden lg:inline-flex items-center bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-bold px-5 py-2 rounded-full text-sm transition-colors duration-200 outline-none focus:outline-none"
            >
              Contact
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <RiCloseLine className="w-6 h-6 text-white" /> : <RiMenu4Fill className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="lg:hidden bg-[#020617] border-t border-white/10 px-4 sm:px-6 py-6 space-y-4 max-h-[calc(100dvh-5rem)] overflow-y-auto shadow-2xl"
          >
            <div className="flex flex-col space-y-2">
              {navLinks.map((link, i) => {
                const active = isActive(link.path)
                if (link.external) {
                  return (
                    <motion.a
                      key={link.name}
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.14 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <span>{link.name}</span>
                      <RiArrowRightSLine className="w-5 h-5 text-rocket-lime" />
                    </motion.a>
                  )
                }
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.14 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active
                          ? 'bg-white/15 text-white font-bold'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span>{link.name}</span>
                      <RiArrowRightSLine className="w-5 h-5 text-rocket-lime" />
                    </Link>
                  </motion.div>
                )
              })}
              {admin ? (
                <div className="pt-3 mt-2 border-t border-white/10 space-y-1">
                  <div className="px-4 py-2">
                    <p className="text-sm font-bold text-white truncate">{admin.name || 'IFOA Admin'}</p>
                    <p className="text-xs text-white/50 truncate">{admin.email}</p>
                  </div>
                  {ADMIN_LINKS.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <item.icon className="w-4 h-4 opacity-70" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <RiLogoutBoxRLine className="w-4 h-4" /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}



