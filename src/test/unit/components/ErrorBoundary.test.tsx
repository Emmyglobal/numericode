import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

// A component that throws during render, simulating the type of crash that
// previously caused the course viewer (and any page using Monaco / a canvas
// board) to unmount the entire React tree and show a blank/black screen.
function Bomber({ boom = false }: { boom?: boolean }) {
  if (boom) throw new Error('simulated Monaco crash')
  return <p>works</p>
}

// Silence the intentional console.error from componentDidCatch.
const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary label="Code editor">
        <Bomber />
      </ErrorBoundary>,
    )
    expect(screen.getByText('works')).toBeTruthy()
  })

  it('contains a render error and shows the fallback instead of unmounting the page', () => {
    render(
      <div>
        <p>survives</p>
        <ErrorBoundary label="Code editor">
          <Bomber boom />
        </ErrorBoundary>
      </div>,
    )
    // Sibling content stays mounted — the crash is contained, not global.
    expect(screen.getByText('survives')).toBeTruthy()
    // Friendly fallback is shown instead of a black screen.
    expect(screen.getByText(/Code editor couldn't load/i)).toBeTruthy()
    expect(screen.getByText(/rest of the page is unaffected/i)).toBeTruthy()
  })

  it('supports a custom fallback node', () => {
    render(
      <ErrorBoundary fallback={<p>custom fallback</p>}>
        <Bomber boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('custom fallback')).toBeTruthy()
  })
})