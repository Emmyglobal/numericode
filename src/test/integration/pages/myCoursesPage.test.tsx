import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MyCoursesPage from '@/pages/dashboard/MyCoursesPage'
import { dashboardService } from '@/services/dashboard.service'
import { coursesService } from '@/services/courses.service'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getMyCourses: vi.fn(),
    removeCourse: vi.fn(),
  },
}))

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getAvailableTeachers: vi.fn(),
    getAvailableForEnrollment: vi.fn(),
  },
}))

function makeQueryClient() {
  return new QueryClient()
}

function renderPage() {
  const queryClient = makeQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard/courses']}>
        <MyCoursesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// Flat summary returned by the real GET /dashboard/courses endpoint — no
// `modules`/`lessons` nested data (only `GET /dashboard/courses/:id` returns those).
const flatCourse = {
  id: 'c1',
  title: 'Foundation Mathematics',
  description: 'A maths course.',
  subject: 'mathematics',
  level: 'beginner',
  lessonCount: 2,
  accessLevel: 'free',
  priceCents: 0,
  currency: 'NGN',
  premiumEnabled: false,
  outcomes: [],
  createdAt: '2024-01-10',
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '', credentials: [] },
  liveClasses: [],
  progress: 42,
  enrolledAt: '2024-02-01',
  // `modules` intentionally omitted — mirrors the real list endpoint shape.
}

describe('MyCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([{ ...flatCourse }])
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([])
    vi.mocked(coursesService.getAvailableForEnrollment).mockResolvedValue([])
    vi.mocked(dashboardService.removeCourse).mockResolvedValue({ removed: true, courseId: 'c1', message: 'Course removed from your courses' })
  })

  it('renders the enrolled course list when the API omits modules (regression for "my course won\'t load")', async () => {
    // Regression: getMyCourses returns flat summaries (no `modules`). The page
    // previously did `activeCourse?.modules.flatMap(...)` which threw
    // "Cannot read properties of undefined (reading 'flatMap')" and crashed
    // the whole page via the layout error boundary.
        renderPage()
    await waitFor(() => {
      // The "Continue Learning" hero renders from the flat summary (no modules),
      // proving the old `activeCourse?.modules.flatMap(...)` crash is gone.
      expect(screen.getByText(/Continue Learning/)).toBeInTheDocument()
    })
    expect(screen.getByText(/Course progress/)).toBeInTheDocument()
    expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
    expect(screen.getByText(/0 lessons/)).toBeInTheDocument()
  })

  it('renders an empty state when no courses are enrolled', async () => {
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/No courses yet/i)).toBeInTheDocument()
    })
  })
it('Confirm removes the course, refetches My Courses and clears the Continue Learning hero', async () => {
    const user = userEvent.setup()
    // Initial list → one course; after invalidation every refetch → empty.
    // mockReset clears the beforeEach default so a double-mount cannot consume
    // the queue and fall back to the stale [course] default.
    vi.mocked(dashboardService.getMyCourses).mockReset()
    vi.mocked(dashboardService.getMyCourses).mockResolvedValueOnce([{ ...flatCourse }])
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([])
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/Continue Learning/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove course/i }))
    const confirm = screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0]
    await user.click(confirm)

    await waitFor(() => expect(dashboardService.removeCourse).toHaveBeenCalledWith('c1'))
    // My Courses list is refetched and the course is gone…
    await waitFor(() => {
      expect(screen.queryAllByText('Foundation Mathematics')).toHaveLength(0)
    })
    // …and the stale Continue Learning hero is gone too.
    expect(screen.queryByText(/Continue Learning/)).not.toBeInTheDocument()
    expect(screen.getByText(/No courses yet/i)).toBeInTheDocument()
    // The removed course becomes available to enrol in again (at least one
    // refetch after the invalidation; StrictMode may add an extra mount fetch).
    expect(vi.mocked(dashboardService.getMyCourses).mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('Cancel keeps the enrollment and never calls the remove API', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
    })
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(dashboardService.removeCourse).not.toHaveBeenCalled()
    expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
  })

  it('a server rejection (purchased-course policy) is displayed and the course stays', async () => {
    const user = userEvent.setup()
    vi.mocked(dashboardService.removeCourse).mockRejectedValue(
      new Error('You purchased this course, so it cannot be removed from here.'),
    )
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
    })
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    await user.click(screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0])
    await waitFor(() => {
      expect(screen.getByText(/You purchased this course/)).toBeInTheDocument()
    })
    expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
  })

  it('a premium unpaid registration can be removed (Remove button shown when not purchased)', async () => {
    const user = userEvent.setup()
    const premiumUnpaid = {
      ...flatCourse,
      accessLevel: 'premium',
      priceCents: 50000,
      premiumEnabled: true,
      // `purchased` intentionally absent — no verified payment exists.
    }
    vi.mocked(dashboardService.getMyCourses).mockReset()
    vi.mocked(dashboardService.getMyCourses).mockResolvedValueOnce([{ ...premiumUnpaid }])
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([])
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Foundation Mathematics').length).toBeGreaterThan(0)
    })
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    await user.click(screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0])
    await waitFor(() => {
      expect(screen.getByText(/No courses yet/i)).toBeInTheDocument()
    })
    expect(dashboardService.removeCourse).toHaveBeenCalledWith('c1')
  })

  it('a purchased course shows the policy note instead of the Remove action', async () => {
    const purchased = { ...flatCourse, accessLevel: 'premium', purchased: true }
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([{ ...purchased }])
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/removal subject to purchase\/refund policy/i)).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /remove course/i })).not.toBeInTheDocument()
  })
})
