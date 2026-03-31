'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, CheckCircle, Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPounds } from '@/lib/utils'
import type { Charity } from '@/types'
import toast from 'react-hot-toast'

export default function CharityPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: cList }, { data: sub }] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true).order('total_raised', { ascending: false }),
        supabase.from('subscriptions').select('charity_id').eq('user_id', user.id).single(),
      ])
      setCharities(cList || [])
      setSelectedId(sub?.charity_id || null)
      setCurrentId(sub?.charity_id || null)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!selectedId || selectedId === currentId) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const { error } = await supabase
      .from('subscriptions')
      .update({ charity_id: selectedId })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to update charity.')
      setSaving(false)
      return
    }
    setCurrentId(selectedId)
    toast.success('Charity updated!')
    setSaving(false)
  }

  const CATEGORY_COLORS: Record<string, string> = {
    'Health': '#22c55e',
    'Humanitarian': '#ef4444',
    'Animals': '#f59e0b',
    'Elderly': '#a78bfa',
    'Mental Health': '#06b6d4',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Choose Your Charity</h1>
          <p className="text-white/40 mt-1">10% of your subscription goes to this charity every month.</p>
        </div>
        {selectedId !== currentId && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
            {saving ? 'Saving...' : 'Save choice'}
          </motion.button>
        )}
      </div>

      {currentId && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5">
          <CheckCircle size={18} className="text-brand-400 flex-shrink-0" />
          <p className="text-white/70 text-sm">
            <span className="text-brand-400 font-medium">
              {charities.find(c => c.id === currentId)?.name}
            </span>
            {' '}is receiving your monthly contribution.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {charities.map((charity, i) => {
          const color = CATEGORY_COLORS[charity.category || ''] || '#22c55e'
          const isSelected = selectedId === charity.id
          const isCurrent = currentId === charity.id

          return (
            <motion.button
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelectedId(charity.id)}
              className={`text-left p-5 rounded-xl border transition-all ${
                isSelected
                  ? 'border-brand-500/40 bg-brand-500/8'
                  : 'border-white/6 bg-white/2 hover:border-white/15 hover:bg-white/4'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                    <Heart size={18} style={{ color }} />
                  </div>
                  <div>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${color}15`, color }}>
                      {charity.category}
                    </span>
                    {isCurrent && (
                      <span className="ml-2 text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                        ✓ Current
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'border-brand-500' : 'border-white/15'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                </div>
              </div>

              <h3 className="text-white font-semibold mb-2">{charity.name}</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-2">{charity.description}</p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-white/3">
                  <p className="font-display font-bold text-white text-sm">{formatPounds(charity.total_raised)}</p>
                  <p className="text-white/30 text-xs">Total raised</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/3">
                  <p className="font-display font-bold text-white text-sm">{charity.donor_count.toLocaleString()}</p>
                  <p className="text-white/30 text-xs">Contributors</p>
                </div>
              </div>

              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-white/25 hover:text-white/50 transition-colors mt-3"
                >
                  <ExternalLink size={11} />
                  Visit website
                </a>
              )}
            </motion.button>
          )
        })}
      </div>

      {selectedId !== currentId && selectedId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-gold-500/25 bg-gold-500/5 flex items-center justify-between"
        >
          <div>
            <p className="text-white font-medium text-sm">
              Switch to {charities.find(c => c.id === selectedId)?.name}?
            </p>
            <p className="text-white/40 text-xs mt-0.5">Your next monthly contribution will go to this charity.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm px-5 py-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
          </button>
        </motion.div>
      )}
    </div>
  )
}
