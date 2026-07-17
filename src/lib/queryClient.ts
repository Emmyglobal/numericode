import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes default — good for course catalogue (changes rarely)
      staleTime: 5 * 60 * 1000,
      // Keep unused data for 10 minutes before garbage collecting
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      // Show stale data while revalidating in background (faster perceived performance)
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

// Per-query stale times — use these as queryKey second arg or in individual queries
export const STALE_TIMES = {
  /** Course catalogue — changes rarely */
  COURSES:       5  * 60 * 1000,
  /** Dashboard stats — refresh often */
  DASHBOARD:     2  * 60 * 1000,
  /** Live classes — needs to be fresh */
  LIVE_CLASSES:  1  * 60 * 1000,
  /** Announcements — moderate freshness */
  ANNOUNCEMENTS: 3  * 60 * 1000,
  /** Profile — only stale after explicit edit */
  PROFILE:       10 * 60 * 1000,
  /** Admin data — moderate freshness */
  ADMIN:         2  * 60 * 1000,
} as const
