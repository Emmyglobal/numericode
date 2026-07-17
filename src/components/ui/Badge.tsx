import { memo } from 'react'
import { cn } from '@/utils/classNames'
import type { ReactNode } from 'react'

type BadgeVariant = 'mathematics'|'programming'|'beginner'|'intermediate'|'advanced'|'pending'|'submitted'|'overdue'|'live'|'upcoming'|'past'|'default'

const styles: Record<BadgeVariant, string> = {
  mathematics:  'bg-teal-light text-teal dark:bg-teal-900/30 dark:text-teal-300',
  programming:  'bg-purple-light text-purple dark:bg-purple-900/30 dark:text-purple-300',
  beginner:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-brand-light text-brand-blue dark:bg-blue-900/30 dark:text-blue-300',
  advanced:     'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  pending:      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  submitted:    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  overdue:      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  live:         'bg-red-600 text-white animate-pulse',
  upcoming:     'bg-brand-light text-brand-blue dark:bg-blue-900/30 dark:text-blue-300',
  past:         'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  default:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function Badge_Base({ variant = 'default', className, children }: {
  variant?: BadgeVariant; className?: string; children: ReactNode
}) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', styles[variant], className)}>
      {children}
    </span>
  )
}

export const Badge = memo(Badge_Base)
