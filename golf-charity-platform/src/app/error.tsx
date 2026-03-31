'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-white/40 mb-8 text-sm">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn btn-primary px-6 py-2.5">Try again</button>
          <Link href="/" className="btn btn-outline px-6 py-2.5">Go home</Link>
        </div>
        {error.digest && (
          <p className="text-white/15 text-xs mt-6">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
