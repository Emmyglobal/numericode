import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsEnhancedService } from '@/services/notifications-enhanced.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Bell, CheckCheck, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const queryClient = useQueryClient()

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['notification-history', page, filter],
    queryFn: () => notificationsEnhancedService.getHistory(page, 20, filter === 'unread'),
  })

  const { data: stats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: notificationsEnhancedService.getStats,
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationsEnhancedService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsEnhancedService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] })
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] })
    },
  })

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your courses and activities"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => markAllAsReadMutation.mutate()}>
              <CheckCheck className="w-4 h-4 mr-1" /> Mark all as read
            </Button>
            <Link to="/dashboard/settings/notifications">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-1" /> Preferences
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
            <p className="text-2xl font-bold text-brand-blue">{stats.unreadCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCount}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread {stats?.unreadCount ? `(${stats.unreadCount})` : ''}
        </Button>
      </div>

      {/* Notifications List */}
      {historyLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : !history?.notifications.length ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.notifications.map(notification => (
            <div
              key={notification.id}
              className={`rounded-xl border p-4 transition-colors ${
                notification.isRead
                  ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark'
                  : 'border-brand-blue bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{notification.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notification.body}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(notification.id)}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {history && history.total > history.limit && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(history.total / history.limit)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= Math.ceil(history.total / history.limit)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}