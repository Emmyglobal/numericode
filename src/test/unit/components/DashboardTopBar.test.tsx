import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { DashboardTopBar } from '@/components/navigation/DashboardTopBar'
import { useUIStore } from '@/store/uiStore'

vi.mock('@/services/notifications.service', () => ({
  notificationsService: {
    list:          () => Promise.resolve({ unreadCount: 0, notifications: [] }),
    markAsRead:    () => Promise.resolve({ success: true }),
    markAllAsRead: () => Promise.resolve({ success: true }),
  },
}))

describe('DashboardTopBar hamburger menu', () => {
  beforeEach(() => {
    useUIStore.setState({ isSidebarOpen: false })
  })

  it('renders the hamburger with the sidebar closed', () => {
    render(<DashboardTopBar title="Overview" />)
    const button = screen.getByRole('button', { name: /open sidebar navigation/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the sidebar when the hamburger is clicked', async () => {
    const user = userEvent.setup()
    render(<DashboardTopBar title="Overview" />)

    await user.click(screen.getByRole('button', { name: /open sidebar navigation/i }))

    expect(useUIStore.getState().isSidebarOpen).toBe(true)
    expect(screen.getByRole('button', { name: /close sidebar navigation/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the sidebar when the hamburger is clicked while it is open', async () => {
    const user = userEvent.setup()
    useUIStore.setState({ isSidebarOpen: true })
    render(<DashboardTopBar title="Overview" />)

    await user.click(screen.getByRole('button', { name: /close sidebar navigation/i }))

    expect(useUIStore.getState().isSidebarOpen).toBe(false)
    expect(screen.getByRole('button', { name: /open sidebar navigation/i })).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles open then closed on consecutive clicks', async () => {
    const user = userEvent.setup()
    render(<DashboardTopBar title="Overview" />)

    await user.click(screen.getByRole('button', { name: /open sidebar navigation/i }))
    await user.click(screen.getByRole('button', { name: /close sidebar navigation/i }))

    expect(useUIStore.getState().isSidebarOpen).toBe(false)
    expect(screen.getByRole('button', { name: /open sidebar navigation/i })).toHaveAttribute('aria-expanded', 'false')
  })
})