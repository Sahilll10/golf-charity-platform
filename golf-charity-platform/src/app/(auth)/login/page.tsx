'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #0f150f 100%)' }}>
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="orb w-96 h-96 bg-brand-600/15 -top-20 -left-20" />
        <div className="orb w-64 h-64 bg-gold-500/10 bottom-20 right-0" style={{ animationDelay: '3s' }} />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white">G</span>
            </div>
            <span className="font-display font-bold text-white text-xl">GolfDraw</span>
          </Link>
        </div>

        <div className="relative">
          <div className="glass rounded-2xl p-6 border border-brand-500/15 mb-8 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <Trophy className="text-gold-400" size={20} />
              <span className="text-white font-medium">This month's jackpot</span>
            </div>
            <p className="font-display text-4xl font-bold text-white">£8,640</p>
            <p className="text-brand-400 text-sm mt-1">Draw closes in 12 days</p>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Your scores.<br />Your draw.<br /><span className="gradient-text">Your charity.</span>
          </h2>
          <p className="text-white/40 text-base">Sign back in to manage your subscription, enter scores and track your winnings.</p>
        </div>

        <p className="relative text-white/20 text-sm">© {new Date().getFullYear()} GolfDraw</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">G</span>
              </div>
              <span className="font-display font-bold text-white text-lg">GolfDraw</span>
            </Link>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/40 mb-8">Sign in to your account to continue playing.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-white/60">Password</label>
                <Link href="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Join GolfDraw
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-4 rounded-xl border border-white/6 bg-white/2">
            <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">Test credentials</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-white/30">Subscriber:</span>
                <span className="text-white/60">subscriber@test.com / Test1234!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Admin:</span>
                <span className="text-white/60">admin@test.com / Admin1234!</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
