import { http, HttpResponse } from 'msw'

/**
 * Dev-mode AI mocks so the AI buttons in the trainer (and study guide) work
 * without calling the real OpenAI API. In production MSW is stripped out and
 * requests hit the real backend.
 */

let aiCalls = 0

function mockQuizQuestions(topic: string, count: number) {
  const n = Math.min(Math.max(count || 5, 1), 10)
  return Array.from({ length: n }, (_, i) => ({
    questionText: `${i + 1}. ${topic} — sample multiple choice question?`,
    questionType: 'multiple_choice',
    options: [
      { id: 'a', text: 'First option', isCorrect: i % 3 === 0 },
      { id: 'b', text: 'Second option', isCorrect: i % 3 === 1 },
      { id: 'c', text: 'Third option', isCorrect: i % 3 === 2 },
      { id: 'd', text: 'Fourth option', isCorrect: false },
    ],
    correctAnswer: ['a', 'b', 'c'][i % 3],
    points: 1,
    position: i + 1,
  }))
}

export const aiHandlers = [
  http.post('/api/ai/study-guide', async ({ request }) => {
    const body = await request.json() as { message?: string }
    if (!body?.message?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Enter a question of up to 800 characters' }, { status: 400 })
    }
    return HttpResponse.json({
      success: true,
      data: { answer: `Here is a helpful answer about "${body.message}".\n\nIn the live app this comes from the real AI assistant.` },
    })
  }),

  http.post('/api/ai/generate-quiz', async ({ request }) => {
    const body = await request.json() as { topic?: string; questionCount?: number }
    aiCalls += 1
    if (!body?.topic?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Topic is required' }, { status: 400 })
    }
    return HttpResponse.json({
      success: true,
      data: { questions: mockQuizQuestions(body.topic.trim(), body.questionCount ?? 5) },
    })
  }),

  http.post('/api/ai/generate-assignment', async ({ request }) => {
    const body = await request.json() as { topic?: string; level?: string }
    if (!body?.topic?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Topic is required' }, { status: 400 })
    }
    return HttpResponse.json({
      success: true,
      data: {
        title: `Assignment: ${body.topic.trim()}`,
        description: `An assignment about ${body.topic.trim()} for ${body.level || 'beginner'} students.`,
        questions: [
          { id: 'q1', type: 'mcq', title: `1. Which of the following best describes ${body.topic.trim()}?`, marks: 10, options: ['Option A', 'Option B', 'Option C', 'Option D'], correctOptionIndex: 1 },
          { id: 'q2', type: 'theory', title: '2. Explain the key idea in your own words.', marks: 10 },
          { id: 'q3', type: 'subjective', title: '3. Solve the example step by step and show your working.', marks: 20 },
        ],
        aiGenerated: true,
      },
    })
  }),

  http.post('/api/ai/generate-lesson', async ({ request }) => {
    const body = await request.json() as { topic?: string }
    if (!body?.topic?.trim()) {
      return HttpResponse.json({ success: false, data: null, message: 'Topic is required' }, { status: 400 })
    }
    return HttpResponse.json({
      success: true,
      data: { content: `# ${body.topic.trim()}\n\n## Introduction\nThis lesson introduces ${body.topic.trim()} in a friendly, step-by-step way.\n\n## Key Points\n- First key concept\n- Second key concept\n- Practice with examples\n\n## Practice\nTry the exercises and check your answers.` },
    })
  }),

  http.post('/api/ai/generate-note', async ({ request }) => {
    const body = await request.json() as { topic?: string }
    return HttpResponse.json({
      success: true,
      data: { title: `Notes: ${body?.topic?.trim() || 'Topic'}`, content: `Quick reference notes for ${body?.topic?.trim() || 'this topic'}.` },
    })
  }),
]

export { aiCalls }