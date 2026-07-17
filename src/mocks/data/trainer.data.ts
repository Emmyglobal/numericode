import type { TrainerCourse, TrainerStudent, TrainerLiveSession, TrainerAssignment, TrainerStats } from '@/features/trainer/types'

export const trainerStats: TrainerStats = {
  totalStudents: 47,
  activeCourses: 4,
  totalSessions: 28,
  avgCompletionRate: 68,
  pendingReviews: 9,
  upcomingSessions: 3,
}

export const trainerCourses: TrainerCourse[] = [
  { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner', status: 'published', enrolledCount: 18, lessonCount: 24, completionRate: 72, createdAt: '2024-01-10' },
  { id: 'c2', title: 'JavaScript for Beginners', subject: 'programming', level: 'beginner', status: 'published', enrolledCount: 21, lessonCount: 30, completionRate: 65, createdAt: '2024-02-01' },
  { id: 'c3', title: 'Algebra & Equations', subject: 'mathematics', level: 'intermediate', status: 'published', enrolledCount: 12, lessonCount: 28, completionRate: 58, createdAt: '2024-03-05' },
  { id: 'c4', title: 'Python Programming', subject: 'programming', level: 'intermediate', status: 'draft', enrolledCount: 0, lessonCount: 10, completionRate: 0, createdAt: '2024-04-01' },
]

export const trainerStudents: TrainerStudent[] = [
  { id: 'u2', name: 'Kolade Adebayo', email: 'kolade@gmail.com', enrolledCourses: ['c1', 'c2'], progress: { c1: 42, c2: 25 }, lastActive: '2026-06-30', joinedAt: '2024-02-10' },
  { id: 'u3', name: 'Amaka Okonkwo', email: 'amaka@gmail.com', enrolledCourses: ['c1'], progress: { c1: 88 }, lastActive: '2026-06-29', joinedAt: '2024-03-01' },
  { id: 'u4', name: 'Chidi Obi', email: 'chidi@gmail.com', enrolledCourses: ['c2', 'c3'], progress: { c2: 60, c3: 30 }, lastActive: '2026-06-28', joinedAt: '2024-03-15' },
  { id: 'u5', name: 'Ngozi Eze', email: 'ngozi@gmail.com', enrolledCourses: ['c1', 'c3'], progress: { c1: 100, c3: 75 }, lastActive: '2026-07-01', joinedAt: '2024-01-20' },
  { id: 'u6', name: 'Emeka Nwosu', email: 'emeka@gmail.com', enrolledCourses: ['c2'], progress: { c2: 15 }, lastActive: '2026-06-25', joinedAt: '2024-04-05' },
]

export const trainerSessions: TrainerLiveSession[] = [
  { id: 'lc1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'scheduled', attendees: 0 },
  { id: 'lc2', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Deep Dive', date: '2026-07-12T10:00:00', duration: 60, meetUrl: 'https://meet.google.com/abc-defg-hij', status: 'scheduled', attendees: 0 },
  { id: 'lc3', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', duration: 60, meetUrl: 'https://zoom.us/j/123456', status: 'scheduled', attendees: 0 },
  { id: 'lc4', courseId: 'c3', courseTitle: 'Algebra & Equations', title: 'Quadratics Workshop', date: '2026-06-20T11:00:00', duration: 90, meetUrl: '#', status: 'completed', attendees: 11 },
]

export const trainerAssignments: TrainerAssignment[] = [
  { id: 'a1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Fractions Worksheet', dueDate: '2026-07-08', totalSubmissions: 14, pendingReview: 5, createdAt: '2026-06-28' },
  { id: 'a2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Build a Calculator', dueDate: '2026-07-10', totalSubmissions: 9, pendingReview: 4, createdAt: '2026-06-29' },
  { id: 'a3', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Number Patterns Quiz', dueDate: '2026-06-28', totalSubmissions: 18, pendingReview: 0, createdAt: '2026-06-15' },
]
