import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  type AuthUser,
  type UserRole,
} from '../../auth'
import { trackSignupConversion } from '../../analytics'
import { SectionHeading } from '../ui/SectionHeading'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

type AuthFormsProps = {
  message?: string
  requiredRole?: UserRole
  onAuthSuccess?: (user: AuthUser) => void
}

function getInitialMode(): AuthMode {
  const hash = window.location.hash.toLowerCase()

  if (hash.includes('/register')) return 'register'
  if (hash.includes('/forgot')) return 'forgot'
  if (hash.includes('/reset')) return 'reset'
  return 'login'
}

const roleOptions: { label: string; value: UserRole; description: string }[] = [
  {
    label: 'Student',
    value: 'student',
    description: 'Learn courses, join classes, submit work, and track progress.',
  },
  {
    label: 'Trainer',
    value: 'trainer',
    description: 'Manage live classes, resources, grading, and learner support.',
  },
  {
    label: 'Admin',
    value: 'admin',
    description: 'Manage students, trainers, courses, support, and platform operations.',
  },
]

function readFormData(form: HTMLFormElement) {
  const data = new FormData(form)
  return {
    name: String(data.get('name') ?? ''),
    email: String(data.get('email') ?? ''),
    password: String(data.get('password') ?? ''),
    confirmPassword: String(data.get('confirmPassword') ?? ''),
    token: String(data.get('token') ?? ''),
  }
}

export function AuthForms({ message, requiredRole, onAuthSuccess }: AuthFormsProps) {
  const [mode, setMode] = useState<AuthMode>(getInitialMode)
  const [role, setRole] = useState<UserRole>(requiredRole ?? 'student')
  const [status, setStatus] = useState(message ?? '')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const values = readFormData(form)
    setError('')
    setStatus('')

    try {
      if (mode === 'login') {
        const user = await loginUser({ email: values.email, password: values.password, role })
        setStatus(`Welcome back, ${user.name}.`)
        onAuthSuccess?.(user)
        return
      }

      if (mode === 'register') {
        const user = await registerUser({
          name: values.name,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
        setStatus(`Account created for ${user.name}.`)
        trackSignupConversion()
        onAuthSuccess?.(user)
        return
      }

      if (mode === 'forgot') {
        const response = await requestPasswordReset(values.email)
        setMode('reset')
        setStatus(
          response.resetToken
            ? `Reset token generated for local testing: ${response.resetToken}`
            : response.message || 'If the email exists, a reset token has been sent.',
        )
        return
      }

      await resetPassword({
        email: values.email,
        token: values.token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      setMode('login')
      setStatus('Password reset successfully. You can now log in.')
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.')
    }
  }

  return (
    <section className="section auth-section" id="auth">
      <SectionHeading
        title="Role-based authentication"
        description="Sign in as a student, trainer, or admin and access the correct protected workspace."
      />

      <div className="auth-layout">
        <aside className="auth-info">
          <h3>Secure role access</h3>
          <p>
            Students can create accounts here. Trainers and admins sign in with accounts provisioned
            during secure setup, so privileged access is never open to the public.
          </p>
          <div className="compact-list">
            <div>
              <strong>Student</strong>
              <span>Self-registration, course progress, assignments, and live classes.</span>
            </div>
            <div>
              <strong>Trainer</strong>
              <span>Provisioned account, classes, grading, resources, and learner support.</span>
            </div>
            <div>
              <strong>Admin</strong>
              <span>Provisioned account, platform operations, users, courses, and support.</span>
            </div>
          </div>
        </aside>

        <form className="form-card auth-card auth-panel" aria-label="Authentication form" onSubmit={handleSubmit}>
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            {[
              ['login', 'Login'],
              ['register', 'Register'],
              ['forgot', 'Forgot'],
              ['reset', 'Reset'],
            ].map(([value, label]) => (
              <button
                className={mode === value ? 'active' : ''}
                key={value}
                onClick={() => {
                  setMode(value as AuthMode)
                  window.location.hash = `#/auth/${value === 'login' ? '' : value}`.replace(/\/$/, '')
                  setError('')
                  setStatus('')
                }}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          {status && (
            <div className="form-status" role="status">
              {status}
            </div>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          {mode === 'login' && (
            <fieldset className="role-picker">
              <legend>Choose account type</legend>
              {roleOptions.map((option) => (
                <label className={role === option.value ? 'active' : ''} key={option.value}>
                  <input
                    checked={role === option.value}
                    disabled={requiredRole !== undefined && requiredRole !== option.value}
                    name="role"
                    onChange={() => setRole(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    {option.description}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {mode === 'register' && (
            <div className="form-status" role="note">
              Public registration creates Student accounts. Trainer and Admin accounts are created
              through the protected setup process.
            </div>
          )}

          {mode === 'register' && (
            <label>
              Full name
              <input name="name" placeholder="Your full name" required />
            </label>
          )}

          <label>
            Email address
            <input name="email" placeholder="you@numericode.dev" required type="email" />
          </label>

          {mode === 'reset' && (
            <label>
              Reset token
              <input name="token" placeholder="Paste the reset token" required />
            </label>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <label>
              Password
              <input
                minLength={10}
                name="password"
                placeholder="Minimum 10 characters"
                required
                type="password"
              />
            </label>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <label>
              Confirm password
              <input
                name="confirmPassword"
                placeholder="Repeat your password"
                required
                type="password"
              />
            </label>
          )}

          <button className="button button-primary" type="submit">
            {mode === 'login' && 'Log in'}
            {mode === 'register' && 'Create account'}
            {mode === 'forgot' && 'Generate reset token'}
            {mode === 'reset' && 'Reset password'}
          </button>
        </form>
      </div>
    </section>
  )
}
