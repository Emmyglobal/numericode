import { cn } from '@/utils/classNames'
import { Button } from './Button'
import type { ReactNode } from 'react'
export function EmptyState({ icon, title, description, action, className }: {
  icon?: ReactNode; title: string; description?: string; action?: { label: string; onClick: () => void }; className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && <div className="mb-4 text-gray-300 dark:text-gray-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{description}</p>}
      {action && <Button variant="secondary" onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
