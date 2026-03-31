'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield, Target, Trophy, Heart, ArrowRight, CheckCircle,
  Zap, RefreshCw, DollarSign, Star
} from 'lucide-react'
import { PLANS } from '@/types'
import { formatCurrency } from '@/lib/utils'

const STEPS = [
  {
    num: '01',
    icon: Shield,
    title: 'Subscribe to a plan',
    color: 'from-brand-600 to-brand-800',
    glow: 'rgba(34,197,94,0.25)',
    points: [
      'Choose monthly (£19.99) or yearly (£199.99 — 2 months free)',
      'Secure checkout via Stripe — fully PCI compliant',
      'Cancel any time with no penalty',
      'Subscription auto-renews and keeps you in each monthly draw',
    ],
  },
  {
    num: '02',
    icon: Target,
    title: 'Submit your golf scores',
    color: 'from-gold-600 to-amber-800',
    glow: 'rgba(245,158,11,0.25)',
    points: [
      'Enter your 5 most recent golf round scores (50–150 each)',
      'Our algorithm converts your scores into 5 unique draw numbers (1–49)',
      'Your numbers are deterministic — same scores always give same numbers',
      'Update your scores any time before the draw closes at month end',
    ],
  },
  {
    num: '03',
    icon: Heart,
    title: 'Choose your charity',
    color: 'from-red-600 to-rose-800',
    glow: 'rgba(239,68,68,0.2)',
    points: [
      '10% of every subscription goes to your chosen charity automatically',
      'Change your charity selection any time from your dashboard',
      'Track your total contribution in your profile',
      'Charity receives funds monthly — no minimum threshold',
    ],
  },
  {
    num: '04',
    icon: Trophy,
    title: 'Win the monthly draw',
    color: 'from-purple-600 to-purple-900',
    glow: 'rgba(147,51,234,0.25)',
    points: [
      'Draw runs on the last day of every month — fully automated',
      '5 winning numbers are randomly generated (1–49)',
      'Match 3, 4, or all 5 numbers to win a share of the prize pool',
      'Jackpot (5-match) rolls over to next month if no winner — it keeps growing',
    ],
  },
]

const PRIZE_TIERS = [
  {
    icon: '🏆',
    title: '5-number match',
    share: '40%',
    note: 'Jackpot — rolls over monthly if no winner',
    example: '£3,456',
    color: 'border-brand-500/30 bg-brand-500/5',
    labelColor: 'text-brand-400',
  },
  {
    icon: '🥈',
    title: '4-number match',
    share: '35%',
    note: 'Split equally between all 4-match winners',
    example: '£3,024',
    color: 'border-gold-500/30 bg-gold-500/5',
    labelColor: 'text-gold-400',
  },
  {
    icon: '🥉',
    title: '3-number match',
    share: '25%',
    note: 'Split equally between all 3-match winners',
    example: '£2,160',
    color: 'border-purple-500/30 bg-purple-500/5',
    labelColor: 'text-purple-400',
  },
]

const FAQ = [
  {
    q: 'How are my draw numbers generated?',
    a: 'Our algorithm takes each of your 5 golf scores and applies a deterministic formula to map each score to a number between 1 and 49. The same set of scores always produces the same 5 numbers. This means your golfing performance directly influences your draw numbers.',
  },
  {
    q: 'What happens if the jackpot rolls over?',
    a: 'If no player matches all 5 winning numbers in a given month, the entire 40% jackpot pool rolls over to the next month. This means the jackpot can grow significantly over multiple months with no winner.',
  },
  {
    q: 'How do I claim my prize?',
    a: 'After the draw runs, winners are notified via their dashboard. You upload a screenshot of your golf scores from the platform as proof. Our team reviews within 48 hours, approves the claim, and processes the payout.',
  },
  {
    q: 'Can I change my charity?',
    a: 'Yes — you can change your selected charity at any time from your dashboard. Your next monthly contribution will go to the newly selected charity.',
  },
  {
    q: 'How much goes to charity?',
    a: '10% of every subscription payment goes to your chosen charity automatically. With 100 monthly subscribers at £19.99 each, that\'s £199.90 per month going directly to charities.',
  },
  {
    q: 'What if I forget to enter my scores?',
    a: 'You can enter or update your scores at any point during the month, right up until the draw closes on the last day. If you don\'t enter scores, you won\'t have draw numbers and won\'t be included in that month\'s draw.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface-900">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-surface-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">G</span>
            </div>
            <span className="font-display font-bold text-white text-lg">GolfDraw</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/charities" className="text-white/50 text-sm hover:text-white transition-colors">Charities</Link>
            <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="btn btn-primary text-sm px-4 py-2">Join now</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/25 bg-brand-500/8 text-brand-400 text-sm mb-5">
            <Zap size={13} /> Simple. Transparent. Fair.
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            How GolfDraw works
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            One monthly subscription. Golf scores that mean something. A fair draw. A charity that wins regardless.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-20">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-8 relative overflow-hidden group"
              style={{ '--glow': step.glow } as any}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 5% 50%, ${step.glow}, transparent 60%)` }}
              />
              <div className="relative grid md:grid-cols-[auto_1fr] gap-8 items-start">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                    <step.icon size={26} className="text-white" />
                  </div>
                  <span className="font-display text-6xl font-bold text-white/5 leading-none">{step.num}</span>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-white mb-4">{step.title}</h2>
                  <ul className="space-y-2.5">
                    {step.points.map((p, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-white/55 text-sm">
                        <CheckCircle size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Prize breakdown */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Prize pool breakdown</h2>
            <p className="text-white/40">30% of every subscription builds the prize pool. Here's how it's split:</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {PRIZE_TIERS.map((tier, i) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${tier.color}`}
              >
                <div className="text-3xl mb-4">{tier.icon}</div>
                <div className={`font-display text-4xl font-bold mb-1 ${tier.labelColor}`}>{tier.share}</div>
                <h3 className="text-white font-semibold mb-2">{tier.title}</h3>
                <p className="text-white/40 text-sm mb-4">{tier.note}</p>
                <div className="p-3 rounded-xl bg-white/3">
                  <p className="text-white/25 text-xs mb-0.5">Example payout (100 subs)</p>
                  <p className={`font-display font-bold text-lg ${tier.labelColor}`}>{tier.example}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-xl border border-white/6 bg-white/2 flex items-start gap-3">
            <RefreshCw size={15} className="text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-white/45 text-sm">
              <strong className="text-white/70">Jackpot rollover:</strong> If no player matches all 5 numbers, the entire jackpot carries forward to the following month. This continues until there's a 5-match winner — so the jackpot can grow to very large amounts over time.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Choose your plan</h2>
            <p className="text-white/40">Full access to all features on both plans.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {(['monthly', 'yearly'] as const).map((plan) => (
              <div
                key={plan}
                className={`rounded-2xl p-7 border ${plan === 'yearly' ? 'border-brand-500/30 bg-brand-500/5' : 'border-white/8 bg-white/2'}`}
              >
                {plan === 'yearly' && (
                  <div className="flex items-center gap-1.5 text-gold-400 text-xs font-medium mb-3">
                    <Star size={12} /> Best value — 2 months free
                  </div>
                )}
                <h3 className="font-display text-xl font-bold text-white mb-1">{PLANS[plan].name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-display text-3xl font-bold text-white">{formatCurrency(PLANS[plan].price)}</span>
                  <span className="text-white/30">/{PLANS[plan].interval}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {PLANS[plan].features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/55 text-sm">
                      <CheckCircle size={13} className="text-brand-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/signup?plan=${plan}`} className={`btn w-full justify-center py-3 ${plan === 'yearly' ? 'btn-primary' : 'btn-outline'}`}>
                  Get started <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="rounded-xl border border-white/6 bg-white/2 p-5"
              >
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-12 rounded-3xl border border-brand-500/20 bg-brand-500/5"
        >
          <DollarSign size={40} className="text-brand-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to start?</h2>
          <p className="text-white/45 mb-7 max-w-md mx-auto">
            Join thousands of golfers making their rounds count — for a chance to win big and give back.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup?plan=monthly" className="btn btn-primary text-base px-7 py-3.5">
              Monthly — £19.99/mo <ArrowRight size={15} />
            </Link>
            <Link href="/signup?plan=yearly" className="btn btn-outline text-base px-7 py-3.5">
              <Star size={14} className="text-gold-400" /> Yearly — Save £40
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
