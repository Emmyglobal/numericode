import { courses as fallbackCourses } from './data/courses'
import type { Course } from './types/course'

type CoursesResponse = {
  courses?: Course[]
  error?: string
}

async function requestCourses(path: string) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
  const payload = (await response.json()) as CoursesResponse

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
