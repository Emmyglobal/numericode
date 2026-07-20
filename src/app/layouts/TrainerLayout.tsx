import { Outlet, useLocation } from 'react-router-dom'
import { TrainerSidebar } from '@/components/navigation/TrainerSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { useScrollTop } from '@/hooks/useScrollTop'

const titles: Record<string, string> = {
  '/trainer': 'Trainer Overview', '/trainer/courses': 'My Courses',
  '/trainer/students': 'Students', '/trainer/sessions': 'Live Sessions',
  '/trainer/notes': 'Course Notes', '/trainer/resources': 'Resources',
  '/trainer/assignments': 'Assignments', '/trainer/profile': 'Profile',
  '/trainer/boards': 'Lesson Boards',
}

export default function TrainerLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <TrainerSidebar />
      <DashboardTopBar title={titles[pathname] ?? 'Trainer Portal'} />
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  )
}
