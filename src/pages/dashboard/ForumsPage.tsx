import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { forumsService, type ForumCategory } from '@/services/forums.service'
import { dashboardService } from '@/services/dashboard.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import { MessageSquare, Pin, Lock, Eye, Plus, X } from 'lucide-react'
import type { EnrolledCourse } from '@/features/courses/types'

export default function ForumsPage() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: enrolledCourses } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  const { data: allCategories } = useQuery({
    queryKey: ['student-forum-categories', enrolledCourses],
    queryFn: async () => {
      if (!enrolledCourses || enrolledCourses.length === 0) return [] as ForumCategory[]
      const cats: ForumCategory[] = []
      for (const course of enrolledCourses) {
        const courseCats = await forumsService.listByCourse(course.id)
        cats.push(...courseCats)
      }
      return cats
    },
    enabled: Boolean(enrolledCourses),
  })

  const { data: threads, isLoading } = useQuery({
    queryKey: ['forum-threads', enrolledCourses],
    queryFn: async () => {
      if (!enrolledCourses || enrolledCourses.length === 0) return []

      const allThreads: Array<{
        id: string; categoryId: string; userId: string; userName: string
        title: string; body: string; isPinned: boolean; isLocked: boolean
        viewCount: number; createdAt: string
      }> = []

      for (const course of enrolledCourses) {
        const categories = await forumsService.listByCourse(course.id)
        for (const cat of categories) {
          const catThreads = await forumsService.listThreads(cat.id)
          allThreads.push(...catThreads)
        }
      }

      // Sort by newest first, pinned on top
      allThreads.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      return allThreads
    },
    enabled: Boolean(enrolledCourses),
  })

  const createThreadMutation = useMutation({
    mutationFn: () => forumsService.createThread({ categoryId: selectedCategoryId, title: newTitle, body: newBody }),
    onSuccess: () => {
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
    if (allCategories && allCategories.length > 0) {
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
          <Button onClick={openCreate}>
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

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !threads?.length ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No discussions yet</h3>
          <p className="text-gray-500">Start a new discussion or check back when your instructors create threads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <Link key={thread.id} to={`/dashboard/forums/${thread.id}`}>
              <div className="rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-blue transition-colors dark:border-gray-700 dark:bg-surface-dark">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {thread.isPinned && <Pin className="w-4 h-4 text-brand-blue" />}
                      {thread.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{thread.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{thread.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>By {thread.userName}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {thread.viewCount} views</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
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
                {!allCategories?.length ? (
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