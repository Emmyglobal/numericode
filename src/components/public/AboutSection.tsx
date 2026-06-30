import { SectionHeading } from '../ui/SectionHeading'

const offers = ['Live guidance', 'Structured paths', 'Assignments', 'Resources', 'Progress dashboard', 'Beginner support']

export function AboutSection() {
  return (
    <section className="section about-section" id="about">
      <SectionHeading
        title="Built for learners who want structure"
        description="NumeriCode brings mathematics, programming, guided practice, and learning materials into one calm workspace."
      />
      <div className="about-grid">
        <article>
          <h3>Our mission</h3>
          <p>
            Help students build mathematical reasoning and practical coding confidence through clear
            lessons, real exercises, instructor guidance, and steady progress tracking.
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
