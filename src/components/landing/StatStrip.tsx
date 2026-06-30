const stats = [
  { value: '6', label: 'Launch courses' },
  { value: '2', label: 'Learning tracks' },
  { value: 'Live', label: 'Instructor support' },
  { value: 'Free', label: 'MVP access' },
]

export function StatStrip() {
  return (
    <section className="stats" aria-label="NumeriCode stats">
      {stats.map((stat) => (
        <div className="stat" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </section>
  )
}
