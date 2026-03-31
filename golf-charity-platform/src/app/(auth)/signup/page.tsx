'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Star, Shield, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()

  const [step, setStep] = useState<'account' | 'plan'>('account')
  const [plan, setPlan] = useState<'monthly' | 'yearly'>(
    (params.get('plan') as 'monthly' | 'yearly') || 'monthly'
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'account') { setStep('plan'); return }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Redirect to Stripe checkout
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: data.user.id, email }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
      else router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-8"
      >
        {/* Left: Form */}
        <div className="card">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">G</span>
              </div>
              <span className="font-display font-bold text-white text-lg">GolfDraw</span>
            </Link>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {['account', 'plan'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? 'bg-brand-500 text-white' :
                  (s === 'account' && step === 'plan') ? 'bg-brand-500/20 text-brand-400' :
                  'bg-white/5 text-white/20'
                }`}>
                  {s === 'account' && step === 'plan' ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-sm capitalize ${step === s ? 'text-white' : 'text-white/30'}`}>{s}</span>
                {i === 0 && <div className="w-8 h-px bg-white/10 mx-1" />}
              </div>
            ))}
          </div>

          {step === 'account' ? (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">Create your account</h1>
                <p className="text-white/40 text-sm mb-6">Get started in under 2 minutes.</p>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Full name</label>
                <input className="input" placeholder="Your name" value={fullName}
                  onChange={e => setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Email address</label>
                <input type="email" className="input" placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} className="input pr-12"
                    placeholder="Minimum 8 characters" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={8} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-3">
                Continue to plan <ArrowRight size={16} />
              </button>

              <p className="text-center text-white/40 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">Choose your plan</h1>
                <p className="text-white/40 text-sm mb-6">Both plans include full draw access and charity giving.</p>
              </div>

              {(['monthly', 'yearly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`w-full rounded-xl p-5 text-left transition-all border ${
                    plan === p
                      ? 'border-brand-500/50 bg-brand-500/8'
                      : 'border-white/6 bg-white/2 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        plan === p ? 'border-brand-500' : 'border-white/20'
                      }`}>
                        {plan === p && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                      </div>
                      <span className="text-white font-semibold">{PLANS[p].name}</span>
                      {p === 'yearly' && (
                        <span className="text-xs bg-gold-500/15 text-gold-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} /> Best value
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-display text-xl font-bold text-white">
                        {formatCurrency(PLANS[p].price)}
                      </span>
                      <span className="text-white/30 text-sm">/{PLANS[p].interval}</span>
                    </div>
                  </div>
                  <p className="text-white/40 text-xs ml-7">{PLANS[p].description}</p>
                  {p === 'yearly' && (
                    <p className="text-brand-400 text-xs ml-7 mt-1">✓ {PLANS[p].savings}</p>
                  )}
                </button>
              ))}

              <div className="flex items-center gap-2 text-white/30 text-xs p-3 rounded-lg bg-white/2">
                <Shield size={12} className="text-brand-400 flex-shrink-0" />
                Secure payment via Stripe. Cancel any time. No hidden fees.
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue to payment <ArrowRight size={16} />
                  </span>
                )}
              </button>

              <button type="button" onClick={() => setStep('account')}
                className="w-full text-center text-white/30 text-sm hover:text-white/60 transition-colors">
                ← Back
              </button>
            </form>
          )}
        </div>

        {/* Right: Benefits */}
        <div className="hidden lg:block">
          <div className="glass rounded-2xl p-8 border border-brand-500/15 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Everything you get</h3>
              <p className="text-white/40 text-sm mb-6">Every subscriber gets the full GolfDraw experience.</p>
              <ul className="space-y-4">
                {[
                  { icon: '🏆', text: 'Monthly draw entry with your golf scores' },
                  { icon: '❤️', text: 'Choose a charity and fund it automatically' },
                  { icon: '📊', text: 'Score entry and performance tracking' },
                  { icon: '💰', text: 'Winner dashboard + payout tracking' },
                  { icon: '📱', text: 'Mobile + desktop — full responsive access' },
                  { icon: '🔒', text: 'Secure Stripe billing — cancel any time' },
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-white/70 text-sm"
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.text}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-brand-500/15 bg-brand-500/5 mt-6">
              <p className="text-white/40 text-xs mb-1">This month's jackpot</p>
              <p className="font-display text-3xl font-bold text-white">£8,640</p>
              <p className="text-brand-400 text-sm mt-1">Could be yours.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
