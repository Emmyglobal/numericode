import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface NotificationPreferences {
  emailEnabled: boolean; pushEnabled: boolean; digestFrequency: 'instant' | 'daily' | 'weekly' | 'never'
}

export interface Notification {
  id: string; userId: string; title: string; body: string
  type: string; link?: string; isRead: boolean; createdAt: string
}

export interface NotificationStats {
  unreadCount: number; totalCount: number; preferences: NotificationPreferences | null
}

export interface NotificationHistory {
  notifications: Notification[]; total: number; page: number; limit: number
}

export const notificationsEnhancedService = {
  // Preferences
  getPreferences: () =>
    api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences').then(r => r.data.data),

  updatePreferences: (data: Partial<NotificationPreferences>) =>
    api.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', data).then(r => r.data.data),

  // History
  getHistory: (page = 1, limit = 20, unreadOnly = false) =>
    api.get<ApiResponse<NotificationHistory>>(`/notifications/history?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`).then(r => r.data.data),

  markAsRead: (notificationId: string) =>
    api.patch<ApiResponse<{ success: boolean }>>(`/notifications/${notificationId}/read`).then(r => r.data.data),

  markAllAsRead: () =>
    api.patch<ApiResponse<{ success: boolean }>>('/notifications/read-all').then(r => r.data.data),

  // Stats
  getStats: () =>
    api.get<ApiResponse<NotificationStats>>('/notifications/stats').then(r => r.data.data),

  // Send notifications (trainer/admin only)
  send: (data: { userId: string; title: string; body: string; type?: string; link?: string }) =>
    api.post<ApiResponse<{ message: string }>>('/notifications/send', data).then(r => r.data.data),

  sendBulk: (data: { audience: 'all' | 'students' | 'trainers'; title: string; body: string; type?: string; link?: string }) =>
    api.post<ApiResponse<{ message: string; recipientCount: number }>>('/notifications/bulk', data).then(r => r.data.data),

  // Email Digests
  sendEmailDigest: (frequency: 'daily' | 'weekly') =>
    api.post<ApiResponse<{ message: string }>>('/notifications/digest/send', { frequency }).then(r => r.data.data),

  processDigestQueue: (frequency: 'daily' | 'weekly') =>
    api.post<ApiResponse<{ message: string; totalUsers: number; successCount: number }>>('/notifications/digest/process', { frequency }).then(r => r.data.data),

  // Push Notifications
  registerPushSubscription: (subscription: unknown) =>
    api.post<ApiResponse<{ message: string }>>('/notifications/push/register', { subscription }).then(r => r.data.data),

  sendPushNotification: (data: { userId: string; title: string; body: string; data?: unknown }) =>
    api.post<ApiResponse<{ message: string }>>('/notifications/push/send', data).then(r => r.data.data),

  // Announcement Targeting
  createTargetedAnnouncement: (data: { title: string; body: string; audience: 'all' | 'course' | 'roles'; courseId?: string; targetRoles?: string[] }) =>
    api.post<ApiResponse<{ message: string; recipientCount: number }>>('/notifications/announcements/targeted', data).then(r => r.data.data),
}
