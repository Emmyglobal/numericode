import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { CourseCard } from '@/components/shared/CourseCard'
import type { CourseSummary, EnrolledCourse } from '@/features/courses/types'

const course: CourseSummary = {
  id: 'c1',
  title: 'JavaScript for Beginners',
  description: 'Learn JavaScript from scratch.',
  subject: 'programming',
  level: 'beginner',
  lessonCount: 24,
  outcomes: [],
  thumbnailUrl: null,
  accessLevel: 'free',
  priceCents: null,
  currency: null,
  premiumEnabled: false,
  createdAt: '2024-01-10',
  instructor: { id: 'i1', name: 'Emmanuel Nwafor', bio: '', avatarUrl: null },
}

function makeEnrolled(): EnrolledCourse {
  return {
    ...course,
    content: '',
    modules: [],
    liveClasses: [],
    instructor: { ...course.instructor, credentials: [] },
    thumbnailUrl: undefined,
    progress: 45,
    enrolledAt: '2024-02-01',
  } as unknown as EnrolledCourse
}

describe('CourseCard', () => {
  it('renders the real thumbnail when thumbnailUrl is available', () => {
    render(<CourseCard course={{ ...course, thumbnailUrl: 'https://cdn.example.com/thumb.jpg' }} />)
    const img = screen.getByRole('img', { name: /javascript for beginners — course thumbnail/i })
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/thumb.jpg')
    expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('renders a branded fallback when no thumbnail exists', () => {
    render(<CourseCard course={course} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows the full Registered Trainer name with a label', () => {
    render(<CourseCard course={course} />)
    expect(screen.getByText('Emmanuel Nwafor')).toBeInTheDocument()
    expect(screen.getByText('Registered Trainer')).toBeInTheDocument()
    // The old behaviour showed only the last name — it must not come back
    expect(screen.queryByText(/^Nwafor$/)).not.toBeInTheDocument()
  })

  it('links to the course detail page with a View Course CTA', () => {
    render(<CourseCard course={course} />)
    const link = screen.getByRole('link', { name: /view javascript for beginners/i })
    expect(link).toHaveAttribute('href', '/courses/c1')
  })

  it('shows the formatted price for premium courses', () => {
    render(
      <CourseCard
        course={{ ...course, accessLevel: 'premium', priceCents: 4999, currency: 'USD' }}
      />,
    )
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('keeps the enrolled variant working with progress and Continue CTA', () => {
    render(<CourseCard course={makeEnrolled()} />)
    expect(screen.getByRole('link', { name: /continue javascript for beginners/i })).toBeInTheDocument()
    expect(screen.getByText(/progress/i)).toBeInTheDocument()
    expect(screen.queryByText('View Course')).not.toBeInTheDocument()
  })

  it('shows the lesson count', () => {
    render(<CourseCard course={course} />)
    expect(screen.getByText('24 lessons')).toBeInTheDocument()
  })
})
