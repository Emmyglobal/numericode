import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/utils/classNames'
import { formatCoursePrice } from '@/utils/formatPrice'
import type { Course, CourseSummary, EnrolledCourse } from '@/features/courses/types'

type CardCourse = Course | CourseSummary | EnrolledCourse

function isEnrolled(c: CardCourse): c is EnrolledCourse { return 'progress' in c }

/** NumeryCode-branded fallback used when a course has no usable thumbnail. */
const THUMBNAIL_FALLBACKS: Record<string, { bg: string; glyph: string }> = {
  mathematics: { bg: 'bg-teal-600', glyph: '∑' },
  programming: { bg: 'bg-purple', glyph: '</>' },
}

function CourseCard_Base({ course, linkBase = '/courses' }: { course: CardCourse; linkBase?: string }) {
  const enrolled = isEnrolled(course)
  // A broken thumbnail URL degrades to the branded fallback instead of a broken image.
  const [thumbFailed, setThumbFailed] = useState(false)
  const showThumbnail = Boolean(course.thumbnailUrl) && !thumbFailed
  const fallback = THUMBNAIL_FALLBACKS[course.subject] ?? { bg: 'bg-brand-blue', glyph: '∑' }
  const showPrice = !enrolled
    && course.accessLevel === 'premium'
    && typeof course.priceCents === 'number'
    && course.priceCents > 0

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      {/* Thumbnail / fallback — fixed height prevents layout shift */}
      <div className="relative h-44 w-full overflow-hidden">
        {showThumbnail ? (
          <img
            src={course.thumbnailUrl ?? undefined}
            alt={`${course.title} — course thumbnail`}
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={cn('absolute inset-0 flex items-center justify-center', fallback.bg)} aria-hidden="true">
            <span className="text-white/20 text-8xl font-bold select-none">{fallback.glyph}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge variant={course.subject}>{course.subject === 'mathematics' ? 'Mathematics' : 'Programming'}</Badge>
          <Badge variant={course.level}>{course.level}</Badge>
          <span className={course.accessLevel === 'premium' ? 'inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950' : 'rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700'}>
            {course.accessLevel === 'premium' && <Crown className="h-3 w-3" aria-hidden="true" />}{course.accessLevel === 'premium' ? 'Premium' : 'Free'}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug mb-1">{course.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
        </div>

        {/* Registered Trainer — full public name, never "NumeryCode Instructor" */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={course.instructor.name} src={course.instructor.avatarUrl ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 leading-none mb-0.5">
              Registered Trainer
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {course.instructor.name}
            </p>
          </div>
        </div>

        {enrolled && <ProgressBar value={course.progress} label="Progress" />}

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            {course.lessonCount} lesson{course.lessonCount !== 1 ? 's' : ''}
          </span>
          {showPrice && (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCoursePrice(course.priceCents!, course.currency)}
            </span>
          )}
          <Link to={`${linkBase}/${course.id}`} className="ml-auto shrink-0" aria-label={`${enrolled ? 'Continue' : 'View'} ${course.title}`}>
            <Button variant={enrolled ? 'primary' : 'secondary'} size="sm">
              {enrolled ? 'Continue' : 'View Course'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const CourseCard = memo(CourseCard_Base)
