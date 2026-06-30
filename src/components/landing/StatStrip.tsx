const stats = [
  { value: '10+', label: 'Courses' },
  { value: '500+', label: 'Students' },
  { value: '50+', label: 'Live classes' },
  { value: '2', label: 'Learning tracks' },
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
