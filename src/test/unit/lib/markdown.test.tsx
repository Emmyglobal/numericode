import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Markdown } from '@/components/ui/Markdown'

const H = '# Title\n\n## Subtitle'
const BULLETS = '- one\n- two'
const NUMBERED = '1. first\n2. second'
const PARAS = 'hello\n\nworld'

describe('Markdown component', () => {
  it('renders headings at increasing levels', () => {
    render(<Markdown text={H} />)
    expect(screen.getByRole('heading', { name: 'Title', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Subtitle', level: 3 })).toBeInTheDocument()
  })

  it('renders bullet lists', () => {
    render(<Markdown text={BULLETS} />)
    expect(screen.getByText('one')).toBeInTheDocument()
    expect(screen.getByText('two')).toBeInTheDocument()
  })

  it('renders numbered lists', () => {
    render(<Markdown text={NUMBERED} />)
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('renders bold and inline code', () => {
    render(<Markdown text="**bold** and `code`" />)
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('code').tagName).toBe('CODE')
  })

  it('does not execute raw HTML but shows it as plain text', () => {
    render(<Markdown text="<script>alert(1)</script>" />)
    expect(screen.queryByText('alert(1)')).not.toBeInTheDocument()
    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
  })

  it('renders paragraphs separated by blank lines', () => {
    render(<Markdown text={PARAS} />)
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.getByText('world')).toBeInTheDocument()
  })

  it('renders nothing for empty text', () => {
    const { container } = render(<Markdown text="" />)
    expect(container).toBeEmptyDOMElement()
  })
})

