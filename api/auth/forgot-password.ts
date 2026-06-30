import { sql } from '@vercel/postgres'
import { randomUUID } from 'node:crypto'
import { ensureSchema } from '../_lib/db'
import { sendPasswordResetEmail } from '../_lib/email'
import {
  assertSameOrigin,
  json,
  parseBody,
  requireMethod,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http'
import { createResetToken, hashToken, normalizeEmail } from '../_lib/security'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    await ensureSchema()
    const body = parseBody<{ email?: string }>(req)
    const email = normalizeEmail(body.email ?? '')

    if (!email) {
      json(res, 400, { error: 'Email is required.' })
      return
    }

    const user = await sql<{ id: string }>`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `

    const token = createResetToken()
    const expiresAt = new Date(Date.now() + 1000 * 60 * 20)

    if (user.rows[0]) {
      await sql`
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = ${user.rows[0].id}
          AND used_at IS NULL
      `

      await sql`
        INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
        VALUES (${randomUUID()}, ${user.rows[0].id}, ${hashToken(token)}, ${expiresAt.toISOString()})
      `
      await sendPasswordResetEmail({ email, token })
    }

    json(res, 200, {
      message: 'If the email exists, a reset token has been generated.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : token,
    })
  } catch {
    json(res, 500, { error: 'Unable to generate a password reset token.' })
  }
}
