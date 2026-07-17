import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { Alert } from '@/components/ui/Alert'

describe('Alert component', () => {
  it('renders message text', () => {
    render(<Alert message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders optional title', () => {
    render(<Alert message="Details here" title="Error Occurred" />)
    expect(screen.getByText('Error Occurred')).toBeInTheDocument()
  })

  it('has role="alert" for error type', () => {
    render(<Alert type="error" message="Failed" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has role="alert" for warning type', () => {
    render(<Alert type="warning" message="Caution" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has role="status" for success type', () => {
    render(<Alert type="success" message="Saved!" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has role="status" for info type', () => {
    render(<Alert type="info" message="Note" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows close button when onClose is provided', () => {
    render(<Alert message="Closable" onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('does not show close button without onClose', () => {
    render(<Alert message="No close" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClose when dismiss button is clicked', async () => {
    const user    = userEvent.setup()
    const onClose = vi.fn()
    render(<Alert message="Closable" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has aria-live="assertive" for error', () => {
    render(<Alert type="error" message="Error" />)
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
  })

  it('has aria-live="polite" for success', () => {
    render(<Alert type="success" message="OK" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
