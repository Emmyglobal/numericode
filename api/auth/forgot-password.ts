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
import { getSql } from '../_lib/postgres'
import { createResetToken, hashToken, normalizeEmail } from '../_lib/security'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    await ensureSchema()
    const sql = await getSql()
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
    let emailWasSent = Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM)

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
      emailWasSent = await sendPasswordResetEmail({ email, token })
    }

    json(res, 200, {
      message: emailWasSent
        ? 'If the email exists, a reset token has been sent.'
        : 'Password reset email delivery is not configured yet. Contact NumeriCode support to reset your password.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : token,
    })
  } catch (error) {
    console.error('Forgot password failed', error)
    json(res, 503, { error: 'Unable to generate a password reset token. Check POSTGRES_URL in Vercel.' })
  }
}
