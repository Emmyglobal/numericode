import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'

vi.mock('@/services/auth.service', () => ({
  authService: {
    forgotPassword: vi.fn().mockResolvedValue({ success: true }),
  },
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading and email field', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('shows success state after submitting', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email address/i), 'kolade@gmail.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
    })
  })

  it('shows the submitted email in the success state', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    })
  })

  it('renders back to login link', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument()
  })

  it('shows back to login button in success state', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument()
    })
  })
})
