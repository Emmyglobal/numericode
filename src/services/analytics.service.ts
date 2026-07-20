import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface LearningAnalytics {
  courseId: string; courseTitle: string; totalTimeSpent: number; totalInteractions: number
  lessonAnalytics: Array<{
    id: string; lessonId: string; lessonTitle: string
    timeSpent: number; interactions: number; lastAccessed: string
  }>
}

export interface StudentEngagement {
  userId: string; name: string; email: string
  lessonsAccessed: number; totalTimeSpent: number; totalInteractions: number
  lastAccessed: string | null
}

export interface DripContent {
  id: string; courseId: string; moduleId?: string; moduleTitle?: string
  lessonId?: string; lessonTitle?: string; releaseDate: string
}

export interface CoursePrerequisite {
  id: string; courseId: string; prerequisiteId: string
  prerequisiteTitle: string; prerequisiteDescription: string
}

export const analyticsService = {
  // Learning Analytics
  trackActivity: (data: { courseId: string; lessonId?: string; timeSpent: number; interactions: number }) =>
    api.post<ApiResponse<{ success: boolean }>>('/analytics/track', data).then(r => r.data.data),

  getLearningAnalytics: (courseId: string) =>
    api.get<ApiResponse<LearningAnalytics>>(`/analytics/courses/${courseId}`).then(r => r.data.data),

  getStudentEngagementReport: (courseId: string) =>
    api.get<ApiResponse<StudentEngagement[]>>(`/analytics/courses/${courseId}/engagement`).then(r => r.data.data),

  // Drip Content
  getDripContentSchedule: (courseId: string) =>
    api.get<ApiResponse<DripContent[]>>(`/courses/${courseId}/drip-content`).then(r => r.data.data),

  createDripContent: (data: { courseId: string; moduleId?: string; lessonId?: string; releaseDate: string }) =>
    api.post<ApiResponse<DripContent>>(`/courses/${data.courseId}/drip-content`, data).then(r => r.data.data),

  // Course Prerequisites
  getCoursePrerequisites: (courseId: string) =>
    api.get<ApiResponse<CoursePrerequisite[]>>(`/courses/${courseId}/prerequisites`).then(r => r.data.data),

  addCoursePrerequisite: (courseId: string, prerequisiteId: string) =>
    api.post<ApiResponse<CoursePrerequisite>>(`/courses/${courseId}/prerequisites`, { prerequisiteId }).then(r => r.data.data),
}