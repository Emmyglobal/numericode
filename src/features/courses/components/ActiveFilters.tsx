import { X } from 'lucide-react'

export interface ActiveFilterChip {
  key: string
  label: string
  onRemove: () => void
}

/**
 * Removable chips for the currently active catalogue filters.
 * Only active filters are shown; "Clear all" appears when more than one is set.
 */
export function ActiveFilters({ chips, onClearAll }: {
  chips: ActiveFilterChip[]
  onClearAll: () => void
}) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active filters:</span>
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 rounded-full bg-brand-light dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-brand-blue dark:text-blue-300"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="rounded-full p-0.5 hover:bg-blue-200/70 dark:hover:bg-blue-800/70 focus-visible:shadow-focus focus:outline-none"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-gray-700 dark:hover:text-gray-200 focus-visible:shadow-focus focus:outline-none rounded"
        >
          Clear all
        </button>
      )}
    </div>
  )
}