import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { BarChart3, Clock, MousePointer, TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['learning-analytics'],
    queryFn: async () => {
      // In a real app, fetch analytics for current course
      return null as {
        courseId: string; courseTitle: string; totalTimeSpent: number; totalInteractions: number
        lessonAnalytics: Array<{ lessonTitle: string; timeSpent: number; interactions: number }>
      } | null
    },
  })

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div>
      <PageHeader title="Learning Analytics" subtitle="Track your learning progress and engagement" />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : !analytics ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No analytics yet</h3>
          <p className="text-gray-500">Your learning analytics will appear here as you engage with courses.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(analytics.totalTimeSpent)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MousePointer className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Interactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalInteractions}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lessons Accessed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.lessonAnalytics.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Time Spent by Lesson</h3>
            <div className="space-y-4">
              {analytics.lessonAnalytics.map((lesson, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{lesson.lessonTitle}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(lesson.timeSpent)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full bg-brand-blue rounded-full transition-all"
                      style={{ width: `${Math.min((lesson.timeSpent / analytics.totalTimeSpent) * 100, 100)}%` }}
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