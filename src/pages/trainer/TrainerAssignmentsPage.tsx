import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { api } from '@/lib/axios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDate } from '@/utils/formatDate'
import type { TrainerAssignment } from '@/features/trainer/types'

export default function TrainerAssignmentsPage() {
  usePageTitle('Assignments — Trainer')
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['trainer','assignments'],
    queryFn: async () => { const r = await api.get<{data:TrainerAssignment[]}>('/trainer/assignments'); return r.data.data }
  })
  return (
    <div>
      <PageHeader title="Assignments" subtitle="Review student submissions across all your courses"/>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><Skeleton key={i} className="h-20"/>)}</div>
      : !assignments?.length ? <EmptyState icon={<ClipboardList className="w-16 h-16"/>} title="No assignments yet" description="Create assignments in your courses to see them here."/>
      : <div className="space-y-3">
          {assignments.map(a=>(
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
              <div className="min-w-0">
                <p className="text-xs text-teal font-medium mb-1">{a.courseTitle}</p>
                <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Due <time dateTime={a.dueDate}>{formatDate(a.dueDate)}</time> · {a.totalSubmissions} submissions</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {a.pendingReview > 0
                  ? <Badge variant="pending">{a.pendingReview} to review</Badge>
                  : <Badge variant="submitted">All reviewed</Badge>}
                <Button variant="secondary" size="sm" aria-label={`Review ${a.title}`}>Review</Button>
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}
