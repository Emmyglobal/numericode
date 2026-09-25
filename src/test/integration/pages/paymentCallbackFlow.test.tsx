import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { render } from '@/test/utils'
import PaymentCallbackPage from '@/pages/public/PaymentCallbackPage'
import { paymentsService } from '@/services/payments.service'
import { useAuthStore } from '@/store/authStore'

// ─── Phase 21 — provider-neutral payment callback states ──────────────────────
// The URL (Flutterwave's ?status=successful&tx_ref=… or Paystack's ?reference=…)
// only tells the page WHAT to check. Every state below comes from the BACKEND
// status endpoint — never from the query string.

vi.mock('@/services/payments.service', () => ({
  paymentsService: {
    initiate: vi.fn(),
    getStatus: vi.fn(),
  },
}))

const student = { id: 's1', name: 'Test Student', email: 's@test.com', createdAt: '2024-01-01', role: 'student' as const }

function renderCallback(search: string) {
  return render(
    <Routes>
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      <Route path="/courses/:id" element={<p>Course landing</p>} />
    </Routes>,
    { routerProps: { initialEntries: [`/payment/callback${search}`] } },
  )
}

const baseStatus = {
  reference: 'NCP-1',
  status: 'verified' as const,
  amountSubunits: 50000,
  currency: 'NGN',
  course: { id: 'c1', title: 'Advanced Algebra' },
  enrollmentGranted: true,
  failureReason: null as string | null,
  paidAt: '2026-09-24T10:00:00.000Z',
  createdAt: '2026-09-24T09:59:00.000Z',
}

describe('PaymentCallbackPage — provider-neutral verified/pending/failed states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: student, token: 'tok', isAuthenticated: true })
  })

  it("reads Flutterwave's tx_ref and asks the BACKEND for the verified status", async () => {
    vi.mocked(paymentsService.getStatus).mockResolvedValue({ ...baseStatus })
    renderCallback('?status=successful&tx_ref=NCP-1&transaction_id=12345')
    await waitFor(() => expect(screen.getByRole('heading', { name: /payment successful/i })).toBeInTheDocument())
    // The backend is the source of truth — asked with OUR reference from tx_ref.
    expect(paymentsService.getStatus).toHaveBeenCalledWith('NCP-1')
    expect(screen.getByText(/you’re enrolled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start course/i })).toHaveAttribute('href', '/dashboard/courses/c1')
  })

  it('never claims success from the URL alone when the backend cannot verify', async () => {
    vi.mocked(paymentsService.getStatus).mockRejectedValue(new Error('Route Error (500): internal detail'))
    renderCallback('?status=successful&tx_ref=NCP-1&transaction_id=12345')
    // The page retries once (retry: 1) before surfacing the error state — and at
    // no point does it claim success from the URL alone.
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /could not verify payment/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    expect(screen.queryByText(/you’re enrolled/i)).not.toBeInTheDocument()
    // No backend/provider internals are leaked to the page.
    expect(document.body.textContent).not.toMatch(/internal detail/)
    expect(document.body.textContent).not.toMatch(/FLW|SECRET|sk_/)
  })

  it('shows the pending (processing) state while verification is in flight', async () => {
    vi.mocked(paymentsService.getStatus).mockResolvedValue({ ...baseStatus, status: 'pending', enrollmentGranted: false, paidAt: null })
    renderCallback('?tx_ref=NCP-1')
    await waitFor(() => expect(screen.getByRole('heading', { name: /payment processing/i })).toBeInTheDocument())
    expect(screen.queryByRole('link', { name: /start course/i })).not.toBeInTheDocument()
  })

  it('shows "Try Payment Again" when the payment failed', async () => {
    vi.mocked(paymentsService.getStatus).mockResolvedValue({
      ...baseStatus, status: 'failed', enrollmentGranted: false,
      failureReason: 'Provider reported a failed charge',
    })
    renderCallback('?tx_ref=NCP-1')
    await waitFor(() => expect(screen.getByRole('heading', { name: /payment failed/i })).toBeInTheDocument())
    expect(screen.getByText(/Provider reported a failed charge/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /try payment again/i })).toHaveAttribute('href', '/courses/c1')
  })

  it('shows the cancelled state with a retry path for abandoned checkouts', async () => {
    vi.mocked(paymentsService.getStatus).mockResolvedValue({
      ...baseStatus, status: 'abandoned', enrollmentGranted: false,
      failureReason: 'Checkout abandoned',
    })
    renderCallback('?tx_ref=NCP-1')
    await waitFor(() => expect(screen.getByRole('heading', { name: /payment cancelled/i })).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /try payment again/i })).toHaveAttribute('href', '/courses/c1')
  })
})
