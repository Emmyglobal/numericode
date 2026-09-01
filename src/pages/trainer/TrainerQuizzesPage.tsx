import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quizzesService, type Quiz, type QuizQuestionInput } from '@/services/quizzes.service'
import { coursesService } from '@/services/courses.service'
import { api } from '@/lib/axios'
import { QuestionFileUpload } from '@/components/shared/QuestionFileUpload'
import { toQuizQuestions, countObjective, type ImportedQuestion } from '@/utils/questionImport'

import { PageHeader } from '@/components/shared/PageHeader'
import { AiContentGenerator } from '@/components/shared/AiContentGenerator'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Plus, Trash2, ClipboardList, X, Sparkles, Lock } from 'lucide-react'
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionInput[]>([])
  const [questionsNote, setQuestionsNote] = useState('')

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
    mutationFn: (data?: {
      courseId: string; title: string; description?: string; timeLimit?: number; passingScore?: number;
      maxAttempts?: number; shuffleQuestions?: boolean; showResults?: boolean;
      questions?: Array<{ questionText: string; questionType: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'; options?: unknown; correctAnswer?: string; points: number; position: number }>
    }) =>
      quizzesService.create(data ?? {
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
    setQuizQuestions([])
    setQuestionsNote('')
  }

    // Which quiz (if any) currently gates each course as its prerequisite.
  const { data: prereqMap } = useQuery({
    queryKey: ['trainer-prereq-map'],
    queryFn: async () => {
      const map: Record<string, string | null> = {}
      for (const course of courses ?? []) {
        try {
          map[course.id] = (await coursesService.getPrerequisiteQuiz(course.id)).prerequisiteQuizId
        } catch {
          map[course.id] = null
        }
      }
      return map
    },
    enabled: Boolean(courses),
  })

  // Attach/detach a course-level prerequisite quiz. Passing students must score
  // at least the quiz's passing mark before the course lessons unlock.
  const togglePrereq = useMutation({
    mutationFn: ({ quiz, detach }: { quiz: Quiz; detach: boolean }) =>
      coursesService.setPrerequisiteQuiz(quiz.courseId, detach ? null : quiz.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['trainer-prereq-map'] })
      setSuccessMessage(result.message ?? 'Prerequisite quiz updated.')
    },
  })

  const openCreate = () => {
    resetForm()
    if (courses && courses.length > 0) setCourseId(courses[0].id)
    setShowCreateModal(true)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !quizTitle.trim()) return
    createMutation.mutate({
      courseId,
      title: quizTitle,
      description,
      timeLimit: timeLimit ? Number(timeLimit) : undefined,
      passingScore: passingScore ? Number(passingScore) : 70,
      maxAttempts: 1,
      shuffleQuestions: false,
      showResults: true,
      questions: quizQuestions,
    })
  }

  const handleUploadedQuestions = (imported: ImportedQuestion[]) => {
    const mapped = toQuizQuestions(imported)
    setQuizQuestions(mapped)
    const objective = countObjective(imported)
    setQuestionsNote(
      `${mapped.length} question${mapped.length === 1 ? '' : 's'} loaded from the file` +
      ` — ${objective} objective ${objective === 1 ? 'question is' : 'questions are'} auto-graded. Review and click Create Quiz.`
    )
  }

  const handleAiQuizGenerated = (questions: Array<{ questionText: string; questionType: string; options: unknown; correctAnswer: string | null; points: number; position: number }>) => {
    const mapped = questions.map(q => ({
      questionText: q.questionText,
      questionType: q.questionType as 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank',
      options: q.options || undefined,
      correctAnswer: q.correctAnswer || undefined,
      points: q.points || 1,
      position: q.position,
    }))
    setQuizQuestions(mapped)
    setQuestionsNote(`AI generated ${mapped.length} questions. Review them, then click Create Quiz.`)
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
                  {prereqMap?.[quiz.courseId] === quiz.id ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (confirm('Remove this quiz as the course prerequisite? Students will no longer need to pass it.')) {
                          togglePrereq.mutate({ quiz, detach: true })
                        }
                      }}
                      loading={togglePrereq.isPending}
                      title="This quiz currently gates the course. Click to remove the requirement."
                    >
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      Prerequisite ✓
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePrereq.mutate({ quiz, detach: false })}
                      loading={togglePrereq.isPending}
                      title="Require students to pass this quiz before the course lessons unlock."
                    >
                      Set as Prerequisite
                    </Button>
                  )}
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

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Questions</label>
                <div className="mt-2">
                  <QuestionFileUpload
                    onParsed={handleUploadedQuestions}
                    onCleared={() => { setQuizQuestions([]); setQuestionsNote('') }}
                  />
                </div>
                {quizQuestions.length > 0 && (
                  <p className="mt-2 text-xs text-brand-blue dark:text-brand-sky">
                    {quizQuestions.length} question{quizQuestions.length === 1 ? '' : 's'} loaded — objective questions are auto-graded for students.
                  </p>
                )}
              </div>

              {questionsNote && (
                <div className="flex items-center gap-2 text-xs text-teal dark:text-teal">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  <span>{questionsNote}</span>
                </div>
              )}

              <div className="flex justify-end">
                <AiContentGenerator mode="quiz" onQuizGenerated={handleAiQuizGenerated} buttonLabel="Generate with AI" />
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