import { Menu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useUIStore } from '@/store/uiStore'
import { NotificationBell } from './NotificationBell'

export function DashboardTopBar({ title }: { title: string }) {
  const { isDark, toggleTheme } = useTheme()
  const { setSidebarOpen } = useUIStore()

  return (
    <header
      role="banner"
      aria-label="Dashboard header"
      className="fixed top-0 left-0 lg:left-64 right-0 z-20 h-16 bg-white/95 dark:bg-surface-dark/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sm:px-6 gap-4"
    >
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar navigation"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <h1 className="font-semibold text-gray-900 dark:text-white flex-1 truncate">{title}</h1>

      <div className="flex items-center gap-1" role="toolbar" aria-label="Header actions">
        <NotificationBell />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark
            ? <Sun  className="w-5 h-5" aria-hidden="true" />
            : <Moon className="w-5 h-5" aria-hidden="true" />
          }
        </button>
      </div>
    </header>
  )
}
