import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { Badge } from '@/components/ui/Badge'

describe('Badge component', () => {
  it('renders children text', () => {
    render(<Badge>Mathematics</Badge>)
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
  })

  it('applies mathematics variant classes', () => {
    render(<Badge variant="mathematics">Mathematics</Badge>)
    const badge = screen.getByText('Mathematics')
    expect(badge).toHaveClass('bg-teal-light')
    expect(badge).toHaveClass('text-teal')
  })

  it('applies programming variant classes', () => {
    render(<Badge variant="programming">Programming</Badge>)
    expect(screen.getByText('Programming')).toHaveClass('bg-purple-light')
  })

  it('applies beginner (green) variant', () => {
    render(<Badge variant="beginner">Beginner</Badge>)
    expect(screen.getByText('Beginner')).toHaveClass('bg-green-100')
  })

  it('applies overdue (red) variant', () => {
    render(<Badge variant="overdue">Overdue</Badge>)
    expect(screen.getByText('Overdue')).toHaveClass('bg-red-100')
  })

  it('applies submitted (green) variant', () => {
    render(<Badge variant="submitted">Submitted</Badge>)
    expect(screen.getByText('Submitted')).toHaveClass('bg-green-100')
  })

  it('applies live (pulsing red) variant', () => {
    render(<Badge variant="live">Live Now</Badge>)
    expect(screen.getByText('Live Now')).toHaveClass('bg-red-600')
  })

  it('applies default variant when no variant given', () => {
    render(<Badge>Generic</Badge>)
    expect(screen.getByText('Generic')).toHaveClass('bg-gray-100')
  })

  it('passes additional className', () => {
    render(<Badge className="mt-2">Test</Badge>)
    expect(screen.getByText('Test')).toHaveClass('mt-2')
  })
})
