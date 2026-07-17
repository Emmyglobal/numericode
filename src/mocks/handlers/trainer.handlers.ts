import { http, HttpResponse } from 'msw'
import { trainerStats, trainerCourses, trainerStudents, trainerSessions, trainerAssignments } from '@/mocks/data/trainer.data'

let courses = [...trainerCourses]

export const trainerHandlers = [
  http.get('/api/trainer/stats',       () => HttpResponse.json({ success: true, data: trainerStats })),
  http.get('/api/trainer/courses',     () => HttpResponse.json({ success: true, data: courses })),
  http.get('/api/trainer/students',    () => HttpResponse.json({ success: true, data: trainerStudents })),
  http.get('/api/trainer/sessions',    () => HttpResponse.json({ success: true, data: trainerSessions })),
  http.get('/api/trainer/assignments', () => HttpResponse.json({ success: true, data: trainerAssignments })),

  http.post('/api/trainer/courses', async ({ request }) => {
    const body = await request.json() as { title: string; subject: string; level: string }
    const newCourse = {
      id: `c-${Date.now()}`, title: body.title, subject: body.subject as 'mathematics'|'programming',
      level: body.level as 'beginner'|'intermediate'|'advanced', status: 'draft' as const,
      enrolledCount: 0, lessonCount: 0, completionRate: 0, createdAt: new Date().toISOString(),
    }
    courses = [newCourse, ...courses]
    return HttpResponse.json({ success: true, data: newCourse }, { status: 201 })
  }),

  http.put('/api/trainer/courses/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<{ title: string; subject: string; level: string }>
    courses = courses.map(c => c.id === params.id ? { ...c, ...body } as typeof c : c)
    const updated = courses.find(c => c.id === params.id)
    return HttpResponse.json({ success: true, data: updated })
  }),

  http.patch('/api/trainer/courses/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: string }
    courses = courses.map(c => c.id === params.id ? { ...c, status: body.status as typeof c.status } : c)
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.status } })
  }),
]
