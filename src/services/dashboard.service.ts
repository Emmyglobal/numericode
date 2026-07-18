import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
export const dashboardService = {
  getOverview:    async () => { const { data } = await api.get<ApiResponse<unknown>>('/dashboard'); return data.data },
  getMyCourses:   async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/dashboard/courses'); return data.data },
  getCourse:      async (id: string) => { const { data } = await api.get<ApiResponse<unknown>>(`/dashboard/courses/${id}`); return data.data },
  getAssignments: async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/assignments'); return data.data },
  getAnnouncements: async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/announcements'); return data.data },
  getResources:   async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/resources'); return data.data },
  getLiveClasses: async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/live-classes'); return data.data },
  getProfile:     async (role?: string) => { const { data } = await api.get<ApiResponse<unknown>>(role === 'trainer' ? '/trainer/profile' : '/profile'); return data.data },
  updateProfile:  async (payload: unknown, role?: string) => { const { data } = await api.put<ApiResponse<unknown>>(role === 'trainer' ? '/trainer/profile' : '/profile', payload); return data.data },
  getSubscription: async () => { const { data } = await api.get<ApiResponse<{ isActive: boolean; status: string }>>('/subscriptions/me'); return data.data },
  createCheckoutIntent: async (provider?: 'paystack' | 'flutterwave' | 'stripe') => { const { data } = await api.post<ApiResponse<unknown>>('/subscriptions/checkout-intents', { provider }); return data.data },
  getBoard: async (lessonId: string) => { const { data } = await api.get<ApiResponse<unknown>>(`/boards/lessons/${lessonId}`); return data.data },
  saveBoard: async (lessonId: string, boardData: unknown) => { const { data } = await api.put<ApiResponse<unknown>>(`/boards/lessons/${lessonId}`, { boardData }); return data.data },
  submitAssignment: async (assignmentId: string, content: string) => { const { data } = await api.post<ApiResponse<unknown>>(`/assignments/${assignmentId}/submission`, { content }); return data.data },
  getGradeBook: async () => { const { data } = await api.get<ApiResponse<unknown[]>>('/gradebook'); return data.data },
}
