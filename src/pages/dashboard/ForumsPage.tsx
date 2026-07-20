import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { forumsService } from '@/services/forums.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { MessageSquare, Pin, Lock, Eye } from 'lucide-react'

export default function ForumsPage() {
  const { data: threads, isLoading } = useQuery({
    queryKey: ['forum-threads'],
    queryFn: async () => {
      // In a real app, fetch threads from enrolled courses
      return [] as Array<{
        id: string; categoryId: string; userId: string; userName: string
        title: string; body: string; isPinned: boolean; isLocked: boolean
        viewCount: number; createdAt: string
      }>
    },
  })

  return (
    <div>
      <PageHeader title="Discussion Forums" subtitle="Engage with instructors and peers" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : !threads?.length ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No discussions yet</h3>
          <p className="text-gray-500">Forum discussions will appear here when your instructors create them.</p>
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
    </div>
  )
}