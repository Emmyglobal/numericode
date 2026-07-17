import { api } from '@/lib/axios'
import type { LoginPayload, RegisterPayload, AuthResponse, PendingApprovalResponse } from '@/features/auth/types'
import type { ApiResponse } from '@/types/api.types'

export const authService = {
  login: async (p: LoginPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', p)
    return data.data
  },
  register: async (p: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<AuthResponse | PendingApprovalResponse>>('/auth/register', p)
    return data.data
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post<ApiResponse<null>>('/auth/forgot-password', { email })
    return data
  },
}
