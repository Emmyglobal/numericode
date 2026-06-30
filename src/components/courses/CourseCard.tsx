import type { Course } from '../../types/course'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type CourseCardProps = {
  course: Course
  compact?: boolean
  onSelect?: (course: Course) => void
}

export function CourseCard({ course, compact = false, onSelect }: CourseCardProps) {
  const handleSelect = () => {
    onSelect?.(course)
  }

  return (
    <article className="course-card">
      <div className={`course-art ${course.tone}`}>
        <span>{course.icon}</span>
      </div>
      <div className="course-body">
        <div className="tag-row">
          <Badge tone={course.subject.toLowerCase()}>{course.subject}</Badge>
          <Badge tone={course.level.toLowerCase()}>{course.level}</Badge>
        </div>
        <h3>{course.title}</h3>
        <p>by {course.author}</p>
        <div className="course-meta">
          <span className="lesson-count">{course.lessons} lessons</span>
          {compact ? (
            <Button className="course-button" href="#/courses">
              View course
            </Button>
          ) : (
            <button className="button course-button" type="button" onClick={handleSelect}>
              View course
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
