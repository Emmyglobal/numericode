import { type FormEvent, useState } from 'react'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { aiService, type AiGeneratedNote, type AiGeneratedQuestion } from '@/services/ai.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

export type AiGeneratorMode = 'lesson' | 'quiz' | 'assignment' | 'note'

interface AiContentGeneratorProps {
  mode: AiGeneratorMode
  onLessonGenerated?: (content: string) => void
  onQuizGenerated?: (questions: AiGeneratedQuestion[]) => void
  onAssignmentGenerated?: (description: string) => void
  onNoteGenerated?: (note: AiGeneratedNote) => void
  defaultSubject?: string
  defaultLevel?: string
  buttonLabel?: string
  buttonVariant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  buttonSize?: 'sm' | 'md' | 'lg'
  className?: string
}

const subjectOptions = ['Mathematics', 'Programming', 'Science', 'English', 'General']
const levelOptions = ['beginner', 'intermediate', 'advanced']
const questionTypeOptions = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'essay', label: 'Essay' },
]

export function AiContentGenerator({
  mode,
  onLessonGenerated,
  onQuizGenerated,
  onAssignmentGenerated,
  onNoteGenerated,
  defaultSubject = 'Mathematics',
  defaultLevel = 'beginner',
  buttonLabel,
  buttonVariant = 'secondary',
  buttonSize = 'sm',
  className,
}: AiContentGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState(defaultSubject)
  const [level, setLevel] = useState(defaultLevel)
  const [style, setStyle] = useState('friendly and encouraging')
  const [questionCount, setQuestionCount] = useState(5)
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'true_false'])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const title = mode === 'lesson' ? 'Generate Lesson Content'
    : mode === 'quiz' ? 'Generate Quiz Questions'
      : mode === 'assignment' ? 'Generate Assignment'
        : 'Generate Study Notes'

  const description = mode === 'lesson'
    ? 'Let AI draft a structured lesson for your course.'
    : mode === 'quiz'
      ? 'Let AI create quiz questions for your topic.'
      : mode === 'assignment'
        ? 'Let AI draft an assignment for your students.'
        : 'Let AI write concise, well-organised study notes for your topic.'

  const toggleQuestionType = (value: string) => {
    setQuestionTypes(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    )
  }

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return
    setIsLoading(true)
    setError('')
    try {
      if (mode === 'lesson') {
        const result = await aiService.generateLesson({ topic: topic.trim(), subject, level, style })
        onLessonGenerated?.(result.content)
      } else if (mode === 'quiz') {
        const result = await aiService.generateQuiz({
          topic: topic.trim(),
          subject,
          level,
          questionCount,
          questionTypes: questionTypes.length > 0 ? questionTypes : undefined,
        })
        onQuizGenerated?.(result.questions)
      } else if (mode === 'assignment') {
        const result = await aiService.generateAssignment({ topic: topic.trim(), subject, level })
        onAssignmentGenerated?.(result.description)
      } else {
        const result = await aiService.generateNote({ topic: topic.trim(), subject, level, style })
        onNoteGenerated?.(result)
      }
      setOpen(false)
      setTopic('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI generation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const defaultLabel = mode === 'lesson' ? 'AI Lesson' : mode === 'quiz' ? 'AI Quiz' : 'AI Assignment'

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Sparkles className="w-4 h-4 mr-1" aria-hidden="true" />
        {buttonLabel ?? defaultLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-brand-light p-2 text-brand-blue">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}

            <form onSubmit={handleGenerate} className="space-y-4">
              <Input
                label="Topic"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={mode === 'lesson' ? 'e.g. Introduction to Fractions' : mode === 'quiz' ? 'e.g. Algebra Basics' : 'e.g. Python Loops'}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Level</label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {levelOptions.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                  </select>
                </div>
              </div>

              {(mode === 'lesson' || mode === 'note') && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Style</label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3.5 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <option value="friendly and encouraging">Friendly & Encouraging</option>
                    <option value="formal and academic">Formal & Academic</option>
                    <option value="simple and concise">Simple & Concise</option>
                    <option value="playful and fun">Playful & Fun</option>
                  </select>
                </div>
              )}

              {mode === 'quiz' && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Number of Questions</label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={questionCount}
                      onChange={e => setQuestionCount(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Question Types</label>
                    <div className="flex flex-wrap gap-2">
                      {questionTypeOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleQuestionType(opt.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            questionTypes.includes(opt.value)
                              ? 'border-brand-blue bg-brand-light text-brand-blue'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" loading={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" aria-hidden="true" /> : <Sparkles className="w-4 h-4 mr-1" aria-hidden="true" />}
                  Generate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}