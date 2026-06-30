import {
  assertSameOrigin,
  clearSessionCookie,
  getSessionToken,
  json,
  requireMethod,
  type ApiRequest,
  type ApiResponse,
} from '../_lib/http'
import { ensureSchema } from '../_lib/db'
import { getSql } from '../_lib/postgres'
import { hashToken } from '../_lib/security'

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (!requireMethod(req, res, 'POST') || !assertSameOrigin(req, res)) return

    await ensureSchema()
    const sql = await getSql()
    const token = getSessionToken(req)

    if (token) {
      await sql`DELETE FROM sessions WHERE token_hash = ${hashToken(token)}`
    }

    clearSessionCookie(res)
    json(res, 200, { ok: true })
  } catch {
    clearSessionCookie(res)
    json(res, 200, { ok: true })
  }
}
