'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Users, Trophy, Heart, FileCheck,
  BarChart2, Settings, LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/draws', icon: Trophy, label: 'Draws' },
  { href: '/admin/charities', icon: Heart, label: 'Charities' },
  { href: '/admin/winners', icon: FileCheck, label: 'Winners' },
  { href: '/admin/reports', icon: BarChart2, label: 'Reports' },
]

export default function AdminNav({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  async function logout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  const Content = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-base block leading-none">GolfDraw</span>
            <span className="text-purple-400 text-xs">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active ? 'bg-purple-500/12 text-purple-400 border border-purple-500/20'
                  : 'text-white/45 hover:text-white/75 hover:bg-white/4'
              )}>
              <item.icon size={17} className={cn('flex-shrink-0', active ? 'text-purple-400' : 'text-white/30 group-hover:text-white/50')} />
              {item.label}
              {active && <ChevronRight size={13} className="ml-auto text-purple-400/50" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/8 border border-purple-500/20 mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
            <span className="text-purple-400 text-sm font-bold">{profile?.full_name?.[0]?.toUpperCase() || 'A'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{profile?.full_name}</p>
            <p className="text-purple-400 text-xs">Administrator</p>
          </div>
        </div>
        <Link href="/dashboard" onClick={() => setOpen(false)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/35 hover:text-brand-400 hover:bg-brand-400/8 transition-all mb-1">
          <LayoutDashboard size={15} /> Member view
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-400/8 transition-all">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-surface-800 border-r border-white/5 z-40">
        <Content />
      </aside>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-xl border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-purple-400" />
          <span className="font-display font-bold text-white text-sm">Admin</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white/60 p-1">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-surface-800 border-r border-white/5 z-50 flex flex-col">
              <Content />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="lg:hidden h-14" />
    </>
  )
}
