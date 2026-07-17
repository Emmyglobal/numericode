import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import LiveClassesPage from '@/pages/dashboard/LiveClassesPage'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getLiveClasses: vi.fn().mockResolvedValue([
      { id: 'lc1', courseId:'c1', courseTitle:'Foundation Mathematics', subject:'mathematics', title:'Algebra Q&A Session',   date:'2026-07-05T10:00:00', duration:60, meetUrl:'https://meet.google.com/abc', status:'upcoming' },
      { id: 'lc2', courseId:'c2', courseTitle:'JavaScript Beginners',   subject:'programming', title:'JavaScript Live Class', date:'2026-07-04T14:00:00', duration:60, meetUrl:'https://zoom.us/j/123',        status:'live'     },
      { id: 'lc3', courseId:'c3', courseTitle:'Algebra & Equations',    subject:'mathematics', title:'Past Quadratics Class', date:'2026-06-20T11:00:00', duration:90, meetUrl:'#',                            status:'past'     },
    ]),
  },
}))

describe('LiveClassesPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id:'u2', name:'Kolade', email:'kolade@gmail.com', role:'student', createdAt:'2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders page heading', () => {
    render(<LiveClassesPage />)
    expect(screen.getByRole('heading', { name: /live classes/i })).toBeInTheDocument()
  })

  it('renders 4 filter tabs', () => {
    render(<LiveClassesPage />)
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('"all" tab is selected by default', () => {
    render(<LiveClassesPage />)
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('shows all classes in "all" tab', async () => {
    render(<LiveClassesPage />)
    await waitFor(() => {
      expect(screen.getByText('Algebra Q&A Session')).toBeInTheDocument()
      expect(screen.getByText('JavaScript Live Class')).toBeInTheDocument()
      expect(screen.getByText('Past Quadratics Class')).toBeInTheDocument()
    })
  })

  it('filters to upcoming only', async () => {
    const user = userEvent.setup()
    render(<LiveClassesPage />)
    await waitFor(() => screen.getByText('Algebra Q&A Session'))
    await user.click(screen.getByRole('tab', { name: /upcoming/i }))
    await waitFor(() => {
      expect(screen.getByText('Algebra Q&A Session')).toBeInTheDocument()
      expect(screen.queryByText('JavaScript Live Class')).not.toBeInTheDocument()
      expect(screen.queryByText('Past Quadratics Class')).not.toBeInTheDocument()
    })
  })

  it('filters to past only', async () => {
    const user = userEvent.setup()
    render(<LiveClassesPage />)
    await waitFor(() => screen.getByText('Past Quadratics Class'))
    await user.click(screen.getByRole('tab', { name: /past/i }))
    await waitFor(() => {
      expect(screen.getByText('Past Quadratics Class')).toBeInTheDocument()
      expect(screen.queryByText('Algebra Q&A Session')).not.toBeInTheDocument()
    })
  })

  it('past class join button is disabled', async () => {
    render(<LiveClassesPage />)
    await waitFor(() => screen.getByText('Past Quadratics Class'))
    const endedBtns = screen.getAllByRole('button', { name: /ended/i })
    endedBtns.forEach(b => expect(b).toBeDisabled())
  })

  it('tab panel has correct role', () => {
    render(<LiveClassesPage />)
    expect(screen.getByRole('tabpanel')).toBeInTheDocument()
  })
})
