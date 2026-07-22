import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forumsService, type ForumThread, type ForumCategory } from '@/services/forums.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Plus, Edit, Trash2, MessageSquare, Pin, Lock, X } from 'lucide-react'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function TrainerForumsPage() {
  usePageTitle('Forums — Trainer')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingThread, setEditingThread] = useState<ForumThread | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: threads, isLoading } = useQuery({
    queryKey: ['trainer-forum-threads'],
    queryFn: async () => {
      const categories = await forumsService.listCategories()
      const allThreads: ForumThread[] = []
      for (const cat of categories) {
        const catThreads = await forumsService.listThreads(cat.id)
        allThreads.push(...catThreads)
      }
      return allThreads
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['trainer-forum-categories'],
    queryFn: () => forumsService.listCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (data: { categoryId: string; title: string; body: string }) => forumsService.createThread(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-forum-threads'] })
      setShowCreateModal(false)
      setTitle('')
      setBody('')
      setCategoryId('')
      setSuccessMessage('Thread created successfully.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; body?: string } }) => forumsService.updateThread(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-forum-threads'] })
      setEditingThread(null)
      setTitle('')
      setBody('')
      setSuccessMessage('Thread updated successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (threadId: string) => forumsService.deleteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-forum-threads'] })
      setSuccessMessage('Thread deleted.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingThread) {
      updateMutation.mutate({ id: editingThread.id, data: { title, body } })
    } else {
      createMutation.mutate({ categoryId, title, body })
    }
  }

  const openCreate = () => {
    setEditingThread(null)
    setTitle('')
    setBody('')
    setCategoryId(categories?.[0]?.id ?? '')
    setShowCreateModal(true)
  }

  const openEdit = (thread: ForumThread) => {
    setEditingThread(thread)
    setTitle(thread.title)
    setBody(thread.body)
    setShowCreateModal(true)
  }

  return (
    <div>
      <PageHeader
        title="Forum Management"
        subtitle="Create and moderate discussion threads for your courses"
        actions={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> New Thread
          </Button>
        }
      />

      {successMessage && (
        <div className="mb-4">
          <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !threads?.length ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No forum threads yet</h3>
          <p className="text-gray-500">Create discussion threads to engage with your students.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map(thread => (
            <div key={thread.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{thread.title}</h3>
                    {thread.isPinned && <Pin className="w-4 h-4 text-yellow-500" title="Pinned" />}
                    {thread.isLocked && <Lock className="w-4 h-4 text-gray-500" title="Locked" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{thread.body}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{thread.viewCount} views</span>
                    <span>{thread.createdAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(thread)}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(thread.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingThread ? 'Edit Thread' : 'New Thread'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingThread && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Category <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select a category…</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <Input label="Title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="Thread title" />
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Content <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Write your thread content…"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {editingThread ? 'Update' : 'Create'} Thread
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
