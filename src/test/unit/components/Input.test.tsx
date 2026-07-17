import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { Input } from '@/components/ui/Input'

describe('Input component', () => {
  it('renders with a label', () => {
    render(<Input label="Email Address" />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })

  it('renders placeholder text', () => {
    render(<Input placeholder="Enter your email" />)
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
  })

  it('shows error message when error prop is set', () => {
    render(<Input label="Email" error="Invalid email address" />)
    expect(screen.getByText('Invalid email address')).toBeInTheDocument()
  })

  it('has aria-invalid="true" when error is set', () => {
    render(<Input label="Email" error="Required" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows hint text when hint prop is set', () => {
    render(<Input label="Username" hint="Must be at least 3 characters" />)
    expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument()
  })

  it('does not show hint when error is also set', () => {
    render(<Input label="Email" error="Invalid" hint="Enter valid email" />)
    expect(screen.queryByText(/enter valid email/i)).not.toBeInTheDocument()
  })

  it('renders required indicator when required prop is set', () => {
    render(<Input label="Name" required />)
    expect(screen.getByText('(required)')).toBeInTheDocument()
  })

  it('has aria-required when required prop is set', () => {
    render(<Input label="Name" required />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
  })

  it('is disabled when disabled prop is set', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('accepts user input', async () => {
    const user     = userEvent.setup()
    const onChange = vi.fn()
    render(<Input label="Search" onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
  })

  it('error message has role="alert"', () => {
    render(<Input label="Email" error="This field is required" />)
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('links error message via aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />)
    const input   = screen.getByRole('textbox')
    const errorId = input.getAttribute('aria-describedby')
    expect(errorId).toBeTruthy()
    const errorEl = document.getElementById(errorId!)
    expect(errorEl).toHaveTextContent('Invalid email')
  })

  it('does not render a toggle button for non-password inputs', () => {
    render(<Input label="Email" type="email" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a show/hide toggle button for password inputs', () => {
    render(<Input label="Password" type="password" />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('password input defaults to type="password" (hidden)', () => {
    render(<Input label="Password" type="password" />)
    const input = document.getElementById('password') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('clicking the toggle reveals the password as plain text', async () => {
    const user = userEvent.setup()
    render(<Input label="Password" type="password" />)
    const toggle = screen.getByRole('button', { name: /show password/i })
    await user.click(toggle)
    const input = document.getElementById('password') as HTMLInputElement
    expect(input.type).toBe('text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })

  it('clicking the toggle twice hides the password again', async () => {
    const user = userEvent.setup()
    render(<Input label="Password" type="password" />)
    const toggle = screen.getByRole('button', { name: /show password/i })
    await user.click(toggle)
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    const input = document.getElementById('password') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('toggle button is not focusable via Tab (tabIndex -1) so it does not disrupt form flow', () => {
    render(<Input label="Password" type="password" />)
    expect(screen.getByRole('button', { name: /show password/i })).toHaveAttribute('tabIndex', '-1')
  })
})
