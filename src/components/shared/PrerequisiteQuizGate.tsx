import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Alert } from '@/components/ui/Alert'
import { quizzesService, type QuizQuestion, type QuizResult } from '@/services/quizzes.service'
import { cn } from '@/utils/classNames'
import { CheckCircle, XCircle, Lock } from 'lucide-react'
import type { PrerequisiteQuiz } from '@/features/courses/types'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

interface PrerequisiteQuizGateProps {
  quiz: PrerequisiteQuiz
  /** Called when the student passes; parent should refetch the course to unlock it. */
  onPassed: () => void
}

type Phase = 'info' | 'taking' | 'result'

/**
 * Course-level prerequisite gate. Rendered by CourseViewerPage INSTEAD of the
 * lesson content while course.prerequisiteQuiz.isPrerequisiteQuizPassed is
 * false. Passing calls onPassed() so the viewer refetches and unlocks.
 */
export function PrerequisiteQuizGate({ quiz, onPassed }: PrerequisiteQuizGateProps) {
  const [phase, setPhase] = useState<Phase>('info')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const answeredCount = questions.filter(q => (answers[q.id]?.length ?? 0) > 0).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const startAttempt = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await quizzesService.startAttempt(quiz.id)
      setQuestions(data.questions)
      setAnswers({})
      setResult(null)
      setPhase('taking')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the prerequisite quiz')
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
      setPhase('result')
      if (res.passed) onPassed()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your answers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-10" aria-label="Prerequisite quiz">
      {/* Gate header */}
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1">
        <Lock className="w-4 h-4" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">Prerequisite required</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{quiz.title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Pass this quiz with at least {quiz.passingScore}% to unlock the lessons in this course.
      </p>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* ── Info / start phase ─────────────────────────────────────────────── */}
      {phase === 'info' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4">
            <span>{quiz.passingScore}% to pass</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{quiz.description}</p>
          <Button onClick={startAttempt} loading={loading}>Start Prerequisite Quiz</Button>
        </div>
      )}

      {/* ── Taking phase ───────────────────────────────────────────────────── */}
      {phase === 'taking' && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <ProgressBar
            value={(answeredCount / Math.max(1, questions.length)) * 100}
            className="mb-5"
            label={`${answeredCount}/${questions.length} answered`}
          />
          <div className="space-y-6">
            {questions.map((q, i) => (
              <fieldset key={q.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <legend className="px-1 font-medium text-gray-900 dark:text-white text-sm">
                  <span className="text-brand-blue font-bold mr-2">Q{i + 1}.</span>
                  {q.questionText}
                </legend>
                {q.questionType === 'multiple_choice' && Array.isArray(q.options) && (
                  <div className="mt-3 space-y-2">
                    {(q.options as Array<{ id: string; text: string }>).map((opt, oi) => {
                      const selected = (answers[q.id] ?? []).includes(opt.id)
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-2.5 p-2.5 rounded-lg border text-sm cursor-pointer transition-colors',
                            selected
                              ? 'border-brand-blue bg-brand-light/60 dark:bg-blue-900/30 text-brand-blue dark:text-blue-200'
                              : 'border-gray-200 dark:border-gray-700 hover:border-brand-blue/50',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              setAnswers(prev => {
                                const current = prev[q.id] ?? []
                                return e.target.checked
                                  ? { ...prev, [q.id]: [...current, opt.id] }
                                  : { ...prev, [q.id]: current.filter(id => id !== opt.id) }
                              })
                            }}
                          />
                          <span className="font-bold w-4">{LETTERS[oi]}</span>
                          <span>{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </fieldset>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setPhase('info')}>Quit</Button>
            <Button onClick={submitAttempt} loading={loading} disabled={!allAnswered}>
              Submit Answers
            </Button>
          </div>
        </div>
      )}

      {/* ── Result phase ───────────────────────────────────────────────────── */}
      {phase === 'result' && result && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark p-5">
          <div className="text-center py-4">
            {result.passed
              ? <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-3" aria-hidden="true" />
              : <XCircle className="w-16 h-16 mx-auto text-red-500 mb-3" aria-hidden="true" />}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {result.passed ? 'Prerequisite passed!' : 'Not passed yet'}
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              You scored {Math.round(result.score)}% (pass mark {quiz.passingScore}%).
            </p>
            <p className="text-xs text-gray-400">
              Earned {result.earnedPoints} of {result.totalPoints} points
            </p>

            {!result.passed && (
              <div className="mt-4 flex justify-center">
                <Button onClick={startAttempt} loading={loading} variant="secondary">
                  Try Again
                </Button>
              </div>
            )}
            {result.passed && (
              <p className="text-xs text-gray-500 mt-3" role="status">Unlocking your course…</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

