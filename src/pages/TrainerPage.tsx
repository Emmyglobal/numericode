import {
  gradingQueue,
  learnerSupportNotes,
  trainerClasses,
  trainerResourcesToUpload,
  trainerStats,
} from '../data/portal'
import { resources } from '../data/dashboard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'

export function TrainerPage() {
  return (
    <section className="section portal-section" id="trainer">
      <SectionHeading
        title="Trainer workspace"
        description="Plan live classes, manage learning materials, review assignments, and support assigned students."
      />

      <div className="dashboard-shell portal-shell">
        <aside className="dashboard-sidebar" aria-label="Trainer navigation">
          <strong>Trainer</strong>
          {['Overview', 'Classes', 'Students', 'Assignments', 'Resources', 'Profile'].map((item) => (
            <a href="#/trainer" key={item}>
              {item}
            </a>
          ))}
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-welcome">
            <div>
              <span>Good morning, Emmanuel</span>
              <h3>Your teaching schedule is ready</h3>
            </div>
            <Button href="#/admin" variant="primary">
              Admin view
            </Button>
          </div>

          <div className="dashboard-stats">
            {trainerStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel">
              <h3>Upcoming live classes</h3>
              <div className="compact-list">
                {trainerClasses.map((item) => (
                  <div key={`${item.course}-${item.time}`}>
                    <strong>{item.course}</strong>
                    <span>
                      {item.cohort} / {item.time}
                    </span>
                    <Badge tone="intermediate">{item.room}</Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Grading queue</h3>
              <div className="compact-list">
                {gradingQueue.map((item) => (
                  <div key={`${item.title}-${item.student}`}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.student} / Due {item.due}
                    </span>
                    <Badge tone={item.due === 'Today' ? 'intermediate' : 'beginner'}>
                      Review
                    </Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Learning resources</h3>
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

            <article className="dashboard-panel profile-panel">
              <h3>Learner support notes</h3>
              <div className="compact-list">
                {learnerSupportNotes.map((item) => (
                  <div key={item.student}>
                    <strong>{item.student}</strong>
                    <span>{item.note}</span>
                    <Badge tone="intermediate">{item.action}</Badge>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-panel">
              <h3>Resources to upload</h3>
              <ul className="announcement-list">
                {trainerResourcesToUpload.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="dashboard-panel profile-panel">
              <h3>Trainer profile</h3>
              <div className="avatar">EN</div>
              <strong>Emmanuel Nwafor</strong>
              <span>Mathematics and Programming Instructor</span>
              <p>
                Focus for this week: support beginners, grade pending work, and prepare live class
                links before each cohort session.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
