import { courses as fallbackCourses } from './data/courses'
import type { Course } from './types/course'

type CoursesResponse = {
  courses?: Course[]
  error?: string
}

async function readJsonResponse(response: Response) {
  const text = await response.text()

  if (!text) {
    return {} as CoursesResponse
  }

  try {
    return JSON.parse(text) as CoursesResponse
  } catch {
    return {
      error: response.ok
        ? 'The server returned an invalid courses response.'
        : text.slice(0, 180) || 'The server returned an invalid courses response.',
    }
  }
}

async function requestCourses(path: string) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(payload.error || 'Unable to load courses.')
  }

  return payload.courses ?? []
}

export async function getPublishedCourses() {
  try {
    const courses = await requestCourses('/api/courses')
    return courses.length > 0 ? courses : fallbackCourses
  } catch {
    return fallbackCourses
  }
}

export async function getMyCourses() {
  return requestCourses('/api/student/courses')
}
