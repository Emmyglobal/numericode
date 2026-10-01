import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

export interface PublicTestimonial { id: string; name: string; course: string | null; location: string | null; message: string }
export interface SubmitTestimonialInput {
  name: string; email: string; course?: string; location?: string; message: string; consent: boolean
}

export type ModerationStatus = 'pending' | 'approved' | 'rejected'

/** The signed-in learner's own submission, with its review status. */
export interface MyTestimonial {
  id: string; name: string; course: string | null; message: string
  status: ModerationStatus; submittedAt: string
}

/** A submission as seen by an admin/trainer in the moderation queue. */
export interface ModerationTestimonial {
  id: string; name: string; email: string; course: string | null; location: string | null
  message: string; consent: boolean; status: ModerationStatus; createdAt: string
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

  /**
   * The signed-in learner's own submissions and their review status, so a
   * testimonial awaiting moderation does not look like it vanished.
   * Requires authentication; the backend resolves the account from the JWT.
   */
  listMine: async () => {
    const { data } = await api.get<ApiResponse<MyTestimonial[]>>('/testimonials/mine')
    return data.data
  },

  /** Admin/trainer: every testimonial, optionally filtered by status. */
  listAll: async (status?: ModerationStatus) => {
    const { data } = await api.get<ApiResponse<ModerationTestimonial[]>>(
      '/testimonials/admin/all',
      { params: status ? { status } : undefined },
    )
    return data.data
  },

  /** Admin/trainer: approve or reject a submission. */
  moderate: async (id: string, status: Exclude<ModerationStatus, 'pending'>) => {
    const { data } = await api.patch<ApiResponse<{ id: string; status: string }>>(
      `/testimonials/admin/${id}`,
      { status },
    )
    return data.data
  },
}