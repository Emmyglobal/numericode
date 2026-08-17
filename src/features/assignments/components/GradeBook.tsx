import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/Skeleton'
import { dashboardService } from '@/services/dashboard.service'

interface GradeEntry {
  courseId: string
  courseTitle: string
  completed: boolean
  finalPercentage: number
  letterGrade: string
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
          {data.map(g => (
            <tr key={g.courseId} className="border-t border-gray-100 dark:border-gray-800">
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
