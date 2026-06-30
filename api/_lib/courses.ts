import { sql } from '@vercel/postgres'
import { ensureSchema } from './db'

type CourseRow = {
  id: string
  slug: string
  title: string
  subject: 'Mathematics' | 'Programming'
  level: 'Beginner' | 'Intermediate'
  instructor: string
  lessons: number
  duration: string
  description: string
  metadata: unknown
  progress?: number
  enrolled_at?: string
}

function parseMetadata(metadata: unknown) {
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata) as Record<string, unknown>
    } catch {
      return {}
    }
  }

  return metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {}
}

export function toCoursePayload(row: CourseRow) {
  const metadata = parseMetadata(row.metadata)

  return {
    id: row.slug,
    databaseId: row.id,
    title: row.title,
    subject: row.subject,
    level: row.level,
    author: row.instructor,
    lessons: row.lessons,
    duration: row.duration,
    description: row.description,
    icon: String(metadata.icon ?? ''),
    tone: String(metadata.tone ?? 'math'),
    outcomes: Array.isArray(metadata.outcomes) ? metadata.outcomes : [],
    modules: Array.isArray(metadata.modules) ? metadata.modules : [],
    schedule: Array.isArray(metadata.schedule) ? metadata.schedule : [],
    resources: Array.isArray(metadata.resources) ? metadata.resources : [],
    instructor:
      metadata.instructor && typeof metadata.instructor === 'object'
        ? metadata.instructor
        : { name: row.instructor, role: 'Instructor', bio: '' },
    progress: row.progress,
    enrolledAt: row.enrolled_at,
  }
}

export async function getPublishedCourses() {
  await ensureSchema()
  const result = await sql<CourseRow>`
    SELECT id, slug, title, subject, level, instructor, lessons, duration, description, metadata
    FROM courses
    WHERE is_published = TRUE
    ORDER BY created_at ASC
  `

  return result.rows.map(toCoursePayload)
}

export async function getStudentCourses(userId: string) {
  await ensureSchema()
  const result = await sql<CourseRow>`
    SELECT
      courses.id,
      courses.slug,
      courses.title,
      courses.subject,
      courses.level,
      courses.instructor,
      courses.lessons,
      courses.duration,
      courses.description,
      courses.metadata,
      course_enrollments.progress,
      course_enrollments.enrolled_at::text
    FROM course_enrollments
    JOIN courses ON courses.id = course_enrollments.course_id
    WHERE course_enrollments.user_id = ${userId}
      AND courses.is_published = TRUE
    ORDER BY course_enrollments.enrolled_at ASC
  `

  return result.rows.map(toCoursePayload)
}
