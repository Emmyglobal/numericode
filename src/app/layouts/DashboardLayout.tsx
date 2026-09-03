import { Outlet, useLocation } from 'react-router-dom'
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { SkipLink } from '@/components/shared/SkipLink'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useScrollTop } from '@/hooks/useScrollTop'
import { useUIStore } from '@/store/uiStore'
import { useNoIndex } from '@/utils/structuredData'
import { AiStudyAssistant } from '@/components/shared/AiStudyAssistant'

const titles: Record<string, string> = {
  '/dashboard':                   'Overview',
  '/dashboard/courses':           'My Courses',
  '/dashboard/live-classes':      'Live Classes',
  '/dashboard/assignments':       'Assignments',
  '/dashboard/resources':         'Resources',
  '/dashboard/announcements':     'Announcements',
  '/dashboard/certificates':      'Certificates',
  '/dashboard/profile':           'Profile',
  '/dashboard/workspace':         'Learning Workspace',
}

export default function DashboardLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  useNoIndex()
  const { isSidebarOpen } = useUIStore()
  const title = pathname.startsWith('/dashboard/courses/') ? 'Course Viewer' : (titles[pathname] ?? 'Dashboard')

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <SkipLink />
      <DashboardSidebar />
      <DashboardTopBar title={title} />
      <main id="main-content" tabIndex={-1} className={`pt-16 min-h-screen focus:outline-none transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          <ErrorBoundary label="This page">
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <AiStudyAssistant />
    </div>
  )
}
