import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePageTitle } from '@/hooks/usePageTitle'

describe('usePageTitle hook', () => {
  const originalTitle = document.title
  afterEach(() => { document.title = originalTitle })

  it('sets the document title with NumeriCode suffix', () => {
    renderHook(() => usePageTitle('Dashboard'))
    expect(document.title).toBe('Dashboard | NumeriCode')
  })

  it('updates the title when the argument changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Home' },
    })
    expect(document.title).toBe('Home | NumeriCode')
    rerender({ title: 'Courses' })
    expect(document.title).toBe('Courses | NumeriCode')
  })

  it('resets title to the base on unmount', () => {
    const { unmount } = renderHook(() => usePageTitle('Profile'))
    expect(document.title).toBe('Profile | NumeriCode')
    unmount()
    expect(document.title).toBe('NumeriCode — Mathematics & Code, Taught Live')
  })
})
