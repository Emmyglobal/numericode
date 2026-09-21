import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { LessonSlide } from '@/features/courses/types'
import { SlideBody } from './LessonSlideBody'

/**
 * Slide-based lesson presentation ("PowerPoint-style" lesson experience).
 *
 * A lesson whose `slides` array is present is presented one slide at a time with
 * Previous / Next controls, a slide counter and a progress bar. Keyboard users can
 * move with the arrow keys. Lessons with no slides are unaffected: CourseViewerPage
 * keeps rendering their Markdown `content` exactly as before.
 */
interface LessonViewerProps {
  /** Lesson title — used in the header and in the deck's accessible name. */
  title: string
  slides: LessonSlide[]
  /** Called when the student presses "Finish lesson" on the final slide. */
  onFinish?: () => void
}

export function LessonViewer({ title, slides, onFinish }: LessonViewerProps) {
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const deckRef = useRef<HTMLDivElement>(null)

  const total = slides.length
  const slide = slides[Math.min(index, Math.max(total - 1, 0))]
  const isLast = index >= total - 1
  const percent = total > 0 ? Math.round(((index + 1) / total) * 100) : 0
  const slideLabel = `${index + 1} of ${total}`

  const goTo = useCallback((target: number) => {
    setIndex(prev => {
      const clamped = Math.max(0, Math.min(total - 1, target))
      if (clamped !== prev) setFinished(false)
      return clamped
    })
  }, [total])

  // Keyboard navigation — arrow keys change slides, but never while the student is
  // typing (lesson notes, code editor or a quiz answer box).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(index + 1) }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(index - 1) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goTo, index])

  // Keep the top of the slide in view after navigating. Optional call: older
  // browsers (and jsdom in tests) do not implement scrollIntoView.
  useEffect(() => {
    deckRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [index])

  if (!slide) return null

  const finish = () => {
    setFinished(true)
    onFinish?.()
  }

  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white shadow-card dark:border-gray-700 dark:bg-surface-dark"
      aria-label={`Lesson: ${title}`}
    >
      <header className="border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Interactive lesson</p>
            <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-navy dark:bg-brand-blue/20 dark:text-brand-light">
            Slide {slideLabel}
          </span>
        </div>
        <div className="mt-3">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
            role="progressbar"
            aria-label="Lesson slide progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Slide ${slideLabel}`}
          >
            <div className="h-full rounded-full bg-brand-blue transition-all duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{percent}% through this lesson</p>
        </div>
      </header>

      <div ref={deckRef} className="px-4 py-5 sm:px-6">
        <article aria-roledescription="slide" aria-label={`${slideLabel}: ${slide.title ?? slide.type}`} aria-live="polite">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">{slide.title ?? title}</h4>
          <SlideBody slide={slide} />
        </article>
      </div>

      <LessonNavigation
        slideLabel={slideLabel}
        isFirst={index === 0}
        isLast={isLast}
        finished={finished}
        onPrevious={() => goTo(index - 1)}
        onNext={() => goTo(index + 1)}
        onFinish={finish}
      />

      {finished && <LessonCompletePanel />}
    </section>
  )
}

/** Previous / Next / Finish controls with the slide indicator between them. */
function LessonNavigation({
  slideLabel, isFirst, isLast, finished, onPrevious, onNext, onFinish,
}: {
  slideLabel: string
  isFirst: boolean
  isLast: boolean
  finished: boolean
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
}) {
  return (
    <footer className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-gray-700">
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={isFirst}
        aria-label={isFirst ? 'This is the first slide' : 'Previous slide'}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Previous
      </Button>

      <p className="order-first text-center text-sm text-gray-500 sm:order-none dark:text-gray-400">
        <span className="font-semibold text-gray-900 dark:text-white">{slideLabel}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        Arrow keys work too
      </p>

      {isLast ? (
        <Button onClick={onFinish} className="w-full sm:w-auto">
          {finished ? 'Lesson finished' : 'Finish lesson'}
          <CheckCircle2 className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Button>
      ) : (
        <Button onClick={onNext} aria-label="Next slide" className="w-full sm:w-auto">
          Next <ChevronRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </footer>
  )
}

/** Completion state shown once the student reaches the end of the deck. */
function LessonCompletePanel() {
  return (
    <div className="border-t border-green-200 bg-green-50 px-4 py-5 sm:px-6 dark:border-green-900/60 dark:bg-green-900/20" role="status">
      <div className="flex items-start gap-3">
        <Trophy className="mt-0.5 h-6 w-6 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-semibold text-green-900 dark:text-green-200">Lesson complete — well done!</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Take the lesson quiz below to lock in what you learned, and attempt the assignment where this lesson has one.
            Your progress is saved automatically.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-green-800 dark:text-green-300">
            Scroll down for the quiz <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}
