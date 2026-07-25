import { api } from '@/lib/axios'
import type { Course } from '@/features/courses/types'
import type { ApiResponse } from '@/types/api.types'
export interface AvailableTeacher { id: string; name: string; subjects: Array<'mathematics' | 'programming'> }
export interface AvailableCourseForEnrollment { id: string; title: string; subject: string; level: string; instructorName: string; instructorId: string }
export interface EnrollResult { enrolledCourses: string[]; count: number }
export const coursesService = {
  getAll:   async (params?: { subject?: string; q?: string; accessLevel?: 'free' | 'premium' }) => { const { data } = await api.get<ApiResponse<Course[]>>('/courses', { params }); return data.data },
  getById:  async (id: string) => { const { data } = await api.get<ApiResponse<Course>>(`/courses/${id}`); return data.data },
  requestCourse: async (id: string) => { const { data } = await api.post<ApiResponse<{ id: string; status: string }>>(`/courses/${id}/request`); return data.data },
  getAvailableTeachers: async () => { const { data } = await api.get<ApiResponse<AvailableTeacher[]>>('/courses/teachers'); return data.data },
  getAvailableForEnrollment: async (teacherId?: string) => { const { data } = await api.get<ApiResponse<AvailableCourseForEnrollment[]>>('/courses/available-for-enrollment', { params: teacherId ? { teacherId } : {} }); return data.data },
  enrollInCourses: async (courseIds: string[]) => { const { data } = await api.post<ApiResponse<EnrollResult>>('/courses/enroll', { courseIds }); return data.data },
}
