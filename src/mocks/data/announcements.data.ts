import type { Announcement } from '@/features/announcements/types'
export const announcementsData: Announcement[] = [
  { id: 'an1', title: 'New Course: React & TypeScript Now Live!', body: 'We are excited to announce the launch of our most advanced course yet — React & TypeScript. Enrol now and get early-bird access to all lessons.', createdAt: '2026-06-28', isRead: false },
  { id: 'an2', title: 'Live Class Reschedule Notice', body: 'The Algebra live class scheduled for July 5th has been moved to July 6th at the same time (10:00 AM). Please update your calendars.', createdAt: '2026-06-25', isRead: false },
  { id: 'an3', title: 'July Learning Challenge', body: 'Complete 5 lessons this July and earn a digital badge! Track your progress from your dashboard. Challenge runs July 1–31.', createdAt: '2026-06-20', isRead: true },
  { id: 'an4', title: 'Platform Maintenance – June 30', body: 'NumeriCode will be down for scheduled maintenance on June 30 from 2:00 AM to 4:00 AM WAT. We apologise for any inconvenience.', createdAt: '2026-06-18', isRead: true },
]
