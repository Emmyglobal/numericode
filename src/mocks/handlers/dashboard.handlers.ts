import { http, HttpResponse } from 'msw'
import { coursesData } from '@/mocks/data/courses.data'
import { assignmentsData } from '@/mocks/data/assignments.data'
import { announcementsData } from '@/mocks/data/announcements.data'

const enrolledCourses = [
  { ...coursesData[0], progress: 42, enrolledAt: '2024-02-01' },
  { ...coursesData[1], progress: 25, enrolledAt: '2024-02-15' },
  // Prerequisite-gated course — student must pass its quiz before lessons unlock.
  { ...coursesData.find(c => c.id === 'c-seq')!, progress: 0, enrolledAt: '2024-03-05' },
]

let mockCertificates = [
  {
    id: 'cert1', courseId: 'c1', courseTitle: 'Foundation Mathematics',
    studentName: 'Emmanuel Nwafor', finalPercentage: 92, letterGrade: 'A',
    issuedAt: '2026-07-01', certificateCode: 'NUM-2026-0001',
  },
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
  http.get('/api/live-classes', () => HttpResponse.json({ success: true, data: [
    { id: 'lc1', courseId: 'c1', courseTitle: 'Foundation Mathematics', subject: 'mathematics', title: 'Algebra Q&A Session', date: '2026-07-05T10:00:00', duration: 60, meetUrl: '#', status: 'upcoming' },
    { id: 'lc3', courseId: 'c2', courseTitle: 'JavaScript for Beginners', subject: 'programming', title: 'JavaScript Q&A', date: '2026-07-04T14:00:00', duration: 60, meetUrl: '#', status: 'upcoming' },
  ]})),
  http.get('/api/profile', () => HttpResponse.json({ success: true, data: {
    id: 'u1', name: 'Emmanuel Nwafor', email: 'emmanuel@numerycode.com', bio: 'Passionate learner on a journey through mathematics and programming.', createdAt: '2024-01-01'
  }})),
  http.put('/api/profile', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true, data: body })
  }),

  // Grade book — drives certificate eligibility. Each entry now carries the
// itemised scores shown on the student grade screen: EVERY quiz (best attempt)
// and assignment in that course.
  http.get('/api/gradebook', () => HttpResponse.json({ success: true, data: [
    {
      courseId: 'c1', courseTitle: 'Foundation Mathematics', completed: true, finalPercentage: 92, letterGrade: 'A',
      quizzes: [
        { quizId: 'q1', title: 'Numbers & Arithmetic Quiz', score: 85, passed: true, attemptCount: 2, passingScore: 60 },
        { quizId: 'q2', title: 'Fractions & Decimals Quiz', score: null, passed: false, attemptCount: 0, passingScore: 70 },
      ],
      assignments: [
        { assignmentId: 'a1', title: 'Fractions Worksheet', status: 'graded', score: 18, totalMarks: 20, percentage: 90, submitted: true, written: true },
        { assignmentId: 'a3', title: 'Number Patterns Quiz', status: 'pending', score: null, totalMarks: 100, percentage: null, submitted: true, written: false },
      ],
    },
    {
      courseId: 'c2', courseTitle: 'JavaScript for Beginners', completed: false, finalPercentage: 45, letterGrade: 'D',
      quizzes: [
        { quizId: 'q3', title: 'Functions & Scope Quiz', score: 40, passed: false, attemptCount: 1, passingScore: 50 },
      ],
      assignments: [
        { assignmentId: 'a2', title: 'Build a Calculator', status: 'overdue', score: null, totalMarks: 50, percentage: null, submitted: true, written: false },
      ],
    },
    {
      courseId: 'c-seq', courseTitle: 'Sequences & Series — SS2 Practice', completed: false, finalPercentage: 0, letterGrade: 'F',
      quizzes: [
        { quizId: 'seq-prereq-quiz', title: 'Sequences & Series — SS2 Practice Quiz', score: null, passed: false, attemptCount: 0, passingScore: 60 },
      ],
      assignments: [
        { assignmentId: 'a-seq', title: 'Sequences & Series Assignment', status: 'pending', score: null, totalMarks: 100, percentage: null, submitted: false, written: false },
      ],
    },
  ]})),

  // Certificates
  http.get('/api/certificates/me', () => HttpResponse.json({ success: true, data: mockCertificates })),

  http.post('/api/certificates/courses/:courseId/generate', ({ params }) => {
    const course = coursesData.find(c => c.id === params.courseId)
    if (!course) return new HttpResponse(null, { status: 404 })
    const created = {
      id: `cert-${Date.now()}`, courseId: course.id, courseTitle: course.title,
      studentName: 'Emmanuel Nwafor', finalPercentage: 100, letterGrade: 'A',
      issuedAt: new Date().toISOString().slice(0, 10), certificateCode: `NUM-${Date.now().toString().slice(-8)}`,
    }
    mockCertificates = [created, ...mockCertificates]
    return HttpResponse.json({ success: true, data: created }, { status: 201 })
  }),

  http.get('/api/certificates/verify/:code', ({ params }) => {
    const cert = mockCertificates.find(c => c.certificateCode === String(params.code))
    if (!cert) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ success: true, data: {
      valid: true, studentName: cert.studentName, courseTitle: cert.courseTitle,
      finalPercentage: cert.finalPercentage, letterGrade: cert.letterGrade,
      issuedAt: cert.issuedAt, certificateCode: cert.certificateCode,
    }})
  }),
]
