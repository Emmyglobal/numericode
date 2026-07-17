import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { BookOpen } from 'lucide-react'

describe('EmptyState component', () => {
  it('renders title', () => {
    render(<EmptyState title="No courses found" />)
    expect(screen.getByText('No courses found')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try adjusting your filters." />)
    expect(screen.getByText('Try adjusting your filters.')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<EmptyState icon={<BookOpen data-testid="icon" />} title="No courses" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders action button when action prop is given', () => {
    render(<EmptyState title="Empty" action={{ label: 'Reset Filters', onClick: vi.fn() }} />)
    expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument()
  })

  it('calls action.onClick when action button is clicked', async () => {
    const user    = userEvent.setup()
    const onClick = vi.fn()
    render(<EmptyState title="Empty" action={{ label: 'Retry', onClick }} />)
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders without action button when action is not provided', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders without description when not provided', () => {
    render(<EmptyState title="Empty" />)
    // Only the title should be present
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })
})
