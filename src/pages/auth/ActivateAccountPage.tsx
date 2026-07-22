import { usePageTitle } from '@/hooks/usePageTitle'
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'

export default function ActivateAccountPage() {
  usePageTitle('Activate Account')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid or missing activation token.')
      return
    }

    const activate = async () => {
      try {
        const res = await authService.activateAccount({ token })
        setStatus('success')
        setMessage(res.message || 'Account activated successfully!')
      } catch (e: unknown) {
        setStatus('error')
        setMessage(e instanceof Error ? e.message : 'Activation failed. The link may have expired.')
      }
    }

    activate()
  }, [token])

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6 text-center">
      {status === 'loading' && (
        <div className="py-8 space-y-4">
          <Loader2 className="w-14 h-14 text-brand-blue animate-spin mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activating your account…</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we activate your account.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-4 space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Account Activated!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          <Link to="/login" className="block">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-4 space-y-4">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Activation Failed</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          <Link to="/login" className="block">
            <Button variant="secondary" className="w-full">Go to Login</Button>
          </Link>
        </div>
      )}
    </div>
  )
}