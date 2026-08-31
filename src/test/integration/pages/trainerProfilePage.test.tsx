import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { render } from '@/test/utils'
import TrainerProfilePage from '@/pages/public/TrainerProfilePage'
import CourseDetailPage from '@/pages/public/CourseDetailPage'
import { coursesService } from '@/services/courses.service'
import { dashboardService } from '@/services/dashboard.service'
import { useAuthStore } from '@/store/authStore'
import type { Course, CourseSummary } from '@/features/courses/types'
import type { PublicTrainerProfile } from '@/services/courses.service'

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getById: vi.fn(),
    getTrainerProfile: vi.fn(),
    getAllPaginated: vi.fn(),
    requestCourse: vi.fn(),
    getAvailableTeachers: vi.fn(),
  },
}))

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getMyCourses: vi.fn(),
    getSubscription: vi.fn(),
    createCheckoutIntent: vi.fn(),
  },
}))

const courseSummary1: CourseSummary = {
  id: 'c1',
  title: 'Foundation Mathematics',
  description: 'A structured maths course for beginners.',
  subject: 'mathematics',
  level: 'beginner',
  lessonCount: 24,
  outcomes: ['Master fractions'],
  thumbnailUrl: undefined,
  accessLevel: 'free',
  priceCents: null,
  currency: null,
  premiumEnabled: false,
  createdAt: '2024-01-10',
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: 'Experienced maths trainer.', avatarUrl: undefined },
}

const courseSummary2: CourseSummary = {
  ...courseSummary1,
  id: 'c2',
  title: 'Intro to Programming',
  description: 'A hands-on introduction to programming.',
  subject: 'programming',
  level: 'beginner',
  lessonCount: 12,
  instructor: { ...courseSummary1.instructor! },
}

const trainer: PublicTrainerProfile = {
  id: 'i1',
  name: 'Emmanuel Nwafor',
  bio: 'Experienced maths trainer with a focus on building strong foundations.',
  avatarUrl: undefined,
  subjects: ['mathematics', 'programming'],
  courses: [courseSummary1, courseSummary2],
}

/** Full course fixture so a Course Details → Trainer Profile navigation test works. */
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
  outcomes: ['Master fractions'],
  createdAt: '2024-01-10',
  thumbnailUrl: undefined,
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: 'Experienced maths trainer.', avatarUrl: undefined, credentials: [] },
  modules: [
    { id: 'm1', title: 'Numbers', lessons: [
      { id: 'l1', title: 'Intro to numbers', content: '', duration: 20, isCompleted: false, resources: [] },
    ]},
  ],
  liveClasses: [],
}

function renderTrainerPage(initial = '/trainers/i1') {
  return render(
    <Routes>
      <Route path="/trainers/:id" element={<TrainerProfilePage />} />
    </Routes>,
    { routerProps: { initialEntries: [initial] } },
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
  vi.mocked(coursesService.getTrainerProfile).mockResolvedValue(trainer)
  vi.mocked(coursesService.getById).mockResolvedValue(course)
  vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([])
  vi.mocked(coursesService.getAllPaginated).mockResolvedValue({
    data: [],
    pagination: { total: 0, limit: 12, offset: 0, count: 0, hasMore: false },
  })
  vi.mocked(coursesService.requestCourse).mockResolvedValue({ id: 'c1', status: 'enrolled' })
  vi.mocked(dashboardService.getMyCourses).mockResolvedValue([])
  vi.mocked(dashboardService.getSubscription).mockResolvedValue({ isActive: false, status: 'inactive' })
  vi.mocked(dashboardService.createCheckoutIntent).mockResolvedValue({ id: 'co1' })
})

afterEach(() => {
  seedHead()
})
describe('TrainerProfilePage', () => {
  it('shows a structured skeleton while loading', () => {
    vi.mocked(coursesService.getTrainerProfile).mockImplementation(() => new Promise(() => {}))
    renderTrainerPage()
    expect(screen.getByLabelText('Loading trainer profile')).toBeInTheDocument()
  })

  it('renders the trainer full name as the primary H1', async () => {
    renderTrainerPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Emmanuel Nwafor' })).toBeInTheDocument(),
    )
  })

  it('renders the Registered Trainer label', async () => {
    renderTrainerPage()
    await waitFor(() => expect(screen.getAllByText('Registered Trainer').length).toBeGreaterThan(0))
  })

  it('links to the trainer-filtered catalogue from the courses section', async () => {
    renderTrainerPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Emmanuel Nwafor' })).toBeInTheDocument(),
    )
    const link = screen.getByRole('link', { name: /view all courses by this registered trainer/i })
    expect(link).toHaveAttribute('href', '/courses?instructorId=i1')
  })

  it('omits the catalogue link when the trainer has no published courses', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue({ ...trainer, courses: [] })
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText(/No published courses yet/i)).toBeInTheDocument())
    expect(screen.queryByRole('link', { name: /view all courses by this registered trainer/i })).not.toBeInTheDocument()
  })

  it('renders the trainer bio when available', async () => {
    renderTrainerPage()
    await waitFor(() =>
      expect(screen.getByText('Experienced maths trainer with a focus on building strong foundations.')).toBeInTheDocument(),
    )
  })

  it('renders trainer subjects with human-readable labels', async () => {
    renderTrainerPage()
    await waitFor(() => expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Programming').length).toBeGreaterThan(0)
  })

  it('shows an accurate published-course count', async () => {
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('2 courses')).toBeInTheDocument())
  })

  it('renders the trainer’s courses using shared CourseCards', async () => {
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('Courses by Emmanuel Nwafor')).toBeInTheDocument())
    expect(screen.getByText('Foundation Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Intro to Programming')).toBeInTheDocument()
    // CourseCard CTA links to the course detail route
    expect(screen.getByRole('link', { name: /view foundation mathematics/i })).toHaveAttribute('href', '/courses/c1')
    expect(screen.getByRole('link', { name: /view intro to programming/i })).toHaveAttribute('href', '/courses/c2')
  })

  it('uses a responsive course grid (1 → 2 → 3 columns)', async () => {
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('Courses by Emmanuel Nwafor')).toBeInTheDocument())
    const section = screen.getByText('Courses by Emmanuel Nwafor').closest('section')!
    const grid = section.querySelector('.grid')!
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
  })

  it('shows an empty state when the trainer has no published courses', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue({ ...trainer, courses: [] })
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('No published courses yet')).toBeInTheDocument())
  })

  it('shows a neutral not-found state for a missing inactive trainer (404)', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockRejectedValue({ response: { status: 404 } })
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('Trainer not found')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Explore Courses' })).toHaveAttribute('href', '/courses')
  })

  it('shows an error state with retry when the API fails', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockRejectedValue(new Error('network down'))
    renderTrainerPage()
    await waitFor(() => expect(screen.getByText('Unable to load trainer profile')).toBeInTheDocument())
    expect(screen.queryByText(/network down/i)).not.toBeInTheDocument()
  })

  it('retries after an error and renders the profile', async () => {
    vi.mocked(coursesService.getTrainerProfile)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(trainer)
    renderTrainerPage()
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByText('Unable to load trainer profile')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Emmanuel Nwafor' })).toBeInTheDocument(),
    )
  })

  it('does not render private trainer fields (privacy-safe rendering)', async () => {
    const withPrivate = { ...trainer, email: 'trainer@example.com', phone: '+2348012345678' } as unknown as PublicTrainerProfile
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue(withPrivate)
    renderTrainerPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Emmanuel Nwafor' })).toBeInTheDocument(),
    )
    expect(screen.queryByText('trainer@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('+2348012345678')).not.toBeInTheDocument()
  })
it('sets the SEO title from the trainer name', async () => {
    renderTrainerPage()
    await waitFor(() => expect(document.title).toBe('Emmanuel Nwafor | Registered Trainer | NumeryCode'))
  })

  it('sets the canonical URL to the trainer route', async () => {
    renderTrainerPage()
    await waitFor(() =>
      expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://numerycode.com/trainers/i1'),
    )
  })

  it('updates Open Graph metadata with public trainer information', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue({
      ...trainer,
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
    })
    renderTrainerPage()
    await waitFor(() =>
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Emmanuel Nwafor | Registered Trainer'),
    )
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://numerycode.com/trainers/i1')
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://cdn.example.com/avatar.jpg')
  })

  it('renders truthful Person JSON-LD without fabricated credentials', async () => {
    vi.mocked(coursesService.getTrainerProfile).mockResolvedValue({
      ...trainer,
      avatarUrl: 'https://cdn.example.com/avatar.jpg',
    })
    renderTrainerPage()
    await waitFor(() => {
      const script = document.getElementById('jsonld-trainer-profile')
      expect(script).not.toBeNull()
      const data = JSON.parse(script!.textContent!)
      expect(data['@type']).toBe('Person')
      expect(data.name).toBe('Emmanuel Nwafor')
      expect(data.url).toBe('https://numerycode.com/trainers/i1')
      expect(data.image).toBe('https://cdn.example.com/avatar.jpg')
      expect(data.knowsAbout).toEqual(['Mathematics', 'Programming'])
      expect(data.jobTitle).toBeUndefined()
      expect(data.worksFor).toBeUndefined()
    })
  })

  it('navigates from a Course Details trainer link to the trainer profile', async () => {
    render(
      <Routes>
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/trainers/:id" element={<TrainerProfilePage />} />
      </Routes>,
      { routerProps: { initialEntries: ['/courses/c1'] } },
    )
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByRole('link', { name: /view full profile/i })).toBeInTheDocument())
    await user.click(screen.getByRole('link', { name: /view full profile/i }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: 'Emmanuel Nwafor' })).toBeInTheDocument(),
    )
    expect(screen.getByText('Courses by Emmanuel Nwafor')).toBeInTheDocument()
  })
})