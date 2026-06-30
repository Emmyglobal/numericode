import { useMemo, useState } from 'react'
import { CourseCatalog } from '../components/courses/CourseCatalog'
import { CourseDetail } from '../components/courses/CourseDetail'
import { CourseFilters } from '../components/courses/CourseFilters'
import { Badge } from '../components/ui/Badge'
import { courses } from '../data/courses'
import type { Course, CourseSubject } from '../types/course'

type SubjectFilter = 'All' | CourseSubject

export function CoursesPage() {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState<SubjectFilter>('All')
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return courses.filter((course) => {
      const matchesSubject = subject === 'All' || course.subject === subject
      const searchableText = [course.title, course.subject, course.level, course.author]
        .join(' ')
        .toLowerCase()
      return matchesSubject && searchableText.includes(normalizedQuery)
    })
  }, [query, subject])

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
    document.getElementById('course-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="section catalogue-section" id="courses">
      <div className="catalogue-header">
        <div>
          <Badge tone="intermediate">{courses.length} courses</Badge>
          <h2>Explore the course catalogue</h2>
          <p>
            Search by topic, compare learning levels, and preview the full course detail before
            creating an account.
          </p>
        </div>
      </div>

      <CourseFilters
        query={query}
        subject={subject}
        onQueryChange={setQuery}
        onSubjectChange={setSubject}
      />
      <CourseCatalog courses={filteredCourses} onSelectCourse={handleSelectCourse} />
      <CourseDetail course={selectedCourse} />
    </section>
  )
}
