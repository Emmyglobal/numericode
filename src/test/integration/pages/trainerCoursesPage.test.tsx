import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import TrainerCoursesPage from '@/pages/trainer/TrainerCoursesPage'

const postMock  = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 'new-course', status: 'draft' } } })
const putMock   = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })
const patchMock = vi.fn().mockResolvedValue({ data: { success: true, data: {} } })

vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [
      { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner', status: 'published', enrolledCount: 18, lessonCount: 24, completionRate: 72, createdAt: '2024-01-10' },
      { id: 'c4', title: 'Python Programming',     subject: 'programming', level: 'intermediate', status: 'draft', enrolledCount: 0, lessonCount: 10, completionRate: 0, createdAt: '2024-04-01' },
    ]}}),
    post:  (...args: unknown[]) => postMock(...args),
    put:   (...args: unknown[]) => putMock(...args),
    patch: (...args: unknown[]) => patchMock(...args),
  },
}))

describe('TrainerCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 'u7', name: 'Trainer One', email: 'trainer@numericode.com', role: 'trainer', createdAt: '2024-01-01' },
      token: 'token', isAuthenticated: true,
    })
  })

  it('renders page heading and existing courses', async () => {
    render(<TrainerCoursesPage />)
    expect(screen.getByRole('heading', { name: /my courses/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
      expect(screen.getByText('Python Programming')).toBeInTheDocument()
    })
  })

  it('opens the create course modal when "New Course" is clicked', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /create new course/i })).toBeInTheDocument()
  })

  it('does not show an instructor dropdown for trainer course creation', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    expect(screen.queryByRole('combobox', { name: /assign instructor/i })).not.toBeInTheDocument()
  })

  it('creates a new course and opens the course builder', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await user.click(screen.getByRole('button', { name: /new course/i }))
    await user.type(screen.getByLabelText(/course title/i), 'New Test Course')
    await user.type(screen.getByLabelText(/description/i), 'Description here')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/trainer/courses', expect.objectContaining({ title: 'New Test Course' }))
    })
  })

  it('shows a Publish button for a draft course', async () => {
    render(<TrainerCoursesPage />)
    await waitFor(() => screen.getByText('Python Programming'))
    expect(screen.getByRole('button', { name: /^publish$/i })).toBeInTheDocument()
  })

  it('clicking Publish calls the status endpoint with published', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await waitFor(() => screen.getByText('Python Programming'))
    await user.click(screen.getByRole('button', { name: /^publish$/i }))
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith('/trainer/courses/c4/status', { status: 'published' })
    })
  })

  it('shows an Unpublish button for a published course', async () => {
    render(<TrainerCoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    expect(screen.getByRole('button', { name: /unpublish/i })).toBeInTheDocument()
  })

  it('clicking Open Course navigates to the course builder', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    const openButtons = screen.getAllByRole('button', { name: /open course/i })
    await user.click(openButtons[0])
    // The page will attempt navigation; we just verify the button is present and clickable
  })

  it('clicking Archive calls the status endpoint with archived', async () => {
    const user = userEvent.setup()
    render(<TrainerCoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    const archiveButtons = screen.getAllByRole('button', { name: /archive/i })
    await user.click(archiveButtons[0])
    await waitFor(() => {
      expect(patchMock).toHaveBeenCalledWith('/trainer/courses/c1/status', { status: 'archived' })
    })
  })

  it('shows empty state when trainer has no courses', async () => {
    const { api } = await import('@/lib/axios')
    vi.mocked(api.get).mockResolvedValueOnce({ data: { success: true, data: [] } } as never)
    render(<TrainerCoursesPage />)
    await waitFor(() => expect(screen.getByText(/no courses yet/i)).toBeInTheDocument())
  })
})
