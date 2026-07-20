import { http, HttpResponse } from 'msw'
import { trainerStats, trainerCourses, trainerStudents, trainerSessions, trainerAssignments, trainerNotes } from '@/mocks/data/trainer.data'

let courses = [...trainerCourses]
let sessions = [...trainerSessions]
let notes = [...trainerNotes]

export const trainerHandlers = [
  http.get('/api/trainer/stats',       () => HttpResponse.json({ success: true, data: trainerStats })),
  http.get('/api/trainer/courses',     () => HttpResponse.json({ success: true, data: courses })),
  http.get('/api/trainer/students',    () => HttpResponse.json({ success: true, data: trainerStudents })),
  http.get('/api/trainer/sessions',    () => HttpResponse.json({ success: true, data: sessions })),
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

  // ── Sessions CRUD ──────────────────────────────────────────────────────────
  http.post('/api/trainer/sessions', async ({ request }) => {
    const body = await request.json() as { courseId: string; title: string; date: string; duration?: number; meetUrl?: string }
    const course = courses.find(c => c.id === body.courseId)
    const newSession = {
      id: `lc-${Date.now()}`, courseId: body.courseId, courseTitle: course?.title ?? 'Unknown',
      title: body.title, date: body.date, duration: body.duration ?? 60,
      meetUrl: body.meetUrl ?? '', status: 'scheduled' as const, attendees: 0,
    }
    sessions = [newSession, ...sessions]
    return HttpResponse.json({ success: true, data: newSession }, { status: 201 })
  }),

  http.put('/api/trainer/sessions/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<{ title: string; date: string; duration: number; meetUrl: string; status: string }>
    sessions = sessions.map(s => s.id === params.id ? { ...s, ...body } as typeof s : s)
    const updated = sessions.find(s => s.id === params.id)
    return HttpResponse.json({ success: true, data: updated })
  }),

  http.delete('/api/trainer/sessions/:id', async ({ params }) => {
    sessions = sessions.filter(s => s.id !== params.id)
    return HttpResponse.json({ success: true, data: { deleted: true } })
  }),

  // ── Notes CRUD ─────────────────────────────────────────────────────────────
  http.get('/api/trainer/notes', () => HttpResponse.json({ success: true, data: notes })),

  http.post('/api/trainer/notes', async ({ request }) => {
    const body = await request.json() as { courseId: string; lessonId?: string; title: string; content?: string; isPublished?: boolean }
    const course = courses.find(c => c.id === body.courseId)
    const newNote = {
      id: `n-${Date.now()}`, courseId: body.courseId, lessonId: body.lessonId ?? null,
      title: body.title, content: body.content ?? '', isPublished: body.isPublished ?? true,
      courseTitle: course?.title ?? 'Unknown', lessonTitle: null as string | null,
      creatorName: 'You', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    notes = [newNote, ...notes]
    return HttpResponse.json({ success: true, data: newNote }, { status: 201 })
  }),

  http.put('/api/trainer/notes/:id', async ({ params, request }) => {
    const body = await request.json() as Partial<{ title: string; content: string; lessonId: string; isPublished: boolean }>
    notes = notes.map(n => n.id === params.id ? { ...n, ...body, updatedAt: new Date().toISOString() } as typeof n : n)
    const updated = notes.find(n => n.id === params.id)
    return HttpResponse.json({ success: true, data: updated })
  }),

  http.delete('/api/trainer/notes/:id', async ({ params }) => {
    notes = notes.filter(n => n.id !== params.id)
    return HttpResponse.json({ success: true, data: { deleted: true } })
  }),

  http.get('/api/trainer/notes/courses/:courseId', ({ params }) => {
    const courseNotes = notes.filter(n => n.courseId === params.courseId && n.isPublished)
    return HttpResponse.json({ success: true, data: courseNotes })
  }),
]
