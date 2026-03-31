'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Trophy, Heart, Target } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SubscribedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('full_name').eq('id', user.id).single()
      setName(profile?.full_name?.split(' ')[0] || 'there')
    }
    load()
  }, [])

  const NEXT_STEPS = [
    { icon: Heart, title: 'Choose your charity', desc: 'Pick the cause you want to support', href: '/dashboard/charity', cta: 'Select charity' },
    { icon: Target, title: 'Enter your scores', desc: 'Submit your 5 golf scores to get your draw numbers', href: '/dashboard/scores', cta: 'Enter scores' },
    { icon: Trophy, title: 'View your dashboard', desc: 'See the current draw and your stats', href: '/dashboard', cta: 'Go to dashboard' },
  ]

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full bg-brand-500/15 border-2 border-brand-500/30 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={44} className="text-brand-400" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            You're in, {name}! 🎉
          </h1>
          <p className="text-white/45 mb-10">
            Your subscription is active. You're now eligible for the monthly draw and your charity contributions begin this month.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 mb-8"
        >
          {NEXT_STEPS.map((step, i) => (
            <Link
              key={i}
              href={step.href}
              className="flex items-center justify-between p-4 rounded-xl border border-white/6 bg-white/2 hover:border-brand-500/25 hover:bg-brand-500/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/12 border border-brand-500/20 flex items-center justify-center">
                  <step.icon size={18} className="text-brand-400" />
                </div>
                <div className="text-left">
                  <p className="text-white/85 font-medium text-sm">{step.title}</p>
                  <p className="text-white/35 text-xs">{step.desc}</p>
                </div>
              </div>
              <span className="text-brand-400 text-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/20 text-xs"
        >
          A confirmation email has been sent to you by Stripe.
        </motion.p>
      </div>
    </div>
  )
}
