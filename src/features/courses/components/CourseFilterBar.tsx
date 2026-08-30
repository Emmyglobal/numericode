import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/utils/classNames'
import type { AvailableTeacher } from '@/services/courses.service'

export type SortValue = 'newest' | 'title' | 'level'

export const SUBJECT_OPTIONS = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'programming', label: 'Programming' },
] as const

export const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const

export const ACCESS_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
] as const

export const SORT_OPTIONS: ReadonlyArray<{ value: SortValue; label: string }> = [
  { value: 'newest', label: 'Newest' },
  { value: 'title', label: 'A–Z' },
  { value: 'level', label: 'Level' },
]

const selectClass =
  'h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-blue focus:shadow-focus'

const selectLabelClass = 'text-sm font-medium text-gray-600 dark:text-gray-300 shrink-0'

const pillActiveClass = 'bg-brand-blue text-white'
const pillIdleClass = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'

interface CourseFilterBarProps {
  subject: string
  onSubjectChange: (value: string) => void
  level: string
  onLevelChange: (value: string) => void
  accessLevel: string
  onAccessChange: (value: string) => void
  instructorId: string
  onInstructorChange: (value: string) => void
  sort: SortValue
  onSortChange: (value: SortValue) => void
  /** Registered Trainers from the public /courses/teachers endpoint. */
  trainers?: AvailableTeacher[]
  /** True when the trainers endpoint failed — the rest of the page stays usable. */
  trainersUnavailable?: boolean
  activeFilterCount: number
  filtersOpen: boolean
  onToggleFilters: () => void
}

/**
 * Catalogue filter controls. On desktop (lg+) the controls form a horizontal
 * filter bar; on smaller screens they collapse behind a compact "Filters"
 * toggle so the mobile page is not dominated by filters.
 */
export function CourseFilterBar({
  subject, onSubjectChange,
  level, onLevelChange,
  accessLevel, onAccessChange,
  instructorId, onInstructorChange,
  sort, onSortChange,
  trainers, trainersUnavailable,
  activeFilterCount, filtersOpen, onToggleFilters,
}: CourseFilterBarProps) {
  const trainerOptions = trainers ?? []
  const trainerSelectionMissing = Boolean(instructorId) && !trainerOptions.some(t => t.id === instructorId)

  return (
    <div className="flex flex-col gap-3">
      {/* Compact mobile toggle — the panel below expands/collapses */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={onToggleFilters}
          aria-expanded={filtersOpen}
          aria-controls="course-filters-panel"
          className={cn(
            'inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium border transition-all',
            'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200',
            'hover:bg-gray-50 dark:hover:bg-gray-800 focus-visible:shadow-focus focus:outline-none',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-brand-blue px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div
        id="course-filters-panel"
        className={cn(
          'flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:flex-wrap',
          filtersOpen ? 'flex' : 'hidden',
        )}
      >
        {/* Subject pills */}
        <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
          {[{ value: '', label: 'All' }, ...SUBJECT_OPTIONS].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSubjectChange(option.value)}
              aria-pressed={subject === option.value}
              aria-label={option.value ? `Show ${option.label} courses` : 'Show all courses'}
              className={cn(
                'px-4 h-10 rounded-full text-sm font-medium transition-all focus-visible:shadow-focus focus:outline-none',
                subject === option.value ? pillActiveClass : pillIdleClass,
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Level */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-level" className={selectLabelClass}>Level</label>
          <select
            id="filter-level"
            value={level}
            onChange={e => onLevelChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All levels</option>
            {LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Access */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-access" className={selectLabelClass}>Access</label>
          <select
            id="filter-access"
            value={accessLevel}
            onChange={e => onAccessChange(e.target.value)}
            className={selectClass}
          >
            <option value="">All access</option>
            {ACCESS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Registered Trainer (public /courses/teachers data only) */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-trainer" className={selectLabelClass}>Trainer</label>
          <select
            id="filter-trainer"
            value={instructorId}
            onChange={e => onInstructorChange(e.target.value)}
            disabled={trainersUnavailable && trainerOptions.length === 0}
            aria-label="Filter by Registered Trainer"
            className={cn(selectClass, 'max-w-48', trainersUnavailable && trainerOptions.length === 0 && 'opacity-60 cursor-not-allowed')}
          >
            <option value="">All trainers</option>
            {trainerOptions.map(trainer => (
              <option key={trainer.id} value={trainer.id}>{trainer.name}</option>
            ))}
            {/* Keep the URL-selected trainer selectable even if the directory fails */}
            {trainerSelectionMissing && <option value={instructorId}>Registered Trainer</option>}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 lg:ml-auto">
          <label htmlFor="course-sort" className={selectLabelClass}>Sort by</label>
          <select
            id="course-sort"
            value={sort}
            onChange={e => onSortChange(e.target.value as SortValue)}
            className={selectClass}
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
