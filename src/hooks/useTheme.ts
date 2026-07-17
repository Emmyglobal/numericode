import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
export function useTheme() {
  const { theme, toggleTheme } = useUIStore()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return { theme, toggleTheme, isDark: theme === 'dark' }
}
