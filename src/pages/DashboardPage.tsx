import type { AuthUser } from '../auth'
import { DashboardPreview } from '../components/dashboard/DashboardPreview'

type DashboardPageProps = {
  currentUser: AuthUser
  isDarkMode: boolean
  onToggleTheme: (enabled: boolean) => void
}

export function DashboardPage({ currentUser, isDarkMode, onToggleTheme }: DashboardPageProps) {
  return (
    <DashboardPreview
      currentUser={currentUser}
      isDarkMode={isDarkMode}
      onToggleTheme={onToggleTheme}
    />
  )
}
