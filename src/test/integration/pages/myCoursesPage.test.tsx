import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MyCoursesPage from '@/pages/dashboard/MyCoursesPage'
import { dashboardService } from '@/services/dashboard.service'
import { coursesService } from '@/services/courses.service'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getMyCourses: vi.fn(),
  },
}))

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getAvailableTeachers: vi.fn(),
    getAvailableForEnrollment: vi.fn(),
  },
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0, staleTime: 0 },
    mutations: { retry: false },
  },
})

function renderPage() {
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
})
