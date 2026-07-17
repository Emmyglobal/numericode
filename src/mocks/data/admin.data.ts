import type { AdminUser, AdminCourse, AdminStats, AdminAnnouncement } from '@/features/admin/types'

export const adminStats: AdminStats = {
  totalUsers: 94,
  totalStudents: 89,
  totalTrainers: 4,
  totalCourses: 6,
  activeCourses: 5,
  totalLiveSessions: 42,
  totalEnrolments: 187,
  pendingTrainers: 1,
  platformGrowth: 23,
}

export const adminUsers: AdminUser[] = [
  { id: 'u1', name: 'Emmanuel Nwafor', email: 'emmanuel@numericode.com', role: 'admin',   status: 'active',    joinedAt: '2024-01-01', lastActive: '2026-07-01' },
  { id: 'u2', name: 'Kolade Adebayo',  email: 'kolade@gmail.com',        role: 'student', status: 'active',    joinedAt: '2024-02-10', lastActive: '2026-06-30' },
  { id: 'u3', name: 'Amaka Okonkwo',   email: 'amaka@gmail.com',         role: 'student', status: 'active',    joinedAt: '2024-03-01', lastActive: '2026-06-29' },
  { id: 'u4', name: 'Chidi Obi',       email: 'chidi@gmail.com',         role: 'student', status: 'active',    joinedAt: '2024-03-15', lastActive: '2026-06-28' },
  { id: 'u5', name: 'Ngozi Eze',       email: 'ngozi@gmail.com',         role: 'student', status: 'active',    joinedAt: '2024-01-20', lastActive: '2026-07-01' },
  { id: 'u6', name: 'Emeka Nwosu',     email: 'emeka@gmail.com',         role: 'student', status: 'suspended', joinedAt: '2024-04-05', lastActive: '2026-06-25' },
  { id: 'u7', name: 'Trainer One',     email: 'trainer1@numericode.com', role: 'trainer', status: 'active',    joinedAt: '2024-01-05', lastActive: '2026-07-01' },
  { id: 'u8', name: 'Trainer Two',     email: 'trainer2@numericode.com', role: 'trainer', status: 'active',    joinedAt: '2024-02-01', lastActive: '2026-06-28' },
  { id: 'u9', name: 'Ibrahim Musa',    email: 'ibrahim@gmail.com',       role: 'trainer', status: 'pending',   joinedAt: '2026-07-08', lastActive: '2026-07-08' },
]

export const adminCourses: AdminCourse[] = [
  { id: 'c1', title: 'Foundation Mathematics',  subject: 'mathematics',  level: 'beginner',     instructor: 'Emmanuel Nwafor', status: 'published', enrolledCount: 18, createdAt: '2024-01-10' },
  { id: 'c2', title: 'JavaScript for Beginners',subject: 'programming',  level: 'beginner',     instructor: 'Emmanuel Nwafor', status: 'published', enrolledCount: 21, createdAt: '2024-02-01' },
  { id: 'c3', title: 'Algebra & Equations',     subject: 'mathematics',  level: 'intermediate', instructor: 'Emmanuel Nwafor', status: 'published', enrolledCount: 12, createdAt: '2024-03-05' },
  { id: 'c4', title: 'Python Programming',       subject: 'programming',  level: 'intermediate', instructor: 'Trainer One',     status: 'draft',     enrolledCount: 0,  createdAt: '2024-04-01' },
  { id: 'c5', title: 'Calculus Fundamentals',   subject: 'mathematics',  level: 'advanced',     instructor: 'Emmanuel Nwafor', status: 'published', enrolledCount: 8,  createdAt: '2024-04-15' },
  { id: 'c6', title: 'React & TypeScript',       subject: 'programming',  level: 'advanced',     instructor: 'Trainer Two',     status: 'published', enrolledCount: 14, createdAt: '2024-05-01' },
]

export const adminAnnouncements: AdminAnnouncement[] = [
  { id: 'an1', title: 'New Course: React & TypeScript Now Live!', body: 'We are excited to announce the launch of our most advanced course — React & TypeScript. Enrol now.', audience: 'all',      createdAt: '2026-06-28', createdBy: 'Emmanuel Nwafor' },
  { id: 'an2', title: 'Live Class Reschedule Notice',            body: 'The Algebra live class on July 5 has been moved to July 6 at the same time.',                       audience: 'students',  createdAt: '2026-06-25', createdBy: 'Emmanuel Nwafor' },
  { id: 'an3', title: 'Trainer Onboarding Update',               body: 'New trainer onboarding guide has been published. Please review before your first session.',           audience: 'trainers',  createdAt: '2026-06-20', createdBy: 'Emmanuel Nwafor' },
]
