import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CourseViewerPage from '@/pages/dashboard/CourseViewerPage'
import { dashboardService } from '@/services/dashboard.service'

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
  },
}))

vi.mock('@/services/quizzes.service', () => ({
  quizzesService: { listByLesson: vi.fn().mockResolvedValue([]) },
}))

vi.mock('@/lib/axios', () => ({
  api: { get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }), put: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }) },
}))

vi.mock('@/components/shared/LearningBoard', () => ({ LearningBoard: () => null }))
vi.mock('@/components/shared/CollaborativeCodeEditor', () => ({ CollaborativeCodeEditor: () => null }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0, staleTime: 0 },
    mutations: { retry: false },
  },
})

function renderPage(route = '/dashboard/courses/c1') {
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
})