import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizzesService, type Quiz } from '@/services/quizzes.service'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Plus, Trash2, ClipboardList, X } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

interface TrainerCourse { id: string; title: string }

export default function TrainerQuizzesPage() {
  usePageTitle('Quizzes — Trainer')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const queryClient = useQueryClient()

  // Create form state
  const [courseId, setCourseId] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('')
  const [passingScore, setPassingScore] = useState('70')

  const { data: courses } = useQuery({
    queryKey: ['trainer', 'courses'],
    queryFn: async () => {
      const r = await api.get<{ data: TrainerCourse[] }>('/trainer/courses')
      return r.data.data
    },
  })

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['trainer-quizzes', courseId],
    queryFn: async () => {
      if (!courses || courses.length === 0) return [] as Quiz[]
      const results: Quiz[] = []
      for (const course of courses) {
        try {
          const courseQuizzes = await quizzesService.listByCourse(course.id)
          results.push(...courseQuizzes)
        } catch {
          // course might not have quizzes yet
        }
      }
      return results
    },
    enabled: Boolean(courses),
  })

  const createMutation = useMutation({
    mutationFn: () =>
      quizzesService.create({
        courseId,
        title: quizTitle,
        description,
        timeLimit: timeLimit ? Number(timeLimit) : undefined,
        passingScore: passingScore ? Number(passingScore) : 70,
        maxAttempts: 1,
        shuffleQuestions: false,
        showResults: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      setShowCreateModal(false)
      resetForm()
      setSuccessMessage('Quiz created successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (quizId: string) => quizzesService.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-quizzes'] })
      setSuccessMessage('Quiz deleted.')
    },
  })

  const resetForm = () => {
    setCourseId('')
    setQuizTitle('')
    setDescription('')
    setTimeLimit('')
    setPassingScore('70')
  }

  const openCreate = () => {
    resetForm()
    if (courses && courses.length > 0) setCourseId(courses[0].id)
    setShowCreateModal(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !quizTitle.trim()) return
    createMutation.mutate()
  }

  return (
    <div>
      <PageHeader
        title="Quiz Management"
        subtitle="Create and manage quizzes for your courses"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Create Quiz
          </Button>
        }
      />

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !quizzes?.length ? (
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quizzes yet</h3>
          <p className="text-gray-500">Create your first quiz to assess student learning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{quiz.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    {quiz.timeLimit && <span>Time: {quiz.timeLimit} min</span>}
                    <span>Questions: {quiz.questionCount}</span>
                    <span>Passing: {quiz.passingScore}%</span>
                    <span>Max Attempts: {quiz.maxAttempts}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this quiz?')) {
                        deleteMutation.mutate(quiz.id)
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Quiz</h2>
              <button onClick={() => setShowCreateModal(false)} aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course <span className="text-red-500">*</span></label>
                <select
                  required
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select a course…</option>
                  {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <Input label="Quiz Title" required value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="e.g. Algebra Quiz 1" />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Describe the quiz..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Time Limit (min)" type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="e.g. 30" />
                <Input label="Passing Score %" type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} placeholder="70" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending}>Create Quiz</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}