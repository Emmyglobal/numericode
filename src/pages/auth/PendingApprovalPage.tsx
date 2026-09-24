import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Clock, CheckCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'

export default function PendingApprovalPage() {
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    // Get email from localStorage if available
    const storedEmail = localStorage.getItem('pendingApprovalEmail')
    if (storedEmail) setEmail(storedEmail)

    // Countdown timer for resend email
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResendEmail = async () => {
    if (!email || resending || countdown > 0) return
    setResending(true)
    setResendMessage('')
    try {
      // Real API call — re-sends the email-verification link for this address.
      await authService.resendVerification(email)
      setResendMessage('Verification email sent — please check your inbox.')
      setCountdown(30)
    } catch {
      setResendMessage('Could not resend the email right now. Please try again shortly.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-bg-dark px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Account Pending Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account is awaiting admin approval
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Mail className="w-5 h-5 text-brand-blue mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Check your email
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                We've sent a verification link to{' '}
                {email ? (
                  <span className="font-semibold">{email}</span>
                ) : (
                  'your registered email address'
                )}
                . Click the link in that email to verify your address.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                What happens next?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                First, verify your email address via the link we sent. Then an administrator will review your
                registration — you'll be able to log in once your account is approved and your email is verified.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Didn't receive the verification email? Check your spam folder or resend it.
            </p>
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0 || resending || !email}
              className="w-full px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {countdown > 0
                ? `Resend email (${countdown}s)`
                : resending
                  ? 'Sending…'
                  : 'Resend verification email'}
            </button>
            {resendMessage && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400" role="status">{resendMessage}</p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/login"
              className="block text-center text-sm text-brand-blue hover:text-blue-600"
            >
              Return to login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@numerycode.com" className="text-brand-blue hover:underline">
              support@numerycode.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}