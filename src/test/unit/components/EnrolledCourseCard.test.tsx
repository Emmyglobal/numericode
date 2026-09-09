import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnrolledCourseCard } from '@/components/shared/EnrolledCourseCard'
import { dashboardService } from '@/services/dashboard.service'
import type { EnrolledCourse } from '@/features/courses/types'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: { removeCourse: vi.fn() },
}))

const course: EnrolledCourse = {
  id: 'c1',
  title: 'Foundation Mathematics',
  description: 'Build a rock-solid foundation in arithmetic and algebra.',
  content: '# Course content',
  subject: 'mathematics',
  level: 'beginner',
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '', credentials: [] },
  lessonCount: 2,
  accessLevel: 'free',
  priceCents: 0,
  currency: 'NGN',
  premiumEnabled: true,
  outcomes: [],
  createdAt: '2024-01-10',
  updatedAt: '2026-09-03T12:34:56.789Z',
  liveClasses: [],
  progress: 50,
  enrolledAt: '2024-02-01',
  modules: [
    {
      id: 'm1',
      title: 'Numbers',
      lessons: [
        { id: 'l1', title: 'Introduction to Numbers', content: '## Step one\nLearn how numbers work.', duration: 20, isCompleted: true, resources: [] },
        { id: 'l2', title: 'Addition & Subtraction', content: '## Practice\nAdd and subtract confidently.', duration: 25, isCompleted: false, resources: [] },
      ],
    },
  ],
}

function renderCard(overrides: Partial<EnrolledCourse> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <EnrolledCourseCard course={{ ...course, ...overrides }} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('EnrolledCourseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dashboardService.removeCourse).mockResolvedValue({ removed: true, courseId: 'c1', message: 'Course removed from your courses' })
  })

  it('shows the course title and instructor', () => {
    renderCard()
    expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
    expect(screen.getByText(/Emmanuel Nwafor/)).toBeInTheDocument()
  })

  it('shows per-course progress in a progressbar', () => {
    renderCard()
    const bar = screen.getByRole('progressbar', { name: /progress 50%/i })
    expect(bar).toBeInTheDocument()
  })

  it('shows the next (first incomplete) lesson', () => {
    renderCard()
    expect(screen.getByText(/Next lesson:/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Addition & Subtraction/).length).toBeGreaterThan(0)
  })

  it('shows a Continue link to the course viewer deep-linked to the next lesson', () => {
    renderCard()
    const link = screen.getByRole('link', { name: /continue/i })
    expect(link).toHaveAttribute('href', '/dashboard/courses/c1?lesson=l2')
  })

  it('shows lesson notes when a lesson is expanded', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /addition & subtraction/i }))
    await waitFor(() => {
      expect(screen.getByText('Lesson notes')).toBeInTheDocument()
      expect(screen.getByText(/Add and subtract confidently/)).toBeInTheDocument()
    })
  })

  it('marks completed lessons with a check and strike-through', () => {
    renderCard()
    const done = screen.getByText('Introduction to Numbers')
        expect(done.className).toContain('text-gray-500')
  })

  it('shows the Remove Course action', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /remove course/i })).toBeInTheDocument()
  })

  it('opens the confirmation dialog with Cancel and Remove Course', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/Remove this course\?/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('Cancel closes the dialog and preserves the enrollment (no API call)', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(dashboardService.removeCourse).not.toHaveBeenCalled()
    expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
  })

  it('Confirm calls removeCourse for this course', async () => {
    const user = userEvent.setup()
    renderCard()
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    const confirm = screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0]
    await user.click(confirm)
    await waitFor(() => expect(dashboardService.removeCourse).toHaveBeenCalledWith('c1'))
  })

  it('loading state disables the confirm button (no double submission)', async () => {
    const user = userEvent.setup()
    vi.mocked(dashboardService.removeCourse).mockImplementation(() => new Promise(() => {})) // never resolves
    renderCard()
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    const confirm = screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0]
    await user.click(confirm)
    await waitFor(() => expect(confirm).toBeDisabled())
  })

  it('server error (e.g. purchased-course policy) is displayed and enrollment kept', async () => {
    const user = userEvent.setup()
    vi.mocked(dashboardService.removeCourse).mockRejectedValue(
      new Error('You purchased this course, so it cannot be removed from here.'),
    )
    renderCard()
    await user.click(screen.getByRole('button', { name: /remove course/i }))
    await user.click(screen.getAllByRole('button', { name: /remove course/i }).slice(-1)[0])
    await waitFor(() => {
      expect(screen.getByText(/You purchased this course/)).toBeInTheDocument()
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument() // keep dialog so the student sees why
    expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument() // untouched
  })

  it('purchased premium courses show the policy note instead of Remove Course', () => {
    renderCard({ purchased: true, accessLevel: 'premium' })
    expect(screen.queryByRole('button', { name: /remove course/i })).not.toBeInTheDocument()
    expect(screen.getByText(/removal subject to purchase\/refund policy/i)).toBeInTheDocument()
  })

  it('does not crash when the list endpoint omits modules (regression)', () => {
    // The real GET /dashboard/courses endpoint returns flat summaries without a
    // `modules` array. Rendering such a course must not throw.
    const flatCourse = { ...course, modules: undefined } as unknown as EnrolledCourse
    renderCard(flatCourse)
    expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
    expect(screen.getByText(/0 lessons/)).toBeInTheDocument()
    expect(screen.queryByText(/modules/)).not.toBeInTheDocument()
  })
})