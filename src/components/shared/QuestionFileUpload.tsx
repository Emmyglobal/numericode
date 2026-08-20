import { useRef, useState } from 'react'
import { UploadCloud, FileUp, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { parseQuestionFile, countObjective, type ImportedQuestion } from '@/utils/questionImport'

interface QuestionFileUploadProps {
  /** Called with parsed questions whenever a file is successfully imported. */
  onParsed: (questions: ImportedQuestion[]) => void
  /** Called when the user removes an already-imported file. */
  onCleared?: () => void
  label?: string
}

/**
 * File drop zone for bulk-importing questions (.json / .csv / .txt).
 * Objective questions in the file are parsed into structured MCQ / true-false /
 * fill-in-the-blank questions that students can answer and have auto-graded.
 */
export function QuestionFileUpload({ onParsed, onCleared, label = 'Upload questions file' }: QuestionFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [imported, setImported] = useState<ImportedQuestion[]>([])
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    setSummary('')
    try {
      const questions = await parseQuestionFile(file)
      if (!questions.length) {
        setError('No questions could be found in that file. Check the format and try again.')
        return
      }
      setFileName(file.name)
      setImported(questions)
      const objective = countObjective(questions)
      const extra = questions.length - objective
      setSummary(
        `${questions.length} question${questions.length === 1 ? '' : 's'} imported (${objective} objective, ` +
        `${extra} written). Objective questions are marked with their correct answers.`
      )
      onParsed(questions)
    } catch (err: any) {
      setError(err?.message ?? 'Could not read that file. Please try another one.')
    }
  }

  const clear = () => {
    setFileName('')
    setImported([])
    setSummary('')
    setError('')
    onCleared?.()
  }

  return (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv,.txt,application/json,text/csv,text/plain"
        className="hidden"
        onChange={e => { handleFile(e.target.files?.[0]); e.target.value = '' }}
      />

      {!fileName ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-1.5 py-4 text-gray-500 dark:text-gray-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
        >
          <UploadCloud className="w-7 h-7" aria-hidden="true" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs">.json, .csv or .txt — MCQ options with the correct answer become auto-graded objective questions</span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileUp className="w-5 h-5 text-brand-blue shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{fileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{imported.length} question{imported.length === 1 ? '' : 's'} parsed</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium text-brand-blue hover:underline"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={clear}
              aria-label="Remove uploaded questions file"
              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-3 flex items-start gap-2 text-xs text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{summary}</span>
        </div>
      )}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
        <strong>Expected format:</strong> one question per row/line with lettered options (A) (B) (C) (D) and an
        “Answer: B” line, or JSON/CSV with <code>question</code>, <code>options</code> and <code>correctAnswer</code> fields.
      </p>
    </div>
  )
}