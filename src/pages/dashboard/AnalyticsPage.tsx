import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import { dashboardService } from '@/services/dashboard.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { BarChart3, Clock, MousePointer, GraduationCap, MessageSquare, BookOpen, Trophy } from 'lucide-react'
import type { EnrolledCourse } from '@/features/courses/types'

export default function AnalyticsPage() {
  const { data: enrolledCourses } = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => dashboardService.getMyCourses() as Promise<EnrolledCourse[]>,
  })

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['learning-analytics', enrolledCourses],
    queryFn: async () => {
      if (!enrolledCourses || enrolledCourses.length === 0) return []
      const results: Array<{
        courseId: string; courseTitle: string; totalTimeSpent: number; totalInteractions: number
        overallGrade: number | null
        quizMetrics: { totalQuizzes: number; completedQuizzes: number; averageScore: number | null }
        forumMetrics: { threadsCreated: number; postsMade: number }
        lessonAnalytics: Array<{ id: string; lessonTitle: string; timeSpent: number; interactions: number; lastAccessed: string }>
      }> = []
      for (const course of enrolledCourses) {
        try {
          const analytics = await analyticsService.getLearningAnalytics(course.id)
          results.push(analytics)
        } catch {
          // course might not have analytics yet
        }
      }
      return results
    },
    enabled: Boolean(enrolledCourses),
  })

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const totalTimeAllCourses = analyticsData?.reduce((sum, a) => sum + a.totalTimeSpent, 0) || 0
  const totalInteractionsAllCourses = analyticsData?.reduce((sum, a) => sum + a.totalInteractions, 0) || 0
  const totalLessonsAccessed = analyticsData?.reduce((sum, a) => sum + a.lessonAnalytics.length, 0) || 0
  const totalQuizzesCompleted = analyticsData?.reduce((sum, a) => sum + a.quizMetrics.completedQuizzes, 0) || 0

  return (
    <div>
      <PageHeader title="Learning Analytics" subtitle="Track your learning progress and engagement across courses" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !analyticsData?.length ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No analytics yet</h3>
          <p className="text-gray-500">Your learning analytics will appear here as you engage with courses.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overall Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Time</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatTime(totalTimeAllCourses)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MousePointer className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Interactions</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalInteractionsAllCourses}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Lessons</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalLessonsAccessed}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quizzes Done</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalQuizzesCompleted}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Per-Course Analytics */}
          {analyticsData.map(courseAnalytics => {
            const quizAvg = courseAnalytics.quizMetrics.averageScore
            return (
              <div key={courseAnalytics.courseId} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    <BookOpen className="w-4 h-4 inline mr-2 text-brand-blue" />
                    {courseAnalytics.courseTitle}
                  </h3>
                  {courseAnalytics.overallGrade !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Grade: {courseAnalytics.overallGrade.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Time Spent</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatTime(courseAnalytics.totalTimeSpent)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Interactions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{courseAnalytics.totalInteractions}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-brand-blue" />
                      <p className="text-xs text-gray-500">Quizzes</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {courseAnalytics.quizMetrics.completedQuizzes}/{courseAnalytics.quizMetrics.totalQuizzes}
                      {quizAvg !== null && <span className="text-sm font-normal text-gray-500 ml-1">({quizAvg.toFixed(0)}%)</span>}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
                      <p className="text-xs text-gray-500">Forum</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {courseAnalytics.forumMetrics.postsMade + courseAnalytics.forumMetrics.threadsCreated} posts
                    </p>
                  </div>
                </div>

                {/* Lesson Breakdown */}
                {courseAnalytics.lessonAnalytics.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Spent by Lesson</p>
                    <div className="space-y-3">
                      {courseAnalytics.lessonAnalytics.map(lesson => (
                        <div key={lesson.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate pr-2">{lesson.lessonTitle || 'Unknown Lesson'}</span>
                            <span className="text-xs text-gray-500">{formatTime(lesson.timeSpent)}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                            <div
                              className="h-full bg-brand-blue rounded-full transition-all"
                              style={{ width: `${Math.min((lesson.timeSpent / Math.max(courseAnalytics.totalTimeSpent, 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {courseAnalytics.lessonAnalytics.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No lesson activity recorded yet.</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}