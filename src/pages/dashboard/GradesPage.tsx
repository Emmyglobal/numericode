import { useQuery } from '@tanstack/react-query'
import { gradingService, type GradeReport } from '@/services/grading.service'
import { dashboardService } from '@/services/dashboard.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { GradeBook } from '@/features/assignments/components/GradeBook'
import { Trophy, TrendingUp, BookOpen } from 'lucide-react'
import type { EnrolledCourse } from '@/features/courses/types'

export default function GradesPage() {
  const { data: enrolledCourses } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  const { data: gradeReports, isLoading } = useQuery({
    queryKey: ['grade-reports', enrolledCourses],
    queryFn: async () => {
      if (!enrolledCourses || enrolledCourses.length === 0) return [] as Array<GradeReport & { courseTitle: string }>

      const reports: Array<GradeReport & { courseTitle: string }> = []
      for (const course of enrolledCourses) {
        try {
          const report = await gradingService.getStudentGradeReport(course.id)
          reports.push({ ...report, courseTitle: course.title })
        } catch {
          // course might not have grade categories yet
        }
      }
      return reports
    },
    enabled: Boolean(enrolledCourses),
  })

  return (
    <div>
      <PageHeader title="My Grades" subtitle="Track your academic performance across all courses" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !gradeReports?.length ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No grades yet</h3>
          <p className="text-gray-500">Your grades will appear here once your assignments and quizzes are graded.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {gradeReports.map(report => (
            <div key={report.courseId} className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-blue" />
                {report.courseTitle}
              </h2>

              {/* Overall Grade Card */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-brand-blue to-brand-teal p-6 text-white dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Overall Grade</p>
                    <p className="text-4xl font-bold">{report.overallGrade.toFixed(1)}%</p>
                    <p className="text-lg mt-1">Grade: {report.letterGrade}</p>
                  </div>
                  <TrendingUp className="w-16 h-16 opacity-80" />
                </div>
              </div>

              {/* Grade Categories */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Grade Breakdown</h3>
                {report.categories.length > 0 ? (
                  <div className="space-y-4">
                    {report.categories.map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.categoryName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{category.averageScore.toFixed(1)}% (Weight: {category.weight}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                          <div
                            className="h-full bg-brand-blue rounded-full transition-all"
                            style={{ width: `${Math.min(category.averageScore, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // No trainer-configured grade categories — show the actual
                  // quiz/assignment averages that feed the overall grade.
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quiz Average</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {report.quizAverage != null ? `${report.quizAverage.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assignment Average</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {report.assignmentAverage != null ? `${report.assignmentAverage.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Book — itemised quiz & assignment scores alongside course grades */}
      <section className="mt-8" aria-labelledby="gradebook-title">
        <h2 id="gradebook-title" className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Grade Book</h2>
        <GradeBook />
      </section>
    </div>
  )
}