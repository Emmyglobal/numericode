import {
  adminStats,
  adminTasks,
  studentRecords,
  supportQueue,
  trainerDirectory,
} from '../data/portal'
import { courses } from '../data/courses'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'

export function AdminPage() {
  return (
    <section className="section portal-section" id="admin">
      <SectionHeading
        title="Admin workspace"
        description="Manage students, trainers, courses, support tasks, and platform readiness from one operational view."
      />

      <div className="dashboard-shell portal-shell">
        <aside className="dashboard-sidebar" aria-label="Admin navigation">
          <strong>Admin</strong>
          {['Overview', 'Students', 'Trainers', 'Courses', 'Support', 'Settings'].map((item) => (
            <a href="#/admin" key={item}>
              {item}
            </a>
          ))}
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-welcome">
            <div>
              <span>Platform control center</span>
              <h3>Keep NumeriCode running smoothly</h3>
            </div>
            <Button href="#/trainer" variant="primary">
              View trainer portal
            </Button>
          </div>

          <div className="dashboard-stats">
            {adminStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel portal-table">
              <h3>Student management</h3>
              <div className="responsive-table" role="region" aria-label="Student records">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Track</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentRecords.map((student) => (
                      <tr key={student.name}>
                        <td>{student.name}</td>
                        <td>{student.track}</td>
                        <td>{student.progress}</td>
                        <td>
                          <Badge tone={student.status === 'Active' ? 'beginner' : 'intermediate'}>
                            {student.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Admin tasks</h3>
              <ul className="announcement-list">
                {adminTasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>

            <article className="dashboard-panel">
              <h3>Course operations</h3>
              <div className="compact-list">
                {courses.map((course) => (
                  <div key={course.id}>
                    <strong>{course.title}</strong>
                    <span>
                      {course.subject} / {course.lessons} lessons / {course.duration}
                    </span>
                    <Badge tone={course.level.toLowerCase()}>{course.level}</Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel profile-panel">
              <h3>Trainer directory</h3>
              <div className="compact-list">
                {trainerDirectory.map((trainer) => (
                  <div key={trainer.name}>
                    <strong>{trainer.name}</strong>
                    <span>{trainer.specialty}</span>
                    <span>
                      {trainer.cohorts} / Rating {trainer.rating}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel portal-table">
              <h3>Support queue</h3>
              <div className="responsive-table" role="region" aria-label="Support tickets">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Owner</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportQueue.map((ticket) => (
                      <tr key={ticket.subject}>
                        <td>{ticket.subject}</td>
                        <td>{ticket.owner}</td>
                        <td>{ticket.priority}</td>
                        <td>
                          <Badge tone={ticket.status === 'Resolved' ? 'beginner' : 'intermediate'}>
                            {ticket.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dashboard-panel profile-panel">
              <h3>Launch readiness</h3>
              <div className="portal-checklist">
                {[
                  'Role-based login active',
                  'Admin and trainer pages protected',
                  'Student learning flow complete',
                  'Vercel build passing',
                ].map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
