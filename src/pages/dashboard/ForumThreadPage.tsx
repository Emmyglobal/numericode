import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forumsService } from '@/services/forums.service'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Lock, Eye, MessageSquare, ArrowLeft } from 'lucide-react'

export default function ForumThreadPage() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newPostBody, setNewPostBody] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ['forum-thread', threadId],
    queryFn: () => forumsService.getThread(threadId!),
    enabled: Boolean(threadId),
  })

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', threadId],
    queryFn: () => forumsService.listPosts(threadId!),
    enabled: Boolean(threadId),
  })

  const createPostMutation = useMutation({
    mutationFn: (body: string) => forumsService.createPost(threadId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts', threadId] })
      setNewPostBody('')
      setSuccess('Your reply has been posted.')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPostBody.trim()) return
    createPostMutation.mutate(newPostBody.trim())
  }

  if (threadLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Thread not found</h3>
        <p className="text-gray-500 mb-4">This discussion thread could not be found.</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard/forums')}>
          Back to Forums
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/dashboard/forums')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-blue mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Forums
      </button>

      {/* Thread header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark mb-6">
        <div className="flex items-center gap-2 mb-2">
          {thread.isLocked && <Lock className="w-4 h-4 text-gray-400" />}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{thread.title}</h1>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">{thread.body}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>By {thread.userName}</span>
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {thread.viewCount} views</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

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

      {/* Posts */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Replies ({posts?.length || 0})
      </h2>

      {postsLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !posts?.length ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No replies yet. Be the first to respond!</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-brand-blue">
                      {post.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.userName}</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {post.isSolution && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Solution
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {!thread.isLocked && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Post a Reply</h3>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <textarea
              required
              value={newPostBody}
              onChange={e => setNewPostBody(e.target.value)}
              rows={4}
              placeholder="Write your reply..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100"
            />
            <div className="flex justify-end">
              <Button type="submit" loading={createPostMutation.isPending}>
                Post Reply
              </Button>
            </div>
          </form>
        </div>
      )}

      {thread.isLocked && (
        <div className="text-center py-6 text-sm text-gray-500">
          <Lock className="w-5 h-5 inline mr-1" />
          This thread is locked. No new replies can be added.
        </div>
      )}
    </div>
  )
}