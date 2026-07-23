import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { ArrowLeft, Plus, BookOpen, FileText, ClipboardCheck, ClipboardList, ChevronRight, ChevronDown, HelpCircle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'

interface QuizItem { id: string; title: string }
interface AssignmentItem { id: string; title: string }
interface LessonItem { id: string; title: string; quizzes: QuizItem[]; assignments: AssignmentItem[] }
interface ModuleItem { id: string; title: string; lessons: LessonItem[] }
interface BuilderData { id: string; title: string; modules: ModuleItem[] }

export default function AdminCourseBuilderPage() {
  usePageTitle('Course Builder — Admin')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())

  const [moduleTitle, setModuleTitle] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')

  const { data: builder, isLoading } = useQuery({
    queryKey: ['admin', 'course-builder', courseId],
    queryFn: async () => {
      const r = await api.get<{ data: BuilderData }>(`/admin/courses/${courseId}/builder`)
      return r.data.data
    },
    enabled: !!courseId,
  })

  const createModuleMutation = useMutation({
    mutationFn: (title: string) => api.post(`/admin/courses/${courseId}/modules`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-builder', courseId] })
      setModuleTitle('')
      setSuccessMessage('Module added successfully')
    },
  })

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, title }: { moduleId: string; title: string }) =>
      api.post(`/admin/modules/${moduleId}/lessons`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-builder', courseId] })
      setLessonTitle('')
      setSuccessMessage('Lesson added successfully')
    },
  })

  const createQuizMutation = useMutation({
    mutationFn: ({ lessonId, title }: { lessonId: string; title: string }) =>
      api.post(`/admin/lessons/${lessonId}/quiz`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-builder', courseId] })
      setQuizTitle('')
      setSuccessMessage('Quiz attached successfully')
    },
  })

  const createAssignmentMutation = useMutation({
    mutationFn: ({ lessonId, title }: { lessonId: string; title: string }) =>
      api.post(`/admin/lessons/${lessonId}/assignment`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-builder', courseId] })
      setAssignmentTitle('')
      setSuccessMessage('Assignment attached successfully')
    },
  })

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle.trim() || !courseId) return
    createModuleMutation.mutate(moduleTitle)
  }

  const handleAddLesson = (e: React.FormEvent, moduleId: string) => {
    e.preventDefault()
    if (!lessonTitle.trim()) return
    createLessonMutation.mutate({ moduleId, title: lessonTitle })
  }

  const handleAttachQuiz = (e: React.FormEvent, lessonId: string) => {
    e.preventDefault()
    if (!quizTitle.trim()) return
    createQuizMutation.mutate({ lessonId, title: quizTitle })
  }

  const handleAttachAssignment = (e: React.FormEvent, lessonId: string) => {
    e.preventDefault()
    if (!assignmentTitle.trim()) return
    createAssignmentMutation.mutate({ lessonId, title: assignmentTitle })
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
        <Button onClick={() => navigate('/admin/courses')} className="mt-4">Back to Courses</Button>
      </div>
    )
  }

  const totalLessons = builder.modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <div>
      <div className="mb-6">
        <Link to="/admin/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-brand-blue mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Back to Courses
        </Link>
        <PageHeader
          title={builder.title}
          subtitle={`${totalLessons} lessons · ${builder.modules.length} modules`}
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/admin/courses')}>Done</Button>
            </div>
          }
        />
      </div>

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
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
                placeholder="Module title (e.g., Module 1 – Numbers Around Us)" className="flex-1" />
              <Button type="submit" loading={createModuleMutation.isPending} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" /> Add Module
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
                    <span className="font-semibold text-gray-900 dark:text-white">{mod.title}</span>
                    <span className="text-xs text-gray-400">({mod.lessons.length} lessons)</span>
                  </div>
                  {expandedModules.has(mod.id) ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                </div>

                {expandedModules.has(mod.id) && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Add Lesson */}
                    <form onSubmit={e => handleAddLesson(e, mod.id)} className="flex flex-col sm:flex-row gap-2 mt-4 mb-4">
                      <Input value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                        placeholder="Lesson title (e.g., Lesson 1 – Introduction)" className="flex-1" />
                      <Button type="submit" size="sm" loading={createLessonMutation.isPending} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-1" aria-hidden="true" /> Add Lesson
                      </Button>
                    </form>

                    {/* Lessons */}
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
                              {expandedLessons.has(lesson.id) ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </div>

                            {expandedLessons.has(lesson.id) && (
                              <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                {/* Quizzes & Assignments list */}
                                <div className="mt-3 space-y-1">
                                  {lesson.quizzes.map(q => (
                                    <div key={q.id} className="flex items-center gap-2 pl-2 py-1 text-sm">
                                      <HelpCircle className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
                                      <span className="text-gray-700 dark:text-gray-300">Quiz: {q.title}</span>
                                    </div>
                                  ))}
                                  {lesson.assignments.map(a => (
                                    <div key={a.id} className="flex items-center gap-2 pl-2 py-1 text-sm">
                                      <FileSpreadsheet className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
                                      <span className="text-gray-700 dark:text-gray-300">Assignment: {a.title}</span>
                                    </div>
                                  ))}
                                  {lesson.quizzes.length === 0 && lesson.assignments.length === 0 && (
                                    <p className="text-xs text-gray-400 pl-2">No assessments yet</p>
                                  )}
                                </div>

                                {/* Add Quiz */}
                                <form onSubmit={e => handleAttachQuiz(e, lesson.id)} className="flex flex-col sm:flex-row gap-2">
                                  <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                                    placeholder="Quiz title..." className="flex-1" />
                                  <Button type="submit" size="sm" variant="secondary" loading={createQuizMutation.isPending} className="w-full sm:w-auto">
                                    <ClipboardCheck className="w-4 h-4 mr-1" aria-hidden="true" /> Attach Quiz
                                  </Button>
                                </form>

                                {/* Add Assignment */}
                                <form onSubmit={e => handleAttachAssignment(e, lesson.id)} className="flex flex-col sm:flex-row gap-2">
                                  <Input value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)}
                                    placeholder="Assignment title..." className="flex-1" />
                                  <Button type="submit" size="sm" variant="secondary" loading={createAssignmentMutation.isPending} className="w-full sm:w-auto">
                                    <ClipboardList className="w-4 h-4 mr-1" aria-hidden="true" /> Attach Assignment
                                  </Button>
                                </form>
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
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
                <p className="text-gray-500">No modules yet. Add your first module above to start building your course.</p>
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
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Add modules to organize your course</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Open a module and add lessons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Open a lesson and attach quizzes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold">4</span>
                <span>Attach assignments to assess learning</span>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  )
}