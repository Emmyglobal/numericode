import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark'
  isSidebarOpen: boolean
  toggleTheme: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light', isSidebarOpen: false,
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    { name: 'numericode-ui' }
  )
)
