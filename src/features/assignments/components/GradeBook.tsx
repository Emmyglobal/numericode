import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { dashboardService } from '@/services/dashboard.service'
import { CheckCircle, XCircle, ClipboardList, FileText } from 'lucide-react'

interface QuizScore {
  quizId: string
  title: string
  /** Best completed attempt as a percentage; null when never attempted. */
  score: number | null
  passed: boolean
  attemptCount: number
  passingScore: number
}

interface AssignmentScore {
  assignmentId: string
  title: string
  status: string
  score: number | null
  totalMarks: number
  percentage: number | null
  submitted: boolean
  written: boolean
}

export interface GradeEntry {
  courseId: string
  courseTitle: string
  completed: boolean
  finalPercentage: number
  letterGrade: string
  quizzes?: QuizScore[]
  assignments?: AssignmentScore[]
}

function ScoreLine({ icon, title, right }: { icon: React.ReactNode; title: string; right: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1">
      <span className="flex min-w-0 items-center gap-1.5 text-gray-600 dark:text-gray-300">
        {icon}
        <span className="truncate">{title}</span>
      </span>
      <span className="shrink-0 font-medium text-gray-900 dark:text-white">{right}</span>
    </li>
  )
}

export function GradeBook() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gradebook'],
    queryFn: () => dashboardService.getGradeBook() as Promise<GradeEntry[]>,
  })

  if (isLoading) {
    return (
      <div className="space-y-2" aria-label="Loading grade book">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    )
  }

  if (isError || !data?.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Grade summary is not available right now.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-800/60 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-2 font-medium">Course</th>
            <th scope="col" className="px-4 py-2 font-medium">Grade</th>
            <th scope="col" className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map(g => {
            const quizzes = g.quizzes ?? []
            const assignments = g.assignments ?? []
            const hasBreakdown = quizzes.length > 0 || assignments.length > 0
            return (
              <Fragment key={g.courseId}>
                <tr className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2.5 text-gray-900 dark:text-white">{g.courseTitle}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white">
                    {g.finalPercentage}% ({g.letterGrade})
                  </td>
                  <td className="px-4 py-2.5">
                    {g.completed
                      ? <span className="font-medium text-green-600 dark:text-green-400">Completed</span>
                      : <span className="text-gray-500 dark:text-gray-400">In progress</span>}
                  </td>
                </tr>
                {/* Itemised scores — every written quiz and assignment, always visible */}
                {hasBreakdown && (
                  <tr className="border-t border-gray-100 dark:border-gray-800">
                    <td colSpan={3} className="bg-gray-50/60 px-4 py-3 dark:bg-gray-800/30">
                      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                        {quizzes.length > 0 && (
                          <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" /> Quizzes
                            </p>
                            <ul className="text-sm">
                              {quizzes.map(q => (
                                <ScoreLine
                                  key={q.quizId}
                                  icon={q.score === null
                                    ? <ClipboardList className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
                                    : (q.passed
                                        ? <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-600" aria-label="Passed" />
                                        : <XCircle className="w-3.5 h-3.5 shrink-0 text-red-500" aria-label="Not passed" />)}
                                  title={`${q.title}${q.attemptCount > 0 ? ` (${q.attemptCount} attempt${q.attemptCount === 1 ? '' : 's'})` : ''}`}
                                  right={q.score === null
                                    ? <span className="text-gray-400 dark:text-gray-500">Not taken</span>
                                    : `${q.score}%`}
                                />
                              ))}
                            </ul>
                          </div>
                        )}
                        {assignments.length > 0 && (
                          <div>
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              <FileText className="w-3.5 h-3.5" aria-hidden="true" /> Assignments
                            </p>
                            <ul className="text-sm">
                              {assignments.map(a => (
                                <ScoreLine
                                  key={a.assignmentId}
                                  icon={<FileText className={`w-3.5 h-3.5 shrink-0 ${a.written ? 'text-brand-blue' : 'text-gray-300 dark:text-gray-600'}`} aria-hidden="true" />}
                                  title={`${a.title} · ${a.status.charAt(0).toUpperCase()}${a.status.slice(1)}`}
                                  right={a.score === null || a.percentage === null
                                    ? <span className="text-gray-400 dark:text-gray-500">{a.submitted ? 'Awaiting grade' : 'Not submitted'}</span>
                                    : `${a.score}/${a.totalMarks} (${a.percentage}%)`}
                                />
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
