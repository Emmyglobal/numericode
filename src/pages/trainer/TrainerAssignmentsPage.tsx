import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ClipboardList, Plus, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import { formatDate } from '@/utils/formatDate'
import { assignmentsService } from '@/services/assignments.service'
import { AssignmentFormModal, type AssignmentDraftValues } from '@/features/assignments/components/AssignmentFormModal'
import type { AssignmentSubmission } from '@/features/assignments/types'

const typeLabel: Record<string, string> = {
  mcq: 'Multiple choice',
  theory: 'Theory',
  subjective: 'Subjective',
  file: 'File upload',
  mixed: 'Mixed questions',
}

export default function TrainerAssignmentsPage() {
  usePageTitle('Assignments — Trainer')
  const queryClient = useQueryClient()
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [grades, setGrades] = useState<Record<string, { score: string; feedback: string }>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError] = useState('')

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['trainer', 'assignments'],
    queryFn: () => assignmentsService.getTrainer(),
  })

  const { data: courses } = useQuery({
    queryKey: ['trainer', 'courses-lite'],
    queryFn: async () => {
      const res = await import('@/lib/axios').then(m => m.api.get<{ data: Array<{ id: string; title: string }> }>('/trainer/courses'))
      return res.data.data
    },
  })

  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['trainer', 'submissions', assignmentId],
    queryFn: () => assignmentsService.getSubmissions(assignmentId!),
    enabled: Boolean(assignmentId),
  })

  const createMutation = useMutation({
    mutationFn: (values: AssignmentDraftValues) => assignmentsService.create(values),
    onSuccess: () => {
      setShowCreate(false)
      setCreateError('')
      queryClient.invalidateQueries({ queryKey: ['trainer', 'assignments'] })
    },
    onError: (err: any) => setCreateError(err?.message ?? 'Failed to create assignment.'),
  })

  const gradeMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { score: number; feedback?: string } }) => assignmentsService.gradeSubmission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer', 'submissions', assignmentId] })
      queryClient.invalidateQueries({ queryKey: ['trainer', 'assignments'] })
    },
  })

  const selected = assignments?.find(a => a.id === assignmentId)

  const publishGrade = (submission: AssignmentSubmission) => {
    const grade = grades[submission.id] ?? { score: submission.score?.toString() ?? '', feedback: submission.feedback ?? '' }
    gradeMutation.mutate({ id: submission.id, payload: { score: Number(grade.score) || 0, feedback: grade.feedback } })
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Create typed assignments (or generate with AI), review student submissions, and publish grades."
        actions={(
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" /> Create Assignment
          </Button>
        )}
      />

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : !assignments?.length ? (
        <EmptyState icon={<ClipboardList className="h-16 w-16" />} title="No assignments yet" description="Create assignments in your courses to see them here." />
      ) : (
        <div className="space-y-3">
          {assignments.map(assignment => (
            <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-teal">{assignment.courseTitle}</p>
                  {assignment.type && <Badge variant="pending">{typeLabel[assignment.type] ?? assignment.type}</Badge>}
                  {assignment.aiGenerated && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                      <Sparkles className="h-3 w-3" aria-hidden="true" /> AI
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Due {formatDate(assignment.dueDate)} · {assignment.totalSubmissions} submissions · {assignment.totalMarks} marks
                  {assignment.description ? ` · ${assignment.questions?.length ?? 0} questions` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {assignment.pendingReview > 0 ? <Badge variant="pending">{assignment.pendingReview} to review</Badge> : <Badge variant="submitted">All reviewed</Badge>}
                <Button variant="secondary" size="sm" onClick={() => setAssignmentId(assignment.id)}>Review</Button>
              </div>
            </div>
                    ))}
        </div>
      )}

      {assignmentId && (
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{selected?.title} submissions</h2>
              <p className="text-xs text-gray-500">Passing score: {selected?.passingScore}/{selected?.totalMarks}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAssignmentId(null)}>Close</Button>
          </div>
          {submissionsLoading ? <Skeleton className="h-20" /> : !submissions?.length ? <p className="text-sm text-gray-500">No student submissions yet.</p> : (
            <div className="space-y-4">
              {submissions.map(submission => {
                const grade = grades[submission.id] ?? { score: submission.score?.toString() ?? '', feedback: submission.feedback ?? '' }
                return (
                  <div key={submission.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{submission.studentName}</p>
                        <p className="text-xs text-gray-500">{submission.studentEmail} · {submission.status}</p>
                      </div>
                      {submission.submittedAt && <time className="text-xs text-gray-500">{formatDate(submission.submittedAt)}</time>}
                    </div>
                    {submission.answers && submission.answers.length > 0 && (
                      <div className="my-3 space-y-2 rounded bg-gray-50 p-2 text-sm dark:bg-gray-800">
                        <p className="font-medium text-gray-600 dark:text-gray-300">Student answers:</p>
                        <ul className="space-y-1 list-disc pl-5 text-gray-700 dark:text-gray-300">
                          {submission.answers.map((ans, i) => (
                            <li key={i}>
                              Q{i + 1}: {ans.selectedIndex !== undefined ? `Option ${ans.selectedIndex + 1}` : (ans.answer || ans.fileName || 'no answer')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {submission.fileName && <p className="my-2 text-xs text-gray-500">Attached file: {submission.fileName}</p>}
                    <div className="grid gap-2 sm:grid-cols-[9rem_1fr_auto_auto]">
                      <input aria-label={`Score for ${submission.studentName}`} type="number" min={0} max={submission.totalMarks} value={grade.score}
                        onChange={event => setGrades(cur => ({ ...cur, [submission.id]: { ...grade, score: event.target.value } }))}
                        placeholder={`Score / ${submission.totalMarks}`}
                        className="rounded border border-gray-200 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                      <input aria-label={`Feedback for ${submission.studentName}`} value={grade.feedback}
                        onChange={event => setGrades(cur => ({ ...cur, [submission.id]: { ...grade, feedback: event.target.value } }))}
                        placeholder="Feedback…"
                        className="rounded border border-gray-200 bg-white px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
                      <Button size="sm" loading={gradeMutation.isPending} onClick={() => publishGrade(submission)}>Publish</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {showCreate && (
        <AssignmentFormModal
          courses={courses ?? []}
          isSubmitting={createMutation.isPending}
          error={createError}
          onClose={() => { setShowCreate(false); setCreateError('') }}
          onSubmit={values => createMutation.mutate(values)}
              />
      )}
    </div>
  )
}