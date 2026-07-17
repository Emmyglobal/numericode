import { http, HttpResponse } from 'msw'
import { coursesData } from '@/mocks/data/courses.data'
import { assignmentsData } from '@/mocks/data/assignments.data'
import { announcementsData } from '@/mocks/data/announcements.data'

const enrolledCourses = [
  { ...coursesData[0], progress: 42, enrolledAt: '2024-02-01' },
  { ...coursesData[1], progress: 25, enrolledAt: '2024-02-15' },
]

export const dashboardHandlers = [
  http.get('/api/dashboard', () => HttpResponse.json({ success: true, data: {
    enrolledCount: enrolledCourses.length,
    completedLessons: 12,
    upcomingClassesCount: 3,
    assignmentsDue: assignmentsData.filter(a => a.status === 'pending').length,
    continuelearning: { ...enrolledCourses[0], nextLesson: coursesData[0].modules[0].lessons[2] },
    upcomingClasses: [
      { id: 'lc1', courseTitle: 'Foundation Mathematics', subject: 'mathematics', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', meetUrl: '#', status: 'upcoming' },
      { id: 'lc3', courseTitle: 'JavaScript for Beginners', subject: 'programming', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', meetUrl: '#', status: 'upcoming' },
    ],
    recentAnnouncements: announcementsData.slice(0, 3),
  }})),
  http.get('/api/dashboard/courses', () => HttpResponse.json({ success: true, data: enrolledCourses })),
  http.get('/api/dashboard/courses/:id', ({ params }) => {
    const course = enrolledCourses.find(c => c.id === params.id)
    if (!course) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ success: true, data: course })
  }),
  http.get('/api/assignments', () => HttpResponse.json({ success: true, data: assignmentsData })),
  http.get('/api/announcements', () => HttpResponse.json({ success: true, data: announcementsData })),
  http.get('/api/resources', () => HttpResponse.json({ success: true, data: [
    { id: 'res1', courseId: 'c1', courseTitle: 'Foundation Mathematics', title: 'Number Systems PDF', type: 'pdf', url: '#' },
    { id: 'res2', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'Variables Cheatsheet', type: 'pdf', url: '#' },
    { id: 'res3', courseId: 'c2', courseTitle: 'JavaScript for Beginners', title: 'JS Video Tutorial', type: 'video', url: '#' },
  ]})),
  http.get('/api/live-classes', () => HttpResponse.json({ success: true, data: [
    { id: 'lc1', courseId: 'c1', courseTitle: 'Foundation Mathematics', subject: 'mathematics', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', duration: 60, meetUrl: '#', status: 'upcoming' },
    { id: 'lc3', courseId: 'c2', courseTitle: 'JavaScript for Beginners', subject: 'programming', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', duration: 60, meetUrl: '#', status: 'upcoming' },
  ]})),
  http.get('/api/profile', () => HttpResponse.json({ success: true, data: {
    id: 'u1', name: 'Emmanuel Nwafor', email: 'emmanuel@numericode.com', bio: 'Passionate learner on a journey through mathematics and programming.', createdAt: '2024-01-01'
  }})),
  http.put('/api/profile', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: body })
  }),
]
