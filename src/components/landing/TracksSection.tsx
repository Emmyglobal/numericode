import { SectionHeading } from '../ui/SectionHeading'

const tracks = [
  {
    title: 'Mathematics track',
    icon: 'Sigma',
    tone: 'math',
    items: [
      'Number systems & algebra',
      'Geometry & trigonometry',
      'Calculus fundamentals',
      'Statistics & probability',
      'Problem-solving techniques',
    ],
  },
  {
    title: 'Programming track',
    icon: '</>',
    tone: 'code',
    items: [
      'Python from scratch',
      'Data structures & algorithms',
      'Web development basics',
      'JavaScript essentials',
      'Real project building',
    ],
  },
]

export function TracksSection() {
  return (
    <section className="section" id="tracks">
      <SectionHeading
        title="What you'll learn"
        description="Two structured tracks designed to take you from beginner to confident learner"
      />
      <div className="track-grid">
        {tracks.map((track) => (
          <article className={`track-card ${track.tone}`} key={track.title}>
            <div className="track-icon" aria-hidden="true">
              {track.icon}
            </div>
            <h3>{track.title}</h3>
            <ul>
              {track.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
