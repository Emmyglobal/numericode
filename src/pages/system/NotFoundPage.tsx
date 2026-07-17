import { usePageTitle } from '@/hooks/usePageTitle'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Home } from 'lucide-react'
export default function NotFoundPage() {
  usePageTitle('Page Not Found')
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-bg dark:bg-bg-dark">
      <p className="text-8xl font-bold text-brand-blue/20 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button><Home className="w-4 h-4" />Back to Home</Button></Link>
    </div>
  )
}
