import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { NotificationBell } from '@/components/navigation/NotificationBell'

const listMock         = vi.fn()
const markAsReadMock   = vi.fn().mockResolvedValue({ id: 'n1', isRead: true })
const markAllReadMock  = vi.fn().mockResolvedValue({ success: true })

vi.mock('@/services/notifications.service', () => ({
  notificationsService: {
    list:          () => listMock(),
    markAsRead:    (id: string) => markAsReadMock(id),
    markAllAsRead: () => markAllReadMock(),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listMock.mockResolvedValue({
      unreadCount: 2,
      notifications: [
        { id: 'n1', title: 'New trainer awaiting approval', body: 'Ibrahim Musa needs approval.', type: 'trainer_approval', link: '/admin/users', isRead: false, createdAt: new Date().toISOString() },
        { id: 'n2', title: 'Course published', body: 'Your course is live.', type: 'course', link: '/courses/c1', isRead: false, createdAt: new Date().toISOString() },
        { id: 'n3', title: 'Old announcement', body: 'Already read this one.', type: 'announcement', link: null, isRead: true, createdAt: new Date().toISOString() },
      ],
    })
  })

  it('renders the bell button', () => {
    render(<NotificationBell />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows the unread count badge', async () => {
    render(<NotificationBell />)
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
  })

  it('does not show a badge when there are no unread notifications', async () => {
    listMock.mockResolvedValue({ unreadCount: 0, notifications: [] })
    render(<NotificationBell />)
    await waitFor(() => expect(listMock).toHaveBeenCalled())
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('opens the dropdown on click and shows notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => {
      expect(screen.getByText('New trainer awaiting approval')).toBeInTheDocument()
      expect(screen.getByText('Course published')).toBeInTheDocument()
    })
  })

  it('shows "Mark all read" only when there are unread notifications', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => expect(screen.getByText(/mark all read/i)).toBeInTheDocument())
  })

  it('clicking an unread notification marks it as read and navigates to its link', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => screen.getByText('New trainer awaiting approval'))
    await user.click(screen.getByText('New trainer awaiting approval'))
    await waitFor(() => {
      expect(markAsReadMock).toHaveBeenCalledWith('n1')
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('clicking "Mark all read" calls the API', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => screen.getByText(/mark all read/i))
    await user.click(screen.getByText(/mark all read/i))
    await waitFor(() => expect(markAllReadMock).toHaveBeenCalled())
  })

  it('shows empty state when there are no notifications at all', async () => {
    listMock.mockResolvedValue({ unreadCount: 0, notifications: [] })
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument())
  })

  it('closes the dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <NotificationBell />
        <div data-testid="outside">Outside</div>
      </div>
    )
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await waitFor(() => screen.getByRole('menu'))
    await user.click(screen.getByTestId('outside'))
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })
})
