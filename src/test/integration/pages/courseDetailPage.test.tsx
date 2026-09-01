import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { render } from '@/test/utils'
import CourseDetailPage from '@/pages/public/CourseDetailPage'
import { coursesService } from '@/services/courses.service'
import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/store/authStore'
import type { Course } from '@/features/courses/types'
import type { PublicTrainerProfile } from '@/services/courses.service'

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getById: vi.fn(),
    requestCourse: vi.fn(),
    getTrainerProfile: vi.fn(),
  },
}))

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getMyCourses: vi.fn(),
    getSubscription: vi.fn(),
    createCheckoutIntent: vi.fn(),
  },
}))

const course: Course = {
  id: 'c1',
  title: 'Foundation Mathematics',
  description: 'A structured maths course for beginners.',
  content: '## Overview\n\nLearn numbers and algebra step by step.',
  subject: 'mathematics',
  level: 'beginner',
  lessonCount: 24,
  accessLevel: 'free',
  priceCents: undefined,
  currency: undefined,
  premiumEnabled: false,
  outcomes: ['Master fractions', 'Solve linear equations'],
  createdAt: '2024-01-10',
  thumbnailUrl: undefined,
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: 'Experienced maths trainer.', avatarUrl: undefined, credentials: [] },
  modules: [
    { id: 'm1', title: 'Numbers', lessons: [
      { id: 'l1', title: 'Intro to numbers', content: '', duration: 20, isCompleted: false, resources: [] },
      { id: 'l2', title: 'Addition', content: '', duration: 25, isCompleted: false, resources: [] },
    ]},
    { id: 'm2', title: 'Algebra', lessons: [
      { id: 'l3', title: 'Equations', content: '', duration: 30, isCompleted: false, resources: [] },
    ]},
  ],
  liveClasses: [
    { id: 'lc1', title: 'Live Q&A', date: '2024-03-01T10:00:00Z', duration: 60, meetUrl: '', status: 'upcoming' },
  ],
  prerequisiteQuiz: undefined as undefined | { id: string; title: string; description: string; passingScore: number; isPrerequisiteQuizPassed: boolean },
}

const trainerProfile: PublicTrainerProfile = {
  id: 'i1',
  name: 'Emmanuel Nwafor',
  bio: 'Experienced maths trainer.',
  avatarUrl: undefined,
  subjects: ['mathematics'],
  courses: [
    { id: 'c1', title: 'Foundation Mathematics', description: 'Basic maths.', subject: 'mathematics', level: 'beginner', lessonCount: 24, outcomes: ['Understand basics'], createdAt: '2024-01-01', instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '' } },
    { id: 'c2', title: 'Advanced Algebra', description: 'Advanced algebra.', subject: 'mathematics', level: 'advanced', lessonCount: 18, outcomes: ['Solve advanced problems'], createdAt: '2024-02-01', instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '' } },
  ],
}

const student = { id: 's1', name: 'Test Student', email: 's@test.com', createdAt: '2024-01-01', role: 'student' as const }

function renderPage() {
  return render(
    <Routes>
      <Route path="/courses/:id" element={<CourseDetailPage />} />
    </Routes>,
    { routerProps: { initialEntries: ['/courses/c1'] } },
  )
}

function seedHead() {
  document.head.innerHTML =
    '<link rel="canonical" href="" />' +
    '<meta property="og:title" content="site" />' +
    '<meta property="og:description" content="site" />' +
    '<meta property="og:image" content="site" />' +
    '<meta property="og:url" content="site" />'
}

beforeEach(() => {
  vi.clearAllMocks()
  seedHead()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  vi.mocked(coursesService.getById).mockResolvedValue(course)
  vi.mocked(coursesService.getTrainerProfile).mockResolvedValue(trainerProfile)
  vi.mocked(coursesService.requestCourse).mockResolvedValue({ id: 'c1', status: 'enrolled' })
  vi.mocked(dashboardService.getMyCourses).mockResolvedValue([])
  vi.mocked(dashboardService.getSubscription).mockResolvedValue({ isActive: false, status: 'inactive' })
  vi.mocked(dashboardService.createCheckoutIntent).mockResolvedValue({ id: 'co1' })
})

afterEach(() => {
  seedHead()
})

describe('CourseDetailPage', () => {
  it('shows a structured skeleton while loading', () => {
    vi.mocked(coursesService.getById).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(screen.getByLabelText(/loading course details/i)).toBeInTheDocument()
  })

  it('renders the course title as the primary H1', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Foundation Mathematics' })).toBeInTheDocument())
  })

  it('shows the full Registered Trainer name with the Registered Trainer label', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByText('Emmanuel Nwafor').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Registered Trainer').length).toBeGreaterThan(0)
  })

  it('renders the real thumbnail when available', async () => {
    vi.mocked(coursesService.getById).mockResolvedValue({ ...course, thumbnailUrl: 'https://cdn.example.com/thumb.jpg' })
    renderPage()
    await waitFor(() => expect(screen.getByAltText('Foundation Mathematics — course thumbnail')).toBeInTheDocument())
  })

  it('renders the branded fallback when no thumbnail exists', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument())
    expect(screen.queryByAltText('Foundation Mathematics — course thumbnail')).not.toBeInTheDocument()
  })

  it('renders learning outcomes from the course data', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByLabelText('Learning outcomes')).toBeInTheDocument())
    expect(screen.getByText('Master fractions')).toBeInTheDocument()
    expect(screen.getByText('Solve linear equations')).toBeInTheDocument()
  })

  it('omits the outcomes section when the course has none', async () => {
    vi.mocked(coursesService.getById).mockResolvedValue({ ...course, outcomes: [] })
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument())
    expect(screen.queryByLabelText('Learning outcomes')).not.toBeInTheDocument()
  })

  it('renders the curriculum accordion with modules and lessons', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Course curriculum')).toBeInTheDocument())
    expect(screen.getByText('Numbers')).toBeInTheDocument()
    expect(screen.getByText('Equations')).toBeInTheDocument()
    const firstToggle = screen.getByRole('button', { name: /numbers/i })
    expect(firstToggle).toHaveAttribute('aria-expanded', 'true')
    expect(firstToggle).toHaveAttribute('aria-controls')
    await user.click(firstToggle)
    expect(firstToggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows live classes without exposing meeting URLs', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Live class schedule')).toBeInTheDocument())
    expect(screen.getByText('Live Q&A')).toBeInTheDocument()
    expect(screen.getByText(/available after enrolment/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /join live class/i })).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain('meet.google.com')
  })

  it('shows the prerequisite notice when the course declares a prerequisite quiz', async () => {
    vi.mocked(coursesService.getById).mockResolvedValue({
      ...course,
      prerequisiteQuiz: { id: 'q-secret', title: 'Maths readiness check', description: '', passingScore: 70, isPrerequisiteQuizPassed: false },
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('Prerequisite')).toBeInTheDocument())
    expect(screen.getByText(/Maths readiness check/)).toBeInTheDocument()
    expect(screen.getByText(/at least 70%/)).toBeInTheDocument()
    // Protected quiz content (its id) must not be rendered
    expect(screen.queryByText('q-secret')).not.toBeInTheDocument()
  })

  it('shows Get Started for unauthenticated visitors', async () => {
    renderPage()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /get started/i }).length).toBeGreaterThan(0))
    expect(screen.getAllByRole('link', { name: /get started/i })[0]).toHaveAttribute('href', '/register')
  })

  it('shows Start Learning for a student on a free course and enrols via the API', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ user: student, token: 'tok', isAuthenticated: true })
    renderPage()
    await waitFor(() => expect(screen.getAllByRole('button', { name: /start learning/i }).length).toBeGreaterThan(0))
    await user.click(screen.getAllByRole('button', { name: /start learning/i })[0])
    await waitFor(() => expect(coursesService.requestCourse).toHaveBeenCalledWith('c1'))
    await waitFor(() => expect(screen.getAllByText(/you are enrolled/i).length).toBeGreaterThan(0))
  })

  it('shows the premium upgrade CTA for a premium course without an active subscription', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ user: student, token: 'tok', isAuthenticated: true })
    vi.mocked(coursesService.getById).mockResolvedValue({ ...course, accessLevel: 'premium', priceCents: 250000, currency: 'NGN' })
    renderPage()
    await waitFor(() => expect(screen.getAllByRole('button', { name: /upgrade to premium/i }).length).toBeGreaterThan(0))
    expect(screen.getAllByText(/premium course/i).length).toBeGreaterThan(0)
    await user.click(screen.getAllByRole('button', { name: /upgrade to premium/i })[0])
    await waitFor(() => expect(dashboardService.createCheckoutIntent).toHaveBeenCalledWith('paystack'))
  })

  it('shows Continue Learning for an already-enrolled student without re-enrolling', async () => {
    useAuthStore.setState({ user: student, token: 'tok', isAuthenticated: true })
    vi.mocked(dashboardService.getMyCourses).mockResolvedValue([{ id: 'c1' }])
    renderPage()
    await waitFor(() => expect(screen.getAllByRole('link', { name: /continue learning/i }).length).toBeGreaterThan(0))
    expect(screen.getAllByRole('link', { name: /continue learning/i })[0]).toHaveAttribute('href', '/dashboard/courses/c1')
    expect(coursesService.requestCourse).not.toHaveBeenCalled()
  })

  it('shows an informational message for non-student roles', async () => {
    useAuthStore.setState({ user: { ...student, role: 'trainer' }, token: 'tok', isAuthenticated: true })
    renderPage()
    await waitFor(() => expect(screen.getAllByText(/student accounts can request enrolment/i).length).toBeGreaterThan(0))
  })

  it('shows a neutral not-available state for unpublished/missing courses (404)', async () => {
    vi.mocked(coursesService.getById).mockRejectedValue({ response: { status: 404 } })
    renderPage()
    await waitFor(() => expect(screen.getByText('This course is not available')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /browse courses/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('shows an error state with retry when loading fails', async () => {
    const user = userEvent.setup()
    vi.mocked(coursesService.getById).mockRejectedValue(new Error('Network down'))
    renderPage()
    await waitFor(() => expect(screen.getByText('Unable to load this course')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(coursesService.getById).toHaveBeenCalledTimes(2)
  })

  it('provides a mobile enrolment CTA region', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByLabelText('Course enrolment actions')).toBeInTheDocument())
    expect(screen.getByLabelText('Course enrolment actions').textContent).toContain('Free')
  })

  it('sets the SEO title from the course', async () => {
    renderPage()
    await waitFor(() => expect(document.title).toBe('Foundation Mathematics | NumeryCode'))
  })

  it('sets the canonical URL to the course route', async () => {
    renderPage()
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://numerycode.com/courses/c1'))
  })

  it('updates Open Graph metadata with actual course information', async () => {
    vi.mocked(coursesService.getById).mockResolvedValue({ ...course, thumbnailUrl: 'https://cdn.example.com/thumb.jpg' })
    renderPage()
    await waitFor(() => expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Foundation Mathematics'))
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('A structured maths course for beginners.')
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://cdn.example.com/thumb.jpg')
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://numerycode.com/courses/c1')
  })

  it('renders truthful Course JSON-LD structured data', async () => {
    vi.mocked(coursesService.getById).mockResolvedValue({ ...course, accessLevel: 'premium', priceCents: 250000, currency: 'NGN' })
    renderPage()
    await waitFor(() => {
      const script = document.getElementById('jsonld-course-detail')
      expect(script).not.toBeNull()
      const data = JSON.parse(script!.textContent!)
      expect(data['@type']).toBe('Course')
      expect(data.name).toBe('Foundation Mathematics')
      expect(data.provider.name).toBe('NumeryCode')
      expect(data.instructor.name).toBe('Emmanuel Nwafor')
      expect(data.educationalLevel).toBe('Beginner')
      expect(data.offers).toEqual({ '@type': 'Offer', price: '2500.00', priceCurrency: 'NGN', category: 'Paid' })
      expect(data.aggregateRating).toBeUndefined()
      expect(data.review).toBeUndefined()
    })
  })

  it('links to the Registered Trainer profile page', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByRole('link', { name: /view full profile/i })).toHaveAttribute('href', '/trainers/i1'))
  })

  it('shows more courses from this Registered Trainer, excluding the current course', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('More courses from this Registered Trainer')).toBeInTheDocument())
    expect(screen.getByText('Advanced Algebra')).toBeInTheDocument()
    const moreSection = screen.getByText('More courses from this Registered Trainer').closest('section')!
    expect(moreSection.textContent).not.toContain('Foundation Mathematics')
  })

  it('omits the more-courses section when the trainer has no other published courses', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue({ ...trainerProfile, courses: [trainerProfile.courses[0]] })
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument())
    expect(screen.queryByText('More courses from this Registered Trainer')).not.toBeInTheDocument()
  })
})
