import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { authService } from '@/services/auth.service'

export default function ResetPasswordPage() {
  usePageTitle('Reset Password')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({ token, password })
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Password reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invalid Reset Link</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This password reset link is invalid or missing. Please request a new one.
          </p>
        </div>
        <Link to="/forgot-password" className="block">
          <Button variant="secondary" className="w-full">Request New Link</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6">
      {success ? (
        <div className="text-center py-4 space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Password reset successful</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your password has been changed. You can now log in with your new password.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your new password below.</p>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="text-brand-blue hover:underline">Back to login</Link>
          </p>
        </>
      )}
    </div>
  )
}