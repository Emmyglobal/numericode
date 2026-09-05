import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { paymentsService } from '@/services/payments.service'
import { Button } from '@/components/ui/Button'
import { SectionWrapper } from '@/components/shared/SectionWrapper'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * Payment return page (Phase 16L).
 *
 * SECURITY INVARIANT: the URL/query from the payment provider is NOT trusted.
 * A `?reference=` in the URL means "there is something to CHECK", never
 * "the payment succeeded". Access state comes exclusively from the backend's
 * verified payment status endpoint.
 */
export default function PaymentCallbackPage() {
  usePageTitle('Payment status')
  const [params] = useSearchParams()
  const reference = params.get('reference') ?? params.get('trxref')
  const { isAuthenticated } = useAuth()

  const statusQuery = useQuery({
    queryKey: ['payment-status', reference],
    queryFn: () => paymentsService.getStatus(reference!),
    enabled: Boolean(reference) && isAuthenticated,
    // While pending, keep asking the backend (webhook + verify decide, not the URL).
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'pending' ? 5_000 : false
    },
    retry: 1,
  })

  return (
    <SectionWrapper className="py-20">
      <div className="mx-auto max-w-xl rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-lg p-8 text-center">
        {!reference && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Missing payment reference</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              No payment reference was provided, so there is nothing to check.
            </p>
            <Link to="/courses"><Button variant="secondary">Browse courses</Button></Link>
          </>
        )}

        {reference && !isAuthenticated && (
          <>
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to check your payment</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Payment status is private — sign in with the account you used at checkout.
            </p>
            <Link to="/login"><Button>Sign in</Button></Link>
          </>
        )}

        {reference && isAuthenticated && statusQuery.isLoading && (
          <>
            <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Checking your payment…</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confirming with our payment provider. Do not close this page.</p>
          </>
        )}

        {reference && isAuthenticated && statusQuery.isError && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Could not verify payment</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We could not reach the payment service. Your payment is never lost — try again in a moment.
            </p>
            <Button variant="secondary" onClick={() => statusQuery.refetch()}>Try again</Button>
          </>
        )}

        {reference && isAuthenticated && statusQuery.data && statusQuery.data.status === 'verified' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment confirmed</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {statusQuery.data.enrollmentGranted
                ? <>You now have full access to <strong>{statusQuery.data.course?.title}</strong>.</>
                : 'Your payment is confirmed — enrolment is being finalised. Refresh in a moment.'}
            </p>
            {statusQuery.data.enrollmentGranted && statusQuery.data.course && (
              <Link to={`/dashboard/courses/${statusQuery.data.course.id}`} className="inline-flex">
                <Button>
                  Go to your course <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </>
        )}

        {reference && isAuthenticated && statusQuery.data && statusQuery.data.status === 'pending' && (
          <>
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment processing</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We are waiting for the payment provider&apos;s confirmation. This page updates automatically.
              You can safely leave and return later.
            </p>
            <Button variant="secondary" loading={statusQuery.isFetching} onClick={() => statusQuery.refetch()}>Check again</Button>
          </>
        )}

        {reference && isAuthenticated && statusQuery.data && (statusQuery.data.status === 'failed' || statusQuery.data.status === 'abandoned') && (
          <>
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {statusQuery.data.status === 'abandoned' ? 'Payment not completed' : 'Payment failed'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {statusQuery.data.failureReason ?? 'No charge was confirmed for this payment. You have not been enrolled.'}
            </p>
            <div className="flex justify-center gap-3">
              {statusQuery.data.course && (
                <Link to={`/courses/${statusQuery.data.course.id}`}><Button>Back to course</Button></Link>
              )}
              <Link to="/courses"><Button variant="secondary">Browse courses</Button></Link>
            </div>
          </>
        )}

        {reference && isAuthenticated && statusQuery.data && (statusQuery.data.status === 'refunded' || statusQuery.data.status === 'disputed') && (
          <>
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {statusQuery.data.status === 'refunded' ? 'Payment refunded' : 'Payment under dispute'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Contact support for details about this payment.</p>
            <Link to="/contact"><Button variant="secondary">Contact support</Button></Link>
          </>
        )}
      </div>
    </SectionWrapper>
  )
}