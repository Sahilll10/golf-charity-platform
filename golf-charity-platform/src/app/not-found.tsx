import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="font-display text-9xl font-bold text-white/5 mb-4 leading-none">404</div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-white/40 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn btn-primary px-6 py-2.5">Go home</Link>
          <Link href="/dashboard" className="btn btn-outline px-6 py-2.5">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
