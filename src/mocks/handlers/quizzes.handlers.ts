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

// Course-level prerequisite quiz for the Sequences & Series course (c-seq).
// Mirrors the seeded backend quiz; lessonId is empty because it gates the whole
// course rather than a single lesson.
const SEQ_QUESTIONS: Array<[string, string[], number]> = [
  ['Find the 10th term of the AP: 3, 7, 11, 15, …', ['36', '39', '43', '40'], 1],
  ['What is the common difference of the AP: 5, 9, 13, 17, …?', ['3', '4', '5', '9'], 1],
  ['Find the sum of the first 15 terms of an AP with a = 4 and d = 3.', ['360', '375', '390', '345'], 1],
  ['An AP has first term 2 and common difference 5. What is the 20th term?', ['95', '97', '102', '92'], 1],
  ['Find the 6th term of the GP: 2, 6, 18, 54, …', ['162', '486', '324', '972'], 1],
  ['What is the common ratio of the GP: 81, 27, 9, 3, …?', ['1/3', '3', '1/9', '1/27'], 0],
  ['Find the sum of the first 5 terms of a GP with a = 3 and r = 2.', ['93', '96', '90', '81'], 0],
  ['Find the sum to infinity of a GP with a = 8 and r = 1/2.', ['4', '8', '16', '32'], 2],
  ['Three numbers in AP have a sum of 27. What is the middle number?', ['8', '9', '10', '13.5'], 1],
  ['Chidi saves ₦500 in the first month and increases his saving by ₦100 every month after. How much has he saved after 12 months?', ['₦12,600', '₦11,600', '₦13,200', '₦12,000'], 0],
  ['If x − 2, x + 1, and 2x + 3 are consecutive terms of an AP, find x.', ['1', '2', '3', '0'], 0],
  ['What is the next term in the sequence: 1, 4, 9, 16, …?', ['20', '25', '21', '24'], 1],
  ['What is the next term in the sequence: 2, 3, 5, 8, 13, …?', ['18', '20', '21', '19'], 2],
  ['How many terms of the AP 2, 5, 8, … must be added to give a sum of 950?', ['22', '25', '28', '20'], 1],
  ['Find the geometric mean of 4 and 16.', ['10', '8', '6', '12'], 1],
  ['Find the arithmetic mean of 12 and 20.', ['16', '15', '18', '14'], 0],
  ['Evaluate: Σ (2n + 1) for n = 1 to 5.', ['30', '33', '35', '40'], 2],
  ['An AP has first term 5 and last term 41 across 10 terms. Find the common difference.', ['3', '4', '5', '3.6'], 1],
  ['How many terms are in the GP: 3, 6, 12, …, 384?', ['7', '8', '9', '6'], 1],
  ['Which of these sequences is geometric?', ['2, 4, 6, 8', '3, 9, 27, 81', '1, 3, 6, 10', '5, 10, 15, 20'], 1],
]
const OPT_IDS = ['a', 'b', 'c', 'd']
const seqPrereqQuiz: MockQuiz = {
  id: 'seq-prereq-quiz', courseId: 'c-seq', lessonId: '',
  title: 'Sequences & Series — SS2 Practice Quiz',
  description: 'Twenty questions covering arithmetic progressions, geometric progressions, sums, means, and sigma notation.',
  timeLimit: 20, passingScore: 60, maxAttempts: 99, shuffleQuestions: false, showResults: true,
  questionCount: SEQ_QUESTIONS.length, attemptCount: 0, createdAt: new Date().toISOString(),
  questions: SEQ_QUESTIONS.map(([text, options, correct], i) => ({
    id: `seq-q${i + 1}`,
    questionText: text,
    questionType: 'multiple_choice' as const,
    options: options.map((text, oi) => ({ id: OPT_IDS[oi], text, isCorrect: oi === correct })),
    correctAnswer: OPT_IDS[correct],
    points: 5,
    position: i + 1,
  })),
}
quizzes = [seqPrereqQuiz, ...quizzes]

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
