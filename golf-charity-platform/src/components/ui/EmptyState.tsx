import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center mb-4">
        <Icon size={24} className="text-white/15" />
      </div>
      <p className="text-white/35 font-medium mb-1">{title}</p>
      {description && <p className="text-white/20 text-sm max-w-xs">{description}</p>}
      {action && (
        <Link href={action.href} className="btn btn-outline text-sm mt-5 px-5 py-2">
          {action.label}
        </Link>
      )}
    </div>
  )
}
