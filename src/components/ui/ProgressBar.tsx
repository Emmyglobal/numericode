import { memo } from 'react'
import { cn } from '@/utils/classNames'

function ProgressBar_Base({ value, label, className }: {
  value: number; label?: string; className?: string
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{label}</span><span>{pct}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress: ${pct}%`}
        className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            pct >= 100 ? 'bg-green-600' : 'bg-brand-blue'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export const ProgressBar = memo(ProgressBar_Base)
