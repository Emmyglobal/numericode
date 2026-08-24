import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Check, GraduationCap, PlayCircle, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '@/services/dashboard.service'
import { coursesService, type AvailableCourseForEnrollment } from '@/services/courses.service'
import { EnrolledCourseCard } from '@/components/shared/EnrolledCourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/utils/classNames'
import type { EnrolledCourse } from '@/features/courses/types'

export default function MyCoursesPage() {
  usePageTitle('My Courses')
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // ── My existing courses ──────────────────────────────────────────────────
  const { data: courses, isLoading } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  // ── "Enrol in a new course" state ────────────────────────────────────────
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([])
  const [teacherFilter, setTeacherFilter] = useState('')
  const [enrollError, setEnrollError] = useState('')
  const [enrollSuccess, setEnrollSuccess] = useState('')

  const { data: teachers } = useQuery({
    queryKey: ['availableTeachers'],
    queryFn: () => coursesService.getAvailableTeachers(),
    staleTime: 60_000,
  })

  const { data: availableCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['availableForEnrollment', teacherFilter],
    queryFn: () => coursesService.getAvailableForEnrollment(teacherFilter || undefined),
    staleTime: 30_000,
  })

  // Group available courses by subject
  const groupedCourses = useMemo(() => {
    if (!availableCourses) return {}
    const grouped: Record<string, AvailableCourseForEnrollment[]> = {}
    for (const course of availableCourses) {
      if (!grouped[course.subject]) grouped[course.subject] = []
      grouped[course.subject].push(course)
    }
    return grouped
  }, [availableCourses])

  const enrollMutation = useMutation({
    mutationFn: () => coursesService.enrollInCourses(selectedCourseIds),
    onSuccess: (data) => {
      setEnrollSuccess(`Successfully enrolled in ${data.count} course(s)!`)
      setSelectedCourseIds([])
      setEnrollError('')
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] })
      queryClient.invalidateQueries({ queryKey: ['availableForEnrollment'] })
    },
    onError: (err: Error) => {
      setEnrollError(err.message)
    },
  })

  const toggleCourse = (id: string) => {
    setSelectedCourseIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
    setEnrollError('')
  }

  const handleEnroll = () => {
    if (selectedCourseIds.length === 0) {
      setEnrollError('Please select at least one course to enrol in')
      return
    }
    enrollMutation.mutate()
  }

  // ── Helpers for the "Continue Learning" hero ─────────────────────────────
  const activeCourse = courses?.find(c => c.progress > 0 && c.progress < 100)
    ?? courses?.find(c => c.progress === 0)
  const activeLessons = activeCourse?.modules.flatMap(m => m.lessons) ?? []
  const activeNext = activeLessons.find(l => !l.isCompleted) ?? activeLessons[0]

  return (
    <div className="space-y-10">
      {/* My Courses */}
      <div>
        <PageHeader title="My Courses" subtitle="Track your progress across all enrolled courses" />

        {/* Continue Learning hero */}
        {!isLoading && activeCourse && (
          <div className="mb-8 rounded-2xl border border-brand-light dark:border-blue-900 bg-gradient-to-r from-brand-light/70 to-white dark:from-blue-900/20 to-surface-dark p-6 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-1">Continue Learning</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeCourse.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                  {activeNext ? `Next up: ${activeNext.title}` : 'You’ve finished every lesson — review again or revisit your notes.'}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Course progress</span><span>{activeCourse.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={cn('h-full rounded-full', activeCourse.progress >= 100 ? 'bg-green-600' : 'bg-brand-blue')} style={{ width: `${activeCourse.progress}%` }} />
                  </div>
                </div>
              </div>
              <Button size="md" className="shrink-0" onClick={() => navigate(`/dashboard/courses/${activeCourse.id}?lesson=${activeNext?.id ?? ''}`)}>
                <PlayCircle className="w-4 h-4" aria-hidden />
                {activeCourse.progress >= 100 ? 'Review course' : 'Resume course'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : !courses?.length ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No courses yet"
            description="Browse available courses below and enrol in the ones that interest you."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {courses.map(c => <EnrolledCourseCard key={c.id} course={c} />)}
          </div>
        )}
      </div>

      {/* Enrol in a new course */}
      <div className="rounded-2xl border border-brand-light dark:border-blue-900 bg-brand-light/40 dark:bg-blue-900/10 p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="rounded-lg bg-brand-blue p-2 text-white shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Enrol in a New Course</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select a teacher to browse their available courses, then choose the ones you want to enrol in.
            </p>
          </div>
        </div>

        {enrollError && (
          <Alert type="error" message={enrollError} onClose={() => setEnrollError('')} />
        )}

        {enrollSuccess && (
          <Alert type="success" message={enrollSuccess} onClose={() => setEnrollSuccess('')} />
        )}

        <div className="space-y-5">
          {/* Teacher filter */}
          <div className="flex flex-col gap-1.5 max-w-sm">
            <label htmlFor="filter-teacher" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Filter by Teacher <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select
              id="filter-teacher"
              value={teacherFilter}
              onChange={e => { setTeacherFilter(e.target.value); setSelectedCourseIds([]); setEnrollError('') }}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 shadow-sm focus:border-brand-blue focus:outline-none dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100"
            >
              <option value="">All Teachers</option>
              {teachers?.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.subjects.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Available courses */}
          {coursesLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : !availableCourses?.length ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No available courses found. You may already be enrolled in all matching courses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedCourses).map(([subject, courses]) => (
                <div key={subject}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-2">
                    {subject === 'mathematics' ? 'Mathematics' : 'Programming'}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {courses.map(course => {
                      const isSelected = selectedCourseIds.includes(course.id)
                      return (
                        <label
                          key={course.id}
                          className={cn(
                            'flex items-start gap-3 rounded-xl border-2 p-3.5 cursor-pointer transition-all',
                            isSelected
                              ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCourse(course.id)}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              'flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded border-2 transition-colors',
                              isSelected
                                ? 'border-brand-blue bg-brand-blue text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {isSelected && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <div className="min-w-0">
                            <p className={cn('text-sm font-semibold', isSelected ? 'text-brand-blue' : 'text-gray-900 dark:text-white')}>
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)} · {course.instructorName}
                            </p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected count + Submit */}
          {availableCourses && availableCourses.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <Button
                onClick={handleEnroll}
                loading={enrollMutation.isPending}
                disabled={selectedCourseIds.length === 0}
              >
                {enrollMutation.isPending
                  ? 'Enrolling…'
                  : `Enrol in ${selectedCourseIds.length} Course${selectedCourseIds.length !== 1 ? 's' : ''}`
                }
              </Button>
              {selectedCourseIds.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCourseIds.length} course{selectedCourseIds.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}