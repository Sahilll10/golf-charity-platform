import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPounds } from '@/lib/utils'
import { Heart, ArrowRight, ExternalLink, Users } from 'lucide-react'

export default async function CharitiesPage() {
  const supabase = createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('total_raised', { ascending: false })

  const totalRaised = charities?.reduce((s, c) => s + c.total_raised, 0) || 0

  const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Health':        { bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/20' },
    'Humanitarian':  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20' },
    'Animals':       { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
    'Elderly':       { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    'Mental Health': { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20' },
  }

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
            <Link href="/login" className="text-white/50 text-sm hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="btn btn-primary text-sm px-4 py-2">Join now</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/25 bg-red-500/8 mb-5">
            <Heart size={14} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">Giving back</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Charities we support
          </h1>
          <p className="text-white/45 text-lg max-w-2xl mx-auto mb-8">
            10% of every subscription goes directly to the charity our members choose. You decide where your contribution lands.
          </p>

          {/* Platform total */}
          <div className="inline-flex items-center gap-4 p-5 rounded-2xl glass border border-brand-500/15">
            <div className="text-left">
              <p className="text-white/35 text-xs uppercase tracking-widest">Total raised by GolfDraw members</p>
              <p className="font-display text-3xl font-bold text-white mt-1">{formatPounds(totalRaised)}</p>
            </div>
            <div className="w-px h-12 bg-white/8" />
            <div className="text-left">
              <p className="text-white/35 text-xs uppercase tracking-widest">Charities supported</p>
              <p className="font-display text-3xl font-bold text-brand-400 mt-1">{charities?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {charities?.map((charity, i) => {
            const colors = CATEGORY_COLORS[charity.category || ''] || { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' }
            const shareOfTotal = totalRaised > 0 ? (charity.total_raised / totalRaised) * 100 : 0

            return (
              <div
                key={charity.id}
                className="glass-hover glass rounded-2xl p-6 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                    <Heart size={22} className={colors.text} />
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                    {charity.category}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">{charity.name}</h3>
                <p className="text-white/40 text-sm leading-relaxed flex-1 mb-5">{charity.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/3">
                    <p className="font-display font-bold text-base text-white">{formatPounds(charity.total_raised)}</p>
                    <p className="text-white/30 text-xs mt-0.5">Total raised</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-white/30" />
                      <p className="font-display font-bold text-base text-white">{charity.donor_count.toLocaleString()}</p>
                    </div>
                    <p className="text-white/30 text-xs mt-0.5">Contributors</p>
                  </div>
                </div>

                {/* Share bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/25">Platform share</span>
                    <span className={colors.text}>{shareOfTotal.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${shareOfTotal}%`, background: `linear-gradient(90deg, #22c55e, #a3e635)` }}
                    />
                  </div>
                </div>

                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors mt-auto"
                  >
                    <ExternalLink size={11} /> Visit {charity.name}
                  </a>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl glass border border-brand-500/15">
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            Ready to play for good?
          </h2>
          <p className="text-white/45 mb-6 max-w-md mx-auto">
            Choose your charity when you subscribe. Your contribution is automatic every month.
          </p>
          <Link href="/signup" className="btn btn-primary text-base px-8 py-3.5">
            Start contributing <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  )
}
