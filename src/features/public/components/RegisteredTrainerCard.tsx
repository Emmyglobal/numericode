import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { AvailableTeacher } from '@/services/courses.service'

const SUBJECT_LABELS: Record<string, string> = { mathematics: 'Mathematics', programming: 'Programming' }

function initialsOf(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

/**
 * Card for the public Registered Trainer directory. Renders only the
 * privacy-safe public fields returned by GET /api/courses/teachers
 * (name, bio, avatar, subjects, published-course count). Nothing private.
 */
export function RegisteredTrainerCard({ trainer }: { trainer: AvailableTeacher }) {
  const publishedCourses = trainer.courses?.length ?? 0
  const subjects = trainer.subjects ?? []

  return (
    <article className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-card hover:shadow-lg transition-shadow p-5 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {trainer.avatarUrl ? (
          <img
            src={trainer.avatarUrl}
            alt={`${trainer.name} — Registered Trainer`}
            loading="lazy"
            decoding="async"
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold shrink-0"
          >
            {initialsOf(trainer.name)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white leading-snug truncate">
            <Link
              to={`/trainers/${trainer.id}`}
              className="hover:text-brand-blue focus-visible:shadow-focus rounded transition-colors"
            >
              {trainer.name}
            </Link>
          </h3>
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-medium">
            <GraduationCap className="w-3 h-3" aria-hidden="true" />
            Registered Trainer
          </p>
        </div>
      </div>

      {trainer.bio && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{trainer.bio}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {subjects.map(s => (
          <Badge key={s} variant={s as 'mathematics' | 'programming'}>{SUBJECT_LABELS[s] ?? s}</Badge>
        ))}
        <Badge variant="default">
          <BookOpen className="w-3 h-3 mr-1" aria-hidden="true" />
          {publishedCourses} published course{publishedCourses !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="mt-auto pt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          to={`/trainers/${trainer.id}`}
          aria-label={`View profile of ${trainer.name}`}
          className="inline-block"
        >
          <Button variant="secondary" size="sm">View Profile</Button>
        </Link>
        {publishedCourses > 0 && (
          <Link
            to={`/courses?instructorId=${trainer.id}`}
            aria-label={`View courses by ${trainer.name}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:text-brand-navy dark:text-blue-300 dark:hover:text-blue-200 focus-visible:shadow-focus rounded transition-colors px-1 py-2"
          >
            View Courses
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </article>
  )
}