import { usePageTitle } from '@/hooks/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Video, ClipboardList, ExternalLink, ChevronRight, FolderOpen, Bell } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { formatDateTime } from '@/utils/formatDate'

interface Overview {
  enrolledCount: number; completedLessons: number; upcomingClassesCount: number; assignmentsDue: number
  continuelearning: { id: string; title: string; progress: number; nextLesson: { title: string } } | null
  upcomingClasses: { id: string; courseTitle: string; subject: string; title: string; date: string; meetUrl: string }[]
  recentAnnouncements: { id: string; title: string; createdAt: string; isRead: boolean }[]
}

export default function DashboardPage() {
  usePageTitle('Dashboard')
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardService.getOverview() as Promise<Overview>, staleTime: 2 * 60 * 1000 })

  if (isLoading || !data) return <div className="space-y-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>

  const firstName = user?.name?.split(' ')[0] ?? 'Student'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const quickLinks = [
    { to: '/dashboard/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/dashboard/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/dashboard/resources', icon: FolderOpen, label: 'Resources' },
    { to: '/dashboard/live-classes', icon: Video, label: 'Live Classes' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}, {firstName} 👋</h1>
        <p className="text-gray-500 dark:text-gray-500 mt-1">You have {data.upcomingClassesCount} upcoming classes this week</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen className="w-6 h-6" />}      value={data.enrolledCount}       label="Courses"      color="blue" />
        <StatCard icon={<CheckCircle className="w-6 h-6" />}   value={data.completedLessons}    label="Lessons Done" color="green" />
        <StatCard icon={<Video className="w-6 h-6" />}         value={data.upcomingClassesCount} label="This Week"    color="teal" />
        <StatCard icon={<ClipboardList className="w-6 h-6" />} value={data.assignmentsDue}       label="Due Soon"     color="orange" />
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand-light to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10 border border-brand-light dark:border-blue-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mb-1">{data.continuelearning ? 'Continue Learning' : 'Start Learning'}</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{data.continuelearning?.title ?? 'Choose your first course'}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-500 mb-3">{data.continuelearning ? `Next: ${data.continuelearning.nextLesson.title}` : 'Browse our available courses and begin your learning journey.'}</p>
            {data.continuelearning && <ProgressBar value={data.continuelearning.progress} className="max-w-xs" />}
          </div>
          <Link to={data.continuelearning ? `/dashboard/courses/${data.continuelearning.id}` : '/courses'}><Button>{data.continuelearning ? 'Resume' : 'Browse Courses'} <ChevronRight className="w-4 h-4" /></Button></Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Live Classes</h3><Link to="/dashboard/live-classes" className="text-xs text-brand-blue hover:underline">View all</Link></div>
          <div className="space-y-3">
            {data.upcomingClasses.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><Badge variant={c.subject as 'mathematics'|'programming'}>{c.subject}</Badge></div><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p><p className="text-xs text-gray-500 dark:text-gray-500">{formatDateTime(c.date)}</p></div>
                <a href={c.meetUrl} target="_blank" rel="noreferrer" className="shrink-0"><Button variant="secondary" size="sm"><ExternalLink className="w-3.5 h-3.5" />Join</Button></a>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-gray-900 dark:text-white">Announcements</h3><Link to="/dashboard/announcements" className="text-xs text-brand-blue hover:underline">View all</Link></div>
          <div className="space-y-3">
            {data.recentAnnouncements.map(a => (
              <div key={a.id} className="flex gap-2.5">
                {!a.isRead && <span className="w-2 h-2 rounded-full bg-brand-blue mt-1.5 shrink-0" />}
                <div className={a.isRead ? 'pl-[18px]' : ''}><p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{a.title}</p><p className="text-xs text-gray-400 dark:text-gray-500">{a.createdAt}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(q => (
          <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-4 hover:shadow-card hover:-translate-y-0.5 transition-all">
            <q.icon className="w-5 h-5 text-brand-blue shrink-0" /><span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{q.label}</span><ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
