import { sql } from '@vercel/postgres'
import { randomUUID } from 'node:crypto'
import { hashPassword, normalizeEmail, type UserRole } from './security'

export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('student', 'trainer', 'admin')),
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS auth_attempts (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role: UserRole
}) {
  const email = normalizeEmail(input.email)
  const passwordHash = hashPassword(input.password)

  const result = await sql<{
    id: string
    name: string
    email: string
    role: UserRole
  }>`
    INSERT INTO users (id, name, email, role, password_hash)
    VALUES (${randomUUID()}, ${input.name.trim()}, ${email}, ${input.role}, ${passwordHash})
    RETURNING id, name, email, role
  `

  return result.rows[0]
}

export async function seedAccount(input: {
  name: string
  email: string
  password: string
  role: UserRole
}) {
  const email = normalizeEmail(input.email)
  const passwordHash = hashPassword(input.password)

  await sql`
    INSERT INTO users (id, name, email, role, password_hash)
    VALUES (${randomUUID()}, ${input.name.trim()}, ${email}, ${input.role}, ${passwordHash})
    ON CONFLICT (email) DO NOTHING
  `
}
