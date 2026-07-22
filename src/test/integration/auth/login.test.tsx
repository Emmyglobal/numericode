import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import LoginPage from '@/pages/auth/LoginPage'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock auth service
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockImplementation(async ({ email, password }: { email: string; password: string }) => {
      if (email === 'kolade@gmail.com' && password.length >= 6) {
        return { user: { id: 'u2', name: 'Kolade', email, role: 'student', createdAt: '2024-01-01' }, token: 'mock-token' }
      }
      if (email === 'trainer@numericode.com' && password.length >= 6) {
        return { user: { id: 'u7', name: 'Trainer', email, role: 'trainer', createdAt: '2024-01-01' }, token: 'mock-token' }
      }
      if (email === 'emmanuel@numericode.com' && password.length >= 6) {
        return { user: { id: 'u1', name: 'Emmanuel', email, role: 'admin', createdAt: '2024-01-01' }, token: 'mock-token' }
      }
      throw new Error('Invalid email or password')
    }),
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  it('renders the heading and form fields', () => {
    render(<LoginPage />)
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is empty on submit', async () => {
    render(<LoginPage />)
    const form = document.querySelector('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some(el => /valid email/i.test(el.textContent ?? ''))).toBe(true)
    }, { timeout: 2000 })
  })

  it('shows validation error when password is empty on submit', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'kolade@gmail.com')
    const form = document.querySelector('form')
    if (form) fireEvent.submit(form)
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.some(el => /password is required/i.test(el.textContent ?? ''))).toBe(true)
    }, { timeout: 2000 })
  })

  it('logs in student and navigates to /dashboard', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'kolade@gmail.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().user?.role).toBe('student')
  })

  it('logs in trainer and navigates to /trainer', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'trainer@numericode.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/trainer')
    })
    expect(useAuthStore.getState().user?.role).toBe('trainer')
  })

  it('logs in admin and navigates to /admin', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'emmanuel@numericode.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin')
    })
    expect(useAuthStore.getState().user?.role).toBe('admin')
  })

  it('shows error alert on invalid credentials', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email or password/i)
    })
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('clears the error alert when onClose is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await user.type(screen.getByLabelText(/email address/i), 'bad@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'badpass1')
    await user.click(screen.getByRole('button', { name: /log in/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders a link to the register page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register')
  })

  it('renders a link to forgot password page', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/forgot-password')
  })
})
