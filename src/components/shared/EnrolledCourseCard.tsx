import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Check, ChevronDown, Crown, MinusCircle, PlayCircle, StickyNote, Lock, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Markdown } from '@/components/ui/Markdown'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/utils/classNames'
import { dashboardService } from '@/services/dashboard.service'
import { paymentsService } from '@/services/payments.service'
import { formatCoursePrice } from '@/utils/formatPrice'
import type { EnrolledCourse } from '@/features/courses/types'

/** Slim circular progress indicator — WorldQuant-style course progress. */
function ProgressRing({ value, size = 58 }: { value: number; size?: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)))
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  const done = pct >= 100

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress ${pct}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          className={cn('transition-all duration-700', done ? 'stroke-green-600' : 'stroke-brand-blue')}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={cn(
        'absolute inset-0 flex items-center justify-center text-[11px] font-bold',
        done ? 'text-green-600' : 'text-gray-700 dark:text-gray-200',
      )}>
        {done ? <Check className="w-4 h-4" aria-hidden /> : `${pct}%`}
      </div>
    </div>
  )
}

const subjectMeta: Record<string, { glyph: string; band: string }> = {
  mathematics: { glyph: '∑', band: 'bg-gradient-to-br from-teal-700 to-teal-900' },
  programming: { glyph: '</>', band: 'bg-gradient-to-br from-indigo-600 to-purple-900' },
}

interface EnrolledCourseCardProps { course: EnrolledCourse }

export function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const queryClient = useQueryClient()

  // "Remove Course" — the backend enforces ownership + the purchased-course
  // policy. On success we invalidate every react-query consumer of the
  // enrollment list so My Courses, the dashboard overview, the public course
  // page and the "available for enrollment" list all refresh immediately.
  const removeMutation = useMutation({
    mutationFn: () => dashboardService.removeCourse(course.id),
    onSuccess: () => {
      setConfirmRemove(false)
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['availableForEnrollment'] })
    },
  })
  const removeError = removeMutation.error instanceof Error
    ? removeMutation.error.message
    : removeMutation.error

  // "Complete Payment" — premium checkout goes through the EXISTING backend
  // Paystack flow (server-authoritative price/currency). This only STARTS
  // checkout and redirects to the provider; payment success is never decided by
  // the frontend. After checkout, the return page polls the backend for the
  // verified state before the course unlocks.
  const paymentMutation = useMutation({
    mutationFn: () => paymentsService.initiate(course.id),
    onSuccess: (result) => {
      if (result.authorizationUrl) window.location.assign(result.authorizationUrl)
    },
  })
  const paymentError = paymentMutation.error instanceof Error
    ? paymentMutation.error.message
    : paymentMutation.error

  // A premium enrollment with no active access (no verified payment, no active
  // subscription) is a locked registration: show "Payment Required" instead of a
  // misleading "Continue Learning" that would dead-end on the viewer 403.
  const needsPayment = course.accessLevel === 'premium' && !course.purchased && !course.accessActive
  const purchasable = needsPayment && Boolean(course.premiumEnabled) && typeof course.priceCents === 'number' && course.priceCents > 0
  const priceLabel = needsPayment ? formatCoursePrice(course.priceCents ?? 0, course.currency ?? 'NGN') : ''

  // Defensive: the /dashboard/courses list endpoint returns flat summaries
  // without `modules`; guard so a single card never crashes the whole page.
  const courseModules = Array.isArray(course.modules) ? course.modules : []
  const allLessons = courseModules.flatMap(m => m.lessons ?? [])
  const nextLesson = allLessons.find(l => !l.isCompleted) ?? allLessons[0]
  const modulesWithLessons = courseModules.filter(m => Array.isArray(m.lessons) && m.lessons.length > 0)
  const meta = subjectMeta[course.subject] ?? { glyph: '&', band: 'bg-brand-blue' }

  const toggleLesson = (id: string) => setExpandedLessonId(prev => prev === id ? null : id)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-card hover:shadow-lg transition-shadow">
      {/* Course band */}
      <div className={cn('flex items-center justify-between px-4 py-3', meta.band)}>
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-white/30 text-3xl font-bold select-none leading-none" aria-hidden>{meta.glyph}</span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-white">{course.title}</h3>
            <p className="text-xs text-white/70 truncate">
              {course.instructor.name} · {course.subject === 'mathematics' ? 'Mathematics' : 'Programming'}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Badge variant={course.level}>{course.level}</Badge>
          {course.accessLevel === 'premium' && (
            <span className="inline-flex items-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950">
              Premium
            </span>
          )}
          {needsPayment && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
              <Wallet className="w-3 h-3" aria-hidden /> Payment Required
            </span>
          )}
        </div>
      </div>
<div className="flex flex-1 gap-4 p-4">
        {/* Progress + continue / payment */}
        <div className="flex flex-col items-center gap-3">
          <ProgressRing value={course.progress} />
          {needsPayment ? (
            <>
              {purchasable ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  loading={paymentMutation.isPending}
                  onClick={() => paymentMutation.mutate()}
                >
                  <Crown className="w-3.5 h-3.5" aria-hidden /> Complete Payment
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="w-full" disabled>
                  Enrolment opening soon
                </Button>
              )}
            </>
          ) : (
            <Link to={`/dashboard/courses/${course.id}?lesson=${nextLesson?.id ?? ''}`}>
              <Button variant="secondary" size="sm" className="w-full">
                <PlayCircle className="w-3.5 h-3.5" aria-hidden />
                {course.progress >= 100 ? 'Review' : 'Continue'}
              </Button>
            </Link>
          )}
        </div>

        {/* Course info */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>

          {needsPayment && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2.5 py-2 text-xs text-red-800 dark:text-red-200 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" aria-hidden />
                Payment Required — {priceLabel}
              </p>
              <p>Complete payment to unlock this course. Access is granted only after your payment is verified by our secure payment provider.</p>
              {paymentError && <p role="alert" className="text-red-700 dark:text-red-300">{paymentError}</p>}
              {paymentMutation.isSuccess && <p>Redirecting you to the secure payment page…</p>}
            </div>
          )}

          {!needsPayment && nextLesson && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">
              <span className="font-semibold text-brand-blue">Next lesson:</span> {nextLesson.title}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" aria-hidden />{allLessons.length} lessons</span>
                        {courseModules.length > 0 && <span>{courseModules.length} modules</span>}
          </div>

          {/* Lesson list with expandable notes */}
          {modulesWithLessons.length > 0 && (
            <div className="pt-2 space-y-1">
              {modulesWithLessons.map(mod => (
                <div key={mod.id}>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-1">{mod.title}</p>
                  <ul className="space-y-0.5">
                    {mod.lessons.map(l => {
                      const isExpanded = expandedLessonId === l.id
                      const isNext = l.id === nextLesson?.id
                      return (
                        <li key={l.id} className="rounded-lg border border-gray-100 dark:border-gray-800">
                          <button
                            type="button"
                            onClick={() => toggleLesson(l.id)}
                            aria-expanded={isExpanded}
                            className={cn(
                              'w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                              'hover:bg-gray-50 dark:hover:bg-gray-800/60',
                              isNext && 'bg-brand-light dark:bg-blue-900/20',
                            )}
                          >
                            {l.isCompleted
                              ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" aria-hidden />
                              : <PlayCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden />}
                            <span className={cn('flex-1 truncate font-medium', l.isCompleted ? 'text-gray-500' : 'text-gray-800 dark:text-gray-200')}>
                              {l.title}
                            </span>
                            <span className="text-[11px] text-gray-400 shrink-0">{l.duration ?? 20}m</span>
                            <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', isExpanded && 'rotate-180')} aria-hidden />
                          </button>
                          {isExpanded && (
                            <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2.5">
                              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand-blue uppercase tracking-wide">
                                <StickyNote className="w-3 h-3" aria-hidden /> Lesson notes
                              </p>
                              {l.content ? (
                                <>
                                  <Markdown text={l.content} className="text-sm text-gray-700 dark:text-gray-300 space-y-1" />
                                  <Link
                                    to={`/dashboard/courses/${course.id}?lesson=${l.id}`}
                                    className="mt-2 inline-block text-xs font-medium text-brand-blue hover:underline"
                                  >
                                    Read full notes in course →
                                  </Link>
                                </>
                              ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">No notes for this lesson yet.</p>
                              )}
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
        {course.purchased ? (
          // Legitimately purchased access — self-serve removal is disabled. The
          // backend independently enforces the same purchased-course policy.
          <span
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"
            title="Purchased courses can't be removed here — removal is subject to the platform purchase/refund policy"
          >
            <Lock className="w-3 h-3" aria-hidden />
            Purchased — removal subject to purchase/refund policy
          </span>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(true)}>
            <MinusCircle className="w-3.5 h-3.5" aria-hidden />
            Remove Course
          </Button>
        )}
      </div>

      {/* Remove Course confirmation — text reflects the real persistence
          behaviour: only the registration leaves My Courses; the course,
          learning history and payment history are preserved. */}
      <ConfirmDialog
        open={confirmRemove}
        title="Remove this course?"
        message="Your course registration and learning progress for this course will be removed from your active courses. The course itself, your learning records and any payment history are preserved — only a purchased course can't be removed from here (see the platform purchase/refund policy)."
        confirmLabel="Remove Course"
        cancelLabel="Cancel"
        loading={removeMutation.isPending}
        error={removeError}
        onConfirm={() => removeMutation.mutate()}
        onCancel={() => { setConfirmRemove(false); removeMutation.reset() }}
      />
    </article>
  )
}