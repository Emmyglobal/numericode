import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/utils'
import PaymentCallbackPage from '@/pages/public/PaymentCallbackPage'

/**
 * Phase 20 regression: /payment/callback is a private post-payment route and
 * must never be indexable (it is also disallowed in public/robots.txt).
 */
describe('Payment callback page (SEO + public behaviour)', () => {
  it('renders the missing-reference state without calling the API', () => {
    render(<PaymentCallbackPage />)
    expect(screen.getByRole('heading', { name: /missing payment reference/i })).toBeInTheDocument()
  })

  it('marks the page as noindex so search engines never index the payment return URL', () => {
    // The hook injects the tag into <head> without removing it on unmount, so
    // clear any tag left over from another test before asserting.
    document.head.querySelectorAll('meta[name="robots"]').forEach(el => el.remove())
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull()

    render(<PaymentCallbackPage />)

    const meta = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    expect(meta).not.toBeNull()
    expect(meta?.getAttribute('content')).toContain('noindex')
  })
})