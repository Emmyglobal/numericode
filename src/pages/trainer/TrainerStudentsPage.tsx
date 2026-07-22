import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { Search, Users, Monitor } from 'lucide-react'
import { api } from '@/lib/axios'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { LearningBoard } from '@/components/shared/LearningBoard'
import { Button } from '@/components/ui/Button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/utils/formatDate'
import type { TrainerStudent } from '@/features/trainer/types'

export default function TrainerStudentsPage() {
  usePageTitle('Students — Trainer')
  const [search, setSearch] = useState('')
  const q = useDebounce(search)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState('')

  const { data: students, isLoading } = useQuery({
    queryKey: ['trainer', 'students'],
    queryFn: async () => { const r = await api.get<{ data: TrainerStudent[] }>('/trainer/students'); return r.data.data }
  })

  const { data: lessons } = useQuery({
    queryKey: ['trainer', 'lessons'],
    queryFn: async () => (await api.get<{ data: { id: string; title: string; moduleTitle: string; courseTitle: string }[] }>('/trainer/lessons')).data.data,
    enabled: selectedStudent !== null,
  })

  const filtered = useMemo(() =>
    students?.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase())) ?? [],
    [students, q]
  )

  // If a student is selected, show their board
  if (selectedStudent) {
    const student = students?.find(s => s.id === selectedStudent)
    return (
      <div>
        <button onClick={() => { setSelectedStudent(null); setSelectedLessonId('') }}
          className="mb-4 text-sm text-teal hover:underline">&larr; Back to students</button>

        <PageHeader title={`${student?.name ?? 'Student'}'s Board`}
          subtitle="View the student's interactive lesson board to guide them during class." />

        {lessons && lessons.length > 0 ? (
          <>
            <label htmlFor="student-board-lesson" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Select a lesson to view the board
            </label>
            <select
              id="student-board-lesson"
              value={selectedLessonId}
              onChange={e => setSelectedLessonId(e.target.value)}
              className="mb-5 h-10 max-w-xl rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Choose a lesson…</option>
              {lessons.map(lesson => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.courseTitle} · {lesson.moduleTitle} · {lesson.title}
                </option>
              ))}
            </select>
            {selectedLessonId && (
              <LearningBoard key={`${selectedStudent}-${selectedLessonId}`} lessonId={selectedLessonId} mode="trainer" />
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No lessons available for your courses yet.</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Students" subtitle={`${students?.length ?? 0} students enrolled across your courses`} />
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" aria-label="Search students"
          className="w-full h-10 pl-9 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark text-sm focus:outline-none focus:border-teal dark:text-white placeholder:text-gray-400" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !filtered.length ? (
        <EmptyState icon={<Users className="w-16 h-16" />} title="No students found" description="Try adjusting your search." />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full" aria-label="Student list">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Student', 'Courses', 'Avg. Progress', 'Last Active', ''].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(s => {
                const avgProgress = Object.values(s.progress).reduce((a, b) => a + b, 0) / Math.max(Object.values(s.progress).length, 1)
                return (
                  <tr key={s.id} className="bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" className="bg-teal shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.enrolledCourses.length}</td>
                    <td className="px-4 py-3 w-40"><ProgressBar value={Math.round(avgProgress)} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(s.lastActive)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedStudent(s.id)}>
                        <Monitor className="w-3.5 h-3.5 mr-1" /> View Board
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}