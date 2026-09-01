import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Alert } from '@/components/ui/Alert'
import { quizzesService, type Quiz, type QuizQuestion, type QuizResult } from '@/services/quizzes.service'
import { cn } from '@/utils/classNames'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

type Phase = 'info' | 'taking' | 'result'

interface LessonQuizProps {
  quiz: Quiz
}

/**
 * Sample-style quiz the student takes inside a lesson. Radio (lettered) options,
 * a progress bar, a submit button that unlocks once every question is answered,
 * and a scored result with correct/incorrect highlighting plus retry.
 */
export function LessonQuiz({ quiz }: LessonQuizProps) {
  const [phase, setPhase] = useState<Phase>('info')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const answeredCount = questions.filter(q => {
    const v = answers[q.id]
    if (q.questionType === 'multiple_choice') return Array.isArray(v) && v.length > 0
    return typeof v === 'string' && v.trim() !== ''
  }).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length
  const attemptsUsed = quiz.attemptCount ?? 0
  const attemptsLeft = Math.max(0, quiz.maxAttempts - attemptsUsed)

  const startAttempt = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await quizzesService.startAttempt(quiz.id)
      setQuestions(data.questions)
      setAnswers({})
      setSubmitted(false)
      setResult(null)
      setPhase('taking')
    } catch (err: any) {
      setError(err?.message ?? 'Could not start the quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitAttempt = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await quizzesService.submitAttempt(quiz.id, answers)
      setResult(res)
      setSubmitted(true)
      setPhase('result')
    } catch (err: any) {
      setError(err?.message ?? 'Could not submit your answers')
    } finally {
      setLoading(false)
    }
  }

  const retry = async () => {
    setResult(null)
    setSubmitted(false)
    await startAttempt()
  }

  const handleAnswer = (questionId: string, answer: unknown) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  /** Correct option ids for a question, from the options payload (isCorrect flags). */
  const correctOptionIds = (q: QuizQuestion): string[] => {
    if (Array.isArray(q.options)) {
      return (q.options as Array<{ id: string; isCorrect: boolean }>)
        .filter(o => o.isCorrect)
        .map(o => o.id)
    }
    return []
  }

  const isQuestionRight = (q: QuizQuestion): boolean | null => {
    if (q.questionType === 'multiple_choice') {
      const correct = correctOptionIds(q)
      const selected = Array.isArray(answers[q.id]) ? answers[q.id] as string[] : []
      return correct.length > 0 && correct.length === selected.length && correct.every(id => selected.includes(id))
    }
    if (q.questionType === 'true_false') {
      const correct = correctOptionIds(q)
      if (correct.length === 0) return null
      return correct.includes(String(answers[q.id]))
    }
    // fill_blank / essay are not auto-graded client-side
    return null
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark overflow-hidden">
      {/* ── Info / start phase ─────────────────────────────────────────── */}
      {phase === 'info' && (
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{quiz.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                                {(quiz.timeLimit ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" /> {quiz.timeLimit} min
                  </span>
                )}
                <span>{quiz.questionCount || questions.length || 0} questions</span>
                <span>Pass: {quiz.passingScore}%</span>
                <span>Attempts used: {attemptsUsed}/{quiz.maxAttempts}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={startAttempt}
              loading={loading}
              disabled={attemptsUsed >= quiz.maxAttempts}
              className="shrink-0"
            >
              {attemptsUsed >= quiz.maxAttempts ? 'Completed' : 'Start Quiz'}
            </Button>
          </div>
          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}
        </div>
      )}

      {/* ── Taking phase ─────────────────────────────────────────────── */}
      {phase === 'taking' && (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title}</h3>
            <Button variant="ghost" size="sm" onClick={() => { setPhase('info') }}>
              Quit
            </Button>
          </div>
          <ProgressBar
            value={(answeredCount / Math.max(1, questions.length)) * 100}
            className="mb-5"
            label={`${answeredCount}/${questions.length} answered`}
          />

          <div className="space-y-6">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-3">
                  <span className="text-brand-blue font-bold mr-2">Q{i + 1}.</span>
                  {q.questionText}
                </p>

                {q.questionType === 'multiple_choice' && Array.isArray(q.options) && (
                  <div className="space-y-2">
                    {(q.options as Array<{ id: string; text: string }>).map((opt, oi) => {
                      const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.id)
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-2.5 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors',
                            selected
                              ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20 text-brand-blue'
                              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          )}
                        >
                          <input
                            type="radio"
                            name={`quiz-q-${q.id}`}
                            className="accent-brand-blue"
                            checked={selected}
                            onChange={() => handleAnswer(q.id, [opt.id])}
                          />
                          <span className="font-bold w-4">{LETTERS[oi]}</span>
                          <span>{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {q.questionType === 'true_false' && (
                  <div className="flex gap-3">
                    {['true', 'false'].map(value => (
                      <button
                        key={value}
                        onClick={() => handleAnswer(q.id, value)}
                        className={cn(
                          'flex-1 p-3 rounded-lg border text-sm font-medium transition-colors',
                          answers[q.id] === value
                            ? 'border-brand-blue bg-brand-light text-brand-blue dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        )}
                      >
                        {value === 'true' ? 'True' : 'False'}
                      </button>
                    ))}
                  </div>
                )}

                {q.questionType === 'fill_blank' && (
                  <input
                    type="text"
                    value={(answers[q.id] as string) || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                )}

                {q.questionType === 'essay' && (
                  <textarea
                    value={(answers[q.id] as string) || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    rows={4}
                    placeholder="Write your answer..."
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={submitAttempt} loading={loading} disabled={!allAnswered}>
              Submit Answers
            </Button>
          </div>
          {error && (
            <div className="mt-4">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}
        </div>
      )}

      {/* ── Result phase ─────────────────────────────────────────────── */}
      {phase === 'result' && result && (
        <div className="p-5">
          <div className="text-center py-4">
            {result.passed ? (
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" aria-hidden="true" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto text-red-500 mb-3" aria-hidden="true" />
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {result.passed ? 'Congratulations, you passed!' : 'Quiz not passed'}
            </h3>
            <p className="text-gray-500 mb-4 text-sm">
              {result.passed
                ? 'Great job! Keep up the good work.'
                : "Don't worry — review the lesson and try again."}
            </p>
            <div className="inline-flex flex-col items-center rounded-lg bg-gray-50 dark:bg-gray-800 px-5 py-3">
              <span className="text-3xl font-bold text-brand-blue">{Math.round(result.score)}%</span>
              <span className="text-xs text-gray-500">Passing: {result.passingScore}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Earned {result.earnedPoints} of {result.totalPoints} points
            </p>
            {!result.passed && (
              <div className="mt-4 flex justify-center">
                <Button onClick={retry} loading={loading} disabled={attemptsLeft === 0}>
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Per-question review with correct/incorrect highlighting */}
          <div className="mt-6 space-y-4">
            {questions.map((q, i) => {
              const right = isQuestionRight(q)
              const correctIds = correctOptionIds(q)
              return (
                <div key={q.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      <span className="text-brand-blue font-bold mr-2">Q{i + 1}.</span>
                      {q.questionText}
                    </p>
                    {right === true && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" aria-label="Correct" />}
                    {right === false && <XCircle className="w-5 h-5 text-red-600 shrink-0" aria-label="Incorrect" />}
                  </div>

                  {q.questionType === 'multiple_choice' && Array.isArray(q.options) && (
                    <div className="mt-3 space-y-1.5">
                      {(q.options as Array<{ id: string; text: string; isCorrect: boolean }>).map((opt, oi) => {
                        const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.id)
                        return (
                          <div
                            key={opt.id}
                            className={cn(
                              'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                              opt.isCorrect
                                ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200'
                                : selected
                                  ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                            )}
                          >
                            <span className="font-bold w-4">{LETTERS[oi]}</span>
                            <span>{opt.text}</span>
                            {opt.isCorrect && <span className="ml-auto text-xs font-medium">Correct</span>}
                            {selected && !opt.isCorrect && <span className="ml-auto text-xs font-medium">Your answer</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.questionType === 'true_false' && (
                    <div className="mt-3 flex gap-2 text-sm">
                      {['true', 'false'].map(v => {
                        const isCorrect = correctIds.includes(v)
                        const selected = answers[q.id] === v
                        return (
                          <span
                            key={v}
                            className={cn(
                              'rounded-lg border px-3 py-1.5 capitalize',
                              isCorrect
                                ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200'
                                : selected
                                  ? 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
                                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                            )}
                          >
                            {v}
                            {isCorrect && <span className="ml-2 text-xs font-medium">Correct</span>}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
