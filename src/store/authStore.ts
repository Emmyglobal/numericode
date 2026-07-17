import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/features/auth/types'

export type UserRole = 'student' | 'trainer' | 'admin'

export interface AuthUserWithRole extends AuthUser {
  role: UserRole
}

interface AuthState {
  user: AuthUserWithRole | null
  token: string | null
  isAuthenticated: boolean
  login: (user: AuthUserWithRole, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'numericode-auth' }
  )
)
