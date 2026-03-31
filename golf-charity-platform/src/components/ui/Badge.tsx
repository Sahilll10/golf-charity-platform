import { cn } from '@/lib/utils'

type BadgeVariant = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'paid' | 'cancelled'

const VARIANTS: Record<BadgeVariant, string> = {
  active:    'badge-active',
  inactive:  'badge-inactive',
  pending:   'badge-pending',
  approved:  'badge-approved',
  rejected:  'badge-rejected',
  paid:      'badge-paid',
  cancelled: 'badge-cancelled',
}

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export default function Badge({ variant, children, className, dot }: BadgeProps) {
  return (
    <span className={cn('badge', VARIANTS[variant], className)}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'active' || variant === 'approved' ? 'bg-brand-400' :
          variant === 'pending' ? 'bg-gold-400' :
          variant === 'rejected' || variant === 'cancelled' ? 'bg-red-400' : 'bg-white/30'
        )} />
      )}
      {children}
    </span>
  )
}
