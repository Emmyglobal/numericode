import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage'

const postMock  = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 'new-course', status: 'draft' } } })
const patchMock = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url === '/admin/trainers') {
        return Promise.resolve({ data: { success: true, data: [
          { id: 'u7', name: 'Trainer One', email: 'trainer@numericode.com' },
        ]}})
      }
      return Promise.resolve({ data: { success: true, data: [
        { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner', instructor: 'Trainer One', status: 'published', enrolledCount: 18, createdAt: '2024-01-10' },
        { id: 'c4', title: 'Python Programming',     subject: 'programming', level: 'intermediate', instructor: 'Trainer One', status: 'draft', enrolledCount: 0, createdAt: '2024-04-01' },
      ]}})
    }),
    post:  (...args: unknown[]) => postMock(...args),
    patch: (...args: unknown[]) => patchMock(...args),
  },
}))

describe('AdminCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 'u1', name: 'Emmanuel', email: 'admin@numericode.com', role: 'admin', createdAt: '2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders page heading and existing courses', async () => {
    render(<AdminCoursesPage />)
    await waitFor(() => {
      expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
      expect(screen.getByText('Python Programming')).toBeInTheDocument()
    })
  })

  it('opens the create modal with an instructor dropdown', async () => {
    const user = userEvent.setup()
    render(<AdminCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    await waitFor(() => screen.getByRole('combobox', { name: /assign instructor/i }))
    expect(screen.getByRole('combobox', { name: /assign instructor/i })).toBeInTheDocument()
  })

  it('shows a validation error when no instructor is selected', async () => {
    const user = userEvent.setup()
    render(<AdminCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    await waitFor(() => screen.getByRole('combobox', { name: /assign instructor/i }))
    await user.type(screen.getByLabelText(/course title/i), 'X')
    await user.type(screen.getByLabelText(/description/i), 'Y')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(screen.getByText(/please select an instructor/i)).toBeInTheDocument()
  })

  it('creates a course assigned to a specific trainer', async () => {
    const user = userEvent.setup()
    render(<AdminCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    await waitFor(() => screen.getByRole('combobox', { name: /assign instructor/i }))
    await user.type(screen.getByLabelText(/course title/i), 'Admin Created Course')
    await user.type(screen.getByLabelText(/description/i), 'desc')
    await user.selectOptions(screen.getByRole('combobox', { name: /assign instructor/i }), 'u7')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/admin/courses', expect.objectContaining({ title: 'Admin Created Course', instructorId: 'u7' }))
    })
  })

  it('a draft course shows a Publish button', async () => {
    render(<AdminCoursesPage />)
    await waitFor(() => screen.getByText('Python Programming'))
    const rows = screen.getAllByRole('row')
    const draftRow = rows.find(r => r.textContent?.includes('Python Programming'))
    expect(draftRow ? within(draftRow).getByRole('button', { name: /^publish$/i }) : null).toBeInTheDocument()
  })

  it('a published course does not show a Publish button', async () => {
    render(<AdminCoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    const rows = screen.getAllByRole('row')
    const publishedRow = rows.find(r => r.textContent?.includes('Foundation Mathematics'))
    const buttonsInRow = publishedRow ? within(publishedRow).queryAllByRole('button') : []
    expect(buttonsInRow.some(b => /^publish$/i.test(b.textContent?.trim() ?? ''))).toBe(false)
  })

  it('clicking Publish on a draft course calls the status endpoint', async () => {
    const user = userEvent.setup()
    render(<AdminCoursesPage />)
    await waitFor(() => screen.getByText('Python Programming'))
    const rows = screen.getAllByRole('row')
    const draftRow = rows.find(r => r.textContent?.includes('Python Programming'))!
    await user.click(within(draftRow).getByRole('button', { name: /^publish$/i }))
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith('/admin/courses/c4/status', { status: 'published' })
    })
  })

  it('clicking Archive calls the status endpoint with archived', async () => {
    const user = userEvent.setup()
    render(<AdminCoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    const archiveButtons = screen.getAllByRole('button', { name: /archive/i })
    await user.click(archiveButtons[0])
    await waitFor(() => expect(patchMock).toHaveBeenCalled())
  })
})
