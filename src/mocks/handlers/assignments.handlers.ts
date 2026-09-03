import { http, HttpResponse } from 'msw'
import { assignmentsData, mockAssignmentDraft, relatedMaterials, type MockRelatedMaterial } from '@/mocks/data/assignments.data'
import { trainerAssignments } from '@/mocks/data/trainer.data'
import type { Assignment, AssignmentAnswer, AssignmentQuestion, AssignmentSubmission } from '@/features/assignments/types'

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
    const assignment = findOrFail(assignmentsData, String(params.id)) as (Assignment & { answers?: AssignmentAnswer[] }) | null
    if (!assignment) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as { answers?: AssignmentAnswer[]; content?: string; fileName?: string | null; fileData?: string | null }
    const answers = body.answers ?? []
    assignment.answers = answers

    // Auto-grade every question whose answer is machine-checkable (MCQ), and
    // record the submission so the score shows up in the assignment list and
    // the grade book. Mixed/written/file submissions are kept for the trainer.
    const onlyAutoGradable = assignment.questions.length > 0 && assignment.questions.every(q => q.type === 'mcq')
    let earned = 0
    for (const q of assignment.questions) {
      if (q.type !== 'mcq' || typeof q.correctOptionIndex !== 'number') continue
      const answer = answers.find(a => a.questionId === q.id)
      if (answer?.selectedIndex === q.correctOptionIndex) earned += q.marks
    }

    const overdue = new Date(assignment.dueDate) < new Date()
    assignment.status = onlyAutoGradable
      ? (earned >= assignment.passingScore ? 'passed' : 'failed')
      : (overdue ? 'overdue' : 'submitted')
    assignment.score = onlyAutoGradable ? earned : null
    assignment.feedback = onlyAutoGradable ? null : assignment.feedback ?? null

    return HttpResponse.json({ success: true, data: {
      id: `${assignment.id}-submission`,
      status: assignment.status,
      submittedAt: new Date().toISOString(),
      score: assignment.score,
      totalMarks: assignment.totalMarks,
      percentage: assignment.score === null || assignment.totalMarks === 0
        ? null
        : Math.round((assignment.score / assignment.totalMarks) * 100),
    } })
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
  http.patch('/api/trainer/submissions/:id', async ({ params, request }) => {
    const body = await request.json() as { score?: number; feedback?: string }
    const submissionId = String(params.id)
    const assignment = assignmentsData.find(a => `${a.id}-submission` === submissionId)

    let status = 'graded'
    if (assignment) {
      if (typeof body.score === 'number') {
        assignment.score = Math.max(0, Math.min(Number(body.score), assignment.totalMarks))
        assignment.feedback = body.feedback ?? assignment.feedback ?? null
        assignment.status = assignment.score >= assignment.passingScore ? 'passed' : 'failed'
        status = assignment.status
      } else if (body.feedback !== undefined) {
        assignment.feedback = body.feedback
      }
    }

    return HttpResponse.json({ success: true, data: {
      id: submissionId, score: assignment?.score ?? body.score ?? null,
      feedback: assignment?.feedback ?? body.feedback ?? '', status,
    } })
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