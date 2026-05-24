import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function Skeleton({ className }: Props) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={cn('animate-pulse rounded-md bg-elevated', className)}
    />
  )
}

export function SkeletonLine({ className }: Props) {
  return <Skeleton className={cn('h-3 w-full', className)} />
}

export function SkeletonPostCard() {
  return (
    <div className="px-3 py-3 border-b border-edge" aria-hidden="true">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-4 w-14 rounded-full flex-shrink-0" />
      </div>
      <Skeleton className="h-3 w-1/2 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function SkeletonSettings() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="card p-6 space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-1/3" />
      </div>
      <div className="card p-6 space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
