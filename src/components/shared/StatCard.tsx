import { memo } from 'react'
import { cn } from '@/utils/classNames'
import type { ReactNode } from 'react'

function StatCard_Base({ icon, value, label, color = 'blue', className }: {
  icon: ReactNode; value: string | number; label: string; color?: string; className?: string
}) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-50 text-brand-blue dark:bg-blue-900/20 dark:text-blue-300',
    green:  'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    teal:   'bg-teal-50 text-teal dark:bg-teal-900/20 dark:text-teal-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  }
  return (
    <div className={cn('flex items-center gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 shadow-card', className)}>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl shrink-0', colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export const StatCard = memo(StatCard_Base)
