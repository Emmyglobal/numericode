import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquareQuote, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDate } from '@/utils/formatDate'
import {
  testimonialsService,
  type ModerationStatus,
  type ModerationTestimonial,
} from '@/services/testimonials.service'

const FILTERS: { value: ModerationStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const statusBadge: Record<ModerationStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default function AdminTestimonialsPage() {
  usePageTitle('Testimonials — Admin')
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<ModerationStatus | 'all'>('pending')

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['admin', 'testimonials', filter],
    queryFn: () => testimonialsService.listAll(filter === 'all' ? undefined : filter),
  })

  const moderateMutation = useMutation({
    mutationFn: (vars: { id: string; status: 'approved' | 'rejected' }) =>
      testimonialsService.moderate(vars.id, vars.status),
    onSuccess: () => {
      // Refresh the queue and the public list, since approving one changes both.
      queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['public-testimonials'] })
    },
  })

  const pendingId = moderateMutation.isPending ? moderateMutation.variables?.id : undefined

  return (
    <div>
      <PageHeader
        title="Testimonials"
        subtitle="Review learner submissions before they appear on the public site"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : testimonials.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="w-10 h-10" />}
          title={filter === 'pending' ? 'No testimonials awaiting review' : 'Nothing here yet'}
          description={filter === 'pending'
            ? 'New submissions from learners will appear here for approval.'
            : 'Try another filter to see submitted testimonials.'}
        />
      ) : (
        <ul className="grid gap-4">
          {testimonials.map((t: ModerationTestimonial) => (
            <li key={t.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5 shadow-card">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[t.status]}`}>{t.status}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(t.createdAt)}</span>
              </div>

              {/* Email is moderator-only: it is used to verify the submission and is never published. */}
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                {t.email}
                {t.course && <> · {t.course}</>}
                {t.location && <> · {t.location}</>}
                {!t.consent && <> · <span className="text-red-600 dark:text-red-400">consent not given</span></>}
              </p>

              <blockquote className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200">“{t.message}”</blockquote>

              {t.status !== 'approved' && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" loading={pendingId === t.id} onClick={() => moderateMutation.mutate({ id: t.id, status: 'approved' })}>
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Approve &amp; publish
                  </Button>
                  <Button size="sm" variant="secondary" disabled={pendingId === t.id} onClick={() => moderateMutation.mutate({ id: t.id, status: 'rejected' })}>
                    <XCircle className="w-4 h-4" aria-hidden="true" /> Reject
                  </Button>
                </div>
              )}
              {t.status === 'approved' && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" disabled={pendingId === t.id} onClick={() => moderateMutation.mutate({ id: t.id, status: 'rejected' })}>
                    <XCircle className="w-4 h-4" aria-hidden="true" /> Unpublish
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}