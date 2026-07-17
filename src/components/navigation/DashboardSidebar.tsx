import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Video, ClipboardList,
  FolderOpen, Bell, UserCircle, LogOut, GraduationCap, X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/classNames'

const navItems = [
  { to: '/dashboard',               icon: LayoutDashboard, label: 'Overview'      },
  { to: '/dashboard/courses',       icon: BookOpen,        label: 'My Courses'    },
  { to: '/dashboard/live-classes',  icon: Video,           label: 'Live Classes'  },
  { to: '/dashboard/assignments',   icon: ClipboardList,   label: 'Assignments'   },
  { to: '/dashboard/resources',     icon: FolderOpen,      label: 'Resources'     },
  { to: '/dashboard/announcements', icon: Bell,            label: 'Announcements' },
  { to: '/dashboard/profile',       icon: UserCircle,      label: 'Profile'       },
]

export function DashboardSidebar() {
  const { user, logout } = useAuth()
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        aria-label="Dashboard navigation"
        className={cn(
          'fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 font-bold text-brand-navy dark:text-white" aria-hidden="true">
            <GraduationCap className="w-6 h-6 text-brand-blue" />
            NumeriCode
          </div>
          <button
            className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar navigation"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Nav items */}
        <nav aria-label="Sidebar navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-light dark:bg-blue-900/30 text-brand-blue border-l-[3px] border-brand-blue pl-[calc(0.75rem-3px)]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
              onClick={() => setSidebarOpen(false)}
              aria-label={label}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-2 py-2 mb-1" aria-label={`Signed in as ${user?.name}`}>
            <Avatar name={user?.name ?? 'User'} size="sm" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Log out of NumeriCode"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
