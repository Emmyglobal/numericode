import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import QuizzesPage from '@/pages/dashboard/QuizzesPage'
import GradesPage from '@/pages/dashboard/GradesPage'

// Requirement under test: the Grade Book must appear on the quizzes screen AND
// the grades screen (not only Assignments). The component itself has dedicated
// unit tests, so here it is stubbed to assert pure page-level wiring.
vi.mock('@/features/assignments/components/GradeBook', () => ({
  GradeBook: () => (
    <div data-testid="gradebook-wired">Grade Book wired into this screen</div>
  ),
}))

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getMyCourses: vi.fn().mockResolvedValue([
      {
        id: 'c1', title: 'Foundation Mathematics', description: '', subject: 'mathematics',
        level: 'beginner', lessonCount: 2, accessLevel: 'free', priceCents: 0,
        currency: 'NGN', progress: 40, enrolledAt: '2024-02-01',
        instructor: { id: 'i1', name: 'Trainer One', bio: '', credentials: [] },
        createdAt: '2024-01-10',
      },
    ]),
  },
}))

vi.mock('@/services/quizzes.service', () => ({
  quizzesService: { listByCourse: vi.fn().mockResolvedValue([]) },
}))

vi.mock('@/services/grading.service', () => ({
  gradingService: { getStudentGradeReport: vi.fn().mockResolvedValue(
    // Realistic report: no configured grade categories, but the student has
    // taken quizzes — the fallback path that shows quiz/assignment averages.
    { courseId: 'c1', categories: [], overallGrade: 80, letterGrade: 'B', quizAverage: 80, assignmentAverage: null },
  ) },
}))

function setStudent() {
  useAuthStore.setState({
    user: { id: 'u2', name: 'Kolade', email: 'kolade@gmail.com', role: 'student', createdAt: '2024-01-01' },
    token: 'token', isAuthenticated: true,
  })
}

describe('QuizzesPage — Grade Book visible', () => {
  beforeEach(setStudent)

  it('renders the "Grade Book" section heading alongside quizzes', async () => {
    render(<QuizzesPage />)
    const heading = await screen.findByRole('heading', { name: /grade book/i })
    expect(heading).toBeInTheDocument()
    // …and the GradeBook component itself is mounted directly beneath it
    expect(screen.getByTestId('gradebook-wired')).toBeInTheDocument()
  })

  it('keeps the Grade Book visible even when no quizzes exist yet', async () => {
    render(<QuizzesPage />)
    await waitFor(() => {
      expect(screen.getByText(/no quizzes yet/i)).toBeInTheDocument()
      expect(screen.getByTestId('gradebook-wired')).toBeInTheDocument()
    })
  })
})

describe('GradesPage — Grade Book visible', () => {
  beforeEach(setStudent)

  it('renders the "Grade Book" section heading alongside course grades', async () => {
    render(<GradesPage />)
    const heading = await screen.findByRole('heading', { name: /grade book/i })
    expect(heading).toBeInTheDocument()
    expect(screen.getByTestId('gradebook-wired')).toBeInTheDocument()
  })

  it('shows quiz-average performance (from taken quizzes) in the course grade breakdown', async () => {
    render(<GradesPage />)
    // Fallback breakdown surfaces the quiz average that feeds the overall grade.
    expect(await screen.findByText(/Quiz Average/i)).toBeInTheDocument()
    // 80.0% appears both as the overall grade AND the quiz average — expect >=1.
    expect(screen.getAllByText('80.0%').length).toBeGreaterThan(0)
    // Assignment average is null (no graded assignments) → shows an em dash.
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
