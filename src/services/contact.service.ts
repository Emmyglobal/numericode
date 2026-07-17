import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface ContactFormPayload {
  name: string
  email: string
  subject: string
  message: string
}

export const contactService = {
  submit: async (payload: ContactFormPayload) => {
    const { data } = await api.post<ApiResponse<{ sent: boolean }>>('/contact', payload)
    return data.data
  },
}
