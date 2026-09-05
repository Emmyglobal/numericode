import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { AdminPayment } from '@/features/admin/types'

const statusVariant: Record<AdminPayment['status'], 'submitted' | 'pending' | 'overdue' | 'past'> = {
  verified: 'submitted',
  pending: 'pending',
  failed: 'overdue',
  abandoned: 'past',
  refunded: 'past',
  disputed: 'overdue',
}

const statusIcon: Record<AdminPayment['status'], typeof CheckCircle> = {
  verified: CheckCircle,
  pending: Clock,
  failed: XCircle,
  abandoned: XCircle,
  refunded: AlertTriangle,
  disputed: AlertTriangle,
}

export default function AdminPaymentsPage() {
  usePageTitle('Payment Approvals — Admin')
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null)
  const q = useDebounce(search)

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => { const r = await api.get<{ data: AdminPayment[] }>('/admin/payments'); return r.data.data },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/payments/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setApproveConfirmId(null)
      setSuccessMessage('Payment approved and enrollment granted successfully.')
    },
    onError: (err: any) => {
      setSuccessMessage('')
      alert(err?.response?.data?.message || 'Failed to approve payment')
    },
  })

  const filtered = useMemo(() => {
    if (!payments) return []
    return payments.filter(p => {
      const matchesSearch = !q ||
        p.user.name.toLowerCase().includes(q.toLowerCase()) ||
        p.user.email.toLowerCase().includes(q.toLowerCase()) ||
        p.course.title.toLowerCase().includes(q.toLowerCase()) ||
        p.reference.toLowerCase().includes(q.toLowerCase())
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [payments, q, statusFilter])

  const pendingCount = payments?.filter(p => p.status === 'pending' && !p.isEnrolled).length ?? 0

  const formatAmount = (amountSubunits: number, currency: string) => {
    const amount = amountSubunits / 100
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Approvals"
        subtitle="Review and approve premium course payments"
        actions={
          pendingCount > 0 && (
            <Badge variant="pending">{pendingCount} pending</Badge>
          )
        }
      />

      {successMessage && (
        <Alert type="success" title="Success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, email, course, or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-brand-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-brand-blue"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description={search || statusFilter ? 'Try adjusting your search or filter.' : 'Payments will appear here when students purchase premium courses.'}
        />
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">User</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">Enrolled</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(payment => {
                  const StatusIcon = statusIcon[payment.status]
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{payment.user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{payment.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-white">{payment.course.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Ref: {payment.reference.slice(0, 12)}...</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatAmount(payment.amountSubunits, payment.currency)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{payment.currency}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={cn('w-4 h-4', {
                            'text-green-500': payment.status === 'verified',
                            'text-yellow-500': payment.status === 'pending',
                            'text-red-500': payment.status === 'failed' || payment.status === 'disputed',
                            'text-gray-400': payment.status === 'abandoned' || payment.status === 'refunded',
                          })} />
                          <Badge variant={statusVariant[payment.status]}>{payment.status}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {formatDate(payment.initializedAt)}
                      </td>
                      <td className="px-4 py-3">
                        {payment.isEnrolled ? (
                          <Badge variant="submitted">Yes</Badge>
                        ) : (
                          <Badge variant="pending">No</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.status === 'pending' && !payment.isEnrolled && (
                          <Button
                            size="sm"
                            loading={approveMutation.isPending && approveConfirmId === payment.id}
                            onClick={() => setApproveConfirmId(payment.id)}
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </Button>
                        )}
                        {payment.status === 'pending' && payment.isEnrolled && (
                          <span className="text-xs text-gray-500">Enrolled</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-confirm-title"
            className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 id="approve-confirm-title" className="text-lg font-bold text-gray-900 dark:text-white">
                Approve Payment
              </h2>
            </div>

            {(() => {
              const payment = payments?.find(p => p.id === approveConfirmId)
              if (!payment) return null
              return (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Approve payment from <strong className="text-gray-900 dark:text-white">{payment.user.name}</strong> for:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                    <div className="font-medium text-gray-900 dark:text-white">{payment.course.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Amount: {formatAmount(payment.amountSubunits, payment.currency)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Reference: {payment.reference}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    This will grant the user full access to the premium course.
                  </p>
                </>
              )
            })()}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setApproveConfirmId(null)}>Cancel</Button>
              <Button
                loading={approveMutation.isPending}
                onClick={() => approveMutation.mutate(approveConfirmId)}
              >
                <CheckCircle className="w-4 h-4" /> Confirm Approval
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}