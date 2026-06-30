import { createUser, enrollUserInPublishedCourses, ensureSchema } from '../_lib/db'
import { assertSameOrigin, json, parseBody, requireMethod, setSessionCookie, type ApiRequest, type ApiResponse } from '../_lib/http'
import { getSql } from '../_lib/postgres'
import { createSessionToken, hashToken, safeUser } from '../_lib/security'
import { randomUUID } from 'node:crypto'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

  try {
    await ensureSchema()
    const body = parseBody<{
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    }>(req)

    if (!body.name || !body.email || !body.password || !body.confirmPassword) {
      json(res, 400, { error: 'Name, email, and password are required.' })
      return
    }

    if (body.password.length < 10) {
      json(res, 400, { error: 'Password must be at least 10 characters.' })
      return
    }

    if (body.password !== body.confirmPassword) {
      json(res, 400, { error: 'Passwords do not match.' })
      return
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'student',
    })
    await enrollUserInPublishedCourses(user.id)

    const token = createSessionToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    const sql = await getSql()

    await sql`
      INSERT INTO sessions (id, user_id, token_hash, expires_at)
      VALUES (${randomUUID()}, ${user.id}, ${hashToken(token)}, ${expiresAt.toISOString()})
    `

    setSessionCookie(res, token, expiresAt)
    json(res, 201, { user: safeUser(user) })
  } catch (error) {
    if (error instanceof Error && error.message.includes('POSTGRES_URL')) {
      json(res, 503, { error: 'Database is not configured. Add POSTGRES_URL in Vercel Project Settings.' })
      return
    }

    const message =
      error instanceof Error && error.message.includes('duplicate')
        ? 'An account already exists for this email.'
        : 'Unable to create account.'
    json(res, 400, { error: message })
  }
}
