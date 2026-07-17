import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'
import type { NotificationsResponse } from '@/features/notifications/types'

export const notificationsService = {
  list: async () => {
    const { data } = await api.get<ApiResponse<NotificationsResponse>>('/notifications')
    return data.data
  },
  markAsRead: async (id: string) => {
    const { data } = await api.patch<ApiResponse<{ id: string; isRead: boolean }>>(`/notifications/${id}/read`)
    return data.data
  },
  markAllAsRead: async () => {
    const { data } = await api.patch<ApiResponse<{ success: boolean }>>('/notifications/read-all')
    return data.data
  },
}
