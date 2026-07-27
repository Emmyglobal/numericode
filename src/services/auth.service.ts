import { api } from '@/lib/axios'
import type { LoginPayload, RegisterPayload, AuthResponse, PendingApprovalResponse } from '@/features/auth/types'
import type { ApiResponse } from '@/types/api.types'

export const authService = {
  login: async (p: LoginPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse | PendingApprovalResponse>>('/auth/login', p)
    
    // Check if account is pending approval
    if (data.data && 'pendingApproval' in data.data && data.data.pendingApproval) {
      throw { pendingApproval: true, message: data.data.message }
    }
    
    return data.data as AuthResponse
  },
  register: async (p: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse | PendingApprovalResponse>>('/auth/register', p)
    return data.data
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
    return data
  },
  resetPassword: async (p: { token: string; password: string }) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/reset-password', p)
    return data
  },
  changePassword: async (p: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/change-password', p)
    return data
  },
  activateAccount: async (p: { token: string }) => {
    const { data } = await api.post<ApiResponse<{ message: string }>>('/auth/activate-account', p)
    return data.data || data
  },

  // ─── Google OAuth ───────────────────────────────────────────────────────────
  /** Fetches the Google OAuth consent URL from the backend. */
  getGoogleAuthUrl: async (): Promise<string> => {
    const { data } = await api.get<ApiResponse<{ url: string }>>('/auth/google/url')
    return data.data.url
  },
  /** Redirects the browser to Google's OAuth consent page. */
  googleLogin: async () => {
    const url = await authService.getGoogleAuthUrl()
    window.location.href = url
  },
  /** Fetches the current authenticated user from the backend. */
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const { data } = await api.get<ApiResponse<{ user: AuthResponse['user'] }>>('/auth/me')
    return data.data.user
  },
}
