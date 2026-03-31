import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDrawMonth, formatPounds } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

export default async function DrawsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*, draw:draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: allDraws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })
    .limit(12)

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">My Draws</h1>
        <p className="text-white/40 mt-1">Your complete draw participation history.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Draws entered', value: entries?.length || 0 },
          { label: 'Total matches', value: entries?.reduce((s, e) => s + e.match_count, 0) || 0 },
          { label: 'Prizes won', value: entries?.filter(e => e.prize_tier).length || 0 },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="font-display text-3xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-white/40 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Draw entries */}
      <div className="card p-0">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-display text-lg font-bold text-white">Draw history</h2>
        </div>
        {!entries?.length ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No draws entered yet</p>
            <p className="text-white/20 text-sm mt-1">Enter your scores to participate in monthly draws</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Draw</th>
                  <th>Your numbers</th>
                  <th>Winning numbers</th>
                  <th>Match</th>
                  <th>Tier</th>
                  <th>Prize</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const draw = entry.draw as any
                  const winningNums: number[] = draw?.winning_numbers || []
                  return (
                    <tr key={entry.id}>
                      <td>
                        <div>
                          <p className="text-white/80 text-sm font-medium">
                            {formatDrawMonth(draw?.draw_month || '')}
                          </p>
                          <p className="text-white/30 text-xs mt-0.5 capitalize">{draw?.status}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {entry.numbers?.map((n: number) => (
                            <span key={n} className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                              winningNums.includes(n)
                                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                                : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                            }`}>{n}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {winningNums.length > 0 ? (
                          <div className="flex gap-1">
                            {winningNums.map((n) => (
                              <span key={n} className="w-7 h-7 rounded-full bg-white/10 text-white/60 border border-white/10 text-xs flex items-center justify-center font-bold">{n}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-white/20 text-xs">Pending</span>
                        )}
                      </td>
                      <td>
                        <span className={`font-display font-bold ${entry.match_count >= 3 ? 'text-gold-400' : 'text-white/40'}`}>
                          {entry.match_count} / 5
                        </span>
                      </td>
                      <td>
                        {entry.prize_tier
                          ? <span className="badge badge-active">{entry.prize_tier}</span>
                          : <span className="text-white/20 text-xs">—</span>}
                      </td>
                      <td>
                        {entry.prize_amount > 0
                          ? <span className="text-gold-400 font-bold">{formatPounds(entry.prize_amount)}</span>
                          : <span className="text-white/20">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
