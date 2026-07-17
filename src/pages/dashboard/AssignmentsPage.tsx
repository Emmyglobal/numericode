import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { Assignment } from '@/features/assignments/types'

type Tab = 'pending' | 'completed'
const tabs: Tab[] = ['pending', 'completed']

const borderColor: Record<string, string> = {
  pending:   'border-l-orange-500',
  overdue:   'border-l-red-600',
  submitted: 'border-l-green-600',
}

export default function AssignmentsPage() {
  usePageTitle('Assignments')
  const [tab, setTab] = useState<Tab>('pending')

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn:  () => dashboardService.getAssignments() as Promise<Assignment[]>,
  })

  const filtered = assignments?.filter(a =>
    tab === 'pending' ? a.status !== 'submitted' : a.status === 'submitted'
  ) ?? []

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Track your pending and completed work" />

      {/* Tabs */}
      <div role="tablist" aria-label="Assignment status" className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium capitalize transition-all',
              tab === t
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon={<ClipboardList className="w-16 h-16" />}
            title={`No ${tab} assignments`}
            description="You're all caught up!"
          />
        ) : (
          <ul className="space-y-3" aria-label={`${tab} assignments`}>
            {filtered.map(a => (
              <li
                key={a.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-lg border-l-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4',
                  borderColor[a.status]
                )}
                aria-label={`${a.title} — ${a.status}, due ${formatDate(a.dueDate)}`}
              >
                <div className="min-w-0">
                  <p className="text-xs text-brand-blue font-medium mb-1">{a.courseTitle}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Due <time dateTime={a.dueDate}>{formatDate(a.dueDate)}</time>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={a.status}>{a.status}</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`View ${a.title}`}
                  >
                    View
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
