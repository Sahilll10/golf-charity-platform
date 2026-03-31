import { createClient } from '@/lib/supabase/server'
import { formatPounds, formatDrawMonth } from '@/lib/utils'
import { Users, TrendingUp, Heart, Trophy, FileCheck, Crown } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: activeSubs },
    { data: draws },
    { count: pendingWinners },
    { data: charities },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('*').order('draw_month', { ascending: false }).limit(6),
    supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('charities').select('name, total_raised').order('total_raised', { ascending: false }).limit(5),
    supabase.from('profiles').select('*, subscriptions(status, plan)').order('created_at', { ascending: false }).limit(8),
  ])

  const currentDraw = draws?.[0]
  const totalRevenue = (activeSubs || 0) * 1999 // approx monthly
  const prizePool = currentDraw?.prize_pool_total || 0
  const totalCharityRaised = charities?.reduce((s, c) => s + c.total_raised, 0) || 0

  const STATS = [
    { label: 'Total members', value: totalUsers || 0, icon: Users, color: 'text-brand-400', bg: 'bg-brand-500/8', border: 'border-brand-500/20', href: '/admin/users' },
    { label: 'Active subscribers', value: activeSubs || 0, icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/20', href: '/admin/users' },
    { label: 'Current prize pool', value: formatPounds(prizePool), icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-500/8', border: 'border-gold-500/20', href: '/admin/draws' },
    { label: 'Total charity raised', value: formatPounds(totalCharityRaised), icon: Heart, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/20', href: '/admin/reports' },
    { label: 'Pending verifications', value: pendingWinners || 0, icon: FileCheck, color: 'text-gold-400', bg: pendingWinners ? 'bg-gold-500/10' : 'bg-white/3', border: pendingWinners ? 'border-gold-500/30' : 'border-white/6', href: '/admin/winners' },
    { label: 'Est. monthly revenue', value: formatPounds(totalRevenue / 100), icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/8', border: 'border-brand-500/20', href: '/admin/reports' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/40 mt-1">Platform overview and quick actions.</p>
        </div>
        <span className="badge badge-approved px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          System online
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <Link key={s.label} href={s.href}
            className={`rounded-xl p-5 border ${s.bg} ${s.border} hover:opacity-80 transition-opacity group`}>
            <div className="flex items-start justify-between mb-3">
              <s.icon size={20} className={s.color} />
              <span className="text-white/15 text-xs group-hover:text-white/30 transition-colors">→</span>
            </div>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Pending winners alert */}
      {(pendingWinners || 0) > 0 && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gold-500/30 bg-gold-500/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
              <FileCheck size={18} className="text-gold-400" />
            </div>
            <div>
              <p className="text-white font-semibold">
                {pendingWinners} winner verification{(pendingWinners || 0) > 1 ? 's' : ''} pending
              </p>
              <p className="text-white/40 text-sm">Review and approve or reject submitted proofs</p>
            </div>
          </div>
          <Link href="/admin/winners" className="btn btn-primary text-sm px-5 py-2">
            Review now
          </Link>
        </div>
      )}

      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent draws */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Recent draws</h2>
            <Link href="/admin/draws" className="text-brand-400 text-xs hover:text-brand-300">Manage →</Link>
          </div>
          <div className="space-y-2">
            {draws?.slice(0, 5).map((draw) => (
              <div key={draw.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-white/80 text-sm font-medium">{formatDrawMonth(draw.draw_month)}</p>
                  <p className="text-white/30 text-xs">{draw.total_entries} entries</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 text-sm font-bold">{formatPounds(draw.prize_pool_total)}</p>
                  <span className={`badge text-xs ${
                    draw.status === 'completed' ? 'badge-approved' :
                    draw.status === 'open' ? 'badge-active' :
                    'badge-pending'
                  }`}>{draw.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charity leaderboard */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-white">Top charities</h2>
            <Link href="/admin/charities" className="text-brand-400 text-xs hover:text-brand-300">Manage →</Link>
          </div>
          <div className="space-y-3">
            {charities?.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white/5 text-white/30 text-xs flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-sm">{c.name}</span>
                    <span className="text-brand-400 text-sm font-medium">{formatPounds(c.total_raised)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${(c.total_raised / (charities[0]?.total_raised || 1)) * 100}%`
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-white">Recent signups</h2>
          <Link href="/admin/users" className="text-brand-400 text-xs hover:text-brand-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Member</th><th>Email</th><th>Plan</th><th>Status</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {recentUsers?.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-600/25 flex items-center justify-center text-brand-400 text-xs font-bold">
                        {u.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-white/80">{u.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="text-white/45">{u.email}</td>
                  <td>
                    {u.subscriptions?.[0]?.plan
                      ? <span className="text-white/60 capitalize">{u.subscriptions[0].plan}</span>
                      : <span className="text-white/20">—</span>}
                  </td>
                  <td>
                    <span className={`badge ${u.subscriptions?.[0]?.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                      {u.subscriptions?.[0]?.status || 'none'}
                    </span>
                  </td>
                  <td className="text-white/35 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
