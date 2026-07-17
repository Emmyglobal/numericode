import { describe, it, expect } from 'vitest'
import { cn } from '@/utils/classNames'

describe('cn — className utility', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500')
  })

  it('merges multiple classes', () => {
    expect(cn('px-4', 'py-2', 'rounded')).toBe('px-4 py-2 rounded')
  })

  it('resolves Tailwind conflicts — last wins', () => {
    // tailwind-merge resolves padding conflict
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('ignores falsy conditional values', () => {
    expect(cn('base', false && 'ignored', null, undefined, '')).toBe('base')
  })

  it('applies conditional class when truthy', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('handles object syntax from clsx', () => {
    expect(cn({ 'text-white': true, 'text-black': false })).toBe('text-white')
  })

  it('handles array syntax', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2')
  })

  it('merges responsive prefix conflicts correctly', () => {
    expect(cn('lg:px-4', 'lg:px-8')).toBe('lg:px-8')
  })

  it('handles dark mode prefix without conflict', () => {
    expect(cn('text-white', 'dark:text-black')).toBe('text-white dark:text-black')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })
})
