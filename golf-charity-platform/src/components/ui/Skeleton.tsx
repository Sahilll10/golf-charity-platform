import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  rows?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: SkeletonProps) {
  return (
    <div className="card p-0">
      <div className="p-4 border-b border-white/5">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <Skeleton className="w-9 h-9 rounded-lg mb-3" />
          <Skeleton className="h-7 w-2/3 mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
