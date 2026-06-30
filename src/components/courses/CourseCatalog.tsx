import type { Course } from '../../types/course'
import { CourseCard } from './CourseCard'

type CourseCatalogProps = {
  courses: Course[]
  onSelectCourse: (course: Course) => void
}

export function CourseCatalog({ courses, onSelectCourse }: CourseCatalogProps) {
  if (courses.length === 0) {
    return (
      <div className="empty-state" role="status">
        <strong>No courses found</strong>
        <p>Try a different keyword or switch the subject filter.</p>
      </div>
    )
  }

  return (
    <div className="course-grid catalogue-grid">
      {courses.map((course) => (
        <CourseCard course={course} key={course.id} onSelect={onSelectCourse} />
      ))}
    </div>
  )
}
