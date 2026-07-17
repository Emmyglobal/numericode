import { useEffect } from 'react'
import { AppRouter } from './Router'
import { useUIStore } from '@/store/uiStore'

export default function App() {
  const { theme } = useUIStore()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      {/* Skip link — visually hidden, shown on focus for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-brand-blue focus:text-white focus:rounded-lg focus:shadow-lg focus:font-medium focus:text-sm"
      >
        Skip to main content
      </a>

      <div id="main-content">
        <AppRouter />
      </div>
    </>
  )
}
