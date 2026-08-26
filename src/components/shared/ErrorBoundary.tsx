import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Optional friendly message shown when the wrapped content fails. */
  fallback?: ReactNode
  /** Optional label used for the h3 heading and the collapsed stack trace. */
  label?: string
}

interface State {
  hasError: boolean
  message?: string
}

/**
 * A small error boundary that isolates a subtree so a runtime error in one
 * component (e.g. the Monaco code editor or a canvas-based lesson board) can
 * never unmount the whole page. Without a boundary, React tears down the
 * entire tree and the user is left staring at a blank/black screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unexpected error' }
  }

  componentDidCatch(error: unknown) {
    // Keep the crash visible in devtools without breaking the UI.
    console.error('[ErrorBoundary]', this.props.label ?? 'component', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback !== undefined) return this.props.fallback

    const label = this.props.label ?? 'This section'
    return (
      <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark p-6 text-center">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label} couldn&apos;t load.</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Something went wrong rendering this section. The rest of the page is unaffected.
          </p>
        </div>
      </div>
    )
  }
}
