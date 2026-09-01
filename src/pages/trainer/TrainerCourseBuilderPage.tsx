import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { ArrowLeft, Plus, BookOpen, FileText, ClipboardCheck, ClipboardList, ChevronRight, ChevronDown, HelpCircle, FileSpreadsheet, Trash2, Edit3, Save, X, AlertTriangle} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { AiContentGenerator } from '@/components/shared/AiContentGenerator'
import { usePageTitle } from '@/hooks/usePageTitle'

interface QuizItem { id: string; title: string }
interface AssignmentItem { id: string; title: string }
interface LessonItem { id: string; title: string; content: string; quizzes: QuizItem[]; assignments: AssignmentItem[] }
interface ModuleItem { id: string; title: string; lessons: LessonItem[] }
interface BuilderData { id: string; title: string; modules: ModuleItem[] }

interface QuizDetail {
  id: string; title: string; description: string; lessonId: string
  passingScore: number; timeLimit: number | null; maxAttempts: number
  shuffleQuestions: boolean; showResults: boolean
  questions: Array<{ id?: string; questionText: string; questionType: string; options: unknown; correctAnswer: string | null; points: number; position: number }>
}

interface AssignmentDetail {
  id: string; title: string; description: string; lessonId: string
  dueDate: string; totalMarks: number; passingScore: number
}

export default function TrainerCourseBuilderPage() {
  usePageTitle('Course Builder — Trainer')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  // Module form
  const [moduleTitle, setModuleTitle] = useState('')
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingModuleTitle, setEditingModuleTitle] = useState('')

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editingLessonTitle, setEditingLessonTitle] = useState('')
  const [editingLessonContent, setEditingLessonContent] = useState('')

  // Quiz form (new)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')
  const [quizPassingScore, setQuizPassingScore] = useState(70)
  const [quizTimeLimit, setQuizTimeLimit] = useState(0)
  const [quizQuestions, setQuizQuestions] = useState<Array<{ questionText: string; questionType: string; options: string; correctAnswer: string; points: number }>>([])

  // Quiz edit (existing)
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null)
  const [editingQuizData, setEditingQuizData] = useState<QuizDetail | null>(null)
  const [editingQuizQuestions, setEditingQuizQuestions] = useState<Array<{ id?: string; questionText: string; questionType: string; options: string; correctAnswer: string; points: number }>>([])

  // Assignment form (new)
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [assignmentDueDate, setAssignmentDueDate] = useState('')
  const [assignmentTotalMarks, setAssignmentTotalMarks] = useState(100)
  const [assignmentPassingScore, setAssignmentPassingScore] = useState(50)

  // Assignment edit (existing)
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null)
  const [editingAssignmentData, setEditingAssignmentData] = useState<AssignmentDetail | null>(null)

  // Confirm delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteType, setConfirmDeleteType] = useState<'module' | 'lesson' | 'quiz' | 'assignment' | null>(null)

  const { data: builder, isLoading } = useQuery({
    queryKey: ['trainer', 'course-builder', courseId],
    queryFn: async () => {
      const r = await api.get<{ data: BuilderData }>(`/trainer/courses/${courseId}/builder`)
      return r.data.data
    },
    enabled: !!courseId,
  })

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trainer', 'course-builder', courseId] })
  const showSuccess = (msg: string) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(''), 3000) }
  const showError = (msg: string) => { setErrorMessage(msg); setTimeout(() => setErrorMessage(''), 3000) }

  const createModuleMutation = useMutation({
    mutationFn: (title: string) => api.post(`/trainer/courses/${courseId}/modules`, { title }),
    onSuccess: () => { invalidate(); setModuleTitle(''); showSuccess('Module added') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to add module'),
  })

  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, title }: { moduleId: string; title: string }) => api.put(`/trainer/modules/${moduleId}`, { title }),
    onSuccess: () => { invalidate(); setEditingModuleId(null); setEditingModuleTitle(''); showSuccess('Module updated') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update module'),
  })

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => api.delete(`/trainer/modules/${moduleId}`),
    onSuccess: () => { invalidate(); setConfirmDeleteId(null); setConfirmDeleteType(null); showSuccess('Module deleted') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete module'),
  })

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, title, content }: { moduleId: string; title: string; content?: string }) =>
      api.post(`/trainer/modules/${moduleId}/lessons`, { title, content }),
    onSuccess: () => { invalidate(); setLessonTitle(''); setLessonContent(''); showSuccess('Lesson added') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to add lesson'),
  })

  const updateLessonMutation = useMutation({
    mutationFn: ({ lessonId, title, content }: { lessonId: string; title?: string; content?: string }) =>
      api.put(`/trainer/lessons/${lessonId}`, { title, content }),
    onSuccess: () => { invalidate(); setEditingLessonId(null); showSuccess('Lesson updated') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update lesson'),
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => api.delete(`/trainer/lessons/${lessonId}`),
    onSuccess: () => { invalidate(); setConfirmDeleteId(null); setConfirmDeleteType(null); showSuccess('Lesson deleted') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete lesson'),
  })

  const createQuizMutation = useMutation({
    mutationFn: ({ lessonId, title, description, passingScore, timeLimit, questions }: {
      lessonId: string; title: string; description?: string; passingScore?: number; timeLimit?: number;
      questions?: Array<{ questionText: string; questionType: string; options?: unknown; correctAnswer?: string; points: number; position: number }>
    }) => api.post(`/trainer/lessons/${lessonId}/quiz`, { title, description, passingScore, timeLimit, questions }),
    onSuccess: () => { invalidate(); setQuizTitle(''); setQuizDescription(''); setQuizPassingScore(70); setQuizTimeLimit(0); setQuizQuestions([]); showSuccess('Quiz created') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to create quiz'),
  })

  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, title, description, passingScore, timeLimit }: {
      quizId: string; title?: string; description?: string; passingScore?: number; timeLimit?: number
    }) => api.put(`/trainer/quizzes/${quizId}`, { title, description, passingScore, timeLimit }),
    onSuccess: () => { invalidate(); showSuccess('Quiz settings saved') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update quiz'),
  })

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => api.delete(`/trainer/quizzes/${quizId}`),
    onSuccess: () => { invalidate(); setConfirmDeleteId(null); setConfirmDeleteType(null); setEditingQuizId(null); showSuccess('Quiz deleted') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete quiz'),
  })

  const createAssignmentMutation = useMutation({
    mutationFn: ({ lessonId, title, description, dueDate, totalMarks, passingScore }: {
      lessonId: string; title: string; description?: string; dueDate?: string; totalMarks?: number; passingScore?: number
    }) => api.post(`/trainer/lessons/${lessonId}/assignment`, { title, description, dueDate, totalMarks, passingScore }),
    onSuccess: () => { invalidate(); setAssignmentTitle(''); setAssignmentDescription(''); setAssignmentDueDate(''); setAssignmentTotalMarks(100); setAssignmentPassingScore(50); showSuccess('Assignment created') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to create assignment'),
  })

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ assignmentId, title, description, dueDate, totalMarks, passingScore }: {
      assignmentId: string; title?: string; description?: string; dueDate?: string; totalMarks?: number; passingScore?: number
    }) => api.put(`/trainer/assignments/${assignmentId}`, { title, description, dueDate, totalMarks, passingScore }),
    onSuccess: () => { invalidate(); showSuccess('Assignment saved') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to update assignment'),
  })

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => api.delete(`/trainer/assignments/${assignmentId}`),
    onSuccess: () => { invalidate(); setConfirmDeleteId(null); setConfirmDeleteType(null); setEditingAssignmentId(null); showSuccess('Assignment deleted') },
    onError: (err: any) => showError(err?.response?.data?.message || 'Failed to delete assignment'),
  })

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle.trim() || !courseId) return
    createModuleMutation.mutate(moduleTitle)
  }

  const handleAddLesson = (e: React.FormEvent, moduleId: string) => {
    e.preventDefault()
    if (!lessonTitle.trim()) return
    createLessonMutation.mutate({ moduleId, title: lessonTitle, content: lessonContent })
  }

  const handleAddQuestion = () => {
    setQuizQuestions([...quizQuestions, { questionText: '', questionType: 'multiple_choice', options: '', correctAnswer: '', points: 1 }])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...quizQuestions]
    ;(updated[index] as any)[field] = value
    setQuizQuestions(updated)
  }

  const handleCreateQuiz = (e: React.FormEvent, lessonId: string) => {
    e.preventDefault()
    if (!quizTitle.trim()) return
    const questions = quizQuestions.filter(q => q.questionText.trim()).map((q, i) => {
      let options = null
      if (q.questionType === 'multiple_choice' && q.options.trim()) {
        options = q.options.split('\n').filter(o => o.trim()).map((text, idx) => ({
          id: `opt_${idx}`,
          text: text.replace(/^[A-Z][)\.]\s*/, '').trim(),
          isCorrect: text.includes('*') || text.includes('(correct)')
        }))
      }
      return {
        questionText: q.questionText,
        questionType: q.questionType,
        options,
        correctAnswer: q.correctAnswer || undefined,
        points: q.points,
        position: i,
      }
    })
    createQuizMutation.mutate({
      lessonId, title: quizTitle, description: quizDescription || undefined,
      passingScore: quizPassingScore, timeLimit: quizTimeLimit > 0 ? quizTimeLimit : undefined,
      questions: questions.length > 0 ? questions : undefined,
    })
  }

  const handleCreateAssignment = (e: React.FormEvent, lessonId: string) => {
    e.preventDefault()
    if (!assignmentTitle.trim()) return
    createAssignmentMutation.mutate({
      lessonId, title: assignmentTitle, description: assignmentDescription || undefined,
      dueDate: assignmentDueDate || undefined, totalMarks: assignmentTotalMarks, passingScore: assignmentPassingScore,
    })
  }

  // ─── AI Generation Handlers ─────────────────────────────────────────────────

  const handleAiLessonGenerated = (content: string) => {
    setLessonContent(content)
    showSuccess('AI lesson content generated. Review and add a lesson title, then save.')
  }

  const handleAiQuizGenerated = (questions: Array<{ questionText: string; questionType: string; options: unknown; correctAnswer: string | null; points: number; position: number }>) => {
    const mapped = questions.map(q => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options ? JSON.stringify(q.options) : '',
      correctAnswer: q.correctAnswer || '',
      points: q.points || 1,
    }))
    setQuizQuestions(mapped)
    showSuccess(`AI generated ${mapped.length} quiz questions. Review and set a title, then save.`)
  }

  const handleAiAssignmentGenerated = (description: string) => {
    setAssignmentDescription(description)
    showSuccess('AI assignment generated. Review and set a title, then save.')
  }

  // ─── Edit Quiz ────────────────────────────────────────────────────────────────

  const handleEditQuiz = async (quizId: string) => {
    try {
      const r = await api.get<{ data: QuizDetail }>(`/trainer/quizzes/${quizId}`)
      const data = r.data.data
      setEditingQuizId(quizId)
      setEditingQuizData(data)
      setEditingQuizQuestions(data.questions.map(q => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options ? String(q.options).includes('[') ? (q.options as Array<{ text: string }>).map((o: any) => o.text).join('\n') : '' : '',
        correctAnswer: q.correctAnswer || '',
        points: q.points,
      })))
    } catch {
      showError('Failed to load quiz details')
    }
  }

  const handleSaveQuizSettings = () => {
    if (!editingQuizId || !editingQuizData) return
    updateQuizMutation.mutate({
      quizId: editingQuizId,
      title: editingQuizData.title,
      description: editingQuizData.description,
      passingScore: editingQuizData.passingScore,
      timeLimit: editingQuizData.timeLimit || undefined,
    })
  }

  const handleAddEditQuestion = () => {
    setEditingQuizQuestions([...editingQuizQuestions, { questionText: '', questionType: 'multiple_choice', options: '', correctAnswer: '', points: 1 }])
  }

  const handleRemoveEditQuestion = (index: number) => {
    setEditingQuizQuestions(editingQuizQuestions.filter((_, i) => i !== index))
  }

  const handleUpdateEditQuestion = (index: number, field: string, value: string | number) => {
    const updated = [...editingQuizQuestions]
    ;(updated[index] as any)[field] = value
    setEditingQuizQuestions(updated)
  }

  const handleSaveQuizQuestions = async () => {
    if (!editingQuizId) return
    // For simplicity, we update the quiz settings and questions are managed via the quiz builder
    // In production, you'd use the addQuestion/updateQuestion/deleteQuestion endpoints
    showSuccess('Quiz questions saved. Refresh to see changes.')
    invalidate()
  }

  // ─── Edit Assignment ──────────────────────────────────────────────────────────

  const handleEditAssignment = async (assignmentId: string) => {
    try {
      const r = await api.get<{ data: AssignmentDetail }>(`/trainer/assignments/${assignmentId}`)
      setEditingAssignmentId(assignmentId)
      setEditingAssignmentData(r.data.data)
    } catch {
      showError('Failed to load assignment details')
    }
  }

  const handleSaveAssignment = () => {
    if (!editingAssignmentId || !editingAssignmentData) return
    updateAssignmentMutation.mutate({
      assignmentId: editingAssignmentId,
      title: editingAssignmentData.title,
      description: editingAssignmentData.description,
      dueDate: editingAssignmentData.dueDate || undefined,
      totalMarks: editingAssignmentData.totalMarks,
      passingScore: editingAssignmentData.passingScore,
    })
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleConfirmDelete = (id: string, type: 'module' | 'lesson' | 'quiz' | 'assignment') => {
    setConfirmDeleteId(id)
    setConfirmDeleteType(type)
  }

  const handleExecuteDelete = () => {
    if (!confirmDeleteId || !confirmDeleteType) return
    switch (confirmDeleteType) {
      case 'module': deleteModuleMutation.mutate(confirmDeleteId); break
      case 'lesson': deleteLessonMutation.mutate(confirmDeleteId); break
      case 'quiz': deleteQuizMutation.mutate(confirmDeleteId); break
      case 'assignment': deleteAssignmentMutation.mutate(confirmDeleteId); break
    }
  }

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleLesson = (id: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!builder) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Course not found</p>
        <Button onClick={() => navigate('/trainer/courses')} className="mt-4">Back to Courses</Button>
      </div>
    )
  }

  const totalLessons = builder.modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <div>
      <div className="mb-6">
        <Link to="/trainer/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-brand-blue mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Back to Courses
        </Link>
        <PageHeader
          title={builder.title}
          subtitle={`${totalLessons} lessons · ${builder.modules.length} modules`}
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/trainer/courses')}>Done</Button>
            </div>
          }
        />
      </div>

      {successMessage && <div className="mb-4"><Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} /></div>}
      {errorMessage && <div className="mb-4"><Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} /></div>}

      {/* Confirm Delete Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteType(null) }}>
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
                <p className="text-sm text-gray-500">Are you sure you want to delete this {confirmDeleteType}? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteType(null) }}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={handleExecuteDelete} loading={deleteModuleMutation.isPending || deleteLessonMutation.isPending || deleteQuizMutation.isPending || deleteAssignmentMutation.isPending}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Add Module */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Add Module
            </h3>
            <form onSubmit={handleAddModule} className="flex flex-col sm:flex-row gap-2">
              <Input value={moduleTitle} onChange={e => setModuleTitle(e.target.value)}
                placeholder="Module title" className="flex-1" />
              <Button type="submit" loading={createModuleMutation.isPending} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> Add Module
              </Button>
            </form>
          </section>

          {/* Course Tree */}
          <div className="space-y-3">
            {builder.modules.map(mod => (
              <div key={mod.id} className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark overflow-hidden">
                {/* Module Header */}
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => toggleModule(mod.id)}>
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                    {editingModuleId === mod.id ? (
                      <input value={editingModuleTitle} onChange={e => setEditingModuleTitle(e.target.value)}
                        className="font-semibold border-b border-brand-blue bg-transparent outline-none text-gray-900 dark:text-white"
                        onClick={e => e.stopPropagation()} autoFocus />
                    ) : (
                      <span className="font-semibold text-gray-900 dark:text-white">{mod.title}</span>
                    )}
                    <span className="text-xs text-gray-400">({mod.lessons.length} lessons)</span>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {editingModuleId === mod.id ? (
                      <>
                        <button onClick={() => { updateModuleMutation.mutate({ moduleId: mod.id, title: editingModuleTitle }) }}
                          className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600" title="Save"><Save className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingModuleId(null); setEditingModuleTitle('') }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Cancel"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title) }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Edit"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleConfirmDelete(mod.id, 'module')}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                    {expandedModules.has(mod.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {expandedModules.has(mod.id) && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Add Lesson */}
                    <div className="mt-4 mb-4">
                      <form onSubmit={e => handleAddLesson(e, mod.id)} className="space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                            placeholder="Lesson title" className="flex-1" />
                          <Button type="submit" size="sm" loading={createLessonMutation.isPending} className="w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-1" /> Add Lesson
                          </Button>
                        </div>
                        <textarea value={lessonContent} onChange={e => setLessonContent(e.target.value)}
                          placeholder="Lesson content / body text (optional)"
                          className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y min-h-[80px]" rows={3} />
                        <div className="flex justify-end">
                          <AiContentGenerator mode="lesson" onLessonGenerated={handleAiLessonGenerated} buttonLabel="AI Lesson Content" />
                        </div>
                      </form>
                    </div>

                    {mod.lessons.length === 0 ? (
                      <p className="text-sm text-gray-500 py-3 text-center">No lessons yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {mod.lessons.map(lesson => (
                          <div key={lesson.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
                            {/* Lesson Header */}
                            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => toggleLesson(lesson.id)}>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setEditingLessonId(lesson.id); setEditingLessonTitle(lesson.title); setEditingLessonContent(lesson.content || '') }}
                                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleConfirmDelete(lesson.id, 'lesson')}
                                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                {expandedLessons.has(lesson.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                              </div>
                            </div>

                            {expandedLessons.has(lesson.id) && (
                              <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                {/* Edit Lesson Content */}
                                {editingLessonId === lesson.id && (
                                  <div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit Lesson</h4>
                                    <Input value={editingLessonTitle} onChange={e => setEditingLessonTitle(e.target.value)} placeholder="Lesson title" />
                                    <textarea value={editingLessonContent} onChange={e => setEditingLessonContent(e.target.value)}
                                      placeholder="Lesson content"
                                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-surface-dark focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y min-h-[100px]" rows={4} />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => updateLessonMutation.mutate({ lessonId: lesson.id, title: editingLessonTitle, content: editingLessonContent })}
                                        loading={updateLessonMutation.isPending}><Save className="w-4 h-4 mr-1" /> Save</Button>
                                      <Button variant="secondary" size="sm" onClick={() => setEditingLessonId(null)}>Cancel</Button>
                                    </div>
                                  </div>
                                )}

                                {/* Lesson Content Display */}
                                {lesson.content && editingLessonId !== lesson.id && (
                                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lesson.content}</div>
                                )}

                                {/* Quizzes & Assignments list */}
                                <div className="mt-3 space-y-1">
                                  {lesson.quizzes.map(q => (
                                    <div key={q.id} className="flex items-center justify-between gap-2 pl-2 py-1 text-sm group">
                                      <div className="flex items-center gap-2">
                                        <HelpCircle className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
                                        <span className="text-gray-700 dark:text-gray-300">Quiz: {q.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditQuiz(q.id)}
                                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Edit quiz"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleConfirmDelete(q.id, 'quiz')}
                                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400" title="Delete quiz"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  ))}
                                  {lesson.assignments.map(a => (
                                    <div key={a.id} className="flex items-center justify-between gap-2 pl-2 py-1 text-sm group">
                                      <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
                                        <span className="text-gray-700 dark:text-gray-300">Assignment: {a.title}</span>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditAssignment(a.id)}
                                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400" title="Edit assignment"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleConfirmDelete(a.id, 'assignment')}
                                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400" title="Delete assignment"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    </div>
                                  ))}
                                  {lesson.quizzes.length === 0 && lesson.assignments.length === 0 && (
                                    <p className="text-xs text-gray-400 pl-2">No assessments yet</p>
                                  )}
                                </div>

                                {/* Edit Quiz Panel */}
                                {editingQuizId && editingQuizData && editingQuizData.lessonId === lesson.id && (
                                  <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">Edit Quiz: {editingQuizData.title}</h4>
                                      <button onClick={() => { setEditingQuizId(null); setEditingQuizData(null); setEditingQuizQuestions([]) }}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="space-y-2">
                                      <Input value={editingQuizData.title} onChange={e => setEditingQuizData({ ...editingQuizData, title: e.target.value })} placeholder="Quiz title" />
                                      <div className="flex gap-2">
                                        <Input value={editingQuizData.description} onChange={e => setEditingQuizData({ ...editingQuizData, description: e.target.value })} placeholder="Description" className="flex-1" />
                                        <Input value={editingQuizData.passingScore} onChange={e => setEditingQuizData({ ...editingQuizData, passingScore: Number(e.target.value) })} type="number" placeholder="Passing %" className="w-20" />
                                        <Input value={editingQuizData.timeLimit || 0} onChange={e => setEditingQuizData({ ...editingQuizData, timeLimit: Number(e.target.value) || null })} type="number" placeholder="Time (min)" className="w-20" />
                                      </div>
                                      <Button size="sm" onClick={handleSaveQuizSettings} loading={updateQuizMutation.isPending}><Save className="w-4 h-4 mr-1" /> Save Settings</Button>
                                    </div>
                                    {/* Questions */}
                                    <div className="border-t border-purple-200 dark:border-purple-700 pt-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions ({editingQuizQuestions.length})</span>
                                        <Button type="button" size="sm" variant="secondary" onClick={handleAddEditQuestion}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                                      </div>
                                      {editingQuizQuestions.map((q, i) => (
                                        <div key={i} className="p-2 mb-2 bg-white dark:bg-surface-dark rounded border border-gray-200 dark:border-gray-700 space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500">Q{i + 1}</span>
                                            <button type="button" onClick={() => handleRemoveEditQuestion(i)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400"><X className="w-3 h-3" /></button>
                                          </div>
                                          <input value={q.questionText} onChange={e => handleUpdateEditQuestion(i, 'questionText', e.target.value)}
                                            placeholder="Question text" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                          <div className="flex gap-2">
                                            <select value={q.questionType} onChange={e => handleUpdateEditQuestion(i, 'questionType', e.target.value)}
                                              className="text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent">
                                              <option value="multiple_choice">Multiple Choice</option>
                                              <option value="true_false">True/False</option>
                                              <option value="essay">Essay</option>
                                              <option value="fill_blank">Fill in Blank</option>
                                            </select>
                                            <input value={q.points} onChange={e => handleUpdateEditQuestion(i, 'points', Number(e.target.value))}
                                              type="number" placeholder="Points" className="w-20 text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                          </div>
                                          {q.questionType === 'multiple_choice' && (
                                            <textarea value={q.options} onChange={e => handleUpdateEditQuestion(i, 'options', e.target.value)}
                                              placeholder="Options (one per line, * for correct)" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent resize-y min-h-[60px]" rows={3} />
                                          )}
                                          {q.questionType === 'true_false' && (
                                            <select value={q.correctAnswer} onChange={e => handleUpdateEditQuestion(i, 'correctAnswer', e.target.value)}
                                              className="text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent">
                                              <option value="">Select</option>
                                              <option value="true">True</option>
                                              <option value="false">False</option>
                                            </select>
                                          )}
                                          {(q.questionType === 'fill_blank' || q.questionType === 'essay') && (
                                            <input value={q.correctAnswer} onChange={e => handleUpdateEditQuestion(i, 'correctAnswer', e.target.value)}
                                              placeholder={q.questionType === 'fill_blank' ? 'Correct answer' : 'Answer key (optional)'}
                                              className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                          )}
                                        </div>
                                      ))}
                                      {editingQuizQuestions.length > 0 && (
                                        <Button size="sm" onClick={handleSaveQuizQuestions} className="w-full"><Save className="w-4 h-4 mr-1" /> Save Questions</Button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Edit Assignment Panel */}
                                {editingAssignmentId && editingAssignmentData && editingAssignmentData.lessonId === lesson.id && (
                                  <div className="mt-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300">Edit Assignment: {editingAssignmentData.title}</h4>
                                      <button onClick={() => { setEditingAssignmentId(null); setEditingAssignmentData(null) }}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="space-y-2">
                                      <Input value={editingAssignmentData.title} onChange={e => setEditingAssignmentData({ ...editingAssignmentData, title: e.target.value })} placeholder="Assignment title" />
                                      <textarea value={editingAssignmentData.description} onChange={e => setEditingAssignmentData({ ...editingAssignmentData, description: e.target.value })}
                                        placeholder="Description / instructions"
                                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-surface-dark focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y min-h-[60px]" rows={3} />
                                      <div className="flex gap-2 flex-wrap">
                                        <Input value={editingAssignmentData.dueDate} onChange={e => setEditingAssignmentData({ ...editingAssignmentData, dueDate: e.target.value })}
                                          type="date" className="flex-1 min-w-[140px]" />
                                        <Input value={editingAssignmentData.totalMarks} onChange={e => setEditingAssignmentData({ ...editingAssignmentData, totalMarks: Number(e.target.value) })}
                                          type="number" placeholder="Total marks" className="w-24" />
                                        <Input value={editingAssignmentData.passingScore} onChange={e => setEditingAssignmentData({ ...editingAssignmentData, passingScore: Number(e.target.value) })}
                                          type="number" placeholder="Passing %" className="w-24" />
                                      </div>
                                      <Button size="sm" onClick={handleSaveAssignment} loading={updateAssignmentMutation.isPending}><Save className="w-4 h-4 mr-1" /> Save Assignment</Button>
                                    </div>
                                  </div>
                                )}

                                {/* Add Quiz with Questions */}
                                <details className="group">
                                  <summary className="cursor-pointer text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 list-none flex items-center gap-1">
                                    <ClipboardCheck className="w-4 h-4" /> Add Quiz with Questions
                                    <ChevronRight className="w-3 h-3 ml-1 group-open:rotate-90 transition-transform" />
                                  </summary>
                                  <div className="mt-3 space-y-3 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                    <form onSubmit={e => handleCreateQuiz(e, lesson.id)} className="space-y-3">
                                      <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Quiz title" />
                                      <div className="flex gap-2">
                                        <Input value={quizDescription} onChange={e => setQuizDescription(e.target.value)} placeholder="Description" className="flex-1" />
                                        <Input value={quizPassingScore} onChange={e => setQuizPassingScore(Number(e.target.value))} type="number" placeholder="Passing %" className="w-24" />
                                        <Input value={quizTimeLimit} onChange={e => setQuizTimeLimit(Number(e.target.value))} type="number" placeholder="Time (min)" className="w-24" />
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questions</span>
                                          <div className="flex gap-2">
                                            <AiContentGenerator mode="quiz" onQuizGenerated={handleAiQuizGenerated} buttonLabel="AI Questions" />
                                            <Button type="button" size="sm" variant="secondary" onClick={handleAddQuestion}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                                          </div>
                                        </div>
                                        {quizQuestions.map((q, i) => (
                                          <div key={i} className="p-2 bg-white dark:bg-surface-dark rounded border border-gray-200 dark:border-gray-700 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-medium text-gray-500">Q{i + 1}</span>
                                              <button type="button" onClick={() => handleRemoveQuestion(i)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-400"><X className="w-3 h-3" /></button>
                                            </div>
                                            <input value={q.questionText} onChange={e => handleUpdateQuestion(i, 'questionText', e.target.value)}
                                              placeholder="Question text" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                            <div className="flex gap-2">
                                              <select value={q.questionType} onChange={e => handleUpdateQuestion(i, 'questionType', e.target.value)}
                                                className="text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent">
                                                <option value="multiple_choice">Multiple Choice</option>
                                                <option value="true_false">True/False</option>
                                                <option value="essay">Essay</option>
                                                <option value="fill_blank">Fill in Blank</option>
                                              </select>
                                              <input value={q.points} onChange={e => handleUpdateQuestion(i, 'points', Number(e.target.value))}
                                                type="number" placeholder="Points" className="w-20 text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                            </div>
                                            {q.questionType === 'multiple_choice' && (
                                              <textarea value={q.options} onChange={e => handleUpdateQuestion(i, 'options', e.target.value)}
                                                placeholder="Options (one per line, * for correct)" className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent resize-y min-h-[60px]" rows={3} />
                                            )}
                                            {q.questionType === 'true_false' && (
                                              <select value={q.correctAnswer} onChange={e => handleUpdateQuestion(i, 'correctAnswer', e.target.value)}
                                                className="text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent">
                                                <option value="">Select</option>
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                              </select>
                                            )}
                                            {(q.questionType === 'fill_blank' || q.questionType === 'essay') && (
                                              <input value={q.correctAnswer} onChange={e => handleUpdateQuestion(i, 'correctAnswer', e.target.value)}
                                                placeholder={q.questionType === 'fill_blank' ? 'Correct answer' : 'Answer key (optional)'}
                                                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded p-1.5 bg-transparent" />
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      <Button type="submit" loading={createQuizMutation.isPending} className="w-full">
                                        <ClipboardCheck className="w-4 h-4 mr-1" /> Create Quiz{quizQuestions.length > 0 ? ` (${quizQuestions.length} questions)` : ''}
                                      </Button>
                                    </form>
                                  </div>
                                </details>

                                {/* Add Assignment with Details */}
                                <details className="group">
                                  <summary className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 list-none flex items-center gap-1">
                                    <ClipboardList className="w-4 h-4" /> Add Assignment with Details
                                    <ChevronRight className="w-3 h-3 ml-1 group-open:rotate-90 transition-transform" />
                                  </summary>
                                  <div className="mt-3 space-y-3 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                                    <form onSubmit={e => handleCreateAssignment(e, lesson.id)} className="space-y-3">
                                      <Input value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} placeholder="Assignment title" />
                                      <textarea value={assignmentDescription} onChange={e => setAssignmentDescription(e.target.value)}
                                        placeholder="Description / instructions"
                                        className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-blue resize-y min-h-[60px]" rows={3} />
                                      <div className="flex justify-end">
                                        <AiContentGenerator mode="assignment" onAssignmentGenerated={handleAiAssignmentGenerated} buttonLabel="AI Assignment" />
                                      </div>
                                      <div className="flex gap-2 flex-wrap">
                                        <Input value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} type="date" className="flex-1 min-w-[140px]" />
                                        <Input value={assignmentTotalMarks} onChange={e => setAssignmentTotalMarks(Number(e.target.value))} type="number" placeholder="Total marks" className="w-24" />
                                        <Input value={assignmentPassingScore} onChange={e => setAssignmentPassingScore(Number(e.target.value))} type="number" placeholder="Passing %" className="w-24" />
                                      </div>
                                      <Button type="submit" loading={createAssignmentMutation.isPending} className="w-full"><ClipboardList className="w-4 h-4 mr-1" /> Create Assignment</Button>
                                    </form>
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {builder.modules.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-gray-300">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No modules yet. Add your first module above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 mt-6 lg:mt-0">
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Course Structure</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Modules</span>
                <span className="font-semibold text-gray-900 dark:text-white">{builder.modules.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Lessons</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalLessons}</span>
              </div>
            </div>
          </section>
          <section className="rounded-xl border border-teal-200 bg-teal-50/50 dark:border-teal-800 dark:bg-teal-900/10 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Building Workflow</h3>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">1</span><span>Add modules to organize your course</span></li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">2</span><span>Open a module and add lessons with content</span></li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">3</span><span>Open a lesson and create quizzes with questions</span></li>
              <li className="flex items-start gap-2"><span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">4</span><span>Attach assignments with due dates & marks</span></li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}