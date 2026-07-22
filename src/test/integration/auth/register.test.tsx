import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import RegisterPage from '@/pages/auth/RegisterPage'

// Stable navigate mock — must NOT return new fn() each render
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/auth.service', () => ({
  authService: {
    register: vi.fn().mockImplementation(async ({ name, email, role }: { name: string; email: string; role: 'student' | 'trainer' }) => {
      if (email === 'taken@example.com') throw new Error('An account with this email already exists')
      return { user: { id: 'new-1', name, email, role, createdAt: new Date().toISOString() }, token: 'new-token' }
    }),
  },
}))

// Helper: submit the form via fireEvent (bypasses jsdom click→submit issues)
function submitForm() {
  const form = document.querySelector('form')
  if (form) fireEvent.submit(form)
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders all form fields', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create .*account/i })).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')
  })

  it('renders Student and Trainer account type options', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.getByText('Trainer')).toBeInTheDocument()
  })

  it('defaults to Student selected', () => {
    render(<RegisterPage />)
    const radios = screen.getAllByRole('radio') as HTMLInputElement[]
    const checked = radios.find(r => r.checked)
    expect(checked?.value).toBe('student')
  })

  it('shows the disabled Admin option with an explanation', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText(/granted internally/i)).toBeInTheDocument()
  })

  it('submit button label changes based on selected account type', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: /create student account/i })).toBeInTheDocument()

    const trainerCard = screen.getByText('Trainer')
    await user.click(trainerCard)

    expect(screen.getByRole('button', { name: /create trainer account/i })).toBeInTheDocument()
  })

  // ── Validation (fireEvent.submit to bypass jsdom click limitation) ─────────

  it('shows error when submitting with empty name', async () => {
    render(<RegisterPage />)
    submitForm()
    await waitFor(() => {
      expect(screen.getAllByRole('alert').some(el =>
        /valid email|2 characters/i.test(el.textContent ?? '')
      )).toBe(true)
    }, { timeout: 2000 })
  })

  it('shows "at least 2 characters" when name is one character', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'A')
    submitForm()
    await waitFor(() => {
      expect(screen.getAllByRole('alert').some(el =>
        /2 characters/i.test(el.textContent ?? '')
      )).toBe(true)
    }, { timeout: 2000 })
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Kolade Adebayo')
    await user.type(screen.getByLabelText(/email address/i), 'notanemail')
    submitForm()
    await waitFor(() => {
      expect(screen.getAllByRole('alert').some(el =>
        /valid email/i.test(el.textContent ?? '')
      )).toBe(true)
    }, { timeout: 2000 })
  })

  it('shows password length error when under 8 characters', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Kolade Adebayo')
    await user.type(screen.getByLabelText(/email address/i), 'k@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'short')
    submitForm()
    await waitFor(() => {
      expect(screen.getAllByRole('alert').some(el =>
        /8 characters/i.test(el.textContent ?? '')
      )).toBe(true)
    }, { timeout: 2000 })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Kolade Adebayo')
    await user.type(screen.getByLabelText(/email address/i), 'k@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'different999')
    submitForm()
    await waitFor(() => {
      expect(screen.getAllByRole('alert').some(el =>
        /do not match/i.test(el.textContent ?? '')
      )).toBe(true)
    }, { timeout: 2000 })
  })

  // ── Password strength indicator ────────────────────────────────────────────

  it('shows weak strength indicator for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'abc')
    expect(screen.getByText(/strength: weak/i)).toBeInTheDocument()
  })

  it('shows medium strength for 6-9 char password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'medium1')
    expect(screen.getByText(/strength: medium/i)).toBeInTheDocument()
  })

  it('shows strong strength for 10+ char password', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'strongpassword')
    expect(screen.getByText(/strength: strong/i)).toBeInTheDocument()
  })

  // ── Successful registration ───────────────────────────────────────────────

  it('registers as trainer and navigates to /trainer on success', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.click(screen.getByText('Trainer'))
    await user.type(screen.getByLabelText(/full name/i), 'Kolade Adebayo')
    await user.type(screen.getByLabelText(/email address/i), 'new@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create .*account/i }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/trainer'))
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('shows error alert when email is already taken', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await user.click(screen.getByText('Trainer'))
    await user.type(screen.getByLabelText(/full name/i), 'Existing User')
    await user.type(screen.getByLabelText(/email address/i), 'taken@example.com')
    await user.type(screen.getByPlaceholderText('Min. 8 characters'), 'password123')
    await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create .*account/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i)
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
