import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import ProfilePage from '@/pages/dashboard/ProfilePage'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getProfile: vi.fn().mockResolvedValue({
      name: 'Kolade Adebayo',
      email: 'kolade@gmail.com',
      bio: 'Passionate learner.',
    }),
    updateProfile: vi.fn().mockResolvedValue({}),
  },
}))

describe('ProfilePage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u2', name: 'Kolade Adebayo', email: 'kolade@gmail.com', role: 'student', createdAt: '2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders the page heading', async () => {
    render(<ProfilePage />)
    // PageHeader renders an h1
    await waitFor(() => {
      const headings = screen.getAllByRole('heading')
      const profileHeading = headings.find(h => /my profile/i.test(h.textContent ?? ''))
      expect(profileHeading).toBeInTheDocument()
    })
  })

  it('displays user name in avatar initials', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByText('KA')).toBeInTheDocument()
    })
  })

  it('populates name field from API', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Kolade Adebayo')).toBeInTheDocument()
    })
  })

  it('populates bio field from API', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByDisplayValue('Passionate learner.')).toBeInTheDocument()
    })
  })

  it('email field is disabled (read-only)', async () => {
    render(<ProfilePage />)
    await waitFor(() => {
      const emailInput = screen.getByDisplayValue('kolade@gmail.com')
      expect(emailInput).toBeDisabled()
    })
  })

  it('shows success alert after saving changes', async () => {
    const user = userEvent.setup()
    render(<ProfilePage />)
    await waitFor(() => screen.getByDisplayValue('Kolade Adebayo'))
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/profile saved successfully/i)
    })
  })

  it('dark mode toggle has role="switch"', async () => {
    render(<ProfilePage />)
    await waitFor(() => screen.getByDisplayValue('Kolade Adebayo'))
    const toggle = screen.getByRole('switch', { name: /dark mode/i })
    expect(toggle).toBeInTheDocument()
  })

  it('dark mode toggle has aria-checked attribute', async () => {
    render(<ProfilePage />)
    await waitFor(() => screen.getByDisplayValue('Kolade Adebayo'))
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked')
  })

  it('change password section is present', async () => {
    render(<ProfilePage />)
    await waitFor(() => screen.getByDisplayValue('Kolade Adebayo'))
    // h2 heading for Change Password section
    const headings = screen.getAllByRole('heading')
    const changePasswordHeading = headings.find(h => /change password/i.test(h.textContent ?? ''))
    expect(changePasswordHeading).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('preferences section is present', async () => {
    render(<ProfilePage />)
    await waitFor(() => screen.getByDisplayValue('Kolade Adebayo'))
    expect(screen.getByRole('heading', { name: /preferences/i })).toBeInTheDocument()
  })
})
