import { api } from '@/lib/axios'
import type { Course } from '@/features/courses/types'
import type { ApiResponse } from '@/types/api.types'
export interface AvailableTeacher { id: string; name: string; subjects: Array<'mathematics' | 'programming'> }
export const coursesService = {
  getAll:   async (params?: { subject?: string; q?: string; accessLevel?: 'free' | 'premium' }) => { const { data } = await api.get<ApiResponse<Course[]>>('/courses', { params }); return data.data },
  getById:  async (id: string) => { const { data } = await api.get<ApiResponse<Course>>(`/courses/${id}`); return data.data },
  requestCourse: async (id: string) => { const { data } = await api.post<ApiResponse<{ id: string; status: string }>>(`/courses/${id}/request`); return data.data },
  getAvailableTeachers: async () => { const { data } = await api.get<ApiResponse<AvailableTeacher[]>>('/courses/teachers'); return data.data },
}
