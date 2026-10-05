import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import ifoaLogo from '@/assets/shared/brand/ifoa-logoweb.webp'
import { CosmicParallaxBg } from '@/components/common/CosmicParallaxBg'

export function AdminLoginPage() {
  const { admin, loading, login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && admin) {
    return <Navigate to={location.state?.from || '/admin/courses'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(email, password)
      navigate(location.state?.from || '/admin/courses', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] text-white relative overflow-hidden">
      <CosmicParallaxBg className="cosmic-parallax-bg min-h-screen w-full flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md mx-auto relative z-10 flex flex-col items-center justify-center">
          {/* Card Container */}
          <div className="w-full bg-[#0f172a]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-7">
            {/* Logo & Portal Header */}
            <div className="text-center space-y-3">
              <Link to="/" className="inline-block group">
                <img
                  src={ifoaLogo}
                  alt="IFOA International Flight Operations Academy"
                  className="h-10 sm:h-12 w-auto mx-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              <div className="space-y-1 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold uppercase tracking-widest text-rocket-lime">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Control Portal
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Executive Sign In
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-normal">
                  Manage curriculum, course intakes, and trainee enrollments.
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@theifoa.com"
                      autoComplete="username"
                      required
                      className="w-full bg-[#020617]/80 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rocket-lime focus:ring-1 focus:ring-rocket-lime transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      required
                      className="w-full bg-[#020617]/80 border border-white/15 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rocket-lime focus:ring-1 focus:ring-rocket-lime transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 leading-relaxed">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-rocket-lime text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-rocket-lime/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Authenticating…' : 'Access Portal'}</span>
              </button>
            </form>

            {/* Back to Public Site */}
            <div className="pt-2 border-t border-white/10 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-rocket-lime transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to IFOA Public Website</span>
              </Link>
            </div>
          </div>
        </div>
      </CosmicParallaxBg>
    </div>
  )
}

export default AdminLoginPage
