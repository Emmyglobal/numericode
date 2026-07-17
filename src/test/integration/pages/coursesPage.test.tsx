import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import CoursesPage from '@/pages/public/CoursesPage'

const mockCourses = [
  { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner', description: 'Build your maths foundation.', lessonCount: 24, instructor: { id:'i1', name:'Emmanuel Nwafor', bio:'', credentials:[] }, modules:[], liveClasses:[], outcomes:[], createdAt:'2024-01-10' },
  { id: 'c2', title: 'JavaScript for Beginners', subject: 'programming', level: 'beginner', description: 'Learn JavaScript from scratch.', lessonCount: 30, instructor: { id:'i1', name:'Emmanuel Nwafor', bio:'', credentials:[] }, modules:[], liveClasses:[], outcomes:[], createdAt:'2024-02-01' },
  { id: 'c3', title: 'Algebra & Equations', subject: 'mathematics', level: 'intermediate', description: 'Master algebra.', lessonCount: 28, instructor: { id:'i1', name:'Emmanuel Nwafor', bio:'', credentials:[] }, modules:[], liveClasses:[], outcomes:[], createdAt:'2024-03-05' },
]

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getAll: vi.fn().mockImplementation(async (params?: { subject?: string; q?: string }) => {
      let results = mockCourses
      if (params?.subject) results = results.filter(c => c.subject === params.subject)
      if (params?.q)       results = results.filter(c => c.title.toLowerCase().includes(params.q!.toLowerCase()))
      return results
    }),
  },
}))

describe('CoursesPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the page heading', async () => {
    render(<CoursesPage />)
    expect(screen.getByRole('heading', { name: /all courses/i })).toBeInTheDocument()
  })

  it('shows skeleton loaders while fetching', () => {
    render(<CoursesPage />)
    // Skeletons have role="status"
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('renders course cards after loading', async () => {
    render(<CoursesPage />)
    await waitFor(() => {
      expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
      expect(screen.getByText('JavaScript for Beginners')).toBeInTheDocument()
      expect(screen.getByText('Algebra & Equations')).toBeInTheDocument()
    })
  })

  it('shows correct course count', async () => {
    render(<CoursesPage />)
    await waitFor(() => {
      expect(screen.getByText(/showing 3 courses/i)).toBeInTheDocument()
    })
  })

  it('renders search input with correct aria-label', async () => {
    render(<CoursesPage />)
    expect(screen.getByLabelText(/search courses by name or topic/i)).toBeInTheDocument()
  })

  it('renders subject filter buttons', async () => {
    render(<CoursesPage />)
    expect(screen.getByRole('button', { name: /show all courses/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show mathematics courses/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show programming courses/i })).toBeInTheDocument()
  })

  it('filter buttons have aria-pressed attribute', async () => {
    render(<CoursesPage />)
    const allBtn = screen.getByRole('button', { name: /show all courses/i })
    expect(allBtn).toHaveAttribute('aria-pressed', 'true')
    const mathBtn = screen.getByRole('button', { name: /show mathematics courses/i })
    expect(mathBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking Mathematics filter updates aria-pressed', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    const mathBtn = screen.getByRole('button', { name: /show mathematics courses/i })
    await user.click(mathBtn)
    await waitFor(() => {
      expect(mathBtn).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('shows empty state when no courses match', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    const searchInput = screen.getByLabelText(/search courses/i)
    await user.type(searchInput, 'xyznotexist')
    await waitFor(() => {
      expect(screen.getByText(/no courses found/i)).toBeInTheDocument()
    })
  })

  it('clear filters button resets search in empty state', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => screen.getByText('Foundation Mathematics'))
    await user.type(screen.getByLabelText(/search courses/i), 'xyznotexist')
    await waitFor(() => screen.getByText(/no courses found/i))
    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    await waitFor(() => {
      expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
    })
  })
})
