import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, BookOpen, Video } from 'lucide-react'
import { api } from '@/lib/axios'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePageTitle } from '@/hooks/usePageTitle'
import type { AdminStats, AdminCourse } from '@/features/admin/types'

export default function AdminAnalyticsPage() {
  usePageTitle('Analytics — Admin')
  const { data: stats }   = useQuery({ queryKey:['admin','stats'],   queryFn: async()=>{ const r=await api.get<{data:AdminStats}>('/admin/stats'); return r.data.data }})
  const { data: courses } = useQuery({ queryKey:['admin','courses'], queryFn: async()=>{ const r=await api.get<{data:AdminCourse[]}>('/admin/courses'); return r.data.data }})
  const maxEnrolled = Math.max(...(courses?.map(c=>c.enrolledCount)??[1]))

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" subtitle="Platform-wide performance and growth metrics"/>
      {!stats ? <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><Skeleton key={i} className="h-24"/>)}</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TrendingUp className="w-6 h-6"/>} value={`+${stats.platformGrowth}%`} label="Monthly Growth"    color="green"  />
          <StatCard icon={<Users className="w-6 h-6"/>}      value={stats.totalEnrolments}        label="Total Enrolments" color="blue"   />
          <StatCard icon={<BookOpen className="w-6 h-6"/>}   value={stats.activeCourses}           label="Active Courses"  color="teal"   />
          <StatCard icon={<Video className="w-6 h-6"/>}      value={stats.totalLiveSessions}       label="Live Sessions"   color="orange" />
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Enrolment by Course</h3>
        <div className="space-y-4">
          {courses?.map(c=>(
            <div key={c.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-900 dark:text-white truncate pr-4 max-w-xs">{c.title}</span>
                <span className="text-gray-500 dark:text-gray-400 shrink-0">{c.enrolledCount} students</span>
              </div>
              <ProgressBar value={Math.round((c.enrolledCount/maxEnrolled)*100)}/>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Students', value: `${stats?.totalStudents ?? 0}`, sub: `of ${stats?.totalUsers ?? 0} total users`, color: 'bg-brand-light dark:bg-blue-900/20 border-brand-blue/20' },
          { label: 'Trainers', value: `${stats?.totalTrainers ?? 0}`, sub: 'registered instructors', color: 'bg-teal-light dark:bg-teal-900/20 border-teal/20' },
          { label: 'Draft Courses', value: `${(courses?.filter(c=>c.status==='draft').length)??0}`, sub: 'pending publication', color: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30' },
        ].map(s=>(
          <div key={s.label} className={`rounded-xl border ${s.color} p-5`}>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
