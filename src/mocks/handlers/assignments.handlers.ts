import { http, HttpResponse } from 'msw'
import { assignmentsData, mockAssignmentDraft, relatedMaterials, type MockRelatedMaterial } from '@/mocks/data/assignments.data'
import { trainerAssignments } from '@/mocks/data/trainer.data'
import type { Assignment, AssignmentQuestion, AssignmentSubmission } from '@/features/assignments/types'

function findOrFail(arr: any[], id: string) {
  const item = arr.find((x: any) => x.id === id)
  if (!item) return null
  return item
}

export const assignmentsHandlers = [
  // Student — assignment detail (full questions/description)
  http.get('/api/assignments/:id', ({ params }) => {
    const assignment = findOrFail(assignmentsData, String(params.id)) as Assignment | null
    if (!assignment) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ success: true, data: assignment })
  }),

  // Student — submit answers (may include MCQ selection, written answer, or file upload)
  http.post('/api/assignments/:id/submission', async ({ params, request }) => {
    const assignment = findOrFail(assignmentsData, String(params.id)) as (Assignment & { answers?: Array<{ questionId: string; selectedIndex?: number; answer?: string; fileName?: string; fileData?: string }> }) | null
    if (!assignment) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as { answers?: Array<{ questionId: string; selectedIndex?: number; answer?: string; fileName?: string; fileData?: string }>; content?: string }
    assignment.answers = body.answers ?? []
    assignment.status = new Date(assignment.dueDate) < new Date() ? 'overdue' : 'submitted'
    return HttpResponse.json({ success: true, data: { id: `${assignment.id}-submission`, status: assignment.status, submittedAt: new Date().toISOString() } })
  }),

  // Trainer — create assignment (typed questions, optionally AI-generated)
  http.post('/api/trainer/assignments', async ({ request }) => {
    const body = await request.json() as {
      courseId?: string; courseTitle?: string; title?: string; dueDate?: string
      totalMarks?: number; passingScore?: number; description?: string; type?: string
      questions?: AssignmentQuestion[]; aiGenerated?: boolean
    }
    const course = findOrFail(
      [
        { id: 'c1', courseTitle: 'Foundation Mathematics' },
        { id: 'c2', courseTitle: 'JavaScript for Beginners' },
        { id: 'c3', courseTitle: 'Algebra & Equations' },
      ],
      String(body.courseId ?? '')
    )
    const created: Assignment = {
      id: `a${Date.now()}`,
      courseId: body.courseId ?? 'c1',
      courseTitle: body.courseTitle ?? course?.courseTitle ?? 'Course',
      title: body.title ?? 'Untitled assignment',
      description: body.description ?? '',
      type: (body.type as Assignment['type']) ?? 'mixed',
      dueDate: body.dueDate ?? new Date().toISOString().slice(0, 10),
      status: 'pending',
      totalMarks: body.totalMarks ?? 20,
      passingScore: body.passingScore ?? 10,
      score: null,
      feedback: null,
      returnedForCorrection: false,
      questions: body.questions ?? [],
      aiGenerated: body.aiGenerated ?? false,
      createdAt: new Date().toISOString(),
    }
    assignmentsData.unshift(created)
    trainerAssignments.unshift({
      id: created.id, courseId: created.courseId, courseTitle: created.courseTitle, title: created.title,
      dueDate: created.dueDate, totalSubmissions: 0, pendingReview: 0, totalMarks: created.totalMarks,
      passingScore: created.passingScore, description: created.description, type: created.type,
      questions: created.questions, aiGenerated: created.aiGenerated, createdAt: created.createdAt ?? '',
    })
    return HttpResponse.json({ success: true, data: created })
  }),

  // Trainer — submissions for an assignment
  http.get('/api/trainer/assignments/:id/submissions', ({ params }) => {
    const assignment = findOrFail(assignmentsData, String(params.id)) as (Assignment & { answers?: Array<{ questionId: string; selectedIndex?: number; answer?: string; fileName?: string; fileData?: string }> }) | null
    const submissions: AssignmentSubmission[] = assignment?.status && ['submitted', 'under_review', 'graded', 'passed', 'failed', 'overdue'].includes(assignment.status)
      ? [
          {
            id: `${assignment.id}-s1`, status: assignment.status, submittedAt: '2026-07-05T09:00:00Z',
            answers: assignment.answers, fileName: assignment.status === 'submitted' ? null : 'answers.pdf',
            content: 'Submitted via the assignment detail view.', totalMarks: assignment.totalMarks,
            passingScore: assignment.passingScore, studentName: 'Kolade Adebayo', studentEmail: 'kolade@gmail.com', score: null, feedback: null,
          },
        ]
      : []
    return HttpResponse.json({ success: true, data: submissions })
  }),

  // Trainer — grade a submission
  http.patch('/api/trainer/submissions/:id', async ({ request }) => {
    const body = await request.json() as { score?: number; feedback?: string }
    return HttpResponse.json({ success: true, data: { id: String(request.url), ...body, status: 'graded' } })
  }),

  // Related materials used by "related" questions / downloads
  http.get('/api/assignments/materials', () =>
    HttpResponse.json({ success: true, data: relatedMaterials as MockRelatedMaterial[] })
  ),

  // AI — generate an assignment draft (structured, creatable)
  http.post('/api/ai/generate-assignment', () =>
    HttpResponse.json({ success: true, data: mockAssignmentDraft })
  ),
]