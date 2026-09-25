import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api.types'

// ─── Payments service (Phase 16/21 — provider-neutral premium checkout) ───────
// The frontend NEVER decides payment success. It only:
//   1. asks the backend to initialize checkout (server-authoritative price; the
//      backend selects the active provider via PAYMENT_PROVIDER),
//   2. redirects the browser to the provider's authorization URL,
//   3. asks the backend for the verified status on return.

export interface InitiatePaymentResult {
  /** Present when a new provider checkout was created. */
  reference?: string
  /** Provider-neutral redirect URL (Flutterwave Standard / Paystack both return it). */
  checkoutUrl?: string
  /** Legacy alias of checkoutUrl — kept so older callers keep working. */
  authorizationUrl?: string
  /** Which provider created this checkout ('paystack' | 'flutterwave'). */
  provider?: string
  amountSubunits?: number
  currency?: string
  courseTitle?: string
  /** Present when an existing verified payment was repaired. */
  enrollmentGranted?: boolean
  alreadyHasAccess?: boolean
  courseId?: string
}

export type PaymentStatusValue = 'pending' | 'verified' | 'failed' | 'abandoned' | 'refunded' | 'disputed'

export interface PaymentStatusResult {
  provider?: string
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