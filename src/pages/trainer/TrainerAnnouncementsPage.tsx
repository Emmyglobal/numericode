import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'

interface Announcement {
  id: string; title: string; body: string; audience: string
  createdAt: string; isRead: boolean
}

export default function TrainerAnnouncementsPage() {
  usePageTitle('Announcements — Trainer')
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['trainer', 'announcements'],
    queryFn: async () => {
      const r = await api.get<ApiResponse<Announcement[]>>('/trainer/announcements')
      return r.data.data
    },
  })

  return (
    <div>
      <PageHeader title="Announcements" subtitle="Platform-wide updates and notices" />
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !announcements?.length ? (
        <EmptyState icon={<Bell className="w-16 h-16" />} title="No announcements" description="Check back later for updates." />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div
              key={a.id}
              className={cn(
                'rounded-lg border p-5',
                a.isRead
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark'
                  : 'border-teal-light dark:border-teal-800 bg-teal-light/40 dark:bg-teal-900/10'
              )}
            >
              <div className="flex items-start gap-2.5">
                {!a.isRead && <span className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(a.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">{a.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}