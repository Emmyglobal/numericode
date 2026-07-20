import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { CheckCircle, BookOpen, ChevronLeft, ChevronRight, Download, Menu, X } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDuration } from '@/utils/formatDuration'
import { cn } from '@/utils/classNames'
import { LearningBoard } from '@/components/shared/LearningBoard'
import type { EnrolledCourse, Lesson } from '@/features/courses/types'

export default function CourseViewerPage() {
  const { id } = useParams<{ id: string }>()
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)
  const [sidebarOpen,    setSidebarOpen]    = useState(false)

  const { data: course, isLoading } = useQuery({
    queryKey: ['dashboard', 'courses', id],
    queryFn:  () => dashboardService.getCourse(id!) as Promise<EnrolledCourse>,
  })

  const allLessons = useMemo(() => course?.modules.flatMap(m => m.lessons) ?? [], [course])
  const activeLesson: Lesson | undefined = allLessons.find(l => l.id === activeLessonId) ?? allLessons[0]
  const activeIndex  = allLessons.findIndex(l => l.id === activeLesson?.id)
  const totalLessons = allLessons.length

  if (isLoading || !course) {
    return (
      <div className="space-y-4" aria-label="Loading course viewer…">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex h-[calc(100vh-4rem)]">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Lesson sidebar */}
      <aside
        id="lesson-sidebar"
        aria-label="Lesson list"
        className={cn(
          'fixed lg:static top-16 lg:top-0 bottom-0 left-0 w-72 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40 transition-transform',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate pr-2">
              {course.title}
            </h2>
            <button
              className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close lesson sidebar"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <ProgressBar value={course.progress} label="Overall Progress" />
        </div>

        {/* Lesson nav */}
        <nav aria-label="Course lessons" className="p-2">
          {course.modules.map(mod => (
            <div key={mod.id} className="mb-3">
              <p className="px-3 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {mod.title}
              </p>
              {mod.lessons.map((l, lessonIdx) => {
                const isActive = l.id === activeLesson?.id
                const globalIdx = allLessons.findIndex(al => al.id === l.id) + 1
                return (
                  <button
                    key={l.id}
                    onClick={() => { setActiveLessonId(l.id); setSidebarOpen(false) }}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`Lesson ${globalIdx}: ${l.title}${l.isCompleted ? ' (completed)' : ''}`}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors',
                      isActive
                        ? 'bg-brand-light dark:bg-blue-900/30 border-l-[3px] border-brand-blue pl-[calc(0.75rem-3px)] text-brand-blue font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {l.isCompleted
                      ? <CheckCircle className="w-4 h-4 text-green-600 shrink-0" aria-hidden="true" />
                      : <BookOpen    className="w-4 h-4 shrink-0 text-gray-300"  aria-hidden="true" />
                    }
                    <span className="flex-1 truncate">{lessonIdx + 1}. {l.title}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" aria-label="Lesson content">
        {/* Mobile toggle */}
        <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-controls="lesson-sidebar"
            aria-label="Open lesson list"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500 hover:text-brand-blue"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
            Lessons
          </button>
        </div>

        <article className="max-w-3xl mx-auto p-6 sm:p-10">
          {/* Lesson meta */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
            Lesson {activeIndex + 1} of {totalLessons} ·{' '}
            <time>{formatDuration(activeLesson?.duration ?? 0)}</time>
          </p>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {activeLesson?.title}
          </h1>

          {/* Course Content - shown when no specific lesson is active */}
          {!activeLessonId && course.content && (
            <section aria-label="Course content" className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Content</h2>
              <div className="text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed whitespace-pre-wrap">
                {course.content}
              </div>
            </section>
          )}

          {/* Lesson body */}
          <div className="text-gray-700 dark:text-gray-300 space-y-4 mb-8 leading-relaxed">
            <p>
              This is the lesson content area. In the full implementation, this would contain rich
              text, code examples, diagrams, and interactive exercises related to{' '}
              <strong>{activeLesson?.title}</strong>.
            </p>
            <p>
              Take your time working through the material. If you have questions, bring them to the
              next live class session.
            </p>
          </div>

          {activeLesson && <LearningBoard lessonId={activeLesson.id} />}

          {/* Resources */}
          {(activeLesson?.resources?.length ?? 0) > 0 && (
            <section aria-label="Lesson resources" className="mb-8">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">
                Lesson Resources
              </h2>
              <ul className="space-y-2">
                {activeLesson!.resources.map(r => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">{r.title}</span>
                    <Button variant="ghost" size="sm" aria-label={`Download ${r.title}`}>
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      Download
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Lesson navigation */}
          <nav
            aria-label="Lesson navigation"
            className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <Button
              variant="ghost"
              disabled={activeIndex <= 0}
              onClick={() => setActiveLessonId(allLessons[activeIndex - 1]?.id)}
              aria-label={activeIndex > 0 ? `Go to lesson ${activeIndex}: ${allLessons[activeIndex - 1]?.title}` : 'No previous lesson'}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </Button>
            <Button
              disabled={activeIndex >= totalLessons - 1}
              onClick={() => setActiveLessonId(allLessons[activeIndex + 1]?.id)}
              aria-label={activeIndex < totalLessons - 1 ? `Go to lesson ${activeIndex + 2}: ${allLessons[activeIndex + 1]?.title}` : 'No next lesson'}
            >
              Next Lesson
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </nav>
        </article>
      </main>
    </div>
  )
}
