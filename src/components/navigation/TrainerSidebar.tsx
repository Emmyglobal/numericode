import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, Video, ClipboardList, GraduationCap, LogOut, X, UserCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/classNames'

const navItems = [
  { to: '/trainer',             icon: LayoutDashboard, label: 'Overview',    end: true },
  { to: '/trainer/courses',     icon: BookOpen,        label: 'My Courses',  end: false },
  { to: '/trainer/students',    icon: Users,           label: 'Students',    end: false },
  { to: '/trainer/sessions',    icon: Video,           label: 'Live Sessions',end: false },
  { to: '/trainer/assignments', icon: ClipboardList,   label: 'Assignments', end: false },
  { to: '/trainer/profile',     icon: UserCircle,      label: 'Profile',     end: false },
]

export function TrainerSidebar() {
  const { user, logout } = useAuth()
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside id="trainer-sidebar" aria-label="Trainer navigation"
        className={cn('fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 font-bold text-brand-navy dark:text-white">
            <GraduationCap className="w-6 h-6 text-teal" aria-hidden="true" />
            <span>NumeriCode</span>
            <span className="text-xs font-normal bg-teal-light dark:bg-teal-900/30 text-teal px-1.5 py-0.5 rounded ml-1">Trainer</span>
          </div>
          <button className="lg:hidden p-1 rounded" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X className="w-4 h-4" aria-hidden="true" /></button>
        </div>
        <nav aria-label="Trainer navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive ? 'bg-teal-light dark:bg-teal-900/30 text-teal border-l-[3px] border-teal pl-[calc(0.75rem-3px)]'
                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}
              onClick={() => setSidebarOpen(false)} aria-label={label}>
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <Avatar name={user?.name ?? 'Trainer'} size="sm" className="bg-teal" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-teal font-medium">Trainer</p>
            </div>
          </div>
          <button onClick={handleLogout} aria-label="Log out"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-5 h-5" aria-hidden="true" />Log out
          </button>
        </div>
      </aside>
    </>
  )
}
