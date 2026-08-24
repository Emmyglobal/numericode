import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { EnrolledCourseCard } from '@/components/shared/EnrolledCourseCard'
import type { EnrolledCourse } from '@/features/courses/types'

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

function renderCard() {
  return render(
    <MemoryRouter>
      <EnrolledCourseCard course={course} />
    </MemoryRouter>,
  )
}

describe('EnrolledCourseCard', () => {
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
})