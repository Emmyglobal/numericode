import { sql } from '@vercel/postgres'
import { ensureSchema } from './db'
import { hashToken, safeUser, type PublicUser, type UserRole } from './security'

export type ApiRequest = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
  socket?: { remoteAddress?: string }
}

export type ApiResponse = {
  status: (code: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string | string[]) => void
}

const cookieName = 'numericode_session'

export function json(res: ApiResponse, statusCode: number, body: unknown) {
  res.status(statusCode).json(body)
}

export function requireMethod(req: ApiRequest, res: ApiResponse, method: string) {
  if (req.method !== method) {
    json(res, 405, { error: `Method ${req.method} is not allowed.` })
    return false
  }

  return true
}

export function parseBody<T extends Record<string, unknown>>(req: ApiRequest) {
  return (typeof req.body === 'object' && req.body ? req.body : {}) as T
}

export function assertSameOrigin(req: ApiRequest, res: ApiResponse) {
  const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host

  if (!origin || !host) {
    return true
  }

  try {
    const originUrl = new URL(origin)
    if (originUrl.host === host) {
      return true
    }
  } catch {
    json(res, 403, { error: 'Invalid request origin.' })
    return false
  }

  json(res, 403, { error: 'Cross-origin request blocked.' })
  return false
}

export function getClientIp(req: ApiRequest) {
  const forwardedFor = req.headers['x-forwarded-for']
  const value = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor
  return value?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
}

function parseCookieHeader(header: string | string[] | undefined) {
  const value = Array.isArray(header) ? header.join(';') : header
  const cookies = new Map<string, string>()

  value?.split(';').forEach((part) => {
    const [name, ...rest] = part.trim().split('=')
    if (name) {
      cookies.set(name, decodeURIComponent(rest.join('=')))
    }
  })

  return cookies
}

export function getSessionToken(req: ApiRequest) {
  return parseCookieHeader(req.headers.cookie).get(cookieName)
}

export function setSessionCookie(res: ApiResponse, token: string, expiresAt: Date) {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  const cookie = [
    `${cookieName}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    isProduction ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')

  res.setHeader('Set-Cookie', cookie)
}

export function clearSessionCookie(res: ApiResponse) {
  res.setHeader(
    'Set-Cookie',
    `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  )
}

export async function getAuthenticatedUser(req: ApiRequest) {
  await ensureSchema()
  const token = getSessionToken(req)

  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)
  const result = await sql<PublicUser>`
    SELECT users.id, users.name, users.email, users.role
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ${tokenHash}
      AND sessions.expires_at > NOW()
    LIMIT 1
  `

  return result.rows[0] ? safeUser(result.rows[0]) : null
}

export async function requireRole(req: ApiRequest, res: ApiResponse, role: UserRole) {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    json(res, 401, { error: 'Authentication required.' })
    return null
  }

  if (user.role !== role) {
    json(res, 403, { error: `A ${role} account is required.` })
    return null
  }

  return user
}
