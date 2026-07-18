import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { SkipLink } from '@/components/shared/SkipLink'
import { useScrollTop } from '@/hooks/useScrollTop'

const titles: Record<string, string> = {
  '/dashboard':                   'Overview',
  '/dashboard/courses':           'My Courses',
  '/dashboard/live-classes':      'Live Classes',
  '/dashboard/assignments':       'Assignments',
  '/dashboard/resources':         'Resources',
  '/dashboard/announcements':     'Announcements',
  '/dashboard/certificates':      'Certificates',
  '/dashboard/profile':           'Profile',
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  const title = pathname.startsWith('/dashboard/courses/') ? 'Course Viewer' : (titles[pathname] ?? 'Dashboard')

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <SkipLink />
      <DashboardSidebar />
      <DashboardTopBar title={title} />
      <main id="main-content" tabIndex={-1} className="lg:pl-64 pt-16 min-h-screen focus:outline-none">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
