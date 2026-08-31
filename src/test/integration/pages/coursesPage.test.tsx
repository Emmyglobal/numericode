import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import CoursesPage from '@/pages/public/CoursesPage'
import { coursesService, type AvailableTeacher, type CourseListResponse } from '@/services/courses.service'

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getAllPaginated: vi.fn(),
    getAvailableTeachers: vi.fn(),
  },
}))

const trainer: AvailableTeacher = {
  id: 'i1',
  name: 'Emmanuel Nwafor',
  bio: '',
  avatarUrl: undefined,
  subjects: ['mathematics'],
}

interface MockCourse {
  id: string
  title: string
  description: string
  subject: string
  level: string
  lessonCount: number
  outcomes: string[]
  thumbnailUrl: string | null
  accessLevel: string
  priceCents: number | null
  currency: string | null
  premiumEnabled: boolean
  createdAt: string
  instructor: { id: string; name: string; bio: string; avatarUrl: string | null }
}

function makeCourse(index: number, overrides: Partial<MockCourse> = {}): MockCourse {
  return {
    id: `c${index}`,
    title: `Course ${index}`,
    description: `Description for course ${index}`,
    subject: index % 2 === 0 ? 'programming' : 'mathematics',
    level: index % 3 === 0 ? 'beginner' : index % 3 === 1 ? 'intermediate' : 'advanced',
    lessonCount: 10 + index,
    outcomes: [],
    thumbnailUrl: null,
    accessLevel: 'free',
    priceCents: null,
    currency: null,
    premiumEnabled: false,
    createdAt: '2024-01-01',
    instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '', avatarUrl: null },
    ...overrides,
  }
}

// 14 courses → 2 pages at the default page size of 12
const allCourses: MockCourse[] = Array.from({ length: 14 }, (_, i) => makeCourse(i + 1))

function paginate(list: MockCourse[], limit: number, offset: number) {
  const pageItems = list.slice(offset, offset + limit)
  return {
    data: pageItems,
    pagination: {
      total: list.length,
      limit,
      offset,
      count: pageItems.length,
      hasMore: offset + limit < list.length,
    },
  }
}

function lastCallParams() {
  const calls = vi.mocked(coursesService.getAllPaginated).mock.calls
  return calls[calls.length - 1][0]
}

beforeEach(() => {
  vi.clearAllMocks()
  window.scrollTo = vi.fn()
  vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([trainer])
  vi.mocked(coursesService.getAllPaginated).mockImplementation(async (params = {}) => {
    let results = allCourses
    if (params.subject) results = results.filter(c => c.subject === params.subject)
    if (params.level) results = results.filter(c => c.level === params.level)
    if (params.accessLevel) results = results.filter(c => c.accessLevel === params.accessLevel)
    if (params.instructorId) results = results.filter(c => c.instructor.id === params.instructorId)
    if (params.q) results = results.filter(c => c.title.toLowerCase().includes(params.q!.toLowerCase()))
    return paginate(results, params.limit ?? 12, params.offset ?? 0) as CourseListResponse
  })
})

describe('CoursesPage', () => {
  it('renders the Explore Courses page heading', async () => {
    render(<CoursesPage />)
    expect(screen.getByRole('heading', { level: 1, name: /explore courses/i })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
  })

  it('shows skeleton loaders while fetching', () => {
    render(<CoursesPage />)
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('renders course cards from the paginated API after loading', async () => {
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    // Page size is 12 → first page shows 12 of the 14 courses
    expect(screen.getByText('Course 12')).toBeInTheDocument()
    expect(screen.queryByText('Course 13')).not.toBeInTheDocument()
  })

  it('displays the backend pagination total, not the rendered count', async () => {
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText(/14 courses/i)).toBeInTheDocument())
  })

  it('shows the full Registered Trainer name on cards', async () => {
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getAllByText('Emmanuel Nwafor').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Registered Trainer').length).toBeGreaterThan(0)
  })

  it('searches through the backend with the q parameter', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.type(screen.getByLabelText(/search courses by name or topic/i), 'Course 13')
    await waitFor(
      () => expect(lastCallParams()?.q).toBe('Course 13'),
      { timeout: 3000 },
    )
  })

  it('filters by subject via the API', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /show mathematics courses/i }))
    await waitFor(() => expect(lastCallParams()?.subject).toBe('mathematics'))
  })

  it('filters by level via the API', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Level'), 'beginner')
    await waitFor(() => expect(lastCallParams()?.level).toBe('beginner'))
  })

  it('filters by access level via the API', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Access'), 'premium')
    await waitFor(() => expect(lastCallParams()?.accessLevel).toBe('premium'))
  })

  it('filters by Registered Trainer via the API', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText(/filter by registered trainer/i), 'i1')
    await waitFor(() => expect(lastCallParams()?.instructorId).toBe('i1'))
  })

  it('restores the trainer filter from the URL and labels the active chip', async () => {
    render(<CoursesPage />, { routerProps: { initialEntries: ['/courses?instructorId=i1'] } })
    await waitFor(() => expect(screen.getByText('Registered Trainer: Emmanuel Nwafor')).toBeInTheDocument())
    expect(lastCallParams()?.instructorId).toBe('i1')
    expect(screen.getByRole('button', { name: /remove Registered Trainer: Emmanuel Nwafor filter/i })).toBeInTheDocument()
  })

  it('clears the trainer filter from the active chip and refetches unfiltered', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />, { routerProps: { initialEntries: ['/courses?instructorId=i1'] } })
    await waitFor(() => expect(screen.getByText('Registered Trainer: Emmanuel Nwafor')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /remove Registered Trainer: Emmanuel Nwafor filter/i }))
    await waitFor(() => expect(lastCallParams()?.instructorId).toBeUndefined())
    expect(screen.queryByText('Registered Trainer: Emmanuel Nwafor')).not.toBeInTheDocument()
  })

  it('combines the trainer filter with subject, level and access server-side', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />, { routerProps: { initialEntries: ['/courses?instructorId=i1'] } })
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText('Level'), 'beginner')
    await user.selectOptions(screen.getByLabelText('Access'), 'premium')
    await user.click(screen.getByRole('button', { name: /show mathematics courses/i }))
    await waitFor(() => {
      const params = lastCallParams()
      expect(params?.instructorId).toBe('i1')
      expect(params?.subject).toBe('mathematics')
      expect(params?.level).toBe('beginner')
      expect(params?.accessLevel).toBe('premium')
    })
  })

  it('resets to page 1 when the trainer filter changes', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() => expect(lastCallParams()?.offset).toBe(12))
    await user.selectOptions(screen.getByLabelText(/filter by registered trainer/i), 'i1')
    await waitFor(() => expect(lastCallParams()?.instructorId).toBe('i1'))
    expect(lastCallParams()?.offset).toBe(0)
  })

  it('sorts through the API', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.selectOptions(screen.getByLabelText(/sort by/i), 'title')
    await waitFor(() => expect(lastCallParams()?.sort).toBe('title'))
  })

  it('requests limit 12 with page-derived offset', async () => {
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    expect(lastCallParams()?.limit).toBe(12)
    expect(lastCallParams()?.offset).toBe(0)
  })

  it('paginates to page 2 with offset 12 and marks it aria-current', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() => expect(lastCallParams()?.offset).toBe(12))
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    await waitFor(() => expect(screen.getByText('Course 13')).toBeInTheDocument())
  })

  it('disables Previous on the first page', async () => {
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled()
  })

  it('resets to page 1 when a filter changes', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /next page/i }))
    await waitFor(() => expect(lastCallParams()?.offset).toBe(12))
    await user.selectOptions(screen.getByLabelText('Level'), 'beginner')
    await waitFor(() => expect(lastCallParams()?.level).toBe('beginner'))
    expect(lastCallParams()?.offset).toBe(0)
  })

  it('restores filter state from the URL on load', async () => {
    render(<CoursesPage />, { routerProps: { initialEntries: ['/courses?subject=programming&sort=title&page=1'] } })
    await waitFor(() => {
      const params = lastCallParams()
      expect(params?.subject).toBe('programming')
      expect(params?.sort).toBe('title')
    })
  })

  it('shows removable active filter chips', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /show mathematics courses/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /remove mathematics filter/i })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /remove mathematics filter/i }))
    await waitFor(() => expect(lastCallParams()?.subject).toBeUndefined())
  })

  it('shows an empty state with clear filters when nothing matches', async () => {
    const user = userEvent.setup()
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    await user.type(screen.getByLabelText(/search courses/i), 'xyznotexist')
    await waitFor(() => expect(screen.getByText(/no courses found/i)).toBeInTheDocument(), { timeout: 3000 })
    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
  })

  it('shows an error state with retry when the API fails', async () => {
    vi.mocked(coursesService.getAllPaginated).mockRejectedValueOnce(new Error('Network down'))
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText(/unable to load courses/i)).toBeInTheDocument())
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
  })

  it('remains usable when the Registered Trainer endpoint fails', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockRejectedValue(new Error('Trainers unavailable'))
    render(<CoursesPage />)
    await waitFor(() => expect(screen.getByText('Course 1')).toBeInTheDocument())
    // Courses still render and the catalogue error state is not triggered
    expect(screen.queryByText(/unable to load courses/i)).not.toBeInTheDocument()
  })
})
