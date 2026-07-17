import { memo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Course, EnrolledCourse } from '@/features/courses/types'

function isEnrolled(c: Course | EnrolledCourse): c is EnrolledCourse { return 'progress' in c }

function CourseCard_Base({ course, linkBase = '/courses' }: { course: Course | EnrolledCourse; linkBase?: string }) {
  const enrolled = isEnrolled(course)
  const subjectColor: Record<string, string> = { mathematics: 'bg-teal-600', programming: 'bg-purple' }
  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden">
      <div className={`h-44 flex items-center justify-center ${subjectColor[course.subject] ?? 'bg-brand-blue'} relative`}>
        <div className="text-white/20 text-8xl font-bold select-none">{course.subject === 'mathematics' ? '∑' : '</>'}</div>
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={course.subject}>{course.subject === 'mathematics' ? 'Mathematics' : 'Programming'}</Badge>
          <Badge variant={course.level}>{course.level}</Badge>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug mb-1">{course.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>
        </div>
        {enrolled && <ProgressBar value={course.progress} label="Progress" />}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.lessonCount} lessons</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{course.instructor.name.split(' ').pop()}</span>
          </div>
          <Link to={`${linkBase}/${course.id}`}>
            <Button variant={enrolled ? 'primary' : 'secondary'} size="sm">{enrolled ? 'Continue' : 'View Course'}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const CourseCard = memo(CourseCard_Base)
