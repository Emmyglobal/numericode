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
}