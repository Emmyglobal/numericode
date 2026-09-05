import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

// ─── Payments service (Phase 16 — Paystack premium-course checkout) ───────────
// The frontend NEVER decides payment success. It only:
//   1. asks the backend to initialize checkout (server-authoritative price),
//   2. redirects the browser to the provider's authorization URL,
//   3. asks the backend for the verified status on return.

export interface InitiatePaymentResult {
  reference: string
  authorizationUrl: string
  amountSubunits: number
  currency: string
  courseTitle: string
}

export type PaymentStatusValue = 'pending' | 'verified' | 'failed' | 'abandoned' | 'refunded' | 'disputed'

export interface PaymentStatusResult {
  reference: string
  status: PaymentStatusValue
  amountSubunits: number
  currency: string
  course: { id: string; title: string } | null
  enrollmentGranted: boolean
  failureReason: string | null
  paidAt: string | null
  createdAt: string
}

export const paymentsService = {
  /** Ask the backend to create a checkout for a premium course and return the provider redirect URL. */
  initiate: async (courseId: string): Promise<InitiatePaymentResult> => {
    const { data } = await api.post<ApiResponse<InitiatePaymentResult>>('/payments/initiate', { courseId })
    return data.data
  },
  /** Ask the backend for the verified payment state (the only source of truth). */
  getStatus: async (reference: string): Promise<PaymentStatusResult> => {
    const { data } = await api.get<ApiResponse<PaymentStatusResult>>(`/payments/${encodeURIComponent(reference)}`)
    return data.data
  },
}