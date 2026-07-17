import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import FaqPage from '@/pages/public/FaqPage'

describe('FaqPage', () => {
  it('renders the page heading', () => {
    render(<FaqPage />)
    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FaqPage />)
    expect(screen.getByText(/is numericode completely free/i)).toBeInTheDocument()
    expect(screen.getByText(/who are the courses designed for/i)).toBeInTheDocument()
    expect(screen.getByText(/how do live classes work/i)).toBeInTheDocument()
  })

  it('FAQ answers are hidden by default', () => {
    render(<FaqPage />)
    // Answers use the `hidden` attribute when closed
    const answers = document.querySelectorAll('[role="region"]')
    answers.forEach(a => {
      expect(a).toHaveAttribute('hidden')
    })
  })

  it('clicking a question reveals the answer', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const firstQuestion = screen.getAllByRole('button')[0]
    await user.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking an open question closes it again', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const firstQuestion = screen.getAllByRole('button')[0]
    await user.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'true')
    await user.click(firstQuestion)
    expect(firstQuestion).toHaveAttribute('aria-expanded', 'false')
  })

  it('answer panel is visible after question is opened', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const firstQuestion = screen.getAllByRole('button')[0]
    const panelId = firstQuestion.getAttribute('aria-controls')!
    await user.click(firstQuestion)
    const panel = document.getElementById(panelId)
    expect(panel).not.toHaveAttribute('hidden')
  })

  it('only one answer panel loses hidden when one is open', async () => {
    const user = userEvent.setup()
    render(<FaqPage />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    const panels = document.querySelectorAll('[role="region"]')
    const visiblePanels = Array.from(panels).filter(p => !p.hasAttribute('hidden'))
    expect(visiblePanels).toHaveLength(1)
  })

  it('renders the contact us link at the bottom', () => {
    render(<FaqPage />)
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument()
  })

  it('uses dl/dt/dd semantic structure', () => {
    const { container } = render(<FaqPage />)
    expect(container.querySelector('dl')).toBeInTheDocument()
    expect(container.querySelectorAll('dt').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('dd').length).toBeGreaterThan(0)
  })
})
