import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forumsService } from '@/services/forums.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Edit, Trash2, MessageSquare, Pin, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TrainerForumsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: threads, isLoading } = useQuery({
    queryKey: ['trainer-forum-threads'],
    queryFn: async () => {
      return [] as Array<{
        id: string; categoryId: string; title: string; body: string
        isPinned: boolean; isLocked: boolean; viewCount: number; createdAt: string
      }>
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (threadId: string) => forumsService.deleteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-forum-threads'] })
    },
  })

  return (
    <div>
      <PageHeader
        title="Forum Management"
        subtitle="Moderate discussions and manage forum content"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Thread
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
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
                    {thread.isPinned && <Pin className="w-4 h-4 text-brand-blue" />}
                    {thread.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    <h3 className="font-semibold text-gray-900 dark:text-white">{thread.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{thread.body}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{thread.viewCount} views</span>
                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link to={`/trainer/forums/${thread.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this thread?')) {
                        deleteMutation.mutate(thread.id)
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

      {/* Create Thread Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Thread</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Thread creation form would go here with title, body, and category selection.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={() => setShowCreateModal(false)}>Create Thread</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}