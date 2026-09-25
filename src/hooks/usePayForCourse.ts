import { useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsService, type InitiatePaymentResult } from '@/services/payments.service'

interface PayForCourseOptions {
  /**
   * Called when the backend reports that a VERIFIED payment already existed and
   * the enrolment row was repaired (no checkout needed) — the local UI can then
   * flip straight to the enrolled state.
   */
  onEnrollmentGranted?: (courseId: string) => void
}

/**
 * Premium-course checkout initiation (provider-neutral — Phase 21).
 *
 * Starts checkout through the backend, which owns the price/currency and the
 * active provider (PAYMENT_PROVIDER), then sends the browser to the provider's
 * hosted page. The frontend never decides payment success: /payment/callback
 * asks the backend for the verified state before the course unlocks.
 */
export function usePayForCourse(courseId: string, options?: PayForCourseOptions) {
  const queryClient = useQueryClient()
  const { onEnrollmentGranted } = options ?? {}

  return useMutation({
    mutationFn: () => paymentsService.initiate(courseId),
    onSuccess: (result: InitiatePaymentResult) => {
      const checkoutUrl = result.checkoutUrl ?? result.authorizationUrl
      if (checkoutUrl) {
        window.location.assign(checkoutUrl)
        return
      }
      // A verified payment can already exist while its enrolment insert was
      // interrupted. The API repairs that row and returns this marker; refresh
      // every consumer of enrollment state so the user is not sent back into
      // checkout.
      if (result.enrollmentGranted && result.courseId) {
        onEnrollmentGranted?.(result.courseId)
        queryClient.invalidateQueries({ queryKey: ['dashboard-my-courses'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] })
        queryClient.invalidateQueries({ queryKey: ['course-access', result.courseId] })
        queryClient.invalidateQueries({ queryKey: ['availableForEnrollment'] })
      }
    },
  })
}
