import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Check, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { dashboardService } from '@/services/dashboard.service'
import { coursesService } from '@/services/courses.service'
import { CourseCard } from '@/components/shared/CourseCard'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/utils/classNames'
import type { EnrolledCourse } from '@/features/courses/types'

const subjects = [
  { value: 'mathematics' as const, label: 'Mathematics' },
  { value: 'programming' as const, label: 'Programming' },
]

export default function MyCoursesPage() {
  usePageTitle('My Courses')
  const queryClient = useQueryClient()

  const { data: courses, isLoading } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  // ── "Enroll in a new course" state ──────────────────────────────────────
  const [selectedSubjects, setSelectedSubjects] = useState<Array<'mathematics' | 'programming'>>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [enrollError, setEnrollError] = useState('')

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ['availableTeachers'],
    queryFn: () => coursesService.getAvailableTeachers(),
    staleTime: 60_000,
  })

  const eligibleTeachers = (teachers ?? []).filter(teacher =>
    selectedSubjects.every(subject => teacher.subjects.includes(subject))
  )

  const enrollMutation = useMutation({
    mutationFn: () => coursesService.enrollWithTeacher({
      preferredTeacherId: selectedTeacherId,
      subjects: selectedSubjects,
    }),
    onSuccess: () => {
      setSelectedSubjects([])
      setSelectedTeacherId('')
      setEnrollError('')
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] })
    },
    onError: (err: Error) => {
      setEnrollError(err.message)
    },
  })

  const handleSubjectToggle = (subject: 'mathematics' | 'programming') => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
    setSelectedTeacherId('')
    setEnrollError('')
  }

  const handleEnroll = () => {
    if (selectedSubjects.length === 0) {
      setEnrollError('Please select at least one subject')
      return
    }
    if (!selectedTeacherId) {
      setEnrollError('Please select a teacher')
      return
    }
    enrollMutation.mutate()
  }

  return (
    <div className="space-y-10">
      {/* My Courses */}
      <div>
        <PageHeader title="My Courses" subtitle="Track your progress across all enrolled courses" />
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : !courses?.length ? (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="No courses yet"
            description="Use the form below to enrol in new courses with your preferred teacher."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {courses.map(c => <CourseCard key={c.id} course={c} linkBase="/dashboard/courses" />)}
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
              Select subjects and a teacher to automatically enrol in available courses.
            </p>
          </div>
        </div>

        {enrollError && (
          <Alert type="error" message={enrollError} onClose={() => setEnrollError('')} />
        )}

        {enrollMutation.isSuccess && (
          <Alert
            type="success"
            message={`Successfully enrolled in new course(s) with ${enrollMutation.data.teacherName}.`}
            onClose={() => enrollMutation.reset()}
          />
        )}

        <div className="space-y-5">
          {/* Subject selection */}
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Subjects <span className="ml-1 text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {subjects.map(subject => {
                const isSelected = selectedSubjects.includes(subject.value)
                return (
                  <label
                    key={subject.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-brand-blue bg-white text-brand-navy dark:bg-surface-dark dark:text-white'
                        : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSubjectToggle(subject.value)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        isSelected
                          ? 'border-brand-blue bg-brand-blue text-white'
                          : 'border-gray-300'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    {subject.label}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Teacher selection */}
          <div className="flex flex-col gap-1.5 max-w-sm">
            <label htmlFor="new-course-teacher" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Preferred Teacher <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              id="new-course-teacher"
              value={selectedTeacherId}
              onChange={e => { setSelectedTeacherId(e.target.value); setEnrollError('') }}
              disabled={selectedSubjects.length === 0 || teachersLoading}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 shadow-sm focus:border-brand-blue focus:outline-none disabled:opacity-50 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100"
            >
              <option value="">
                {teachersLoading
                  ? 'Loading teachers…'
                  : selectedSubjects.length === 0
                    ? 'Select subject(s) first'
                    : eligibleTeachers.length === 0
                      ? 'No teacher matches all selected subjects'
                      : 'Select a teacher'}
              </option>
              <option value="auto">Match me with any available teacher</option>
              {eligibleTeachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} — {teacher.subjects.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <Button
            onClick={handleEnroll}
            loading={enrollMutation.isPending}
            disabled={selectedSubjects.length === 0 || !selectedTeacherId}
          >
            {enrollMutation.isPending ? 'Enrolling…' : 'Enrol Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}