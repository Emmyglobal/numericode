import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { render } from '@/test/utils'
import TrainersPage from '@/pages/public/TrainersPage'
import { coursesService } from '@/services/courses.service'
import type { AvailableTeacher } from '@/services/courses.service'

vi.mock('@/services/courses.service', () => ({
  coursesService: {
    getAvailableTeachers: vi.fn(),
  },
}))

const trainers: AvailableTeacher[] = [
  {
    id: 'i1',
    name: 'Emmanuel Nwafor',
    bio: 'Experienced maths trainer.',
    avatarUrl: 'https://cdn.example.com/a.jpg',
    subjects: ['mathematics'],
    courses: [
      { id: 'c1', title: 'Foundation Mathematics', subject: 'mathematics', level: 'beginner' },
      { id: 'c2', title: 'Advanced Algebra', subject: 'mathematics', level: 'advanced' },
    ],
  },
  {
    id: 'i2',
    name: 'Ada Obi',
    bio: 'Programming educator.',
    avatarUrl: undefined,
    subjects: ['programming'],
    courses: [{ id: 'c3', title: 'Intro to Programming', subject: 'programming', level: 'beginner' }],
  },
]

function renderTrainersPage(initial = '/trainers') {
  return render(
    <Routes>
      <Route path="/trainers" element={<TrainersPage />} />
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
  vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue(trainers)
})

afterEach(() => {
  seedHead()
})
describe('TrainersPage', () => {
  it('shows a structured skeleton while loading', () => {
    vi.mocked(coursesService.getAvailableTeachers).mockImplementation(() => new Promise(() => {}))
    renderTrainersPage()
    expect(screen.getByLabelText('Loading Registered Trainers')).toBeInTheDocument()
  })

  it('renders the directory hero with a single H1', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'Meet Our Registered Trainers' })).toBeInTheDocument())
  })

  it('renders trainer names', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    expect(screen.getByText('Ada Obi')).toBeInTheDocument()
  })

  it('renders the Registered Trainer label', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getAllByText('Registered Trainer').length).toBe(2))
  })

  it('renders a real avatar with meaningful alt text when available', async () => {
    renderTrainersPage()
    await waitFor(() =>
      expect(screen.getByAltText('Emmanuel Nwafor — Registered Trainer')).toHaveAttribute('src', 'https://cdn.example.com/a.jpg'),
    )
  })

  it('renders initials fallback when no avatar exists', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('AO')).toBeInTheDocument())
  })

  it('renders trainer bios', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Experienced maths trainer.')).toBeInTheDocument())
    expect(screen.getByText('Programming educator.')).toBeInTheDocument()
  })

  it('renders subject badges', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Programming').length).toBeGreaterThan(0)
  })

  it('renders the published-course count with correct grammar', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('2 published courses')).toBeInTheDocument())
    expect(screen.getByText('1 published course')).toBeInTheDocument()
  })

  it('links every trainer name and View Profile CTA to /trainers/:id', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByRole('link', { name: 'Emmanuel Nwafor' })).toHaveAttribute('href', '/trainers/i1'))
    expect(screen.getByRole('link', { name: 'View profile of Emmanuel Nwafor' })).toHaveAttribute('href', '/trainers/i1')
    expect(screen.getByRole('link', { name: 'View profile of Ada Obi' })).toHaveAttribute('href', '/trainers/i2')
  })

  it('searches trainers by name (client-side over the full public list)', async () => {
    renderTrainersPage()
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    await user.type(screen.getByRole('searchbox', { name: /search registered trainers/i }), 'Ada')
    await waitFor(() => expect(screen.queryByText('Emmanuel Nwafor')).not.toBeInTheDocument())
    expect(screen.getByText('Ada Obi')).toBeInTheDocument()
  })

  it('filters by subject', async () => {
    renderTrainersPage()
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Programming' }))
    await waitFor(() => expect(screen.queryByText('Emmanuel Nwafor')).not.toBeInTheDocument())
    expect(screen.getByText('Ada Obi')).toBeInTheDocument()
  })
it('shows an empty state when no trainers match and Clear filters restores the list', async () => {
    renderTrainersPage()
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    await user.type(screen.getByRole('searchbox', { name: /search registered trainers/i }), 'zzz')
    await waitFor(() => expect(screen.getByText('No Registered Trainers found')).toBeInTheDocument())
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0])
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
  })

  it('shows a neutral empty state when the API returns no trainers at all', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([])
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('No Registered Trainers yet')).toBeInTheDocument())
    expect(screen.getByText(/Registered Trainer profiles will appear here once trainers publish courses/)).toBeInTheDocument()
  })

  it('shows an error state without exposing raw errors', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockRejectedValue(new Error('trainers unavailable'))
    renderTrainersPage()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Unable to load Registered Trainers' })).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    expect(screen.queryByText(/trainers unavailable/i)).not.toBeInTheDocument()
  })

  it('recovers with Retry after an error', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockRejectedValue(new Error('network down'))
    renderTrainersPage()
    const user = userEvent.setup()
    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument(), { timeout: 3000 })
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue(trainers)
    await user.click(screen.getByRole('button', { name: /retry/i }))
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
  })

  it('never renders private trainer fields', async () => {
    const withPrivate = [
      { ...trainers[0], email: 'e@example.com', phone: '+2348000000000' },
      ...trainers.slice(1),
    ] as unknown as AvailableTeacher[]
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue(withPrivate)
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    expect(screen.queryByText('e@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText('+2348000000000')).not.toBeInTheDocument()
  })

  it('uses a responsive trainer grid (1 → 2 → 3 columns)', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    const grid = document.querySelector('.grid')!
    expect(grid.className).toContain('sm:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
  })

  it('sets the SEO title and canonical URL for the directory', async () => {
    renderTrainersPage()
    await waitFor(() => expect(document.title).toBe('Registered Trainers | NumeryCode'))
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://numerycode.com/trainers')
  })

  it('renders truthful ItemList structured data from the public API', async () => {
    renderTrainersPage()
    await waitFor(() => {
      const script = document.getElementById('jsonld-trainer-directory')
      expect(script).not.toBeNull()
      const data = JSON.parse(script!.textContent!)
      expect(data['@type']).toBe('ItemList')
      expect(data.itemListElement).toHaveLength(2)
      expect(data.itemListElement[0].item).toEqual({ '@type': 'Person', name: 'Emmanuel Nwafor', url: 'https://numerycode.com/trainers/i1' })
    })
  })

  it('omits the ItemList JSON-LD when the directory has zero trainers', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([])
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('No Registered Trainers yet')).toBeInTheDocument())
    expect(document.getElementById('jsonld-trainer-directory')).toBeNull()
  })

  it('caps the ItemList JSON-LD at 100 ListItems with correct profile URLs', async () => {
    const many: AvailableTeacher[] = Array.from({ length: 150 }, (_, i) => ({
      id: `t${i + 1}`,
      name: `Trainer ${i + 1}`,
      bio: '',
      avatarUrl: undefined,
      subjects: ['mathematics'],
      courses: [],
    }))
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue(many)
    renderTrainersPage()
    await waitFor(() => {
      const script = document.getElementById('jsonld-trainer-directory')
      expect(script).not.toBeNull()
      const data = JSON.parse(script!.textContent!)
      expect(data['@type']).toBe('ItemList')
      expect(data.itemListElement).toHaveLength(100)
      expect(data.itemListElement[99].item.url).toBe('https://numerycode.com/trainers/t100')
      expect(data.itemListElement.every((e: { item: { name: string; url: string } }) =>
        e.item.name && e.item.url.startsWith('https://numerycode.com/trainers/'),
      )).toBe(true)
    })
  })

  it('builds valid single-trainer JSON-LD and never includes private fields', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([
      { ...trainers[0], email: 'e@example.com', phone: '+2348000000000' } as unknown as AvailableTeacher,
    ])
    renderTrainersPage()
    await waitFor(() => {
      const script = document.getElementById('jsonld-trainer-directory')
      expect(script).not.toBeNull()
      const raw = script!.textContent!
      expect(() => JSON.parse(raw)).not.toThrow()
      const data = JSON.parse(raw)
      expect(data.itemListElement).toHaveLength(1)
      expect(data.itemListElement[0].item).toEqual({
        '@type': 'Person', name: 'Emmanuel Nwafor', url: 'https://numerycode.com/trainers/i1',
      })
      // Only public fields — no ratings, reviews, employment or private data
      expect(raw).not.toContain('e@example.com')
      expect(raw).not.toContain('+2348000000000')
      expect(raw).not.toContain('aggregateRating')
      expect(raw).not.toContain('worksFor')
    })
  })

  it('removes the ItemList JSON-LD on unmount', async () => {
    const { unmount } = renderTrainersPage()
    await waitFor(() => expect(document.getElementById('jsonld-trainer-directory')).not.toBeNull())
    unmount()
    expect(document.getElementById('jsonld-trainer-directory')).toBeNull()
  })

  it('offers a View Courses catalogue path for trainers with published courses', async () => {
    renderTrainersPage()
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'View courses by Emmanuel Nwafor' })).toHaveAttribute('href', '/courses?instructorId=i1'),
    )
    expect(screen.getByRole('link', { name: 'View courses by Ada Obi' })).toHaveAttribute('href', '/courses?instructorId=i2')
  })

  it('does not offer View Courses for a trainer with zero published courses', async () => {
    vi.mocked(coursesService.getAvailableTeachers).mockResolvedValue([{ ...trainers[0], courses: [] }])
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    expect(screen.getByText('0 published courses')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'View courses by Emmanuel Nwafor' })).not.toBeInTheDocument()
    // The profile remains the primary action
    expect(screen.getByRole('link', { name: 'View profile of Emmanuel Nwafor' })).toHaveAttribute('href', '/trainers/i1')
  })

  it('provides a truthful Become a Registered Trainer CTA', async () => {
    renderTrainersPage()
    await waitFor(() => expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'Become a Registered Trainer' })).toHaveAttribute('href', '/register')
  })
})