import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  color?: 'green' | 'gold' | 'purple' | 'red' | 'blue'
  className?: string
}

const COLOR_MAP = {
  green:  { icon: 'text-brand-400',  bg: 'bg-brand-500/8',  border: 'border-brand-500/20' },
  gold:   { icon: 'text-gold-400',   bg: 'bg-gold-500/8',   border: 'border-gold-500/20' },
  purple: { icon: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/20' },
  red:    { icon: 'text-red-400',    bg: 'bg-red-500/8',    border: 'border-red-500/20' },
  blue:   { icon: 'text-blue-400',   bg: 'bg-blue-500/8',   border: 'border-blue-500/20' },
}

export default function StatCard({ label, value, sub, icon: Icon, color = 'green', className }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div className={cn(`rounded-xl p-5 border ${c.bg} ${c.border}`, className)}>
      <div className={cn(`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`)}>
        <Icon size={18} className={c.icon} />
      </div>
      <p className={cn(`font-display text-2xl font-bold ${c.icon}`)}>{value}</p>
      <p className="text-white/70 text-sm font-medium mt-0.5">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}
