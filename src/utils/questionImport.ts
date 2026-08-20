/**
 * Import questions from an uploaded file (.json / .csv / .txt) so a trainer or
 * admin can bulk-add objective questions to an assignment or quiz.
 *
 * The parser normalises the many common formats into a single `ImportedQuestion`
 * shape with letter-coded options and a correct answer. Objective questions
 * (multiple choice / true-false / fill-in-the-blank) are fully captured so they
 * render as auto-graded questions for students.
 */

import type { AssignmentQuestion } from '@/features/assignments/types'
import type { QuizQuestionInput } from '@/services/quizzes.service'

export interface ImportedOption {
  id: string
  text: string
  isCorrect: boolean
}

export type ImportedQuestionKind = 'mcq' | 'true_false' | 'fill_blank' | 'essay'

export interface ImportedQuestion {
  prompt: string
  kind: ImportedQuestionKind
  options?: ImportedOption[]
  correctAnswer?: string // mcq: correct option id | true_false: 'true'|'false' | fill_blank: exact text
}

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const OPTION_LINE = /^[ \t]*(?:[a-d]|[A-D])(?:[.)\]]|\s+-|\s*:)\s+(.+)$/
const ANSWER_LINE = /^[ \t]*(?:answer|ans|correct|key)\s*[:.\-]\s*(.+)$/i

function normIndex(v: unknown): number | null {
  const n = Number(v)
  return Number.isInteger(n) && n >= 0 ? n : null
}

/** Convert a user-supplied answer value (letter / index / option text) to an option id. */
function resolveOptionId(raw: unknown, options: ImportedOption[]): string | null {
  if (raw === undefined || raw === null) return null
  const str = String(raw).trim()
  if (!str) return null
  const idx = normIndex(str)
  if (idx !== null && options[idx]) return options[idx].id
  const letterMatch = str.toLowerCase().match(/^([a-j])/)
  if (letterMatch) {
    const found = options.find(o => o.id === letterMatch[1])
    if (found) return found.id
  }
  const textOpt = options.find(o => o.text.trim().toLowerCase() === str.toLowerCase())
  return textOpt ? textOpt.id : null
}

/** Build letter-coded options from raw entries, marking a correct option if given. */
function buildOptions(raw: unknown, correctId?: string): ImportedOption[] {
  const arr = Array.isArray(raw) ? raw : []
  const options = arr.map((entry, i) => {
    const id = LETTERS[i] || `o${i}`
    if (typeof entry === 'string') return { id, text: entry.trim(), isCorrect: false }
    const text = String(entry?.text ?? entry?.label ?? entry?.value ?? '').trim()
    return { id, text, isCorrect: Boolean(entry?.isCorrect ?? entry?.correct ?? false) }
  }).filter(o => o.text.length > 0)
  if (options.length && correctId) options.forEach(o => { o.isCorrect = o.id === correctId })
  return options
}
/* ─── JSON ────────────────────────────────────────────────────────────── */

function parseJson(text: string): ImportedQuestion[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('The JSON file could not be read. Please check that it is valid JSON.')
  }
  const rawList = Array.isArray(parsed) ? parsed : (parsed as { questions?: unknown[] })?.questions
  if (!Array.isArray(rawList)) {
    throw new Error('Expected a JSON array of questions, or an object with a "questions" array.')
  }

  const out: ImportedQuestion[] = []
  for (const entry of rawList) {
    if (typeof entry === 'string') {
      out.push({ prompt: entry, kind: 'essay' })
      continue
    }
    const prompt = String(entry?.question ?? entry?.prompt ?? entry?.text ?? entry?.title ?? '').trim()
    if (!prompt) continue
    const type = String(entry?.type ?? entry?.questionType ?? '').toLowerCase()
    const options = buildOptions(entry?.options ?? entry?.choices ?? entry?.answers)
    const rawCorrect = entry?.correct ?? entry?.correctAnswer ?? entry?.answer ?? entry?.correctIndex ?? entry?.key ?? entry?.answerKey

    let correctId: string | null = null
    if (options.length) correctId = resolveOptionId(rawCorrect ?? null, options)

    if (type === 'true_false' || (options.length <= 2 && options.every(o => /^(true|false)$/i.test(o.text)))) {
      const tf = String(rawCorrect ?? '').toLowerCase() === 'false' ? 'false' : 'true'
      const trueFalseOpts = [
        { id: 'true', text: 'True', isCorrect: tf === 'true' },
        { id: 'false', text: 'False', isCorrect: tf === 'false' },
      ]
      out.push({ prompt, kind: 'true_false', options: trueFalseOpts, correctAnswer: tf })
    } else if (options.length >= 2) {
      if (options.every(o => !o.isCorrect) && correctId) options.forEach(o => { o.isCorrect = o.id === correctId })
      out.push({ prompt, kind: 'mcq', options, correctAnswer: options.find(o => o.isCorrect)?.id })
    } else if (String(rawCorrect ?? '').trim()) {
      out.push({ prompt, kind: 'fill_blank', correctAnswer: String(rawCorrect ?? '').trim() })
    } else {
      out.push({ prompt, kind: 'essay' })
    }
  }
  return out
}

/* ─── CSV ─────────────────────────────────────────────────────────────── */

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') inQ = false
      else cur += ch
    } else if (ch === '"') inQ = true
    else if (ch === ',') { cells.push(cur); cur = '' }
    else cur += ch
  }
  cells.push(cur)
  return cells.map(c => c.trim().replace(/^"|"$/g, ''))
}

const CSV_QUESTION_COLS = ['question', 'prompt', 'text', 'q', 'question text']
const CSV_ANSWER_COLS = ['answer', 'correct', 'correctanswer', 'correct_answer', 'key', 'correctoption', 'correctindex']
const CSV_OPTION_COLS = ['optiona', 'option_a', 'option a', 'a', 'option1', 'optionb', 'option_b', 'option b', 'b', 'option2', 'optionc', 'option_c', 'option c', 'c', 'option3', 'optiond', 'option_d', 'option d', 'd', 'option4', 'optione', 'option_e', 'option e', 'e', 'option5', 'optionf', 'option_f', 'option f', 'f', 'option6']

function parseCsv(text: string): ImportedQuestion[] {
  const rows = text
    .split(/\r?\n/)
    .map(r => splitCsvLine(r))
    .filter(row => row.some(cell => cell !== ''))
  if (rows.length < 2) {
    throw new Error('The CSV file needs a header row followed by at least one question row.')
  }
  const header = rows[0].map(h => h.toLowerCase())
  const findCol = (names: string[]) => header.findIndex(h => names.includes(h))
  const qCol = findCol(CSV_QUESTION_COLS)
  const aCol = findCol(CSV_ANSWER_COLS)
  if (qCol === -1) {
    throw new Error('CSV needs a "question" column (and ideally an "answer" column).')
  }
  const optionCols = header
    .map((h, i) => ({ index: i, name: h }))
    .filter(({ name }) => name && CSV_OPTION_COLS.includes(name))
    .sort((x, y) => x.index - y.index)
    .slice(0, 6)

  const out: ImportedQuestion[] = []
  for (const row of rows.slice(1)) {
    const prompt = row[qCol]?.trim()
    if (!prompt) continue
    const rawOptions = optionCols.map(({ index }) => row[index]?.trim()).filter(Boolean)
    const options = buildOptions(rawOptions)
    if (options.length >= 2) {
      const correctId = aCol !== -1 ? resolveOptionId(row[aCol], options) : null
      if (options.every(o => !o.isCorrect) && correctId) options.forEach(o => { o.isCorrect = o.id === correctId })
      if (options.length <= 2 && options.every(o => /^(true|false)$/i.test(o.text))) {
        const tf = String(row[aCol] ?? '').toLowerCase() === 'false' ? 'false' : 'true'
        out.push({
          prompt, kind: 'true_false',
          options: [{ id: 'true', text: 'True', isCorrect: tf === 'true' }, { id: 'false', text: 'False', isCorrect: tf === 'false' }],
          correctAnswer: tf,
        })
      } else {
        out.push({ prompt, kind: 'mcq', options, correctAnswer: options.find(o => o.isCorrect)?.id })
      }
    } else if (aCol !== -1 && row[aCol]?.trim()) {
      out.push({ prompt, kind: 'fill_blank', correctAnswer: row[aCol].trim() })
    } else {
      out.push({ prompt, kind: 'essay' })
    }
  }
  return out
}
/* ─── Plain text (lines) ──────────────────────────────────────────────── */

function parseTextQuestions(text: string): ImportedQuestion[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const blocks: Array<{ prompt: string; options: string[]; answerRaw: string }> = []
  let cur: { prompt: string; options: string[]; answerRaw: string } | null = null

  const finalize = () => { if (cur) blocks.push(cur); cur = null }

  for (const line of lines) {
    const answerMatch = line.match(ANSWER_LINE)
    if (answerMatch) {
      if (!cur) cur = { prompt: '', options: [], answerRaw: '' }
      cur.answerRaw += (cur.answerRaw ? ' ' : '') + answerMatch[1].trim()
      continue
    }
    const optionMatch = line.match(OPTION_LINE)
    if (optionMatch) {
      if (!cur) cur = { prompt: '', options: [], answerRaw: '' }
      cur.options.push(optionMatch[1].trim())
      continue
    }
    // A new question line — finalise the previous block first.
    if (cur && (cur.options.length || cur.answerRaw)) finalize()
    cur = { prompt: line, options: [], answerRaw: '' }
  }
  finalize()

  const out: ImportedQuestion[] = []
  for (const b of blocks) {
    const lowerAnswer = b.answerRaw.trim().toLowerCase()
    if (b.options.length === 2 && b.options.every(o => /^(true|false)$/i.test(o))) {
      const tf = lowerAnswer === 'false' ? 'false' : 'true'
      out.push({
        prompt: b.prompt, kind: 'true_false',
        options: [{ id: 'true', text: 'True', isCorrect: tf === 'true' }, { id: 'false', text: 'False', isCorrect: tf === 'false' }],
        correctAnswer: tf,
      })
    } else if (/^(true|false)$/i.test(b.answerRaw.trim())) {
      const tf = b.answerRaw.trim().toLowerCase() === 'false' ? 'false' : 'true'
      out.push({
        prompt: b.prompt, kind: 'true_false',
        options: [{ id: 'true', text: 'True', isCorrect: tf === 'true' }, { id: 'false', text: 'False', isCorrect: tf === 'false' }],
        correctAnswer: tf,
      })
    } else if (b.options.length >= 2) {
      const options = buildOptions(b.options)
      const correctId = resolveOptionId(b.answerRaw, options)
      if (options.every(o => !o.isCorrect)) options.forEach(o => { o.isCorrect = o.id === (correctId || options[0].id) })
      out.push({ prompt: b.prompt, kind: 'mcq', options, correctAnswer: options.find(o => o.isCorrect)?.id })
    } else if (b.answerRaw.trim()) {
      out.push({ prompt: b.prompt, kind: 'fill_blank', correctAnswer: b.answerRaw.trim() })
    } else {
      out.push({ prompt: b.prompt, kind: 'essay' })
    }
  }
  return out
}

/* ─── Entry point ─────────────────────────────────────────────────────── */

export async function parseQuestionFile(file: File): Promise<ImportedQuestion[]> {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  return parseQuestionsText(await file.text(), ext)
}

/** Parse question text for a given extension (.json / .csv / anything else = plain text). */
export function parseQuestionsText(text: string, ext: string): ImportedQuestion[] {
  if (ext === 'json') return parseJson(text)
  if (ext === 'csv') return parseCsv(text)
  return parseTextQuestions(text)
}

/** Count only objective (auto-gradable) imported questions. */
export function countObjective(questions: ImportedQuestion[]): number {
  return questions.filter(q => q.kind === 'mcq' || q.kind === 'true_false' || q.kind === 'fill_blank').length
}

/* ─── Mappers to the app's question shapes ────────────────────────────── */

let localQuestionSeq = 0
function nextLocalId(): string {
  localQuestionSeq += 1
  return `imported-${Date.now()}-${localQuestionSeq}`
}

/** Map imported questions into AssignmentQuestion[] (MCQ keeps a correct option index). */
export function toAssignmentQuestions(questions: ImportedQuestion[]): AssignmentQuestion[] {
  return questions.map(q => {
    const id = nextLocalId()
    const base = { id, marks: 10 }
    if (q.kind === 'mcq' && q.options && q.options.length >= 2) {
      return {
        ...base,
        type: 'mcq',
        title: q.prompt,
        options: q.options.map(o => o.text),
        correctOptionIndex: Math.max(0, q.options.findIndex(o => o.isCorrect)),
      }
    }
    if (q.kind === 'true_false') {
      return {
        ...base,
        type: 'mcq',
        title: q.prompt,
        options: ['True', 'False'],
        correctOptionIndex: q.correctAnswer === 'false' ? 1 : 0,
      }
    }
    // Assignments have no fill-in-the-blank type — treat written answers as subjective.
    return { ...base, type: 'subjective', title: q.prompt }
  })
}

/** Map imported questions into QuizQuestionInput[] (objective questions are auto-graded). */
export function toQuizQuestions(questions: ImportedQuestion[]): QuizQuestionInput[] {
  return questions.map((q, i) => {
    const base = { points: 1, position: i + 1 }
    if (q.kind === 'mcq' && q.options) {
      return { ...base, questionText: q.prompt, questionType: 'multiple_choice', options: q.options, correctAnswer: q.correctAnswer }
    }
    if (q.kind === 'true_false') {
      return { ...base, questionText: q.prompt, questionType: 'true_false', correctAnswer: q.correctAnswer }
    }
    if (q.kind === 'fill_blank') {
      return { ...base, questionText: q.prompt, questionType: 'fill_blank', correctAnswer: q.correctAnswer }
    }
    return { ...base, questionText: q.prompt, questionType: 'essay' }
  })
}