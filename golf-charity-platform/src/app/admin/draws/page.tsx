'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Play, Plus, Loader2, CheckCircle, Dice5, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDrawMonth, formatPounds, getDrawMonth } from '@/lib/utils'
import { generateWinningNumbers, countMatches, getPrizeTier, calculatePrizes } from '@/lib/draw-engine'
import type { Draw } from '@/types'
import toast from 'react-hot-toast'

export default function AdminDrawsPage() {
  const supabase = createClient()
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [simNumbers, setSimNumbers] = useState<number[] | null>(null)
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null)

  useEffect(() => { loadDraws() }, [])

  async function loadDraws() {
    const { data } = await supabase
      .from('draws').select('*').order('draw_month', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  async function runDraw(draw: Draw) {
    if (!confirm(`Run the ${formatDrawMonth(draw.draw_month)} draw? This cannot be undone.`)) return
    setRunning(draw.id)

    // Generate winning numbers
    const winningNums = generateWinningNumbers()

    // Get all entries for this draw
    const { data: entries } = await supabase
      .from('draw_entries')
      .select('*')
      .eq('draw_id', draw.id)

    if (!entries?.length) {
      toast.error('No entries found for this draw')
      setRunning(null)
      return
    }

    // Count winners per tier
    let fiveMatch = 0, fourMatch = 0, threeMatch = 0
    for (const entry of entries) {
      const mc = countMatches(entry.numbers, winningNums)
      const tier = getPrizeTier(mc)
      if (tier === '5-match') fiveMatch++
      else if (tier === '4-match') fourMatch++
      else if (tier === '3-match') threeMatch++
    }

    const prizes = calculatePrizes({
      prizePoolTotal: draw.prize_pool_total,
      jackpotRollover: draw.jackpot_rollover,
      fiveMatchWinners: fiveMatch,
      fourMatchWinners: fourMatch,
      threeMatchWinners: threeMatch,
    })

    // Update each entry
    for (const entry of entries) {
      const mc = countMatches(entry.numbers, winningNums)
      const tier = getPrizeTier(mc)
      const prizeAmt = tier === '5-match' ? prizes.jackpotPerWinner
        : tier === '4-match' ? prizes.fourMatchPerWinner
        : tier === '3-match' ? prizes.threeMatchPerWinner : 0

      await supabase.from('draw_entries').update({
        match_count: mc,
        prize_tier: tier,
        prize_amount: prizeAmt,
        is_winner: !!tier,
      }).eq('id', entry.id)

      // Create verification requests for winners
      if (tier) {
        await supabase.from('winner_verifications').upsert({
          user_id: entry.user_id,
          draw_id: draw.id,
          draw_entry_id: entry.id,
          prize_amount: prizeAmt,
          status: 'pending',
          payment_status: 'pending',
        }, { onConflict: 'user_id,draw_id' })
      }
    }

    // Update draw with results
    await supabase.from('draws').update({
      winning_numbers: winningNums,
      status: 'completed',
      jackpot_rollover: prizes.newRollover,
    }).eq('id', draw.id)

    toast.success(`Draw complete! ${fiveMatch} jackpot, ${fourMatch} 4-match, ${threeMatch} 3-match winners.`)
    setRunning(null)
    loadDraws()
  }

  async function createNextDraw() {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const drawMonth = nextMonth.toISOString().slice(0, 7)
    const drawDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()

    const { error } = await supabase.from('draws').insert({
      draw_month: drawMonth,
      status: 'upcoming',
      draw_date: drawDate,
      prize_pool_total: 0,
      jackpot_pool: 0,
      four_match_pool: 0,
      three_match_pool: 0,
      jackpot_rollover: 0,
      total_entries: 0,
    })

    if (error) {
      if (error.code === '23505') toast.error('Draw for this month already exists')
      else toast.error('Failed to create draw')
    } else {
      toast.success(`Draw created for ${formatDrawMonth(drawMonth)}`)
      loadDraws()
    }
    setShowCreate(false)
  }

  function simulateDraw() {
    setSimNumbers(generateWinningNumbers())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Draws</h1>
          <p className="text-white/40 mt-1">Configure and run monthly draws.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(true)} className="btn btn-outline">
            <Plus size={15} /> Create draw
          </button>
        </div>
      </div>

      {/* Draw simulator */}
      <div className="card border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center gap-3 mb-4">
          <Dice5 size={18} className="text-purple-400" />
          <h2 className="font-display text-base font-bold text-white">Draw number simulator</h2>
          <span className="badge badge-pending">Test tool</span>
        </div>
        <p className="text-white/40 text-sm mb-4">Generate sample winning numbers to test the draw system without affecting live data.</p>
        <div className="flex items-center gap-4 flex-wrap">
          <button onClick={simulateDraw} className="btn btn-ghost gap-2">
            <RefreshCw size={14} /> Generate numbers
          </button>
          {simNumbers && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
              {simNumbers.map(n => (
                <div key={n} className="draw-ball winning">{n}</div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Draws list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="text-brand-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {draws.map((draw) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display text-lg font-bold text-white">{formatDrawMonth(draw.draw_month)}</h3>
                    <span className={`badge ${
                      draw.status === 'completed' ? 'badge-approved' :
                      draw.status === 'open' ? 'badge-active' :
                      draw.status === 'processing' ? 'badge-pending' : 'badge-inactive'
                    }`}>{draw.status}</span>
                    {draw.jackpot_rollover > 0 && (
                      <span className="badge badge-pending">+{formatPounds(draw.jackpot_rollover)} rollover</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {[
                      { label: 'Prize pool', value: formatPounds(draw.prize_pool_total), color: 'text-gold-400' },
                      { label: 'Jackpot', value: formatPounds(draw.jackpot_pool + draw.jackpot_rollover), color: 'text-brand-400' },
                      { label: 'Entries', value: draw.total_entries, color: 'text-purple-400' },
                      { label: '4-match pool', value: formatPounds(draw.four_match_pool), color: 'text-white/50' },
                    ].map(item => (
                      <div key={item.label} className="p-2 rounded-lg bg-white/3">
                        <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
                        <p className="text-white/25 text-xs">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {draw.winning_numbers && (
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Winning numbers</p>
                      <div className="flex gap-2">
                        {draw.winning_numbers.map(n => (
                          <div key={n} className="draw-ball winning">{n}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {draw.status === 'open' && (
                    <button
                      onClick={() => runDraw(draw)}
                      disabled={!!running}
                      className="btn btn-primary gap-2"
                    >
                      {running === draw.id ? (
                        <><Loader2 size={15} className="animate-spin" /> Running...</>
                      ) : (
                        <><Play size={15} /> Run draw</>
                      )}
                    </button>
                  )}
                  {draw.status === 'completed' && (
                    <div className="flex items-center gap-1.5 text-brand-400 text-sm">
                      <CheckCircle size={15} />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {!draws.length && (
            <div className="card text-center py-12">
              <Trophy size={40} className="text-white/10 mx-auto mb-4" />
              <p className="text-white/30">No draws yet. Create the first one.</p>
            </div>
          )}
        </div>
      )}

      {/* Create draw modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card max-w-sm w-full"
            >
              <h2 className="font-display text-xl font-bold text-white mb-2">Create next draw</h2>
              <p className="text-white/40 text-sm mb-6">This will create a draw for next month, ready to accept entries.</p>
              <div className="flex gap-3">
                <button onClick={createNextDraw} className="btn btn-primary flex-1">
                  <Plus size={15} /> Create draw
                </button>
                <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
