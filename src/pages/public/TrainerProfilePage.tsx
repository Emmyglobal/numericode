import { useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton, CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { CourseCard } from '@/components/shared/CourseCard'
import { coursesService } from '@/services/courses.service'

const SITE_URL = 'https://numerycode.com'
const SUBJECT_LABELS: Record<string, string> = { mathematics: 'Mathematics', programming: 'Programming' }

/** Profile skeleton matching the final hero + course-grid layout. */
function TrainerProfileSkeleton() {
  return (
    <div className="space-y-10" role="status" aria-busy="true" aria-label="Loading trainer profile">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-2/3 max-w-sm" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-56 mb-5" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function TrainerProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: trainer, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['public-trainer', id],
    queryFn: () => coursesService.getTrainerProfile(id),
    enabled: Boolean(id),
  })

  // ── Dynamic SEO: title, description, canonical + Open Graph (public data only) ─
  const subjectText = trainer && trainer.subjects.length
    ? trainer.subjects.map(s => SUBJECT_LABELS[s] ?? s).join(', ')
    : ''
  const metaDescription = trainer
    ? trainer.bio
      ? trainer.bio.length > 157 ? `${trainer.bio.slice(0, 157)}…` : trainer.bio
      : `Learn more about ${trainer.name}, a Registered Trainer on NumeryCode${subjectText ? ` teaching ${subjectText}` : ''}.`
    : 'Explore Registered Trainer profiles on NumeryCode and discover their published courses.'
  const ogTitle = trainer ? `${trainer.name} | Registered Trainer` : 'Registered Trainer'
  const canonical = trainer ? `/trainers/${id}` : undefined

  usePageTitle(ogTitle, {
    description: metaDescription,
    canonical,
    ogTitle: ogTitle,
    ogDescription: metaDescription,
    ogImage: trainer?.avatarUrl ?? undefined,
    ogUrl: trainer ? `${SITE_URL}/trainers/${id}` : undefined,
  })

  // ── Truthful Person JSON-LD — no fabricated credentials, employer, ratings ──
  useEffect(() => {
    if (!trainer || !id) return
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: trainer.name,
      url: `${SITE_URL}/trainers/${id}`,
    }
    if (trainer.bio) data.description = trainer.bio
    if (trainer.avatarUrl) data.image = trainer.avatarUrl
    if (trainer.subjects.length) {
      data.knowsAbout = trainer.subjects.map(s => SUBJECT_LABELS[s] ?? s)
    }
    const script = document.createElement('script')
    script.id = 'jsonld-trainer-profile'
    script.type = 'application/ld+json'
    // Escape "<" so trainer-provided text can never break out of the script tag
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c')
    document.head.appendChild(script)
    return () => { document.getElementById('jsonld-trainer-profile')?.remove() }
  }, [trainer, id])

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="pt-8 pb-16">
        <SectionWrapper className="py-0"><TrainerProfileSkeleton /></SectionWrapper>
      </div>
    )
  }

  // ── Not-found (404) vs generic error state ────────────────────────────────
  if (!trainer) {
    const status = (error as { response?: { status?: number } } | null)?.response?.status
    const notFound = isError && status === 404
    return (
      <SectionWrapper className="py-20">
        <div role="alert" className="flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500 mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {notFound ? 'Trainer not found' : 'Unable to load trainer profile'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {notFound
              ? 'This Registered Trainer profile could not be found, or the trainer is not currently active on NumeryCode.'
              : 'Please check your connection and try again.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isError && !notFound && <Button onClick={() => refetch()}>Retry</Button>}
            <Link to="/courses"><Button variant="secondary">Explore Courses</Button></Link>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <div className="pt-8 pb-16">
      <SectionWrapper className="py-0">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-blue hover:underline focus-visible:shadow-focus rounded"
        >
          <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" />
          Explore Courses
        </Link>

        {/* Hero */}
        <section aria-labelledby="trainer-name" className="mt-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {trainer.avatarUrl ? (
                <img
                  src={trainer.avatarUrl}
                  alt={`${trainer.name} — Registered Trainer on NumeryCode`}
                  className="w-24 h-24 rounded-full object-cover shrink-0"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center text-3xl font-bold shrink-0"
                >
                  {initialsOf(trainer.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  Registered Trainer
                </p>
                <h1 id="trainer-name" className="mt-1.5 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {trainer.name}
                </h1>
                {trainer.bio && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">{trainer.bio}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {trainer.subjects.map(s => (
                    <Badge key={s} variant={s as 'mathematics' | 'programming'}>{SUBJECT_LABELS[s] ?? s}</Badge>
                  ))}
                  <Badge variant="default">
                    <BookOpen className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                    {trainer.courses.length} {trainer.courses.length === 1 ? 'course' : 'courses'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Published courses */}
        <section aria-labelledby="trainer-courses" className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 id="trainer-courses" className="text-xl font-bold text-gray-900 dark:text-white">
                Courses by {trainer.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                Explore courses offered by this Registered Trainer on NumeryCode.
              </p>
            </div>
            {trainer.courses.length > 0 && (
              <Link
                to={`/courses?instructorId=${trainer.id}`}
                className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:text-brand-navy dark:text-blue-300 dark:hover:text-blue-200 focus-visible:shadow-focus rounded transition-colors"
              >
                View all courses by this Registered Trainer
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {trainer.courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-12 h-12" aria-hidden="true" />}
              title="No published courses yet"
              description={`${trainer.name} has not published any courses on NumeryCode yet — check back soon.`}
              action={{ label: 'Explore Courses', onClick: () => navigate('/courses') }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trainer.courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        <div className="mt-14 text-center">
          <Link to="/register">
            <Button variant="secondary">
              Become a Registered Trainer on NumeryCode <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </SectionWrapper>
    </div>
  )
}