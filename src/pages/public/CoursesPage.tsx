import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, BookOpen, Search, X } from 'lucide-react'
import { coursesService } from '@/services/courses.service'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/classNames'
import {
  CourseFilterBar,
  ACCESS_OPTIONS,
  LEVEL_OPTIONS,
  SORT_OPTIONS,
  SUBJECT_OPTIONS,
  type SortValue,
} from '@/features/courses/components/CourseFilterBar'
import { ActiveFilters, type ActiveFilterChip } from '@/features/courses/components/ActiveFilters'
import { CoursePagination } from '@/features/courses/components/CoursePagination'

const PAGE_SIZE = 12
const DEFAULT_SORT: SortValue = 'newest'

const CATALOGUE_DESCRIPTION =
  'Explore NumeryCode Mathematics and Programming courses. Learn practical skills through structured lessons, guided learning and Registered Trainers.'

export default function CoursesPage() {
  usePageTitle('Explore Courses', {
    description: CATALOGUE_DESCRIPTION,
    canonical: '/courses',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── URL-derived catalogue state (shareable and reload-safe) ───────────────
  // Only discovery state lives in the URL; internal UI state (e.g. the open
  // filter drawer) does not. Default values are omitted for clean URLs.
  const urlQ = searchParams.get('q') ?? ''
  const subject = searchParams.get('subject') ?? ''
  const level = searchParams.get('level') ?? ''
  const accessLevel = searchParams.get('accessLevel') ?? ''
  const instructorId = searchParams.get('instructorId') ?? ''
  const sortParam = searchParams.get('sort')
  const sort: SortValue = sortParam === 'title' || sortParam === 'level' ? sortParam : DEFAULT_SORT
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            const isDefault =
              value === null ||
              value === '' ||
              (key === 'page' && value === '1') ||
              (key === 'sort' && value === DEFAULT_SORT)
            if (isDefault) next.delete(key)
            else next.set(key, value)
          }
          return next
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  // ── Search: debounced typing → URL (resets pagination) ────────────────────
  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedSearch = useDebounce(searchInput)
  const lastPushedQ = useRef(urlQ)

  useEffect(() => {
    if (debouncedSearch !== lastPushedQ.current) {
      lastPushedQ.current = debouncedSearch
      // Skip redundant pushes when the URL already reflects this value
      // (e.g. after back/forward navigation or chip removal).
      if (debouncedSearch !== urlQ) updateParams({ q: debouncedSearch || null, page: null })
    }
  }, [debouncedSearch, urlQ, updateParams])

  // Keep the input in sync when the URL changes externally (chips, back/forward).
  useEffect(() => {
    setSearchInput(prev => (prev === urlQ ? prev : urlQ))
  }, [urlQ])

  // ── Registered Trainers (public directory; failure must not break browsing) ─
  const trainersQuery = useQuery({
    queryKey: ['public-trainers'],
    queryFn: () => coursesService.getAvailableTeachers(),
    staleTime: 5 * 60_000,
    retry: 1,
  })
  const trainers = trainersQuery.data
  const trainersUnavailable = trainersQuery.isError

  // ── Paginated catalogue query (Phase 1 API, slim payload) ──────────────────
  const offset = (page - 1) * PAGE_SIZE
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['courses', { q: urlQ, subject, level, accessLevel, instructorId, sort, page }],
    queryFn: () =>
      coursesService.getAllPaginated({
        q: urlQ || undefined,
        subject: subject || undefined,
        level: level || undefined,
        accessLevel: accessLevel === 'free' || accessLevel === 'premium' ? accessLevel : undefined,
        instructorId: instructorId || undefined,
        sort,
        limit: PAGE_SIZE,
        offset,
      }),
    // Keep the previous page's results visible while the next page loads.
    placeholderData: keepPreviousData,
  })

  const courses = data?.data ?? []
  const total = data?.pagination.total ?? 0
  const hasMore = data?.pagination.hasMore ?? false
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    setSearchInput('')
    updateParams({ q: null, subject: null, level: null, accessLevel: null, instructorId: null, sort: null, page: null })
  }, [updateParams])

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage === page || nextPage < 1 || nextPage > totalPages) return
      updateParams({ page: nextPage === 1 ? null : String(nextPage) })
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [page, totalPages, updateParams],
  )

  // ── Active filter chips (only filters that are actually set) ────────────────
  const chips: ActiveFilterChip[] = []
  if (urlQ) {
    chips.push({ key: 'q', label: `“${urlQ}”`, onRemove: () => updateParams({ q: null }) })
  }
  const subjectLabel = SUBJECT_OPTIONS.find(o => o.value === subject)?.label
  if (subjectLabel) {
    chips.push({ key: 'subject', label: subjectLabel, onRemove: () => updateParams({ subject: null }) })
  }
  const levelLabel = LEVEL_OPTIONS.find(o => o.value === level)?.label
  if (levelLabel) {
    chips.push({ key: 'level', label: levelLabel, onRemove: () => updateParams({ level: null }) })
  }
  const accessLabel = ACCESS_OPTIONS.find(o => o.value === accessLevel)?.label
  if (accessLabel) {
    chips.push({ key: 'accessLevel', label: accessLabel, onRemove: () => updateParams({ accessLevel: null }) })
  }
  if (instructorId) {
    const trainerName = trainers?.find(t => t.id === instructorId)?.name
    chips.push({
      key: 'instructorId',
      label: trainerName ?? 'Registered Trainer',
      onRemove: () => updateParams({ instructorId: null }),
    })
  }
  if (sort !== DEFAULT_SORT) {
    const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? sort
    chips.push({ key: 'sort', label: `Sort: ${sortLabel}`, onRemove: () => updateParams({ sort: null }) })
  }

  return (
    <div>
      {/* Page hero */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-12">
        <SectionWrapper className="py-0">
          <h1 className="text-4xl font-bold mb-2">Explore Courses</h1>
          <p className="text-blue-200 max-w-2xl">
            Learn practical skills through structured courses, guided learning and Registered Trainers.
          </p>
        </SectionWrapper>
      </div>

      {/* Sticky search bar (filters live below so mobile is not overwhelmed) */}
      <div
        className="sticky top-16 z-10 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 shadow-sm"
        role="search"
        aria-label="Search and filter courses"
      >
        <SectionWrapper className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses by name or topic"
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-brand-blue dark:text-white placeholder:text-gray-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus-visible:shadow-focus focus:outline-none"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {/* Result count from the backend pagination total */}
            <p
              className="text-sm text-gray-500 dark:text-gray-400 sm:ml-auto shrink-0"
              aria-live="polite"
              aria-atomic="true"
            >
              {!isLoading && !isError && `${total} course${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </SectionWrapper>
      </div>

      {/* Filter / sort controls + active filter chips */}
      <SectionWrapper className="pb-0">
        <CourseFilterBar
          subject={subject}
          onSubjectChange={v => updateParams({ subject: v || null, page: null })}
          level={level}
          onLevelChange={v => updateParams({ level: v || null, page: null })}
          accessLevel={accessLevel}
          onAccessChange={v => updateParams({ accessLevel: v || null, page: null })}
          instructorId={instructorId}
          onInstructorChange={v => updateParams({ instructorId: v || null, page: null })}
          sort={sort}
          onSortChange={v => updateParams({ sort: v, page: null })}
          trainers={trainers}
          trainersUnavailable={trainersUnavailable}
          activeFilterCount={chips.length}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen(open => !open)}
        />
        {chips.length > 0 && (
          <div className="mt-3">
            <ActiveFilters chips={chips} onClearAll={handleClearFilters} />
          </div>
        )}
      </SectionWrapper>

      {/* Course results */}
      <SectionWrapper className={cn('pt-8', isFetching && !isLoading && 'opacity-70 transition-opacity')}>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading courses…" aria-busy="true">
            {[...Array(PAGE_SIZE)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div role="alert" className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500 mb-4" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Unable to load courses</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
              Please check your connection and try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No courses found"
            description="Try adjusting your search or filters."
            action={{ label: 'Clear filters', onClick: handleClearFilters }}
          />
        ) : (
          <>
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              aria-label={`${total} course${total !== 1 ? 's' : ''} found`}
              aria-busy={isFetching}
            >
              {courses.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
            <CoursePagination
              page={page}
              totalPages={totalPages}
              hasMore={hasMore}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </SectionWrapper>
    </div>
  )
}