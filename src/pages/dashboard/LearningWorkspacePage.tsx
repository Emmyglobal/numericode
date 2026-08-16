import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Code2, LayoutPanelTop, Palette } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { LearningBoard } from '@/components/shared/LearningBoard'
import { CollaborativeCodeEditor } from '@/components/shared/CollaborativeCodeEditor'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { EnrolledCourse } from '@/features/courses/types'

export default function LearningWorkspacePage() {
  usePageTitle('Learning Workspace')
  const { data: courses, isLoading } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })
  const lessons = useMemo(() => courses?.flatMap(course => course.modules.flatMap(module =>
    module.lessons.map(lesson => ({ ...lesson, courseTitle: course.title, moduleTitle: module.title }))
  )) ?? [], [courses])
  const [chosenLessonId, setChosenLessonId] = useState('')
  const lessonId = chosenLessonId || lessons[0]?.id

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map(key => <Skeleton key={key} className="h-20 w-full" />)}</div>

  return (
    <div>
      <PageHeader title="Learning Workspace" subtitle="Use the live board and code editor for any lesson in your enrolled courses." />
      {!lessons.length ? (
        <EmptyState icon={<LayoutPanelTop className="h-16 w-16" />} title="No lessons available" description="Enroll in a course to start using the learning workspace." />
      ) : (
        <>
          <label htmlFor="workspace-lesson" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Select lesson</label>
          <select id="workspace-lesson" value={lessonId} onChange={event => setChosenLessonId(event.target.value)} className="mb-5 h-10 w-full max-w-2xl rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
            {lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.courseTitle} · {lesson.moduleTitle} · {lesson.title}</option>)}
          </select>
          <div className="mb-4 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-brand-blue dark:bg-blue-900/30"><Palette className="h-4 w-4" /> Interactive board</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200"><Code2 className="h-4 w-4" /> VS Code-style editor</span>
          </div>
          {lessonId && <LearningBoard key={`board-${lessonId}`} lessonId={lessonId} />}
          {lessonId && <CollaborativeCodeEditor key={`editor-${lessonId}`} lessonId={lessonId} />}
        </>
      )}
    </div>
  )
}
