export type NotificationType = 'general' | 'trainer_approval' | 'trainer_status' | 'announcement' | 'course'

export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationsResponse {
  unreadCount: number
  notifications: Notification[]
}
