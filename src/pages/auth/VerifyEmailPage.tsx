import { usePageTitle } from '@/hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

/**
 * Landing page for the verification link emailed at registration
 * (`/verify-email?token=…`). Clicking the link proves the registrant owns the
 * mailbox; the backend then marks the address verified. Admin approval is a
 * separate gate, which the success copy makes explicit.
 */
export default function VerifyEmailPage() {
  usePageTitle('Verify Email')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('This verification link is invalid or missing. Please use the link from the email we sent you.')
      return
    }

    const verify = async () => {
      try {
        const res = await authService.verifyEmail({ token })
        setStatus('success')
        setMessage(res.message || 'Your email address has been verified.')
      } catch (e: unknown) {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Verification failed. The link may have expired.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6 text-center">
      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-14 h-14 text-brand-blue animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email…</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we confirm your email address.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4 space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Email Verified!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            If your account is already approved, you can log in now. Otherwise you'll receive an email as soon as
            an administrator approves it.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4 space-y-4">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verification Failed</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            You can request a new verification link from the login page if you still need to verify your email.
          </p>
          <Link to="/login" className="block">
            <Button variant="secondary" className="w-full">Back to Login</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
