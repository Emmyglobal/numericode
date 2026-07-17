import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import AssignmentsPage from '@/pages/dashboard/AssignmentsPage'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getAssignments: vi.fn().mockResolvedValue([
      { id: 'a1', courseId: 'c1', courseTitle: 'Foundation Mathematics',    title: 'Fractions Worksheet', dueDate: '2026-07-08', status: 'pending'   },
      { id: 'a2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Build a Calculator',  dueDate: '2026-07-10', status: 'pending'   },
      { id: 'a3', courseId: 'c1', courseTitle: 'Foundation Mathematics',    title: 'Number Patterns Quiz', dueDate: '2026-06-28', status: 'overdue'  },
      { id: 'a4', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Variables Exercise',   dueDate: '2026-06-25', status: 'submitted' },
    ]),
  },
}))

describe('AssignmentsPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'u2', name: 'Kolade', email: 'kolade@gmail.com', role: 'student', createdAt: '2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders the page heading', () => {
    render(<AssignmentsPage />)
    expect(screen.getByRole('heading', { name: /assignments/i })).toBeInTheDocument()
  })

  it('renders Pending and Completed tabs', () => {
    render(<AssignmentsPage />)
    expect(screen.getByRole('tab', { name: /pending/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument()
  })

  it('pending tab is selected by default', () => {
    render(<AssignmentsPage />)
    expect(screen.getByRole('tab', { name: /pending/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows pending and overdue assignments in pending tab', async () => {
    render(<AssignmentsPage />)
    await waitFor(() => {
      expect(screen.getByText('Fractions Worksheet')).toBeInTheDocument()
      expect(screen.getByText('Build a Calculator')).toBeInTheDocument()
      expect(screen.getByText('Number Patterns Quiz')).toBeInTheDocument()
    })
  })

  it('does not show submitted assignment in pending tab', async () => {
    render(<AssignmentsPage />)
    await waitFor(() => screen.getByText('Fractions Worksheet'))
    expect(screen.queryByText('Variables Exercise')).not.toBeInTheDocument()
  })

  it('switches to completed tab on click', async () => {
    const user = userEvent.setup()
    render(<AssignmentsPage />)
    await user.click(screen.getByRole('tab', { name: /completed/i }))
    expect(screen.getByRole('tab', { name: /completed/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows submitted assignment in completed tab', async () => {
    const user = userEvent.setup()
    render(<AssignmentsPage />)
    await waitFor(() => screen.getByText('Fractions Worksheet'))
    await user.click(screen.getByRole('tab', { name: /completed/i }))
    await waitFor(() => {
      expect(screen.getByText('Variables Exercise')).toBeInTheDocument()
    })
  })

  it('uses semantic time elements for due dates', async () => {
    render(<AssignmentsPage />)
    await waitFor(() => screen.getByText('Fractions Worksheet'))
    expect(document.querySelectorAll('time').length).toBeGreaterThan(0)
  })
})
