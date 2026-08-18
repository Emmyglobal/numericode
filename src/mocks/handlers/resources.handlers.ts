import { http, HttpResponse } from 'msw'
import { coursesData } from '@/mocks/data/courses.data'
import type { ResourceType } from '@/features/resources/types'

interface MockResource {
  id: string
  lessonId: string
  lessonTitle: string
  courseId: string
  courseTitle: string
  title: string
  type: ResourceType
  url: string
}

// Flatten every mock course → module → lesson into the trainer lesson list,
// so the trainer's lesson picker works while developing against the mocks.
const mockLessons = coursesData.flatMap(course =>
  (course.modules ?? []).flatMap(module =>
    module.lessons.map(lesson => ({
      id: lesson.id, title: lesson.title, moduleTitle: module.title,
      courseId: course.id, courseTitle: course.title,
    }))
  )
)

function lookupLesson(lessonId: string) {
  const lesson = mockLessons.find(l => l.id === lessonId)
  return lesson ?? { id: lessonId, title: 'Lesson', moduleTitle: 'Module', courseId: '', courseTitle: 'Course' }
}

let mockResources: MockResource[] = [
  {
    id: 'res1', lessonId: 'l1', lessonTitle: 'Introduction to Numbers',
    courseId: 'c1', courseTitle: 'Foundation Mathematics',
    title: 'Number Systems PDF', type: 'pdf', url: '#',
  },
  {
    id: 'res2', lessonId: 'l8', lessonTitle: 'What is JavaScript?',
    courseId: 'c2', courseTitle: 'JavaScript for Beginners',
    title: 'Variables Cheatsheet', type: 'pdf', url: '#',
  },
]

async function createMockResource(request: Request): Promise<MockResource> {
  const form = await request.formData()
  const lessonId = String(form.get('lessonId') || '')
  const title = String(form.get('title') || '')
  const type = (String(form.get('type') || 'file')) as ResourceType
  const url = String(form.get('url') || '')
  const file = form.get('file') as File | null
  const lesson = lookupLesson(lessonId)
  const created: MockResource = {
    id: `res-${Date.now()}`,
    lessonId,
    lessonTitle: lesson.title,
    courseId: lesson.courseId,
    courseTitle: lesson.courseTitle,
    title,
    type,
    // Simulate a persistent file URL for uploads (mirrors backend /uploads).
    url: file ? `https://numerycode-api.onrender.com/uploads/${file.name}` : url,
  }
  mockResources = [created, ...mockResources]
  return created
}

export const resourcesHandlers = [
  http.get('/api/resources', () => HttpResponse.json({ success: true, data: mockResources })),

  http.post('/api/resources', async ({ request }) => {
    const created = await createMockResource(request)
    return HttpResponse.json({ success: true, data: created }, { status: 201 })
  }),

  http.delete('/api/resources/:id', ({ params }) => {
    mockResources = mockResources.filter(r => r.id !== params.id)
    return HttpResponse.json({ success: true, data: { id: params.id } })
  }),

  http.get('/api/admin/resources', () => HttpResponse.json({ success: true, data: mockResources })),

  http.post('/api/admin/resources', async ({ request }) => {
    const created = await createMockResource(request)
    return HttpResponse.json({ success: true, data: created }, { status: 201 })
  }),

  http.delete('/api/admin/resources/:id', ({ params }) => {
    mockResources = mockResources.filter(r => r.id !== params.id)
    return HttpResponse.json({ success: true, data: { id: params.id } })
  }),

  // Trainer lesson picker (used by resources, boards, code editor, …)
  http.get('/api/trainer/lessons', () => HttpResponse.json({ success: true, data: mockLessons })),
]