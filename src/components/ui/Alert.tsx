import { cn } from '@/utils/classNames'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertType = 'success' | 'info' | 'warning' | 'error'

const cfg: Record<AlertType, { icon: ReactNode; cls: string; role: string }> = {
  success: { icon: <CheckCircle  className="w-5 h-5" aria-hidden="true" />, cls: 'border-l-green-600 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',  role: 'status' },
  info:    { icon: <Info         className="w-5 h-5" aria-hidden="true" />, cls: 'border-l-brand-blue bg-brand-light text-brand-navy dark:bg-blue-900/20 dark:text-blue-300', role: 'status' },
  warning: { icon: <AlertTriangle className="w-5 h-5" aria-hidden="true"/>, cls: 'border-l-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', role: 'alert' },
  error:   { icon: <XCircle      className="w-5 h-5" aria-hidden="true" />, cls: 'border-l-red-600 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',             role: 'alert' },
}

export function Alert({
  type = 'info', title, message, onClose
}: {
  type?: AlertType; title?: string; message: string; onClose?: () => void
}) {
  const { icon, cls, role } = cfg[type]
  return (
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={cn('flex gap-3 border-l-4 rounded-r-lg p-4', cls)}
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-0.5">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
