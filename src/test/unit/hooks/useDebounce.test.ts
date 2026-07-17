import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce hook', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(()  => { vi.useRealTimers() })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 400))
    expect(result.current).toBe('hello')
  })

  it('does not update immediately when value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'initial' } }
    )
    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')
  })

  it('updates after the delay has elapsed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'initial' } }
    )
    rerender({ value: 'updated' })
    act(() => { vi.advanceTimersByTime(400) })
    expect(result.current).toBe('updated')
  })

  it('resets the timer on rapid updates — only last value applied', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 400),
      { initialProps: { value: 'a' } }
    )
    rerender({ value: 'b' })
    act(() => { vi.advanceTimersByTime(200) })
    rerender({ value: 'c' })
    act(() => { vi.advanceTimersByTime(200) })
    // Timer not yet elapsed from last 'c' update
    expect(result.current).toBe('a')

    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('c')
  })

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    )
    rerender({ value: 42 })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe(42)
  })

  it('uses default delay of 400ms when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } }
    )
    rerender({ value: 'second' })
    act(() => { vi.advanceTimersByTime(399) })
    expect(result.current).toBe('first')
    act(() => { vi.advanceTimersByTime(1) })
    expect(result.current).toBe('second')
  })
})
