import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CourseViewerPage from '@/pages/dashboard/CourseViewerPage'
import { dashboardService } from '@/services/dashboard.service'
import { paymentsService } from '@/services/payments.service'

const fullCourse = {
  id: 'c1',
  title: 'Foundation Mathematics',
  description: 'A maths course.',
  content: '# Course content',
  subject: 'mathematics',
  level: 'beginner',
  lessonCount: 2,
  accessLevel: 'free',
  priceCents: 0,
  currency: 'NGN',
  premiumEnabled: true,
  outcomes: [],
  createdAt: '2024-01-10',
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '', credentials: [] },
  liveClasses: [],
  progress: 50,
  enrolledAt: '2024-02-01',
  modules: [
    { id: 'm1', title: 'Numbers', lessons: [
      { id: 'l1', title: 'Intro', content: '## Notes\nLearn numbers.', duration: 20, isCompleted: true, resources: [] },
      { id: 'l2', title: 'Addition', content: '## Practice\nAdd up.', duration: 25, isCompleted: false, resources: [] },
    ]},
  ],
}

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getCourse: vi.fn(),
    getBoard: vi.fn().mockResolvedValue(null),
    saveBoard: vi.fn().mockResolvedValue({}),
    completeLesson: vi.fn().mockResolvedValue({ data: { success: true, data: { lessonId: 'x', completed: true } } }),
    removeCourse: vi.fn().mockResolvedValue({ removed: true, courseId: 'c1', message: 'Course removed' }),
  },
}))

vi.mock('@/services/payments.service', () => ({
  paymentsService: {
    initiate: vi.fn().mockResolvedValue({
      reference: 'ref-123',
      authorizationUrl: 'https://paystack.test/checkout/ref-123',
      amountSubunits: 50000,
      currency: 'NGN',
      courseTitle: 'Premium Course',
    }),
  },
}))

vi.mock('@/services/quizzes.service', () => ({
  quizzesService: { listByLesson: vi.fn().mockResolvedValue([]) },
}))

vi.mock('@/lib/axios', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }), put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }) },
}))

// isAxiosError is imported by CourseViewerPage to detect 403 premium-lock errors.
// Mock the axios package so the premium-locked 403 path can be exercised in tests.
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    ...actual,
    isAxiosError: (e: unknown): e is { response?: { status?: number; data?: { message?: string } } } => {
      if (!(e instanceof Error)) return false
      const ae = e as { __isAxiosError?: boolean; response?: { status?: number; data?: { message?: string } } }
      return !!ae.__isAxiosError
    },
  }
})

vi.mock('@/components/shared/LearningBoard', () => ({ LearningBoard: () => null }))
vi.mock('@/components/shared/CollaborativeCodeEditor', () => ({ CollaborativeCodeEditor: () => null }))

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

function renderPage(route = '/dashboard/courses/c1') {
  // Fresh client per render so a previous test's cached course (e.g. one with
  // incomplete lessons) can never leak into the next test's initial render.
  const queryClient = makeQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/dashboard/courses/:id" element={<CourseViewerPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseViewerPage repro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dashboardService.getCourse).mockResolvedValue(fullCourse)
  })

  it('renders lesson notes and progress without crashing', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Foundation Mathematics/)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Intro/ })).toBeInTheDocument()
    })
  })

  it('handles ?lesson= deep link without crashing', async () => {
    renderPage('/dashboard/courses/c1?lesson=l2')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Addition/ })).toBeInTheDocument()
    })
  })

  it('does not crash when a course has NO lessons', async () => {
    vi.mocked(dashboardService.getCourse).mockResolvedValue({ ...fullCourse, modules: [] })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Foundation Mathematics/)).toBeInTheDocument()
    })
  })

  it('does not crash when the API returns modules: null (legacy/older backend)', async () => {
    // Regression: the sidebar rendered `course.modules.map(...)` directly, which
    // threw on `null` and (with no boundary) produced a black page; with the
    // layout boundary it surfaced as "This page couldn't load."
    vi.mocked(dashboardService.getCourse).mockResolvedValue({ ...fullCourse, modules: null as unknown as typeof fullCourse.modules })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Foundation Mathematics/)).toBeInTheDocument()
      expect(screen.getByText(/No lessons yet/i)).toBeInTheDocument()
    })
  })

  it('does not crash when a module has no lessons array', async () => {
    vi.mocked(dashboardService.getCourse).mockResolvedValue({
      ...fullCourse,
      modules: [{ id: 'm1', title: 'Numbers', lessons: null }] as unknown as typeof fullCourse.modules,
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Foundation Mathematics/)).toBeInTheDocument()
      expect(screen.getByText(/No lessons yet/i)).toBeInTheDocument()
    })
  })

  it('shows a clear error state (not an infinite spinner) when the course fetch fails', async () => {
  // Regression: a 404/500 from getCourse left the page stuck on skeletons
  // forever with no message — surfacing as "the course won't load".
  vi.mocked(dashboardService.getCourse).mockRejectedValue(new Error('Enrolled course not found'))
  renderPage()
  await waitFor(() => {
      expect(screen.getByText(/Can't open this course/i)).toBeInTheDocument()
      expect(screen.getByText(/Enrolled course not found/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument()
  })
  })

  it('shows a course-complete celebration when all lessons are done', async () => {
    // Phase 19: progress === 100 with lessons present should show a
    // "🎉 Course Complete!" state instead of continuing to the lesson view.
    vi.mocked(dashboardService.getCourse).mockResolvedValue({
      ...fullCourse,
      progress: 100,
      modules: [{
        id: 'm1', title: 'Numbers', lessons: [
          { id: 'l1', title: 'Intro', content: '', duration: 20, isCompleted: true, resources: [] },
          { id: 'l2', title: 'Addition', content: '', duration: 25, isCompleted: true, resources: [] },
        ],
      }],
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/🎉 Course Complete/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Back to My Courses/i })).toBeInTheDocument()
    // The lesson content should NOT be rendered in the completion state
    expect(screen.queryByText(/Lesson 1 of/i)).not.toBeInTheDocument()
  })

  it('progress increases as the student goes over the course (auto-completes the viewed lesson)', async () => {
    // Deep-link straight to the INCOMPLETE lesson l2: opening it must record a
    // completion via the existing idempotent endpoint so the overall progress
    // bar advances server-side while the student studies.
    renderPage('/dashboard/courses/c1?lesson=l2')
    await waitFor(() => {
      expect(dashboardService.completeLesson).toHaveBeenCalledWith('l2')
    })
    // Only the viewed (incomplete) lesson is submitted — never already-done ones.
    expect(dashboardService.completeLesson).not.toHaveBeenCalledWith('l1')
  })

  it('never re-submits already-completed lessons when going over the course', async () => {
    // All lessons done → viewing the course must not submit anything.
    vi.mocked(dashboardService.getCourse).mockResolvedValue({
      ...fullCourse,
      progress: 100,
      modules: [{
        id: 'm1', title: 'Numbers', lessons: [
          { id: 'l1', title: 'Intro', content: '', duration: 20, isCompleted: true, resources: [] },
          { id: 'l2', title: 'Addition', content: '', duration: 25, isCompleted: true, resources: [] },
        ],
      }],
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/🎉 Course Complete/i)).toBeInTheDocument()
    })
    expect(dashboardService.completeLesson).not.toHaveBeenCalled()
  })

  it('does NOT auto-complete lessons while a prerequisite-quiz gate locks the course', async () => {
    vi.mocked(dashboardService.getCourse).mockResolvedValue({
      ...fullCourse,
      prerequisiteQuiz: {
        id: 'q-gate',
        title: 'Placement quiz',
        isPrerequisiteQuizPassed: false,
      },
    } as unknown as typeof fullCourse)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Placement quiz/i)).toBeInTheDocument()
    })
        expect(dashboardService.completeLesson).not.toHaveBeenCalled()
  })

  it('shows a Payment Required state (not a dead-end) when a premium course returns 403', async () => {
    // Regression: an enrolled-but-unpaid premium student opened the course
    // viewer and got a generic "Can't open this course" screen with only "Try
    // again" — a dead-end with no way to pay. Now the 403 must surface a
    // dedicated Payment Required state with Complete Payment + Remove Course.
    const premiumError = Object.assign(
      new Error('Premium access for this course is not active'),
      { __isAxiosError: true, response: { status: 403, data: { message: 'Premium access for this course is not active' } } },
    )
    vi.mocked(dashboardService.getCourse).mockRejectedValue(premiumError as never)
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Payment Required')).toBeInTheDocument()
    })
    expect(screen.getByText(/Complete Payment/i)).toBeInTheDocument()
    expect(screen.getByText(/Back to My Courses/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove Course/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Try again/i })).not.toBeInTheDocument()
  })

  it('starts Paystack checkout when Complete Payment is clicked (no frontend success decision)', async () => {
        const user = userEvent.setup()
    const premiumError = Object.assign(
      new Error('Premium access for this course is not active'),
      { __isAxiosError: true, response: { status: 403, data: { message: 'Premium access for this course is not active' } } },
    )
    vi.mocked(dashboardService.getCourse).mockRejectedValue(premiumError as never)
            vi.mocked(paymentsService.initiate).mockClear()
    const assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { assign: assignMock, href: 'http://localhost/dashboard/courses', origin: 'http://localhost' },
      writable: true,
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Payment Required')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /Complete Payment/i }))
    await waitFor(() => {
      expect(paymentsService.initiate).toHaveBeenCalledWith('c1')
    })
    expect(assignMock).toHaveBeenCalledWith('https://paystack.test/checkout/ref-123')
  })
})
