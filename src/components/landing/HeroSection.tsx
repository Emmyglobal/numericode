import { Button } from '../ui/Button'

const sessions = [
  { icon: 'Sigma', title: 'Algebra Foundations', time: 'Live', isLive: true },
  { icon: '</>', title: 'Intro to Python', time: '2:00 PM' },
  { icon: 'pi', title: 'Calculus I', time: '4:30 PM' },
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
          Join NumeriCode for live online classes in Mathematics and Programming. Learn at your own
          pace, guided by real instructors who care.
        </p>
        <div className="hero-actions">
          <Button className="hero-button" href="#/auth">
            Get started free
          </Button>
          <Button className="hero-button" href="#/courses">
            Browse courses
          </Button>
        </div>
      </div>

      <aside className="session-panel" aria-label="Today's live sessions">
        <h2>
          <span className="stack-icon" aria-hidden="true" />
          Today's live sessions
        </h2>
        <div className="session-list">
          {sessions.map((session) => (
            <div className="session-item" key={session.title}>
              <span className="session-icon" aria-hidden="true">
                {session.icon}
              </span>
              <strong>{session.title}</strong>
              <span className={session.isLive ? 'live-dot' : 'session-time'}>
                {session.isLive ? '' : session.time}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  )
}
