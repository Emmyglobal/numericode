import { randomUUID } from 'node:crypto'
import { enrollUserInPublishedCourses, ensureAuthSchema } from '../_lib/db'
import {
  assertSameOrigin,
  getClientIp,
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
  hashToken,
  normalizeEmail,
  safeUser,
  verifyPassword,
  type UserRole,
} from '../_lib/security'

const maxAttempts = 8
const windowMinutes = 15

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    await ensureAuthSchema()
    const sql = await getSql()
    const body = parseBody<{ email?: string; password?: string; role?: UserRole }>(req)
    const email = normalizeEmail(body.email ?? '')
    const ipAddress = getClientIp(req)

    if (!email || !body.password || !body.role) {
      json(res, 400, { error: 'Email, password, and role are required.' })
      return
    }

    const attempts = await sql<{ count: string }>`
      SELECT COUNT(*)::text AS count
      FROM auth_attempts
      WHERE email = ${email}
        AND ip_address = ${ipAddress}
        AND success = false
        AND created_at > NOW() - (${windowMinutes} || ' minutes')::interval
    `

    if (Number(attempts.rows[0]?.count ?? 0) >= maxAttempts) {
      json(res, 429, { error: 'Too many login attempts. Please wait and try again.' })
      return
    }

    const result = await sql<{
      id: string
      name: string
      email: string
      role: UserRole
      password_hash: string
    }>`
      SELECT id, name, email, role, password_hash
      FROM users
      WHERE email = ${email} AND role = ${body.role}
      LIMIT 1
    `
    const user = result.rows[0]
    const isValid = user ? verifyPassword(body.password, user.password_hash) : false

    await sql`
      INSERT INTO auth_attempts (id, email, ip_address, success)
      VALUES (${randomUUID()}, ${email}, ${ipAddress}, ${isValid})
    `

    if (!user || !isValid) {
      json(res, 401, { error: 'Invalid email, password, or account type.' })
      return
    }

    if (user.role === 'student') {
      await enrollUserInPublishedCourses(user.id)
    }

    await sql`DELETE FROM sessions WHERE user_id = ${user.id} AND expires_at <= NOW()`

    const token = createSessionToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

    await sql`
      INSERT INTO sessions (id, user_id, token_hash, expires_at)
      VALUES (${randomUUID()}, ${user.id}, ${hashToken(token)}, ${expiresAt.toISOString()})
    `

    setSessionCookie(res, token, expiresAt)
    json(res, 200, { user: safeUser(user) })
  } catch (error) {
    console.error('Login failed', error)
    json(res, 503, {
      error: 'Unable to log in. Check POSTGRES_URL and database integration in Vercel Project Settings.',
    })
  }
}
