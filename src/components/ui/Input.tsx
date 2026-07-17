import { cn } from '@/utils/classNames'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, required, type, ...props }, ref) => {
    const inputId  = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId  = error ? `${inputId}-error`  : undefined
    const hintId   = hint  ? `${inputId}-hint`   : undefined
    const descBy   = [errorId, hintId].filter(Boolean).join(' ') || undefined

    const isPassword = type === 'password'
    const [visible, setVisible] = useState(false)
    const resolvedType = isPassword ? (visible ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(required)</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={resolvedType}
            aria-required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={descBy}
            className={cn(
              'h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm transition-all duration-150 focus:outline-none focus:border-brand-blue focus:shadow-focus dark:focus:border-brand-sky',
              isPassword && 'pr-11',
              error && 'border-red-500 bg-red-50 dark:bg-red-900/10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible(v => !v)}
              aria-label={visible ? 'Hide password' : 'Show password'}
              aria-pressed={visible}
              className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {visible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
