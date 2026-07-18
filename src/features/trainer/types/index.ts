export type TrainerCourseStatus = 'published' | 'draft' | 'archived'

export interface TrainerCourse {
  id: string
  title: string
  subject: 'mathematics' | 'programming'
  level: 'beginner' | 'intermediate' | 'advanced'
  status: TrainerCourseStatus
  enrolledCount: number
  lessonCount: number
  completionRate: number
  createdAt: string
}

export interface TrainerStudent {
  id: string
  name: string
  email: string
  enrolledCourses: string[]
  progress: Record<string, number>
  lastActive: string
  joinedAt: string
}

export interface TrainerLiveSession {
  id: string
  courseId: string
  courseTitle: string
  title: string
  date: string
  duration: number
  meetUrl: string
  status: 'scheduled' | 'live' | 'completed'
  attendees: number
}

export interface TrainerAssignment {
  id: string
  courseId: string
  courseTitle: string
  title: string
  dueDate: string
  totalSubmissions: number
  pendingReview: number
  totalMarks: number
  passingScore: number
  createdAt: string
}

export interface TrainerStats {
  totalStudents: number
  activeCourses: number
  totalSessions: number
  avgCompletionRate: number
  pendingReviews: number
  upcomingSessions: number
}
