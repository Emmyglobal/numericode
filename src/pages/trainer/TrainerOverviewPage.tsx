import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Video, ClipboardList, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/axios'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/formatDate'
import type { TrainerStats, TrainerCourse, TrainerLiveSession, TrainerAssignment } from '@/features/trainer/types'

export default function TrainerOverviewPage() {
  usePageTitle('Trainer Overview')
  const { user } = useAuth()
  const { data: stats }       = useQuery({ queryKey: ['trainer','stats'],       queryFn: async () => { const r = await api.get<{data:TrainerStats}>('/trainer/stats'); return r.data.data }})
  const { data: courses }     = useQuery({ queryKey: ['trainer','courses'],     queryFn: async () => { const r = await api.get<{data:TrainerCourse[]}>('/trainer/courses'); return r.data.data }})
  const { data: sessions }    = useQuery({ queryKey: ['trainer','sessions'],    queryFn: async () => { const r = await api.get<{data:TrainerLiveSession[]}>('/trainer/sessions'); return r.data.data }})
  const { data: assignments } = useQuery({ queryKey: ['trainer','assignments'], queryFn: async () => { const r = await api.get<{data:TrainerAssignment[]}>('/trainer/assignments'); return r.data.data }})

  const firstName = user?.name?.split(' ')[0] ?? 'Trainer'
  const upcoming  = sessions?.filter(s => s.status === 'scheduled').slice(0,2) ?? []
  const pending   = assignments?.filter(a => a.pendingReview > 0) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {firstName} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening across your courses today.</p>
      </div>

      {/* Stats */}
      {!stats ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><Skeleton key={i} className="h-24"/>)}</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<Users className="w-6 h-6"/>}       value={stats.totalStudents}    label="Total Students"  color="blue"   />
          <StatCard icon={<BookOpen className="w-6 h-6"/>}    value={stats.activeCourses}    label="Active Courses"  color="teal"   />
          <StatCard icon={<Video className="w-6 h-6"/>}       value={stats.upcomingSessions} label="Upcoming Sessions" color="green" />
          <StatCard icon={<ClipboardList className="w-6 h-6"/>} value={stats.pendingReviews} label="Pending Reviews" color="orange" />
          <StatCard icon={<CheckCircle className="w-6 h-6"/>} value={`${stats.avgCompletionRate}%`} label="Avg. Completion" color="teal" />
          <StatCard icon={<Clock className="w-6 h-6"/>}       value={stats.totalSessions}    label="Sessions Held"   color="blue"   />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course performance */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Course Performance</h3>
            <Link to="/trainer/courses" className="text-xs text-teal hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {courses?.filter(c=>c.status==='published').map(c=>(
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900 dark:text-white truncate pr-4">{c.title}</span>
                  <span className="text-gray-500 dark:text-gray-400 shrink-0">{c.enrolledCount} students</span>
                </div>
                <ProgressBar value={c.completionRate} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
            <Link to="/trainer/sessions" className="text-xs text-teal hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {upcoming.length ? upcoming.map(s=>(
              <div key={s.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.courseTitle} · {formatDateTime(s.date)}</p>
                </div>
                <a href={s.meetUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary">Start</Button></a>
              </div>
            )) : <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming sessions.</p>}
          </div>
        </div>
      </div>

      {/* Pending reviews */}
      {pending.length > 0 && (
        <div className="rounded-xl border border-orange-200 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Assignments Awaiting Review</h3>
            <Link to="/trainer/assignments"><Button size="sm" variant="secondary">Review All</Button></Link>
          </div>
          <div className="space-y-2">
            {pending.map(a=>(
              <div key={a.id} className="flex items-center justify-between gap-3 bg-white dark:bg-surface-dark rounded-lg p-3 border border-orange-100 dark:border-orange-900/30">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.courseTitle}</p>
                </div>
                <Badge variant="pending">{a.pendingReview} pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/trainer/courses', icon: BookOpen, label: 'My Courses' },
          { to: '/trainer/students', icon: Users, label: 'Students' },
          { to: '/trainer/sessions', icon: Video, label: 'Live Sessions' },
          { to: '/trainer/assignments', icon: ClipboardList, label: 'Assignments' },
        ].map(q=>(
          <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4 hover:shadow-card hover:-translate-y-0.5 transition-all">
            <q.icon className="w-5 h-5 text-teal shrink-0" aria-hidden="true"/>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{q.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true"/>
          </Link>
        ))}
      </div>
    </div>
  )
}
