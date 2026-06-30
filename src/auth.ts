export type UserRole = 'student' | 'trainer' | 'admin'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

type AuthResponse = {
  user: AuthUser | null
  resetToken?: string
  message?: string
  error?: string
}

async function readJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return {} as AuthResponse
  }

  try {
    return JSON.parse(text) as AuthResponse
  } catch {
    return {
      user: null,
      error: response.ok
        ? 'The server returned an invalid response.'
        : text.slice(0, 180) || 'The server returned an invalid response.',
    }
  }
}

async function requestAuth(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(payload.error || 'Authentication request failed.')
  }

  return payload
}

export async function getCurrentUser() {
  const payload = await requestAuth('/api/auth/me')
  return payload.user
}

export async function logoutUser() {
  await requestAuth('/api/auth/logout', { method: 'POST' })
}

export async function registerUser(input: {
  name: string
  email: string
  password: string
  confirmPassword: string
}) {
  const payload = await requestAuth('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!payload.user) {
    throw new Error('Account was created but no session was returned.')
  }

  return payload.user
}

export async function loginUser(input: { email: string; password: string; role: UserRole }) {
  const payload = await requestAuth('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  if (!payload.user) {
    throw new Error('Login succeeded but no session was returned.')
  }

  return payload.user
}

export async function requestPasswordReset(email: string) {
  const payload = await requestAuth('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  return payload
}

export async function resetPassword(input: {
  email: string
  token: string
  password: string
  confirmPassword: string
}) {
  await requestAuth('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
