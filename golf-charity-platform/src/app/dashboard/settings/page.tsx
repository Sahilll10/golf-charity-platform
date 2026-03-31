'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, CreditCard, Bell, Shield, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PLANS, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])
      setProfile(p)
      setSubscription(s)
      setFullName(p?.full_name || '')
      setLoading(false)
    }
    load()
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
    if (error) toast.error('Failed to save')
    else toast.success('Profile updated!')
    setSaving(false)
  }

  async function manageSubscription() {
    const res = await fetch('/api/subscribe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={28} className="text-brand-400 animate-spin" /></div>
  }

const planInfo = subscription?.plan
  ? PLANS.find(p => p.interval === subscription.plan)
  : null
  const isActive = subscription?.status === 'active'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/40 mt-1">Manage your profile and subscription.</p>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <User size={18} className="text-brand-400" />
          <h2 className="font-display text-lg font-bold text-white">Profile</h2>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Full name</label>
            <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Email address</label>
            <input className="input opacity-50 cursor-not-allowed" value={profile?.email || ''} disabled />
            <p className="text-white/25 text-xs mt-1">Email cannot be changed here. Contact support.</p>
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><CheckCircle size={14} /> Save changes</>}
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={18} className="text-brand-400" />
          <h2 className="font-display text-lg font-bold text-white">Subscription</h2>
        </div>

        {isActive && planInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-brand-500/8 border border-brand-500/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-active">Active</span>
                  <span className="text-white font-medium">{planInfo.name} Plan</span>
                </div>
                <p className="text-white/40 text-sm">
                  {formatCurrency(planInfo.price)}/{planInfo.interval}
                  {subscription.renewal_date && (
                    <> · Renews {format(new Date(subscription.renewal_date), 'dd MMM yyyy')}</>
                  )}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <CreditCard size={18} className="text-brand-400" />
              </div>
            </div>
            <button onClick={manageSubscription} className="btn btn-outline w-full gap-2">
              <ExternalLink size={14} />
              Manage billing via Stripe
            </button>
            <p className="text-white/25 text-xs text-center">
              Cancel, update payment, or change plan — all via Stripe's secure portal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/3 border border-white/6">
              <p className="text-white/50 text-sm">
                Status: <span className="badge badge-inactive ml-1">{subscription?.status || 'No subscription'}</span>
              </p>
            </div>
            <a href="/api/subscribe?plan=monthly" className="btn btn-primary w-full">
              Subscribe now
            </a>
          </div>
        )}
      </div>

      {/* Security */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={18} className="text-brand-400" />
          <h2 className="font-display text-lg font-bold text-white">Security</h2>
        </div>
        <div className="space-y-3">
          <p className="text-white/40 text-sm">Password changes are handled via email reset for security.</p>
          <button
            onClick={async () => {
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (!user?.email) return
              await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/auth/update-password`
              })
              toast.success('Password reset email sent!')
            }}
            className="btn btn-outline"
          >
            Send password reset email
          </button>
        </div>
      </div>
    </div>
  )
}
