import { CodeBlock, ExampleCard, KnowledgeCheck, MistakesCard, SlideList, SlideMarkdown, TryItCard, Callout } from './LessonSlideBlocks'
import type { LessonSlide } from '@/features/courses/types'

/**
 * Renders a single lesson slide according to its `type`. Kept separate from
 * LessonViewer so the navigation shell stays small and easy to read, and so a
 * new slide type can be added without touching the navigation logic.
 */
export function SlideBody({ slide }: { slide: LessonSlide }) {
  switch (slide.type) {
    case 'title':
      return <p className="mt-2 text-base leading-relaxed text-gray-700 dark:text-gray-300">{slide.content}</p>

    case 'objectives':
      return (
        <>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">By the end of this lesson you will be able to:</p>
          <SlideList items={slide.items ?? []} icon="check" />
        </>
      )

    case 'content':
      return <SlideMarkdown text={slide.content ?? ''} />

    case 'example':
      return slide.example ? <ExampleCard {...slide.example} /> : null

    case 'code':
      return (
        <>
          {slide.content && <SlideMarkdown text={slide.content} />}
          <CodeBlock code={slide.code ?? ''} language={slide.language} title={slide.title} />
        </>
      )

    case 'callout':
      return slide.callout ? <Callout {...slide.callout} /> : null

    case 'try-it':
      return slide.tryIt ? <TryItCard tryIt={slide.tryIt} /> : null

    case 'mistakes':
      return <MistakesCard items={slide.items ?? []} />

    case 'knowledge-check':
      return slide.question ? <KnowledgeCheck question={slide.question} /> : null

    case 'assignment':
      return (
        <>
          {slide.content && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{slide.content}</p>}
          <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">What you need to hand in:</p>
          <SlideList items={slide.items ?? []} />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Submit your work in the assignment section below. Your trainer will give you feedback.
          </p>
        </>
      )

    case 'summary':
      return <SlideList items={slide.items ?? []} icon="check" />

    default:
      return slide.content ? <SlideMarkdown text={slide.content} /> : null
  }
}
