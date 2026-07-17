import { cn } from '@/utils/classNames'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-gray-200 dark:bg-gray-700', className)}
      role="status"
      aria-label="Loading…"
    />
  )
}

export function CourseCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-surface-dark"
      role="status"
      aria-label="Loading course…"
    >
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 space-y-3" aria-hidden="true">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  )
}
