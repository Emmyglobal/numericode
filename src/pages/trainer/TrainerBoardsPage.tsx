import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Palette } from 'lucide-react'
import { api } from '@/lib/axios'
import { LearningBoard } from '@/components/shared/LearningBoard'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePageTitle } from '@/hooks/usePageTitle'

type TrainerLesson = { id: string; title: string; moduleTitle: string; courseTitle: string }
export default function TrainerBoardsPage() {
  usePageTitle('Lesson Boards — Trainer')
  const { data: lessons } = useQuery({ queryKey: ['trainer', 'lessons'], queryFn: async () => (await api.get<{ data: TrainerLesson[] }>('/trainer/lessons')).data.data })
  const [lessonId, setLessonId] = useState('')
  const selectedId = lessonId || lessons?.[0]?.id
  return <div><PageHeader title="Lesson Boards" subtitle="Prepare an interactive board, share it with students, or lock it during a live class." />
    {!lessons?.length ? <EmptyState icon={<Palette className="h-16 w-16" />} title="No lessons yet" description="Add lessons to one of your courses before preparing a board." /> : <><label htmlFor="lesson-board" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Select lesson</label><select id="lesson-board" value={selectedId} onChange={event => setLessonId(event.target.value)} className="mb-5 h-10 max-w-xl rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-800"><>{lessons.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.courseTitle} · {lesson.moduleTitle} · {lesson.title}</option>)}</></select>{selectedId && <LearningBoard key={selectedId} lessonId={selectedId} mode="trainer" />}</>}
  </div>
}
