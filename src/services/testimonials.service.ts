import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface PublicTestimonial { id: string; name: string; course: string | null; location: string | null; message: string }
export interface SubmitTestimonialInput {
  name: string; email: string; course?: string; location?: string; message: string; consent: boolean
}

export const testimonialsService = {
  list: async () => { const { data } = await api.get<ApiResponse<PublicTestimonial[]>>('/testimonials'); return data.data },
  submit: async (input: SubmitTestimonialInput) => {
    // Submit without auth header - testimonials are public
    const { data } = await api.post<ApiResponse<{ id: string; status: string }>>('/testimonials', input, {
      headers: { Authorization: '' }
    })
    return data.data
  },
}