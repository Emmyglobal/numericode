import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

const mockUser = {
  id: 'u1', name: 'Emmanuel Nwafor', email: 'emmanuel@numericode.com',
  role: 'admin' as const, createdAt: '2024-01-01',
}

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  it('starts with unauthenticated state', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('sets user, token, and isAuthenticated on login', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => { result.current.login(mockUser, 'mock-token-123') })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.token).toBe('mock-token-123')
  })

  it('clears state on logout', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => { result.current.login(mockUser, 'mock-token') })
    act(() => { result.current.logout() })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('stores user role correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    act(() => { result.current.login(mockUser, 'token') })
    expect(result.current.user?.role).toBe('admin')
  })

  it('stores student role correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    const student = { ...mockUser, role: 'student' as const }
    act(() => { result.current.login(student, 'token') })
    expect(result.current.user?.role).toBe('student')
  })

  it('stores trainer role correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    const trainer = { ...mockUser, role: 'trainer' as const }
    act(() => { result.current.login(trainer, 'token') })
    expect(result.current.user?.role).toBe('trainer')
  })
})
