import type { Course } from '../../types/course'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

type CourseDetailProps = {
  course: Course
}

export function CourseDetail({ course }: CourseDetailProps) {
  return (
    <section className="course-detail" id="course-details" aria-labelledby="course-detail-title">
      <div className="course-detail-main">
        <div className="course-detail-hero">
          <div>
            <div className="tag-row">
              <Badge tone={course.subject.toLowerCase()}>{course.subject}</Badge>
              <Badge tone={course.level.toLowerCase()}>{course.level}</Badge>
            </div>
            <h2 id="course-detail-title">{course.title}</h2>
            <p>{course.description}</p>
            <div className="detail-meta">
              <span>{course.lessons} lessons</span>
              <span>{course.duration}</span>
              <span>Instructor: {course.author}</span>
            </div>
          </div>
          <div className={`detail-art ${course.tone}`} aria-hidden="true">
            {course.icon}
          </div>
        </div>

        <section className="detail-panel">
          <h3>What you will learn</h3>
          <ul className="outcome-list">
            {course.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </section>

        <section className="detail-panel">
          <h3>Course curriculum</h3>
          <div className="curriculum-list">
            {course.modules.map((module, index) => (
              <details open={index === 0} key={module.title}>
                <summary>{module.title}</summary>
                <ul>
                  {module.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>

        <section className="detail-panel split-panel">
          <div>
            <h3>Instructor</h3>
            <strong>{course.instructor.name}</strong>
            <span>{course.instructor.role}</span>
            <p>{course.instructor.bio}</p>
          </div>
          <div>
            <h3>Resources preview</h3>
            <ul className="resource-list">
              {course.resources.map((resource) => (
                <li key={resource.title}>
                  <span>{resource.type}</span>
                  {resource.title}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <aside className="enroll-panel" aria-label={`${course.title} enrollment summary`}>
        <span className="price-label">Free for MVP</span>
        <h3>Start this course</h3>
        <p>Register to save progress, join live classes, and access all resources.</p>
        <Button href="#/auth" variant="primary">
          Get started
        </Button>
        <div className="schedule-list">
          <h4>Live class schedule</h4>
          {course.schedule.map((session) => (
            <div className="schedule-item" key={`${session.date}-${session.topic}`}>
              <div>
                <strong>{session.topic}</strong>
                <span>
                  {session.date} at {session.time}
                </span>
              </div>
              <Badge tone={session.status === 'Live now' ? 'beginner' : 'intermediate'}>
                {session.status}
              </Badge>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
