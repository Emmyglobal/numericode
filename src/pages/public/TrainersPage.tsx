import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, GraduationCap, Search, UserRound, X } from 'lucide-react'
import { coursesService } from '@/services/courses.service'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { RegisteredTrainerCard } from '@/features/public/components/RegisteredTrainerCard'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/classNames'

const SITE_URL = 'https://numerycode.com'
const DIRECTORY_DESCRIPTION =
  'Discover Registered Trainers on NumeryCode, learn about the subjects they teach and explore their published courses.'

const SUBJECTS = ['mathematics', 'programming'] as const
type SubjectValue = (typeof SUBJECTS)[number]
const SUBJECT_LABELS: Record<string, string> = { mathematics: 'Mathematics', programming: 'Programming' }

function isSubject(value: string | null): value is SubjectValue {
  return value === 'mathematics' || value === 'programming'
}

/** Directory skeleton matching the RegisteredTrainerCard grid layout. */
function TrainerDirectorySkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" role="status" aria-busy="true" aria-label="Loading Registered Trainers">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  )
}

export default function TrainersPage() {
  const navigate = useNavigate()
  usePageTitle('Registered Trainers', {
    description: DIRECTORY_DESCRIPTION,
    canonical: '/trainers',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const urlQ = searchParams.get('q') ?? ''
  const subjectParam = searchParams.get('subject')
  const subject: SubjectValue | '' = isSubject(subjectParam) ? subjectParam : ''

  // ── Debounced search synced to the URL (state survives reload/share) ────────
  const [searchInput, setSearchInput] = useState(urlQ)
  const debouncedQ = useDebounce(searchInput, 300)
  const lastPushedQ = useRef(urlQ)

  useEffect(() => {
    if (debouncedQ !== lastPushedQ.current) {
      lastPushedQ.current = debouncedQ
      if (debouncedQ !== urlQ) {
        const next = new URLSearchParams(searchParams)
        if (debouncedQ) next.set('q', debouncedQ)
        else next.delete('q')
        setSearchParams(next, { replace: false })
      }
    }
  }, [debouncedQ, urlQ, searchParams, setSearchParams])

  // Keep the input in sync when the URL changes externally (back/forward).
  useEffect(() => {
    setSearchInput(prev => (prev === urlQ ? prev : urlQ))
  }, [urlQ])

  const updateSubject = useCallback(
    (value: string) => {
      setSearchParams(
        prev => {
          const next = new URLSearchParams(prev)
          if (value) next.set('subject', value)
          else next.delete('subject')
          return next
        },
        { replace: false },
      )
    },
    [setSearchParams],
  )

  const clearSearch = useCallback(() => {
    setSearchInput('')
    lastPushedQ.current = ''
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next, { replace: false })
  }, [searchParams, setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    lastPushedQ.current = ''
    setSearchParams({}, { replace: false })
  }, [setSearchParams])

  // ── Directory data — one request, shared cache, no per-card fetches ─────────
  const { data: trainers, isLoading, isError, refetch } = useQuery({
    queryKey: ['public-trainers'],
    queryFn: () => coursesService.getAvailableTeachers(),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  // Client-side filtering/search over the complete public trainer list returned
  // by GET /api/courses/teachers (active trainers with published courses only).
  const filtered = useMemo(() => {
    const list = trainers ?? []
    const q = debouncedQ.trim().toLowerCase()
    return list.filter(t => {
      if (subject && !(t.subjects ?? []).includes(subject)) return false
      if (q) {
        const haystack = `${t.name} ${t.bio ?? ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [trainers, debouncedQ, subject])

  const activeFilters = Boolean(debouncedQ.trim() || subject)
  const noMatches = activeFilters && filtered.length === 0

  // ── Truthful ItemList structured data (names + profile URLs only) ───────────
  useEffect(() => {
    if (!trainers || trainers.length === 0) return
    const itemList = trainers.slice(0, 100).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Person', name: t.name, url: `${SITE_URL}/trainers/${t.id}` },
    }))
    const data = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Registered Trainers | NumeryCode',
      url: `${SITE_URL}/trainers`,
      itemListElement: itemList,
    }
    const script = document.createElement('script')
    script.id = 'jsonld-trainer-directory'
    script.type = 'application/ld+json'
    // Escape "<" so trainer-provided text can never break out of the script tag
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
    document.head.appendChild(script)
    return () => { document.getElementById('jsonld-trainer-directory')?.remove() }
  }, [trainers])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="pt-8 pb-16">
        <SectionWrapper className="py-0"><TrainerDirectorySkeleton /></SectionWrapper>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError || !trainers) {
    return (
      <SectionWrapper className="py-20">
        <div role="alert" className="flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500 mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to load Registered Trainers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            Please check your connection and try again.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => refetch()}>Retry</Button>
            <Link to="/courses"><Button variant="secondary">Explore Courses</Button></Link>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <section aria-labelledby="trainer-directory-title" className="bg-gradient-to-r from-brand-navy to-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-sky">
            <GraduationCap className="w-4 h-4" aria-hidden="true" />
            Registered Trainers
          </p>
          <h1 id="trainer-directory-title" className="mt-2 text-3xl sm:text-4xl font-bold">Meet Our Registered Trainers</h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/80">
            Discover Registered Trainers offering structured learning experiences in Mathematics and Programming on NumeryCode.
          </p>
        </div>
      </section>

      <SectionWrapper className="py-10">
        {/* Search + subject filter */}
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="relative">
            <label htmlFor="trainer-search" className="sr-only">Search Registered Trainers by name or bio</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              id="trainer-search"
              type="search"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search Registered Trainers by name or topic"
              autoComplete="off"
              className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark pl-9 pr-10 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-brand-blue focus:shadow-focus"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div role="group" aria-label="Filter by subject" className="flex flex-wrap items-center gap-2">
            {(['', ...SUBJECTS] as Array<'' | SubjectValue>).map(s => (
              <button
                key={s || 'all'}
                type="button"
                aria-pressed={subject === s}
                onClick={() => updateSubject(s)}
                className={cn(
                  'h-10 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:shadow-focus',
                  subject === s
                    ? 'bg-brand-blue text-white'
                    : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-blue',
                )}
              >
                {s === '' ? 'All' : SUBJECT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-8 mb-5 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {filtered.length} {filtered.length === 1 ? 'Registered Trainer' : 'Registered Trainers'}
          </p>
          {activeFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-brand-blue hover:underline focus-visible:shadow-focus rounded"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Directory empty states */}
        {trainers.length === 0 ? (
          <EmptyState
            icon={<UserRound className="w-12 h-12" aria-hidden="true" />}
            title="No Registered Trainers yet"
            description="Registered Trainer profiles will appear here once trainers publish courses on NumeryCode."
            action={{ label: 'Explore Courses', onClick: () => navigate('/courses') }}
          />
        ) : noMatches ? (
          <EmptyState
            icon={<Search className="w-12 h-12" aria-hidden="true" />}
            title="No Registered Trainers found"
            description="Try clearing your search or filters."
            action={activeFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(trainer => (
              <RegisteredTrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}

        {/* Become a Registered Trainer CTA — truthful, no acceptance/employment claims */}
        <div className="mt-14 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 sm:p-8 text-center shadow-card">
          <GraduationCap className="w-8 h-8 text-brand-blue mx-auto mb-3" aria-hidden="true" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Become a Registered Trainer</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Join NumeryCode as a Registered Trainer and share structured learning experiences with students. Create an account to get started.
          </p>
          <div className="mt-5">
            <Link to="/register"><Button>Become a Registered Trainer</Button></Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}