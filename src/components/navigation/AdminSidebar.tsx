import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, Bell, BarChart3, Settings, GraduationCap, LogOut, X, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/uiStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/classNames'

const navItems = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Overview',       end: true  },
  { to: '/admin/users',         icon: Users,           label: 'Users',          end: false },
  { to: '/admin/courses',       icon: BookOpen,        label: 'Courses',        end: false },
  { to: '/admin/announcements', icon: Bell,            label: 'Announcements',  end: false },
  { to: '/admin/analytics',     icon: BarChart3,       label: 'Analytics',      end: false },
  { to: '/admin/settings',      icon: Settings,        label: 'Settings',       end: false },
]

export function AdminSidebar() {
  const { user, logout } = useAuth()
  const { isSidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside id="admin-sidebar" aria-label="Admin navigation"
        className={cn('fixed top-0 left-0 h-full w-64 z-40 flex flex-col bg-brand-navy text-white transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-blue-800">
          <div className="flex items-center gap-2 font-bold">
            <GraduationCap className="w-6 h-6 text-brand-sky" aria-hidden="true" />
            <span>NumeriCode</span>
            <span className="text-xs font-normal bg-red-600 text-white px-1.5 py-0.5 rounded ml-1">Admin</span>
          </div>
          <button className="lg:hidden p-1 rounded text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X className="w-4 h-4" aria-hidden="true" /></button>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive ? 'bg-brand-blue text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white')}
              onClick={() => setSidebarOpen(false)} aria-label={label}>
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-blue-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-white" aria-hidden="true" /></div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-red-400 font-medium">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} aria-label="Log out"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-blue-800 transition-colors">
            <LogOut className="w-5 h-5" aria-hidden="true" />Log out
          </button>
        </div>
      </aside>
    </>
  )
}
