import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

/**
 * Accessible confirmation dialog (NumeryCode design system).
 * - role="dialog" + aria-modal + labelled by the title
 * - Escape closes (calls onCancel)
 * - Backdrop click closes (calls onCancel)
 * - The confirm button shows a loading state and is disabled while pending,
 *   so the destructive action can never be double-submitted.
 */
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  /** Optional server-side error rendered inside the dialog (e.g. the
      purchased-course policy message). */
  error?: string | null
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel, cancelLabel = 'Cancel',
  error, loading = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 shadow-card"
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-lg bg-red-700/10 p-2.5 text-red-700" aria-hidden="true">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-base font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{message}</p>
          </div>
        </div>

        {error && (
          <div className="mt-3">
            <Alert type="error" message={error} />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}