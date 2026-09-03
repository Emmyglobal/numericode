import { useState } from 'react'
import { X, Upload, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/classNames'
import type { Assignment, AssignmentAnswer, AssignmentQuestion } from '@/features/assignments/types'

/** Statuses that mean the student has already handed the work in. */
const COMPLETED_STATUSES = ['submitted', 'under_review', 'graded', 'passed', 'failed']

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function QuestionCard({
  question, index, answer, readonly, onSelect, onText, onFile,
}: {
  question: AssignmentQuestion
  index: number
  answer?: AssignmentAnswer
  readonly: boolean
  onSelect: (questionId: string, selectedIndex: number) => void
  onText: (questionId: string, text: string) => void
  onFile: (questionId: string, fileName: string) => void
}) {
  return (
    <div className='rounded-xl border border-gray-200 dark:border-gray-700 p-4'>
      <p className='mb-1 font-medium text-gray-900 dark:text-white'>
        <span className='text-brand-blue font-bold mr-1.5'>Q{index + 1}.</span>
        {question.title}
        <span className='ml-2 text-xs font-normal text-gray-500'>({question.marks} marks)</span>
      </p>

      {question.type === 'mcq' && Array.isArray(question.options) && (
        <div className='mt-3 space-y-2'>
          {question.options.map((option, oi) => {
            const selected = answer?.selectedIndex === oi
            return (
              <label
                key={oi}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors',
                  selected
                    ? 'border-brand-blue bg-brand-light text-brand-blue dark:bg-blue-900/20'
                    : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300',
                  !readonly && 'cursor-pointer hover:border-gray-300'
                )}
              >
                <input
                  type='radio'
                  name={`assignment-q-${question.id}`}
                  className='accent-brand-blue'
                  disabled={readonly}
                  checked={selected}
                  onChange={() => onSelect(question.id, oi)}
                />
                <span className='font-bold w-4'>{LETTERS[oi]}</span>
                <span>{option}</span>
              </label>
            )
          })}
        </div>
      )}

      {(question.type === 'theory' || question.type === 'subjective' || question.type === 'related') &&
        (readonly ? (
          <p className='mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
            {answer?.answer || <span className='text-gray-400'>No written answer was provided.</span>}
          </p>
        ) : (
          <textarea
            rows={4}
            value={answer?.answer ?? ''}
            onChange={e => onText(question.id, e.target.value)}
            placeholder='Type your answer...'
            className='mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-surface-dark dark:text-gray-100'
          />
        ))}

      {question.type === 'file' && (
        <div className='mt-3'>
          {readonly ? (
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {answer?.fileName
                ? <>Submitted file: <span className='font-medium'>{answer.fileName}</span></>
                : 'No file was attached.'}
            </p>
          ) : (
            <label className='flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 text-sm text-gray-600 hover:border-brand-blue transition-colors dark:border-gray-600 dark:text-gray-400'>
              <Upload className='h-4 w-4 shrink-0' aria-hidden='true' />
              {answer?.fileName
                ? <span className='font-medium text-brand-blue'>{answer.fileName}</span>
                : <span>Choose a file{question.allowedFileTypes?.length ? ` (${question.allowedFileTypes.join(', ')})` : ''}</span>}
              <input
                type='file'
                className='sr-only'
                accept={question.allowedFileTypes?.map(t => `.${t}`).join(',')}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) onFile(question.id, file.name)
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

export function AssignmentDetailModal({
  assignment, submitting, submitError, onClose, onSubmit,
}: {
  assignment: Assignment
  submitting?: boolean
  submitError?: string
  onClose: () => void
  onSubmit: (answers: AssignmentAnswer[]) => void
}) {
  const readonly = COMPLETED_STATUSES.includes(assignment.status)
  const questions = assignment.questions ?? []
  const previousAnswers = assignment.answers ?? []
  const [answers, setAnswers] = useState<Record<string, AssignmentAnswer>>({})

  const answerFor = (q: AssignmentQuestion): AssignmentAnswer | undefined =>
    readonly
      ? previousAnswers.find(a => a.questionId === q.id)
      : answers[q.id]

  const setAnswer = (questionId: string, patch: Partial<AssignmentAnswer>) =>
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...patch, questionId } }))

  const currentAnswers = (): AssignmentAnswer[] =>
    questions.map(q => answers[q.id]).filter((a): a is AssignmentAnswer => Boolean(a))

  const allAnswered = questions.length > 0 && questions.every(q => {
    const a = readonly ? previousAnswers.find(x => x.questionId === q.id) : answers[q.id]
    if (!a) return false
    if (q.type === 'mcq') return typeof a.selectedIndex === 'number'
    if (q.type === 'file') return Boolean(a.fileName || a.fileData)
    return typeof a.answer === 'string' && a.answer.trim() !== ''
  })

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} aria-hidden='true' />
      <div
        role='dialog' aria-modal='true' aria-labelledby='assignment-detail-title'
        className='relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6'
      >
        <div className='sticky top-0 -mx-6 -mt-6 px-6 py-4 bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 z-10 flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-xs font-medium text-brand-blue'>{assignment.courseTitle}</p>
            <h2 id='assignment-detail-title' className='text-lg font-bold text-gray-900 dark:text-white'>{assignment.title}</h2>
            <p className='mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500'>
              Due <time dateTime={assignment.dueDate}>{formatDate(assignment.dueDate)}</time>
              · {assignment.totalMarks} marks · passing {assignment.passingScore}
              <Badge variant={assignment.status}>{assignment.status}</Badge>
            </p>
          </div>
          <button onClick={onClose} className='rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' aria-label='Close modal'>
            <X className='h-4 w-4' aria-hidden='true' />
          </button>
        </div>

        <div className='p-4 space-y-4'>
          {submitError && <Alert type='error' message={submitError} />}
          {assignment.description && (
            <p className='text-sm text-gray-600 dark:text-gray-400'>{assignment.description}</p>
          )}

          {assignment.score !== null && (
            <div
              className={cn(
                'flex items-center gap-3 rounded-xl p-4',
                assignment.score >= assignment.passingScore
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              )}
            >
              {assignment.score >= assignment.passingScore
                ? <CheckCircle className='h-6 w-6 shrink-0 text-green-600' aria-hidden='true' />
                : <XCircle className='h-6 w-6 shrink-0 text-red-500' aria-hidden='true' />}
              <div>
                <p className='font-semibold text-gray-900 dark:text-white'>
                  Score: {assignment.score}/{assignment.totalMarks}
                </p>
                {assignment.feedback && (
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{assignment.feedback}</p>
                )}
              </div>
            </div>
          )}

          {questions.length > 0 ? (
            questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                answer={answerFor(q)}
                readonly={readonly}
                onSelect={(id, selectedIndex) => setAnswer(id, { selectedIndex })}
                onText={(id, text) => setAnswer(id, { answer: text })}
                onFile={(id, fileName) => setAnswer(id, { fileName })}
              />
            ))
          ) : (
            <p className='text-sm text-gray-500'>No questions have been added to this assignment yet.</p>
          )}
        </div>

        <div className='sticky bottom-0 -mx-6 -mb-6 mt-6 px-6 py-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3'>
          <div className='text-xs text-gray-500'>{questions.length} questions</div>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={onClose}>{readonly ? 'Close' : 'Cancel'}</Button>
            {!readonly && (
              <Button onClick={() => onSubmit(currentAnswers())} loading={submitting} disabled={!allAnswered}>
                Submit Answers
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
