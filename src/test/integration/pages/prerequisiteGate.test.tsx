import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CourseViewerPage from '@/pages/dashboard/CourseViewerPage'
import { dashboardService } from '@/services/dashboard.service'
import { quizzesService } from '@/services/quizzes.service'
import type { EnrolledCourse } from '@/features/courses/types'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getCourse: vi.fn(),
  },
}))

vi.mock('@/services/quizzes.service', () => ({
  quizzesService: {
    listByLesson: vi.fn().mockResolvedValue([]),
    startAttempt: vi.fn(),
    submitAttempt: vi.fn(),
  },
}))

const gatedCourse = {
  id: 'c-seq',
  title: 'Sequences & Series — SS2 Practice',
  description: 'APs, GPs, sums, means, sigma notation.',
  content: '# Sequences & Series',
  subject: 'mathematics',
  level: 'beginner',
  lessonCount: 2,
  accessLevel: 'free',
  priceCents: 0,
  currency: 'NGN',
  premiumEnabled: false,
  outcomes: [],
  createdAt: '2024-03-05',
  instructor: { id: 'i1', name: 'Mr. Emmanuel Nwafor', bio: '', credentials: [] },
  liveClasses: [],
  progress: 0,
  enrolledAt: '2024-03-05',
  prerequisiteQuiz: {
    id: 'seq-prereq-quiz',
    title: 'Sequences & Series — SS2 Practice Quiz',
    description: 'Twenty questions covering APs, GPs, sums, means, and sigma notation.',
    passingScore: 60,
    isPrerequisiteQuizPassed: false,
  },
  modules: [
    {
      id: 'm-seq1',
      title: 'Introduction to Sequences',
      lessons: [
        { id: 'l-seq1', title: 'What Is a Sequence?', content: '# Notes', duration: 15, isCompleted: false, resources: [] },
        { id: 'l-seq2', title: 'Recognising APs and GPs', content: '', duration: 20, isCompleted: false, resources: [] },
      ],
    },
  ],
} as unknown as EnrolledCourse

function renderViewer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard/courses/c-seq']}>
        <CourseViewerPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CourseViewerPage — prerequisite quiz gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dashboardService.getCourse).mockResolvedValue(gatedCourse)
    vi.mocked(quizzesService.listByLesson).mockResolvedValue([])
  })

  it('shows ONLY the prerequisite quiz (no lessons) while the quiz is unpassed', async () => {
    renderViewer()

    // Gate UI is present
    await waitFor(() => {
      expect(screen.getByText(/prerequisite required/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start prerequisite quiz/i })).toBeInTheDocument()
    })

    // Lesson content must NOT be reachable while gated
    expect(screen.queryByText(/lesson notes/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Lesson list')).not.toBeInTheDocument()
  })

  it('reveals questions on start, grades the attempt, and unlocks on a pass', async () => {
    const user = userEvent.setup()
    const question = {
      id: 'q1',
      questionText: 'Find the 10th term of the AP: 3, 7, 11, 15, …',
      questionType: 'multiple_choice' as const,
      options: [
        { id: 'a', text: '36', isCorrect: false },
        { id: 'b', text: '39', isCorrect: true },
      ],
      points: 5,
      position: 1,
    }
    vi.mocked(quizzesService.startAttempt).mockResolvedValue({
      attemptId: 'att-1', questions: [question], maxAttempts: 99, attemptNumber: 1,
    })
    vi.mocked(quizzesService.submitAttempt).mockResolvedValue({
      attemptId: 'att-1', score: 100, passed: true, totalPoints: 5, earnedPoints: 5, showResults: true, passingScore: 60,
    })

    renderViewer()

    await user.click(await screen.findByRole('button', { name: /start prerequisite quiz/i }))

        // Question appears; pick the correct option (B — 39) by clicking its label
    await waitFor(() => {
      expect(screen.getByText(/Find the 10th term of the AP/i)).toBeInTheDocument()
    })
    const optionB = screen.getByText('39').closest('label')
    expect(optionB).not.toBeNull()
    await user.click(optionB!)
    await user.click(screen.getByRole('button', { name: /submit answers/i }))

    // Pass result is shown…
    expect(await screen.findByText(/prerequisite passed!/i)).toBeInTheDocument()
    // …the attempt was graded server-side…
    expect(vi.mocked(quizzesService.submitAttempt)).toHaveBeenCalledWith('seq-prereq-quiz', { q1: ['b'] })
    // …and the viewer refetched the course to unlock it.
    await waitFor(() => {
      expect(dashboardService.getCourse).toHaveBeenCalledTimes(2)
    })
  })
})
