import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDrawMonth, formatPounds, getNextDrawDate } from '@/lib/utils'
import {
  Trophy, Heart, Target, TrendingUp, ArrowRight,
  AlertCircle, Crown, Calendar
} from 'lucide-react'
import DrawCountdownServer from '@/components/dashboard/DrawCountdownServer'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: subscription }, { data: currentDraw }, { data: myEntry }] =
    await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*, charity:charities(*)').eq('user_id', user.id).single(),
      supabase.from('draws').select('*').eq('status', 'open').maybeSingle(),
      supabase.from('draw_entries')
        .select('*, draw:draws(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  const { data: winnings } = await supabase
    .from('winner_verifications')
    .select('prize_amount, payment_status')
    .eq('user_id', user.id)

  const { data: entryCount } = await supabase
    .from('draw_entries')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)

  const totalWon = winnings?.reduce((sum, w) => sum + (w.prize_amount || 0), 0) || 0
  const drawsEntered = entryCount?.length || 0
  const isActive = subscription?.status === 'active'
  const drawMonth = currentDraw?.draw_month || new Date().toISOString().slice(0, 7)
  const hasScoresThisMonth = myEntry?.draw?.draw_month === drawMonth

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Member'} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {isActive
              ? `You're eligible for the ${formatDrawMonth(drawMonth)} draw.`
              : 'Subscribe to enter the monthly draw.'}
          </p>
        </div>
        {isActive && !hasScoresThisMonth && (
          <Link href="/dashboard/scores" className="btn btn-primary">
            Enter scores <ArrowRight size={15} />
          </Link>
        )}
      </div>

      {/* Subscription alert if inactive */}
      {!isActive && (
        <div className="flex items-start gap-4 p-5 rounded-xl border border-gold-500/25 bg-gold-500/8">
          <AlertCircle size={20} className="text-gold-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium">No active subscription</p>
            <p className="text-white/50 text-sm mt-0.5">Subscribe to enter monthly draws and fund your chosen charity.</p>
          </div>
          <Link href="/api/subscribe" className="btn btn-primary text-sm px-4 py-2 flex-shrink-0">
            Subscribe now
          </Link>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Trophy,
            label: 'Total won',
            value: formatPounds(totalWon),
            sub: 'All time',
            color: 'text-gold-400',
            bg: 'bg-gold-500/8',
            border: 'border-gold-500/20',
          },
          {
            icon: Target,
            label: 'Draws entered',
            value: drawsEntered,
            sub: 'All time',
            color: 'text-brand-400',
            bg: 'bg-brand-500/8',
            border: 'border-brand-500/20',
          },
          {
            icon: Heart,
            label: 'Charity',
            value: (subscription as any)?.charity?.name?.split(' ')[0] || '—',
            sub: 'Your chosen cause',
            color: 'text-red-400',
            bg: 'bg-red-500/8',
            border: 'border-red-500/20',
          },
          {
            icon: Crown,
            label: 'Plan',
            value: subscription?.plan === 'yearly' ? 'Yearly' : subscription?.plan === 'monthly' ? 'Monthly' : 'None',
            sub: isActive ? 'Active ✓' : 'Inactive',
            color: 'text-purple-400',
            bg: 'bg-purple-500/8',
            border: 'border-purple-500/20',
          },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-5 border ${stat.bg} ${stat.border}`}>
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className={`font-display text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-white/70 text-sm font-medium mt-0.5">{stat.label}</p>
            <p className="text-white/30 text-xs mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Countdown + draw info */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {formatDrawMonth(drawMonth)} Draw
              </h2>
              <p className="text-white/40 text-sm">
                {hasScoresThisMonth ? '✓ You are entered' : isActive ? 'Enter your scores to participate' : 'Subscribe to enter'}
              </p>
            </div>
            <Calendar size={18} className="text-white/20" />
          </div>

          <DrawCountdownServer />

          {currentDraw && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Total pool', value: formatPounds(currentDraw.prize_pool_total), color: 'text-brand-400' },
                { label: 'Jackpot', value: formatPounds(currentDraw.jackpot_pool + currentDraw.jackpot_rollover), color: 'text-gold-400' },
                { label: 'Entries', value: currentDraw.total_entries, color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-white/3 text-center">
                  <p className={`font-display text-lg font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-white/35 text-xs mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          )}

          {!hasScoresThisMonth && isActive && (
            <Link
              href="/dashboard/scores"
              className="mt-4 flex items-center justify-between p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/8 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Target size={18} className="text-brand-400" />
                <span className="text-white/80 text-sm">Enter your 5 golf scores for this month</span>
              </div>
              <ArrowRight size={16} className="text-brand-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          {hasScoresThisMonth && myEntry && (
            <div className="mt-4 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Your draw numbers</p>
              <div className="flex gap-2 flex-wrap">
                {myEntry.numbers?.map((n: number) => (
                  <div key={n} className="draw-ball">{n}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Charity card */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Your charity</h2>
            <Link href="/dashboard/charity" className="text-brand-400 hover:text-brand-300 text-xs">
              Change →
            </Link>
          </div>

          {(subscription as any)?.charity ? (
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
                <Heart size={22} className="text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{(subscription as any).charity.name}</h3>
              <p className="text-white/40 text-xs mb-4">{(subscription as any).charity.category}</p>
              <div className="p-3 rounded-xl bg-white/3">
                <p className="text-white/40 text-xs mb-1">Platform total raised</p>
                <p className="text-white font-bold text-lg">
                  {formatPounds((subscription as any).charity.total_raised)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart size={32} className="text-white/10 mb-3" />
              <p className="text-white/40 text-sm">No charity selected</p>
              <Link href="/dashboard/charity" className="btn btn-outline text-xs mt-3 px-4 py-2">
                Choose a charity
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent draws */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">Recent draw activity</h2>
          <Link href="/dashboard/draws" className="text-brand-400 hover:text-brand-300 text-xs">
            View all →
          </Link>
        </div>
        <DrawHistoryPreview userId={user.id} />
      </div>
    </div>
  )
}

async function DrawHistoryPreview({ userId }: { userId: string }) {
  const supabase = createClient()
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*, draw:draws(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!entries?.length) {
    return (
      <div className="text-center py-8">
        <TrendingUp size={32} className="text-white/10 mx-auto mb-3" />
        <p className="text-white/30 text-sm">No draw history yet</p>
        <p className="text-white/20 text-xs mt-1">Enter scores to be included in monthly draws</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Draw</th>
            <th>Your numbers</th>
            <th>Match</th>
            <th>Prize</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="text-white/60">{formatDrawMonth((entry.draw as any)?.draw_month || '')}</td>
              <td>
                <div className="flex gap-1">
                  {entry.numbers?.map((n: number) => (
                    <span key={n} className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs flex items-center justify-center font-bold">
                      {n}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <span className="text-white/60 text-sm">{entry.match_count} / 5</span>
              </td>
              <td>
                {entry.prize_amount > 0
                  ? <span className="text-gold-400 font-medium">{formatPounds(entry.prize_amount)}</span>
                  : <span className="text-white/20">—</span>}
              </td>
              <td>
                {entry.prize_tier
                  ? <span className="badge badge-active">{entry.prize_tier}</span>
                  : <span className="text-white/25 text-xs">No win</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
