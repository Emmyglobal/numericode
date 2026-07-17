import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export const studyGuideService = {
  ask: async (message: string) => {
    const { data } = await api.post<ApiResponse<{ answer: string }>>('/ai/study-guide', { message })
    return data.data
  },
}
