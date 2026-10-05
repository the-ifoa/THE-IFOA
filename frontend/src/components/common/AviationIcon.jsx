
const iconPaths = {
  // 1. Radar & Air Traffic Management
  'radar': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 6a6 6 0 1 0 6 6" />
      <path d="M12 10a2 2 0 1 0 2 2" />
      <line x1="12" y1="12" x2="21" y2="3" />
    </svg>
  ),

  'atc-tower': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16l-2 15H6L4 6z" />
      <path d="M2 6h20" />
      <path d="M8 2h8v4H8z" />
      <line x1="12" y1="6" x2="12" y2="21" />
      <line x1="7" y1="13" x2="17" y2="13" />
    </svg>
  ),

  'airspace': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  // 2. Flight Planning & Navigation
  'flight-route': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a4.5 4.5 0 0 0 0-9H7a4 4 0 0 1 0-8h11" />
      <circle cx="18" cy="2" r="2" />
      <path d="m15 5 3-3 3 3" />
    </svg>
  ),

  'waypoint': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <polygon points="12,4 20,12 12,20 4,12" fill="none" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  ),

  'altimeter': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="6" x2="12" y2="7" />
      <line x1="18" y1="12" x2="17" y2="12" />
      <line x1="12" y1="18" x2="12" y2="17" />
      <line x1="6" y1="12" x2="7" y2="12" />
      <line x1="12" y1="12" x2="15" y2="9" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),

  // 3. Flight Dispatch & OCC
  'dispatcher-headset': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
      <path d="M18 19v1a2 2 0 0 1-2 2h-4" />
      <circle cx="10" cy="22" r="1" fill="currentColor" />
    </svg>
  ),

  'occ-console': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <path d="M6 8h4" />
      <path d="M6 12h2" />
      <path d="M14 8l2 3 4-4" />
    </svg>
  ),

  'flight-takeoff': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 22h20" />
      <path d="M6.36 17.4 4 17l-2-4 1.1-.55 3.42 1.37L13 10l-4-7 2.1-1.05 6.78 6.1L21 7a2 2 0 0 1 2.83 2.83l-3.3 3.3z" />
    </svg>
  ),

  'flight-landing': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 22h20" />
      <path d="M3.77 10.77 2 9.5l2-4 1.1.55 1.37 3.42L13 7l4-7 2.1 1.05-2.88 8.45L19 11a2 2 0 0 1-2.83 2.83l-5.3-2.3z" />
    </svg>
  ),

  // 4. Ground Operations & Ramp
  'ramp-marshal': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v8" />
      <path d="M9 22l3-6 3 6" />
      <path d="M5 7l7 4 7-4" />
      <line x1="4" y1="5" x2="6" y2="9" strokeWidth="2.5" />
      <line x1="20" y1="5" x2="18" y2="9" strokeWidth="2.5" />
    </svg>
  ),

  'pushback-tug': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17h18" />
      <path d="M4 17V9a2 2 0 0 1 2-2h7l4 4h4a1 1 0 0 1 1 1v5" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
      <line x1="1" y1="14" x2="4" y2="14" strokeWidth="2.5" />
    </svg>
  ),

  'aircraft-fuel': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 22h12V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v18z" />
      <path d="M15 9h2a2 2 0 0 1 2 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V7l-3-3" />
      <rect x="6" y="6" width="6" height="4" rx="1" />
    </svg>
  ),

  // 5. Dangerous Goods (DGR)
  'dgr-flame': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12,2 22,12 12,22 2,12" />
      <path d="M12 7c0 3-2 4-2 7a4 4 0 0 0 8 0c0-3-3-5-3-7 0 2-1 3-3 0z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),

  'dgr-hazard-box': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
      <path d="M12 7v2" strokeWidth="2" />
      <circle cx="12" cy="10" r="0.5" fill="currentColor" />
    </svg>
  ),

  // 6. Train The Trainer & CBTA
  'instructor-board': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 4h20v11H2z" />
      <path d="M12 15v5" />
      <path d="M8 20h8" />
      <circle cx="7" cy="8" r="1" />
      <path d="M6 11h2" />
      <path d="M12 8h6" />
      <path d="M12 11h4" />
    </svg>
  ),

  'cbta-badge': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      <circle cx="12" cy="11" r="3" fill="currentColor" fillOpacity="0.2" />
    </svg>
  ),

  // 7. Human Factors & CRM
  'human-brain-crm': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
    </svg>
  ),

  'situational-awareness': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </svg>
  ),

  // 8. Crew Control & Scheduling
  'crew-roster': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  ),

  'pilot-briefcase': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),

  // 9. Aviation Sustainability
  'eco-aircraft': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      <path d="M2 2c2 4 4 4 6 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),

  'sustainable-fuel': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <path d="M12 11a3 3 0 0 1 3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),

  // 10. Aviation Consulting & Audits
  'airline-audit': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),

  'official-certificate': (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      <polyline points="9 8 11 10 15 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function AviationIcon({ name, className = 'w-6 h-6', ...rest }) {
  const IconRender = iconPaths[name]
  if (!IconRender) return null
  return <IconRender className={className} {...rest} />
}
