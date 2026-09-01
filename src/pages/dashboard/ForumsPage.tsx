import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { forumsService, type ForumCategory, type ForumThread } from '@/services/forums.service'
import { dashboardService } from '@/services/dashboard.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { MessageSquare, Pin, Lock, Eye, Plus, X, BookOpen } from 'lucide-react'
import type { EnrolledCourse } from '@/features/courses/types'

/** A forum category with its threads attached (what the student screen renders). */
interface CategoryWithThreads extends ForumCategory {
  threads: ForumThread[]
}

/** All forums for one enrolled course. */
interface CourseForums {
  courseId: string
  courseTitle: string
  categories: CategoryWithThreads[]
}

export default function ForumsPage() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  // Load EVERY forum category created for the student's enrolled courses —
  // grouped per course — so forums the trainer creates always appear here,
  // even when a category has no threads yet.
  const {
    data: courseForums,
    isLoading: forumsLoading,
    error: forumsError,
  } = useQuery({
    queryKey: ['student-forums', enrolledCourses],
    queryFn: async (): Promise<CourseForums[]> => {
      if (!enrolledCourses || enrolledCourses.length === 0) return []

      const settled = await Promise.allSettled(
        enrolledCourses.map(async (course): Promise<CourseForums> => {
          const categories = await forumsService.listByCourse(course.id)
          const withThreads = await Promise.all(
            categories.map(async (cat): Promise<CategoryWithThreads> => {
              // A failed thread fetch must never hide the whole forum.
              const threads = await forumsService
                .listThreads(cat.id)
                .catch(() => [] as ForumThread[])
              return { ...cat, threads }
            })
          )
          return { courseId: course.id, courseTitle: course.title, categories: withThreads }
        })
      )

      const courses = settled
        .filter((r): r is PromiseFulfilledResult<CourseForums> => r.status === 'fulfilled')
        .map(r => r.value)

      // Only fail the query when NOTHING could be loaded — partial results still render.
      if (courses.length === 0 && enrolledCourses.length > 0) {
        throw new Error('Could not load the forums for your courses. Please try again.')
      }
      return courses
    },
    enabled: Boolean(enrolledCourses),
  })

  // Flattened category list for the "New Thread" modal.
  const allCategories = useMemo(
    () => courseForums?.flatMap(cf => cf.categories) ?? [],
    [courseForums]
  )

  const isLoading = coursesLoading || (Boolean(enrolledCourses) && forumsLoading)

  const createThreadMutation = useMutation({
    mutationFn: () => forumsService.createThread({ categoryId: selectedCategoryId, title: newTitle, body: newBody }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-forums'] })
      queryClient.invalidateQueries({ queryKey: ['forum-threads'] })
      setShowCreateModal(false)
      setNewTitle('')
      setNewBody('')
      setSelectedCategoryId('')
      setSuccess('Thread created successfully.')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategoryId || !newTitle.trim() || !newBody.trim()) {
      setError('Please fill in all required fields')
      return
    }
    createThreadMutation.mutate()
  }

  const openCreate = () => {
    setNewTitle('')
    setNewBody('')
    if (allCategories.length > 0) {
      setSelectedCategoryId(allCategories[0].id)
    }
    setShowCreateModal(true)
  }


  return (
    <div>
      <PageHeader
        title="Discussion Forums"
        subtitle="Engage with instructors and peers"
        actions={
          <Button onClick={openCreate} disabled={allCategories.length === 0}>
            <Plus className="w-4 h-4 mr-1" /> New Thread
          </Button>
        }
      />

      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {forumsError && (
        <div className="mb-4">
          <Alert type="error" message={(forumsError as Error).message} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !enrolledCourses?.length ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No enrolled courses yet</h3>
          <p className="text-gray-500">Enroll in a course to join its discussion forums.</p>
        </div>
      ) : !allCategories.length ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No forums yet</h3>
          <p className="text-gray-500">Your instructors haven't created any forums for your courses yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {courseForums!.map(cf => (
            <section key={cf.courseId}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                {cf.courseTitle}
              </h2>


              {cf.categories.length === 0 ? (
                <p className="text-sm text-gray-500">No forums have been created for this course yet.</p>
              ) : (
                <div className="space-y-4">
                  {cf.categories.map(cat => (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark"
                    >
                      {/* Category (forum) header — always visible, even with no threads */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-brand-blue" />
                            {cat.name}
                          </h3>
                          {cat.description && (
                            <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {cat.threads.length} {cat.threads.length === 1 ? 'thread' : 'threads'}
                        </span>
                      </div>


                      {cat.threads.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">
                          No discussions here yet — be the first to start one.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cat.threads
                            .slice()
                            .sort((a, b) => {
                              if (a.isPinned && !b.isPinned) return -1
                              if (!a.isPinned && b.isPinned) return 1
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            })
                            .map(thread => (
                              <Link key={thread.id} to={`/dashboard/forums/${thread.id}`} className="block">
                                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-brand-blue transition-colors dark:border-gray-700 dark:bg-gray-800/50">
                                  <div className="flex items-center gap-2 mb-1">
                                    {thread.isPinned && <Pin className="w-4 h-4 text-brand-blue" />}
                                    {thread.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                                    <h4 className="font-medium text-gray-900 dark:text-white">{thread.title}</h4>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{thread.body}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                    <span>By {thread.userName}</span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3.5 h-3.5" /> {thread.viewCount} views
                                    </span>
                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}


      {/* Create Thread Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Discussion Thread</h2>
              <button onClick={() => setShowCreateModal(false)} aria-label="Close">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Category <span className="text-red-500">*</span></label>
                {!allCategories.length ? (
                  <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                    No forum categories available for your courses yet.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select a category…</option>
                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>
              <Input label="Title" required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Thread title" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Content <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Write your thread content…"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" loading={createThreadMutation.isPending}>Create Thread</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
