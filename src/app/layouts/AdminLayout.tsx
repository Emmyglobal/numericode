import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { useScrollTop } from '@/hooks/useScrollTop'
import { useUIStore } from '@/store/uiStore'
import { AiStudyAssistant } from '@/components/shared/AiStudyAssistant'

const titles: Record<string, string> = {
  '/admin': 'Admin Overview', '/admin/users': 'User Management',
  '/admin/courses': 'Course Management', '/admin/announcements': 'Announcements',
  '/admin/analytics': 'Analytics', '/admin/settings': 'Settings',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  const { isSidebarOpen } = useUIStore()
  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <AdminSidebar />
      <DashboardTopBar title={titles[pathname] ?? 'Admin Panel'} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64 pl-64' : 'lg:pl-64 pl-0'}`}>
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
      <AiStudyAssistant />
    </div>
  )
}
