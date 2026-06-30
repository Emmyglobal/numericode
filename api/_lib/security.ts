import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'

export type UserRole = 'student' | 'trainer' | 'admin'

export type PublicUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':')

  if (!salt || !hash) {
    return false
  }

  const hashedInput = scryptSync(password, salt, 64)
  const storedBuffer = Buffer.from(hash, 'hex')

  return storedBuffer.length === hashedInput.length && timingSafeEqual(storedBuffer, hashedInput)
}

export function createSessionToken() {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function createResetToken() {
  return randomBytes(16).toString('hex').toUpperCase()
}

export function safeUser(user: {
  id: string
  name: string
  email: string
  role: UserRole
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
