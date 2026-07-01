import { randomUUID } from 'node:crypto'
import { enrollUserInPublishedCourses, ensureAuthSchema } from '../_lib/db'
import {
  assertSameOrigin,
  json,
  parseBody,
  requireMethod,
  setSessionCookie,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http'
import { getSql } from '../_lib/postgres'
import {
  createSessionToken,
  hashPassword,
  hashToken,
  normalizeEmail,
  safeUser,
} from '../_lib/security'

type RegisterBody = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const sessionMaxAgeMs = 1000 * 60 * 60 * 24 * 7

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    const body = parseBody<RegisterBody>(req)
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = normalizeEmail(body.email ?? '')
    const password = typeof body.password === 'string' ? body.password : ''
    const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : ''

    if (!name || !email || !password || !confirmPassword) {
      json(res, 400, { error: 'Name, email, and password are required.' })
      return
    }

    if (!email.includes('@')) {
      json(res, 400, { error: 'Enter a valid email address.' })
      return
    }

    if (password.length < 10) {
      json(res, 400, { error: 'Password must be at least 10 characters.' })
      return
    }

    if (password !== confirmPassword) {
      json(res, 400, { error: 'Passwords do not match.' })
      return
    }

    await ensureAuthSchema()
    const sql = await getSql()
    const userResult = await sql<{
      id: string
      name: string
      email: string
      role: 'student'
    }>`
      INSERT INTO users (id, name, email, role, password_hash)
      VALUES (${randomUUID()}, ${name}, ${email}, 'student', ${hashPassword(password)})
      RETURNING id, name, email, role
    `
    const user = userResult.rows[0]

    if (!user) {
      json(res, 500, { error: 'Unable to create account.' })
      return
    }

    await enrollUserInPublishedCourses(user.id)

    const token = createSessionToken()
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs)

    await sql`
      INSERT INTO sessions (id, user_id, token_hash, expires_at)
      VALUES (${randomUUID()}, ${user.id}, ${hashToken(token)}, ${expiresAt.toISOString()})
    `

    setSessionCookie(res, token, expiresAt)
    json(res, 201, { user: safeUser(user) })
  } catch (error) {
    console.error('Register failed', error)

    if (error instanceof Error && error.message.includes('POSTGRES_URL')) {
      json(res, 503, {
        error: 'Database is not configured. Add POSTGRES_URL in Vercel Project Settings.',
      })
      return
    }

    if (isDuplicateEmailError(error)) {
      json(res, 409, { error: 'An account already exists for this email.' })
      return
    }

    json(res, 500, {
      error: 'Unable to create account.',
      detail: getPublicErrorDetail(error),
    })
  }
}

function isDuplicateEmailError(error: unknown) {
  const code = getErrorCode(error)
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return (
    code === '23505' ||
    message.includes('duplicate') ||
    message.includes('unique') ||
    message.includes('users_email_key')
  )
}

function getErrorCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return ''
  }

  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? code : ''
}

function getPublicErrorDetail(error: unknown) {
  const code = getErrorCode(error)

  if (code) {
    return `Database error code: ${code}`
  }

  return error instanceof Error ? error.message : 'Unknown server error.'
}
