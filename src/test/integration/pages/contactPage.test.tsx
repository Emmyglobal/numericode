import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import ContactPage from '@/pages/public/ContactPage'

vi.mock('@/services/contact.service', () => ({
  contactService: {
    submit: vi.fn().mockImplementation(async (payload: { email: string }) => {
      if (payload.email === 'fail@example.com') throw new Error('Something went wrong sending your message. Please try again.')
      return { sent: true }
    }),
  },
}))

describe('ContactPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the form fields', () => {
    render(<ContactPage />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^message/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('shows message length validation error', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Hi')
    await user.type(screen.getByLabelText(/^message/i), 'short')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument())
  })

  it('submits successfully and shows the success state', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Question about courses')
    await user.type(screen.getByLabelText(/^message/i), 'This is a valid message over ten characters.')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => expect(screen.getByText(/message sent/i)).toBeInTheDocument())
  })

  it('shows an error alert when submission fails', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email address/i), 'fail@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Question')
    await user.type(screen.getByLabelText(/^message/i), 'This message will fail to send on purpose.')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i))
  })

  it('allows sending another message after success', async () => {
    const user = userEvent.setup()
    render(<ContactPage />)
    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Question')
    await user.type(screen.getByLabelText(/^message/i), 'This is a valid message over ten characters.')
    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => screen.getByText(/message sent/i))
    await user.click(screen.getByRole('button', { name: /send another/i }))
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
  })
})
