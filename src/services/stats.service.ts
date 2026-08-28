import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface PublicStats {
  publishedCourses: number
  learners: number
  registeredTrainers: number
  liveClasses: number
}

export const statsService = {
  get: async () => { const { data } = await api.get<ApiResponse<PublicStats>>('/stats'); return data.data },
}