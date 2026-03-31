'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-6">
          <Shield size={22} className="text-brand-400" />
        </div>

        {!done ? (
          <>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Set new password</h1>
            <p className="text-white/40 mb-8">Choose a strong password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">New password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-12"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required minLength={8}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm password</label>
                <input
                  type="password"
                  className={`input ${confirm && confirm !== password ? '!border-red-500/50' : ''}`}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
                {confirm && confirm !== password && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              <button type="submit" disabled={loading || password !== confirm} className="btn btn-primary w-full py-3 disabled:opacity-50">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : 'Update password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand-500/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={30} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Password updated!</h1>
            <p className="text-white/40">Redirecting you to the dashboard...</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
