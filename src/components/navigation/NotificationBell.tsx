import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { notificationsService } from '@/services/notifications.service'
import { cn } from '@/utils/classNames'
import type { Notification } from '@/features/notifications/types'

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsService.list,
    refetchInterval: 30_000, // poll every 30s so approvals/announcements show up without a manual refresh
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const unreadCount = data?.unreadCount ?? 0
  const notifications = data?.notifications ?? []

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) markReadMutation.mutate(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-lg z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" aria-hidden="true" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id}>
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-2.5',
                      !n.isRead && 'bg-brand-light/40 dark:bg-blue-900/10'
                    )}
                  >
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" aria-hidden="true" />}
                    <div className={cn('min-w-0', n.isRead && 'pl-[18px]')}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
