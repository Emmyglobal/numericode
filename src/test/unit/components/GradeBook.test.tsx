import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GradeBook, type GradeEntry } from '@/features/assignments/components/GradeBook'
import { dashboardService } from '@/services/dashboard.service'

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getGradeBook: vi.fn(),
  },
}))

const entries: GradeEntry[] = [
  {
    courseId: 'c1',
    courseTitle: 'Foundation Mathematics',
    completed: true,
    finalPercentage: 92,
    letterGrade: 'A',
    quizzes: [
      { quizId: 'q1', title: 'Numbers & Arithmetic Quiz', score: 85, passed: true, attemptCount: 2, passingScore: 60 },
      { quizId: 'q2', title: 'Fractions & Decimals Quiz', score: null, passed: false, attemptCount: 0, passingScore: 70 },
    ],
    assignments: [
      { assignmentId: 'a1', title: 'Fractions Worksheet', status: 'graded', score: 18, totalMarks: 20, percentage: 90, submitted: true, written: true },
      { assignmentId: 'a3', title: 'Number Patterns Quiz', status: 'pending', score: null, totalMarks: 100, percentage: null, submitted: false, written: false },
    ],
  },
]

function renderGradeBook() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <GradeBook />
    </QueryClientProvider>,
  )
}

describe('GradeBook — itemised scores on the student grade screen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dashboardService.getGradeBook).mockResolvedValue(entries)
  })

  it('shows EVERY written quiz score with its best attempt and pass state', async () => {
    renderGradeBook()

    // Written quiz — best attempt percentage + attempt count + pass tick
    expect(await screen.findByText(/Numbers & Arithmetic Quiz/)).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText(/\(2 attempts\)/)).toBeInTheDocument()

    // Unwritten quiz is still listed, explicitly marked as not taken
    expect(screen.getByText(/Fractions & Decimals Quiz/)).toBeInTheDocument()
    expect(screen.getByText('Not taken')).toBeInTheDocument()
  })

  it('shows EVERY assignment score out of its total marks', async () => {
    renderGradeBook()

    // Graded assignment — raw marks and percentage
    expect(await screen.findByText(/Fractions Worksheet · Graded/)).toBeInTheDocument()
    expect(screen.getByText('18/20 (90%)')).toBeInTheDocument()

    // Unsubmitted assignment still listed
    expect(screen.getByText(/Number Patterns Quiz · Pending/)).toBeInTheDocument()
    expect(screen.getByText('Not submitted')).toBeInTheDocument()
  })

  it('keeps the course-level summary alongside the breakdown', async () => {
    renderGradeBook()
    expect(await screen.findByText('92% (A)')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })
})
