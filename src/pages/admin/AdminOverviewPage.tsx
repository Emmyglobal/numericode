import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, BookOpen, Video, TrendingUp, UserCheck, Clock, ChevronRight } from 'lucide-react'
import { api } from '@/lib/axios'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/formatDate'
import type { AdminStats, AdminUser, AdminCourse } from '@/features/admin/types'

export default function AdminOverviewPage() {
  usePageTitle('Admin Overview')
  const { user } = useAuth()
  const { data: stats }   = useQuery({ queryKey: ['admin','stats'],   queryFn: async () => { const r = await api.get<{data:AdminStats}>('/admin/stats');     return r.data.data }})
  const { data: users }   = useQuery({ queryKey: ['admin','users'],   queryFn: async () => { const r = await api.get<{data:AdminUser[]}>('/admin/users');   return r.data.data }})
  const { data: courses } = useQuery({ queryKey: ['admin','courses'], queryFn: async () => { const r = await api.get<{data:AdminCourse[]}>('/admin/courses'); return r.data.data }})

  const recentUsers   = users?.slice(0,5) ?? []
  const recentCourses = courses?.slice(0,4) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform-wide metrics and management — logged in as {user?.name}</p>
      </div>

      {/* Stats */}
      {!stats ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><Skeleton key={i} className="h-24"/>)}</div> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-6 h-6"/>}     value={stats.totalUsers}       label="Total Users"       color="blue"   />
            <StatCard icon={<UserCheck className="w-6 h-6"/>} value={stats.totalStudents}    label="Students"          color="teal"   />
            <StatCard icon={<BookOpen className="w-6 h-6"/>}  value={stats.totalCourses}     label="Total Courses"     color="green"  />
            <StatCard icon={<Video className="w-6 h-6"/>}     value={stats.totalLiveSessions} label="Live Sessions"    color="orange" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-6 h-6"/>}       value={stats.totalTrainers}    label="Trainers"          color="blue"   />
            <StatCard icon={<BookOpen className="w-6 h-6"/>}    value={stats.activeCourses}    label="Active Courses"    color="teal"   />
            <StatCard icon={<Clock className="w-6 h-6"/>}       value={stats.totalEnrolments}  label="Total Enrolments"  color="green"  />
            <StatCard icon={<TrendingUp className="w-6 h-6"/>}  value={`+${stats.platformGrowth}%`} label="Monthly Growth" color="orange"/>
          </div>
        </>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Users</h3>
            <Link to="/admin/users" className="text-xs text-brand-blue hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u=>(
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role==='admin' ? 'bg-red-600' : u.role==='trainer' ? 'bg-teal' : 'bg-brand-blue'}`}>
                    {u.name[0]}
                  </div>
                  <div className="min-w-0"><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p></div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={u.role==='admin' ? 'overdue' : u.role==='trainer' ? 'mathematics' : 'upcoming'}>{u.role}</Badge>
                  <Badge variant={u.status==='active' ? 'submitted' : 'overdue'}>{u.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course overview */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Course Overview</h3>
            <Link to="/admin/courses" className="text-xs text-brand-blue hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentCourses.map(c=>(
              <div key={c.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.instructor} · {c.enrolledCount} enrolled</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant={c.subject}>{c.subject}</Badge>
                  <Badge variant={c.status==='published' ? 'submitted' : 'pending'}>{c.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/users',         icon: Users,    label: 'Manage Users' },
          { to: '/admin/courses',       icon: BookOpen, label: 'Manage Courses' },
          { to: '/admin/announcements', icon: Video,    label: 'Announcements' },
        ].map(q=>(
          <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4 hover:shadow-card hover:-translate-y-0.5 transition-all">
            <q.icon className="w-5 h-5 text-brand-blue shrink-0" aria-hidden="true"/>
            <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{q.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true"/>
          </Link>
        ))}
      </div>
    </div>
  )
}
