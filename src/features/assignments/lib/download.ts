import type { Assignment, AssignmentAnswer } from '@/features/assignments/types'

function triggerDownload(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function assignmentToText(a: Assignment): string {
  const lines: string[] = []
  lines.push(a.title)
  lines.push(`Course: ${a.courseTitle}`)
  lines.push(`Due: ${a.dueDate}`)
  lines.push(`Total marks: ${a.totalMarks} · Passing score: ${a.passingScore}`)
  lines.push('')
  if (a.description) lines.push(`Instructions:\n${a.description}\n`)
  lines.push('Questions:')
  a.questions.forEach((q, i) => {
    lines.push(`${i + 1}. [${q.type.toUpperCase()}] (${q.marks} marks) ${q.title}`)
    if (q.type === 'mcq' && q.options?.length) {
      q.options.forEach((opt, oi) => lines.push(`     ${String.fromCharCode(97 + oi)}) ${opt}`))
    }
    if (q.type === 'file' && q.allowedFileTypes?.length) lines.push(`     Allowed file types: ${q.allowedFileTypes.join(', ')}`)
    if (q.type === 'related') lines.push('     (refers to an attached resource/material)')
    lines.push('')
  })
  return lines.join('\n')
}

export function downloadAssignment(a: Assignment) {
  const safe = a.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'assignment'
  triggerDownload(assignmentToText(a), `${safe}.txt`, 'text/plain')
}

/** Render answers into a text file so the student can keep a local copy. */
export function answersToText(a: Assignment, answers: AssignmentAnswer[]): string {
  const byQuestion = new Map(answers.map(ans => [ans.questionId, ans]))
  const lines: string[] = []
  lines.push(`Submission for: ${a.title}`)
  lines.push(`Score: ${a.score ?? '—'} / ${a.totalMarks}${a.feedback ? `\nFeedback: ${a.feedback}` : ''}`)
  lines.push('')
  a.questions.forEach((q, i) => {
    const ans = byQuestion.get(q.id)
    lines.push(`${i + 1}. ${q.title}`)
    if (ans?.selectedIndex !== undefined) {
      lines.push(`   Answer: ${ans.selectedIndex >= 0 && q.options?.[ans.selectedIndex] ? q.options[ans.selectedIndex] : `Option ${ans.selectedIndex + 1}`}`)
    } else if (ans?.fileName) {
      lines.push(`   File uploaded: ${ans.fileName}`)
    } else {
      lines.push(`   Answer: ${ans?.answer?.trim() ? ans.answer : '(no answer provided)'}`)
    }
    lines.push('')
  })
  return lines.join('\n')
}

export function downloadSubmission(a: Assignment, answers: AssignmentAnswer[]) {
  const safe = a.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'assignment'
  triggerDownload(answersToText(a, answers), `${safe}-submission.txt`, 'text/plain')
}