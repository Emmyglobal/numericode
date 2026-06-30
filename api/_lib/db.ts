import { sql } from '@vercel/postgres'
import { randomUUID } from 'node:crypto'
import { courseSeeds } from './course-data'
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

  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id UUID PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      subject TEXT NOT NULL CHECK (subject IN ('Mathematics', 'Programming')),
      level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate')),
      instructor TEXT NOT NULL,
      lessons INTEGER NOT NULL CHECK (lessons > 0),
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS title TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS lessons INTEGER`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS description TEXT`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique ON courses (slug)`

  await sql`
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, course_id)
    )
  `

  await sql`ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0`
  await sql`ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS course_enrollments_user_course_unique
    ON course_enrollments (user_id, course_id)
  `

  try {
    await seedCourses()
  } catch {
    // Course seeding should not prevent auth from working. The courses API will
    // surface its own error if the database needs a manual migration.
  }
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

export async function seedCourses() {
  for (const course of courseSeeds) {
    await sql`
      INSERT INTO courses (
        id,
        slug,
        title,
        subject,
        level,
        instructor,
        lessons,
        duration,
        description,
        metadata
      )
      VALUES (
        ${randomUUID()},
        ${course.slug},
        ${course.title},
        ${course.subject},
        ${course.level},
        ${course.instructor},
        ${course.lessons},
        ${course.duration},
        ${course.description},
        ${JSON.stringify(course.metadata)}::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        subject = EXCLUDED.subject,
        level = EXCLUDED.level,
        instructor = EXCLUDED.instructor,
        lessons = EXCLUDED.lessons,
        duration = EXCLUDED.duration,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `
  }
}

export async function enrollUserInPublishedCourses(userId: string) {
  try {
    const courses = await sql<{ id: string }>`
      SELECT id FROM courses WHERE is_published = TRUE
    `

    for (const course of courses.rows) {
      await sql`
        INSERT INTO course_enrollments (id, user_id, course_id)
        VALUES (${randomUUID()}, ${userId}, ${course.id})
        ON CONFLICT (user_id, course_id) DO NOTHING
      `
    }
  } catch {
    // A student account should still be usable even if course enrollment needs
    // deployment/database attention.
  }
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
