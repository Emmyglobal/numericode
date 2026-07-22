import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { ArrowLeft, Plus, BookOpen, FileText, ClipboardCheck, ClipboardList, ChevronRight, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
}

interface Quiz {
  id: string
  title: string
}

interface Assignment {
  id: string
  title: string
}

interface CourseDetail {
  id: string
  title: string
  subject: string
  level: string
  status: string
  modules: Module[]
}

export default function TrainerCourseBuilderPage() {
  usePageTitle('Course Builder — Trainer')
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [successMessage, setSuccessMessage] = useState('')
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  // Form states
  const [moduleTitle, setModuleTitle] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['trainer', 'course-builder', courseId],
    queryFn: async () => {
      const r = await api.get<{ data: CourseDetail }>(`/trainer/courses/${courseId}`)
      return r.data.data
    },
    enabled: !!courseId,
  })

  const createModuleMutation = useMutation({
    mutationFn: (title: string) => api.post(`/trainer/courses/${courseId}/modules`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'course-builder', courseId] })
      setModuleTitle('')
      setSuccessMessage('Module added successfully')
    },
  })

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, title }: { moduleId: string; title: string }) =>
      api.post(`/trainer/modules/${moduleId}/lessons`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'course-builder', courseId] })
      setLessonTitle('')
      setSuccessMessage('Lesson added successfully')
    },
  })

  const createQuizMutation = useMutation({
    mutationFn: ({ lessonId, title }: { lessonId: string; title: string }) =>
      api.post(`/trainer/lessons/${lessonId}/quiz`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'course-builder', courseId] })
      setQuizTitle('')
      setSuccessMessage('Quiz attached successfully')
    },
  })

  const createAssignmentMutation = useMutation({
    mutationFn: ({ lessonId, title }: { lessonId: string; title: string }) =>
      api.post(`/trainer/lessons/${lessonId}/assignment`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'course-builder', courseId] })
      setAssignmentTitle('')
      setSuccessMessage('Assignment attached successfully')
    },
  })

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!moduleTitle.trim() || !courseId) return
    createModuleMutation.mutate(moduleTitle)
  }

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonTitle.trim() || !activeModuleId) return
    createLessonMutation.mutate({ moduleId: activeModuleId, title: lessonTitle })
  }

  const handleAttachQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizTitle.trim() || !activeLessonId) return
    createQuizMutation.mutate({ lessonId: activeLessonId, title: quizTitle })
  }

  const handleAttachAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignmentTitle.trim() || !activeLessonId) return
    createAssignmentMutation.mutate({ lessonId: activeLessonId, title: assignmentTitle })
  }

  const activeLesson = course?.modules
    .flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })))
    .find(l => l.id === activeLessonId)

  const activeModule = course?.modules.find(m => m.id === activeModuleId)

  if (courseLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Course not found</p>
        <Button onClick={() => navigate('/trainer/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    )
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <div>
      <div className="mb-6">
        <Link to="/trainer/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-brand-blue mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Back to Courses
        </Link>
        <PageHeader
          title={course.title}
          subtitle={`${totalLessons} lessons · ${course.modules.length} modules`}
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => navigate('/trainer/courses')}>
                Done
              </Button>
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
        {/* Course Overview & Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info Card */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Course Overview</h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Subject</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{course.subject}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Level</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{course.level}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Status</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{course.status}</p>
              </div>
            </div>
          </section>

          {/* Add Module */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Add Module
            </h3>
            <form onSubmit={handleAddModule} className="flex gap-2">
              <Input
                value={moduleTitle}
                onChange={e => setModuleTitle(e.target.value)}
                placeholder="Module title (e.g., Introduction to Algebra)"
                className="flex-1"
              />
              <Button type="submit" loading={createModuleMutation.isPending}>
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Add Module
              </Button>
            </form>
          </section>

          {/* Modules List */}
          <div className="space-y-4">
            {course.modules.map(module => (
              <section
                key={module.id}
                className={`rounded-xl border bg-white dark:bg-surface-dark overflow-hidden transition-colors ${
                  activeModuleId === module.id ? 'border-brand-blue' : 'border-gray-200'
                }`}
              >
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => {
                    setActiveModuleId(module.id === activeModuleId ? null : module.id)
                    setActiveLessonId(null)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-semibold text-sm">
                        {module.lessons.length}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{module.title}</h3>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeModuleId === module.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {activeModuleId === module.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
                    {/* Add Lesson */}
                    <form onSubmit={handleAddLesson} className="flex gap-2 mt-4 mb-4">
                      <Input
                        value={activeModuleId === module.id ? lessonTitle : ''}
                        onChange={e => setLessonTitle(e.target.value)}
                        placeholder="Add lesson title..."
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        loading={createLessonMutation.isPending}
                        onClick={() => setActiveModuleId(module.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                        Add Lesson
                      </Button>
                    </form>

                    {/* Lessons List */}
                    {module.lessons.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No lessons yet. Add your first lesson above.</p>
                    ) : (
                      <div className="space-y-2">
                        {module.lessons.map(lesson => (
                          <div
                            key={lesson.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                              activeLessonId === lesson.id
                                ? 'border-brand-blue bg-brand-blue/5'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveLessonId(lesson.id === activeLessonId ? null : lesson.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">{lesson.title}</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${activeLessonId === lesson.id ? 'rotate-90' : ''}`} />
                            </div>

                            {activeLessonId === lesson.id && (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                {/* Attach Quiz */}
                                <form onSubmit={handleAttachQuiz} className="flex gap-2">
                                  <Input
                                    value={activeLessonId === lesson.id ? quizTitle : ''}
                                    onChange={e => setQuizTitle(e.target.value)}
                                    placeholder="Quiz title..."
                                    className="flex-1"
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="secondary"
                                    loading={createQuizMutation.isPending}
                                  >
                                    <ClipboardCheck className="w-4 h-4 mr-1" aria-hidden="true" />
                                    Attach Quiz
                                  </Button>
                                </form>

                                {/* Attach Assignment */}
                                <form onSubmit={handleAttachAssignment} className="flex gap-2">
                                  <Input
                                    value={activeLessonId === lesson.id ? assignmentTitle : ''}
                                    onChange={e => setAssignmentTitle(e.target.value)}
                                    placeholder="Assignment title..."
                                    className="flex-1"
                                  />
                                  <Button
                                    type="submit"
                                    size="sm"
                                    variant="secondary"
                                    loading={createAssignmentMutation.isPending}
                                  >
                                    <ClipboardList className="w-4 h-4 mr-1" aria-hidden="true" />
                                    Attach Assignment
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
              </section>
            ))}

            {course.modules.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-dashed border-gray-300">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" aria-hidden="true" />
                <p className="text-gray-500">No modules yet. Add your first module above to start building your course.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Structure Summary */}
          <section className="rounded-xl border border-gray-200 bg-white dark:bg-surface-dark p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Course Structure</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Modules</span>
                <span className="font-semibold text-gray-900 dark:text-white">{course.modules.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">Lessons</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalLessons}</span>
              </div>
            </div>
          </section>

          {/* Workflow Guide */}
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