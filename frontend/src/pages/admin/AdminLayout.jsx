import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Users,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Globe,
  ChevronRight,
  Mail,
  LayoutDashboard,
  Info,
  X
} from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import ifoaWhiteLogo from '@/assets/shared/brand/ifoa-logoweb.webp'

function NavItem({ to, icon: Icon, children, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
          isActive
            ? 'bg-slate-900 text-white font-bold shadow-xs border border-slate-900'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
              }`}
            />
            <span>{children}</span>
          </div>
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

// Structured Step-by-Step Help & Operational Guidance for each admin view
const HELP = {
  overview: {
    title: 'Dashboard',
    category: 'Start here',
    summary: 'Everything you edit is one click from here: website pages, course pages and their application forms.',
    steps: [
      {
        step: '01',
        title: 'Edit a website page',
        desc: 'Under Website Pages, click Edit. The live page opens; click any text or "Replace image" to change it, then Save.'
      },
      {
        step: '02',
        title: 'Edit a course page or form',
        desc: 'Under Course Pages, use Edit Page for the course page and Edit Form for its application page. Settings holds price, dates and status.'
      },
      {
        step: '03',
        title: 'Follow up on leads',
        desc: 'The cards at the top show new registrations and contact messages. Click one to open the list.'
      }
    ],
    proTip: 'Changes go live as soon as you save. No redeploy needed.'
  },
  coursesList: {
    title: 'Courses Catalog Management',
    category: 'Curriculum Management',
    summary: 'View, filter, and configure all flight dispatch, ground ops, and instructor certification courses available on the website.',
    steps: [
      {
        step: '01',
        title: 'Review Course Status & Schema',
        desc: 'Check live visibility status and whether each course is using the shared master template or a custom registration form.'
      },
      {
        step: '02',
        title: 'Update Course Specifications',
        desc: 'Click "Edit Course Info" to update tuition fees, schedules, syllabus modules, instructor profiles, and intake locations.'
      },
      {
        step: '03',
        title: 'Customize Registration Forms',
        desc: 'Click "Edit Form" on any course card to add, reorder, or customize the exact questions candidates answer when enrolling.'
      },
      {
        step: '04',
        title: 'Preview Public Experience',
        desc: 'Click "Preview" to open the live public course page in a new tab and verify the user experience.'
      }
    ],
    proTip: 'Click "Edit Page" on any course to change its wording right on the live page.'
  },
  courseEditor: {
    title: 'Course Metadata & Specifications',
    category: 'Course Editor',
    summary: 'Edit the factual curriculum data, pricing, schedule, and syllabus for this specific training program.',
    steps: [
      {
        step: '01',
        title: 'Edit Core Logistics',
        desc: 'Update dates, seat availability, training venue, tuition fees, and regulatory standard alignments (FAA, EASA, ICAO, DGCA).'
      },
      {
        step: '02',
        title: 'Update Curriculum & Media',
        desc: 'Refine syllabus topics, learning objectives, and custom promotional hero banners.'
      },
      {
        step: '03',
        title: 'Save to Catalog',
        desc: 'Click "Save Course" to publish your updates immediately across the live catalog and course details view.'
      }
    ],
    proTip: 'To customize the application questions for this course, use "Edit Form" on the course card in the catalog.'
  },
  form: {
    title: 'Custom Enrollment Form Schema',
    category: 'Form Builder',
    summary: 'Design the customized questionnaire candidates complete when registering for this specific course.',
    steps: [
      {
        step: '01',
        title: 'Add & Customize Fields',
        desc: 'Insert text fields, dropdown selects, radios, checkboxes, file uploads, and date pickers.'
      },
      {
        step: '02',
        title: 'Configure Validation Rules',
        desc: 'Mark fields as required or optional, configure placeholder hints, and organize custom field order.'
      },
      {
        step: '03',
        title: 'Switch to Custom Mode',
        desc: 'Saving your changes switches this course from "Using Template" to "Custom Form" mode.'
      }
    ],
    proTip: 'Submissions for this course will appear in the Registrations inbox tagged with this course name and custom field answers.'
  },
  formTemplate: {
    title: 'Master Default Form Template',
    category: 'Master Blueprint',
    summary: 'The baseline questionnaire blueprint that automatically seeds every newly created course.',
    steps: [
      {
        step: '01',
        title: 'Standardize Core Questions',
        desc: 'Maintain standard contact information, nationality, aviation credentials, and experience fields.'
      },
      {
        step: '02',
        title: 'Apply Blueprint to New Courses',
        desc: 'Updates made here automatically apply to all newly created courses and existing courses still "Using Template".'
      },
      {
        step: '03',
        title: 'Save Master Schema',
        desc: 'Click "Save Template" to update the global baseline across the academy platform.'
      }
    ],
    proTip: 'Courses with their own custom saved forms will NOT be overwritten by changes to this master template.'
  },
  pageEditor: {
    title: 'Live Page Content Editor',
    category: 'Interactive CMS',
    summary: 'Edit section headlines, descriptive copy, button labels, and images with immediate side-by-side preview.',
    steps: [
      {
        step: '01',
        title: 'Select Section Tabs',
        desc: 'Navigate through page sections (Hero, Value Pillars, Curriculum, Testimonials, FAQ, CTA).'
      },
      {
        step: '02',
        title: 'Edit Copy in Real Time',
        desc: 'Modify text inputs on the left. The live preview on the right instantly reflects your changes.'
      },
      {
        step: '03',
        title: 'Publish or Reset',
        desc: 'Click "Save Content" to publish your changes live, or "Reset to Default" to revert to factory defaults.'
      }
    ],
    proTip: 'CMS changes are saved in the database and immediately delivered to web visitors without server restarts.'
  },
  courseContentEditor: {
    title: 'Per-Course Page Text Overrides',
    category: 'Content Customization',
    summary: 'Customize the public overview and sign-up copy specifically for this individual course.',
    steps: [
      {
        step: '01',
        title: 'Tailor Custom Wording',
        desc: 'Write unique value propositions, specific learning objectives, and custom enrollment notes for this program.'
      },
      {
        step: '02',
        title: 'Review Course-Specific Preview',
        desc: 'Verify how the tailored copy looks alongside this course’s specific tuition pricing and schedule.'
      },
      {
        step: '03',
        title: 'Save Isolated Override',
        desc: 'Save your text. Only this course will use the custom wording; other courses continue using the default template.'
      }
    ],
    proTip: 'Click "Reset to Shared Template" anytime to discard the custom override and revert to the shared default wording.'
  },
  submissions: {
    title: 'Student Registrations Pipeline',
    category: 'Admissions CRM',
    summary: 'Track, review, and manage student registration applications submitted across all courses.',
    steps: [
      {
        step: '01',
        title: 'Filter & Search Applications',
        desc: 'Filter incoming leads by course title, enrollment status, or search by student name and email.'
      },
      {
        step: '02',
        title: 'Inspect Complete Application',
        desc: 'Click any submission to view full candidate answers, passport numbers, experience details, and attachments.'
      },
      {
        step: '03',
        title: 'Manage Pipeline & Notes',
        desc: 'Update the lead status (New, Contacted, In Review, Enrolled, Closed) and log internal administrative notes.'
      }
    ],
    proTip: 'Contact applicants via WhatsApp or Email directly using the quick-action buttons in the detail drawer.'
  },
  contactMessages: {
    title: 'Contact Inquiries Inbox',
    category: 'Communications Inbox',
    summary: 'Direct repository for all corporate, airline, and individual messages submitted through the public Contact page.',
    steps: [
      {
        step: '01',
        title: 'Review Incoming Inquiries',
        desc: 'Read message body, sender name, email, organization, and primary topic of interest.'
      },
      {
        step: '02',
        title: 'Direct Responder Outreach',
        desc: 'Click the sender email to open your email client or copy contact information for team follow-up.'
      },
      {
        step: '03',
        title: 'Archive & Track Status',
        desc: 'Mark resolved inquiries and track ongoing airline training consultations.'
      }
    ],
    proTip: 'All messages are securely saved in the database first, so you never lose an inquiry even if email relay is delayed.'
  }
}

export function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const [helpOpen, setHelpOpen] = useState(false)

  // Generate breadcrumb / title based on pathname
  const getPageInfo = () => {
    if (location.pathname === '/admin')
      return { title: 'Dashboard', crumb: 'Dashboard', sub: 'Pages & Courses', help: HELP.overview }
    if (/^\/admin\/courses\/[^/]+\/content\/[^/]+$/.test(location.pathname))
      return { title: 'Edit Page Text', crumb: 'Curriculum', sub: 'Per-Course Content', help: HELP.courseContentEditor }
    if (location.pathname.endsWith('/form'))
      return { title: 'Enrollment Form Schema', crumb: 'Forms', sub: 'Custom Builder', help: HELP.form }
    if (location.pathname === '/admin/form-template')
      return { title: 'Default Form Template', crumb: 'Forms', sub: 'Master Blueprint', help: HELP.formTemplate }
    if (location.pathname.startsWith('/admin/pages/'))
      return { title: 'Edit Page Content', crumb: 'CMS', sub: 'Live Content Editor', help: HELP.pageEditor }
    if (location.pathname.startsWith('/admin/submissions'))
      return { title: 'Student Submissions', crumb: 'Admissions', sub: 'Registrations Pipeline', help: HELP.submissions }
    if (location.pathname.startsWith('/admin/contact-messages'))
      return { title: 'Contact Messages', crumb: 'Admissions', sub: 'Inquiry Inbox', help: HELP.contactMessages }
    if (/^\/admin\/courses\/[^/]+$/.test(location.pathname))
      return { title: 'Course Editor', crumb: 'Curriculum', sub: 'Course Specifications', help: HELP.courseEditor }
    return { title: 'Courses Catalog', crumb: 'Curriculum', sub: 'All Academic Programs', help: HELP.coursesList }
  }

  const pageInfo = getPageInfo()

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {/* 1. Full-Width Top Header (Black Background) */}
      <header className="h-16 shrink-0 bg-[#020617] text-white border-b border-slate-800/90 flex items-center justify-between z-30 shadow-md">
        {/* Left: Logo container (matches w-64 of the left sidebar with border-r) + Breadcrumbs & Title */}
        <div className="flex items-center h-full">
          {/* Logo container matching exact w-64 width of left sidebar */}
          <div className="w-64 shrink-0 h-full px-5 flex items-center border-r border-slate-800/90">
            <Link to="/" className="inline-flex items-center group">
              <img
                src={ifoaWhiteLogo}
                alt="IFOA Official"
                className="h-8 w-auto object-contain brightness-105 group-hover:scale-102 transition-transform"
              />
            </Link>
          </div>

          {/* Breadcrumbs & Title */}
          <div className="px-6 sm:px-8">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span>{pageInfo.crumb}</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="text-emerald-400 font-bold">{pageInfo.sub}</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                {pageInfo.title}
              </h1>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                title="How this page works"
                className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-[#34E06E] hover:bg-[#34E06E]/10 transition-colors cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 px-6 sm:px-8">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* 2. Workspace Body: Left Sidebar + Main Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Sidebar (100% White Background) */}
        <aside className="w-64 shrink-0 bg-white text-slate-900 flex flex-col justify-between border-r border-slate-200/90 h-full select-none z-20 shadow-xs">
          {/* Navigation Links */}
          <div className="p-5 space-y-5 overflow-y-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34E06E]" />
              <span>Admin Console</span>
            </div>

            <nav className="space-y-1 pt-1">
              <NavItem to="/admin" icon={LayoutDashboard} end>
                Dashboard
              </NavItem>
              <NavItem to="/admin/courses" icon={BookOpen}>
                Courses
              </NavItem>
              <NavItem to="/admin/submissions" icon={Users}>
                Registrations
              </NavItem>
              <NavItem to="/admin/contact-messages" icon={Mail}>
                Contact Messages
              </NavItem>
            </nav>
          </div>

          {/* Bottom Section: Profile & Actions */}
          <div className="p-4 border-t border-slate-200/80 space-y-2.5 bg-slate-50/80 shrink-0">
            {/* Admin User Badge */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#34E06E] text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'IA'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{admin?.name || 'IFOA Admin'}</p>
                <p className="text-[10px] text-slate-500 truncate">{admin?.email || 'admin@theifoa.com'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/80 transition-all text-center"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Public Site</span>
              </Link>

              <button
                onClick={logout}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/60 transition-all text-center cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Scrollable Page Body */}
        <main className="flex-1 min-w-0 p-6 sm:p-8 overflow-y-auto bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>

      {/* Help modal - structured step-by-step guidance for every admin page */}
      <AnimatePresence>
        {helpOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 sm:p-6"
            onClick={() => setHelpOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl sm:max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[88vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 text-[#34E06E] shadow-2xs">
                    <Info className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0d6833] bg-[#34E06E]/15 px-2 py-0.5 rounded-md">
                        {pageInfo.help?.category || 'Step-by-Step Guide'}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug pt-0.5">
                      {pageInfo.help?.title || pageInfo.title}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close Guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
                {/* Summary Box */}
                {pageInfo.help?.summary && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {pageInfo.help.summary}
                  </div>
                )}

                {/* Step-by-Step Action Cards */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                    Operational Workflow
                  </span>
                  <div className="space-y-2.5">
                    {(pageInfo.help?.steps || []).map((stepItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex items-start gap-3.5"
                      >
                        <div className="w-7 h-7 rounded-xl bg-slate-900 text-[#34E06E] font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {stepItem.step}
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {stepItem.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {stepItem.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro-Tip Callout */}
                {pageInfo.help?.proTip && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5 leading-relaxed font-medium">
                    <span className="w-5 h-5 rounded-lg bg-[#34E06E] text-slate-950 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      ★
                    </span>
                    <div>
                      <strong className="font-bold text-emerald-900 block mb-0.5">Pro-Tip</strong>
                      <span>{pageInfo.help.proTip}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-xs transition-colors"
                >
                  Got It, Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminLayout
