import { http, HttpResponse } from 'msw'
import { coursesData } from '@/mocks/data/courses.data'
import { assignmentsData } from '@/mocks/data/assignments.data'
import { announcementsData } from '@/mocks/data/announcements.data'
import { quizzes, attempts } from './quizzes.handlers'

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

// Build the student grade book from the live in-memory quiz attempts and
// assignment submissions, so freshly-taken quizzes and submitted/graded
// assignments always show up with their real scores.
function buildGradeBook() {
  return enrolledCourses.map(course => {
    const courseQuizzes = quizzes.filter(q => q.courseId === course.id)
    const courseAssignments = assignmentsData.filter(a => a.courseId === course.id)

    const quizEntries = courseQuizzes.map(q => {
      const done = attempts.filter(a => a.quizId === q.id && a.completed)
      const best = done.length > 0 ? Math.max(...done.map(a => a.score)) : null
      return {
        quizId: q.id,
        title: q.title,
        score: best,
        passed: done.some(a => a.score >= q.passingScore),
        attemptCount: done.length,
        passingScore: q.passingScore,
        written: done.length > 0,
      }
    })

    const assignmentEntries = courseAssignments.map(a => {
      const graded = a.score !== null && ['graded', 'passed', 'failed'].includes(a.status)
      return {
        assignmentId: a.id,
        title: a.title,
        status: a.status,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.score === null || a.totalMarks === 0
          ? null
          : Math.round((a.score / a.totalMarks) * 100),
        submitted: a.status !== 'pending',
        written: graded,
      }
    })

    const percentages: number[] = [
      ...quizEntries.filter(e => e.score !== null).map(e => e.score as number),
      ...assignmentEntries.filter(e => e.percentage !== null).map(e => e.percentage as number),
    ]
    const finalPercentage = percentages.length > 0
      ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
      : 0
    const letterGrade = finalPercentage >= 70 ? 'A'
      : finalPercentage >= 60 ? 'B'
        : finalPercentage >= 50 ? 'C'
          : finalPercentage >= 45 ? 'D'
            : 'F'

    return {
      courseId: course.id,
      courseTitle: course.title,
      completed: finalPercentage >= 70,
      finalPercentage,
      letterGrade,
      quizzes: quizEntries,
      assignments: assignmentEntries,
    }
  })
}

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

  // Grade book — drives certificate eligibility. Every entry carries the
  // itemised scores shown on the student grade screen: EVERY quiz (best attempt)
  // and assignment in that course, computed from live attempts/submissions.
  http.get('/api/gradebook', () => HttpResponse.json({ success: true, data: buildGradeBook() })),

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
