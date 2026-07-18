import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, BookOpen, Video, Clock, CheckCircle, ExternalLink, Crown } from 'lucide-react'
import { useState, useId } from 'react'
import { coursesService } from '@/services/courses.service'
import { dashboardService } from '@/services/dashboard.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { formatDateTime } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import { cn } from '@/utils/classNames'
import { useAuth } from '@/hooks/useAuth'
import type { Subject, Level, Module } from '@/features/courses/types'

function CurriculumModule({ mod, defaultOpen }: { mod: Module; defaultOpen: boolean }) {
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
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <span className="font-medium text-gray-900 dark:text-white text-sm">{mod.title}</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">{mod.lessons.length} lessons</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200', open && 'rotate-180')} aria-hidden="true" />
          </div>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={btnId} hidden={!open}>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {mod.lessons.map(l => (
            <div key={l.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" aria-hidden="true" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{l.title}</span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>{formatDuration(l.duration)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated } = useAuth()
  const { data: course, isLoading } = useQuery({
    queryKey: ['courses', id],
    queryFn:  () => coursesService.getById(id!),
    enabled:  !!id,
  })
  const requestMutation = useMutation({ mutationFn: () => coursesService.requestCourse(id!) })
  const { data: subscription } = useQuery({
    queryKey: ['subscription'], queryFn: () => dashboardService.getSubscription(), enabled: isAuthenticated && user?.role === 'student',
  })
  const checkoutMutation = useMutation({ mutationFn: () => dashboardService.createCheckoutIntent('paystack') })

  if (isLoading) return (
    <SectionWrapper>
      <div className="space-y-4" aria-label="Loading course details" aria-busy="true">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    </SectionWrapper>
  )

  if (!course) return (
    <SectionWrapper><p className="text-gray-500" role="alert">Course not found.</p></SectionWrapper>
  )

  return (
    <div>
      <div className="bg-gradient-to-r from-brand-navy to-brand-blue text-white py-12">
        <SectionWrapper className="py-0">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-xs text-blue-300 mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 mt-0.5" aria-hidden="true" />
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="w-3 h-3 mt-0.5" aria-hidden="true" />
            <span className="text-white" aria-current="page">{course.title}</span>
          </nav>
          <div className="flex gap-2 mb-3">
            <Badge variant={course.subject as Subject}>{course.subject}</Badge>
            <Badge variant={course.level as Level}>{course.level}</Badge>
            <span className={course.accessLevel === 'premium' ? 'inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950' : 'rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-700'}>{course.accessLevel === 'premium' && <Crown className="h-3 w-3" aria-hidden="true" />}{course.accessLevel === 'premium' ? 'Premium' : 'Free'}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">{course.title}</h1>
          <p className="text-blue-200 max-w-2xl">{course.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" aria-hidden="true" />{course.lessonCount} lessons</span>
            <span className="flex items-center gap-1.5"><Video className="w-4 h-4" aria-hidden="true" />{course.liveClasses.length} live sessions</span>
            <span>By {course.instructor.name}</span>
          </div>
        </SectionWrapper>
      </div>

      <SectionWrapper className="py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">

            {/* Outcomes */}
            <section aria-labelledby="outcomes-heading">
              <div className="rounded-xl border border-brand-light dark:border-blue-800 bg-brand-light/50 dark:bg-blue-900/20 p-6">
                <h2 id="outcomes-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">What You Will Learn</h2>
                <ul className="grid sm:grid-cols-2 gap-2" aria-label="Learning outcomes">
                  {course.outcomes.map(o => (
                    <li key={o} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Curriculum */}
            <section aria-labelledby="curriculum-heading">
              <h2 id="curriculum-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.modules.map((mod, i) => (
                  <CurriculumModule key={mod.id} mod={mod} defaultOpen={i === 0} />
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section aria-labelledby="instructor-heading">
              <h2 id="instructor-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Instructor</h2>
              <div className="flex gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <Avatar name={course.instructor.name} src={course.instructor.avatarUrl} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{course.instructor.name}</h3>
                  <ul className="flex flex-wrap gap-2 my-2" aria-label="Instructor credentials">
                    {course.instructor.credentials.map(c => (
                      <li key={c} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded px-2 py-0.5">{c}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.instructor.bio}</p>
                </div>
              </div>
            </section>

            {/* Live Schedule */}
            {course.liveClasses.length > 0 && (
              <section aria-labelledby="schedule-heading">
                <h2 id="schedule-heading" className="text-lg font-bold text-gray-900 dark:text-white mb-4">Live Class Schedule</h2>
                <ul className="space-y-3">
                  {course.liveClasses.map(lc => (
                    <li key={lc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{lc.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDateTime(lc.date)} · {formatDuration(lc.duration)}</p>
                      </div>
                      {lc.meetUrl ? <a href={lc.meetUrl} target="_blank" rel="noreferrer" aria-label={`Join live class: ${lc.title} (opens in new tab)`}><Button variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />Join</Button></a> : <span className="text-xs text-gray-500">Available after enrolment</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside aria-label="Course enrolment" className="mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-lg overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center" aria-hidden="true">
                <span className="text-7xl text-white/20 font-bold">{course.subject === 'mathematics' ? '∑' : '</>'}</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{course.accessLevel === 'premium' ? `${course.currency ?? 'NGN'} ${((course.priceCents ?? 0) / 100).toLocaleString()}` : 'Free'}</p>
                {!isAuthenticated ? <Link to="/register"><Button size="lg" className="w-full">Get Started <ChevronRight className="w-5 h-5" aria-hidden="true" /></Button></Link>
                : user?.role === 'student' && course.accessLevel === 'premium' && !subscription?.isActive ? <Button size="lg" loading={checkoutMutation.isPending} onClick={() => checkoutMutation.mutate()} className="w-full">Upgrade to Premium <Crown className="w-5 h-5" aria-hidden="true" /></Button>
                : user?.role === 'student' ? <Button size="lg" loading={requestMutation.isPending} onClick={() => requestMutation.mutate()} className="w-full">{requestMutation.isSuccess ? 'Enrolled' : 'Start Learning'} <ChevronRight className="w-5 h-5" aria-hidden="true" /></Button>
                : <p className="text-sm text-gray-500 dark:text-gray-400">Student accounts can request enrolment.</p>}
                {requestMutation.isError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{(requestMutation.error as Error).message}</p>}
                {requestMutation.isSuccess && <p className="text-xs text-green-700 dark:text-green-400">You are enrolled and can start learning now.</p>}
                {checkoutMutation.isSuccess && <p className="text-xs text-green-700 dark:text-green-400">Your payment checkout is ready. Premium access activates after provider confirmation.</p>}
                <dl className="space-y-2 pt-2 text-sm">
                  {([['Lessons', course.lessonCount], ['Live Sessions', course.liveClasses.length], ['Level', course.level], ['Subject', course.subject]] as [string, string|number][]).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <dt>{k}</dt>
                      <dd className="font-medium text-gray-900 dark:text-white capitalize">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </aside>
        </div>
      </SectionWrapper>
    </div>
  )
}
