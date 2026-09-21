import { useState } from 'react'
import { AlertTriangle, Check, CheckCircle, Copy, Info, Lightbulb, ListChecks, Target, XCircle } from 'lucide-react'
import { Markdown } from '@/components/ui/Markdown'
import { cn } from '@/utils/classNames'
import type { LessonSlide } from '@/features/courses/types'

/**
 * Presentational building blocks for the slide-based lesson viewer (Phase 23).
 * Navigation, progress and completion logic live in LessonViewer.tsx.
 */

/** Code block with a copy button. Scrolls horizontally so narrow screens never break. */
export function CodeBlock({ code, language, title }: { code: string; language?: string; title?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context): the code stays selectable by hand.
    }
  }

  return (
    <figure className="my-4 min-w-0">
      <div className="flex items-center justify-between gap-3 rounded-t-lg border border-b-0 border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {title || language || 'Code'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto rounded-b-lg border border-gray-200 bg-gray-900 p-4 text-left text-sm leading-relaxed dark:border-gray-700">
        <code className="font-mono text-gray-100">{code}</code>
      </pre>
      <figcaption className="sr-only">Code example{language ? ` written in ${language}` : ''}</figcaption>
    </figure>
  )
}

/** Coloured callout — tip, warning or note. */
export function Callout({ type, title, content }: { type: 'tip' | 'warning' | 'note'; title?: string; content: string }) {
  const styles = {
    tip: { wrap: 'border-teal-300 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/20', head: 'text-teal-900 dark:text-teal-200', Icon: Lightbulb, label: 'Tip' },
    warning: { wrap: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20', head: 'text-amber-900 dark:text-amber-200', Icon: AlertTriangle, label: 'Watch out' },
    note: { wrap: 'border-brand-light bg-brand-light/50 dark:border-brand-blue/40 dark:bg-brand-blue/10', head: 'text-brand-navy dark:text-brand-light', Icon: Info, label: 'Note' },
  }[type]
  const Icon = styles.Icon

  return (
    <aside className={cn('my-4 flex gap-3 rounded-lg border-l-4 p-4', styles.wrap)} role="note">
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', styles.head)} aria-hidden="true" />
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold', styles.head)}>{title || styles.label}</p>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{content}</p>
      </div>
    </aside>
  )
}

/** Worked example: short explanation plus optional code. */
export function ExampleCard({ title, content, code, language }: { title?: string; content: string; code?: string; language?: string }) {
  return (
    <section className="my-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <Target className="h-4 w-4 text-brand-blue" aria-hidden="true" />
        {title ? `Example — ${title}` : 'Example'}
      </h4>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{content}</p>
      {code && <CodeBlock code={code} language={language} title={title} />}
    </section>
  )
}

/** Hands-on activity: task, numbered steps, optional starter code and expected result. */
export function TryItCard({ tryIt }: { tryIt: NonNullable<LessonSlide['tryIt']> }) {
  return (
    <section className="my-4 rounded-lg border-2 border-dashed border-brand-sky bg-white p-4 dark:border-brand-blue/60 dark:bg-surface-dark">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-navy dark:text-brand-light">
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        Try It — {tryIt.task}
      </h4>
      <ol className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {tryIt.steps.map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white" aria-hidden="true">
              {i + 1}
            </span>
            <span className="min-w-0">{step}</span>
          </li>
        ))}
      </ol>
      {tryIt.starter && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Starter code</p>
          <CodeBlock code={tryIt.starter} language="jsx" title="Start from here" />
        </div>
      )}
      {tryIt.expected && (
        <p className="mt-2 rounded-md bg-green-50 p-3 text-sm text-green-900 dark:bg-green-900/20 dark:text-green-200">
          <span className="font-semibold">You will know it worked when: </span>
          {tryIt.expected}
        </p>
      )}
    </section>
  )
}

/** Common mistakes slide — each item reads "mistake — why it hurts". */
export function MistakesCard({ items }: { items: string[] }) {
  return (
    <ul className="my-4 space-y-3">
      {items.map((item, i) => {
        const [mistake, ...rest] = item.split(' — ')
        return (
          <li key={i} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-900/20">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span className="min-w-0 text-sm text-gray-800 dark:text-gray-200">
              <span className="font-semibold">{mistake}</span>
              {rest.length > 0 && <span> — {rest.join(' — ')}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Quick knowledge check with instant feedback. This is a learning aid inside the
 * slide deck, not graded work, so it never touches the quiz-attempt API.
 */
export function KnowledgeCheck({ question }: { question: NonNullable<LessonSlide['question']> }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const answered = chosen !== null
  const correct = chosen === question.correctIndex

  return (
    <div className="my-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{question.question}</p>
      <div className="mt-3 space-y-2" role="group" aria-label="Quick check options">
        {question.options.map((option, i) => {
          const isCorrectOption = i === question.correctIndex
          const isChosen = chosen === i
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              aria-pressed={isChosen}
              onClick={() => setChosen(i)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-1',
                !answered && 'border-gray-200 text-gray-800 hover:border-brand-blue hover:bg-brand-light/40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-brand-blue/10',
                answered && isCorrectOption && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200',
                answered && isChosen && !isCorrectOption && 'border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200',
                answered && !isCorrectOption && !isChosen && 'border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400',
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 flex-1">{option}</span>
              {answered && isCorrectOption && <CheckCircle className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />}
              {answered && isChosen && !isCorrectOption && <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />}
            </button>
          )
        })}
      </div>

      <div role="status" aria-live="polite" className="mt-3 text-sm">
        {answered && (
          <>
            <p className={cn('font-semibold', correct ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300')}>
              {correct ? 'Correct — well done.' : `Not quite. The answer is ${String.fromCharCode(65 + question.correctIndex)}.`}
            </p>
            {question.explanation && <p className="mt-1 text-gray-600 dark:text-gray-400">{question.explanation}</p>}
            <button type="button" onClick={() => setChosen(null)} className="mt-2 text-xs font-medium text-brand-blue underline hover:no-underline">
              Try the question again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/** Bullet list used by the objectives, summary and assignment slides. */
export function SlideList({ items, icon }: { items: string[]; icon?: 'check' | 'circle' }) {
  return (
    <ul className="my-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
          {icon === 'check' ? (
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
          ) : (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" aria-hidden="true" />
          )}
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  )
}

/** Markdown body used by the content slides — same typography as the rest of the LMS. */
export function SlideMarkdown({ text }: { text: string }) {
  return <Markdown text={text} className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300" />
}
