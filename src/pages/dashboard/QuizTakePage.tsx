import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { quizzesService, type QuizQuestion, type QuizResult } from '@/services/quizzes.service'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Alert } from '@/components/ui/Alert'
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function QuizTakePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [error, setError] = useState('')

  // Fetch quiz details
  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => quizzesService.get(id!),
    enabled: Boolean(id),
  })

  // Start attempt
  const startMutation = useMutation({
    mutationFn: () => quizzesService.startAttempt(id!),
    onSuccess: (data) => {
      setAttemptId(data.attemptId)
      setQuestions(data.questions)
      if (data.timeLimit) {
        setTimeLeft(data.timeLimit * 60) // convert minutes to seconds
      }
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  // Submit attempt
  const submitMutation = useMutation({
    mutationFn: () => quizzesService.submitAttempt(id!, answers),
    onSuccess: (data) => {
      setResult(data)
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && attemptId && !submitMutation.isSuccess) {
      submitMutation.mutate()
    }
  }, [timeLeft])

  const handleAnswer = useCallback((questionId: string, answer: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }, [])

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit your answers?')) {
      submitMutation.mutate()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show result screen
  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          {result.passed ? (
            <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
          ) : (
            <XCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
          )}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {result.passed ? 'Congratulations! You Passed!' : 'Quiz Not Passed'}
          </h2>
          <p className="text-gray-500 mb-6">
            {result.passed
              ? 'Great job! You have successfully passed this quiz.'
              : 'Don\'t worry, you can try again.'}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(result.score)}%</p>
              <p className="text-sm text-gray-500">Your Score</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{result.passingScore}%</p>
              <p className="text-sm text-gray-500">Passing Score</p>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            <p>Earned {result.earnedPoints} out of {result.totalPoints} points</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/dashboard/quizzes')}>
              Back to Quizzes
            </Button>
            {!result.passed && (
              <Button onClick={() => { setResult(null); setAttemptId(null); setAnswers({}); startMutation.mutate() }}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading
  if (quizLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Show quiz info / start screen
  if (!attemptId) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title={quiz?.title || 'Quiz'} subtitle={quiz?.description} />

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-surface-dark">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quiz Information</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            {quiz?.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Time Limit: {quiz.timeLimit} minutes</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Questions: {quiz?.questionCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Passing Score: {quiz?.passingScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Max Attempts: {quiz?.maxAttempts}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/dashboard/quizzes')}>
              Cancel
            </Button>
            <Button onClick={() => startMutation.mutate()} loading={startMutation.isPending}>
              Start Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show quiz questions
  return (
    <div className="max-w-3xl mx-auto">
      {/* Timer */}
      {timeLeft !== null && (
        <div className={`sticky top-0 z-10 p-3 rounded-xl mb-4 text-center font-bold text-lg ${
          timeLeft < 60 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          <Clock className="w-5 h-5 inline mr-2" />
          Time Remaining: {formatTime(timeLeft)}
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-surface-dark">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Question {index + 1}
              <span className="text-sm font-normal text-gray-500 ml-2">({question.points} pts)</span>
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{question.questionText}</p>

            {question.questionType === 'multiple_choice' && question.options && (
              <div className="space-y-2">
                {(question.options as Array<{ id: string; text: string }>).map((option: { id: string; text: string }) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      (answers[question.id] as string[])?.includes(option.id)
                        ? 'border-brand-blue bg-brand-light dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(answers[question.id] as string[])?.includes(option.id) || false}
                      onChange={(e) => {
                        const current = (answers[question.id] as string[]) || []
                        const updated = e.target.checked
                          ? [...current, option.id]
                          : current.filter(id => id !== option.id)
                        handleAnswer(question.id, updated)
                      }}
                      className="sr-only"
                    />
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      (answers[question.id] as string[])?.includes(option.id)
                        ? 'border-brand-blue bg-brand-blue'
                        : 'border-gray-300'
                    }`}>
                      {(answers[question.id] as string[])?.includes(option.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.questionType === 'true_false' && (
              <div className="flex gap-3">
                {['true', 'false'].map(value => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(question.id, value)}
                    className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors ${
                      answers[question.id] === value
                        ? 'border-brand-blue bg-brand-light text-brand-blue dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {value === 'true' ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            )}

            {question.questionType === 'fill_blank' && (
              <input
                type="text"
                value={(answers[question.id] as string) || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100"
              />
            )}

            {question.questionType === 'essay' && (
              <textarea
                value={(answers[question.id] as string) || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                rows={4}
                placeholder="Write your answer..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit} loading={submitMutation.isPending}>
          Submit Answers
        </Button>
      </div>
    </div>
  )
}