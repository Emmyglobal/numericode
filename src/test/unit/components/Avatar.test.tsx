import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { Avatar } from '@/components/ui/Avatar'

describe('Avatar component', () => {
  it('renders initials from a full name', () => {
    render(<Avatar name="Emmanuel Nwafor" />)
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('renders initials from a single name', () => {
    render(<Avatar name="Kolade" />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders at most 2 initials even for long names', () => {
    render(<Avatar name="Ugochukwu Emmanuel Nwafor" />)
    expect(screen.getByText('UE')).toBeInTheDocument()
  })

  it('renders initials in uppercase', () => {
    render(<Avatar name="amaka okonkwo" />)
    expect(screen.getByText('AO')).toBeInTheDocument()
  })

  it('applies sm size class', () => {
    const { container } = render(<Avatar name="Test User" size="sm" />)
    expect(container.firstChild).toHaveClass('w-8', 'h-8')
  })

  it('applies lg size class', () => {
    const { container } = render(<Avatar name="Test User" size="lg" />)
    expect(container.firstChild).toHaveClass('w-16', 'h-16')
  })

  it('applies xl size class', () => {
    const { container } = render(<Avatar name="Test User" size="xl" />)
    expect(container.firstChild).toHaveClass('w-24', 'h-24')
  })

  it('applies additional className', () => {
    const { container } = render(<Avatar name="Test" className="bg-teal" />)
    expect(container.firstChild).toHaveClass('bg-teal')
  })
})
