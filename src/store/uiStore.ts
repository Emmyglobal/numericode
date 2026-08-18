import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark'
  isSidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

// Desktop (lg breakpoint = 1024px) starts with the sidebar open;
// mobile starts with it closed (off-canvas drawer).
const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light', isSidebarOpen: isDesktop,
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    { name: 'numerycode-ui', version: 1 }
  )
)
