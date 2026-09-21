import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { LessonViewer } from '@/components/shared/LessonViewer'
import type { LessonSlide } from '@/features/courses/types'

const slides: LessonSlide[] = [
  { id: 's1', type: 'title', title: 'What Is React?', content: 'React builds the part of a website people see.' },
  { id: 's2', type: 'objectives', title: 'What You Will Learn', items: ['Say what React is', 'Explain components'] },
  { id: 's3', type: 'content', title: 'A Tool for Building Screens', content: 'React is a **library** for building user interfaces.' },
  {
    id: 's4',
    type: 'code',
    title: 'Your First Component',
    language: 'jsx',
    code: 'function Welcome() {\n  return <h1>Hello</h1>;\n}',
    content: 'The return describes what appears on the screen.',
  },
  {
    id: 's5',
    type: 'knowledge-check',
    title: 'Quick Check',
    question: { question: 'What is a component?', options: ['A LEGO-like piece of the UI', 'A database', 'A CSS file', 'A server'], correctIndex: 0, explanation: 'Components are reusable pieces of the interface.' },
  },
  { id: 's6', type: 'summary', title: 'Lesson Summary', items: ['React builds user interfaces', 'Components are the building blocks'] },
]

describe('LessonViewer', () => {
  it('shows the first slide with a slide counter and progress', () => {
    render(<LessonViewer title="What Is React?" slides={slides} />)

    expect(screen.getByText('Slide 1 of 6')).toBeInTheDocument()
    // The deck header (level 3) and the slide heading (level 4) both carry the title.
    expect(screen.getByRole('heading', { level: 3, name: 'What Is React?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'What Is React?' })).toBeInTheDocument()

    const progress = screen.getByRole('progressbar', { name: /lesson slide progress/i })
    expect(progress).toHaveAttribute('aria-valuenow', '17')
  })

  it('disables Previous on the first slide and enables it later', async () => {
    const user = userEvent.setup()
    render(<LessonViewer title="What Is React?" slides={slides} />)

    expect(screen.getByRole('button', { name: /first slide/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /next slide/i }))
    expect(screen.getByRole('button', { name: /previous slide/i })).toBeEnabled()
    expect(screen.getByText('Slide 2 of 6')).toBeInTheDocument()
  })

  it('moves forward and back again', async () => {
    const user = userEvent.setup()
    render(<LessonViewer title="What Is React?" slides={slides} />)

    await user.click(screen.getByRole('button', { name: /next slide/i }))
    await user.click(screen.getByRole('button', { name: /next slide/i }))
    expect(screen.getByText('Slide 3 of 6')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /previous slide/i }))
    expect(screen.getByText('Slide 2 of 6')).toBeInTheDocument()
  })

  it('supports arrow-key navigation', async () => {
    const user = userEvent.setup()
    render(<LessonViewer title="What Is React?" slides={slides} />)

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('Slide 2 of 6')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('Slide 1 of 6')).toBeInTheDocument()
  })

  it('renders code with a copy control', async () => {
    const user = userEvent.setup()
    render(<LessonViewer title="What Is React?" slides={slides} />)

    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: /next slide/i }))
    }

    expect(screen.getByText('Slide 4 of 6')).toBeInTheDocument()
    expect(screen.getByText(/function Welcome\(\)/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy code to clipboard/i })).toBeInTheDocument()
  })

  it('gives instant feedback on the inline knowledge check', async () => {
    const user = userEvent.setup()
    render(<LessonViewer title="What Is React?" slides={slides} />)

    for (let i = 0; i < 4; i += 1) {
      await user.click(screen.getByRole('button', { name: /next slide/i }))
    }

    expect(screen.getByText('Slide 5 of 6')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'A CSS file' }))
    expect(screen.getByText(/Not quite/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /try the question again/i }))
    await user.click(screen.getByRole('button', { name: 'A LEGO-like piece of the UI' }))
    expect(screen.getByText(/Correct — well done/i)).toBeInTheDocument()
  })

  it('finishes the lesson on the last slide and reports completion', async () => {
    const user = userEvent.setup()
    const onFinish = vi.fn()
    render(<LessonViewer title="What Is React?" slides={slides} onFinish={onFinish} />)

    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole('button', { name: /next slide/i }))
    }

    expect(screen.getByText('Slide 6 of 6')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /finish lesson/i }))

    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Lesson complete/i)).toBeInTheDocument()
  })

  it('renders nothing when there are no slides', () => {
    const { container } = render(<LessonViewer title="Empty" slides={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
