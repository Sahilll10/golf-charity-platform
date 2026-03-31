'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileCheck, CheckCircle, XCircle, ExternalLink, Loader2, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPounds, formatDrawMonth } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminWinnersPage() {
  const supabase = createClient()
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('winner_verifications')
      .select('*, profile:profiles(full_name, email), draw:draws(draw_month, winning_numbers), draw_entry:draw_entries(numbers, prize_tier)')
      .order('submitted_at', { ascending: false })
    setVerifications(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setProcessing(id)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('winner_verifications').update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id,
      admin_notes: adminNotes[id] || null,
    }).eq('id', id)

    if (error) toast.error('Failed to update')
    else {
      toast.success(`Verification ${status}`)
      load()
    }
    setProcessing(null)
  }

  async function markPaid(id: string) {
    setProcessing(id)
    const { error } = await supabase.from('winner_verifications')
      .update({ payment_status: 'paid' }).eq('id', id)
    if (error) toast.error('Failed to update')
    else { toast.success('Marked as paid'); load() }
    setProcessing(null)
  }

  const filtered = verifications.filter(v => filter === 'all' || v.status === filter)

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="text-brand-400 animate-spin" /></div>
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length
  const approvedUnpaid = verifications.filter(v => v.status === 'approved' && v.payment_status === 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Winner Verifications</h1>
        <p className="text-white/40 mt-1">Review proof uploads and approve payouts.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending review', value: pendingCount, color: 'text-gold-400', bg: 'bg-gold-500/8', border: 'border-gold-500/20' },
          { label: 'Approved', value: verifications.filter(v => v.status === 'approved').length, color: 'text-brand-400', bg: 'bg-brand-500/8', border: 'border-brand-500/20' },
          { label: 'Awaiting payment', value: approvedUnpaid.length, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg} ${s.border}`}>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/50 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Unpaid approved — needs action */}
      {approvedUnpaid.length > 0 && (
        <div className="card border-brand-500/20">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-brand-400" />
            <h2 className="font-display text-base font-bold text-white">Approved — awaiting payment</h2>
          </div>
          <div className="space-y-2">
            {approvedUnpaid.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
                <div>
                  <p className="text-white/80 text-sm font-medium">{v.profile?.full_name}</p>
                  <p className="text-white/40 text-xs">{formatDrawMonth(v.draw?.draw_month)} · {v.draw_entry?.prize_tier}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold-400 font-bold">{formatPounds(v.prize_amount)}</span>
                  <button onClick={() => markPaid(v.id)} disabled={processing === v.id}
                    className="btn btn-primary text-xs px-4 py-2">
                    {processing === v.id ? <Loader2 size={12} className="animate-spin" /> : 'Mark paid'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
              : 'text-white/30 hover:text-white/60'
            }`}>
            {f} {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 text-xs inline-flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Verifications list */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <FileCheck size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No {filter === 'all' ? '' : filter} verifications</p>
          </div>
        )}
        {filtered.map((v) => (
          <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                    {v.profile?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="text-white font-medium">{v.profile?.full_name}</span>
                    <span className="text-white/30 text-xs ml-2">{v.profile?.email}</span>
                  </div>
                  <span className={`badge badge-${v.status}`}>{v.status}</span>
                  <span className={`badge badge-${v.payment_status}`}>{v.payment_status}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-white/3">
                    <p className="text-white/80 text-sm font-medium">{formatDrawMonth(v.draw?.draw_month)}</p>
                    <p className="text-white/30 text-xs">Draw</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <p className="text-gold-400 font-bold text-sm">{formatPounds(v.prize_amount)}</p>
                    <p className="text-white/30 text-xs">Prize</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <p className="text-brand-400 text-sm font-medium">{v.draw_entry?.prize_tier}</p>
                    <p className="text-white/30 text-xs">Tier</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/3">
                    <p className="text-white/60 text-xs">
                      {new Date(v.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-white/30 text-xs">Submitted</p>
                  </div>
                </div>

                {v.draw_entry?.numbers && (
                  <div className="flex gap-1.5 mb-3">
                    <span className="text-white/30 text-xs self-center mr-1">Entry:</span>
                    {v.draw_entry.numbers.map((n: number) => (
                      <span key={n} className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                        v.draw?.winning_numbers?.includes(n)
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                          : 'bg-white/8 text-white/50'
                      }`}>{n}</span>
                    ))}
                    {v.draw?.winning_numbers && (
                      <>
                        <span className="text-white/20 text-xs self-center mx-1">vs</span>
                        {v.draw.winning_numbers.map((n: number) => (
                          <span key={n} className="w-7 h-7 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/25 text-xs flex items-center justify-center font-bold">{n}</span>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {v.status === 'pending' && (
                  <div>
                    <label className="text-white/30 text-xs block mb-1">Admin notes (optional)</label>
                    <input
                      className="input text-sm py-2"
                      placeholder="Add a note..."
                      value={adminNotes[v.id] || ''}
                      onChange={e => setAdminNotes(prev => ({ ...prev, [v.id]: e.target.value }))}
                    />
                  </div>
                )}

                {v.admin_notes && v.status !== 'pending' && (
                  <p className="text-white/40 text-xs italic">Note: {v.admin_notes}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                {v.proof_url && (
                  <a href={v.proof_url} target="_blank" rel="noopener noreferrer"
                    className="btn btn-ghost text-xs gap-1.5">
                    <ExternalLink size={13} /> View proof
                  </a>
                )}
                {v.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(v.id, 'approved')} disabled={processing === v.id}
                      className="btn btn-primary text-xs gap-1.5">
                      {processing === v.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                      Approve
                    </button>
                    <button onClick={() => updateStatus(v.id, 'rejected')} disabled={processing === v.id}
                      className="btn btn-danger text-xs gap-1.5">
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {v.status === 'approved' && v.payment_status === 'pending' && (
                  <button onClick={() => markPaid(v.id)} disabled={processing === v.id}
                    className="btn btn-primary text-xs">
                    {processing === v.id ? <Loader2 size={12} className="animate-spin" /> : 'Mark paid'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
