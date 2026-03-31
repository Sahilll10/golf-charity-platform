'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Upload, CheckCircle, Clock, XCircle, Loader2, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPounds, formatDrawMonth } from '@/lib/utils'
import type { WinnerVerification } from '@/types'
import toast from 'react-hot-toast'

export default function WinningsPage() {
  const supabase = createClient()
  const [verifications, setVerifications] = useState<WinnerVerification[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: verifs }, { data: winEntries }] = await Promise.all([
        supabase.from('winner_verifications')
          .select('*, draw:draws(*)')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false }),
        supabase.from('draw_entries')
          .select('*, draw:draws(*)')
          .eq('user_id', user.id)
          .not('prize_tier', 'is', null)
          .order('created_at', { ascending: false }),
      ])

      setVerifications(verifs || [])
      setEntries(winEntries || [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleProofUpload(entryId: string, drawId: string, prizeAmount: number, file: File) {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }

    setUploading(entryId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(null); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${drawId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error('Upload failed. Please try again.')
      setUploading(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(path)

    const { error } = await supabase.from('winner_verifications').insert({
      user_id: user.id,
      draw_id: drawId,
      draw_entry_id: entryId,
      proof_url: publicUrl,
      prize_amount: prizeAmount,
      status: 'pending',
      payment_status: 'pending',
    })

    if (error) {
      toast.error('Failed to submit verification.')
    } else {
      toast.success('Proof submitted! We\'ll review within 48 hours.')
      const { data: verifs } = await supabase
        .from('winner_verifications')
        .select('*, draw:draws(*)')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
      setVerifications(verifs || [])
    }
    setUploading(null)
  }

  const totalWon = verifications
    .filter(v => v.status === 'approved')
    .reduce((sum, v) => sum + (v.prize_amount || 0), 0)

  const pendingPayout = verifications
    .filter(v => v.status === 'approved' && v.payment_status === 'pending')
    .reduce((sum, v) => sum + (v.prize_amount || 0), 0)

  const verifiedEntryIds = new Set(verifications.map(v => v.draw_entry_id))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Winnings</h1>
        <p className="text-white/40 mt-1">Track your prizes, verify wins, and monitor payouts.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total won', value: formatPounds(totalWon), icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-500/8', border: 'border-gold-500/20' },
          { label: 'Pending payout', value: formatPounds(pendingPayout), icon: Clock, color: 'text-gold-400', bg: 'bg-gold-500/5', border: 'border-gold-500/15' },
          { label: 'Prize draws won', value: entries.length, icon: DollarSign, color: 'text-brand-400', bg: 'bg-brand-500/8', border: 'border-brand-500/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-5 border ${s.bg} ${s.border}`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Winning entries that need verification */}
      {entries.filter(e => !verifiedEntryIds.has(e.id)).length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-4">
            Wins awaiting verification
          </h2>
          <div className="space-y-3">
            {entries.filter(e => !verifiedEntryIds.has(e.id)).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card border-gold-500/20 bg-gold-500/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} className="text-gold-400" />
                      <span className="text-gold-400 font-semibold">{entry.prize_tier} winner!</span>
                      <span className="badge badge-pending">{formatDrawMonth(entry.draw?.draw_month || '')}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {entry.numbers?.map((n: number) => (
                        <div key={n} className="draw-ball match">{n}</div>
                      ))}
                    </div>
                    <p className="text-white/60 text-sm">
                      Prize: <span className="text-gold-400 font-bold">{formatPounds(entry.prize_amount)}</span>
                      {' · '}Submit a screenshot of your scores to claim.
                    </p>
                  </div>
                  <label className="btn btn-primary text-sm cursor-pointer flex-shrink-0">
                    <Upload size={14} />
                    {uploading === entry.id ? (
                      <span className="flex items-center gap-1">
                        <Loader2 size={12} className="animate-spin" /> Uploading...
                      </span>
                    ) : 'Upload proof'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf"
                      disabled={uploading === entry.id}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleProofUpload(entry.id, entry.draw_id, entry.prize_amount, file)
                      }}
                    />
                  </label>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Verification history */}
      <div>
        <h2 className="font-display text-lg font-bold text-white mb-4">Verification history</h2>
        {verifications.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No verifications yet</p>
            <p className="text-white/20 text-sm mt-1">Win a draw to start claiming prizes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifications.map((v) => (
              <div key={v.id} className="card">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {v.status === 'approved' && <CheckCircle size={15} className="text-brand-400" />}
                      {v.status === 'pending' && <Clock size={15} className="text-gold-400" />}
                      {v.status === 'rejected' && <XCircle size={15} className="text-red-400" />}
                      <span className="text-white font-medium text-sm">
                        {formatDrawMonth((v.draw as any)?.draw_month || '')}
                      </span>
                      <span className={`badge badge-${v.status}`}>{v.status}</span>
                      {v.status === 'approved' && (
                        <span className={`badge badge-${v.payment_status}`}>{v.payment_status}</span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm">
                      Prize: <span className="text-white/70 font-medium">{formatPounds(v.prize_amount || 0)}</span>
                      {v.admin_notes && <> · <span className="text-white/40 italic">{v.admin_notes}</span></>}
                    </p>
                  </div>
                  {v.proof_url && (
                    <a href={v.proof_url} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost text-xs">View proof</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
