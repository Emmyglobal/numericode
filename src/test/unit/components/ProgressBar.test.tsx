import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'

describe('ProgressBar component', () => {
  it('renders without a label', () => {
    const { container } = render(<ProgressBar value={50} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows label and percentage when label prop given', () => {
    render(<ProgressBar value={75} label="Progress" />)
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps value to 0 when negative', () => {
    render(<ProgressBar value={-10} label="Test" />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('clamps value to 100 when over 100', () => {
    render(<ProgressBar value={150} label="Test" />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('sets fill width style to 60%', () => {
    const { container } = render(<ProgressBar value={60} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill?.style.width).toBe('60%')
  })

  it('sets fill width to 0% at value 0', () => {
    const { container } = render(<ProgressBar value={0} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill?.style.width).toBe('0%')
  })

  it('sets fill width to 100% at value 100', () => {
    const { container } = render(<ProgressBar value={100} />)
    const fill = container.querySelector('[style*="width"]') as HTMLElement
    expect(fill?.style.width).toBe('100%')
  })
})
