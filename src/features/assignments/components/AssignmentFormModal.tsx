import { useEffect, useState } from 'react'
import { X, Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { aiService } from '@/services/ai.service'
import { QuestionFileUpload } from '@/components/shared/QuestionFileUpload'
import { toAssignmentQuestions, type ImportedQuestion } from '@/utils/questionImport'
import type { AssignmentQuestion, AssignmentType } from '@/features/assignments/types'

export interface AssignmentDraftValues {
  courseId: string
  title: string
  dueDate: string
  totalMarks: number
  passingScore: number
  description: string
  type: AssignmentType
  questions: AssignmentQuestion[]
  aiGenerated: boolean
}

interface AssignmentFormModalProps {
  courses: Array<{ id: string; title: string }>
  isSubmitting?: boolean
  error?: string
  onClose: () => void
  onSubmit: (values: AssignmentDraftValues) => void
}

const questionTypes: Array<{ value: AssignmentQuestion['type']; label: string; hint: string }> = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)', hint: 'Pick one correct option' },
  { value: 'theory', label: 'Theory', hint: 'Short written explanation' },
  { value: 'subjective', label: 'Subjective', hint: 'Extended written answer / problem' },
  { value: 'file', label: 'File Upload', hint: 'Student uploads a file' },
  { value: 'related', label: 'Related', hint: 'References an attached resource/material' },
]

let questionSeq = 0
function newQuestion(type: AssignmentQuestion['type'] = 'theory'): AssignmentQuestion {
  questionSeq += 1
  return {
    id: `local-${Date.now()}-${questionSeq}`,
    type,
    title: '',
    marks: 10,
    options: type === 'mcq' ? ['', ''] : undefined,
    correctOptionIndex: 0,
    allowedFileTypes: type === 'file' ? ['pdf', 'jpg', 'png'] : undefined,
  }
}

const typeOfQuestions = (questions: AssignmentQuestion[]): AssignmentType => {
  const set = new Set(questions.map(q => q.type))
  if (set.size === 1) return Array.from(set)[0] as AssignmentType
  return 'mixed'
}

export function AssignmentFormModal({ courses, isSubmitting, error, onClose, onSubmit }: AssignmentFormModalProps) {
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
  const [totalMarks, setTotalMarks] = useState(20)
  const [passingScore, setPassingScore] = useState(10)
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([newQuestion('theory')])
  const [importedQuestionCount, setImportedQuestionCount] = useState(0)
  const [aiGenerated, setAiGenerated] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [aiOpen, setAiOpen] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiSubject, setAiSubject] = useState('Mathematics')
  const [aiLevel, setAiLevel] = useState('beginner')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  useEffect(() => {
    function onEscape(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [onClose])

  const updateQuestion = (id: string, patch: Partial<AssignmentQuestion>) =>
    setQuestions(qs => qs.map(q => (q.id === id ? { ...q, ...patch } : q)))

  const handleGenerate = async () => {
    if (!aiTopic.trim() || aiLoading) return
    setAiLoading(true); setAiError('')
    try {
      const draft = await aiService.generateAssignment({ topic: aiTopic.trim(), subject: aiSubject, level: aiLevel })
      setTitle(draft.title)
      setDescription(draft.description)
      setQuestions(draft.questions.map(q => ({
        id: q.id, type: q.type, title: q.title, marks: q.marks,
        options: q.options, correctOptionIndex: q.correctOptionIndex,
        allowedFileTypes: q.type === 'file' ? ['pdf', 'jpg', 'png', 'zip'] : undefined,
      })))
      setAiGenerated(true)
      setAiOpen(false)
    } catch (err: any) {
      setAiError(err?.message ?? 'AI generation failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleImported = (imported: ImportedQuestion[]) => {
    const mapped = toAssignmentQuestions(imported)
    setQuestions(mapped)
    setImportedQuestionCount(mapped.length)
    setAiGenerated(false)
  }

  const handleSubmit = () => {
    const errs: Record<string, string> = {}
    if (!courseId) errs.courseId = 'Please choose a course'
    if (!title.trim()) errs.title = 'Title is required'
    if (!dueDate) errs.dueDate = 'Due date is required'
    if (questions.some(q => !q.title.trim())) errs.questions = 'Every question needs text'
    if (questions.some(q => q.type === 'mcq' && (q.options?.length ?? 0) < 2)) errs.questions = 'Each MCQ needs at least two options'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return
    onSubmit({
      courseId, title: title.trim(), dueDate, totalMarks: Number(totalMarks) || 20,
      passingScore: Number(passingScore) || 0, description: description.trim(),
      type: typeOfQuestions(questions), questions, aiGenerated,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title"
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 id="assignment-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">Create Assignment</h2>
            <p className="text-xs text-gray-500">Build MCQ, theory, subjective, file and related questions — or generate with AI.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* AI integration */}
        <div className="mb-5 rounded-xl border border-brand-blue/30 bg-brand-light/40 dark:bg-blue-900/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-blue dark:text-brand-sky">
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Generate assignment with AI
            </div>
            <Button variant="secondary" size="sm" onClick={() => setAiOpen(o => !o)}>
              {aiOpen ? 'Hide AI tools' : 'Open AI tools'}
            </Button>
          </div>

          {aiOpen && (
            <div className="mt-4 space-y-3">
              <Input
                label="Assignment topic" value={aiTopic}
                onChange={e => setAiTopic(e.target.value)} placeholder="e.g. Adding and subtracting fractions"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subject</label>
                  <select value={aiSubject} onChange={e => setAiSubject(e.target.value)} className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100">
                    {['Mathematics', 'Programming', 'Science', 'English', 'General'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Level</label>
                  <select value={aiLevel} onChange={e => setAiLevel(e.target.value)} className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100">
                    {['beginner', 'intermediate', 'advanced'].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
              </div>
              {aiError && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{aiError}</p>}
              <div className="flex items-center gap-2">
                <Button onClick={handleGenerate} loading={aiLoading} disabled={!aiTopic.trim()} size="sm">
                  <Sparkles className="w-4 h-4" aria-hidden="true" /> Generate draft
                </Button>
                <p className="text-xs text-gray-500">Fills the title, description and questions below (you can edit them).</p>
              </div>
            </div>
          )}
        </div>
{/* Basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="assignment-course" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Course <span className="text-red-500">*</span></label>
            <select
              id="assignment-course" value={courseId} onChange={e => setCourseId(e.target.value)}
              className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-blue"
            >
              <option value="">Select a course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            {fieldErrors.courseId && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{fieldErrors.courseId}</p>}
          </div>
          <div className="sm:col-span-2">
            <Input label="Title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Fractions Worksheet" error={fieldErrors.title} />
          </div>
          <Input label="Due date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} error={fieldErrors.dueDate} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Total marks" type="number" min={1} value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} />
            <Input label="Passing score" type="number" min={0} value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="assignment-desc" className="text-sm font-semibold text-gray-700 dark:text-gray-200">Description / instructions</label>
            <textarea id="assignment-desc" rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Instructions for students…"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue resize-none" />
          </div>
        </div>
{/* Question builder */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Questions</h3>
            <Button variant="secondary" size="sm" onClick={() => setQuestions(qs => [...qs, newQuestion('theory')])}>
              <Plus className="w-4 h-4" aria-hidden="true" /> Add question
            </Button>
          </div>
          <div className="mb-4">
            <QuestionFileUpload
              onParsed={handleImported}
              onCleared={() => setImportedQuestionCount(0)}
            />
            {importedQuestionCount > 0 && (
              <p className="mt-2 text-xs text-brand-blue dark:text-brand-sky">
                {importedQuestionCount} question{importedQuestionCount === 1 ? '' : 's'} loaded from the file — edit or remove them below, then publish.
              </p>
            )}
          </div>
          {fieldErrors.questions && <p role="alert" className="text-xs text-red-600 dark:text-red-400 mb-2">{fieldErrors.questions}</p>}
          {!questions.length && <p className="text-sm text-gray-400">No questions yet — add one above.</p>}
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-brand-blue uppercase">Q{qi + 1}</span>
                  <button onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))} aria-label={`Remove question ${qi + 1}`}
                    className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Type</label>
                    <select
                      value={q.type}
                      onChange={e => {
                        const type = e.target.value as AssignmentQuestion['type']
                        updateQuestion(q.id, {
                          type,
                          options: type === 'mcq' ? (q.options?.length ? q.options : ['', '']) : undefined,
                          correctOptionIndex: type === 'mcq' ? (q.correctOptionIndex ?? 0) : undefined,
                          allowedFileTypes: type === 'file' ? (q.allowedFileTypes?.length ? q.allowedFileTypes : ['pdf', 'jpg', 'png']) : undefined,
                        })
                      }}
                      className="h-11 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100"
                    >
                      {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <p className="text-xs text-gray-400">{questionTypes.find(t => t.value === q.type)?.hint}</p>
                  </div>
                  <Input label="Marks" type="number" min={1} value={q.marks} onChange={e => updateQuestion(q.id, { marks: Number(e.target.value) || 1 })} />
                </div>
                <Input
                  label="Question text" value={q.title}
                  onChange={e => updateQuestion(q.id, { title: e.target.value })}
                  placeholder={q.type === 'file' ? 'e.g. Upload a photo of your handwritten solutions…' : q.type === 'related' ? 'e.g. Using the attached diagram, …' : 'Write the question…'}
                  required
                />
{q.type === 'mcq' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Options</label>
                    {(q.options ?? []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio" name={`correct-${q.id}`} checked={q.correctOptionIndex === oi}
                          onChange={() => updateQuestion(q.id, { correctOptionIndex: oi })}
                          aria-label={`Mark option ${oi + 1} as correct`} className="accent-brand-blue"
                        />
                        <input
                          value={opt} placeholder={`Option ${oi + 1}`}
                          onChange={e => updateQuestion(q.id, { options: (q.options ?? []).map((x, i) => i === oi ? e.target.value : x) })}
                          className="h-9 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 text-sm text-gray-900 dark:text-gray-100"
                        />
                        <button onClick={() => updateQuestion(q.id, { options: (q.options ?? []).filter((_, i) => i !== oi) })} disabled={(q.options?.length ?? 0) <= 2}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30" aria-label={`Remove option ${oi + 1}`}>
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => updateQuestion(q.id, { options: [...(q.options ?? []), ''] })}>
                      <Plus className="w-4 h-4" aria-hidden="true" /> Add option
                    </Button>
                    <p className="text-xs text-gray-400">Select the radio button next to the correct answer.</p>
                  </div>
                )}

                {q.type === 'file' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Allowed file types <span className="text-gray-400 font-normal">(comma separated)</span></label>
                    <Input value={(q.allowedFileTypes ?? []).join(', ')} onChange={e => updateQuestion(q.id, { allowedFileTypes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="pdf, jpg, png, zip" />
                  </div>
                )}

                {q.type === 'related' && (
                  <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-200">
                    This is a <strong>related</strong> question — it references a resource/material you will attach (e.g. a worksheet or diagram file). Mention the attached material clearly in the question text.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-6">
          <Button onClick={handleSubmit} loading={isSubmitting} className="flex-1">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> {aiGenerated ? 'Publish AI assignment' : 'Publish assignment'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}