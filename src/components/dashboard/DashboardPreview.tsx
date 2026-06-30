import { useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../../auth'
import { getMyCourses } from '../../coursesApi'
import { announcements, assignments, dashboardStats, liveClasses, resources } from '../../data/dashboard'
import { courses as fallbackCourses } from '../../data/courses'
import type { Course } from '../../types/course'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'

type DashboardPreviewProps = {
  currentUser: AuthUser
  isDarkMode: boolean
  onToggleTheme: (enabled: boolean) => void
}

export function DashboardPreview({ currentUser, isDarkMode, onToggleTheme }: DashboardPreviewProps) {
  const [studentCourses, setStudentCourses] = useState<Course[]>(fallbackCourses)
  const [courseLoadError, setCourseLoadError] = useState('')
  const activeCourse = studentCourses[0] ?? fallbackCourses[0]
  const stats = useMemo(
    () =>
      dashboardStats.map((stat) =>
        stat.label === 'Enrolled courses'
          ? { ...stat, value: String(studentCourses.length) }
          : stat,
      ),
    [studentCourses.length],
  )

  useEffect(() => {
    getMyCourses()
      .then((courses) => {
        setStudentCourses(courses.length > 0 ? courses : fallbackCourses)
        setCourseLoadError('')
      })
      .catch(() => {
        setStudentCourses(fallbackCourses)
        setCourseLoadError('Using local course previews until your database courses are available.')
      })
  }, [])

  return (
    <section className="section dashboard-section" id="dashboard">
      <SectionHeading
        title="Student dashboard"
        description="A focused learning hub for progress, classes, assignments, resources, and announcements."
      />
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <strong>NumeriCode</strong>
          {['Overview', 'My Courses', 'Live Classes', 'Assignments', 'Resources', 'Announcements', 'Profile'].map(
            (item) => (
              <a href="#/dashboard" key={item}>
                {item}
              </a>
            ),
          )}
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-welcome">
            <div>
              <span>Good morning, {currentUser.name}</span>
              <h3>Continue your learning journey</h3>
            </div>
            <Button href="#/courses">Resume course</Button>
          </div>

          <div className="dashboard-stats">
            {stats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel continue-card">
              <Badge tone={activeCourse.subject.toLowerCase()}>{activeCourse.subject}</Badge>
              <h3>{activeCourse.title}</h3>
              <p>Next lesson: Simplifying expressions</p>
              {courseLoadError && <small>{courseLoadError}</small>}
              <div className="progress-track" aria-label="Course progress">
                <span style={{ width: '48%' }} />
              </div>
              <small>48% complete</small>
            </article>

            <article className="dashboard-panel">
              <h3>Upcoming live classes</h3>
              <div className="compact-list">
                {liveClasses.map((item) => (
                  <div key={`${item.course}-${item.time}`}>
                    <strong>{item.course}</strong>
                    <span>
                      {item.date} / {item.time}
                    </span>
                    <Badge tone={item.status === 'Live now' ? 'beginner' : 'intermediate'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Assignments</h3>
              <div className="compact-list">
                {assignments.map((item) => (
                  <div key={item.title}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.course} / Due {item.due}
                    </span>
                    <Badge tone={item.status === 'Submitted' ? 'beginner' : 'intermediate'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Resources</h3>
              <div className="compact-list">
                {resources.map((item) => (
                  <div key={item.title}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.type} / {item.course}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Announcements</h3>
              <ul className="announcement-list">
                {announcements.map((announcement) => (
                  <li key={announcement}>{announcement}</li>
                ))}
              </ul>
            </article>

            <article className="dashboard-panel profile-panel">
              <h3>Profile</h3>
              <div className="avatar">EN</div>
              <strong>{currentUser.name}</strong>
              <span>Student / Beginner track</span>
              <label>
                Dark mode preference
                <input
                  checked={isDarkMode}
                  onChange={(event) => onToggleTheme(event.currentTarget.checked)}
                  type="checkbox"
                />
              </label>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
