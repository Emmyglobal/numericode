import { usePageTitle } from '@/hooks/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  under_review: 'border-l-blue-500',
  passed: 'border-l-green-600',
  failed: 'border-l-red-600',
}

export default function AssignmentsPage() {
  usePageTitle('Assignments')
  const [tab, setTab] = useState<Tab>('pending')
  const [submissionContent, setSubmissionContent] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn:  () => dashboardService.getAssignments() as Promise<Assignment[]>,
  })

  const filtered = assignments?.filter(a =>
    tab === 'pending' ? !['submitted', 'passed', 'failed', 'graded'].includes(a.status) : ['submitted', 'passed', 'failed', 'graded'].includes(a.status)
  ) ?? []
  const gradeBook = useQuery({ queryKey: ['gradebook'], queryFn: () => dashboardService.getGradeBook() as Promise<Array<{ courseId: string; courseTitle: string; assignmentScore: number; attendanceScore: number; finalPercentage: number; letterGrade: string; completed: boolean }>> })
  const submitMutation = useMutation({ mutationFn: ({ id, content }: { id: string; content: string }) => dashboardService.submitAssignment(id, content), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assignments'] }) })

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
                  {a.score !== null && <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{a.score}/{a.totalMarks}</span>}
                  {a.status !== 'passed' && a.status !== 'failed' && <Button variant="secondary" size="sm" onClick={() => submitMutation.mutate({ id: a.id, content: submissionContent[a.id] ?? '' })} loading={submitMutation.isPending} aria-label={`Submit ${a.title}`}>Submit</Button>}
                </div>
                <div className="w-full"><label className="sr-only" htmlFor={`submission-${a.id}`}>Submission notes for {a.title}</label><textarea id={`submission-${a.id}`} value={submissionContent[a.id] ?? ''} onChange={event => setSubmissionContent(contents => ({ ...contents, [a.id]: event.target.value }))} placeholder="Add your response or submission link" className="mt-2 w-full rounded border border-gray-200 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800" />{a.feedback && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300"><strong>Trainer feedback:</strong> {a.feedback}</p>}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <section className="mt-8" aria-labelledby="gradebook-title"><h2 id="gradebook-title" className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Grade Book</h2><div className="grid gap-3 sm:grid-cols-2">{gradeBook.data?.map(grade => <div key={grade.courseId} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark"><p className="font-medium text-gray-900 dark:text-white">{grade.courseTitle}</p><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Final: <strong>{grade.finalPercentage}% ({grade.letterGrade})</strong> · Assignments: {grade.assignmentScore}% · Attendance: {grade.attendanceScore}%</p><p className="mt-1 text-xs text-gray-500">{grade.completed ? 'Certificate eligible' : 'Complete the course requirements to unlock your certificate.'}</p></div>)}</div></section>
    </div>
  )
}
