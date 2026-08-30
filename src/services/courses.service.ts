import { api } from '@/lib/axios'
import type { Course, CourseSummary } from '@/features/courses/types'
import type { ApiResponse } from '@/types/api.types'
import type { TrainerStudent, TrainerLiveSession as TrainerSession } from '@/features/trainer/types'
export interface AvailableTeacher { id: string; name: string; bio: string; avatarUrl?: string; subjects: Array<'mathematics' | 'programming'>; courses?: { id: string; title: string; subject: string; level: string }[] }
export interface PublicTrainerProfile {
  id: string; name: string; bio: string; avatarUrl?: string; subjects: string[]
  courses: { id: string; title: string; subject: string; level: string; lessonCount: number }[]
}
export interface AvailableCourseForEnrollment { id: string; title: string; subject: string; level: string; instructorName: string; instructorId: string }
export interface TrainerSessionInput { courseId: string; title: string; date: string; duration: number; meetUrl?: string; sessionType?: 'group' | 'individual'; studentIds?: string[]; extensionMinutes?: number }
export interface EnrollResult { enrolledCourses: string[]; count: number }
export interface CourseListParams {
  subject?: string
  q?: string
  accessLevel?: 'free' | 'premium'
  level?: string
  instructorId?: string
  sort?: 'newest' | 'title' | 'level'
  limit?: number
  offset?: number
}

export interface CourseListResponse {
  data: CourseSummary[]
  pagination: {
    total: number
    limit: number
    offset: number
    count: number
    hasMore: boolean
  }
}

export const coursesService = {
  getAll: async (params?: { subject?: string; q?: string; accessLevel?: 'free' | 'premium' }) => {
    const { data } = await api.get<ApiResponse<Course[]>>('/courses', { params })
    return data.data
  },
  /** Catalogue endpoint with pagination/sorting/level/trainer filtering.
      Returns the full paginated envelope. */
    getAllPaginated: async (params?: CourseListParams): Promise<CourseListResponse> => {
    const { data } = await api.get('/courses', { params })
    return data as unknown as CourseListResponse
  },
  getById:  async (id: string) => { const { data } = await api.get<ApiResponse<Course>>(`/courses/${id}`); return data.data },
  requestCourse: async (id: string) => { const { data } = await api.post<ApiResponse<{ id: string; status: string }>>(`/courses/${id}/request`); return data.data },
  getAvailableTeachers: async () => { const { data } = await api.get<ApiResponse<AvailableTeacher[]>>('/courses/teachers'); return data.data },
  getTrainerProfile: async (id: string) => { const { data } = await api.get<ApiResponse<PublicTrainerProfile>>(`/courses/teachers/${id}`); return data.data },
  getAvailableForEnrollment: async (teacherId?: string) => { const { data } = await api.get<ApiResponse<AvailableCourseForEnrollment[]>>('/courses/available-for-enrollment', { params: teacherId ? { teacherId } : {} }); return data.data },
  enrollInCourses: async (courseIds: string[]) => { const { data } = await api.post<ApiResponse<EnrollResult>>('/courses/enroll', { courseIds }); return data.data },
  createSession: async (payload: TrainerSessionInput) => { const { data } = await api.post<ApiResponse<TrainerSession>>('/trainer/sessions', payload); return data.data },
  updateSession: async (id: string, payload: Partial<TrainerSessionInput> & { status?: string }) => { const { data } = await api.put<ApiResponse<TrainerSession>>(`/trainer/sessions/${id}`, payload); return data.data },
  deleteSession: async (id: string) => { const { data } = await api.delete<ApiResponse<{ deleted: boolean }>>(`/trainer/sessions/${id}`); return data.data },
  getTrainerSessions: async () => { const { data } = await api.get<ApiResponse<TrainerSession[]>>('/trainer/sessions'); return data.data },
  getTrainerStudents: async () => { const { data } = await api.get<ApiResponse<TrainerStudent[]>>('/trainer/students'); return data.data },
  /** Which quiz (if any) currently gates a course. */
  getPrerequisiteQuiz: async (courseId: string) => { const { data } = await api.get<ApiResponse<{ courseId: string; prerequisiteQuizId: string | null }>>(`/courses/${courseId}/prerequisite-quiz`); return data.data },
  /** Attach ({ quizId }) or detach ({ quizId: null }) a course's prerequisite quiz. Trainer/admin only. */
  setPrerequisiteQuiz: async (courseId: string, quizId: string | null) => {
    const { data } = await api.put<ApiResponse<{ courseId: string; prerequisiteQuizId: string | null; message?: string }>>(
      `/courses/${courseId}/prerequisite-quiz`, { quizId },
    )
    return data.data
  },
}
