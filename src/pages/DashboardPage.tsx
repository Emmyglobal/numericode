import { DashboardPreview } from '../components/dashboard/DashboardPreview'

type DashboardPageProps = {
  isDarkMode: boolean
  onToggleTheme: (enabled: boolean) => void
}

export function DashboardPage({ isDarkMode, onToggleTheme }: DashboardPageProps) {
  return <DashboardPreview isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
}
