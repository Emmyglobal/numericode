import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { authService } from '@/services/auth.service'
import { useAuthStore, type AuthUserWithRole } from '@/store/authStore'
import { usePageTitle } from '@/hooks/usePageTitle'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  usePageTitle('Log In')
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)
  const [error,  setError]  = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      const res = await authService.login(data)
      login(res.user as AuthUserWithRole, res.token)
      // Role-based redirect
      if (res.user.role === 'trainer') navigate('/trainer')
      else if (res.user.role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (e: unknown) {
      const err = e as { pendingApproval?: boolean; message?: string }
      if (err.pendingApproval) {
        // Redirect to pending approval page
        navigate('/pending-approval')
      } else {
        setError(err.message || 'Invalid email or password')
      }
    }
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to continue learning</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
        <Input
          label="Email Address" type="email" placeholder="you@example.com"
          error={errors.email?.message} autoComplete="email" required
          {...register('email')}
        />
        <div className="space-y-1">
          <Input
            label="Password" type="password" placeholder="••••••••"
            error={errors.password?.message} autoComplete="current-password"
            {...register('password')}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-brand-blue hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Log In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-blue font-medium hover:underline">Register</Link>
      </p>
    </div>
  )
}
