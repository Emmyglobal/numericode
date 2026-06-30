import { sql } from '@vercel/postgres'
import { ensureSchema } from '../_lib/db'
import {
  assertSameOrigin,
  json,
  parseBody,
  requireMethod,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http'
import { hashPassword, hashToken, normalizeEmail } from '../_lib/security'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    await ensureSchema()
    const body = parseBody<{
      email?: string
      token?: string
      password?: string
      confirmPassword?: string
    }>(req)
    const email = normalizeEmail(body.email ?? '')

    if (!email || !body.token || !body.password || !body.confirmPassword) {
      json(res, 400, { error: 'Email, token, and new password are required.' })
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

    const reset = await sql<{ id: string; user_id: string }>`
      SELECT password_reset_tokens.id, password_reset_tokens.user_id
      FROM password_reset_tokens
      JOIN users ON users.id = password_reset_tokens.user_id
      WHERE users.email = ${email}
        AND password_reset_tokens.token_hash = ${hashToken(body.token.trim().toUpperCase())}
        AND password_reset_tokens.expires_at > NOW()
        AND password_reset_tokens.used_at IS NULL
      LIMIT 1
    `

    if (!reset.rows[0]) {
      json(res, 400, { error: 'Reset token is invalid or expired.' })
      return
    }

    await sql`
      UPDATE users
      SET password_hash = ${hashPassword(body.password)}, updated_at = NOW()
      WHERE id = ${reset.rows[0].user_id}
    `
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ${reset.rows[0].id}
    `
    await sql`DELETE FROM sessions WHERE user_id = ${reset.rows[0].user_id}`

    json(res, 200, { ok: true })
  } catch {
    json(res, 500, { error: 'Unable to reset password.' })
  }
}
