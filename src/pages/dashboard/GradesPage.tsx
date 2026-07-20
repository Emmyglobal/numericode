import { useQuery } from '@tanstack/react-query'
import { gradingService } from '@/services/grading.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { Trophy, TrendingUp } from 'lucide-react'

export default function GradesPage() {
  const { data: gradeReport, isLoading } = useQuery({
    queryKey: ['grade-report'],
    queryFn: async () => {
      // In a real app, fetch grade report for current course
      return null as { courseId: string; categories: Array<{ categoryName: string; weight: number; averageScore: number }>; overallGrade: number; letterGrade: string } | null
    },
  })

  return (
    <div>
      <PageHeader title="My Grades" subtitle="Track your academic performance" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !gradeReport ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No grades yet</h3>
          <p className="text-gray-500">Your grades will appear here once your assignments are graded.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Grade Card */}
          <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-brand-blue to-brand-teal p-6 text-white dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Overall Grade</p>
                <p className="text-4xl font-bold">{gradeReport.overallGrade.toFixed(1)}%</p>
                <p className="text-lg mt-1">Grade: {gradeReport.letterGrade}</p>
              </div>
              <TrendingUp className="w-16 h-16 opacity-80" />
            </div>
          </div>

          {/* Grade Categories */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Breakdown</h3>
            <div className="space-y-4">
              {gradeReport.categories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.categoryName}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{category.averageScore.toFixed(1)}% (Weight: {category.weight}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full bg-brand-blue rounded-full transition-all"
                      style={{ width: `${category.averageScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}