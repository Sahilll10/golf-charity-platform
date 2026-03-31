'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, Target, Heart, Trophy, Settings,
  LogOut, Menu, X, Crown, ChevronRight, TrendingUp
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile, Subscription } from '@/types'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', exact: true },
  { href: '/dashboard/scores', icon: Target, label: 'Enter Scores' },
  { href: '/dashboard/draws', icon: TrendingUp, label: 'My Draws' },
  { href: '/dashboard/charity', icon: Heart, label: 'My Charity' },
  { href: '/dashboard/winnings', icon: Trophy, label: 'Winnings' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  profile: Profile | null
  subscription: (Subscription & { charity?: any }) | null
}

export default function DashboardNav({ profile, subscription }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="font-display font-bold text-white">G</span>
          </div>
          <span className="font-display font-bold text-white text-lg">GolfDraw</span>
        </Link>
      </div>

      {/* Subscription badge */}
      <div className="px-4 pt-4">
        <div className={cn(
          'rounded-xl p-3 border flex items-center gap-3',
          subscription?.status === 'active'
            ? 'bg-brand-500/8 border-brand-500/20'
            : 'bg-white/3 border-white/8'
        )}>
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            subscription?.status === 'active' ? 'bg-brand-500/20' : 'bg-white/5'
          )}>
            <Crown size={15} className={subscription?.status === 'active' ? 'text-brand-400' : 'text-white/25'} />
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {subscription?.status === 'active'
                ? `${subscription.plan === 'yearly' ? 'Yearly' : 'Monthly'} member`
                : 'No active plan'}
            </p>
            <p className={cn(
              'text-xs',
              subscription?.status === 'active' ? 'text-brand-400' : 'text-white/30'
            )}>
              {subscription?.status === 'active' ? '✓ Draw eligible' : 'Subscribe to play'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-brand-500/12 text-brand-400 border border-brand-500/20'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/4'
              )}
            >
              <item.icon size={17} className={cn(
                'flex-shrink-0 transition-colors',
                active ? 'text-brand-400' : 'text-white/30 group-hover:text-white/50'
              )} />
              {item.label}
              {active && <ChevronRight size={13} className="ml-auto text-brand-400/50" />}
            </Link>
          )
        })}
      </nav>

      {/* Profile + logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 text-sm font-bold">
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name || 'Member'}</p>
            <p className="text-white/30 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-400/8 transition-all"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-surface-800 border-r border-white/5 z-40">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="font-display font-bold text-white text-xs">G</span>
          </div>
          <span className="font-display font-bold text-white">GolfDraw</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-white p-1">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-surface-800 border-r border-white/5 z-50 flex flex-col"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  )
}
