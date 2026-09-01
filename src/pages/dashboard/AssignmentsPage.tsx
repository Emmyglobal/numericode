import { usePageTitle } from '@/hooks/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ClipboardList, Download, FileText } from 'lucide-react'
import { assignmentsService } from '@/services/assignments.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { AssignmentDetailModal } from '@/features/assignments/components/AssignmentDetailModal'
import { GradeBook } from '@/features/assignments/components/GradeBook'
import { downloadAssignment } from '@/features/assignments/lib/download'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { Assignment, AssignmentAnswer } from '@/features/assignments/types'

type Tab = 'pending' | 'completed'
const tabs: Tab[] = ['pending', 'completed']

const borderColor: Record<string, string> = {
  pending: 'border-l-orange-500',
  overdue: 'border-l-red-600',
  submitted: 'border-l-green-600',
  under_review: 'border-l-blue-500',
  passed: 'border-l-green-600',
  failed: 'border-l-red-600',
}

const typeLabel: Record<string, string> = {
  mcq: 'Multiple choice', theory: 'Theory', subjective: 'Subjective', file: 'File upload', mixed: 'Mixed',
}

export default function AssignmentsPage() {
  usePageTitle('Assignments')
  const [tab, setTab] = useState<Tab>('pending')
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [submitError, setSubmitError] = useState('')
  const queryClient = useQueryClient()

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: () => assignmentsService.getAll(),
  })

  const filtered = assignments?.filter(a =>
    tab === 'pending' ? !['submitted', 'passed', 'failed', 'graded'].includes(a.status) : ['submitted', 'passed', 'failed', 'graded'].includes(a.status)
  ) ?? []

  const submitMutation = useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: AssignmentAnswer[] }) => assignmentsService.submit(id, { answers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setSelected(null)
    },
    onError: (err: any) => setSubmitError(err?.message ?? 'Failed to submit. Please try again.'),
  })

  return (
    <div>
      <PageHeader title="Assignments" subtitle="Answer, submit and download your pending and completed work" />

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
              tab === t ? 'bg-brand-blue text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : !filtered.length ? (
          <EmptyState icon={<ClipboardList className="w-16 h-16" />} title={`No ${tab} assignments`} description="You're all caught up!" />
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
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-brand-blue font-medium mb-1">{a.courseTitle}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    Due <time dateTime={a.dueDate}>{formatDate(a.dueDate)}</time>
                    {a.type && <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" aria-hidden="true" />{typeLabel[a.type] ?? a.type}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={a.status}>{a.status}</Badge>
                  {a.score !== null && <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{a.score}/{a.totalMarks}</span>}
                  <Button variant="secondary" size="sm" onClick={() => downloadAssignment(a)}>
                    <Download className="w-4 h-4" aria-hidden="true" /> Download
                  </Button>
                  <Button size="sm" onClick={() => { setSubmitError(''); setSelected(a) }}>
                    {['submitted', 'passed', 'failed', 'graded'].includes(a.status) ? 'View' : 'Answer'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

{/* Grade Book (summary) */}
      <section className="mt-8" aria-labelledby="gradebook-title">
        <h2 id="gradebook-title" className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Grade Book</h2>
        <GradeBook />
      </section>
      {selected && (
        <AssignmentDetailModal
          assignment={selected}
          submitting={submitMutation.isPending}
          submitError={submitError}
          onClose={() => setSelected(null)}
          onSubmit={() => submitMutation.mutate({ id: selected.id, answers: [] })}
        />
      )}
    </div>
  )
}