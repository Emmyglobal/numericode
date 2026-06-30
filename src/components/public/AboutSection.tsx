import { SectionHeading } from '../ui/SectionHeading'

const offers = ['Live classes', 'Structured paths', 'Assignments', 'Resources']

export function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <SectionHeading
        title="Built for beginners who want structure"
        description="NumeriCode brings mathematics, programming, mentorship, and learning materials into one calm workspace."
      />
      <div className="about-grid">
        <article>
          <h3>Our mission</h3>
          <p>
            Help students build mathematical reasoning and practical coding confidence through
            guided live learning, clear paths, and progress-focused practice.
          </p>
        </article>
        <article>
          <h3>What we offer</h3>
          <div className="offer-grid">
            {offers.map((offer) => (
              <span key={offer}>{offer}</span>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
