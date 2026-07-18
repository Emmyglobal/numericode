import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export interface CourseFormValues {
  title: string
  description: string
  subject: 'mathematics' | 'programming'
  level: 'beginner' | 'intermediate' | 'advanced'
  outcomes: string[]
  instructorId?: string
  accessLevel: 'free' | 'premium'
  priceCents: number
  currency: string
  premiumEnabled: boolean
}

interface TrainerOption { id: string; name: string; email: string }

interface CourseFormModalProps {
  /** When provided, shows an "Assign Instructor" dropdown — used by Admin, omitted for Trainer */
  trainers?: TrainerOption[]
  initialValues?: Partial<CourseFormValues>
  isEdit?: boolean
  isSubmitting?: boolean
  error?: string
  onClose: () => void
  onSubmit: (values: CourseFormValues) => void
}

const defaultValues: CourseFormValues = {
  title: '', description: '', subject: 'mathematics', level: 'beginner', outcomes: [], instructorId: '', accessLevel: 'free', priceCents: 0, currency: 'NGN', premiumEnabled: true,
}

export function CourseFormModal({
  trainers, initialValues, isEdit, isSubmitting, error, onClose, onSubmit,
}: CourseFormModalProps) {
  const [values, setValues] = useState<CourseFormValues>({ ...defaultValues, ...initialValues })
  const [outcomesText, setOutcomesText] = useState((initialValues?.outcomes ?? []).join('\n'))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    function onEscape(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [onClose])

  const modalTitle = trainers
    ? (isEdit ? 'Edit Course & Assign Instructor' : 'Create Course & Assign Instructor')
    : (isEdit ? 'Edit Course' : 'Create New Course')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!values.title.trim())       errs.title = 'Title is required'
    if (!values.description.trim()) errs.description = 'Description is required'
    if (trainers && !values.instructorId) errs.instructorId = 'Please select an instructor'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    onSubmit({
      ...values,
      outcomes: outcomesText.split('\n').map(o => o.trim()).filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="course-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{error}</p>}

        <form onSubmit={handleSubmit} aria-label="Course form" className="space-y-4">
          <Input
            label="Course Title"
            value={values.title}
            error={fieldErrors.title}
            onChange={e => setValues(v => ({ ...v, title: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="course-description" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Description <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="course-description" rows={3}
              value={values.description}
              onChange={e => setValues(v => ({ ...v, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue focus:shadow-focus resize-none"
            />
            {fieldErrors.description && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{fieldErrors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-subject" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subject</label>
              <select
                id="course-subject"
                value={values.subject}
                onChange={e => setValues(v => ({ ...v, subject: e.target.value as CourseFormValues['subject'] }))}
                className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="mathematics">Mathematics</option>
                <option value="programming">Programming</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-level" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Level</label>
              <select
                id="course-level"
                value={values.level}
                onChange={e => setValues(v => ({ ...v, level: e.target.value as CourseFormValues['level'] }))}
                className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {trainers && <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label htmlFor="course-access" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Access</label><select id="course-access" value={values.accessLevel} onChange={event => setValues(value => ({ ...value, accessLevel: event.target.value as 'free' | 'premium' }))} className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue"><option value="free">Free</option><option value="premium">Premium</option></select></div>
            <Input label="Price (minor units)" type="number" min="0" value={values.priceCents} disabled={values.accessLevel === 'free'} onChange={event => setValues(value => ({ ...value, priceCents: Number(event.target.value) || 0 }))} />
          </div>}

          {trainers && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="course-instructor" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Assign Instructor <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="course-instructor"
                value={values.instructorId}
                onChange={e => setValues(v => ({ ...v, instructorId: e.target.value }))}
                className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue"
              >
                <option value="">Select a trainer…</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
              </select>
              {fieldErrors.instructorId && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{fieldErrors.instructorId}</p>}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="course-outcomes" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Learning Outcomes <span className="text-gray-400 font-normal">(one per line)</span>
            </label>
            <textarea
              id="course-outcomes" rows={3}
              value={outcomesText}
              onChange={e => setOutcomesText(e.target.value)}
              placeholder={'Master arithmetic operations\nSolve algebraic equations'}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue focus:shadow-focus resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={isSubmitting} className="flex-1">
              {isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
