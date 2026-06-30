import type { CourseSubject } from '../../types/course'

type SubjectFilter = 'All' | CourseSubject

type CourseFiltersProps = {
  query: string
  subject: SubjectFilter
  onQueryChange: (value: string) => void
  onSubjectChange: (value: SubjectFilter) => void
}

const filters: SubjectFilter[] = ['All', 'Mathematics', 'Programming']

export function CourseFilters({
  query,
  subject,
  onQueryChange,
  onSubjectChange,
}: CourseFiltersProps) {
  return (
    <div className="course-filter-bar" aria-label="Course filters">
      <label className="search-field">
        <span>Search courses</span>
        <input
          type="search"
          placeholder="Search by title, subject, or instructor"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <div className="segmented-control" role="group" aria-label="Filter by subject">
        {filters.map((filter) => (
          <button
            className={filter === subject ? 'active' : ''}
            type="button"
            key={filter}
            onClick={() => onSubjectChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
