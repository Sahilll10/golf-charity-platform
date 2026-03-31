'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Trophy, Heart, Target, Star, ChevronDown,
  Users, TrendingUp, Shield, Zap, CheckCircle
} from 'lucide-react'
import { getNextDrawDate, formatPounds } from '@/lib/utils'
import CountUp from 'react-countup'

// Animated countdown component
function DrawCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const now = new Date()
      const draw = getNextDrawDate()
      const diff = draw.getTime() - now.getTime()
      if (diff <= 0) { setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-3">
      {[
        { value: time.days, label: 'Days' },
        { value: time.hours, label: 'Hrs' },
        { value: time.minutes, label: 'Min' },
        { value: time.seconds, label: 'Sec' },
      ].map(({ value, label }, i) => (
        <div key={label}>
          <div className="relative">
            <div className="w-16 h-16 rounded-xl glass flex flex-col items-center justify-center border border-brand-500/20">
              <span className="font-display text-2xl font-bold text-brand-400 tabular-nums leading-none">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{label}</span>
            </div>
            {i < 3 && <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-brand-500/60 font-bold text-lg">:</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// Animated number ball
function NumberBall({ n, delay = 0 }: { n: number; delay?: number }) {
  return (
    <motion.div
      className="draw-ball"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
    >
      {n}
    </motion.div>
  )
}

// How it works steps
const HOW_STEPS = [
  {
    icon: Shield,
    step: '01',
    title: 'Subscribe',
    desc: 'Join on a monthly or yearly plan. A fixed portion of every subscription fuels the prize pool and your chosen charity.',
    color: 'from-brand-600 to-brand-800',
    glow: 'rgba(34,197,94,0.3)',
  },
  {
    icon: Target,
    step: '02',
    title: 'Enter Your Scores',
    desc: 'Submit your 5 golf scores each month. Our algorithm converts your performance into your unique draw numbers.',
    color: 'from-gold-600 to-amber-800',
    glow: 'rgba(245,158,11,0.3)',
  },
  {
    icon: Trophy,
    step: '03',
    title: 'Win & Give',
    desc: 'Monthly draws run automatically. Winners verify scores and receive payouts. Your charity gets a cut either way.',
    color: 'from-purple-600 to-purple-900',
    glow: 'rgba(147,51,234,0.3)',
  },
]

// Prize pool visual
const PRIZE_BREAKDOWN = [
  { label: '5-Number Match', pct: 40, color: '#22c55e', desc: 'Jackpot — rolls over if no winner', icon: '🏆' },
  { label: '4-Number Match', pct: 35, color: '#f59e0b', desc: 'Split between 4-match winners', icon: '🥈' },
  { label: '3-Number Match', pct: 25, color: '#a78bfa', desc: 'Split between 3-match winners', icon: '🥉' },
]

// Charity highlights
const CHARITIES = [
  { name: 'Cancer Research UK', raised: 48230, category: 'Health', color: '#22c55e' },
  { name: 'British Red Cross', raised: 31450, category: 'Humanitarian', color: '#ef4444' },
  { name: 'Mental Health Foundation', raised: 27680, category: 'Mental Health', color: '#a78bfa' },
  { name: 'RSPCA', raised: 22870, category: 'Animals', color: '#f59e0b' },
]

const STATS = [
  { label: 'Active Members', value: 2841, suffix: '+', prefix: '' },
  { label: 'Total Raised for Charity', value: 149230, suffix: '', prefix: '£', format: true },
  { label: 'Current Prize Pool', value: 8640, suffix: '', prefix: '£', format: true },
  { label: 'Draws Completed', value: 24, suffix: '', prefix: '' },
]

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="min-h-screen bg-surface-900 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
        <div className="absolute inset-0 bg-surface-900/80 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">G</span>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">GolfDraw</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</Link>
            <Link href="/charities" className="text-sm text-white/60 hover:text-white transition-colors">Charities</Link>
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="btn btn-primary text-sm px-5 py-2">
              Start Playing <ArrowRight size={14} />
            </Link>
          </div>
          <Link href="/signup" className="md:hidden btn btn-primary text-sm px-4 py-2">Join Now</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="orb w-[600px] h-[600px] bg-brand-600/8 -top-32 -left-32" />
          <div className="orb w-[400px] h-[400px] bg-gold-500/6 top-1/4 right-0" style={{ animationDelay: '3s' }} />
          <div className="orb w-[300px] h-[300px] bg-purple-600/5 bottom-0 left-1/3" style={{ animationDelay: '5s' }} />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20"
        >
          {/* Left: Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/25 bg-brand-500/8 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
              <span className="text-brand-400 text-sm font-medium">Draw closes in</span>
              <span className="text-white/60 text-sm">→</span>
              <DrawCountdown />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="section-heading text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
            >
              <span className="text-white">Golf that</span>
              <br />
              <span className="gradient-text">changes lives.</span>
              <br />
              <span className="text-white/80 text-4xl md:text-5xl lg:text-6xl">Including yours.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/55 text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
            >
              Subscribe, enter your golf scores, and get entered into our monthly prize draw. A guaranteed portion of every subscription funds the charity you choose.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link href="/signup" className="btn btn-primary text-base px-7 py-3.5 glow-green-sm">
                Start for £19.99/mo <ArrowRight size={16} />
              </Link>
              <Link href="/how-it-works" className="btn btn-outline text-base px-7 py-3.5">
                See how it works
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-6 text-sm text-white/40"
            >
              {['No lock-in contract', 'Cancel any time', 'PCI-secure payments'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-brand-500" /> {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right: Prize card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="glass rounded-2xl p-8 border border-brand-500/15 glow-green relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-sm">This Month's Jackpot</p>
                    <p className="font-display text-4xl font-bold text-white mt-1">
                      £<CountUp end={8640} duration={2.5} separator="," decimals={0} />
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                    <Trophy className="text-brand-400" size={28} />
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Prize Pool Breakdown</p>
                  <div className="space-y-2.5">
                    {PRIZE_BREAKDOWN.map((p) => (
                      <div key={p.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white/70">{p.label}</span>
                          <span className="font-medium" style={{ color: p.color }}>{p.pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            style={{ background: p.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.pct}%` }}
                            transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-3">This Month's Numbers</p>
                  <div className="flex gap-2">
                    {[7, 14, 23, 38, 42].map((n, i) => (
                      <NumberBall key={n} n={n} delay={0.6 + i * 0.1} />
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-2">Example draw numbers — yours are generated from your scores</p>
                </div>

                <div className="p-4 rounded-xl bg-brand-500/8 border border-brand-500/15">
                  <div className="flex items-center gap-3">
                    <Heart size={18} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Charity this month</p>
                      <p className="text-white/40 text-xs">Cancer Research UK — £2,880 allocated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-5 glass rounded-xl px-4 py-3 border border-white/8"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Users size={14} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">2,841 members</p>
                  <p className="text-white/40 text-xs">playing this month</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-white/5 bg-surface-800/50">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                {stat.prefix}
                <CountUp
                  end={stat.value}
                  duration={2.5}
                  separator=","
                  decimals={0}
                  enableScrollSpy
                  scrollSpyOnce
                />
                {stat.suffix}
              </div>
              <div className="text-white/40 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-brand-400 text-sm font-medium uppercase tracking-widest">Simple process</span>
          <h2 className="section-heading text-4xl md:text-5xl text-white mt-3 mb-4">
            How GolfDraw works
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Three steps between you and winning big — while doing good.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-hover glass rounded-2xl p-7 relative overflow-hidden group"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 0% 0%, ${step.glow} 0%, transparent 60%)` }}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                    <step.icon size={22} className="text-white" />
                  </div>
                  <span className="font-display text-5xl font-bold text-white/6">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRIZE POOL SECTION ── */}
      <section className="py-28 px-6 bg-surface-800/30 border-y border-white/4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold-400 text-sm font-medium uppercase tracking-widest">Prize Structure</span>
            <h2 className="section-heading text-4xl md:text-5xl text-white mt-3 mb-4">
              A fair draw,<br /><span className="gradient-text">every month.</span>
            </h2>
            <p className="text-white/45 text-lg leading-relaxed mb-8">
              30% of every subscription goes directly into the prize pool. The jackpot rolls over each month if there's no 5-number winner — so it keeps growing.
            </p>
            <div className="space-y-4">
              {PRIZE_BREAKDOWN.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="text-2xl">{p.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium text-sm">{p.label}</span>
                      <span className="font-display font-bold text-xl" style={{ color: p.color }}>{p.pct}%</span>
                    </div>
                    <p className="text-white/35 text-xs">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual pie-ish */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center"
          >
            <div className="relative w-72 h-72">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {/* 3-match: 25% */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#a78bfa" strokeWidth="28"
                  strokeDasharray={`${0.25 * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                  strokeDashoffset="0" strokeLinecap="round" />
                {/* 4-match: 35% */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f59e0b" strokeWidth="28"
                  strokeDasharray={`${0.35 * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                  strokeDashoffset={`-${0.25 * 2 * Math.PI * 70}`} strokeLinecap="round" />
                {/* 5-match: 40% */}
                <circle cx="100" cy="100" r="70" fill="none" stroke="#22c55e" strokeWidth="28"
                  strokeDasharray={`${0.40 * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                  strokeDashoffset={`-${0.60 * 2 * Math.PI * 70}`} strokeLinecap="round" />
                <circle cx="100" cy="100" r="52" fill="rgba(8,12,8,0.95)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-white/30 text-xs uppercase tracking-widest">prize pool</p>
                <p className="font-display text-3xl font-bold text-white">£8,640</p>
                <p className="text-brand-400 text-sm">this month</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CHARITIES ── */}
      <section className="py-28 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-brand-400 text-sm font-medium uppercase tracking-widest">Giving back</span>
          <h2 className="section-heading text-4xl md:text-5xl text-white mt-3 mb-4">
            Choose your cause.<br /><span className="gradient-text">We'll fund it.</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            10% of your subscription goes to the charity you select. Change it any time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CHARITIES.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-hover glass rounded-xl p-5"
            >
              <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                style={{ background: `${c.color}20`, border: `1px solid ${c.color}40` }}>
                <Heart size={18} style={{ color: c.color }} />
              </div>
              <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 inline-block"
                style={{ background: `${c.color}15`, color: c.color }}>
                {c.category}
              </span>
              <h3 className="text-white font-semibold text-sm mb-2">{c.name}</h3>
              <p className="text-white/40 text-xs">
                Raised so far: <span className="text-white/70 font-medium">£{c.raised.toLocaleString()}</span>
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/charities" className="btn btn-outline px-6 py-3">
            View all charities <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-brand-500/20 glow-green"
            style={{ background: 'linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(8,12,8,0.95) 50%, rgba(245,158,11,0.08) 100%)' }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <div className="relative px-10 py-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/25 bg-brand-500/8 mb-6">
                <Zap size={14} className="text-brand-400" />
                <span className="text-brand-400 text-sm">Join 2,841 members today</span>
              </div>
              <h2 className="section-heading text-4xl md:text-5xl text-white mb-5">
                Ready to play with<br /><span className="gradient-text">purpose?</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                One subscription. Golf scores that matter. A monthly draw. A charity that wins every time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup?plan=monthly" className="btn btn-primary text-base px-8 py-4 glow-green-sm">
                  Monthly — £19.99/mo <ArrowRight size={16} />
                </Link>
                <Link href="/signup?plan=yearly" className="btn btn-outline text-base px-8 py-4">
                  <Star size={16} className="text-gold-400" />
                  Yearly — £199.99/yr
                  <span className="text-xs bg-gold-500/15 text-gold-400 px-2 py-0.5 rounded-full">Save £40</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="font-display font-bold text-white text-xs">G</span>
            </div>
            <span className="font-display font-bold text-white">GolfDraw</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30">
            <Link href="/how-it-works" className="hover:text-white/60 transition-colors">How It Works</Link>
            <Link href="/charities" className="hover:text-white/60 transition-colors">Charities</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white/60 transition-colors">Join Now</Link>
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} GolfDraw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
