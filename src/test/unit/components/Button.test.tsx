import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { Button } from '@/components/ui/Button'

describe('Button component', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const user    = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Submit</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const user    = userEvent.setup()
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner and "Loading…" sr text when loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has aria-busy="true" when loading', () => {
    render(<Button loading>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('has aria-disabled="true" when disabled', () => {
    render(<Button disabled>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders primary variant by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-brand-blue')
  })

  it('renders secondary variant with border', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-brand-blue')
  })

  it('renders danger variant with red background', () => {
    render(<Button variant="danger">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-700')
  })

  it('renders small size correctly', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8')
  })

  it('renders large size correctly', () => {
    render(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-12')
  })

  it('passes additional className to the button', () => {
    render(<Button className="w-full">Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('defaults to type="button" to prevent accidental form submission', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('respects type="submit" when explicitly set', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
