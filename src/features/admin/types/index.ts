export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'student' | 'trainer' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  joinedAt: string
  lastActive: string
}

export interface AdminCourse {
  id: string
  title: string
  subject: 'mathematics' | 'programming'
  level: 'beginner' | 'intermediate' | 'advanced'
  instructor: string
  status: 'published' | 'draft' | 'archived'
  enrolledCount: number
  accessLevel: 'free' | 'premium'
  priceCents: number
  currency: string
  premiumEnabled: boolean
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalTrainers: number
  totalCourses: number
  activeCourses: number
  totalLiveSessions: number
  totalEnrolments: number
  pendingTrainers: number
  platformGrowth: number
}

export interface AdminAnnouncement {
  id: string
  title: string
  body: string
  audience: 'all' | 'students' | 'trainers'
  createdAt: string
  createdBy: string
}
