import { Button } from '../ui/Button'

const sessions = [
  { icon: 'Sigma', title: 'Algebra Foundations', time: 'Next cohort' },
  { icon: '</>', title: 'Python from Zero', time: 'Tue / Thu' },
  { icon: 'JS', title: 'Web Starter Lab', time: 'Saturday' },
]

export function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="hero-content">
        <p className="eyebrow">Learn / Code / Grow</p>
        <h1>
          Mathematics
          <br />
          and Code,
          <br />
          <span>Taught Live</span>
        </h1>
        <p className="hero-copy">
          Join practical online classes in Mathematics and Programming. NumeriCode helps beginners
          build reasoning, write code, join guided lessons, and keep every resource in one workspace.
        </p>
        <div className="hero-actions">
          <Button className="hero-button" href="#/auth/register">
            Get started free
          </Button>
          <Button className="hero-button" href="#/courses">
            Browse courses
          </Button>
        </div>
      </div>

      <aside className="session-panel" aria-label="Upcoming NumeriCode sessions">
        <h2>
          <span className="stack-icon" aria-hidden="true" />
          Upcoming sessions
        </h2>
        <div className="session-list">
          {sessions.map((session) => (
            <div className="session-item" key={session.title}>
              <span className="session-icon" aria-hidden="true">
                {session.icon}
              </span>
              <strong>{session.title}</strong>
              <span className="session-time">{session.time}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
