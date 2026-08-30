import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/classNames'

interface CoursePaginationProps {
  page: number
  totalPages: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

type PageItem = number | 'ellipsis-l' | 'ellipsis-r'

/** Windowed page list, e.g. [1, '…', 4, 5, 6, '…', 12]. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const items: PageItem[] = [1]
  if (page > 3) items.push('ellipsis-l')
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) items.push(p)
  if (page < totalPages - 2) items.push('ellipsis-r')
  items.push(totalPages)
  return items
}

const navButtonClass =
  'inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-all focus-visible:shadow-focus focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:cursor-not-allowed'

/**
 * Accessible pagination for the course catalogue. `page` is 1-based and kept
 * in the URL; `hasMore` comes from the Phase 1 pagination envelope.
 */
export function CoursePagination({ page, totalPages, hasMore, onPageChange }: CoursePaginationProps) {
  if (totalPages <= 1) return null

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages || !hasMore

  return (
    <nav aria-label="Course catalogue pagination" className="mt-10 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
        aria-disabled={prevDisabled}
        aria-label="Previous page"
        className={cn(navButtonClass, 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      {getPageItems(page, totalPages).map(item =>
        item === 'ellipsis-l' || item === 'ellipsis-r' ? (
          <span key={item} className="px-2 text-sm text-gray-400" aria-hidden="true">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
            className={cn(
              'h-9 min-w-[2.25rem] rounded-md px-2 text-sm font-medium transition-all focus-visible:shadow-focus focus:outline-none',
              item === page
                ? 'bg-brand-blue text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        aria-label="Next page"
        className={cn(navButtonClass, 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800')}
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  )
}