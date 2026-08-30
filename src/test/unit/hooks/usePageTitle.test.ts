import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePageTitle } from '@/hooks/usePageTitle'

describe('usePageTitle hook', () => {
  const originalTitle = document.title
  afterEach(() => { document.title = originalTitle })

  it('sets the document title with NumeryCode suffix', () => {
    renderHook(() => usePageTitle('Dashboard'))
    expect(document.title).toBe('Dashboard | NumeryCode')
  })

  it('updates the title when the argument changes', () => {
    const { rerender } = renderHook(({ title }) => usePageTitle(title), {
      initialProps: { title: 'Home' },
    })
    expect(document.title).toBe('Home | NumeryCode')
    rerender({ title: 'Courses' })
    expect(document.title).toBe('Courses | NumeryCode')
  })

  it('resets title to the base on unmount', () => {
    const { unmount } = renderHook(() => usePageTitle('Profile'))
    expect(document.title).toBe('Profile | NumeryCode')
    unmount()
    expect(document.title).toBe('NumeryCode | Learn Mathematics & Programming Online')
  })
})
