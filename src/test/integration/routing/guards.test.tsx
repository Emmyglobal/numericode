import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test/utils'
import { useAuthStore } from '@/store/authStore'
import { AppRouter } from '@/app/Router'

// Mock all services so lazy-loaded pages render without real API calls
vi.mock('@/services/courses.service', () => ({
  coursesService: { getAll: vi.fn().mockResolvedValue([]), getById: vi.fn().mockResolvedValue(null) },
}))
vi.mock('@/services/dashboard.service', () => ({
  dashboardService: {
    getOverview: vi.fn().mockResolvedValue({ enrolledCount:0, completedLessons:0, upcomingClassesCount:0, assignmentsDue:0, continuelearning:{ id:'c1', title:'Test', progress:0, nextLesson:{ title:'Lesson 1' } }, upcomingClasses:[], recentAnnouncements:[] }),
    getMyCourses: vi.fn().mockResolvedValue([]),
    getCourse: vi.fn().mockResolvedValue(null),
    getAssignments: vi.fn().mockResolvedValue([]),
    getAnnouncements: vi.fn().mockResolvedValue([]),
    getResources: vi.fn().mockResolvedValue([]),
    getLiveClasses: vi.fn().mockResolvedValue([]),
    getProfile: vi.fn().mockResolvedValue({ name:'Kolade', email:'kolade@gmail.com', bio:'' }),
    updateProfile: vi.fn().mockResolvedValue({}),
  },
}))
vi.mock('@/lib/axios', () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: { success:true, data:[] } }),
    post: vi.fn().mockResolvedValue({ data: { success:true, data:{} } }),
    put: vi.fn().mockResolvedValue({ data: { success:true, data:{} } }),
  },
}))

const studentUser = { id:'u2', name:'Kolade',   email:'kolade@gmail.com',       role:'student' as const, createdAt:'2024-01-01' }
const trainerUser = { id:'u7', name:'Trainer',  email:'trainer@numericode.com', role:'trainer' as const, createdAt:'2024-01-01' }
const adminUser   = { id:'u1', name:'Emmanuel', email:'admin@numericode.com',   role:'admin'   as const, createdAt:'2024-01-01' }

const resetAuth = () => useAuthStore.setState({ user:null, token:null, isAuthenticated:false })
const loginAs   = (u: typeof studentUser) => useAuthStore.setState({ user:u, token:'mock-token', isAuthenticated:true })

describe('Route Guards', () => {
  beforeEach(resetAuth)

  // ── Unauthenticated ────────────────────────────────────────────────────────

  it('redirects unauthenticated user from /dashboard to /login', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/dashboard'] } })
    await waitFor(() => expect(screen.getByRole('heading', { name:/welcome back/i })).toBeInTheDocument())
  })

  it('redirects unauthenticated user from /trainer to /login', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/trainer'] } })
    await waitFor(() => expect(screen.getByRole('heading', { name:/welcome back/i })).toBeInTheDocument())
  })

  it('redirects unauthenticated user from /admin to /login', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/admin'] } })
    await waitFor(() => expect(screen.getByRole('heading', { name:/welcome back/i })).toBeInTheDocument())
  })

  it('allows unauthenticated user on landing page', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/'] } })
    await waitFor(() => expect(screen.getByText(/mathematics & code/i)).toBeInTheDocument())
  })

  it('allows unauthenticated user on /courses', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/courses'] } })
    await waitFor(() => expect(screen.getByRole('heading', { name:/all courses/i })).toBeInTheDocument())
  })

  it('allows unauthenticated user on /faq', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/faq'] } })
    await waitFor(() => expect(screen.getByRole('heading', { name:/frequently asked questions/i })).toBeInTheDocument())
  })

  // ── Student ────────────────────────────────────────────────────────────────

  it('allows student to access /dashboard', async () => {
    loginAs(studentUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/dashboard'] } })
    await waitFor(() => expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument())
  })

  it('redirects student from /trainer to /dashboard', async () => {
    loginAs(studentUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/trainer'] } })
    await waitFor(() => expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument())
  })

  it('redirects student from /admin to /dashboard', async () => {
    loginAs(studentUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/admin'] } })
    await waitFor(() => expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument())
  })

  it('redirects logged-in student away from /login', async () => {
    loginAs(studentUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/login'] } })
    await waitFor(() => expect(screen.getByText(/good morning|good afternoon|good evening/i)).toBeInTheDocument())
  })

  // ── Trainer ────────────────────────────────────────────────────────────────

  it('allows trainer to access /trainer', async () => {
    loginAs(trainerUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/trainer'] } })
    await waitFor(() => expect(screen.getByText(/welcome back, trainer/i)).toBeInTheDocument())
  })

  it('redirects trainer from /dashboard to /trainer', async () => {
    loginAs(trainerUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/dashboard'] } })
    await waitFor(() => expect(screen.getByText(/welcome back, trainer/i)).toBeInTheDocument())
  })

  it('redirects trainer from /admin to /trainer', async () => {
    loginAs(trainerUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/admin'] } })
    await waitFor(() => expect(screen.getByText(/welcome back, trainer/i)).toBeInTheDocument())
  })

  it('redirects logged-in trainer away from /login', async () => {
    loginAs(trainerUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/login'] } })
    await waitFor(() => expect(screen.getByText(/welcome back, trainer/i)).toBeInTheDocument())
  })

  // ── Admin ──────────────────────────────────────────────────────────────────

  it('allows admin to access /admin', async () => {
    loginAs(adminUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/admin'] } })
    await waitFor(() => {
      const heads = screen.getAllByRole('heading', { name:/admin overview/i })
      expect(heads.length).toBeGreaterThan(0)
    })
  })

  it('redirects admin from /dashboard to /admin', async () => {
    loginAs(adminUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/dashboard'] } })
    await waitFor(() => expect(screen.getAllByRole('heading', { name:/admin overview/i }).length).toBeGreaterThan(0))
  })

  it('redirects admin from /trainer to /admin', async () => {
    loginAs(adminUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/trainer'] } })
    await waitFor(() => expect(screen.getAllByRole('heading', { name:/admin overview/i }).length).toBeGreaterThan(0))
  })

  it('redirects logged-in admin away from /login', async () => {
    loginAs(adminUser)
    render(<AppRouter />, { routerProps: { initialEntries:['/login'] } })
    await waitFor(() => expect(screen.getAllByRole('heading', { name:/admin overview/i }).length).toBeGreaterThan(0))
  })

  // ── 404 ───────────────────────────────────────────────────────────────────

  it('renders 404 page for unknown routes', async () => {
    render(<AppRouter />, { routerProps: { initialEntries:['/this-does-not-exist'] } })
    await waitFor(() => {
      expect(screen.getByText(/404/i)).toBeInTheDocument()
      expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    })
  })
})
