import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { CourseFormModal } from '@/components/shared/CourseFormModal'

describe('CourseFormModal', () => {
  it('renders "Create New Course" title when no trainers prop is given (trainer mode)', () => {
    render(<CourseFormModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /create new course/i })).toBeInTheDocument()
  })

  it('renders "Create Course & Assign Instructor" title when trainers prop is given (admin mode)', () => {
    render(<CourseFormModal trainers={[]} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /create course & assign instructor/i })).toBeInTheDocument()
  })

  it('does not show the instructor dropdown in trainer mode', () => {
    render(<CourseFormModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.queryByRole('combobox', { name: /assign instructor/i })).not.toBeInTheDocument()
  })

  it('shows the instructor dropdown populated with trainers in admin mode', () => {
    render(<CourseFormModal trainers={[{ id: 't1', name: 'Trainer One', email: 't1@example.com' }]} onClose={vi.fn()} onSubmit={vi.fn()} />)
    const select = screen.getByRole('combobox', { name: /assign instructor/i })
    expect(select).toBeInTheDocument()
    expect(screen.getByText(/trainer one/i)).toBeInTheDocument()
  })

  it('shows validation error when submitting with empty title', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CourseFormModal onClose={vi.fn()} onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error when admin submits without selecting an instructor', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CourseFormModal trainers={[{ id: 't1', name: 'Trainer One', email: 't1@example.com' }]} onClose={vi.fn()} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/course title/i), 'Test Course')
    await user.type(screen.getByLabelText(/description/i), 'A description')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(screen.getByText(/please select an instructor/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with correct values when the form is valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CourseFormModal onClose={vi.fn()} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/course title/i), 'New Course')
    await user.type(screen.getByLabelText(/description/i), 'A great course')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Course', description: 'A great course' }))
  })

  it('splits outcomes textarea by newline into an array', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CourseFormModal onClose={vi.fn()} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/course title/i), 'X')
    await user.type(screen.getByLabelText(/description/i), 'Y')
    await user.type(screen.getByLabelText(/learning outcomes/i), 'Outcome one{enter}Outcome two')
    await user.click(screen.getByRole('button', { name: /create course/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ outcomes: ['Outcome one', 'Outcome two'] }))
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CourseFormModal onClose={onClose} onSubmit={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const { container } = render(<CourseFormModal onClose={onClose} onSubmit={vi.fn()} />)
    const backdrop = container.querySelector('[aria-hidden="true"]')
    if (backdrop) await user.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key press', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<CourseFormModal onClose={onClose} onSubmit={vi.fn()} />)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Save Changes" button text in edit mode', () => {
    render(<CourseFormModal isEdit onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('pre-fills fields from initialValues', () => {
    render(<CourseFormModal isEdit initialValues={{ title: 'Existing Course' }} onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByDisplayValue('Existing Course')).toBeInTheDocument()
  })

  it('shows an error alert when the error prop is set', () => {
    render(<CourseFormModal onClose={vi.fn()} onSubmit={vi.fn()} error="Something went wrong" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('has role="dialog" with aria-modal', () => {
    render(<CourseFormModal onClose={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
