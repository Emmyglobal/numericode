import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// Production fallback API base. In production MSW is stubbed out, so requests
// must reach the real backend. If VITE_API_BASE_URL is left at the development
// value `/api` (e.g. set to `/api` in the host's dashboard, as some guides
// advise for the MVP), a relative path would hit the static host's own `/api…`
// and be rewritten to index.html — silently returning no data. We therefore
// prefer an absolute configured URL and otherwise fall back to the live API.
// Change this constant if you deploy the backend somewhere else.
const PROD_API_BASE_URL = 'https://numerycode-api.onrender.com/api'

function resolveBaseUrl(): string {
  if (import.meta.env.PROD) {
    const configured = import.meta.env.VITE_API_BASE_URL
    if (configured && !configured.startsWith('/')) return configured
    return PROD_API_BASE_URL
  }
  // Development — MSW intercepts same-origin `/api` requests.
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

const api = axios.create({
  baseURL: resolveBaseUrl(),
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
