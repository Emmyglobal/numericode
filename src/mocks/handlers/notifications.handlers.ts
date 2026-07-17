import { http, HttpResponse } from 'msw'
import { notificationsData } from '@/mocks/data/notifications.data'

// Mutable copy so read state persists within a session
let notifications = [...notificationsData]

export const notificationsHandlers = [
  http.get('/api/notifications', () => {
    const unreadCount = notifications.filter(n => !n.isRead).length
    return HttpResponse.json({ success: true, data: { unreadCount, notifications } })
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    const notification = notifications.find(n => n.id === params.id)
    if (!notification) return new HttpResponse(null, { status: 404 })
    notification.isRead = true
    return HttpResponse.json({ success: true, data: { id: notification.id, isRead: true } })
  }),

  http.patch('/api/notifications/read-all', () => {
    notifications = notifications.map(n => ({ ...n, isRead: true }))
    return HttpResponse.json({ success: true, data: { success: true } })
  }),
]
