import { Link } from 'react-router-dom'
import { RiLinkedinFill, RiFacebookFill, RiInstagramLine, RiYoutubeFill, RiArrowUpLine } from 'react-icons/ri'
import ifoaLogo from '@/assets/shared/brand/ifoa-logoweb.webp'

// Footer link groups. Courses split by who books them so each column stays
// short; every course entry opens its own course page.
const course = (label, slug) => ({ label, to: `/courses/${slug}` })
const LINK_GROUPS = [
  {
    title: 'For individuals',
    links: [
      course('Flight Dispatcher Initial', 'flight-dispatcher-initial-certification'),
      course('FAA Aircraft Dispatcher', 'aircraft-dispatcher-training-faa-part-65'),
      course('Double Programme', 'flight-dispatcher-double-programme'),
      { label: 'Upcoming courses', to: '/upcoming-courses' }
    ]
  },
  {
    title: 'For operators',
    links: [
      course('Dangerous Goods', 'dangerous-goods-regulations-cbta-initial'),
      course('Train the Trainer', 'train-the-trainer-icao-cbta-instructor'),
      course('Human Factors for the OCC', 'human-factors-in-the-occ'),
      course('Crew Control', 'airline-crew-control-flight-rostering'),
      course('OCC Consulting', 'airline-occ-setup-operational-consulting')
    ]
  },
  {
    title: 'IFOA',
    links: [
      { label: 'About', to: '/about' },
      { label: 'All services', to: '/services' },
      { label: 'Foxtrot Delta', to: '/foxtrot-delta' },
      { label: 'Agent for Service', href: 'https://agent.theifoa.com/' },
      { label: 'Contact', to: '/contact' }
    ]
  }
]

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/71556135/', Icon: RiLinkedinFill },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100069215447113', Icon: RiFacebookFill },
  { label: 'Instagram', href: 'https://www.instagram.com/theifoa/', Icon: RiInstagramLine },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UCH2vo2z3uLuPOTI1TwFaT7A', Icon: RiYoutubeFill }
]

const LINK_CLASS = 'text-slate-400 hover:text-white transition-colors'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#020617] pt-16 sm:pt-20 pb-8 border-t border-white/10 text-white select-none" data-purpose="main-footer">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-x-8 gap-y-12 pb-14">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-5">
            <Link to="/" className="inline-flex" aria-label="IFOA home">
              <img src={ifoaLogo} alt="IFOA" className="h-9 w-auto object-contain brightness-110" />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Flight dispatch and operations control training to FAA, ICAO and EASA standards.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#34E06E] text-slate-300 hover:text-slate-950 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="space-y-5">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">{group.title}</h4>
              <ul className="space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-7 border-t border-white/10 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>© {currentYear} International Flight Operations Academy GmbH</p>
            <Link to="/impressum" className="hover:text-white transition-colors">
              Impressum
            </Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy policy
            </Link>
          </div>
          <button
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer shrink-0"
            aria-label="Back to top"
          >
            <span className="hidden sm:inline font-semibold">Back to top</span>
            <span className="w-7 h-7 rounded-full border border-slate-600 group-hover:border-[#34E06E] group-hover:text-[#34E06E] flex items-center justify-center transition-colors duration-200">
              <RiArrowUpLine className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
