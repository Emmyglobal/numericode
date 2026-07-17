import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import React from 'react'

// ── Framer Motion mock (top-level as required) ────────────────────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div:     ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>)  => React.createElement('div',     p, children),
    section: ({ children, ...p }: React.HTMLAttributes<HTMLElement>)    => React.createElement('section', p, children),
    li:      ({ children, ...p }: React.HTMLAttributes<HTMLLIElement>)   => React.createElement('li',      p, children),
    ul:      ({ children, ...p }: React.HTMLAttributes<HTMLUListElement>)=> React.createElement('ul',      p, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation:    () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView:       () => true,
}))

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock localStorage
  const store: Record<string, string> = {}
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem:    (k: string) => store[k] ?? null,
      setItem:    (k: string, v: string) => { store[k] = v },
      removeItem: (k: string) => { delete store[k] },
      clear:      () => Object.keys(store).forEach(k => delete store[k]),
    },
  })

  window.scrollTo = vi.fn()
})
