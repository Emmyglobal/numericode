import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message
    if (message) error.message = message

    const isAuthRequest = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthRequest) {
      const auth = useAuthStore.getState()
      if (auth.isAuthenticated) {
        auth.logout()
        if (window.location.pathname !== '/login') window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export { api }
