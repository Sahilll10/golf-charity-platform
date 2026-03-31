'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle, AlertCircle, Loader2, RotateCcw, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { scoresToDrawNumbers } from '@/lib/draw-engine'
import { getDrawMonth, formatDrawMonth } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ScoresPage() {
  const supabase = createClient()
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [scores, setScores] = useState<string[]>(['', '', '', '', ''])
  const [existing, setExisting] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [drawNumbers, setDrawNumbers] = useState<number[] | null>(null)
  const [isActive, setIsActive] = useState(false)

  const drawMonth = getDrawMonth()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: sub }, { data: score }] = await Promise.all([
        supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
        supabase.from('scores').select('*').eq('user_id', user.id).eq('draw_month', drawMonth).maybeSingle(),
      ])

      setIsActive(sub?.status === 'active')
      if (score) {
        setExisting(score)
        setScores([
          String(score.score_1 || ''),
          String(score.score_2 || ''),
          String(score.score_3 || ''),
          String(score.score_4 || ''),
          String(score.score_5 || ''),
        ])
        if (score.draw_numbers) setDrawNumbers(score.draw_numbers)
        setSubmitted(true)
      }
      setLoading(false)
    }
    load()
  }, [])

  const allFilled = scores.every(s => s !== '' && Number(s) >= 50 && Number(s) <= 150)

  function handleScoreChange(idx: number, val: string) {
    const cleaned = val.replace(/\D/g, '').slice(0, 3)
    const next = [...scores]
    next[idx] = cleaned
    setScores(next)

    // Auto-advance
    if (cleaned.length === 2 && Number(cleaned) >= 50) {
      inputRefs.current[idx + 1]?.focus()
    }
    if (cleaned.length === 3) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  async function handleSubmit() {
    if (!allFilled) { toast.error('All 5 scores must be between 50 and 150'); return }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const numericScores = scores.map(Number)
    let nums: number[]
    try {
      nums = scoresToDrawNumbers(numericScores)
    } catch {
      toast.error('Invalid scores. Please check and try again.')
      setSaving(false)
      return
    }

    const payload = {
      user_id: user.id,
      score_1: numericScores[0],
      score_2: numericScores[1],
      score_3: numericScores[2],
      score_4: numericScores[3],
      score_5: numericScores[4],
      draw_numbers: nums,
      draw_month: drawMonth,
      updated_at: new Date().toISOString(),
    }

    const { error } = existing
      ? await supabase.from('scores').update(payload).eq('id', existing.id)
      : await supabase.from('scores').insert(payload)

    if (error) {
      toast.error('Failed to save scores. Try again.')
      setSaving(false)
      return
    }

    // Update or create draw entry
    const { data: draw } = await supabase
      .from('draws').select('id').eq('draw_month', drawMonth).maybeSingle()

    if (draw) {
      await supabase.from('draw_entries').upsert({
        user_id: user.id,
        draw_id: draw.id,
        numbers: nums,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,draw_id' })
    }

    setDrawNumbers(nums)
    setSubmitted(true)
    setSaving(false)
    toast.success('Scores saved! You\'re in the draw.')
    router.refresh()
  }

  function handleEdit() {
    setSubmitted(false)
    setDrawNumbers(null)
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Enter Scores</h1>
        <p className="text-white/40 mt-1">
          {formatDrawMonth(drawMonth)} draw — submit your 5 golf scores to generate your draw numbers.
        </p>
      </div>

      {!isActive && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-gold-500/25 bg-gold-500/8">
          <AlertCircle size={18} className="text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/70 text-sm">You need an active subscription to enter scores and participate in draws.</p>
        </div>
      )}

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-white/6 bg-white/2">
        <Info size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-white/50 leading-relaxed">
          Enter your 5 most recent golf round scores (50–150). Our algorithm converts them into your unique draw numbers. You can update them anytime before the draw closes.
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card"
          >
            <h2 className="font-display text-lg font-bold text-white mb-6">Your 5 golf scores</h2>

            <div className="grid grid-cols-5 gap-3 mb-6">
              {scores.map((score, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <label className="text-white/30 text-xs uppercase tracking-widest">#{i + 1}</label>
                  <input
                    ref={el => { inputRefs.current[i] = el }}
                    type="number"
                    inputMode="numeric"
                    min={50}
                    max={150}
                    className={`score-input ${
                      score && (Number(score) < 50 || Number(score) > 150)
                        ? '!border-red-500/50 !bg-red-500/5'
                        : score && Number(score) >= 50
                        ? '!border-brand-500/40 !bg-brand-500/5'
                        : ''
                    } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="72"
                    value={score}
                    onChange={e => handleScoreChange(i, e.target.value)}
                    disabled={!isActive || saving}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && i < 4) inputRefs.current[i + 1]?.focus()
                      if (e.key === 'Enter' && i === 4 && allFilled) handleSubmit()
                    }}
                  />
                  {score && Number(score) >= 50 && Number(score) <= 150 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle size={14} className="text-brand-400" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Preview draw numbers */}
            {allFilled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5"
              >
                <p className="text-brand-400 text-xs uppercase tracking-widest mb-3">Your draw numbers preview</p>
                <div className="flex gap-2">
                  {scoresToDrawNumbers(scores.map(Number)).map((n) => (
                    <div key={n} className="draw-ball">{n}</div>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!allFilled || !isActive || saving}
              className="btn btn-primary w-full py-3.5 text-base disabled:opacity-40"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving scores...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Target size={16} />
                  {existing ? 'Update scores & draw numbers' : 'Submit scores & enter draw'}
                </span>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="card text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle size={30} className="text-brand-400" />
            </motion.div>

            <h2 className="font-display text-2xl font-bold text-white mb-2">You're in the draw!</h2>
            <p className="text-white/40 mb-6">
              Your scores are saved for the {formatDrawMonth(drawMonth)} draw.
            </p>

            <div className="mb-6">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Your draw numbers</p>
              <div className="flex justify-center gap-2">
                {drawNumbers?.map((n, i) => (
                  <motion.div
                    key={n}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                    className="draw-ball"
                  >
                    {n}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/3 mb-6 text-left">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Your scores</p>
              <div className="flex justify-center gap-4">
                {scores.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="font-display text-xl font-bold text-white">{s}</p>
                    <p className="text-white/25 text-xs">Round {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleEdit} className="btn btn-ghost text-sm gap-2">
              <RotateCcw size={14} />
              Edit my scores
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoring guide */}
      <div className="card">
        <h3 className="font-display text-base font-bold text-white mb-4">Score guide</h3>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { range: '50–70', label: 'Excellent round', color: 'text-brand-400' },
            { range: '71–90', label: 'Good round', color: 'text-gold-400' },
            { range: '91–120', label: 'Average round', color: 'text-white/50' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl bg-white/3">
              <p className={`font-display font-bold text-base ${item.color}`}>{item.range}</p>
              <p className="text-white/35 text-xs mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
