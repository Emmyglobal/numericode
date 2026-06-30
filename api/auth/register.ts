import { createHash, randomBytes, randomUUID, scryptSync } from 'node:crypto'

type ApiRequest = {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}

type ApiResponse = {
  status: (statusCode: number) => ApiResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string | string[]) => void
}

type RegisterBody = {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

type StudentUser = {
  id: string
  name: string
  email: string
  role: 'student'
  created_at: string
}

type SqlClient = Awaited<ReturnType<typeof getSql>>

const sessionMaxAgeSeconds = 60 * 60 * 24 * 7

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed.' })
      return
    }

    if (!isSameOrigin(req)) {
      json(res, 403, { error: 'Invalid request origin.' })
      return
    }

    const body = parseBody(req)
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = normalizeEmail(body.email)
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

    const sql = await getSql()
    await ensureRegisterSchema(sql)

    const userResult = await sql<StudentUser>`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (${randomUUID()}, ${name}, ${email}, ${hashPassword(password)}, 'student')
      RETURNING id, name, email, role, created_at
    `
    const user = userResult.rows[0]

    if (!user) {
      json(res, 500, { error: 'Unable to create account.' })
      return
    }

    const token = createSessionToken()
    const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000)

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
      detail: error instanceof Error ? error.message : 'Unknown server error.',
    })
  }
}

function json(res: ApiResponse, statusCode: number, body: unknown) {
  res.setHeader('Content-Type', 'application/json')
  res.status(statusCode).json(body)
}

function parseBody(req: ApiRequest): RegisterBody {
  if (!req.body) return {}

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as RegisterBody
    } catch {
      return {}
    }
  }

  if (typeof req.body === 'object') {
    return req.body as RegisterBody
  }

  return {}
}

function normalizeEmail(email: unknown) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function getHeader(req: ApiRequest, name: string) {
  const headers = req.headers ?? {}
  const value = headers[name] ?? headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value
}

function isSameOrigin(req: ApiRequest) {
  const origin = getHeader(req, 'origin')
  const host = getHeader(req, 'host')

  if (!origin || !host) return true

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

async function getSql() {
  if (!process.env.POSTGRES_URL?.trim()) {
    throw new Error('POSTGRES_URL is not configured for this Vercel deployment.')
  }

  const postgres = await import('@vercel/postgres')
  return postgres.sql
}

async function ensureRegisterSchema(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${key}`
}

function createSessionToken() {
  return randomBytes(32).toString('hex')
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function safeUser(user: StudentUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  }
}

function setSessionCookie(res: ApiResponse, token: string, expiresAt: Date) {
  const cookie = [
    `numericode_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${sessionMaxAgeSeconds}`,
    `Expires=${expiresAt.toUTCString()}`,
  ]

  if (process.env.NODE_ENV === 'production') {
    cookie.push('Secure')
  }

  res.setHeader('Set-Cookie', cookie.join('; '))
}

function isDuplicateEmailError(error: unknown) {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return message.includes('duplicate') || message.includes('unique') || message.includes('users_email_key')
}
