import type { AuthUser, UserRole } from '../auth'
import { AuthForms } from '../components/auth/AuthForms'

type AuthPageProps = {
  message?: string
  requiredRole?: UserRole
  onAuthSuccess?: (user: AuthUser) => void
}

export function AuthPage({ message, requiredRole, onAuthSuccess }: AuthPageProps) {
  return <AuthForms message={message} requiredRole={requiredRole} onAuthSuccess={onAuthSuccess} />
}
