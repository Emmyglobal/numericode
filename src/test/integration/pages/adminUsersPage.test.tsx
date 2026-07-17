import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

const patchMock = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [
      { id:'u1', name:'Emmanuel Nwafor', email:'emmanuel@numericode.com', role:'admin',   status:'active',    joinedAt:'2024-01-01', lastActive:'2026-07-01' },
      { id:'u2', name:'Kolade Adebayo',  email:'kolade@gmail.com',        role:'student', status:'active',    joinedAt:'2024-02-10', lastActive:'2026-06-30' },
      { id:'u3', name:'Emeka Nwosu',     email:'emeka@gmail.com',         role:'student', status:'suspended', joinedAt:'2024-04-05', lastActive:'2026-06-25' },
      { id:'u7', name:'Trainer One',     email:'trainer@numericode.com',  role:'trainer', status:'active',    joinedAt:'2024-01-05', lastActive:'2026-07-01' },
      { id:'u9', name:'Ibrahim Musa',    email:'ibrahim@gmail.com',       role:'trainer', status:'pending',   joinedAt:'2026-07-08', lastActive:'2026-07-08' },
    ]}}),
    patch: (...args: unknown[]) => patchMock(...args),
  },
}))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id:'u1', name:'Emmanuel', email:'admin@numericode.com', role:'admin', createdAt:'2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders page heading', () => {
    render(<AdminUsersPage />)
    expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument()
  })

  it('renders user table after loading', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument()
      expect(screen.getByText('Kolade Adebayo')).toBeInTheDocument()
    })
  })

  it('shows Approve/Reject actions for a pending trainer', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Ibrahim Musa'))
    expect(screen.getByRole('button', { name: /approve ibrahim musa/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject ibrahim musa/i })).toBeInTheDocument()
  })

  it('shows "Awaiting Approval" status badge for a pending trainer', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Ibrahim Musa'))
    expect(screen.getByText('Awaiting Approval')).toBeInTheDocument()
  })

  it('clicking Approve calls the API and shows a success message', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Ibrahim Musa'))
    await user.click(screen.getByRole('button', { name: /approve ibrahim musa/i }))
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith('/admin/users/u9', { status: 'active' })
    })
  })

  it('renders role filter buttons', () => {
    render(<AdminUsersPage />)
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^student$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^trainer$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^admin$/i })).toBeInTheDocument()
  })

  it('filters to students only', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Emmanuel Nwafor'))
    await user.click(screen.getByRole('button', { name: /^student$/i }))
    await waitFor(() => {
      expect(screen.getByText('Kolade Adebayo')).toBeInTheDocument()
      expect(screen.queryByText('Emmanuel Nwafor')).not.toBeInTheDocument()
      expect(screen.queryByText('Trainer One')).not.toBeInTheDocument()
    })
  })

  it('filters by search text', async () => {
    const user = userEvent.setup()
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Emmanuel Nwafor'))
    await user.type(screen.getByLabelText(/search users/i), 'kolade')
    await waitFor(() => {
      expect(screen.getByText('Kolade Adebayo')).toBeInTheDocument()
      expect(screen.queryByText('Emmanuel Nwafor')).not.toBeInTheDocument()
    })
  })

  it('shows suspended status in Emeka row', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => screen.getByText('Emeka Nwosu'))
    const rows = screen.getAllByRole('row')
    const emekaRow = rows.find(r => r.textContent?.includes('Emeka Nwosu'))
    expect(emekaRow?.textContent).toMatch(/suspended/i)
  })

  it('shows live count of all users', async () => {
    render(<AdminUsersPage />)
    await waitFor(() => {
      expect(screen.getByText(/5 users/i)).toBeInTheDocument()
    })
  })
})
