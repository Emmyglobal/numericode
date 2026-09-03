import { useId, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AlertCircle, ArrowRight, BookOpen, CheckCircle, ChevronDown, ChevronRight,
  ClipboardList, Clock, Crown, ExternalLink, GraduationCap, Video,
} from 'lucide-react'
import { coursesService } from '@/services/courses.service'
import { dashboardService } from '@/services/dashboard.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { Markdown } from '@/components/ui/Markdown'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { formatDateTime } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import { formatCoursePrice } from '@/utils/formatPrice'
import { cn } from '@/utils/classNames'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useJsonLd } from '@/utils/structuredData'
import type { Subject, Level, Module } from '@/features/courses/types'

const SITE_URL = 'https://numerycode.com'

const SUBJECT_LABELS: Record<string, string> = { mathematics: 'Mathematics', programming: 'Programming' }
const LEVEL_LABELS: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

/** NumeryCode-branded fallback used when a course has no usable thumbnail. */
const THUMBNAIL_FALLBACKS: Record<string, { bg: string; glyph: string }> = {
  mathematics: { bg: 'bg-teal-600', glyph: '∑' },
  programming: { bg: 'bg-purple', glyph: '</>' },
}

/**
 * Module → lesson accordion. The underlying data model and ordering are
 * unchanged; only the presentation is improved. Protected resource URLs and
 * live meeting URLs are never rendered here.
 */
function CurriculumModule({ mod, index, defaultOpen }: { mod: Module; index: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const uid = useId()
  const btnId   = `mod-btn-${uid}`
  const panelId = `mod-panel-${uid}`

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <h3>
        <button
          id={btnId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible:shadow-focus focus:outline-none min-h-11"
        >
          <span className="font-medium text-gray-900 dark:text-white text-sm">
            <span className="text-gray-400 dark:text-gray-500 font-semibold mr-2" aria-hidden="true">{index + 1}.</span>
            {mod.title}
          </span>
          <span className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
            </span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} hidden={!open}>
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {mod.lessons.map(l => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="flex items-center gap-3 min-w-0">
                <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{l.title}</span>
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>{formatDuration(l.duration)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Structured loading skeleton — mirrors the page layout to avoid shift. */
function CourseDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading course details">
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue py-12">
        <SectionWrapper className="py-0 space-y-4">
          <Skeleton className="h-3 w-48 bg-white/20" />
          <Skeleton className="h-8 w-2/3 max-w-xl bg-white/20" />
          <Skeleton className="h-4 w-full max-w-2xl bg-white/20" />
          <Skeleton className="h-10 w-64 bg-white/20" />
        </SectionWrapper>
      </div>
      <SectionWrapper className="py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <aside className="mt-8 lg:mt-0" aria-label="Course enrolment">
            <Skeleton className="h-96 w-full rounded-xl" />
          </aside>
        </div>
      </SectionWrapper>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()
  const isStudent = isAuthenticated && user?.role === 'student'

  // ── Course (public detail endpoint: published courses only) ────────────────
  const courseQuery = useQuery({
    queryKey: ['courses', id],
    queryFn: () => coursesService.getById(id),
    enabled: Boolean(id),
    // Surface 404s (unpublished/removed) and failures immediately.
    retry: false,
  })
  const course = courseQuery.data

  // ── SEO: title, description, canonical + Open Graph (actual course data) ───
  usePageTitle(course?.title ?? 'Course', {
    description: course?.description,
    canonical: `/courses/${id}`,
    ogTitle: course?.title,
    ogDescription: course?.description,
    ogImage: course?.thumbnailUrl ?? undefined,
    ogUrl: `${SITE_URL}/courses/${id}`,
  })

  // ── Truthful Course JSON-LD (no ratings/reviews/enrolment fabrication) ─────
  const courseJsonLd = useMemo(() => {
    if (!course || !id) return null
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      url: `${SITE_URL}/courses/${id}`,
      provider: { '@type': 'Organization', name: 'NumeryCode', url: `${SITE_URL}/` },
      instructor: { '@type': 'Person', name: course.instructor.name },
      educationalLevel: LEVEL_LABELS[course.level] ?? course.level,
      courseMode: 'online',
    }
    if (course.thumbnailUrl) data.image = course.thumbnailUrl
    // dateModified: only emit when updatedAt is valid (Phase 10)
    if (course.updatedAt) {
      const parsed = new Date(course.updatedAt)
      if (!Number.isNaN(parsed.getTime())) {
        data.dateModified = course.updatedAt
      }
    }
    if (course.accessLevel === 'premium' && typeof course.priceCents === 'number' && course.priceCents > 0) {
      data.offers = {
        '@type': 'Offer',
        price: (course.priceCents / 100).toFixed(2),
        priceCurrency: course.currency ?? 'USD',
        category: 'Paid',
      }
    }
    return data
  }, [course, id])
  useJsonLd('jsonld-course-detail', courseJsonLd)

  // ── BreadcrumbList: Home → Courses → Course Name ────────────────────────────
  const breadcrumbJsonLd = useMemo(() => {
    if (!course || !id) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Courses', item: `${SITE_URL}/courses` },
        { '@type': 'ListItem', position: 3, name: course.title, item: `${SITE_URL}/courses/${id}` },
      ],
    }
  }, [course, id])
  useJsonLd('jsonld-course-breadcrumb', breadcrumbJsonLd)

  // ── Enrolment state (existing APIs only; backend stays authoritative) ──────
  const myCoursesQuery = useQuery({
    queryKey: ['dashboard-my-courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<Array<{ id: string }>>,
    enabled: isStudent,
  })
  const isEnrolled = Boolean(isStudent && myCoursesQuery.data?.some(c => c.id === id))

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => dashboardService.getSubscription(),
    enabled: isStudent,
  })

  const requestMutation = useMutation({ mutationFn: () => coursesService.requestCourse(id) })
  const checkoutMutation = useMutation({ mutationFn: () => dashboardService.createCheckoutIntent('paystack') })

  // ── More courses from this Registered Trainer (public endpoint) ────────────
  const trainerQuery = useQuery({
    queryKey: ['public-trainer', course?.instructor.id],
    queryFn: () => coursesService.getTrainerProfile(course!.instructor.id),
    enabled: Boolean(course?.instructor.id),
    staleTime: 5 * 60_000,
  })
  const trainer = trainerQuery.data
  const otherTrainerCourses = trainer?.courses.filter(c => c.id !== id) ?? []

  // ── Loading / error / not-available states ──────────────────────────────────
  if (!id || courseQuery.isLoading) return <CourseDetailSkeleton />

  if (!course) {
    const status = (courseQuery.error as { response?: { status?: number } } | null)?.response?.status
    const notAvailable = courseQuery.isError && status === 404
    return (
      <SectionWrapper className="py-20">
        <div role="alert" className="flex flex-col items-center justify-center text-center px-4">
          <AlertCircle className="w-16 h-16 text-red-400 dark:text-red-500 mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {notAvailable ? 'This course is not available' : 'Unable to load this course'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {notAvailable
              ? 'This course may have been removed or is not currently published on NumeryCode.'
              : 'Please check your connection and try again.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {courseQuery.isError && !notAvailable && (
              <Button onClick={() => courseQuery.refetch()}>Retry</Button>
            )}
            <Link to="/courses"><Button variant="secondary">Browse courses</Button></Link>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const isPremium = course.accessLevel === 'premium'
  const hasPrice = isPremium && typeof course.priceCents === 'number' && course.priceCents > 0
  const price = hasPrice ? formatCoursePrice(course.priceCents!, course.currency) : 'Free'
  const fallback = THUMBNAIL_FALLBACKS[course.subject] ?? { bg: 'bg-brand-blue', glyph: '∑' }
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

  /**
   * Single source of truth for the enrolment CTA so the desktop sidebar and
   * the mobile sticky bar can never disagree. Existing authorization flows
   * are preserved; the backend remains authoritative.
   */
  const renderCta = (size: 'md' | 'lg') => {
    if (!isAuthenticated) {
      return (
        <Link to="/register" className="block">
          <Button size={size} className="w-full">
            Get Started <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </Link>
      )
    }
    if (!isStudent) {
      return <p className="text-sm text-gray-500 dark:text-gray-400">Student accounts can request enrolment.</p>
    }
    if (isEnrolled) {
      return (
        <Link to={`/dashboard/courses/${id}`} className="block">
          <Button size={size} className="w-full">
            Continue Learning <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </Link>
      )
    }
    if (isPremium && !subscription?.isActive) {
      return (
        <Button size={size} loading={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()} className="w-full">
          Upgrade to Premium <Crown className="w-5 h-5" aria-hidden="true" />
        </Button>
      )
    }
    return (
      <Button size={size} loading={requestMutation.isPending} onClick={() => requestMutation.mutate()} className="w-full">
        {requestMutation.isSuccess ? 'Enrolled' : 'Start Learning'} <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </Button>
    )
  }

  const ctaHelperText = !isAuthenticated
    ? 'Create a free student account to enrol in this course.'
    : !isStudent
      ? 'Enrolment is available for student accounts.'
      : isEnrolled
        ? 'You are enrolled in this course.'
        : isPremium && !subscription?.isActive
          ? 'An active Premium subscription is required for this course.'
          : 'Enrol now — you will get access to every lesson in this course.'

  return (
    <div className="pb-24 lg:pb-0">
      {/* Breadcrumb + course hero */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-10 lg:py-12">
        <SectionWrapper className="py-0">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-blue-300 mb-4">
            <Link to="/" className="hover:text-white transition-colors focus-visible:shadow-focus focus:outline-none rounded">Home</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <Link to="/courses" className="hover:text-white transition-colors focus-visible:shadow-focus focus:outline-none rounded">Courses</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-white" aria-current="page">{course.title}</span>
          </nav>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={course.subject as Subject}>{SUBJECT_LABELS[course.subject] ?? course.subject}</Badge>
            <Badge variant={course.level as Level}>{LEVEL_LABELS[course.level] ?? course.level}</Badge>
            <span className={isPremium ? 'inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950' : 'rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-700'}>
              {isPremium && <Crown className="h-3 w-3" aria-hidden="true" />}{isPremium ? 'Premium' : 'Free'}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-blue-200 max-w-2xl">{course.description}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" aria-hidden="true" />{course.lessonCount} lesson{course.lessonCount !== 1 ? 's' : ''}</span>
            {course.liveClasses.length > 0 && (
              <span className="flex items-center gap-1.5"><Video className="w-4 h-4" aria-hidden="true" />{course.liveClasses.length} live session{course.liveClasses.length !== 1 ? 's' : ''}</span>
            )}
            <Link
              to={`/trainers/${course.instructor.id}`}
              className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors pl-1 pr-3 py-1 focus-visible:shadow-focus focus:outline-none"
              aria-label={`Registered Trainer: ${course.instructor.name} — view profile`}
            >
              <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="sm" />
              <span className="text-white font-medium">{course.instructor.name}</span>
              <span className="text-xs text-blue-200">· Registered Trainer</span>
            </Link>
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2 space-y-8 min-w-0">
            {/* Course thumbnail (or branded fallback) */}
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={`${course.title} — course thumbnail`}
                loading="lazy"
                decoding="async"
                className="w-full aspect-video object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-card"
              />
            ) : (
              <div className={cn('w-full aspect-video rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center', fallback.bg)} aria-hidden="true">
                <span className="text-white/20 text-8xl font-bold select-none">{fallback.glyph}</span>
              </div>
            )}

            {/* About this course */}
            {course.content?.trim() && (
              <section aria-labelledby="about-heading">
                <h2 id="about-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-3">About this course</h2>
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                  <Markdown text={course.content} />
                </div>
              </section>
            )}

            {/* What you'll learn — only when the course actually has outcomes */}
            {course.outcomes.length > 0 && (
              <section aria-labelledby="outcomes-heading">
                <h2 id="outcomes-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">What you&rsquo;ll learn</h2>
                <ul className="grid sm:grid-cols-2 gap-2 rounded-xl border border-brand-light dark:border-blue-800 bg-brand-light/50 dark:bg-blue-900/20 p-6" aria-label="Learning outcomes">
                  {course.outcomes.map(o => (
                    <li key={o} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Curriculum — same module → lesson data model, improved presentation */}
            {course.modules.length > 0 && (
              <section aria-labelledby="curriculum-heading">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                  <h2 id="curriculum-heading" className="text-lg font-bold text-gray-900 dark:text-white">Course curriculum</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  {course.modules.map((mod, i) => (
                    <CurriculumModule key={mod.id} mod={mod} index={i} defaultOpen={i === 0} />
                  ))}
                </div>
              </section>
            )}

            {/* Live classes — meeting URLs are never exposed to the public */}
            {course.liveClasses.length > 0 && (
              <section aria-labelledby="schedule-heading">
                <h2 id="schedule-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Live class schedule</h2>
                <ul className="space-y-3">
                  {course.liveClasses.map(lc => (
                    <li key={lc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{lc.title}</p>
                          {lc.status && <Badge variant={lc.status as 'live' | 'upcoming' | 'past'}>{lc.status}</Badge>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDateTime(lc.date)} · {formatDuration(lc.duration)}</p>
                      </div>
                      {/* Public payload carries no meeting URL — enrolment-gated on the backend */}
                      {lc.meetUrl
                        ? <a href={lc.meetUrl} target="_blank" rel="noreferrer" aria-label={`Join live class: ${lc.title} (opens in new tab)`}><Button variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />Join</Button></a>
                        : <span className="text-xs text-gray-500 dark:text-gray-400">Available after enrolment</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Prerequisite notice — only when the course declares one */}
            {course.prerequisiteQuiz && (
              <section aria-labelledby="prereq-heading" className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-6">
                <h2 id="prereq-heading" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-2">
                  <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  Prerequisite
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Before the lessons in this course unlock, you&rsquo;ll need to pass the prerequisite quiz
                  &ldquo;{course.prerequisiteQuiz.title}&rdquo; with a score of at least {course.prerequisiteQuiz.passingScore}%.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You&rsquo;ll take the quiz inside the course after enrolling.</p>
              </section>
            )}

            {/* Registered Trainer */}
            <section aria-labelledby="trainer-heading">
              <h2 id="trainer-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Meet your Registered Trainer</h2>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row gap-5 items-start">
                <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="lg" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{course.instructor.name}</h3>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue dark:text-blue-300 mt-0.5">
                    <GraduationCap className="w-4 h-4" aria-hidden="true" /> Registered Trainer
                  </p>
                  {course.instructor.bio && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{course.instructor.bio}</p>
                  )}
                  <Link
                    to={`/trainers/${course.instructor.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue dark:text-blue-300 hover:underline mt-4 focus-visible:shadow-focus focus:outline-none rounded"
                  >
                    View full profile <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>

            {/* More courses from this Registered Trainer — public trainer endpoint */}
            {otherTrainerCourses.length > 0 && (
              <section aria-labelledby="more-courses-heading">
                <h2 id="more-courses-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  More courses from this Registered Trainer
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {otherTrainerCourses.map(c => (
                    <Link
                      key={c.id}
                      to={`/courses/${c.id}`}
                      className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 shadow-card hover:shadow-lg transition-shadow focus-visible:shadow-focus focus:outline-none"
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand-blue dark:text-blue-300">
                        {SUBJECT_LABELS[c.subject] ?? c.subject}
                      </span>
                      <h3 className="font-semibold text-gray-900 dark:text-white mt-1.5 mb-1 group-hover:text-brand-blue transition-colors">{c.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {c.lessonCount} lesson{c.lessonCount !== 1 ? 's' : ''} · {LEVEL_LABELS[c.level] ?? c.level}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue dark:text-blue-300 mt-3">
                        View course <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Desktop sticky enrolment sidebar (hidden on mobile — the sticky CTA bar takes over) */}
          <aside aria-label="Course enrolment" className="hidden lg:block mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-lg overflow-hidden">
              <div className={cn('h-36 flex items-center justify-center', course.thumbnailUrl ? 'bg-brand-navy' : 'bg-gradient-to-br from-brand-navy to-brand-blue')}>
                {course.thumbnailUrl
                  ? <img src={course.thumbnailUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  : <span className="text-7xl text-white/20 font-bold select-none" aria-hidden="true">{fallback.glyph}</span>}
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{price}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isPremium ? 'Premium course' : 'Free course'} · one-time enrolment</p>
                </div>
                {renderCta('lg')}
                <p className="text-xs text-gray-500 dark:text-gray-400">{ctaHelperText}</p>
                {requestMutation.isError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{(requestMutation.error as Error).message}</p>}
                {requestMutation.isSuccess && (
                  <p className="text-xs text-green-700 dark:text-green-400">
                    You are enrolled. <Link to={`/dashboard/courses/${id}`} className="underline font-semibold">Go to your course</Link>
                  </p>
                )}
                {checkoutMutation.isSuccess && <p className="text-xs text-green-700 dark:text-green-400">Your payment checkout is ready. Premium access activates after provider confirmation.</p>}
                <dl className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-sm">
                  {([
                    ['Level', LEVEL_LABELS[course.level] ?? course.level],
                    ['Subject', SUBJECT_LABELS[course.subject] ?? course.subject],
                    ['Lessons', course.lessonCount],
                    ['Live sessions', course.liveClasses.length],
                    ['Access', isPremium ? 'Premium' : 'Free'],
                  ] as Array<[string, string | number]>).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-gray-600 dark:text-gray-400">
                      <dt>{k}</dt>
                      <dd className="font-medium text-gray-900 dark:text-white text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>

      {/* Mobile sticky enrolment bar — always-reachable CTA that respects safe-area insets */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-surface-dark/95 backdrop-blur px-4 pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        aria-label="Course enrolment actions"
      >
        <div className="mx-auto flex items-center gap-3 max-w-2xl">
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{price}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{isPremium ? 'Premium course' : 'Free course'}</p>
          </div>
          <div className="ml-auto shrink-0 [&_a]:block min-w-40">{renderCta('md')}</div>
        </div>
      </div>
      {/* Spacer so the fixed bar never covers page content or the footer */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  )
}