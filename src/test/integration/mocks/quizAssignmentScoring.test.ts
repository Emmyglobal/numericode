import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { quizzesHandlers } from '@/mocks/handlers/quizzes.handlers'
import { assignmentsHandlers } from '@/mocks/handlers/assignments.handlers'
import { dashboardHandlers } from '@/mocks/handlers/dashboard.handlers'

const server = setupServer(...dashboardHandlers, ...assignmentsHandlers, ...quizzesHandlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const BASE = `${window.location.origin}/api`

async function json(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init)
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

describe('Quiz scoring end-to-end (MSW)', () => {
  it('scores a fully correct attempt at 100 and records it in the gradebook', async () => {
    const start = await json('/quizzes/quizzes/demo-l1-quiz/start', { method: 'POST' })
    expect(start.status).toBe(201)
    const questions = start.body.data.questions as Array<{ id: string; options: Array<{ id: string; isCorrect: boolean }> | null }>
    expect(questions.length).toBe(3)

    const answers: Record<string, string[]> = {}
    for (const q of questions) {
      const correct = (q.options ?? []).filter(o => o.isCorrect).map(o => o.id)
      expect(correct.length).toBeGreaterThan(0)
      answers[q.id] = correct
    }

    const submit = await json('/quizzes/quizzes/demo-l1-quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    expect(submit.status).toBe(200)
    expect(submit.body.data.score).toBe(100)
    expect(submit.body.data.passed).toBe(true)

    // Grade book reflects the recorded attempt
    const gb = await json('/gradebook')
    const c1 = (gb.body.data as any[]).find(g => g.courseId === 'c1')
    const quizEntry = c1.quizzes.find((q: any) => q.quizId === 'demo-l1-quiz')
    expect(quizEntry.score).toBe(100)
    expect(quizEntry.passed).toBe(true)
    expect(quizEntry.attemptCount).toBeGreaterThan(0)
  })

  it('scores a wrong attempt at 0 and marks it not passed', async () => {
    const start = await json('/quizzes/quizzes/demo-l1-quiz/start', { method: 'POST' })
    const questions = start.body.data.questions as Array<{ id: string; options: Array<{ id: string; isCorrect: boolean }> | null }>
    const answers: Record<string, string[]> = {}
    for (const q of questions) {
      const wrong = (q.options ?? []).filter(o => !o.isCorrect)
      answers[q.id] = wrong.length ? [wrong[0].id] : []
    }
    const submit = await json('/quizzes/quizzes/demo-l1-quiz/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    expect(submit.body.data.score).toBe(0)
    expect(submit.body.data.passed).toBe(false)
  })
})
describe('Assignment loading and scoring end-to-end (MSW)', () => {
  it('loads the full assignment detail when clicked', async () => {
    const res = await json('/assignments/a1')
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('a1')
    expect(res.body.data.questions.length).toBeGreaterThan(0)
  })

  it('auto-grades an all-MCQ assignment and records the score', async () => {
    const detail = await json('/assignments/a3')
    const { questions } = detail.body.data
    const answers = questions.map((q: any) => ({ questionId: q.id, selectedIndex: q.correctOptionIndex }))

    const submit = await json('/assignments/a3/submission', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    expect(submit.status).toBe(200)
    expect(submit.body.data.score).toBe(20)
    expect(submit.body.data.totalMarks).toBe(20)
    expect(submit.body.data.percentage).toBe(100)
    expect(['passed', 'failed']).toContain(submit.body.data.status)

    // The assignment list now shows the recorded score
    const list = await json('/assignments')
    const a3 = (list.body.data as any[]).find(a => a.id === 'a3')
    expect(a3.score).toBe(20)
    expect(a3.status).toBe('passed')

    // The grade book reflects it
    const gb = await json('/gradebook')
    const c1 = (gb.body.data as any[]).find(g => g.courseId === 'c1')
    const a3Entry = c1.assignments.find((a: any) => a.assignmentId === 'a3')
    expect(a3Entry.score).toBe(20)
    expect(a3Entry.percentage).toBe(100)
    expect(a3Entry.submitted).toBe(true)
  })

  it('keeps mixed assignments awaiting trainer grade but stores answers', async () => {
    const detail = await json('/assignments/a1')
    const { questions } = detail.body.data
    const answers = questions.map((q: any) =>
      q.type === 'mcq' ? { questionId: q.id, selectedIndex: q.correctOptionIndex } : { questionId: q.id, answer: 'My written answer' })

    const submit = await json('/assignments/a1/submission', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    expect(submit.status).toBe(200)
    expect(['submitted', 'overdue']).toContain(submit.body.data.status)
    expect(submit.body.data.score).toBeNull()

    const list = await json('/assignments')
    const a1 = (list.body.data as any[]).find(a => a.id === 'a1')
    expect(['submitted', 'overdue']).toContain(a1.status)
    expect(a1.answers.length).toBe(questions.length)
  })
})
