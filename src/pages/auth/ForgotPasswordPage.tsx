import { usePageTitle } from '@/hooks/usePageTitle'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { authService } from '@/services/auth.service'

export default function ForgotPasswordPage() {
  usePageTitle('Forgot Password')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    await authService.forgotPassword(email).catch(() => {})
    setLoading(false); setSent(true)
  }
  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-lg p-8 space-y-6">
      {sent ? (
        <div className="text-center py-4 space-y-4">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your inbox</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
          <Link to="/login" className="block"><Button variant="secondary" className="w-full">Back to Login</Button></Link>
        </div>
      ) : (
        <>
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your email and we'll send a reset link.</p></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            <Button type="submit" size="lg" loading={loading} className="w-full">Send Reset Link</Button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400"><Link to="/login" className="text-brand-blue hover:underline">Back to login</Link></p>
        </>
      )}
    </div>
  )
}
