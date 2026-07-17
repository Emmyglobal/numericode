import { cn } from '@/utils/classNames'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary:   'bg-brand-blue text-white hover:bg-blue-700 active:scale-[.98]',
  secondary: 'border border-brand-blue text-brand-blue hover:bg-brand-light dark:hover:bg-blue-900/20',
  ghost:     'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  danger:    'bg-red-700 text-white hover:bg-red-800',
}
const sizes = {
  sm: 'h-8 px-3 text-xs rounded',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
}

export function Button({
  variant = 'primary', size = 'md', loading, disabled,
  className, children, type = 'button', ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {loading && <span className="sr-only">Loading…</span>}
      {children}
    </button>
  )
}
