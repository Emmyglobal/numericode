import { http, HttpResponse } from 'msw'
import { adminStats, adminUsers, adminCourses, adminAnnouncements } from '@/mocks/data/admin.data'

// Mutable copies so create/update actions persist within a dev session
let users = [...adminUsers]
let courses = [...adminCourses]

export const adminHandlers = [
  http.get('/api/admin/stats', () => HttpResponse.json({ success: true, data: adminStats })),
  http.get('/api/admin/users', () => HttpResponse.json({ success: true, data: users })),

  http.get('/api/admin/trainers', () =>
    HttpResponse.json({
      success: true,
      data: users.filter(u => u.role === 'trainer' && u.status === 'active').map(u => ({ id: u.id, name: u.name, email: u.email })),
    })
  ),

  http.patch('/api/admin/users/:id', async ({ params, request }) => {
    const body = await request.json() as { status?: string }
    users = users.map(u => u.id === params.id ? { ...u, ...body } as typeof u : u)
    const updated = users.find(u => u.id === params.id)
    return HttpResponse.json({ success: true, data: updated })
  }),

  http.get('/api/admin/courses', () => HttpResponse.json({ success: true, data: courses })),

  http.post('/api/admin/courses', async ({ request }) => {
    const body = await request.json() as { title: string; subject: string; level: string; instructorId: string }
    const instructor = users.find(u => u.id === body.instructorId)
    const newCourse = {
      id: `c-${Date.now()}`, title: body.title, subject: body.subject, level: body.level,
      instructor: instructor?.name ?? 'Unknown', status: 'draft' as const,
      enrolledCount: 0, createdAt: new Date().toISOString(),
    }
    courses = [newCourse, ...courses]
    return HttpResponse.json({ success: true, data: newCourse }, { status: 201 })
  }),

  http.patch('/api/admin/courses/:id/status', async ({ params, request }) => {
    const body = await request.json() as { status: string }
    courses = courses.map(c => c.id === params.id ? { ...c, status: body.status as typeof c.status } : c)
    return HttpResponse.json({ success: true, data: { id: params.id, status: body.status } })
  }),

  http.get('/api/admin/announcements', () => HttpResponse.json({ success: true, data: adminAnnouncements })),
  http.post('/api/admin/announcements', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ success: true, data: { id: `an-${Date.now()}`, ...body, createdAt: new Date().toISOString() } }, { status: 201 })
  }),
]
