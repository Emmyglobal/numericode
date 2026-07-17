import { Outlet, useLocation } from 'react-router-dom'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { useScrollTop } from '@/hooks/useScrollTop'

const titles: Record<string, string> = {
  '/admin': 'Admin Overview', '/admin/users': 'User Management',
  '/admin/courses': 'Course Management', '/admin/announcements': 'Announcements',
  '/admin/analytics': 'Analytics', '/admin/settings': 'Settings',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <AdminSidebar />
      <DashboardTopBar title={titles[pathname] ?? 'Admin Panel'} />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  )
}
