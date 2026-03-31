import { createClient } from '@/lib/supabase/server'
import { formatPounds, formatDrawMonth } from '@/lib/utils'
import { BarChart2, TrendingUp, Users, Heart } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = createClient()

  const [
    { data: draws },
    { data: charities },
    { data: subs },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('draws').select('*').order('draw_month', { ascending: false }).limit(12),
    supabase.from('charities').select('name, total_raised, donor_count, category').order('total_raised', { ascending: false }),
    supabase.from('subscriptions').select('plan, status, created_at'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  const activeSubs = subs?.filter(s => s.status === 'active') || []
  const monthlyCount = activeSubs.filter(s => s.plan === 'monthly').length
  const yearlyCount = activeSubs.filter(s => s.plan === 'yearly').length
  const estMonthlyRevenue = (monthlyCount * 1999 + yearlyCount * Math.round(19999 / 12)) / 100
  const totalCharityRaised = charities?.reduce((s, c) => s + c.total_raised, 0) || 0
  const totalPrizePaid = draws?.reduce((s, d) => s + d.prize_pool_total, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-white/40 mt-1">Platform revenue, draw history, and charity contributions.</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total members', value: totalUsers || 0, icon: Users, color: 'text-brand-400', suffix: '' },
          { label: 'Active subscribers', value: activeSubs.length, icon: TrendingUp, color: 'text-purple-400', suffix: '' },
          { label: 'Est. monthly revenue', value: formatPounds(estMonthlyRevenue), icon: BarChart2, color: 'text-gold-400', suffix: '' },
          { label: 'Total charity raised', value: formatPounds(totalCharityRaised), icon: Heart, color: 'text-red-400', suffix: '' },
        ].map(s => (
          <div key={s.label} className="card">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white mb-5">Subscription breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/60 text-sm">Monthly subscribers</span>
                <span className="text-white font-medium">{monthlyCount}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-brand-500" style={{ width: `${activeSubs.length ? (monthlyCount / activeSubs.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-white/60 text-sm">Yearly subscribers</span>
                <span className="text-white font-medium">{yearlyCount}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ background: '#a78bfa', width: `${activeSubs.length ? (yearlyCount / activeSubs.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-white/5">
              <div className="flex justify-between">
                <span className="text-white/40 text-sm">Conversion rate</span>
                <span className="text-brand-400 font-medium text-sm">
                  {totalUsers ? Math.round((activeSubs.length / totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charity donations breakdown */}
        <div className="card">
          <h2 className="font-display text-lg font-bold text-white mb-5">Charity donations</h2>
          <div className="space-y-3">
            {charities?.map(c => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-white/60 text-sm truncate mr-2">{c.name}</span>
                  <span className="text-brand-400 text-sm font-medium flex-shrink-0">{formatPounds(c.total_raised)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill"
                    style={{ width: `${totalCharityRaised ? (c.total_raised / totalCharityRaised) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Draw history table */}
      <div className="card p-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display text-lg font-bold text-white">Draw history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Status</th>
                <th>Entries</th>
                <th>Prize pool</th>
                <th>Jackpot</th>
                <th>4-match</th>
                <th>3-match</th>
                <th>Rollover</th>
              </tr>
            </thead>
            <tbody>
              {draws?.map(d => (
                <tr key={d.id}>
                  <td className="text-white/80 font-medium">{formatDrawMonth(d.draw_month)}</td>
                  <td>
                    <span className={`badge ${d.status === 'completed' ? 'badge-approved' : d.status === 'open' ? 'badge-active' : 'badge-inactive'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="text-white/60">{d.total_entries}</td>
                  <td className="text-gold-400 font-medium">{formatPounds(d.prize_pool_total)}</td>
                  <td className="text-brand-400">{formatPounds(d.jackpot_pool)}</td>
                  <td className="text-white/50">{formatPounds(d.four_match_pool)}</td>
                  <td className="text-white/50">{formatPounds(d.three_match_pool)}</td>
                  <td>
                    {d.jackpot_rollover > 0
                      ? <span className="text-gold-400">+{formatPounds(d.jackpot_rollover)}</span>
                      : <span className="text-white/20">—</span>}
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
