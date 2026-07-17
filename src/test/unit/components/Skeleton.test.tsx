import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { Skeleton, CourseCardSkeleton } from '@/components/ui/Skeleton'

describe('Skeleton component', () => {
  it('has role="status" for screen readers', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label of "Loading…"', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading…')
  })

  it('applies animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies additional className', () => {
    const { container } = render(<Skeleton className="h-24 w-full" />)
    expect(container.firstChild).toHaveClass('h-24', 'w-full')
  })
})

describe('CourseCardSkeleton', () => {
  it('has role="status" on outer wrapper', () => {
    render(<CourseCardSkeleton />)
    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBeGreaterThan(0)
  })

  it('outer wrapper has "Loading course…" aria-label', () => {
    render(<CourseCardSkeleton />)
    const statuses = screen.getAllByRole('status')
    const outer = statuses.find(el => el.getAttribute('aria-label') === 'Loading course…')
    expect(outer).toBeInTheDocument()
  })
})
