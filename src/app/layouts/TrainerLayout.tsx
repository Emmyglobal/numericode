import { Outlet, useLocation } from 'react-router-dom'
import { TrainerSidebar } from '@/components/navigation/TrainerSidebar'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { useScrollTop } from '@/hooks/useScrollTop'
import { useUIStore } from '@/store/uiStore'
import { AiStudyAssistant } from '@/components/shared/AiStudyAssistant'

const titles: Record<string, string> = {
  '/trainer': 'Trainer Overview', '/trainer/courses': 'My Courses',
  '/trainer/students': 'Students', '/trainer/sessions': 'Live Sessions',
  '/trainer/notes': 'Course Notes', '/trainer/resources': 'Resources',
  '/trainer/assignments': 'Assignments', '/trainer/profile': 'Profile',
  '/trainer/boards': 'Lesson Boards',
  '/trainer/code-editor': 'Code Editor',
}

export default function TrainerLayout() {
  const { pathname } = useLocation()
  useScrollTop()
  const { isSidebarOpen } = useUIStore()
  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      <TrainerSidebar />
      <DashboardTopBar title={titles[pathname] ?? 'Trainer Portal'} />
      <main className={`pt-16 min-h-screen transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
      <AiStudyAssistant />
    </div>
  )
}
