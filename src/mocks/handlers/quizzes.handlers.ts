import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/api.types'

/**
 * Dev-mode quiz handlers so the trainer can attach quizzes to lessons and the
 * student can take them inside the course viewer. In production MSW is stripped
 * out and these requests hit the real backend.
 */

interface MockQuiz {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  timeLimit: number
  passingScore: number
  maxAttempts: number
  shuffleQuestions: boolean
  showResults: boolean
  questionCount: number
  attemptCount: number
  createdAt: string
  questions: Array<{
    id: string
    questionText: string
    questionType: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank'
    options: Array<{ id: string; text: string; isCorrect: boolean }> | null
    correctAnswer: string | null
    points: number
    position: number
  }>
}

interface MockAttempt {
  id: string
  quizId: string
  answers: Record<string, unknown>
  completed: boolean
  score: number
}

// Seed one demo lesson quiz (lesson l1) so the feature is visible immediately in dev.
const seedQuestion = (i: number): MockQuiz['questions'][number] => ({
  id: `mq${i}`,
  questionText: `${i + 1}. Sample multiple-choice question for the lesson?`,
  questionType: 'multiple_choice',
  options: [
    { id: 'a', text: 'First answer', isCorrect: false },
    { id: 'b', text: 'Second answer', isCorrect: i % 2 === 0 },
    { id: 'c', text: 'Third answer', isCorrect: i % 2 === 1 },
    { id: 'd', text: 'Fourth answer', isCorrect: false },
  ],
  correctAnswer: i % 2 === 0 ? 'b' : 'c',
  points: 1,
  position: i + 1,
})

let quizzes: MockQuiz[] = [
  {
    id: 'demo-l1-quiz', courseId: 'c1', lessonId: 'l1',
    title: 'Intro to HTML Quiz', description: 'Test your understanding of the lesson.',
    timeLimit: 10, passingScore: 50, maxAttempts: 2, shuffleQuestions: false, showResults: true,
    questionCount: 3, attemptCount: 0, createdAt: new Date().toISOString(),
    questions: [seedQuestion(0), seedQuestion(1), seedQuestion(2)],
  },
]

let attempts: MockAttempt[] = []

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, message: undefined }
}

function quizSummary(q: MockQuiz) {
  const { questions, ...rest } = q
  return rest
}
export const quizzesHandlers = [
  // Student: quizzes attached to a lesson (used by the Course Viewer).
  http.get('/api/quizzes/lessons/:lessonId', ({ params }) => {
    const list = quizzes
      .filter(q => q.lessonId === params.lessonId)
      .map(quizSummary)
    return HttpResponse.json(ok(list))
  }),

  // Student / trainer: quizzes for a course.
  http.get('/api/quizzes/courses/:courseId/quizzes', ({ params }) => {
    const list = quizzes
      .filter(q => q.courseId === params.courseId)
      .map(q => {
        const attemptsForUser = attempts.filter(a => a.quizId === q.id && a.completed).length
        return { ...quizSummary(q), attemptCount: attemptsForUser }
      })
    return HttpResponse.json(ok(list))
  }),

  http.get('/api/quizzes/quizzes/:id', ({ params }) => {
    const quiz = quizzes.find(q => q.id === params.id)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    return HttpResponse.json(ok({ ...quiz, questions: quiz.questions }))
  }),

  // Trainer: create a quiz for a lesson from the course builder.
  http.post('/api/trainer/lessons/:lessonId/quiz', async ({ params, request }) => {
    const body = await request.json() as {
      title?: string; description?: string; passingScore?: number; timeLimit?: number
      questions?: Array<{ questionText: string; questionType: string; options?: unknown; correctAnswer?: string; points?: number; position?: number }>
    }
    if (!body?.title?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Quiz title is required' }, { status: 400 })
    }
    const questions = (body.questions ?? []).map((q, i) => ({
      id: `q${Date.now()}-${i}`,
      questionText: q.questionText || 'Untitled question',
      questionType: (q.questionType === 'true_false' || q.questionType === 'essay' || q.questionType === 'fill_blank' ? q.questionType : 'multiple_choice') as MockQuiz['questions'][number]['questionType'],
      options: Array.isArray(q.options) && (q.options as Array<{ text?: string; id?: string; isCorrect?: boolean }>).length
        ? (q.options as Array<{ text?: string; id?: string; isCorrect?: boolean }>).map((opt, oi) => ({
            id: opt.id || `a${oi}`,
            text: opt.text || '',
            isCorrect: Boolean(opt.isCorrect),
          }))
        : null,
      correctAnswer: q.correctAnswer || null,
      points: q.points || 1,
      position: i + 1,
    }))

    const created: MockQuiz = {
      id: `quiz-${Date.now()}`,
      courseId: 'c1',
      lessonId: String(params.lessonId),
      title: body.title.trim(),
      description: body.description || '',
      timeLimit: body.timeLimit || 0,
      passingScore: body.passingScore ?? 70,
      maxAttempts: 1,
      shuffleQuestions: false,
      showResults: true,
      questionCount: questions.length,
      attemptCount: 0,
      createdAt: new Date().toISOString(),
      questions,
    }
    quizzes = [created, ...quizzes]
    return HttpResponse.json(ok({ id: created.id, title: created.title, lessonId: created.lessonId, questionCount: created.questionCount }), { status: 201 })
  }),

  // Student: start an attempt (questions sent, correct answers hidden).
  http.post('/api/quizzes/quizzes/:quizId/start', ({ params }) => {
    const quiz = quizzes.find(q => q.id === params.quizId)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    const attemptId = `att-${Date.now()}`
    const attemptNumber = attempts.filter(a => a.quizId === quiz.id).length + 1
    return HttpResponse.json(ok({
      attemptId,
      questions: quiz.questions.map(q => ({ ...q, correctAnswer: undefined })),
      timeLimit: quiz.timeLimit || undefined,
      maxAttempts: quiz.maxAttempts,
      attemptNumber,
    }), { status: 201 })
  }),

  // Student: submit an attempt — grade in memory (server does the real grading).
  http.post('/api/quizzes/quizzes/:quizId/submit', async ({ params, request }) => {
    const quiz = quizzes.find(q => q.id === params.quizId)
    if (!quiz) return HttpResponse.json({ success: false, data: null, message: 'Quiz not found' }, { status: 404 })
    const body = await request.json() as { answers?: Record<string, unknown> }
    const answers = body?.answers ?? {}

    let totalPoints = 0
    let earnedPoints = 0
    for (const q of quiz.questions) {
      totalPoints += q.points
      const given = answers[q.id]
      if (q.questionType === 'multiple_choice') {
        const correct = (q.options ?? []).filter(o => o.isCorrect).map(o => o.id)
        const selected = Array.isArray(given) ? given as string[] : []
        if (correct.length && correct.length === selected.length && correct.every(id => selected.includes(id))) earnedPoints += q.points
      } else if (q.questionType === 'true_false' || q.questionType === 'fill_blank') {
        if (String(given ?? '').trim().toLowerCase() === String(q.correctAnswer ?? '').trim().toLowerCase()) earnedPoints += q.points
      }
    }
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    const passed = score >= quiz.passingScore

    attempts.push({ id: `att-${Date.now()}`, quizId: quiz.id, answers, completed: true, score })
    return HttpResponse.json(ok({
      attemptId: `att-${Date.now()}`,
      score,
      passed,
      totalPoints,
      earnedPoints,
      showResults: quiz.showResults,
      passingScore: quiz.passingScore,
    }))
  }),
]
