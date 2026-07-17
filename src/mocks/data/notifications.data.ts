import type { Notification } from '@/features/notifications/types'

export const notificationsData: Notification[] = [
  { id: 'n1', title: 'New trainer awaiting approval', body: 'Ibrahim Musa registered as a trainer and needs approval.', type: 'trainer_approval', link: '/admin/users', isRead: false, createdAt: '2026-07-12T09:00:00Z' },
  { id: 'n2', title: 'Your trainer account was approved!', body: 'You can now log in and start creating courses.', type: 'trainer_status', link: '/trainer', isRead: false, createdAt: '2026-07-11T14:30:00Z' },
  { id: 'n3', title: 'New course published', body: '"React & TypeScript" is now available. Check it out!', type: 'course', link: '/courses/c6', isRead: true, createdAt: '2026-07-10T10:00:00Z' },
  { id: 'n4', title: 'Live Class Reschedule Notice', body: 'The Algebra live class has been moved. Please check your dashboard.', type: 'announcement', link: null, isRead: true, createdAt: '2026-06-25T08:00:00Z' },
]
