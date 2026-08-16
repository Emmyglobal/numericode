import { useState } from 'react'
import { X, Download, Paperclip, FileText, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatDate'
import { assignmentsService } from '@/services/assignments.service'
import { downloadAssignment, downloadSubmission } from '@/features/assignments/lib/download'
import type { Assignment, AssignmentAnswer } from '@/features/assignments/types'

const typeBadge: Record<string, { label: string; variant: 'pending' | 'submitted' }> = {
  mcq: { label: 'MCQ', variant: 'pending' },
  theory: { label: 'Theory', variant: 'submitted' },
  subjective: { label: 'Subjective', variant: 'submitted' },
  file: { label: 'File', variant: 'pending' },
  related: { label: 'Related', variant: 'pending' },
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
        <div className='p-4 space-y-4'>{assignment.questions?.length > 0 ? <p>Questions will appear here</p> : <p>No questions</p>}</div>
        <div className='sticky bottom-0 -mx-6 -mb-6 mt-6 px-6 py-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3'>
          <div className='text-xs text-gray-500'>{submissionAnswers?.length ?? 0} / {assignment.questions?.length ?? 0} questions answered</div>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit} loading={submitting}>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
