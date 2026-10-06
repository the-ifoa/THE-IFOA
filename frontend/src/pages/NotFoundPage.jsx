import { Link } from 'react-router-dom'
import { HiArrowUpRight } from 'react-icons/hi2'
import { Seo } from '@/components/common/Seo'

// Replaces a blanket redirect to "/" for unknown URLs. Redirecting every typo
// and every retired page to the homepage reads as a soft 404 to Google and
// leaves visitors with no idea what happened.
export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center text-center px-6 py-24">
      <Seo
        path="/404"
        title="Page not found | IFOA"
        description="This page does not exist. Browse IFOA's flight dispatcher training programs and upcoming intakes."
        noindex
      />

      <span className="text-xs font-mono font-black uppercase tracking-widest text-slate-950 border-b-2 border-[#34E06E] pb-1">
        Error 404
      </span>

      <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
        We couldn&rsquo;t find that page
      </h1>

      <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
        The page may have moved when we rebuilt the site. Everything below is a good
        place to pick up from.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 bg-[#34E06E] hover:bg-[#28c85e] text-slate-950 font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all"
        >
          <span>Upcoming Intakes</span>
          <HiArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all"
        >
          Training Services
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all"
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
