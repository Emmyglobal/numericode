import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import type { ReactNode } from 'react'
export function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
}
