'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const appUrl = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/update-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        {!sent ? (
          <>
            <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-6">
              <Mail size={22} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-white/40 mb-8">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                  : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={30} className="text-brand-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-white/40 mb-6">
              We've sent a reset link to <span className="text-white/70">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Link href="/login" className="btn btn-outline">
              Back to sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
