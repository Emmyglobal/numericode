import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore, type AuthUserWithRole } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function GoogleCallbackPage() {
  usePageTitle('Signing in…')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setToken = useAuthStore(s => s.setToken)
  const login = useAuthStore(s => s.login)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      navigate('/login?error=google_no_token', { replace: true })
      return
    }

    // Store the token first so the axios interceptor can use it for the /me request
    setToken(token)

    // Fetch the full user profile using the token
    authService.getCurrentUser()
      .then(user => {
        login(user as AuthUserWithRole, token)
        // Role-based redirect
        if (user.role === 'trainer') navigate('/trainer', { replace: true })
        else if (user.role === 'admin') navigate('/admin', { replace: true })
        else navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        setError('Failed to complete Google sign-in. Please try again.')
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      })
  }, [searchParams, setToken, login, navigate])

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-light dark:bg-blue-900/20 flex items-center justify-center mx-auto">
        <div className="w-7 h-7 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {error ? 'Sign-in failed' : 'Finishing sign-in…'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {error || 'We\'re setting up your account…'}
        </p>
      </div>
    </div>
  )
}
