import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen } from 'lucide-react'
import { coursesService } from '@/services/courses.service'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebounce } from '@/hooks/useDebounce'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { cn } from '@/utils/classNames'

const subjectFilters = [
  { value: '',              label: 'All'          },
  { value: 'mathematics',  label: 'Mathematics'  },
  { value: 'programming',  label: 'Programming'  },
]
const accessFilters = [
  { value: '', label: 'All Access' }, { value: 'free', label: 'Free' }, { value: 'premium', label: 'Premium' },
] as const

export default function CoursesPage() {
  usePageTitle('Browse Courses')
  const [search,  setSearch]  = useState('')
  const [subject, setSubject] = useState('')
  const [accessLevel, setAccessLevel] = useState<'free' | 'premium' | ''>('')
  const debouncedSearch = useDebounce(search)
  const handleClearFilters = () => { setSearch(''); setSubject(''); setAccessLevel('') }

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', { subject, q: debouncedSearch, accessLevel }],
    queryFn:  () => coursesService.getAll({
      subject: subject || undefined,
      q: debouncedSearch || undefined,
      accessLevel: accessLevel || undefined,
    }),
  })

  const resultCount = courses?.length ?? 0

  return (
    <div>
      {/* Page hero */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-12">
        <SectionWrapper className="py-0">
          <h1 className="text-4xl font-bold mb-2">All Courses</h1>
          <p className="text-blue-200">Explore our complete catalogue of Mathematics and Programming courses.</p>
        </SectionWrapper>
      </div>

      {/* Sticky filter bar */}
      <div
        className="sticky top-16 z-10 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 shadow-sm"
        role="search"
        aria-label="Filter courses"
      >
        <SectionWrapper className="py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses…"
                aria-label="Search courses by name or topic"
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-brand-blue dark:text-white placeholder:text-gray-400"
              />
            </div>

            {/* Subject filter pills */}
            <div role="group" aria-label="Filter by subject" className="flex gap-2">
              {subjectFilters.map(f => (
                <button
                  key={f.value}
                  onClick={() => setSubject(f.value)}
                  aria-pressed={subject === f.value}
                  aria-label={`Show ${f.label} courses`}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    subject === f.value
                      ? 'bg-brand-blue text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Filter by access" className="flex gap-2">
              {accessFilters.map(filter => <button key={filter.value} onClick={() => setAccessLevel(filter.value)} aria-pressed={accessLevel === filter.value} className={cn('px-3 py-2 rounded-full text-sm font-medium transition-all', accessLevel === filter.value ? 'bg-brand-navy text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700')}>{filter.label}</button>)}
            </div>

            {/* Live result count */}
            {!isLoading && (
              <span
                className="text-sm text-gray-500 dark:text-gray-400 ml-auto shrink-0"
                aria-live="polite"
                aria-atomic="true"
              >
                Showing {resultCount} course{resultCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </SectionWrapper>
      </div>

      {/* Course grid */}
      <SectionWrapper>
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading courses…">
            {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : !courses?.length ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No courses found"
            description="Try adjusting your search or filter."
            action={{ label: 'Clear filters', onClick: handleClearFilters }}
          />
        ) : (
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label={`${resultCount} course${resultCount !== 1 ? 's' : ''} found`}
          >
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </SectionWrapper>
    </div>
  )
}
