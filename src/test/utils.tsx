import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom'

// Fresh QueryClient per test — no cache bleed between tests
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

interface WrapperOptions extends RenderOptions {
  routerProps?: MemoryRouterProps
}

export function renderWithProviders(
  ui: ReactElement,
  { routerProps, ...renderOptions }: WrapperOptions = {}
) {
  const queryClient = makeQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient }
}

// Re-export everything from RTL for convenience
export * from '@testing-library/react'
export { renderWithProviders as render }
